import {Brick, Enemy, Runner, TilePos} from './';
import {Edge, Part, RunnerAction} from '../';
import {Vector2} from 'three';

export class Biggie extends Runner {

  action = new RunnerAction();

  checkTurn() {
    if (this.moved.y) {
      // No turn while falling.
      return;
    }
    let x = this.facing < 0 ? TilePos.midLeft : TilePos.midRight;
    let ahead =
      this.partAt(x, -1, part => part.surface(this) || part instanceof Brick);
    if (ahead) {
      x = this.facing < 0 ? -1 : 9;
      let edge = this.facing < 0 ? Edge.right : Edge.left;
      let wall = this.partAt(x, 0, part => part.solid(this, edge));
      if (wall) {
        ahead = undefined;
      }
    }
    if (!ahead) {
      if (this.lastTurn < this.game.stage.time - 0.25) {
        this.facing = -this.facing;
        this.lastTurn = this.game.stage.time;
      } else {
        this.hold = true;
      }
    }
  }

  choose() {
    this.clearAction();
    if (!this.dead) {
      this.checkTurn();
      if (!this.hold) {
        if (this.facing < 0) {
          this.action.left = true;
        } else {
          this.action.right = true;
        }
      }
    }
    this.processAction(this.action);
  }

  clearAction() {
    let {action} = this;
    action.left = action.right = action.up = action.down = false;
    this.hold = false;
  }

  facing = 0;

  hold = false;

  lastTurn = 0;

  solid(other: Part): boolean {
    return other instanceof Biggie;
  }

  speed = new Vector2(0.3, 0.7);

  surface(other: Part) {
    return !(other instanceof Enemy);
  }

  update() {
    let hero = this.game.stage.hero;
    if (hero && !this.dead) {
      this.workPoint.copy(this.point).add(this.workPoint2.set(4, 5));
      if (hero.contains(this.workPoint)) {
        hero.die();
      }
    }
    super.update();
  }

  workPoint2 = new Vector2();

}

export class BiggieLeft extends Biggie {

  static char = ']';

  facing = -1;

}

export class BiggieRight extends Biggie {

  static char = '[';

  facing = 1;

}
