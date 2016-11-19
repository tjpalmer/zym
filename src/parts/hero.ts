import {None} from './';
import {Edge, Level, Part, Game} from '../';
import {Vector2} from 'three';

export class Hero extends Part {

  static char = 'R';

  align = new Vector2();

  encased() {
    return (
      this.partsNear(0, 0).some(part => part.solid()) ||
      this.partsNear(0, 9).some(part => part.solid()) ||
      this.partsNear(7, 0).some(part => part.solid()) ||
      this.partsNear(7, 9).some(part => part.solid())
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

  findAlign(edge: Edge, minParts: Array<Part>, maxParts: Array<Part>) {
    // Find where an opening is, so we can align to that.
    if (!minParts.some(part => part.solid(edge))) {
      return -1;
    }
    if (!maxParts.some(part => part.solid(edge))) {
      return 1;
    }
    return 0;
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

  // TODO Switch to using this once we have moving supports (enemies).
  partAt(x: number, y: number, keep: (part: Part) => boolean) {
    return (
      this.game.stage.partAt(this.workPoint.set(x, y).add(this.point), keep));    
  }

  partsNear(x: number, y: number) {
    return this.game.stage.partsNear(this.workPoint.set(x, y).add(this.point));    
  }

  tick() {
    // TODO Let changed keys override old ones.
    // TODO Find all actions (and alignments) before moving, for enemies?
    let {control, stage} = this.game;
    let {move, oldPoint, point, workPoint} = this;
    oldPoint.copy(point);
    move.setScalar(0);
    let leftParts = this.partsNear(3, -1);
    let rightParts = this.partsNear(4, -1);
    let support = this.getSurface(leftParts, rightParts);
    let inClimbable =
      this.getClimbable(this.partsNear(3, 0), this.partsNear(4, 0)) ||
      // Allow dangling.
      this.getClimbable(this.partsNear(3, 7), this.partsNear(4, 7));
    let climbable = this.getClimbable(leftParts, rightParts) || inClimbable;
    if (!support) {
      support = climbable;
    }
    if (this.encased()) {
      // This could happen if a brick just enclosed on part of us.
      // TODO Die.
    } else if (support) {
      // TODO Remember old move options to allow easier transition?
      let wallEdge: Edge;
      if (control.left) {
        move.x = -1;
        wallEdge = Edge.right;
      } else if (control.right) {
        move.x = 1;
        wallEdge = Edge.left;
      } else if (climbable) {
        // Now move up or down.
        if (control.down) {
          move.y = -1;
        } else if (control.up && inClimbable) {
          move.y = 1;
        }
      }
      let wallDown =
        this.partsNear(move.x, 3).find(part => part.solid(wallEdge));
      let wallUp = this.partsNear(move.x, 4).find(part => part.solid(wallEdge));
    } else {
      move.y = -1;
    }
    // Align non-moving direction.
    // TODO Except when all on same climbable or none?
    let align = this.align.setScalar(0);
    if (move.x < 0) {
      align.y = this.findAlign(
        Edge.right, this.partsNear(-1, 4), this.partsNear(-1, 5),
      );
    } else if (move.x > 0) {
      align.y =
        this.findAlign(Edge.left, this.partsNear(8, 4), this.partsNear(8, 5));
    } else if (move.y < 0) {
      align.x = this.findAlign(Edge.top, leftParts, rightParts);
    } else if (move.y > 0) {
      align.x = this.findAlign(
        Edge.bottom, this.partsNear(3, 10), this.partsNear(4, 10),
      );
    }
    // move.multiplyScalar(2);
    // Change player position.
    point.add(move);
    // See if we need to fix things.
    // TODO Defer this until first pass of all moving parts so we can resolve
    // TODO together?
    if (!align.x) {
      // See if we need to align x for solids.
      // TODO If openings partially above or below, move and align y!
      if (move.x < 0) {
        if (
          this.partsNear(0, 0).some(part => part.solid(Edge.right)) ||
          this.partsNear(0, 9).some(part => part.solid(Edge.right))
        ) {
          align.x = 1;
        }
      } else if (move.x > 0) {
        if (
          this.partsNear(7, 0).some(part => part.solid(Edge.left)) ||
          this.partsNear(7, 9).some(part => part.solid(Edge.left))
        ) {
          align.x = -1;
        }
      }
    }
    if (!align.y) {
      // See if we need to align y for solids.
      if (move.y < 0) {
        let newSupport =
          this.getSurface(this.partsNear(3, -1), this.partsNear(4, -1));
        if (newSupport && !support) {
          // For landing on ladder. TODO Bars.
          align.y = 1;
        } else if (
          this.partsNear(0, 0).some(part => part.solid(Edge.top)) ||
          this.partsNear(7, 0).some(part => part.solid(Edge.top))
        ) {
          align.y = 1;
        }
      } else if (move.y > 0) {
        if (
          this.partsNear(0, 9).some(part => part.solid(Edge.bottom)) ||
          this.partsNear(7, 9).some(part => part.solid(Edge.bottom))
        ) {
          align.y = -1;
        }
      }
    }
    if (align.x) {
      let offset = align.x < 0 ? 3 : 4;
      point.x =
        Level.tileSize.x * Math.floor((point.x + offset) / Level.tileSize.x);
    }
    if (align.y) {
      let offset = align.y < 0 ? 4 : 5;
      point.y =
        Level.tileSize.y * Math.floor((point.y + offset) / Level.tileSize.y);
    }
    stage.moved(this, oldPoint);
  }

  workPoint = new Vector2();

}
