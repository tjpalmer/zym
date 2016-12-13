import {None} from './';
import {Edge, Game, Level, Part, RunnerAction} from '../';
import {Vector2} from 'three';

export class Runner extends Part {

  align = new Vector2();

  encased() {
    let isSolid = (part: Part) => part.solid(this) && part != this;
    return (
      this.partsAt(0, 0).some(isSolid) ||
      this.partsAt(0, top).some(isSolid) ||
      this.partsAt(right, 0).some(isSolid) ||
      this.partsAt(right, top).some(isSolid)
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
    let isClimbable = (part: Part) => part.climbable && part != this;
    return leftParts.find(isClimbable) || rightParts.find(isClimbable);
  }

  getClimbableDown() {
    let isClimbable = (part: Part) => part.climbable && part != this;
    let climbableAt = (x: number, y: number) => this.partAt(x, y, isClimbable);
    return climbableAt(midLeft, -1) || climbableAt(midRight, -1);
  }

  getClimbableUp() {
    let isClimbable = (part: Part) => part.climbable && part != this;
    let climbableAt = (x: number, y: number) => this.partAt(x, y, isClimbable);
    return (
      climbableAt(midLeft, 0) || climbableAt(midRight, 0) ||
      // Allow dangling.
      climbableAt(midLeft, top) || climbableAt(midRight, top));
  }

  getSolid(edge: Edge, x: number, y: number) {
    let isSolid = (part: Part) => part.solid(this, edge) && part != this;
    return this.partAt(x, y, isSolid);
  }

  getSupport(exact?: boolean) {
    // TODO Check which is higher!
    return this.getSurface() || this.getCatcher(exact);
  }

  getSurface(condition?: (part: Part) => boolean) {
    if (!condition) {
      condition = part => true;
    }
    let isSurface = (part: Part) =>
      part.surface && part != this && condition!(part);
    let part1 = this.partAt(3, -1, isSurface);
    let part2 = this.partAt(midRight, -1, isSurface);
    if (!(part1 && part2)) {
      return part1 || part2;
    }
    return part1.point.y > part2.point.y ? part1 : part2;
  }

  // TODO Switch to using this once we have moving supports (enemies)!!
  partAt(x: number, y: number, keep: (part: Part) => boolean) {
    return (
      this.game.stage.partAt(this.workPoint.set(x, y).add(this.point), keep));    
  }

  // TODO Switch to using this once we have moving supports (enemies)!!
  partsAt(x: number, y: number) {
    return (
      this.game.stage.partsAt(this.workPoint.set(x, y).add(this.point)));    
  }

  partsNear(x: number, y: number) {
    return (
      this.game.stage.partsNear(this.workPoint.set(x, y).add(this.point)) ||
      []);    
  }

  processAction(action: RunnerAction) {
    // TODO Let changed keys override old ones.
    // TODO Find all actions (and alignments) before moving, for enemies?
    let {stage} = this.game;
    let {align, move, oldPoint, point, workPoint} = this;
    oldPoint.copy(point);
    move.setScalar(0);
    let epsilon = 1e-2;
    let leftParts = this.partsNear(3, -1);
    let rightParts = this.partsNear(midRight, -1);
    // Pixel-specific for surfaces, because enemies are moving surfaces.
    // TODO If a support moves, it should move the supported thing, too.
    let support = this.getSupport();
    let oldCatcher = this.getCatcher(false);
    // Unless we get moving climbables (falling ladders?), we can stick to near
    // (same grid position) for climbables.
    let inClimbable =
      this.getClimbable(this.partsNear(3, 0), this.partsNear(midRight, 0)) ||
      // Allow dangling.
      this.getClimbable(this.partsNear(3, top), this.partsNear(midRight, top));
    let climbable = this.getClimbable(leftParts, rightParts) || inClimbable;
    if (!support) {
      support = climbable;
    }
    if (this.encased()) {
      // This could happen if a brick just enclosed on part of us.
      // TODO Die.
    } else if (support) {
      let wallEdge: Edge;
      // Prioritize vertical for enemy ai reasons, also because rarer options.
      // TODO Remember old move options to allow easier transition?
      if (climbable || !support.surface) {
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
          wallEdge = Edge.right;
        } else if (action.right) {
          move.x = 1;
          wallEdge = Edge.left;
        }
      }
    } else {
      move.y = -1;
    }
    // Align non-moving direction.
    // TODO Make this actually change the move. Nix the align var.
    // TODO Except when all on same climbable or none?
    align.setScalar(0);
    // Prioritize y because y move options are rarer.
    if (move.y) {
      if (climbable) {
        // Generalize alignment to whatever provides passage.
        align.x = Math.sign(climbable.point.x - point.x);
      } else if (move.y < 0) {
        align.x = this.findAlign(Edge.top, leftParts, rightParts);
      } else if (move.y > 0) {
        align.x = this.findAlign(
          Edge.bottom, this.partsNear(3, 10), this.partsNear(midRight, 10),
        );
      }
    } else if (move.x < 0) {
      align.y = this.findAlign(
        Edge.right, this.partsNear(-1, 4), this.partsNear(-1, midTop),
      );
    } else if (move.x > 0) {
      align.y = this.findAlign(
        Edge.left, this.partsNear(8, 4), this.partsNear(8, midTop)
      );
    }
    move.multiplyScalar(this.speed);
    this.oldCatcher = oldCatcher;
    this.support = support;
  }

  speed: number;

  support: Part | undefined = undefined;

  update() {
    // Change player position.
    let {align, move, oldCatcher, oldPoint, point, support} = this;
    if (support) {
      if (support.move.y < 0) {
        // Speeds could be different, but for now this helps to fall with
        // a support.
        // TODO Reassess how to handle this?
        move.y = support.move.y;
      }
      // Allow being carried.
      // TODO This includes attempted but constrained move.
      // TODO How to know final move?
      // TODO Intermediate constraints???
      move.x += support.move.x;
    }
    point.add(move);
    // See if we need to fix things.
    // TODO Align only when forced or to enable movement, not just for grid.
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
        }
      } else if (move.x > 0) {
        let blocker1 = this.getSolid(Edge.left, right, 0);
        let blocker2 = this.getSolid(Edge.left, right, top);
        let blockX = (blocker?: Part) =>
          blocker ? blocker.point.x : Level.pixelCount.x;
        if (blocker1 || blocker2) {
          let x = Math.min(blockX(blocker1), blockX(blocker2));
          point.x = x - Level.tileSize.x;
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
          // See if we entered a catcher.
          let newCatcher = this.getCatcher(false);
          if (newCatcher && newCatcher != oldCatcher) {
            point.y = newCatcher.point.y;
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
    this.game.stage.moved(this, oldPoint);
  }

  workPoint = new Vector2();

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
