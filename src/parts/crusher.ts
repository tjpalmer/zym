import {Edge, Level, Part, PartType} from '../index';
import {Vector2} from 'three';
const {abs} = Math;

export class Crusher extends Part {

  static char = 'n';

  static options = {
    breaking: false,
    ender: true,
    falling: false,
    invisible: true,
  };

  checkY = 0;

  choose() {
    if (!this.exists) {
      return;
    }
    let {stage} = this.game;
    this.handleHit();
    // TODO Better stacking of multiple?
    let other = this.partAt(4, 4, part => part.moved.y < 0);
    if (other) {
      if (Math.abs(other.point.y - (this.point.y + 4)) <= 1) {
        this.hit = true;
      }
      this.handleHit();
      if (this.hit) {
        if (abs(other.point.y - (this.point.y + 1)) <= 0.5) {
          this.move.set(0, other.moved.y);
          workPoint.copy(this.point);
          this.point.y += other.moved.y;
          stage.moved(this, workPoint);
        }
      }
    }
  }

  handleHit() {
    let {stage} = this.game;
    if (this.hit) {
      let part: Part | undefined;
      if (this.hitType) {
        part = this.partAt(4, -1, part => part.type == this.hitType);
      } else {
        part = this.partAt(
          4, -1, part => part.substantial && !(part instanceof Crusher),
        );
      }
      if (part) {
        this.hitType = part.type;
        this.checkY = part.point.y;
        part.die();
        part.active = false;
        stage.removed(part);
      } else if (this.hitType && abs(this.point.y - this.checkY) <= 0.7) {
        this.active = false;
        stage.removed(this);
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
