import {Part} from '../index';

export class None extends Part {

  static char = ' ';

  static options = {
    breaking: false,
    ender: false,
    falling: false,
    invisible: false,
  };

  get exists() {
    return false;
  }

}
