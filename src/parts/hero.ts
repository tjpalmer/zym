import {None} from './';
import {Part, Stage} from '../';
import {Vector2} from 'three';

export class Hero extends Part {

  editPlacedAt(stage: Stage, tilePoint: Vector2) {
    let placedIndex = stage.level.tiles.index(tilePoint);
    stage.level.tiles.items.forEach((type, index) => {
      if (type == Hero && index != placedIndex) {
        let last = stage.edit.history.slice(-1)[0].tiles.items[index];
        stage.level.tiles.items[index] = last == Hero ? None : last;
      }
    });
  }

}
