import {Runner} from './';
import {Part} from '../';

export class Treasure extends Part {

  static char = '*';

  owner?: Runner = undefined;

  update() {
    if (this.owner) {
      this.point.copy(this.owner.point);
    } else {
      let runner =
        this.partAt(4, 5, part => part instanceof Runner) as Runner | undefined;
      if (runner && runner.take(this)) {
        this.owner = runner;
      }
    }
  }

}
