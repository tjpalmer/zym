import {Edge, Part} from '../';

export class Launcher extends Part {

  climbable() {
    return true;
  }

  surface() {
    return true;
  }

}

export class LauncherCenter extends Launcher {

  static char = '@';

}

export class LauncherDown extends Launcher {

  static char = 'v';

  solid(other: Part, edge?: Edge) {
    return edge == Edge.bottom;
  }

}

export class LauncherLeft extends Launcher {

  static char = '<';

  solid(other: Part, edge?: Edge) {
    return edge == Edge.left;
  }

}

export class LauncherRight extends Launcher {

  static char = '>';

  solid(other: Part, edge?: Edge) {
    return edge == Edge.right;
  }

}

export class LauncherUp extends Launcher {

  static char = '^';

  solid(other: Part, edge?: Edge) {
    return edge == Edge.top;
  }

}
