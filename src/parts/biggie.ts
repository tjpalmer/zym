import {Runner} from './';
import {Part, RunnerAction} from '../';
import {Vector2} from 'three';

export class Biggie extends Runner {

  action = new RunnerAction();

  choose() {
    this.clearAction();
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

  speed = new Vector2(0.4, 0.7);

}

export class BiggieLeft extends Biggie {

  static char = ']';

  facing = -1;

}

export class BiggieRight extends Biggie {

  static char = '[';

  facing = 1;

}
