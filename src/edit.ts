import {Level, Mode, Part, PointEvent, Stage} from './';
// TODO List parts only in some Toolbox registry or such.
import {Brick, None} from './parts';
import {Vector2} from 'three';

export class EditMode implements Mode {

  constructor(stage: Stage) {
    this.stage = stage;
  }

  active = false;

  apply(tilePoint: Vector2) {
    this.stage.level.tiles.set(tilePoint, this.tool);
    this.stage.level.updateScene(this.stage);
  }

  mouseDown(event: PointEvent) {
    // Mouse down is always in bounds.
    let point = this.tilePoint(event.point)!;
    let {tiles} = this.stage.level;
    let old = tiles.get(point);
    if (old == Brick) {
      this.tool = None;
    } else {
      this.tool = Brick;
    }
    this.apply(point);
    this.active = true;
    // console.log('mouseDown', point);
  }

  mouseMove(event: PointEvent) {
    let point = this.tilePoint(event.point);
    if (!point) {
      // Move and up can be out of bounds.
      return;
    }
    let {tiles} = this.stage.level;
    if (this.active) {
      this.apply(point);
    }
    // console.log('mouseMove', event.point);
  }

  mouseUp(event: PointEvent) {
    this.active = false;
    // console.log('mouseUp', event);
  }

  stage: Stage;

  tilePoint(stagePoint: Vector2) {
    let point = stagePoint.clone().divide(Level.tileSize).floor();
    if (point.x < 0 || point.x >= Level.tileCount.x) {
      return;
    }
    if (point.y < 0 || point.y >= Level.tileCount.y) {
      return;
    }
    return point;
  }

  tool: new () => Part = Brick;

}
