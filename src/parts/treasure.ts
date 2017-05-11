import {Runner} from './';
import {Part} from '../';

export class Prize extends Part {

  owner?: Runner = undefined;

  update() {
    if (this.owner) {
      this.workPoint.copy(this.point);
      this.point.copy(this.owner.point);
      this.game.stage.moved(this, this.workPoint);
    } else {
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

}

export class Treasure extends Prize {

  static char = '*';

  static options = {
    ender: false,
    invisible: true,
  };

}
