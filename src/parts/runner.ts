import {None, Prize} from './index';
import {Edge, Game, Level, Part, RunnerAction} from '../index';
import {Vector2} from 'three';

class Blocker {
  part: Part;
  pos: number;
}

export class Runner extends Part {

  static options = {
    breaking: false,
    ender: true,
    falling: false,
    invisible: false,
  };

  align = new Vector2();

  carriedMove(x: number) {}

  climber = true;

  climbing = false;

  encased(solid: boolean = false) {
    let check = solid ?
      (part: Part) => part.solid(this) && part != this :
      (part: Part) => part.touchKills(this) && part != this;
    return (
      this.partsAt(0, 0).some(check) ||
      this.partsAt(0, top).some(check) ||
      this.partsAt(right, 0).some(check) ||
      this.partsAt(right, top).some(check)
    );
  }

  oldCatcher: Part | undefined = undefined;

  oldPoint = new Vector2();

  findAlign(edge: Edge, minParts: Array<Part>, maxParts: Array<Part>) {
    // Find where an opening is, so we can align to that.
    if (!minParts.some(part => part.solid(this, edge))) {
      return -1;
    }
    if (!maxParts.some(part => part.solid(this, edge))) {
      return 1;
    }
    return 0;
  }

  getCatcher(exact = true) {
    let catches = (part: Part) => part.catches(this);
    let check = (x: number, y: number) => {
      let catcher = this.partAt(x, y, catches);
      if (catcher) {
        if (exact && this.point.y != catcher.point.y) {
          catcher = undefined;
        }
        return catcher;
      }
    }
    // In exact mode, no need to see which is higher, but we're not always
    // exact.
    let part1 = check(midLeft, top);
    let part2 = check(midRight, top);
    if (!(part1 && part2)) {
      return part1 || part2;
    }
    return part1.point.y > part2.point.y ? part1 : part2;
  }

  getClimbable(leftParts: Array<Part>, rightParts: Array<Part>) {
    let isClimbable = (part: Part) => part.climbable(this) && part != this;
    return leftParts.find(isClimbable) || rightParts.find(isClimbable);
  }

  getClimbableDown() {
    let isClimbable = (part: Part) => part.climbable(this) && part != this;
    let climbableAt = (x: number, y: number) => this.partAt(x, y, isClimbable);
    return climbableAt(midLeft, -1) || climbableAt(midRight, -1);
  }

  getClimbableUp() {
    let isClimbable = (part: Part) => part.climbable(this) && part != this;
    let climbableAt = (x: number, y: number) => this.partAt(x, y, isClimbable);
    return (
      climbableAt(midLeft, 0) || climbableAt(midRight, 0) ||
      // Allow dangling.
      climbableAt(midLeft, top) || climbableAt(midRight, top));
  }

  getBlockerDown(point: Vector2): Blocker | undefined {
    let blockY = (blocker: Part) => blocker.point.y;
    let offX = point.x - this.point.x;
    let blocker1 = this.getSolid(Edge.top, offX, 0);
    let blocker2 = this.getSolid(Edge.top, right + offX, 0);
    let blocker = argmax(blockY, blocker1, blocker2);
    let fixY = point.y;
    if (blocker) {
      fixY = blocker.point.y + Level.tileSize.y;
    } else {
      blocker1 = this.getSolidInside(Edge.bottom, offX, 0, 0, this.move.y);
      blocker2 =
        this.getSolidInside(Edge.bottom, right + offX, 0, 0, this.move.y);
      blocker = argmax(blockY, blocker1, blocker2);
      if (blocker) {
        fixY = blocker.point.y;
      }
    }
    return blocker && {part: blocker, pos: fixY};
  }

