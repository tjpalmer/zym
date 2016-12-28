import {None, Runner, Treasure} from './';
import {Edge, Level, Part, Game} from '../';
import {Vector2} from 'three';

export class Hero extends Runner {

  static char = 'R';

  carried = true;

  choose() {
    let {control: action} = this.game;
    if (this.dead) {
      action.left = action.right = action.up = action.down = false;
    }
    this.processAction(action);
  }

  dead = false;

  editPlacedAt(tilePoint: Vector2) {
    let game = this.game;
    let placedIndex = game.level.tiles.index(tilePoint);
    // TODO Cache hero position for level?
    game.level.tiles.items.forEach((type, index) => {
      if (type == Hero && index != placedIndex) {
        let editState = game.edit.editState;
        let last = editState.history[editState.historyIndex].tiles.items[index];
        game.level.tiles.items[index] = last == Hero ? None : last;
      }
    });
  }

  speed = 1;

  treasureCount = 0;

  take(treasure: Treasure) {
    this.treasureCount += 1;
    if (this.treasureCount == this.game.stage.treasureCount) {
      this.game.stage.ending = true;
      this.game.level.updateStage(this.game);
    }
    return true;
  }

}
