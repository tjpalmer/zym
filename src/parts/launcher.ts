import {Edge, GenericPartType, Level, Part, PartType} from '../index';
import {Energy, Hero} from '../parts/index';
import {Vector2} from 'three';

interface LauncherType extends PartType {

  checkAction(hero: Hero): boolean;

  send: Vector2;

}

export abstract class Launcher extends Part {

  static get common() {
    return Launcher;
  }

  choose() {
    if (this.dead) {
      return;
    }
    // Putting this in choose means hero has to be aligned from previous tick.
    // TODO Or this tick, if already processed? New step to add in?
    let {hero} = this.game.stage;
    let type = this.type as LauncherType;
    if (hero && type.checkAction(hero) && !(hero.phased || hero.dead)) {
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
        energy.keyTime = stage.time;
        break;
      }
      target = stage.partAt(checkPoint, part =>
        part instanceof Launcher && !part.dead
      );
    }
    // TODO(tjp): What if no target? Nothing? One tile, far as possible?
    if (!target) {
      target = this;
    }
    if (target) {
      target.keyTime = stage.time;
      // Align corners together.
      // checkPoint.sub(step.multiplyScalar(0.5));
      // Prep phase.
      part.phaseBeginTime = stage.time;
      part.phaseEndTime = stage.time + 1;
      part.phaseBeginPoint.copy(part.point);
      // And move official location.
      // AI will see the destination already.
      part.point.copy(target.point);
      part.phaseEndPoint.copy(part.point);
    }
    // TODO If we define supports better, this shouldn't be needed, but here we
    // TODO are.
    if (this.type.breaking) {
      this.die();
      this.active = false;
      this.game.stage.removed(this);
    }
  }

  outside(point: Vector2) {
    // Override based on direction.
    return true;
  }

  get shootable() {
    return true;
  }

  get shotKillable() {
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
    return edge == Edge.bottom && !this.dead;
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
    return edge == Edge.left && !this.dead;
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
    return edge == Edge.right && !this.dead;
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
    return edge == Edge.top && !this.dead;
  }

}

let checkPoint = new Vector2();

let step = new Vector2();
