import {None} from './';
import {Part, Game} from '../';
import {Vector2} from 'three';

export class Hero extends Part {

  static char = 'R';

  // For reuse during animation.
  move = new Vector2();

  editPlacedAt(tilePoint: Vector2) {
    let game = this.game;
    let placedIndex = game.level.tiles.index(tilePoint);
    game.level.tiles.items.forEach((type, index) => {
      if (type == Hero && index != placedIndex) {
        let last =
          game.edit.history[game.edit.historyIndex].tiles.items[index];
        game.level.tiles.items[index] = last == Hero ? None : last;
      }
    });
  }

  tick() {
    let {control} = this.game;
    let {move} = this;
    move.setScalar(0);
    // TODO Let changed keys override old ones.
    if (control.left) {
      move.x = -1;
    } else if (control.right) {
      move.x = 1;
    } else if (control.down) {
      move.y = -1;
    } else if (control.up) {
      move.y = 1;
    }
    this.point.add(move);
  }

}
