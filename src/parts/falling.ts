import {Runner} from './index';
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

  spanGroup(handler: (part: FallingPart) => boolean | void) {
    if (this.spanHalf(10, handler)) return true;
    if (this.spanHalf(-10, handler)) return true;
  }

  spanHalf(step: number, handler: (part: FallingPart) => boolean | void) {
    let {y} = this.point;
    let {stage} = this.game;
    // Search to see if someone's still in this group.
    let someSupported = false;
    workPoint.set(4, 5).add(this.point);
    while (workPoint.y < stage.pixelBounds.max.y) {
      y += step;
      workPoint.y += step;
      let next = stage.partAt(workPoint, part => part.type.falling);
      if (!next) break;
      if (Math.abs(y - next.point.y) > 0.5) break;
      // Close enough to call them touching.
      if (handler(next as FallingPart)) {
        return true;
      }
    }
  }

  supportedGone(oldSupported: Runner) {
    super.supportedGone(oldSupported);
    if (!this.kicker) {
      let {y} = this.point;
      let {stage} = this.game;
      // Search to see if someone's still in this group.
      if (this.spanGroup(part => !!part.supported)) {
        // Yep, so don't fall yet.
        return;
      }
      // Mark this one kicked.
      this.kicker = this;
      // Mark all in group as kicked, too.
      this.spanGroup(part => {
        part.kicker = this;
      });
    }
  }

};

let workPoint = new Vector2();
