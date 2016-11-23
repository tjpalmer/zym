import {Edge, Part} from '../';

export class Brick extends Part {

  static char = 'B';

  burnTime: number;

  solid(other: Part, edge?: Edge) {
    return true;
  }

  surface = true;

}
