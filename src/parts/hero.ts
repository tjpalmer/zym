import {None} from './';
import {Level, Part, Game} from '../';
import {Vector2} from 'three';

export class Hero extends Part {

  static char = 'R';

  // For reuse during animation.
  move = new Vector2();

  oldPoint = new Vector2();

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

  getSurface(leftParts: Array<Part>, rightParts: Array<Part>) {
    return (
      leftParts.find(part => part.surface) ||
      rightParts.find(part => part.surface));
  }

  partsAt(x: number, y: number) {
    return this.game.stage.partsAt(this.workPoint.set(x, y).add(this.point));    
  }

  tick() {
    // TODO Let changed keys override old ones.
    let {control, stage} = this.game;
    let {move, oldPoint, point, workPoint} = this;
    oldPoint.copy(point);
    move.setScalar(0);
    let leftParts = this.partsAt(3, -1);
    let rightParts = this.partsAt(4, -1);
    let surface = this.getSurface(leftParts, rightParts);
    if (surface) {
      if (control.left) {
        move.x = -1;
      } else if (control.right) {
        move.x = 1;
      }
    } else {
      move.x =
        Level.tileSize.x * Math.round(point.x / Level.tileSize.x) - point.x;
      move.y = -1;
    }
    point.add(move);
    stage.moved(this, oldPoint);
  }

  workPoint = new Vector2();

}
