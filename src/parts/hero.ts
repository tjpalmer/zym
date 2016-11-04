import {None} from './';
import {Part, Stage} from '../';
import {Vector2} from 'three';

export class Hero extends Part {

  static char = 'R';

  editPlacedAt(stage: Stage, tilePoint: Vector2) {
    let placedIndex = stage.level.tiles.index(tilePoint);
    stage.level.tiles.items.forEach((type, index) => {
      if (type == Hero && index != placedIndex) {
        let last =
          stage.edit.history[stage.edit.historyIndex].tiles.items[index];
        stage.level.tiles.items[index] = last == Hero ? None : last;
      }
    });
  }

}
