import {Edge, Level, Part, PartType} from '../';
import {Vector2} from 'three';

export class Crusher extends Part {

  static char = 'n';

  checkY = 0;

  choose() {
    if (!this.exists) {
      return;
    }
    let {stage} = this.game;
    let {hero} = stage;
    if (hero && hero.moved.y < 0) {
      workPoint.copy(Level.tileSize).divideScalar(2).add(this.point);
      if (hero.contains(workPoint)) {
        if (Math.abs(hero.point.y - (this.point.y + 4)) <= 1) {
          this.hit = true;
        }
        if (this.hit) {
          let part: Part | undefined;
          if (this.hitType) {
            part = this.partAt(4, -1, part => part.type == this.hitType);
          } else {
            part = this.partAt(4, -1, part => part.surface(hero!));
          }
          if (part) {
            this.hitType = part.type;
            this.checkY = part.point.y;
            part.die();
            part.active = false;
            stage.removed(part);
          } else if (this.hitType && this.point.y <= this.checkY) {
            this.active = false;
            stage.removed(this);
          }
          if (Math.abs(hero.point.y - (this.point.y + 1)) <= 0.5) {
            this.move.set(0, hero.moved.y);
            workPoint.copy(this.point);
            this.point.y += hero.moved.y;
            stage.moved(this, workPoint);
          }
        }
      }
    }
  }

  hit = false;

  hitType?: PartType = undefined;

  solidInside(other: Part, edge: Edge) {
    // Solid bottom is preventing walking out the sides at the moment.
    return false;
    // return edge == Edge.bottom && this.hit;
  }

}

let workPoint = new Vector2();
