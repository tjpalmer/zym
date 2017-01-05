import {Edge, Part, PartType} from '../';
import {Hero} from '../parts';
import {Vector2} from 'three';

interface LauncherType extends PartType {

  checkAction(hero: Hero): boolean;

  send: Vector2;

}

export abstract class Launcher extends Part {

  choose() {
    // Putting this in choose means hero has to be aligned from previous tick.
    let hero = this.game.stage.hero;
    let type = this.type as LauncherType;
    if (hero && type.checkAction(hero) && hero.point.equals(this.point)) {
      console.log('Send', type.send);
    }
  }

  climbable() {
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

  static send = new Vector2(0, 1);

  solid(other: Part, edge?: Edge) {
    return edge == Edge.top;
  }

}
