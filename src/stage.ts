import {Game, Grid, Level, Part} from './';
import {Vector2} from 'three';

export class Stage {

  constructor(game: Game) {
    this.game = game;
    // Init grid.
    let gridPoint = new Vector2();
    for (let j = 0; j < Level.tileCount.x; ++j) {
      for (let i = 0; i < Level.tileCount.y; ++i) {
        gridPoint.set(j, i);
        this.grid.set(gridPoint, new Array<Part>());
      }
    }
  }

  added(part: Part) {
    // Add to all overlapping grid lists.
    let {grid, workPoint} = this;
    this.walkGrid(part.point, () => {
      grid.get(workPoint)!.push(part);
    });
  }

  game: Game;

  // Collision grid.
  grid = new Grid<Array<Part>>(Level.tileCount);

  moved(part: Part, oldPoint: Vector2) {
    // First see if it's still in the same place.
    let {workPoint, workPoint2} = this;
    workPoint.copy(oldPoint).divide(Level.tileSize);
    workPoint2.copy(part.point).divide(Level.tileSize);
    if (Number.isInteger(workPoint.x) == Number.isInteger(workPoint2.x)) {
      if (Number.isInteger(workPoint.y) == Number.isInteger(workPoint2.y)) {
        if (workPoint.floor().equals(workPoint2.floor())) {
          // In the same place. No updates to make.
          // TODO Could independently check row and col.
          return;
        }
      }
    }
    // If not, remove from old then add to new.
    this.removed(part, oldPoint);
    this.added(part);
  }

  // During level editing, these corresponding exactly to level tile indices.
  // This can include nones.
  // While that's somewhat wasteful, as most levels will be fairly sparse, we
  // have to be able to support full levels, too, and if we don't have to be
  // inserting and deleting all the time, life will be easier.
  // Of course, we can skip the nones when building for actual play, if we want.
  parts = new Array<Part>(Level.tileCount.x * Level.tileCount.y);

  partAt(point: Vector2, keep: (part: Part) => boolean) {
    let parts = this.partsNear(point);
    return parts && parts.find(part => keep(part) && part.contains(point));
  }

  partsNear(point: Vector2): Array<Part> | undefined {
    let {grid, workPoint} = this;
    workPoint.copy(point).divide(Level.tileSize).floor();
    return grid.get(workPoint);
  }

  removed(part: Part, oldPoint?: Vector2) {
    if (!oldPoint) {
      oldPoint = part.point;
    }
    // Remove from overlapping grid lists.
    let {grid, workPoint} = this;
    this.walkGrid(oldPoint, () => {
      let parts = grid.get(workPoint)!;
      let index = parts.indexOf(part);
      if (index >= 0) {
        parts.splice(index, 1);
      }
    });
  }

  tick() {
    // TODO Move all updates to worker thread, and just receive state each
    // TODO frame?
    for (let part of this.parts) {
      part.tick();
    }
  }

  walkGrid(point: Vector2, handle: () => void) {
    let {workPoint} = this;
    workPoint.copy(point).divide(Level.tileSize);
    let colCount = Number.isInteger(workPoint.x) ? 1 : 2;
    let rowCount = Number.isInteger(workPoint.y) ? 1 : 2;
    workPoint.floor();
    let {x: gridSizeX, y: gridSizeY} = this.grid.size;
    for (let j = 0; j < colCount; ++j) {
      if (workPoint.x >= 0 && workPoint.x < gridSizeX) {
        // In the grid. Walk y.
        for (let i = 0; i < rowCount; ++i) {
          if (workPoint.y >= 0 && workPoint.y < gridSizeY) {
            handle();
          }
          // Increment whether handled or not, so later decrement is valid.
          ++workPoint.y;
        }
        // Go to the first row.
        workPoint.y -= rowCount;
      }
      // Next column.
      ++workPoint.x;
    }
  }

  // Cached for use.
  workPoint = new Vector2();
  workPoint2 = new Vector2();

}

export interface Theme {

  buildArt(part: Part): void;

  buildDone(game: Game): void;

}