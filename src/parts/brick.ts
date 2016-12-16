import {Edge, Part} from '../';
import {Enemy} from '../parts';
import {Vector2} from 'three';

export class Brick extends Part {

  static char = 'B';

  burned = false;

  burnTime: number;

  catches(part: Part) {
    return this.burned && part instanceof Enemy;
  }

  checkBurner(direction: number) {
    let {hero} = this.game.stage;
    if (this.burned || !hero) {
      return;
    }
    let {workPoint} = this;
    workPoint.copy(this.point);
    // Be somewhat near the base of the guy.
    // A little off to the side, though when pixel-aligned, 8 * dir is good
    // enough.
    workPoint.x += 4 + 9 * direction;
    workPoint.y += 12;
    if (hero.contains(workPoint)) {
      if (Math.abs(hero.point.y - 10 - this.point.y) < 4) {
        this.burned = true;
        this.burnTime = this.game.stage.time;
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
    if (this.game.stage.time > this.burnTime + 5) {
      this.burned = false;
    }
  }

  solid(other: Part, edge?: Edge) {
    return !this.burned;
  }

  get surface() {
    return !this.burned;
  }

  set surface(value: boolean) {
    // Ignore the setting of the default value.
  }

  workPoint = new Vector2();

}
