import {None} from './';
import {Edge, Level, Part, Game} from '../';
import {Vector2} from 'three';

export class Hero extends Part {

  static char = 'R';

  encased() {
    return (
      this.partsAt(0, 0).some(part => part.solid()) ||
      this.partsAt(0, 9).some(part => part.solid()) ||
      this.partsAt(7, 0).some(part => part.solid()) ||
      this.partsAt(7, 9).some(part => part.solid())
    );
  }

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

  getClimbable(leftParts: Array<Part>, rightParts: Array<Part>) {
    return (
      leftParts.find(part => part.climbable) ||
      rightParts.find(part => part.climbable));
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
    let alignX = false;
    let alignY = false;
    let leftParts = this.partsAt(3, -1);
    let rightParts = this.partsAt(4, -1);
    let surface = this.getSurface(leftParts, rightParts);
    let inClimbable = this.getClimbable(this.partsAt(3, 0), this.partsAt(4, 0));
    let climbable = this.getClimbable(leftParts, rightParts) || inClimbable;
    if (!surface) {
      surface = climbable;
    }
    if (this.encased()) {
      // This could happen if a brick just enclosed on part of us.
      // TODO Die.
    } else if (surface) {
      // TODO Remember old move options to allow easier transition?
      if (control.left) {
        move.x = -1;
      } else if (control.right) {
        move.x = 1;
      } else if (climbable) {
        if (control.down) {
          alignX = true;
          move.y = -1;
        } else if (control.up && inClimbable) {
          alignX = true;
          move.y = 1;
        }
      }
    } else {
      // TODO On trying to climb ladder, can push away from it!
      alignX = true;
      move.y = -1;
    }
    // move.multiplyScalar(3);
    point.add(move);
    if (!alignX) {
      // See if we need to align x for solids.
      // TODO If openings partially above or below, move and align y!
      if (move.x < 0) {
        if (
          this.partsAt(0, 0).some(part => part.solid(Edge.right)) ||
          this.partsAt(0, 9).some(part => part.solid(Edge.right))
        ) {
          alignX = true;
        }
      } else if (move.x > 0) {
        if (
          this.partsAt(7, 0).some(part => part.solid(Edge.left)) ||
          this.partsAt(7, 9).some(part => part.solid(Edge.left))
        ) {
          alignX = true;
        }
      }
    }
    if (!alignY) {
      // See if we need to align y for solids.
      if (move.y < 0) {
        let newSurface =
          this.getSurface(this.partsAt(3, -1), this.partsAt(4, -1));
        if (newSurface && !surface) {
          // For landing on ladder. TODO Bars.
          alignY = true;
        } else if (
          this.partsAt(0, 0).some(part => part.solid(Edge.top)) ||
          this.partsAt(7, 0).some(part => part.solid(Edge.top))
        ) {
          alignY = true;
        }
      } else if (move.y > 0) {
        if (
          this.partsAt(0, 9).some(part => part.solid(Edge.bottom)) ||
          this.partsAt(7, 9).some(part => part.solid(Edge.bottom))
        ) {
          alignY = true;
        }
      }
    }
    if (alignX) {
      point.x = Level.tileSize.x * Math.round(point.x / Level.tileSize.x);
    }
    if (alignY) {
      point.y = Level.tileSize.y * Math.round(point.y / Level.tileSize.y);
    }
    stage.moved(this, oldPoint);
  }

  workPoint = new Vector2();

}
