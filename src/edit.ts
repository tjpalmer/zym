import {Level, Mode, Part, PointEvent, Stage, Toolbox} from './';
// TODO List parts only in some Toolbox registry or such.
import {Brick, None, Parts} from './parts';
import {Vector2} from 'three';

export class EditMode implements Mode {

  constructor(stage: Stage) {
    this.stage = stage;
    this.toolbox = new Toolbox(document.body, this);
  }

  active = false;

  apply(tilePoint: Vector2) {
    let {level} = this.stage;
    let tool = this.tool;
    if (this.erasing) {
      if (tool == level.tiles.get(tilePoint)) {
        tool = None;
      } else {
        // We only erase those matching our current tool, so get out.
        return;
      }
    }
    level.tiles.set(tilePoint, tool);
    if (tool) {
      // TODO Some static interface to avoid construction?
      new tool().editPlacedAt(this.stage, tilePoint);
    }
    level.updateScene(this.stage);
  }

  erasing = false;

  history = new Array<Level>();

  mouseDown(event: PointEvent) {
    // Mouse down is always in bounds.
    let point = this.tilePoint(event.point)!;
    let {tiles} = this.stage.level;
    let old = tiles.get(point);
    if (this.tool == None) {
      this.erasing = false;
    } else {
      this.erasing = old == this.tool;
    }
    // Copy current before applying changes.
    // TODO What if no changes actually occur?
    this.history.push(this.stage.level.copy());
    if (this.history.length > 100) {
      // Clear out super old.
      this.history.shift();
    }
    // Now changes.
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

  namedTools = new Map(Parts.inventory.map(type => <[string, new () => Part]>[
    type.name.toLowerCase(), type
  ]));

  setToolFromName(name: string) {
    let tool = this.namedTools.get(name);
    if (!tool) {
      console.warn(`No such part: ${name}`);
      tool = None;
    }
    this.tool = tool;
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

  toolbox: Toolbox;

}
