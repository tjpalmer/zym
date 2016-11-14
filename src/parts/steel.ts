import {Edge, Part} from '../';

export class Steel extends Part {

  static char = '#';

  solid(edge?: Edge) {
    return true;
  }

  surface = true;

}
