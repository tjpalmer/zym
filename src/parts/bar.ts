import {Runner} from './index';
import {Part} from '../index';

export class Bar extends Part {

  static char = '-';

  catches(part: Part) {
    return part instanceof Runner;
  }

}
