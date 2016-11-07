import {None} from './';
import {Part, Game} from '../';
import {Vector2} from 'three';

export class Hero extends Part {

  static char = 'R';

  editPlacedAt(game: Game, tilePoint: Vector2) {
    let placedIndex = game.level.tiles.index(tilePoint);
    game.level.tiles.items.forEach((type, index) => {
      if (type == Hero && index != placedIndex) {
        let last =
          game.edit.history[game.edit.historyIndex].tiles.items[index];
        game.level.tiles.items[index] = last == Hero ? None : last;
      }
    });
  }

}
