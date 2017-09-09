import {Parts} from './index';
import {
  Game, GenericPartType, Level, Part, PartTool, PartType, Stage, Theme,
} from '../index';
import {None} from '../parts/index';
import {
  BufferAttribute, BufferGeometry, Mesh, NearestFilter, OrthographicCamera,
  PlaneBufferGeometry, Scene, ShaderMaterial, Texture, Vector2,
  WebGLRenderTarget,
} from 'three';

export enum Layer {
  // Normally I go alphabetical, but instead put this in back to front order.
  // Back is all for static items that people go in front of.
  back,
  treasure,
  dead,
  hero,
  // All enemies appear above player to be aggressive.
  // Biggies go behind other enemies because they are bigger.
  biggie,
  enemy,
  shot,
  gun,
  // Front is also static. TODO Really? Does it matter? No?
  front,
  // Flame is in front of front, eh?
  flame,
  // Just to track the number of enum values.
  length,
}

// TODO Change this to a class, and define part and ender access?
export interface Art {

  readonly toolTile: Vector2;

  // Layer is usually (always?) constant by part type, but it's not a big deal
  // just to replicate.
  // TODO Will layers also exist on 3D, or will it all be z-ordered?
  layer: Layer;

  offsetX: number;

  part: Part;

  tile: Vector2;

}

export abstract class BaseArt<PartType extends Part> implements Art {

  constructor(part: PartType) {
    this.part = part;
  }

  layer: Layer;

  get offsetX() {
    return 0;
  }

  part: PartType;

  tile: Vector2;

  get toolTile() {
    return this.tile;
  }

}

export class GoldTheme implements Theme {

  static load(game: Game) {
    let image = new Image();
    let promise = new Promise<GoldTheme>((resolve, reject) => {
      image.addEventListener('load', () => {
        resolve(new GoldTheme(game, image));
      });
      // TODO Error event?
    });
    image.src = require('./blocks.png');
    return promise;
  }

  constructor(game: Game, image: HTMLImageElement) {
    this.game = game;
    // Prepare image.
    this.image = image;
    let scaled = this.prepareImage(image);
    this.texture = new Texture(scaled);
    this.texture.magFilter = NearestFilter;
    this.texture.needsUpdate = true;
    // Prepare layers.
    // Add 1 to allow an undefined at the end.
    // We'll extend these arrays later as needed. But not shrink them.
    // TODO Don't bother to preallocate?
    let maxLayerPartCount = Level.tileCount.x * Level.tileCount.y + 1;
    for (let i = 0; i < Layer.length; ++i) {
      this.layers.push(new Array<Part>(maxLayerPartCount));
    }
  }

  breaking = false;
  
  buildArt(part: Part) {
    let type = part.type;
    // TODO Change to type != type.base?
    if (type.breaking || type.ender || type.falling || type.invisible) {
      type = type.base;
    }
    let makeArt = Parts.tileArts.get(type);
    if (!makeArt) {
      // This makes it easier to deal with problems up front.
      throw new Error(`No art for part type ${type.key}`);
    }
    // Mark art non-optional so this would catch the error?
    part.art = makeArt(part);
  }

  buildDone(game: Game) {
    this.buildLayers(game.stage.parts, true);
  }

  buildLayers(parts: Iterable<Part>, reset = false) {
    let {layerPartIndices, layers} = this;
    if (reset) {
      layers.forEach((_, index) => layerPartIndices[index] = 0);
    }
    // TODO .forEach instead of Iterable to avoid creating iterable object?
    for (let part of parts) {
      if (!part.exists) {
        // This applies mostly to nones right now from the main parts.
        // TODO Don't ever add the nones when in play mode?
        continue;
      }
      let {layer} = part.art as Art;
      if (part.dead) {
        layer = Layer.dead;
      }
      this.layers[layer][layerPartIndices[layer]++] = part;
    }
    layerPartIndices.forEach((layerPartIndex, layer) => {
      this.layers[layer][layerPartIndex] = undefined;
    });
  }

  ender = false;

  fadeSee = new Lerper(0, 0x90, -100, 0.2, 1);

  falling = false;
  
  game: Game;

  handle() {
    let {game} = this;
    // In passing, see if we need to update the panels.
    let styleChanged = false;
    if (game.edit.breaking != this.breaking) {
      this.breaking = game.edit.breaking;
      styleChanged = true;
    }
    if (game.edit.ender != this.ender) {
      this.ender = game.edit.ender;
      styleChanged = true;
    }
    if (game.edit.falling != this.falling) {
      this.falling = game.edit.falling;
      styleChanged = true;
    }
    if (game.edit.invisible != this.invisible) {
      this.invisible = game.edit.invisible;
      styleChanged = true;
    }
    if (styleChanged) {
      this.prepareVariations();
      this.paintPanels();
    }
    // Also init on the first round.
    if (!this.tilePlanes) {
      this.initTilePlanes();
    }
    // But main point is to paint the stage.
    this.paintStage(game.stage);
  }

