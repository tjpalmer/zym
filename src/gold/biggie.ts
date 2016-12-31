import {Art, Layer} from './';
import {Biggie, BiggieLeft, BiggieRight} from '../parts';
import {Vector2} from 'three';

export class BiggieArt implements Art {

  constructor(biggie: Biggie) {
    this.biggie = biggie;
  }

  biggie: Biggie;

  frame = 0;

  lastTime = 0;

  layer = Layer.biggie;

  get part() {
    return this.biggie;
  }

  get tile() {
    let {biggie, workPoint} = this;
    let {facing, game, moved, speed} = biggie;
    let {time} = game.stage;
    this.workPoint.set(21, 14);
    if (facing < 0) {
      workPoint.x += 1;
    }
    if (game.mode != game.edit) {
      let didMove = !!moved.x;
      let stepTime = 1/15 / speed.x;
      let nextTime = time > this.lastTime + stepTime || time < this.lastTime;
      if (nextTime && didMove) {
        this.lastTime = time;
        this.frame = (this.frame + 1) % frames.length;
      }
      workPoint.y -= frames[this.frame];
    }
    return this.workPoint;
  }

  workPoint = new Vector2();

}

// The actual frames from the source image require back and forth.
let frames = [0, 1, 0, 2];
