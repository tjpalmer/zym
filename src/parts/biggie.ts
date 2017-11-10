import {Brick, Enemy, Runner, TilePos} from './index';
import {Edge, Part, RunnerAction} from '../index';
import {Vector2} from 'three';

export class Biggie extends Runner {

  action = new RunnerAction();

  checkTurn() {
    if (this.moved.y) {
      // No turn while falling.
      return;
    }
    let x = this.facing < 0 ? TilePos.midLeft : TilePos.midRight;
    let ahead = this.partAt(
      x, -1, part => part.surface(this) || part.solid(this, Edge.top, true)
    );
    checkMore: if (ahead) {
      if (ahead.climbable) {
        // Don't walk through continuous climbables.
        let commonType = ahead.type.common;
        if (
          this.partAt(x, 5, part => part.type.common == commonType)
        ) {
          ahead = undefined;
          break checkMore;
        }
      }
      x = this.facing < 0 ? -1 : 9;
      let edge = this.facing < 0 ? Edge.right : Edge.left;
      let wall = this.partAt(x, 0, part => part.solid(this, edge, true));
      if (wall) {
        ahead = undefined;
        break checkMore;
      }
      // Inside edges are opposite outside.
      edge = this.facing < 0 ? Edge.left : Edge.right;
      wall = this.getSolidInside(edge, x, 0, this.facing, 0);
      if (wall) {
        ahead = undefined;
        break checkMore;
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
    this.action.clear();
    this.hold = false;
  }

  climber = false;

  facing = 0;

  hold = false;

  lastTurn = 0;

  get shotKillable() {
    return false;
  }

  solid(other: Part, edge?: Edge): boolean {
    // Enemies block entrance to each other, but not exit from.
    // Just a touch of safety precaution.
    return other instanceof Biggie && !!edge;
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

  // The inside of the bracket faces forward to represent the head and foot or
  // tread facing forward.
  static char = ']';

  facing = -1;

}

export class BiggieRight extends Biggie {

  static char = '[';

  facing = 1;

}
