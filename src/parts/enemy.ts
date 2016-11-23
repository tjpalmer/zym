import {Runner} from './';
import {Edge, Game, Part, RunnerAction} from '../';

export class Enemy extends Runner {

  static char = 'e';

  action = new RunnerAction();

  solid(other: Part, edge?: Edge): boolean {
    // Enemies block entrance to each other, but not exit from.
    // Just a touch of safety precaution.
    return other instanceof Enemy && !!edge;
  }

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
