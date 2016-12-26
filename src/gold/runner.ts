import {Art, Layer} from './';
import {Enemy, Runner} from '../parts';
import {Vector2} from 'three';

export class RunnerArt implements Art {

  constructor(runner: Runner, tile: Vector2) {
    this.runner = runner;
    this.base = tile;
  }

  base: Vector2;

  facing = 1;

  frame = 0;

  lastTime = 0;

  // TODO Also on constructor.
  layer = Layer.hero;

  mode = Mode.right;

  get part() {
    return this.runner;
  }

  runner: Runner;

  get tile(): Vector2 {
    let {mode} = this;
    let {climbing, game, move, moved, point, speed, support} = this.runner;
    let {stage} = game;
    // Update facing.
    if (move.x) {
      // Facing is always left or right.
      this.facing = Math.sign(move.x);
    }
    // Figure out what frame and mode.
    if (game.mode == game.edit) {
      this.frame = 0;
      // TODO Subclass RunnerArt for enemies?
      if (this.runner instanceof Enemy) {
        let {hero} = game.stage;
        this.mode = hero && hero.point.x < point.x ? Mode.left : Mode.right;
      } else {
        this.mode = Mode.right;
      }
    } else {
      let movedX = Math.abs(moved.x) > 1e-1;
      // Mode.
      if (support) {
        let swinging = support.catches(this.runner);
        if (climbing) {
          let under = this.runner.getSupport();
          if (under && !under.climbable) {
            climbing = false;
          }
        }
        if (climbing) {
          this.mode = Mode.climb;
        } else {
          if (swinging) {
            this.mode = this.facing < 0 ? Mode.swingLeft : Mode.swingRight;
          } else {
            this.mode = this.facing < 0 ? Mode.left : Mode.right;
          }
        }
        // Frame.
        let didMove = !!(moved.x || moved.y);
        let stepTime = 1/15 / speed;
        let nextTime =
          stage.time > this.lastTime + stepTime || stage.time < this.lastTime;
        if (nextTime && didMove) {
          this.lastTime = stage.time;
          this.frame = (this.frame + 1) % frames.length;
        }
      } else {
        // Hands up to fall.
        this.mode = this.facing < 0 ? Mode.swingLeft : Mode.swingRight;
      }
    }
    // Answer based on that.
    let {workPoint} = this;
    workPoint.copy(this.base);
    workPoint.x += this.mode;
    workPoint.y -= frames[this.frame];
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

// The actual frames from the source image require back and forth.
let frames = [0, 1, 2, 1, 0, 3, 4, 3];
