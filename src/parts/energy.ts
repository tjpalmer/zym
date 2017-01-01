import {Part} from '../';

export class Energy extends Part {

  static char = 'O';

  on = true;

  solid() {
    return this.on;
  }

  surface() {
    return this.solid();
  }

}

export class EnergyOff extends Energy {

  static char = 'o';

  on = false;

}

export class Latch extends Part {

  facing = 0;

}

export class LatchLeft extends Latch {

  static char = '\\';

  facing = -1;

}

export class LatchRight extends Latch {

  static char = '/';

  facing = 1;

}
