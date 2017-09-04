import {Part} from '../index';

export class Ladder extends Part {

  static char = 'H';

  climbable() {
    return true;
  }

  surface() {
    return true;
  }

}
