import {Game, Grid, Level, Part} from './';
import {Hero, Steel, Treasure} from './parts';
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
    // Fake steel at edges to block exit.
    // Let each steel block have the right point, though we could maybe ignore
    // position and hack a singleton.
    let makeSteel = (j: number, i: number) => {
      let steel = new Steel(game);
      steel.point.copy(this.workPoint.set(j, i).multiply(Level.tileSize));
      return [steel];
    };
    for (let i = 0; i < Level.tileCount.y; ++i) {
      this.edgeLeft.push(makeSteel(-1, i));
      this.edgeRight.push(makeSteel(Level.tileCount.x, i));
    }
  }

  added(part: Part) {
    // Add to all overlapping grid lists.
    let {grid, workPoint} = this;
    this.walkGrid(part.point, () => {
      grid.get(workPoint)!.push(part);
    });
  }

  clearGrid() {
    this.grid.items.forEach(items => items.length = 0);
  }

  edgeLeft = new Array<Array<Part>>();

  edgeRight = new Array<Array<Part>>();

  ended = false;

  ending = false;

  energyOn = true;

  game: Game;

  // Collision grid.
  grid = new Grid<Array<Part>>(Level.tileCount);

  hero: Hero | undefined = undefined;

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

  partsAt(point: Vector2) {
    let parts = this.partsNear(point) || [];
    return parts.filter(part => part.contains(point));
  }

  partsNear(point: Vector2): Array<Part> | undefined {
    let {grid, workPoint} = this;
    workPoint.copy(point).divide(Level.tileSize).floor();
    let parts = grid.get(workPoint);
    if (!parts) {
      // Give the edges a shot.
      // We don't have a way to get past edges, so presume we're within one grid
      // position of the edge horizontally.
      if (point.x < 0) {
        parts = this.edgeLeft[workPoint.y];
      } else if (point.x >= Level.tileCount.x) {
        parts = this.edgeRight[workPoint.y];
      }
    }
    return parts;
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
    // Choose based on current state.
    for (let part of this.parts) {
      part.choose();
    }
    // Update after choices.
    for (let part of this.parts) {
      part.update();
    }
    // Count time.
    // TODO Actual time once we do that.
    this.time += 1/60;
    if (this.time > 1e6) {
      // Reset instead of getting out of sane-precision land.
      this.time = 0;
    }
    // TODO Maybe separate constrain step?
  }

  // Time in seconds since play start.
  time = 0;

  treasureCount = 0;

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