  getBlockerLeft(point: Vector2): Blocker | undefined {
    let blockX = (blocker: Part) => blocker.point.x;
    let offY = point.y - this.point.y;
    let blocker1 = this.getSolid(Edge.right, 0, offY);
    let blocker2 = this.getSolid(Edge.right, 0, top + offY);
    let blocker = argmax(blockX, blocker1, blocker2);
    let fixX = point.x;
    if (blocker) {
      fixX = blocker.point.x + Level.tileSize.x;
    } else {
      blocker1 = this.getSolidInside(Edge.left, 0, offY, this.move.x, 0);
      blocker2 = this.getSolidInside(Edge.left, 0, top + offY, this.move.x, 0);
      blocker = argmax(blockX, blocker1, blocker2);
      if (blocker) {
        fixX = blocker.point.x;
      }
    }
    return blocker && {part: blocker, pos: fixX};
  }

  getBlockerRight(point: Vector2): Blocker | undefined {
    let blockX = (blocker: Part) => blocker.point.x;
    let offY = point.y - this.point.y;
    let blocker1 = this.getSolid(Edge.left, right, offY);
    let blocker2 = this.getSolid(Edge.left, right, top + offY);
    let blocker = argmin(blockX, blocker1, blocker2);
    let fixX = point.x;
    if (blocker) {
      fixX = blocker.point.x - Level.tileSize.x;
    } else {
      blocker1 = this.getSolidInside(Edge.right, right, offY, this.move.x, 0);
      blocker2 =
        this.getSolidInside(Edge.right, right, top + offY, this.move.x, 0);
      blocker = argmin(blockX, blocker1, blocker2);
      if (blocker) {
        fixX = blocker.point.x;
      }
    }
    return blocker && {part: blocker, pos: fixX};
  }

  getBlockerUp(point: Vector2): Blocker | undefined {
    let blockY = (blocker: Part) => blocker.point.y;
    let offX = point.x - this.point.x;
    let blocker1 = this.getSolid(Edge.bottom, offX, top);
    let blocker2 = this.getSolid(Edge.bottom, right + offX, top);
    let blocker = argmin(blockY, blocker1, blocker2);
    let fixY = point.y;
    if (blocker) {
      fixY = blocker.point.y - Level.tileSize.y;
    } else {
      blocker1 = this.getSolidInside(Edge.top, offX, top, 0, this.move.y);
      blocker2 =
        this.getSolidInside(Edge.top, right + offX, top, 0, this.move.y);
      blocker = argmin(blockY, blocker1, blocker2);
      if (blocker) {
        fixY = blocker.point.y;
      }
    }
    return blocker && {part: blocker, pos: fixY};
  }

  getSolid(edge: Edge, x: number, y: number, seems?: boolean) {
    let isSolid = (part: Part) => part.solid(this, edge, seems) && part != this;
    return this.partAt(x, y, isSolid);
  }

  getSolidInside(edge: Edge, x: number, y: number, dx: number, dy: number) {
    let isSolid = (part: Part) => part.solidInside(this, edge) && part != this;
    x -= dx;
    y -= dy;
    let solid = this.partAt(x, y, isSolid);
    if (solid) {
      this.workPointExtra.set(x + dx, y + dy).add(this.point);
      if (!solid.contains(this.workPointExtra)) {
        // Moving would put us outside the bounds, so we hit the inside.
        return solid;
      }
    }
    // implied return undefined;
  }

  getSupport(exact?: boolean) {
    // TODO Check which is higher!
    return this.getSurface() || this.getCatcher(exact);
  }

  getSurface(condition?: (part: Part) => boolean, seems?: boolean) {
    if (!condition) {
      condition = part => true;
    }
    let isSurface = (part: Part) =>
      part.surface(this, seems) && part != this && condition!(part);
    // TODO Replace all -1 with -epsilon?
    let part1 = this.partAt(3, -1, isSurface);
    let part2 = this.partAt(midRight, -1, isSurface);
    if (!(part1 && part2)) {
      return part1 || part2;
    }
    return part1.point.y > part2.point.y ? part1 : part2;
  }

  intendedMove = new Vector2();

