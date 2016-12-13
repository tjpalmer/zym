import {Runner} from './';
import {Edge, Game, Part, RunnerAction} from '../';
import {Vector2} from 'three';

export class Enemy extends Runner {

  static char = 'e';

  action = new RunnerAction();

  getOther(x: number, y: number) {
    let isEnemy = (part: Part) => part instanceof Enemy && part != this;
    return this.partAt(x, y, isEnemy);
  }

  solid(other: Part, edge?: Edge): boolean {
    // Enemies block entrance to each other, but not exit from.
    // Just a touch of safety precaution.
    return other instanceof Enemy && !!edge;
  }

  // TODO They still get stuck when clumped in hordes after making this
  // TODO non-integer.
  // TODO Fix this sometime.
  speed = 0.7;

  surface = true;

  tick() {
    // Reset action.
    let {action} = this;
    action.left = action.right = action.up = action.down = false;
    // Make a decision.
    let {hero} = this.game.stage;
    if (hero) {
      let diff = this.workPoint2.copy(hero.point).sub(this.point);
      if (Math.abs(diff.y) > close) {
        // Because y moves are prioritized, just turn them on for control when
        // applicable.
        if (diff.y < 0) {
          // TODO Watch about if over pits.
          let solidSurface =
            this.getSurface(part => part.solid(this, Edge.top));
          if (!solidSurface) {
            action.down = true;
          }
        } else {
          action.up = true;
        }
      }
      if (Math.abs(diff.x) > close) {
        // TODO Watch for not running over pits.
        // Keep some spacing between enemies when possible.
        // See if all surfaces are enemies.
        let comradeSurface = this.getSurface(part => part instanceof Enemy);
        let noncomradeSurface =
          this.getSurface(part => !(part instanceof Enemy));
        let surface = comradeSurface && !noncomradeSurface;
        if (diff.x < 0) {
          if (!(this.getOther(-8, 4) || surface)) {
            action.left = true;
          }
        } else {
          if (!(this.getOther(16, 4) || surface)) {
            action.right = true;
          }
        }
      }
    }
    // TODO Make physics a different step after action!
    this.processAction(action);
  }

  workPoint2 = new Vector2();

}

let close = 4;
