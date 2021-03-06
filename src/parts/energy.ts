import {Shot} from './index';
import {Part, PartType} from '../index';

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

  touchKills(other: Part) {
    // TODO Energize to speed up, instead?
    return false;
  }

}

export class EnergyOff extends Energy {

  static char = 'o';

  static defaultOn = false;

}

export class Latch extends Part {

  static options = {
    breaking: true,
    ender: true,
    falling: false,
    invisible: true,
  };

  changeTime = NaN;

  die(part?: Part) {
    super.die();
    if (part instanceof Shot) {
      this.flip(part.facing);
    }
  }

  facing = 0;

  flip(facing: number) {
    let {stage} = this.game;
    if (facing != this.facing) {
      this.changeTime = stage.time;
      this.facing = facing;
      stage.energyOn = !stage.energyOn;
      if (this.type.breaking) {
        this.die();
        this.active = false;
        this.game.stage.removed(this);
      }
    }
  }

  get shotKillable() {
    return true;
  }

  get shootable() {
    return true;
  }

  update() {
    if (this.dead) {
      return;
    }
    let passer = this.partAt(4, 5, part => !!part.moved.x);
    if (passer) {
      let oldX = passer.point.x - passer.moved.x;
      if (passer.point.x < this.point.x) {
        if (oldX >= this.point.x) {
          this.flip(-1);
        }
      } else if (passer.point.x > this.point.x) {
        if (oldX <= this.point.x) {
          this.flip(1);
        }
      }
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