  processAction(action: RunnerAction) {
    // TODO Let changed keys override old ones.
    // TODO Find all actions (and alignments) before moving, for enemies?
    let {stage} = this.game;
    let {align, move, oldPoint, point, speed, workPoint} = this;
    if (this.phased) {
      action.clear();
      // We get off by one without this.
      this.point.copy(this.phaseEndPoint);
    }
    // Intended move, not actual.
    this.intendedMove.x = action.left ? -1 : action.right ? 1 : 0;
    this.intendedMove.y = action.down ? -1 : action.up ? 1 : 0;
    // Action.
    this.climbing = false;
    oldPoint.copy(point);
    move.setScalar(0);
    let epsilon = 1e-2;
    let leftParts = this.partsNear(3, -1);
    let rightParts = this.partsNear(midRight, -1);
    // Pixel-specific for surfaces, because enemies are moving surfaces.
    let support = this.getSupport();
    let oldCatcher = this.climber ? this.getCatcher(false) : undefined;
    // Unless we get moving climbables (falling ladders?), we can stick to near
    // (same grid position) for climbables.
    let inClimbable =
      this.getClimbable(this.partsNear(3, 0), this.partsNear(midRight, 0)) ||
      // Allow dangling.
      this.getClimbable(this.partsNear(3, top), this.partsNear(midRight, top));
    this.climbing = !!inClimbable;
    // Keep the support the highest thing.
    let climbable = inClimbable || this.getClimbable(leftParts, rightParts);
    if (!this.climber) {
      this.climbing = false;
      climbable = undefined;
    }
    // TODO Why did I have support.point.y < climbable.point.y?
    // if (climbable && (!support || support.point.y < climbable.point.y)) {
    if (climbable && !support) {
      support = climbable;
    }
    if (this.encased()) {
      // This could happen if a brick just enclosed on part of us.
      this.die();
    } else if (support) {
      // Prioritize vertical for enemy ai reasons, also because rarer options.
      // TODO Remember old move options to allow easier transition?
      if (!this.encased(true)) {
        if (climbable || !support.surface(this)) {
          // Now move up or down.
          if (action.down) {
            move.y = -1;
          } else if (action.up && inClimbable) {
            move.y = 1;
          }
        }
        if (!move.y) {
          if (action.left) {
            move.x = -1;
          } else if (action.right) {
            move.x = 1;
          }
        }
      }
    } else {
      move.y = -1;
    }
    // Check for alignment when climbing and falling near climbables.
    let isClimbable = (part: Part) => part.climbable(this) && part != this;
    if (move.y) {
      let checkY = move.y < 0 ? TilePos.bottom : TilePos.top;
      let climbLeft = this.partAt(TilePos.left, checkY, isClimbable);
      let climbRight = this.partAt(TilePos.right, checkY, isClimbable);
      if (climbLeft || climbRight) {
        if (climbLeft && climbRight) {
          if (climbLeft.type != climbRight.type) {
            // Find the closer one, and no need for abs, since we know order.
            if (point.x - climbLeft.point.x < climbRight.point.x - point.x) {
              point.x = climbLeft.point.x;
            } else {
              point.x = climbRight.point.x;
            }
          }
        } else {
          if (climbLeft) {
            if (this.climbing) {
              point.x = climbLeft.point.x;
            } else {
              point.x = climbLeft.point.x + 8;
            }
          } else {
            if (this.climbing) {
              point.x = climbRight!.point.x;
            } else {
              point.x = climbRight!.point.x - 8;
            }
          }
        }
      }
    } else if (move.x) {
      let checkX = move.x < 0 ? TilePos.left : TilePos.right;
      let climbBottom = this.partAt(checkX, TilePos.bottom, isClimbable);
      let climbTop = this.partAt(checkX, TilePos.top, isClimbable);
      if (climbBottom || climbTop) {
        if (climbBottom && climbTop) {
          if (climbBottom.type != climbTop.type) {
            // Find the closer one, and no need for abs, since we know order.
            if (point.y - climbBottom.point.y < climbTop.point.y - point.y) {
              point.y = climbBottom.point.y;
            } else {
              point.y = climbTop.point.y;
            }
          }
        } else {
          // For align to row, we can fall out of climbables, unlike for column
          // alignment.
          // Still, err on the side of climbing with <=.
          if (climbBottom) {
            if (point.y - climbBottom.point.y <= 5) {
              point.y = climbBottom.point.y;
            } else {
              point.y = climbBottom.point.y + 10;
            }
          } else {
            if (climbTop!.point.y - point.y <= 5) {
              point.y = climbTop!.point.y;
            } else {
              point.y = climbTop!.point.y - 10;
            }
          }
        }
      }
    }
    // TODO Add tiny random amounts here so we don't stay aligned?
    // TODO But no randomness so far, right?
    move.multiply(speed);
    this.oldCatcher = oldCatcher;
    // Assign and track supports.
    if (this.support && support != this.support) {
      this.support.trackSupported(this, false);
    }
    this.support = support;
    if (support) {
      support.trackSupported(this, true);
    }
  }

