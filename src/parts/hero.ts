import {None, Runner} from './';
import {Edge, Level, Part, Game} from '../';
import {Vector2} from 'three';

export class Hero extends Runner {

  static char = 'R';

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
    // TODO Let changed keys override old ones.
    this.processAction(this.game.control);
  }

}
