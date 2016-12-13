import {Art, Layer} from './';
import {Runner} from '../parts';
import {Vector2} from 'three';

export class RunnerArt implements Art {

  constructor(runner: Runner, tile: Vector2) {
    this.runner = runner;
    this.base = tile;
  }

  base: Vector2;

  frame = 0;

  lastTime = 0;

  // TODO Also on constructor.
  layer = Layer.hero;

  mode = Mode.right;

  runner: Runner;

  get tile(): Vector2 {
    let {mode} = this;
    let {climbing, game, move, moved, speed, support} = this.runner;
    let {stage} = game;
    // Figure out what frame and mode.
    if (game.mode == game.edit) {
      this.frame = 0;
      this.mode = Mode.right;
    } else {
      let movedX = Math.abs(moved.x) > 1e-1;
      // Mode.
      if (support) {
        let swinging = support.catches(this.runner);
        if (climbing) {
          this.mode = Mode.climb;
        } else if (movedX) {
          if (moved.x < 0) {
            this.mode = swinging ? Mode.swingLeft : Mode.left;
          } else {
            this.mode = swinging ? Mode.swingRight : Mode.right;
          }
        } else if (swinging) {
          this.mode = this.mode == Mode.left ? Mode.swingLeft : Mode.swingRight;
        }
        // Frame.
        let didMove = !!(moved.x || moved.y);
        let stepTime = 1/12 / speed;
        let nextTime =
          stage.time > this.lastTime + 1/10 || stage.time < this.lastTime;
        if (nextTime && didMove) {
          this.lastTime = stage.time;
          this.frame = (this.frame + 1) % 5;
        }
      } else {
        // TODO Hands up to fall!
        // if (movedX) {
        //   if ()
        // }
        // if (mode == Mode.swingLeft || mode == Mode.swingRight)
      }
    }
    // Answer based on that.
    let {workPoint} = this;
    workPoint.copy(this.base);
    workPoint.x += this.mode;
    workPoint.y -= this.frame;
    return workPoint;
  }

  workPoint = new Vector2();

}

enum Mode {
  climb = 4,
  left = 1,
  right = 0,
  swingLeft = 3,
  swingRight = 2,
}
