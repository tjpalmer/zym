import {Edge, Part} from '../';

export class Brick extends Part {

  static char = 'B';

  burnTime: number;

  solid(edge: Edge) {
    return true;
  }

}
