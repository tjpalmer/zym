import {BaseArt, Layer} from './';
import {Biggie, BiggieLeft, BiggieRight} from '../parts';
import {Vector2} from 'three';

export class BiggieArt extends BaseArt<Biggie> {

  frame = 0;

  lastTime = 0;

  layer = Layer.biggie;

  get offsetX() {
    // There left-facing biggie is shifted in the texture, so offset.
    return this.part.facing < 0 ? 1 : 0;
  }

  get tile() {
    let {part, workPoint} = this;
    let {facing, game, moved, speed} = part;
    let {time} = game.stage;
    this.workPoint.set(21, 14);
    if (facing < 0) {
      workPoint.x += 1;
    }
    if (game.mode != game.edit && !part.dead) {
      let didMove = !!moved.x;
      let stepTime = 1/15 / speed.x;
      let nextTime = time > this.lastTime + stepTime || time < this.lastTime;
      if (nextTime && didMove) {
        this.lastTime = time;
        this.frame = (this.frame + 1) % frames.length;
      }
      workPoint.y -= frames[this.frame];
    }
    return workPoint;
  }

  workPoint = new Vector2();

}

// The actual frames from the source image require back and forth.
let frames = [0, 1, 0, 2];
