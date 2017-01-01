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

  facing = 0;

  lastHeroSide = 0;

  state = 0;

  update() {
    let {workPoint} = this;
    let {stage} = this.game;
    let {hero} = stage;
    if (!hero) {
      return;
    }
    workPoint.set(4, 5).add(this.point);
    if (hero.contains(workPoint)) {
      let diff = hero.point.x - this.point.x;
      let heroSide = Math.sign(diff);
      if (heroSide && (heroSide == -this.lastHeroSide || !this.lastHeroSide)) {
        if (Math.abs(diff) > 1) {
          if (heroSide == -this.state) {
            let oldState = this.state;
            this.state = this.facing = heroSide;
            stage.energyOn = !stage.energyOn;
          }
        } else {
          this.facing = 0;
        }
        this.lastHeroSide = heroSide;
      }
    } else {
      this.lastHeroSide = 0;
    }
  }

}

export class LatchLeft extends Latch {

  static char = '\\';

  facing = -1;

  state = -1;

}

export class LatchRight extends Latch {

  static char = '/';

  facing = 1;

  state = 1;

}
