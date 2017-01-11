import {Parts} from './';
import {Level, Part, PartType, Game, Theme} from '../';
import {None} from '../parts';
import {
  BufferAttribute, BufferGeometry, Mesh, NearestFilter, PlaneBufferGeometry,
  Scene, ShaderMaterial, Texture, Vector2, WebGLRenderTarget,
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
  // Front is also static. TODO Really? Does it matter? No?
  front,
  // Just to track the number of enum values.
  length,
}

// TODO Change this to a class, and define part and ender access?
export interface Art {

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

}

export class GoldTheme implements Theme {

  constructor(game: Game) {
    this.game = game;
    let image = new Image();
    image.src = require('./blocks.png');
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

  buildArt(part: Part) {
    let type = part.type;
    if (type.ender) {
      type = type.base;
    }
    let makeArt = Parts.tileArts.get(type);
    if (!makeArt) {
      // This makes it easier to deal with problems up front.
      throw new Error(`No art for part type ${type.name}`);
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

  enderImage: HTMLCanvasElement;

  game: Game;

  handle() {
    let {game} = this;
    let {time} = game.stage;
    if (game.edit.ender != this.ender) {
      this.ender = game.edit.ender;
      this.paintPanels();
    }
    if (!this.tilePlanes) {
      this.initTilePlanes();
    }
    // TODO Only gray enders, not mains. So maybe no uniform on that.
    // TODO Except energy blocks might look too much like steel???
    let ender = game.mode == game.edit && game.edit.ender;
    this.uniforms.state.value = +ender;
    let {tileIndices, tileModes, tileOpacities} = this;
    let tilePlanes = this.tilePlanes!;
    let tilePlane = this.tilePlane!;
    // Duplicate prototype, translated and tile indexed.
    // TODO How to make sure tilePlanes is large enough?
    // TODO Fill the back with none parts when it's too big?
    let partIndex = 0;
    this.buildLayers(game.stage.parts, true);
    this.buildLayers(game.stage.particles);
    this.layers.forEach(layer => {
      for (let part of layer) {
        if (!part) {
          // That's the end of this layer.
          break;
        }
        let currentTileIndices = (part.art as Art).tile;
        // Translate and merge are expensive. TODO Make my own functions?
        tilePlane.translate(part.point.x, part.point.y, 0);
        for (let k = 0; k < tileIndices.length; k += 3) {
          tileIndices[k + 0] = currentTileIndices.x;
          tileIndices[k + 1] = currentTileIndices.y;
          tileIndices[k + 2] = part.art.offsetX;
        }
        let mode = +(part.type.ender || part.keyTime + 1 > time);
        if (part.dead) {
          mode = 2;
        }
        let opacity = time >= part.phaseEndTime ? 1 :
          // TODO Why doesn't this opacity work? Setting w = 0.5 for all works.
          (time - part.phaseBeginTime) /
            (part.phaseEndTime - part.phaseBeginTime);
        for (let n = 0; n < tileModes.length; ++n) {
          // Break state into bits.
          tileModes[n] = mode;
          tileOpacities[n] = opacity;
        }
        tilePlanes.merge(tilePlane, 6 * partIndex);
        tilePlane.translate(-part.point.x, -part.point.y, 0);
        ++partIndex;
      }
    });
    this.tilePlanes!.setDrawRange(0, 6 * partIndex);
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

  image: HTMLImageElement;

  initTilePlanes() {
    let {game} = this;
    // Panels.
    this.preparePanels();
    // Tiles.
    let tileMaterial = new ShaderMaterial({
      depthTest: false,
      fragmentShader: tileFragmentShader,
      transparent: true,
      uniforms: {
        map: {value: this.texture},
        state: {value: 1},
      },
      vertexShader: tileVertexShader,
    });
    this.uniforms = tileMaterial.uniforms as any as Uniforms;
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
    // '4 *' to have space for particles.
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
  }

  layerPartIndices = new Array<number>();

  layers = new Array<Array<Part | undefined>>();

  level = new Level();

  paintPanels(changedName?: string) {
    let {game} = this;
    let {toolbox} = game.edit;
    for (let button of toolbox.getButtons()) {
      // Get the art for this tool. TODO Simplify this process?
      let name = toolbox.getName(button);
      if (changedName && name != changedName) {
        continue;
      }
      let type = game.edit.toolFromName(name);
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
      let point = (part.art as Art).tile.clone();
      // TODO Add offset to point.x here.
      point.y = Level.tileCount.y - point.y - 1;
      point.multiply(Level.tileSize);
      // Now draw to our canvas and to the button background.
      let canvas = button.querySelector(':scope > canvas') as HTMLCanvasElement;
      let context = canvas.getContext('2d')!;
      let image = type.ender ? this.enderImage : this.image;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image, point.x, point.y, Level.tileSize.x, Level.tileSize.y,
        0, 0, canvas.width, canvas.height,
      );
    }
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
    let buttonHeight = `${scale * Level.tileSize.y}px`;
    for (let button of toolbox.getButtons()) {
      let name = toolbox.getName(button);
      let type = game.edit.namedTools.get(name);
      if (!type || type == None) {
        // We don't draw a standard tile for this one.
        button.style.height = buttonHeight;
        continue;
      }
      // Now make a canvas to draw to.
      let canvas = document.createElement('canvas');
      canvas.width = Level.tileSize.x;
      canvas.height = Level.tileSize.y;
      // Style it.
      (canvas.style as any).imageRendering = 'pixelated';
      canvas.style.margin = 'auto';
      canvas.style.height = buttonHeight;
      button.appendChild(canvas);
      // Align menu by now known canvas size.
      let menu = button.querySelector('.toolMenu') as HTMLElement | undefined;
      if (menu) {
        menu.style.marginLeft = `${canvas.offsetWidth}px`;
      }
    }
    this.prepareVariations();
    this.paintPanels();
  }

  prepareVariations() {
    let {game} = this;
    // TODO Abstract some render target -> canvas?
    let scaled = this.texture.image as HTMLImageElement;
    let material: ShaderMaterial | undefined = undefined;
    let target = new WebGLRenderTarget(scaled.width, scaled.height);
    try {
      let scene = new Scene();
      material = new ShaderMaterial({
        fragmentShader: enderFragmentShader,
        uniforms: {map: {value: this.texture}},
        vertexShader: tileVertexShader,
      });
      let plane = new PlaneBufferGeometry(this.image.width, this.image.height);
      plane.translate(this.image.width / 2, this.image.height / 2, 0);
      scene.add(new Mesh(plane, material));
      this.texture.flipY = false;
      try {
        game.renderer.render(scene, game.camera, target);
      } finally {
        this.texture.flipY = true;
        this.texture.needsUpdate = true;
        plane.dispose();
      }
      let enderImage = document.createElement('canvas');
      enderImage.width = this.image.width;
      enderImage.height = this.image.height;
      let context = enderImage.getContext('2d')!;
      let data = new Uint8Array(4 * enderImage.width * enderImage.height);
      game.renderer.readRenderTargetPixels(
        target, 0, 0, this.image.width, this.image.height, data
      );
      let imageData =
        context.createImageData(enderImage.width, enderImage.height);
      imageData.data.set(data as any);
      context.putImageData(imageData, 0, 0);
      // {  // Show the ender image for debugging.
      //   enderImage.style.position = 'absolute';
      //   enderImage.style.zIndex = '100';
      //   window.document.body.appendChild(enderImage);
      // }
      this.enderImage = enderImage;
    } finally {
      if (material) {
        material.dispose()
      }
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

  uniforms: Uniforms;

  updateTool(button: HTMLElement) {
    this.paintPanels(this.game.edit.toolbox.getName(button));
  }

}

interface Uniforms {
  state: {value: number};
}

declare function require(name: string): any;

let grayify = `
  void grayify(inout vec3 rgb) {
    // TODO Better gray?
    float mean = (rgb.x + rgb.y + rgb.z) / 3.0;
    rgb = 0.5 * (rgb + vec3(mean));
    // Paler to make even gray things look different.
    rgb += 0.6 * (1.0 - rgb);
  }
`;

let enderFragmentShader = `
  uniform sampler2D map;
  varying vec2 vUv;

  ${grayify}

  void main() {
    gl_FragColor = texture2D(map, vUv);
    gl_FragColor.w = gl_FragColor.x + gl_FragColor.y + gl_FragColor.z;
    if (gl_FragColor.w > 0.0) {
      grayify(gl_FragColor.xyz);
      gl_FragColor.w = 1.0;
    }
  }
`;

let tileFragmentShader = `
  uniform sampler2D map;
  uniform int state;
  varying float vMode;
  varying float vOpacity;
  varying vec3 vTile;
  varying vec2 vUv;

  ${grayify}

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
        if (vMode > 1.0) {
          gl_FragColor.xyz *= 0.5;
        }
      }
      gl_FragColor.w = vOpacity;
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
    vOpacity = opacity;
    vUv = uv;
    vTile = tile;
  }
`;
