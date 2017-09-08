import {Runner} from './index';
import {Part} from '../index';

export class Prize extends Part {

  owner?: Runner = undefined;

  update() {
    if (!this.owner) {
      let runner = this.partAt(4, 5, part =>
        part instanceof Runner && !part.dead
      ) as Runner | undefined;
      if (runner && runner.take(this)) {
        this.owner = runner;
      }
    }
  }

}

export class Bonus extends Prize {

  // Time is money, eh?
  static char = '$';

  static options = {
    breaking: false,
    ender: true,
    falling: false,
    invisible: true,
  };

  bonusEnd = 0;

}

export class Treasure extends Prize {

  static char = '*';

  static options = {
    breaking: false,
    ender: false,
    falling: false,
    invisible: true,
  };

}
