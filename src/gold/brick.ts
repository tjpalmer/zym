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
    if (this.brick.burned) {
      let {workPoint} = this;
      workPoint.copy(this.mainTile);
      // TODO Instead keep an index by time.
      workPoint.y -= 10;
      return workPoint;
    } else {
      return this.mainTile;
    }
  }

  workPoint = new Vector2();

}
