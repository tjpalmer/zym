import {Part} from '../';

export class None extends Part {

  static char = ' ';

  get exists() {
    return false;
  }

}
