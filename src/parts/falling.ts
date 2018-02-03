import {Part, PartType} from '../index';
import {Vector2} from 'three';

export function makeFallingClass(optionClass: PartType) {

  class Falling extends optionClass {

    kicker: Part | undefined = undefined;

    choose() {
      if (!this.exists) return;
      if (this.kicker) {
        // Faster than normal falling, slower than fast falling.
        // So a fast fall should be able to land on and move off.
        // TODO Fix physics of runner intersection.
        let speed = 1.1;
        this.move.set(0, speed);
        // TODO Check collisions.
        workPoint.copy(this.point);
        this.point.y -= speed;
        this.game.stage.moved(this, workPoint);
      }
    }

    supportedGone(oldSupported: Part) {
      if (!this.kicker) {
        let {y} = this.point;
        let {stage} = this.game;
        this.kicker = this;
        // TODO Mark all beneath as loose.
        workPoint.set(4, 5).add(this.point);
        while (workPoint.y >= 0) {
          y -= 10;
          workPoint.y -= 10;
          let next = stage.partAt(workPoint, part => part.type.falling);
          if (!next) break;
          if (Math.abs(y - next.point.y) > 0.5) break;
          // Close enough to call them touching.
          (next as Falling).kicker = this;
        }
      }
    }
  }

  return Falling;
}

let workPoint = new Vector2();
