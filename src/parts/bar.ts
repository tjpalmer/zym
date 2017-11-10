import {Runner} from './index';
import {Part} from '../index';

export class Bar extends Part {

  static char = '-';

  static options = {
    breaking: true,
    ender: true,
    falling: false,
    invisible: true,
  };

  catches(part: Part) {
    return part instanceof Runner;
  }

}