  image: HTMLImageElement;

  initTilePlanes() {
    let {game} = this;
    // Tiles.
    let tileMaterial = new ShaderMaterial({
      depthTest: false,
      fragmentShader: tileFragmentShader,
      transparent: true,
      uniforms: {
        map: {value: this.texture},
        // state: {value: 1},
      },
      vertexShader: tileVertexShader,
    });
    // this.uniforms = tileMaterial.uniforms as any as Uniforms;
    // Prototypical tile.
    this.tilePlane = new BufferGeometry();
    let tilePlane = this.tilePlane;
    tilePlane.addAttribute('position', new BufferAttribute(new Float32Array([
      // Leave the coords at 3D for now to match default expectations.
      // And they'll be translated.
      8, 0, 0, 0, 10, 0, 0, 0, 0,
      8, 0, 0, 8, 10, 0, 0, 10, 0,
    ]), 3));
    // Tile map offsets, repeated.
    tilePlane.addAttribute('mode', new BufferAttribute(this.tileModes, 1));
    tilePlane.addAttribute(
      'opacity', new BufferAttribute(this.tileOpacities, 1)
    );
    tilePlane.addAttribute('tile', new BufferAttribute(this.tileIndices, 3));
    tilePlane.addAttribute('uv', new BufferAttribute(new Float32Array([
      // Uv are 2D.
      1, 0, 0, 1, 0, 0,
      1, 0, 1, 1, 0, 1,
    ]), 2));
    // All tiles in a batch.
    // '4 *' to have space for particles and such.
    let tileCount = 4 * Level.tileCount.x * Level.tileCount.y;
    this.tilePlanes = new BufferGeometry();
    for (let name in tilePlane.attributes) {
      let attribute = tilePlane.getAttribute(name);
      this.tilePlanes.addAttribute(name, new BufferAttribute(new Float32Array(
        tileCount * attribute.array.length
      ), attribute.itemSize));
    }
    // Add to stage.
    this.tilesMesh = new Mesh(this.tilePlanes, tileMaterial);
    game.scene.add(this.tilesMesh);
    game.redraw = () => this.handle();
    // Panels, too.
    this.preparePanels();
  }

  invisible = false;

  layerPartIndices = new Array<number>();

  layers = new Array<Array<Part | undefined>>();

  level = new Level();

  modeChanged() {
    if (this.game.mode == this.game.edit) {
      // We can't get spacing right without having things visible, so do this
      // after we get to edit mode.
      // Doesn't need every time, but eh.
      this.updateLayout();
    }
  }

