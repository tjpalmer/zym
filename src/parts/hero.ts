import {None, Prize, Runner, Treasure} from './';
import {Edge, Game, Level, Part, RunnerAction} from '../';
import {Vector2} from 'three';

export class Hero extends Runner {

  static char = 'R';

  action = new RunnerAction();

  actionChange = new RunnerAction();

  bonusCount = 0;

  carried = true;

  checkAction() {
    let {action, actionChange} = this;
    let {control} = this.game;
    // Find what changed.
    actionChange.burnLeft = action.burnLeft != control.burnLeft;
    actionChange.burnRight = action.burnRight != control.burnRight;
    actionChange.down = action.down != control.down;
    actionChange.left = action.left != control.left;
    actionChange.right = action.right != control.right;
    actionChange.up = action.up != control.up;
    // Then copy the current.
    this.action.copy(control);
  }

  choose() {
    if (this.game.stage.ended || this.phased) {
      this.action.clear();
    }
    this.checkAction();
    let {action} = this;
    this.processAction(action);
  }

  dead = false;

  die() {
    if (!(this.phased || this.game.stage.ended)) {
      this.dead = true;
      this.game.stage.ended = true;
      this.game.play.showReport('Maybe next time.');
    }
  }

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

  speed = new Vector2(1, 1);

  treasureCount = 0;

  take(prize: Prize) {
    if (prize instanceof Treasure) {
      this.treasureCount += 1;
      if (this.treasureCount == this.game.stage.treasureCount) {
        this.game.stage.ending = true;
        this.game.level.updateStage(this.game);
      }
    } else {
      // Bonus is the only other option.
      this.bonusCount += 1;
    }
    return true;
  }

  update() {
    // Update everything.
    super.update();
    if (!this.game.stage.ended) {
      // See if we won or lost.
      let {point: {y}} = this;
      if (y <= -10) {
        this.die();
      }
      if (this.game.stage.ending && y >= Level.pixelCount.y) {
        this.game.stage.ended = true;
        this.game.play.showReport('Level complete!');
      }
    }
  }

}
