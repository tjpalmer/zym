import {Level, Stage} from '../';
import {
  BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, NearestFilter,
  PlaneBufferGeometry, ShaderMaterial, Texture, Vector2,
} from 'three';

export class Art {

  constructor() {
    let image = new Image();
    image.src = require('./blocks.png');
    let scaled = this.prepareImage(image);
    this.texture = new Texture(scaled);
    this.texture.magFilter = NearestFilter;
    this.texture.needsUpdate = true;
  }

  handle(stage: Stage) {
    stage.scene.children.forEach(kid => stage.scene.remove(kid));
    // Background test.
    let plane =
      new PlaneBufferGeometry(Level.pixelCount.x, Level.pixelCount.y, 1, 1);
    let planeMaterial = new MeshBasicMaterial({
      map: this.texture,
    });
    let mesh = new Mesh(plane, planeMaterial);
    mesh.position.set(Level.pixelCount.x / 2, Level.pixelCount.y / 2, 0);
    stage.scene.add(mesh);
    // Tiles.
    let tileMaterial = new ShaderMaterial({
      uniforms: {
        map: {value: this.texture},
      },
      fragmentShader: tileFragmentShader,
      vertexShader: tileVertexShader,
    });
    let tilePlane = new BufferGeometry();
    tilePlane.addAttribute('position', new BufferAttribute(new Float32Array([
      // Leave the coords at 3D for now to match default expectations.
      // And they'll be translated.
      8, 0, 0, 0, 10, 0, 0, 0, 0,
      8, 0, 0, 8, 10, 0, 0, 10, 0,
    ]), 3));
    tilePlane.addAttribute('tile',
      // Tile map offsets, repeated.
      new BufferAttribute(new Float32Array(2 * 6), 2)
    );
    tilePlane.addAttribute('uv', new BufferAttribute(new Float32Array([
      // Uv are 2D.
      1, 0, 0, 1, 0, 0,
      1, 0, 1, 1, 0, 1,
    ]), 2));
    // TODO Tile number!
    let tilePlanes = new BufferGeometry();
    let tileCount = Level.tileCount.x * Level.tileCount.y;
    for (let name in tilePlane.attributes) {
      let attribute = tilePlane.getAttribute(name);
      tilePlanes.addAttribute(name, new BufferAttribute(new Float32Array(
        tileCount * attribute.array.length
      ), attribute.itemSize));
    }
    // TODO
    let offset = new Vector2();
    for (let j = 0, t = 0; j < Level.tileCount.x; ++j) {
      for (let i = 0; i < Level.tileCount.y; ++i) {
        offset.set(j, i).multiply(Level.tileSize);
        tilePlane.translate(offset.x, offset.y, 0);
        tilePlanes.merge(tilePlane, 6 * t);
        tilePlane.translate(-offset.x, -offset.y, 0);
        ++t;
        // break;
      }
    }
    let tilesMesh = new Mesh(tilePlanes, tileMaterial);
    stage.scene.add(tilesMesh);
    // Render.
    stage.render();
    // stage.redraw = () => this.handle(stage);
  }

  prepareImage(image: HTMLImageElement) {
    let canvas = document.createElement('canvas');
    let round = (x: number) => 2 ** Math.ceil(Math.log2(x));
    canvas.width = round(Level.pixelCount.x);
    canvas.height = round(Level.pixelCount.y);
    let context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    return canvas;
  }

  texture: Texture;

}

declare function require(name: string): any;

let tileFragmentShader = `
  uniform sampler2D map;
  varying vec2 vUv;
  void main() {
    vec2 coord = (
      (vUv + vec2(0, 0)) * vec2(8, 10) + vec2(0, 56)
    ) / vec2(512, 256);
    gl_FragColor = texture2D(map, coord);
    // gl_FragColor.w = gl_FragColor.x * gl_FragColor.y * gl_FragColor.z;
    // if (gl_FragColor.w > 0.0) {
    //   gl_FragColor.w = 1.0;
    // }
  }
`;

let tileVertexShader = `
  varying vec2 vUv;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
  }
`;
