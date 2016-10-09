import {Level, Stage} from '../';
import {
  Mesh, MeshBasicMaterial, NearestFilter, PlaneBufferGeometry, Texture
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
    let plane =
      new PlaneBufferGeometry(Level.pixelCount.x, Level.pixelCount.y, 1, 1);
    let planeMaterial = new MeshBasicMaterial({
      map: this.texture,
    });
    let mesh = new Mesh(plane, planeMaterial);
    mesh.position.set(Level.pixelCount.x / 2, Level.pixelCount.y / 2, 0);
    stage.scene.add(mesh);
    // Render.
    stage.render();
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