  seesInvisible = false;

  get shootable() {
    return true;
  }

  get shotKillable() {
    return true;
  }

  speed: Vector2;

  support: Part | undefined = undefined;

  take(prize: Prize) {
    // For overriding.
    return false;
  }

  update() {
    // Change player position.
    let {align, move, oldCatcher, oldPoint, point, speed, support} = this;
    if (support) {
      if (support.move.y <= 0) {
        let gap = support.point.y + Level.tileSize.y - point.y;
        if (gap < 0 && speed.y >= -support.move.y) {
          // Try to put us directly on the support.
          move.y = gap;
        }
      }
      if (this.carried) {
        // TODO Allow being carried.
        // TODO This includes attempted but constrained move.
        // TODO How to know final move? Could try a part.moved ...
        // TODO Intermediate constraints???
        // TODO When this was active, a guy could walk toward me in pit.
        // TODO Tried moved now. Does it work?
        let carriedMove = support.moved.x;
        move.x += carriedMove;
        this.carriedMove(carriedMove);
      }
    }
    point.add(move);
    // See if we need to fix things.
    let blockX = (getBlocker: (point: Vector2) => Blocker | undefined) => {
      let blocker = getBlocker(point);
      if (blocker) {
        let oldY = point.y;
        if (blocker.part.point.y - point.y >= 5) {
          // See if we can shift down.
          workPoint.set(point.x, blocker.part.point.y - 10);
          if (!getBlocker(workPoint)) {
            point.y = blocker.part.point.y - 10;
            // TODO Don't cross inside solids, either!
            if (this.encased()) {
              point.y = oldY;
            } else {
              blocker = undefined;
            }
          }
        } else if (point.y - blocker.part.point.y >= 5) {
          // See if we can shift up.
          workPoint.set(point.x, blocker.part.point.y + 10);
          if (!getBlocker(workPoint)) {
            point.y = blocker.part.point.y + 10;
            // TODO Don't cross inside solids, either!
            if (this.encased()) {
              point.y = oldY;
            } else {
              blocker = undefined;
            }
          }
        }
        if (blocker) {
          point.x = blocker.pos;
        }
      }
    }
    let blockY = (getBlocker: (point: Vector2) => Blocker | undefined) => {
      let blocker = getBlocker(point);
      if (blocker) {
        let oldX = point.x;
        if (blocker.part.point.x - point.x >= 4) {
          // See if we can shift left.
          workPoint.set(blocker.part.point.x - 8, point.y);
          if (!getBlocker(workPoint)) {
            point.x = blocker.part.point.x - 8;
            if (this.encased()) {
              point.x = oldX;
            } else {
              blocker = undefined;
            }
          }
        } else if (point.x - blocker.part.point.x >= 4) {
          // See if we can shift right.
          workPoint.set(blocker.part.point.x + 8, point.y);
          if (!getBlocker(workPoint)) {
            point.x  = blocker.part.point.x + 8;
            if (this.encased()) {
              point.x = oldX;
            } else {
              blocker = undefined;
            }
          }
        }
        if (blocker) {
          point.y = blocker.pos;
        }
      }
    }
    if (move.x < 0) {
      blockX(point => this.getBlockerLeft(point));
    } else if (move.x > 0) {
      blockX(point => this.getBlockerRight(point));
    }
    // TODO Align only when forced or to enable movement, not just for grid.
    // TODO Defer this until first pass of all moving parts so we can resolve
    // TODO together?
    // See if we need to align y for solids.
    if (move.y < 0) {
      blockY(point => this.getBlockerDown(point));
      // TODO What below is needed? At least new catcher?
      // TODO It would be nice to fall full off surfaces, even if non-solid and
      // TODO non-climbable, but we don't right now.
      // Surface checks halfway, but solid checks ends.
      // This seems odd, but it usually shouldn't matter, since alignment to
      // open spaces should make them equivalent.
      // I'm not sure if there are times when it will matter, but it's hard to
      // say in those cases what to do anyway.
      let newSupport = support ? undefined : this.getSurface();
      let blocker1 = this.getSolid(Edge.top, 0, 0);
      let blocker2 = this.getSolid(Edge.top, right, 0);
      let blockY2 = (blocker?: Part) =>
        blocker ? blocker.point.y : -Level.tileSize.y;
      if (newSupport || blocker1 || blocker2) {
        let y =
          Math.max(blockY2(newSupport), blockY2(blocker1), blockY2(blocker2));
        point.y = y + Level.tileSize.y;
      } else {
        // TODO Unify catcher and inside bottom solids at all?
        blocker1 = this.getSolidInside(Edge.bottom, 0, 0, 0, move.y);
        blocker2 = this.getSolidInside(Edge.bottom, right, 0, 0, move.y);
        if (blocker1 || blocker2) {
          let y = Math.max(blockY2(blocker1), blockY2(blocker2));
          point.y = y;
        } else if (this.climber) {
          // See if we entered a catcher.
          let newCatcher = this.getCatcher(false);
          if (newCatcher && newCatcher != oldCatcher) {
            point.y = newCatcher.point.y;
          }
        }
      }
    } else if (move.y > 0) {
      blockY(point => this.getBlockerUp(point));
    }
    // Update moved to the actual move, and update the stage.
    this.moved.copy(this.point).sub(oldPoint);
    this.game.stage.moved(this, oldPoint);
    // Update info that doesn't involve moving.
    this.updateInfo();
  }

