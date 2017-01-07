import {Runner} from './';
import {Part} from '../';

export class Prize extends Part {

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

export class Bonus extends Prize {

  static char = '$';

}

export class Treasure extends Prize {

  static char = '*';

}
