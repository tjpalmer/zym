import {Parts} from './';
import {Level, Part, PartType, Game, Theme} from '../';
import {
  BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, NearestFilter,
  PlaneBufferGeometry, ShaderMaterial, Texture, Vector2,
} from 'three';

export interface Art {

  editTile: Vector2;

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
  }

  buildArt(part: Part) {
    let makeArt = Parts.tileArts.get(part.constructor as PartType);
    if (!makeArt) {
      // This makes it easier to deal with problems up front.
      throw new Error(`No art for part type ${part.constructor.name}`);
    }
    // Mark art non-optional so this would catch the error?
    part.art = makeArt();
  }

  handle(game: Game) {
    // game.stage.children.forEach(kid => game.stage.remove(kid));
    if (!this.tilePlanes) {
      if (false) {
        // Background test.
        let plane =
          new PlaneBufferGeometry(Level.pixelCount.x, Level.pixelCount.y, 1, 1);
        let planeMaterial = new MeshBasicMaterial({
          map: this.texture,
        });
        let mesh = new Mesh(plane, planeMaterial);
        mesh.position.set(Level.pixelCount.x / 2, Level.pixelCount.y / 2, 0);
        game.scene.add(mesh);
      }
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
      this.tilePlanes = new BufferGeometry();
      let tileCount = Level.tileCount.x * Level.tileCount.y;
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
    let tileIndices = this.tileIndices;
    let tilePlanes = this.tilePlanes;
    let tilePlane = this.tilePlane!;
    // Duplicate prototype, translated and tile indexed.
    // TODO How to make sure tilePlanes is large enough?
    // TODO Fill the back with none parts when it's too big?
    let parts = game.stage.parts;
    game.stage.parts.forEach((part, partIndex) => {
      let currentTileIndices = (part.art as Art).editTile;
      // Translate and merge are expensive. TODO Make my own functions?
      tilePlane.translate(part.point.x, part.point.y, 0);
      for (let k = 0; k < tileIndices.length; k += 2) {
        tileIndices[k + 0] = currentTileIndices.x;
        tileIndices[k + 1] = currentTileIndices.y;
      }
      tilePlanes.merge(tilePlane, 6 * partIndex);
      tilePlane.translate(-part.point.x, -part.point.y, 0);
    });
    // For some reason, needsUpdate is missing on attributes, so go any here.
    let attributes: any = tilePlanes.attributes;
    attributes.position.needsUpdate = true;
    attributes.tile.needsUpdate = true;
    // Render.
    // game.render();
  }

  image: HTMLImageElement;

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
    for (let button of toolbox.getToolButtons()) {
      // Get the art for this tool. TODO Simplify this process?
      let name = toolbox.getToolName(button);
      if (name == 'none') {
        // We don't draw a standard tile for this one.
        button.style.height = buttonHeight;
        continue;
      }
      let type = game.edit.namedTools.get(name);
      if (!type) {
        throw new Error(`Unknown type: ${name}`);
      }
      let part = new type(game);
      this.buildArt(part);
      // Now calculate the pixel point.
      let point = (part.art as Art).editTile.clone();
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
