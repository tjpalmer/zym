import {Parts} from './';
import {Level, Part, PartType, Game, Theme} from '../';
import {
  BufferAttribute, BufferGeometry, Mesh, NearestFilter, ShaderMaterial, Texture,
  Vector2,
} from 'three';

export enum Layer {
  // Normally I go alphabetical, but instead put this in back to front order.
  // Back is all for static items that people go in front of.
  back,
  treasure,
  hero,
  // All enemies appear above player to be aggressive.
  // Biggies go behind other enemies because they are bigger.
  biggie,
  enemy,
  // Front is also static.
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

  part: Part;

  tile: Vector2;

}

export class GoldTheme implements Theme {

  constructor() {
    let image = new Image();
    image.src = require('./blocks.png');
    this.image = image;
    let scaled = this.prepareImage(image);
    this.texture = new Texture(scaled);
    this.texture.magFilter = NearestFilter;
    this.texture.needsUpdate = true;
    // Prepare layers.
    // Add 1 to allow an undefined at the end.
    let maxLayerPartCount = Level.tileCount.x * Level.tileCount.y + 1;
    for (let i = 0; i < Layer.length; ++i) {
      this.layers.push(new Array<Part>(maxLayerPartCount));
    }
  }

  buildArt(part: Part) {
    let makeArt = Parts.tileArts.get(part.type.base);
    if (!makeArt) {
      // This makes it easier to deal with problems up front.
      throw new Error(`No art for part type ${part.type.name}`);
    }
    // Mark art non-optional so this would catch the error?
    part.art = makeArt(part);
  }

  buildDone(game: Game) {
    let layerPartIndices = this.layers.map(() => 0);
    game.stage.parts.forEach(part => {
      let {layer} = part.art as Art;
      this.layers[layer][layerPartIndices[layer]++] = part;
    });
    layerPartIndices.forEach((layerPartIndex, layer) => {
      this.layers[layer][layerPartIndex] = undefined;
    });
  }

  handle(game: Game) {
    if (!this.tilePlanes) {
      this.initTilePlanes(game);
    }
    // TODO(tjp): Attribute (and uniform??) for graying enders or not.
    let ender = game.mode == game.edit && game.edit.ender;
    let tileIndices = this.tileIndices;
    let tilePlanes = this.tilePlanes!;
    let tilePlane = this.tilePlane!;
    // Duplicate prototype, translated and tile indexed.
    // TODO How to make sure tilePlanes is large enough?
    // TODO Fill the back with none parts when it's too big?
    let partIndex = 0;
    this.layers.forEach(layer => {
      for (let part of layer) {
        if (!part) {
          // That's the end of this layer.
          break;
        }
        let currentTileIndices = (part.art as Art).tile;
        // Translate and merge are expensive. TODO Make my own functions?
        tilePlane.translate(part.point.x, part.point.y, 0);
        for (let k = 0; k < tileIndices.length; k += 2) {
          tileIndices[k + 0] = currentTileIndices.x;
          tileIndices[k + 1] = currentTileIndices.y;
        }
        tilePlanes.merge(tilePlane, 6 * partIndex);
        tilePlane.translate(-part.point.x, -part.point.y, 0);
        ++partIndex;
      }
    });
    // TODO What if the amount varies? Need to back fill with nones?
    // For some reason, needsUpdate is missing on attributes, so go any here.
    let attributes: any = tilePlanes.attributes;
    attributes.position.needsUpdate = true;
    attributes.tile.needsUpdate = true;
  }

  image: HTMLImageElement;

  initTilePlanes(game: Game) {
    // Panels.
    this.preparePanels(game);
    // Tiles.
    let tileMaterial = new ShaderMaterial({
      depthTest: false,
      fragmentShader: tileFragmentShader,
      transparent: true,
      uniforms: {
        map: {value: this.texture},
      },
      vertexShader: tileVertexShader,
    });
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
    tilePlane.addAttribute('tile', new BufferAttribute(this.tileIndices, 2));
    tilePlane.addAttribute('uv', new BufferAttribute(new Float32Array([
      // Uv are 2D.
      1, 0, 0, 1, 0, 0,
      1, 0, 1, 1, 0, 1,
    ]), 2));
    // All tiles in a batch.
    let tileCount = Level.tileCount.x * Level.tileCount.y;
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
    game.redraw = () => this.handle(game);
  }

  layers = new Array<Array<Part | undefined>>();

  level = new Level();

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

  preparePanels(game: Game) {
    let {toolbox} = game.edit;
    // let buttonHeight = '1em';
    // Fit about 20 tiles at vertically, but use integer scaling for kindness.
    // Base this on screen size rather than window size, presuming that screen
    // size implies what looks reasonable for ui elements.
    let scale = Math.round(window.screen.height / 20 / Level.tileSize.y);
    let buttonHeight = `${scale * Level.tileSize.y}px`;
    for (let button of toolbox.getButtons()) {
      // Get the art for this tool. TODO Simplify this process?
      let name = toolbox.getName(button);
      let type = game.edit.namedTools.get(name);
      if (!type || name == 'none') {
        // We don't draw a standard tile for this one.
        button.style.height = buttonHeight;
        continue;
      }
      if (!type) {
        throw new Error(`Unknown type: ${name}`);
      }
      let part = type.make(game);
      this.buildArt(part);
      // Now calculate the pixel point.
      let point = (part.art as Art).tile.clone();
      point.y = Level.tileCount.y - point.y - 1;
      point.multiply(Level.tileSize);
      // Now make a canvas to draw to.
      let canvas = document.createElement('canvas');
      canvas.width = Level.tileSize.x;
      canvas.height = Level.tileSize.y;
      // Style it.
      canvas.style.display = 'block';
      (canvas.style as any).imageRendering = 'pixelated';
      canvas.style.margin = 'auto';
      canvas.style.height = buttonHeight;
      let context = canvas.getContext('2d')!;
      // Now draw to our canvas and to the button background.
      context.drawImage(
        this.image, point.x, point.y, Level.tileSize.x, Level.tileSize.y,
        0, 0, canvas.width, canvas.height,
      );
      button.appendChild(canvas);
    }
  }

  texture: Texture;

  tileIndices = new Uint8Array(2 * 6);

  tilePlane?: BufferGeometry;

  tilePlanes?: BufferGeometry;

  tilesMesh?: Mesh;

}

declare function require(name: string): any;

let tileFragmentShader = `
  uniform sampler2D map;
  varying vec2 vTile;
  varying vec2 vUv;
  void main() {
    vec2 coord = (
      (vUv + vTile) * vec2(8, 10) + vec2(0, 56)
    ) / vec2(512, 256);
    gl_FragColor = texture2D(map, coord);
    gl_FragColor.w = gl_FragColor.x + gl_FragColor.y + gl_FragColor.z;
    if (gl_FragColor.w > 0.0) {
      gl_FragColor.w = 1.0;
    }
  }
`;

let tileVertexShader = `
  attribute vec2 tile;
  varying vec2 vTile;
  varying vec2 vUv;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
    vTile = tile;
  }
`;
