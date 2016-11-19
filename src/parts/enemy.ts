import {Runner} from './';
import {Game, RunnerAction} from '../';

export class Enemy extends Runner {

  static char = 'e';

  action = new RunnerAction();

  surface = true;

  tick() {
    // Reset action.
    let {action} = this;
    action.left = action.right = action.up = action.down = false;
    // Make a decision.
    action.right = true;
    this.processAction(action);
  }

}
