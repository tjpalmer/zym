import {Edge, Part} from '../';

export class Steel extends Part {

  static char = '#';

  solid(other: Part, edge?: Edge) {
    return true;
  }

  surface() {
    return true;
  }

}
