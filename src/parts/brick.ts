import {Edge, Part} from '../';
import {Enemy, Treasure} from '../parts';
import {Vector2} from 'three';

export class Brick extends Part {

  static char = 'B';

  burned = false;

  get burnTime() {
    return this.game.stage.time - this.burnTimeStart;
  }

  get burnTimeLeft() {
    return totalGoneTime - this.burnTime;
  }

  burnTimeStart: number;

  catches(part: Part) {
    return this.burned && part instanceof Enemy;
  }

  checkBurner(direction: number) {
    let {hero} = this.game.stage;
    if (this.burned || !hero) {
      return;
    }
    // See if there's a treasure above.
    // If so, disallow burning, so we can't get multiple in the same spot.
    // See if some visual or tutorial helps to convey the rule.
    // Uses workPoint.
    let treasureAbove = this.partAt(
      4, 11, part => part instanceof Treasure || part.solid(hero!)
    );
    // Now use workPoint manually.
    let {workPoint} = this;
    workPoint.copy(this.point);
    // Be somewhat near the base of the guy.
    // A little off to the side, though when pixel-aligned, 8 * dir is good
    // enough.
    workPoint.x += 4 + 9 * direction;
    workPoint.y += 12;
    if (hero.contains(workPoint) && !treasureAbove) {
      if (Math.abs(hero.point.y - 10 - this.point.y) < 4) {
        this.burned = true;
        this.burnTimeStart = this.game.stage.time;
      }
    }
  }

  choose() {
    let {control} = this.game;
    if (control.burnLeft) {
      this.checkBurner(1);
    }
    if (control.burnRight) {
      this.checkBurner(-1);
    }
    if (this.burnTimeLeft <= 0) {
      this.burned = false;
    }
  }

  climbable(other: Part) {
    if (this.burned && other instanceof Enemy) {
      // Check dazed, so we don't look like we're trying to climb.
      if (other.catcher == this && !(other.dazed || other.dead)) {
        return true;
      }
    }
    return false;
  }

  solid(other: Part, edge?: Edge, seems?: boolean) {
    return this.surface(other, seems);
  }

  surface(other: Part, seems?: boolean) {
    return seems ? true : !this.burned;
  }

}

let totalGoneTime = 5;
