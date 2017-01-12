import {Shot} from './';
import {Part, PartType} from '../';

interface EnergyType extends PartType {
  defaultOn: boolean;
}

export class Energy extends Part {

  static char = 'O';

  static defaultOn = true;

  get on() {
    return (this.type as EnergyType).defaultOn == this.game.stage.energyOn;
  }

  solid() {
    return this.on;
  }

  surface() {
    return this.solid();
  }

}

export class EnergyOff extends Energy {

  static char = 'o';

  static defaultOn = false;

}

export class Latch extends Part {

  changeTime = NaN;

  die(part?: Part) {
    super.die();
    if (part instanceof Shot) {
      let facing = part.gun.facing;
      if (facing != this.facing) {
        this.flip(facing);
      }
    }
  }

  facing = 0;

  flip(facing: number) {
    let {stage} = this.game;
    this.changeTime = stage.time;
    this.facing = facing;
    stage.energyOn = !stage.energyOn;
  }

  heroWasNear = false;

  lastHeroSide = 0;

  get shotKillable() {
    return true;
  }

  get shootable() {
    return true;
  }

  update() {
    let {heroWasNear, workPoint} = this;
    let {hero} = this.game.stage;
    if (!hero) {
      return;
    }
    // See if the hero overlaps our middle.
    workPoint.set(4, 5).add(this.point);
    if (hero.contains(workPoint)) {
      // If so, check for center crossings.
      let heroSide = Math.sign(hero.point.x - this.point.x);
      if (heroWasNear && heroSide && heroSide != this.lastHeroSide) {
        if (heroSide == -this.facing) {
          this.flip(heroSide);
        }
      }
      this.lastHeroSide = heroSide;
      this.heroWasNear = true;
    } else {
      this.heroWasNear = false;
    }
  }

}

export class LatchLeft extends Latch {

  static char = '\\';

  facing = -1;

}

export class LatchRight extends Latch {

  static char = '/';

  facing = 1;

}