  paintPanels(changedName?: string) {
    let {game} = this;
    let {toolbox} = game.edit;
    for (let button of toolbox.getButtons()) {
      // Get the art for this tool. TODO Simplify this process?
      let name = toolbox.getName(button);
      if (changedName && name != changedName) {
        continue;
      }
      let tool = game.edit.toolFromName(name);
      if (!(tool instanceof PartTool)) {
        continue;
      }
      let type = tool.type;
      if (!type || type == None) {
        // We don't draw a standard tile for this one.
        continue;
      }
      if (!type) {
        throw new Error(`Unknown type: ${name}`);
      }
      let part = type.make(game);
      this.buildArt(part);
      // Now calculate the pixel point.
      let point = (part.art as Art).toolTile.clone();
      // TODO Add offset to point.x here.
      point.y = Level.tileCount.y - point.y - 1;
      point.multiply(Level.tileSize);
      // Now draw to our canvas and to the button background.
      let canvas = button.querySelector(':scope > canvas') as HTMLCanvasElement;
      let context = canvas.getContext('2d')!;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        this.toolsImage, point.x, point.y, Level.tileSize.x, Level.tileSize.y,
        0, 0, canvas.width, canvas.height,
      );
    }
  }

  paintStage(stage: Stage, asTools = false) {
    let {game, pixelBounds, tileBounds, time} = stage;
    let {tileIndices, tileModes, tileOpacities} = this;
    let tilePlanes = this.tilePlanes!;
    let tilePlane = this.tilePlane!;
    // Duplicate prototype, translated and tile indexed.
    // TODO How to make sure tilePlanes is large enough?
    // TODO Fill the back with none parts when it's too big?
    let partIndex = 0;
    this.buildLayers(stage.parts, true);
    this.buildLayers(stage.particles);
    let seeOpacity = this.updateFade();
    let offsetX = asTools ? 0 :
      (Level.pixelCount.x - (pixelBounds.max.x - pixelBounds.min.x)) / 2 -
      pixelBounds.min.x;
    // TODO Only keep offsetX as 0 in test mode, not play.
    offsetX = 0;
    // Draw everything.
    this.layers.forEach(layer => {
      for (let part of layer) {
        if (!part) {
          // That's the end of this layer.
          break;
        }
        if (part.cropped) {
          // Not actually here.
          continue;
        }
        let art = part.art as Art;
        let currentTileIndices = asTools ? art.toolTile : art.tile;
        // Translate and merge are expensive. TODO Make my own functions?
        let posX = part.point.x + offsetX;
        tilePlane.translate(posX, part.point.y, 0);
        for (let k = 0; k < tileIndices.length; k += 3) {
          tileIndices[k + 0] = currentTileIndices.x;
          tileIndices[k + 1] = currentTileIndices.y;
          tileIndices[k + 2] = part.art.offsetX;
        }
        let mode = +(part.type.ender || part.keyTime + 1 > time);
        if (part.dead) {
          mode = 2;
        }
        if (part.type.breaking) {
          mode |= 4;
        }
        if (part.type.falling) {
          mode |= 8;
        }
        let opacity = time >= part.phaseEndTime ? 0xFF :
          // TODO Look back into this with integers.
          (time - part.phaseBeginTime) /
            (part.phaseEndTime - part.phaseBeginTime);
        if (part.type.invisible) {
          opacity = seeOpacity;
        } else if (part == stage.hero && stage.hero.bonusSee) {
          opacity = 0x90;
        }
        for (let n = 0; n < tileModes.length; ++n) {
          // Break state into bits.
          tileModes[n] = mode;
          tileOpacities[n] = opacity;
        }
        tilePlanes.merge(tilePlane, 6 * partIndex);
        tilePlane.translate(-posX, -part.point.y, 0);
        ++partIndex;
      }
    });
    if (!asTools) {
      // Gray for crop.
      for (let n = 0; n < tileModes.length; ++n) {
        // Break state into bits.
        tileModes[n] = 0xFF;
        tileOpacities[n] = 0xFF;
      }
      if (tileBounds.min.x > 0) {
        tilePlane.scale(tileBounds.min.x, Level.tileCount.y, 1);
        tilePlanes.merge(tilePlane, 6 * partIndex);
        tilePlane.scale(1 / tileBounds.min.x, 1 / Level.tileCount.y, 1);
        ++partIndex;
      }
      if (tileBounds.min.y > 0) {
        tilePlane.scale(Level.tileCount.x, tileBounds.min.y, 1);
        tilePlanes.merge(tilePlane, 6 * partIndex);
        tilePlane.scale(1 / Level.tileCount.x, 1 / tileBounds.min.y, 1);
        ++partIndex;
      }
      if (tileBounds.max.x < Level.tileCount.x) {
        let posX = pixelBounds.max.x;
        let sizeX = Level.tileCount.x - tileBounds.max.x;
        tilePlane.scale(sizeX, Level.tileCount.y, 1);
        tilePlane.translate(posX, 0, 0);
        tilePlanes.merge(tilePlane, 6 * partIndex);
        tilePlane.translate(-posX, 0, 0);
        tilePlane.scale(1 / sizeX, 1 / Level.tileCount.y, 1);
        ++partIndex;
      }
      if (tileBounds.max.y < Level.tileCount.y) {
        let posY = pixelBounds.max.y;
        let sizeY = Level.tileCount.y - tileBounds.max.y;
        tilePlane.scale(Level.tileCount.x, sizeY, 1);
        tilePlane.translate(0, posY, 0);
        tilePlanes.merge(tilePlane, 6 * partIndex);
        tilePlane.translate(0, -posY, 0);
        tilePlane.scale(1 / Level.tileCount.x, 1 / sizeY, 1);
        ++partIndex;
      }
    }
    // Actually get things done now.
    tilePlanes.setDrawRange(0, 6 * partIndex);
    let attributes: any = tilePlanes.attributes;
    // Older typing missed needsUpdate, but looks like it's here now.
    // TODO Define a type with all our attributes on it?
    (attributes.mode as BufferAttribute).needsUpdate = true;
    attributes.opacity.needsUpdate = true;
    attributes.position.needsUpdate = true;
    attributes.tile.needsUpdate = true;
    // TODO Preset uv for all spots, so no need for later update?
    attributes.uv.needsUpdate = true;
  }

  prepareImage(image: HTMLImageElement) {
    // Make the image POT (power-of-two) sized.
    let canvas = document.createElement('canvas');
    let round = (x: number) => 2 ** Math.ceil(Math.log2(x));
    canvas.width = round(Level.pixelCount.x);
    canvas.height = round(Level.pixelCount.y);
    let context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    return canvas;
  }

  preparePanels() {
    let {game} = this;
    let {toolbox} = game.edit;
    // let buttonHeight = '1em';
    // Fit about 20 tiles at vertically, but use integer scaling for kindness.
    // Base this on screen size rather than window size, presuming that screen
    // size implies what looks reasonable for ui elements.
    let scale = Math.round(window.screen.height / 20 / Level.tileSize.y);
    let buttonSize = Level.tileSize.clone().multiplyScalar(scale);
    for (let button of toolbox.getButtons()) {
      let name = toolbox.getName(button);
      let tool = game.edit.namedTools.get(name);
      let type = tool instanceof PartTool ? tool.type : undefined;
      if (!type || type == None) {
        // We don't draw a standard tile for this one.
        button.style.width = `${buttonSize.x}px`;
        button.style.height = `${buttonSize.y}px`;
        continue;
      }
      // Now make a canvas to draw to.
      let canvas = document.createElement('canvas');
      canvas.width = Level.tileSize.x;
      canvas.height = Level.tileSize.y;
      // Style it.
      (canvas.style as any).imageRendering = 'pixelated';
      canvas.style.margin = 'auto';
      canvas.style.height = `${buttonSize.y}px`;
      button.appendChild(canvas);
    }
    this.prepareVariations();
    this.paintPanels();
    this.updateLayout();
  }

  prepareVariations() {
    let {game} = this;
    let {toolbox} = game.edit;
    // TODO Abstract some render target -> canvas?
    let scaled = this.texture.image as HTMLImageElement;
    let target = new WebGLRenderTarget(scaled.width, scaled.height);
    try {
      let stage = new Stage(game);
      stage.parts.length = 0;
      toolbox.getButtons().forEach(button => {
        let name = toolbox.getName(button);
        let tool = game.edit.namedTools.get(name);
        tool = game.edit.partTool(name, this);
        let type = tool instanceof PartTool ? tool.type : undefined;
        if (!type) {
          return;
        }
        let part = type.make(game);
        this.buildArt(part);
        let art = part.art as Art;
        // console.log(name, art.baseTile.x, art.baseTile.y);
        part.point.copy(art.toolTile).multiply(Level.tileSize);
        stage.parts.push(part);
      });
      // Hack edit more for painting.
      let oldMode = game.mode;
      game.mode = game.edit;
      this.paintStage(stage, true);
      // Back to old mode.
      game.mode = oldMode;
      let scene = new Scene();
      let camera = new OrthographicCamera(
        0, scaled.width, scaled.height, 0, -1e5, 1e5,
      );
      camera.position.z = 1;
      // Render and copy out.
      game.renderer.render(game.scene, camera, target);
      let toolsImage = document.createElement('canvas');
      toolsImage.width = this.image.width;
      toolsImage.height = this.image.height;
      let context = toolsImage.getContext('2d')!;
      let data = new Uint8Array(4 * toolsImage.width * toolsImage.height);
      game.renderer.readRenderTargetPixels(
        target, 0, 0, this.image.width, this.image.height, data
      );
      // Use a temporary canvas for flipping y.
      let tempImage = document.createElement('canvas');
      tempImage.width = toolsImage.width;
      tempImage.height = toolsImage.height;
      let tempContext = tempImage.getContext('2d')!;
      let imageData =
        tempContext.createImageData(toolsImage.width, toolsImage.height);
      imageData.data.set(data as any);
      tempContext.putImageData(imageData, 0, 0);
      // Draw to the final.
      context.save();
      context.scale(1, -1);
      context.translate(0, -200);
      context.drawImage(tempImage, 0, 0);
      context.restore();
      // {  // Show the ender image for debugging.
      //   enderImage.style.border = '1px solid white';
      //   enderImage.style.pointerEvents = 'none';
      //   enderImage.style.position = 'absolute';
      //   enderImage.style.zIndex = '100';
      //   window.document.body.appendChild(enderImage);
      // }
      this.toolsImage = toolsImage;
    } finally {
      target.dispose();
    }
  }

  texture: Texture;

  tileIndices = new Uint8Array(3 * 6);

  tileModes = new Uint8Array(6);

  tileOpacities = new Uint8Array(6);

  tilePlane?: BufferGeometry;

  tilePlanes?: BufferGeometry;

  tilesMesh?: Mesh;

  toolsImage: HTMLCanvasElement;

  // uniforms: Uniforms;

  updateFade() {
    let edit = this.game.mode == this.game.edit;
    let {hero, time} = this.game.stage;
    // TODO Extract all this invisibility fade stuff elsewhere.
    let see = edit || !hero || hero.seesInvisible;
    if (time < 0.05) {
      // Don't observe state switch from initial state.
      // Just sneak it in.
      // TODO Going from edit to test, this doesn't seem to reset right.
      this.fadeSee.ref = -100;
      this.fadeSee.state = see;
    }
    return this.fadeSee.update(see, time);
  }

  updateLayout() {
    let {game} = this;
    let {toolbox} = game.edit;
    let offsetLeft: Number | undefined;
    for (let button of toolbox.getButtons()) {
      // Align menu by hopefully known canvas size.
      let menu = button.querySelector('.toolMenu') as HTMLElement | undefined;
      if (menu) {
        if (offsetLeft == undefined) {
          let style = window.getComputedStyle(button);
          offsetLeft =
            Number.parseInt(style.width!) +
            Number.parseInt(style.borderRightWidth!) +
            Number.parseInt(style.paddingRight!);
        }
        menu.style.marginLeft = `${offsetLeft}px`;
      }
    }
  }

  updateTool(button: HTMLElement) {
    this.paintPanels(this.game.edit.toolbox.getName(button));
  }

}