  updateInfo() {
    this.seesInvisible = false;
    for (let i = -1; i <= 1; ++i) {
      for (let j = -1; j <= 1; ++j) {
        workPoint.set(j, i).addScalar(0.5).multiply(Level.tileSize);
        let invisible =
          this.partAt(workPoint.x, workPoint.y, part => part.type.invisible);
        if (invisible) {
          this.seesInvisible = true;
          break;
        }
      }
    }
  }

  // Move some of these to module global. We're sync, right?
  workPointExtra = new Vector2();

}

function argmax<Item>(
  f: (a: Item) => number, a: Item | undefined, b: Item | undefined
) {
  if (a && b) {
    return f(a) > f(b) ? a : b;
  } else {
    return a || b;
  }
}

function argmin<Item>(
  f: (a: Item) => number, a: Item | undefined, b: Item | undefined
) {
  if (a && b) {
    return f(a) < f(b) ? a : b;
  } else {
    return a || b;
  }
}

let epsilon = 1e-2;

export const TilePos = {
  bottom: epsilon,
  left: epsilon,
  midBottom: 4 + epsilon,
  midLeft: 3 + epsilon,
  midRight: 5 - epsilon,
  midTop: 6 - epsilon,
  right: 8 - epsilon,
  top: 10 - epsilon,
}

let {midBottom, midLeft, midRight, midTop, right, top} = TilePos;

let workPoint = new Vector2();
