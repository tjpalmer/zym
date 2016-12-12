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

  // TODO They still get stuck when clumped in hordes after making this
  // TODO non-integer.
  // TODO Fix this sometime.
  speed = 0.8;

  surface = true;

  tick() {
    // Reset action.
    let {action} = this;
    action.left = action.right = action.up = action.down = false;
    // Make a decision.
    let {hero} = this.game.stage;
    if (hero) {
      if (hero.point.x < this.point.x) {
        action.left = true;
      } else if (hero.point.x > this.point.x) {
        action.right = true;
      }
    }
    // TODO Make physics a different step after action!
    this.processAction(action);
  }

}
