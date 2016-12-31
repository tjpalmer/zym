import {Art, Layer} from './';
import {Biggie, BiggieLeft, BiggieRight} from '../parts';
import {Vector2} from 'three';

export class BiggieArt implements Art {

  constructor(biggie: Biggie) {
    this.biggie = biggie;
  }

  biggie: Biggie;

  layer = Layer.biggie;

  get part() {
    return this.biggie;
  }

  get tile() {
    // TODO Facing in play mode.
    this.workPoint.set(21, 14);
    if (this.biggie.facing < 0) {
      this.workPoint.x += 1;
    }
    return this.workPoint;
  }

  workPoint = new Vector2();

}
