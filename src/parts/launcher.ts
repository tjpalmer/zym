import {Edge, Level, Part, PartType} from '../';
import {Energy, Hero} from '../parts';
import {Vector2} from 'three';

interface LauncherType extends PartType {

  checkAction(hero: Hero): boolean;

  send: Vector2;

}

export abstract class Launcher extends Part {

  choose() {
    // Putting this in choose means hero has to be aligned from previous tick.
    // TODO Or this tick, if already processed?
    let hero = this.game.stage.hero;
    let type = this.type as LauncherType;
    if (hero && type.checkAction(hero)) {
      checkPoint.set(4, 5).add(this.point);
      if (hero.contains(checkPoint)) {
        let {send} = type;
        // Require the direction we're going to align, so we don't just run
        // through.
        step.set(Math.abs(send.x), Math.abs(send.y));
        checkPoint.copy(this.point).multiply(step);
        step.multiply(hero.point);
        if (checkPoint.equals(step)) {
          this.launch(hero, send);
        }
      }
    }
  }

  climbable() {
    return true;
  }

  launch(part: Part, send: Vector2) {
    // Start offset to center of this part.
    checkPoint.copy(Level.tileSize).multiplyScalar(0.5).add(this.point);
    // Step by tiles.
    step.copy(send).multiply(Level.tileSize);
    let energy: Energy | undefined = undefined;
    let target: Part | undefined = undefined;
    let {stage} = this.game;
    while (!target) {
      checkPoint.add(step);
      if (this.outside(checkPoint)) {
        // Also end loop if we leave the stage.
        break;
      }
      energy = stage.partAt(
        checkPoint, part => part instanceof Energy && part.on
      ) as Energy;
      if (energy) {
        // No launching through energy.
        break;
      }
      target = stage.partAt(checkPoint, part => part instanceof Launcher);
    }
    // TODO(tjp): What if no target? Nothing? One tile, far as possible?
    if (target) {
      // Align corners together.
      // checkPoint.sub(step.multiplyScalar(0.5));
      // Prep phase.
      part.phaseBeginTime = stage.time;
      part.phaseEndTime = stage.time + 0.5;
      part.phaseBeginPoint.copy(part.point);
      // And move official location.
      // AI will see the destination already.
      part.point.copy(target.point);
      part.phaseEndPoint.copy(part.point);
    }
  }

  outside(point: Vector2) {
    // Override based on direction.
    return true;
  }

  solidInside(other: Part, edge: Edge) {
    return this.solid(other, edge);
  }

  surface() {
    return true;
  }

}

export class LauncherCenter extends Launcher {

  static char = '@';

  static checkAction(hero: Hero): boolean {
    return false;
  }

  static send = new Vector2();

}

export class LauncherDown extends Launcher {

  static char = 'v';

  static checkAction(hero: Hero): boolean {
    return hero.action.down && hero.actionChange.down;
  }

  outside(point: Vector2) {
    return point.y < 0;
  }

  static send = new Vector2(0, -1);

  solid(other: Part, edge?: Edge) {
    return edge == Edge.bottom;
  }

}

export class LauncherLeft extends Launcher {

  static char = '<';

  static checkAction(hero: Hero): boolean {
    return hero.action.left && hero.actionChange.left;
  }

  outside(point: Vector2) {
    return point.x < 0;
  }

  static send = new Vector2(-1, 0);

  solid(other: Part, edge?: Edge) {
    return edge == Edge.left;
  }

}

export class LauncherRight extends Launcher {

  static char = '>';

  static checkAction(hero: Hero): boolean {
    return hero.action.right && hero.actionChange.right;
  }

  outside(point: Vector2) {
    return point.x > Level.pixelCount.x;
  }

  static send = new Vector2(1, 0);

  solid(other: Part, edge?: Edge) {
    return edge == Edge.right;
  }

}

export class LauncherUp extends Launcher {

  static char = '^';

  static checkAction(hero: Hero): boolean {
    return hero.action.up && hero.actionChange.up;
  }

  outside(point: Vector2) {
    return point.y > Level.pixelCount.y;
  }

  static send = new Vector2(0, 1);

  solid(other: Part, edge?: Edge) {
    return edge == Edge.top;
  }

}

let checkPoint = new Vector2();

let step = new Vector2();
