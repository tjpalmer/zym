import {Brick, Runner, TilePos} from './';
import {Part, RunnerAction} from '../';
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
      this.partAt(x, -1, part => part.surface || part instanceof Brick);
    if (!ahead) {
      this.facing = -this.facing;
    }
  }

  choose() {
    this.clearAction();
    this.checkTurn();
    if (this.facing < 0) {
      this.action.left = true;
    } else {
      this.action.right = true;
    }
    this.processAction(this.action);
  }

  clearAction() {
    let {action} = this;
    action.left = action.right = action.up = action.down = false;
  }

  facing = 0;

  speed = new Vector2(0.3, 0.7);

  surface = true;

}

export class BiggieLeft extends Biggie {

  static char = ']';

  facing = -1;

}

export class BiggieRight extends Biggie {

  static char = '[';

  facing = 1;

}
