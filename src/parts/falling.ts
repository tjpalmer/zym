import {Part, PartType} from '../index';
import {Vector2} from 'three';

export const Falling = (optionClass: PartType) =>
// Can't call the class itself `Falling`, because the UI ends up thinking it
// should add rendered blocks to the buttons on screen.
class FallingPart extends optionClass {

  kicker: Part | undefined = undefined;

  choose() {
    if (!this.exists) return;
    super.choose();
    if (this.kicker) {
      // Faster than normal falling, slower than fast falling.
      // So a fast fall should be able to land on and move off.
      // TODO Fix physics of runner intersection.
      // TODO I've seen falling faster than a falling part kill the player.
      let speed = 1.1;
      this.move.set(0, speed);
      // Check collision.
      // I haven't seen issues with colliding into other fallings.
      // Perhaps that has to do with construction order.
      let stopper = this.partAt(4, -speed, part => part.type.options.falling);
      if (stopper) {
        speed = this.point.y - stopper.point.y - 10;
        this.kicker = undefined;
      }
      // Move.
      workPoint.copy(this.point);
      this.point.y -= speed;
      this.game.stage.moved(this, workPoint);
    }
  }

  supportedGone(oldSupported: Part) {
    super.supportedGone(oldSupported);
    if (!this.kicker) {
      let {y} = this.point;
      let {stage} = this.game;
      // Mark this one kicked.
      this.kicker = this;
      // Mark all beneath as kicked, too.
      workPoint.set(4, 5).add(this.point);
      while (workPoint.y >= 0) {
        y -= 10;
        workPoint.y -= 10;
        let next = stage.partAt(workPoint, part => part.type.falling);
        if (!next) break;
        if (Math.abs(y - next.point.y) > 0.5) break;
        // Close enough to call them touching.
        (next as FallingPart).kicker = this;
      }
    }
  }

};

let workPoint = new Vector2();
