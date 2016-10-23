import {Level, Mode, Part, PointEvent, Stage} from './';
// TODO List parts only in some Toolbox registry or such.
import {Brick, None} from './parts';
import {Vector2} from 'three';

export class EditMode implements Mode {

  constructor(stage: Stage) {
    this.stage = stage;
  }

  active = false;

  mouseDown(event: PointEvent) {
    let point = this.tilePoint(event.point);
    let {tiles} = this.stage.level;
    let old = tiles.get(point);
    if (old == Brick) {
      this.tool = None;
    } else {
      this.tool = Brick;
    }
    tiles.set(point, this.tool);
    this.active = true;
    // console.log('mouseDown', point);
  }

  mouseMove(event: PointEvent) {
    let point = this.tilePoint(event.point);
    let {tiles} = this.stage.level;
    if (this.active) {
      tiles.set(point, this.tool);
    }
    // console.log('mouseMove', event.point);
  }

  mouseUp(event: PointEvent) {
    this.active = false;
    // console.log('mouseUp', event);
  }

  stage: Stage;

  tilePoint(stagePoint: Vector2) {
    return stagePoint.clone().divide(Level.tileSize).floor();
  }

  tool: new () => Part = Brick;

}