class Lerper {

  constructor(
    begin: number, end: number, ref: number, span: number, spanOut: number
  ) {
    this.begin = begin;
    this.end = end;
    this.ref = ref;
    this.span = span;
    this.spanOut = spanOut;
  }

  begin: number;

  end: number;

  ref: number;

  span: number;

  spanOut: number;

  state = false;

  update(state: boolean, x: number) {
    if (this.state != state) {
      // TODO Modify ref calc based on current value.
      this.ref = x;
      this.state = state;
    }
    return this.value(x);
  }

  value(x: number) {
    // State false means go to begin, and true to end.
    let begin = this.state ? this.begin : this.end;
    let end = this.state ? this.end : this.begin;
    // Now lerp.
    let span = this.state ? this.span : this.spanOut;
    let rel = Math.min((x - this.ref) / span, 1);
    return rel * (end - begin) + begin;
  } 

}

// interface Uniforms {
//   state: {value: number};
// }

declare function require(name: string): any;

let tileFragmentShader = `
  uniform sampler2D map;
  // uniform int state;
  varying float vMode;
  varying float vOpacity;
  varying vec3 vTile;
  varying vec2 vUv;

  void grayify(inout vec3 rgb) {
    // TODO Better gray?
    float mean = (rgb.x + rgb.y + rgb.z) / 3.0;
    rgb = 0.5 * (rgb + vec3(mean));
    // Paler to make even gray things look different.
    rgb += 0.6 * (1.0 - rgb);
  }

  void main() {
    vec2 coord = (
      // Tile z is the horizontal offset to fix the offset problems with a
      // couple of the tiles.
      // The +56 in y is for the texture offset.
      (vUv + vTile.xy) * vec2(8, 10) + vec2(vTile.z, 56)
    ) / vec2(512, 256);
    gl_FragColor = texture2D(map, coord);
    gl_FragColor.w = gl_FragColor.x + gl_FragColor.y + gl_FragColor.z;
    if (gl_FragColor.w > 0.0) {
      // TODO Break mode (in vert shader?) and state into bits.
      if (vMode != 0.0) {
        grayify(gl_FragColor.xyz);
        if (mod(vMode, 4.0) == 2.0) {
          gl_FragColor.xyz *= 0.5;
        }
        if (mod(vMode, 8.0) >= 4.0) {
          // Breaking.
          gl_FragColor.yz *= 0.5;
        }
        if (vMode >= 8.0) {
          // Falling.
          gl_FragColor.xy *= 0.5;
        }
      }
      gl_FragColor.w = vOpacity;
    }
    // Cropped out area.
    if (vMode == 255.0) {
      gl_FragColor.xyz = vec3(0.125);
      gl_FragColor.w = 1.0;
    }
  }
`;

let tileVertexShader = `
  attribute float mode;
  attribute float opacity;
  attribute vec3 tile;
  varying float vMode;
  varying float vOpacity;
  varying vec3 vTile;
  varying vec2 vUv;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vMode = mode;
    vOpacity = opacity / 255.0;
    vUv = uv;
    vTile = tile;
  }
`;
