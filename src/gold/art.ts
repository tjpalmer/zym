export class Art {

  constructor() {
    let image = new Image();
    image.src = require('./blocks.png');
  }

}

declare function require(name: string): any;
