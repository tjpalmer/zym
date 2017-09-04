import {Part} from '../index';

export class None extends Part {

  static char = ' ';

  static options = {
    ender: false,
    invisible: false,
  };

  get exists() {
    return false;
  }

}
