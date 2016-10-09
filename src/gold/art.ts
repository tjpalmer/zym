import {NearestFilter, Texture} from 'three';

export class Art {

  constructor() {
    let image = new Image();
    image.src = require('./blocks.png');
    this.texture = new Texture(image);
    this.texture.magFilter = NearestFilter;
    this.texture.needsUpdate = true;
  }

  texture: Texture;

}

declare function require(name: string): any;
