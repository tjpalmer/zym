import {BaseArt, Layer} from './';
import {Crusher} from '../parts';
import {Vector2} from 'three';

export class CrusherArt extends BaseArt<Crusher> {

  layer = Layer.back;

  count = 0;

  get tile() {
    let {part} = this;
    if (part.hitType && this.count < 2) {
      this.count += 0.2;
    }
    tile.set(21 + Math.floor(this.count), 18);
    return tile;
  }

}

let tile = new Vector2();
