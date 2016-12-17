import {Art, arts, Layer} from './';
import {Brick} from '../parts';
import {Vector2} from 'three';

export class BrickArt implements Art {

  constructor(brick: Brick) {
    this.brick = brick;
  }

  brick: Brick;

  layer = Layer.front;

  mainTile = new Vector2(2, 18);

  get tile() {
    let {burned, burnTime, burnTimeLeft} = this.brick;
    if (burned) {
      let {workPoint} = this;
      workPoint.copy(this.mainTile);
      let frame = 10;
      if (burnTime < animTime) {
        frame = Math.floor((burnTime / animTime) * animCount);
      } else if (burnTimeLeft < animTime) {
        frame = Math.floor((burnTimeLeft / animTime) * animCount);
      }
      frame = Math.max(frame, 0);
      workPoint.y -= frame;
      return workPoint;
    } else {
      return this.mainTile;
    }
  }

  workPoint = new Vector2();

}

let animCount = 10;
let animTime = 0.25;
