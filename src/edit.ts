import {Level, Mode, Part, PointEvent, Stage} from './';
// TODO List parts only in some Toolbox registry or such.
import {Brick} from './parts';

export class EditMode implements Mode {

  constructor(stage: Stage) {
    this.stage = stage;
  }

  mouseDown(event: PointEvent) {
    let point = event.point.clone().divide(Level.tileSize).floor();
    let {tiles} = this.stage.level;
    let old = tiles.get(point);
    let $new: Part | undefined;
    if (old instanceof Brick) {
      $new = undefined;
    } else {
      $new = new Brick();
    }
    tiles.set(point, $new);
    // this.stage.update();
    console.log('mouseDown', point);
  }

  mouseMove(event: PointEvent) {
    // console.log('mouseMove', event);
  }

  mouseUp(event: PointEvent) {
    // console.log('mouseUp', event);
  }

  stage: Stage;

}
