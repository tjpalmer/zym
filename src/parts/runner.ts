import {None, Prize} from './';
import {Edge, Game, Level, Part, RunnerAction} from '../';
import {Vector2} from 'three';

export class Runner extends Part {

  align = new Vector2();

  alignToPassageIfNeeded() {
    return;
    // This aligns with the passage just for appearances, say to avoid hanging
    // off a ladder on climbing up or down.
    // Other alignment is needed elsewhere to avoid blockers.
    // At most one of move.x or move.y should be nonzero at this point.
    let {align, move, passage, point} = this;
    if (!(move.x || move.y)) {
      // No alignment if no moving.
      return;
    }
    if (passage) {
      if (move.x) {
        // Horizontal movement.
        let middle = this.partAt(4, 5, part => part == passage);
        if (!middle) {
          // Mostly out of a climbable, so shouldn't stay inside it.
          align.y = 1;
        } else {
          // See if we're off the edge elsewise.
        }
      } else {
        // Vertical movement.
      }
    } else {
      // Moving through None.
    }
  }

  carriedMove(x: number) {}

  climber = true;

  climbing = false;

  encased() {
    let touchKills = (part: Part) => part.touchKills(this) && part != this;
    return (
      this.partsAt(0, 0).some(touchKills) ||
      this.partsAt(0, top).some(touchKills) ||
      this.partsAt(right, 0).some(touchKills) ||
      this.partsAt(right, top).some(touchKills)
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
    let part1 = check(3, top);
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

  // The passage is what it's moving through: empty space, climbable, or bar.
  passage: Part | undefined = undefined;

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
    if (climbable && (!support || support.point.y < climbable.point.y)) {
      support = climbable;
    }
    // TODO Remember catcher from before instead of recalculating?
    let passage: Part | undefined = this.getCatcher();
    if (this.encased()) {
      // This could happen if a brick just enclosed on part of us.
      this.die();
    } else if (support) {
      // Prioritize vertical for enemy ai reasons, also because rarer options.
      // TODO Remember old move options to allow easier transition?
      if (climbable || !support.surface(this)) {
        // Now move up or down.
        if (action.down) {
          move.y = -1;
          // This might be undefined, and that's okay.
          passage = climbable;
        } else if (action.up && inClimbable) {
          move.y = 1;
          passage = inClimbable;
        }
      }
      if (!move.y) {
        if (action.left) {
          move.x = -1;
        } else if (action.right) {
          move.x = 1;
        }
      }
    } else {
      move.y = -1;
    }
    // Align non-moving direction.
    // TODO Make this actually change the move. Nix the align var. <- ???
    // TODO Because of alignment to moving things? Or just not needed?
    align.setScalar(0);
    // Prioritize y because y move options are rarer.
    if (move.y) {
      if (climbable) {
        // Generalize alignment to whatever provides passage.
        // align.x = Math.sign(climbable.point.x - point.x);
        if (climbable.point.x < point.x) {
          // Check if left side in climbable of same type.
        } else {
          // Check if right side in climbable of same type.
        }
      }
      // if (move.y < 0) {
      //   align.x = this.findAlign(Edge.top, leftParts, rightParts);
      // } else if (move.y > 0) {
      //   align.x = this.findAlign(
      //     Edge.bottom, this.partsNear(3, 10), this.partsNear(midRight, 10),
      //   );
      // }
    // } else if (move.x < 0) {
    //   align.y = this.findAlign(
    //     Edge.right, this.partsNear(-1, 4), this.partsNear(-1, midTop),
    //   );
    // } else if (move.x > 0) {
    //   align.y = this.findAlign(
    //     Edge.left, this.partsNear(8, 4), this.partsNear(8, midTop)
    //   );
    }
    move.multiply(speed);
    this.oldCatcher = oldCatcher;
    this.passage = passage;
    this.support = support;
  }

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
    this.alignToPassageIfNeeded();
    // TODO Defer this until first pass of all moving parts so we can resolve
    // TODO together?
    if (!align.x) {
      // See if we need to align x for solids.
      // TODO If openings partially above or below, move and align y!
      if (move.x < 0) {
        let blocker1 = this.getSolid(Edge.right, 0, 0);
        let blocker2 = this.getSolid(Edge.right, 0, top);
        let blockX = (blocker?: Part) =>
          blocker ? blocker.point.x : -Level.tileSize.x;
        if (blocker1 || blocker2) {
          let x = Math.max(blockX(blocker1), blockX(blocker2));
          point.x = x + Level.tileSize.x;
        } else {
          blocker1 = this.getSolidInside(Edge.left, 0, 0, move.x, 0);
          blocker2 = this.getSolidInside(Edge.left, 0, top, move.x, 0);
          if (blocker1 || blocker2) {
            let x = Math.max(blockX(blocker1), blockX(blocker2));
            point.x = x;
          }
        }
      } else if (move.x > 0) {
        let blocker1 = this.getSolid(Edge.left, right, 0);
        let blocker2 = this.getSolid(Edge.left, right, top);
        let blockX = (blocker?: Part) =>
          blocker ? blocker.point.x : Level.pixelCount.x;
        if (blocker1 || blocker2) {
          let x = Math.min(blockX(blocker1), blockX(blocker2));
          point.x = x - Level.tileSize.x;
        } else {
          blocker1 = this.getSolidInside(Edge.right, right, 0, move.x, 0);
          blocker2 = this.getSolidInside(Edge.right, right, top, move.x, 0);
          if (blocker1 || blocker2) {
            let x = Math.min(blockX(blocker1), blockX(blocker2));
            point.x = x;
          }
        }
      }
    }
    if (!align.y) {
      // See if we need to align y for solids.
      if (move.y < 0) {
        // Surface checks halfway, but solid checks ends.
        // This seems odd, but it usually shouldn't matter, since alignment to
        // open spaces should make them equivalent.
        // I'm not sure if there are times when it will matter, but it's hard to
        // say in those cases what to do anyway.
        let newSupport = support ? undefined : this.getSurface();
        let blocker1 = this.getSolid(Edge.top, 0, 0);
        let blocker2 = this.getSolid(Edge.top, right, 0);
        let blockY = (blocker?: Part) =>
          blocker ? blocker.point.y : -Level.tileSize.y;
        if (newSupport || blocker1 || blocker2) {
          let y =
            Math.max(blockY(newSupport), blockY(blocker1), blockY(blocker2));
          point.y = y + Level.tileSize.y;
        } else {
          // TODO Unify catcher and inside bottom solids at all?
          blocker1 = this.getSolidInside(Edge.bottom, 0, 0, 0, move.y);
          blocker2 = this.getSolidInside(Edge.bottom, right, 0, 0, move.y);
          if (blocker1 || blocker2) {
            let y = Math.max(blockY(blocker1), blockY(blocker2));
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
        let blocker1 = this.getSolid(Edge.bottom, 0, top);
        let blocker2 = this.getSolid(Edge.bottom, right, top);
        let blockY = (blocker?: Part) =>
          blocker ? blocker.point.y : Level.pixelCount.y;
        if (blocker1 || blocker2) {
          let y = Math.min(blockY(blocker1), blockY(blocker2));
          point.y = y - Level.tileSize.y;
        } else {
          blocker1 = this.getSolidInside(Edge.top, 0, top, 0, move.y);
          blocker2 = this.getSolidInside(Edge.top, right, top, 0, move.y);
          if (blocker1 || blocker2) {
            let y = Math.min(blockY(blocker1), blockY(blocker2));
            point.y = y;
          }
        }
      }
    }
    // TODO Align to blocker, not grid!!!
    if (align.x) {
      let offset = align.x < 0 ? 3 : midRight;
      point.x =
        Level.tileSize.x * Math.floor((point.x + offset) / Level.tileSize.x);
    }
    if (align.y) {
      let offset = align.y < 0 ? 4 : midTop;
      point.y =
        Level.tileSize.y * Math.floor((point.y + offset) / Level.tileSize.y);
    }
    // Update moved to the actual move, and update the stage.
    this.moved.copy(this.point).sub(oldPoint);
    this.game.stage.moved(this, oldPoint);
  }

  // Move some of these to module global. We're sync, right?
  workPointExtra = new Vector2();

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
