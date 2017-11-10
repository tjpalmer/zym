import {Game, Grid, Group, Level, Part} from './index';
import {Hero, Spawn, Steel, Treasure} from './parts/index';
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
    for (let i = 0; i < Level.tileCount.y; ++i) {
      this.edgeLeft.push([new Steel(game)]);
      this.edgeRight.push([new Steel(game)]);
    }
  }

  added(part: Part) {
    // Add to all overlapping grid lists.
    let {grid, workPoint} = this;
    this.walkGrid(part.point, () => {
      grid.get(workPoint)!.push(part);
    });
    if (part instanceof Spawn) {
      this.spawns.push(part);
    }
  }

  clearGrid() {
    this.grid.items.forEach(items => items.length = 0);
  }

  died(part: Part) {
    Spawn.respawnMaybe(part);
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

  init() {
    for (let part of this.parts) {
      part.updateInfo();
    }
  }

  manageParticles() {
    let {particles} = this;
    // The oldest particles should likely be the first to cease existing.
    // So clear them out to prevent excess work.
    for (let index = 0; index < particles.length;) {
      let particle = particles.items[index]!;
      if (particle.exists) {
        index += 1;
      } else {
        particles.removeAt(index);
        this.removed(particle);
      }
    }
  }

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

  // These particles are short-lived but relevant to game state.
  // Other particles might exist only in the visual theme.
  particles = new Group<Part>();

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
    let {max, min} = this.tileBounds;
    workPoint.copy(point).divide(Level.tileSize).floor();
    let parts: Part[] | undefined;
    if (workPoint.y < min.y || workPoint.y >= max.y) {
      return undefined;
    } else if (workPoint.x < min.x) {
      parts = this.edgeLeft[workPoint.y];
    } else if (workPoint.x >= max.x) {
      parts = this.edgeRight[workPoint.y];
    } else {
      parts = grid.get(workPoint);
    }
    return parts;
  }

  pixelBounds = {max: new Vector2(), min: new Vector2()};

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
    if (part instanceof Spawn) {
      let index = this.spawns.indexOf(part);
      this.spawns.splice(index, 1);
    }
  }

  spawns = new Array<Spawn>();

  tick() {
    // TODO Move all updates to worker thread, and just receive state each
    // TODO frame?
    this.manageParticles();
    this.tickParts(this.parts);
    this.tickParts(this.particles);
    // Count time.
    // TODO Actual time once we do that.
    this.time += 1/60;
    if (this.time > 1e6) {
      // Reset instead of getting out of sane-precision land.
      this.time = 0;
    }
    // TODO Maybe separate constrain step?
  }

  tickParts(parts: Iterable<Part>) {
    // Choose based on current state.
    for (let part of parts) {
      if (!part.cropped) {
        part.choose();
      }
    }
    // Update after choices.
    for (let part of parts) {
      if (!part.cropped) {
        part.update();
      }
    }
  }

  tileBounds = {max: new Vector2(), min: new Vector2()};

  // Time in seconds since play start.
  time = 0;

  treasureCount = 0;

  update() {
    // Pixel bounds.
    this.pixelBounds.max.copy(this.tileBounds.max).multiply(Level.tileSize);
    this.pixelBounds.min.copy(this.tileBounds.min).multiply(Level.tileSize);
    // Edges.
    // Let each steel block have the right point, though we could maybe ignore
    // position and hack a singleton.
    let {tileBounds} = this;
    let minX = (tileBounds.min.x - 1) * Level.tileSize.x;
    this.edgeLeft.forEach((parts, i) => {
      parts[0].point.set(minX, i * Level.tileSize.y);
    });
    let maxX = tileBounds.max.x * Level.tileSize.x;
    this.edgeRight.forEach((parts, i) => {
      parts[0].point.set(maxX, i * Level.tileSize.y);
    });
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

  modeChanged(): void;

  updateTool(button: HTMLElement): void;

}
