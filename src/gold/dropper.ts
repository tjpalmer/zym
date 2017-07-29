import {BaseArt, Layer} from './';
import {Drop} from '../parts';
import {Vector2} from 'three';

export class DropArt extends BaseArt<Drop> {

  layer = Layer.back;

  get tile() {
    let {part} = this;
    tile.set(26, 16);
    if (part.stopTime) {
      let offset = Math.min(Math.floor(part.fadeScale * 8), 7);
      tile.y -= offset;
    }
    return tile;
  }

}

let tile = new Vector2();
