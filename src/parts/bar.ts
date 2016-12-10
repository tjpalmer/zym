import {Runner} from './';
import {Part} from '../';

export class Bar extends Part {

  static char = '-';

  catches(part: Part) {
    return part instanceof Runner;
  }

}
