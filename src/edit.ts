import {Level, Mode, Part, PartType, PointEvent, Stage, Toolbox} from './';
import {None, Parts} from './parts';
import {Vector2} from 'three';

export class EditMode implements Mode {

  constructor(stage: Stage) {
    let {body} = document;
    this.stage = stage;
    this.toolbox = new Toolbox(body, this);
    // Buttons.
    let panel = body.querySelector('.panel.commands');
    panel.querySelector('.redo').addEventListener('click', () => this.redo());
    panel.querySelector('.undo').addEventListener('click', () => this.undo());
    // Initial history entry.
    this.pushHistory();
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
    // TODO Push history after edit, not before!
    level.updateScene(this.stage);
  }

  erasing = false;

  history = new Array<Level>();

  historyIndex = -1;

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
    // console.log('mouseUp', event);
    this.active = false;
    // TODO Push history only when changes when any click, up, or down anywhere?
    this.pushHistory();
  }

  namedTools = new Map(Parts.inventory.map(type => <[string, PartType]>[
    type.name.toLowerCase(), type
  ]));

  pushHistory() {
    // TODO Check for actual changes here? Or record as changes happen?
    if (
      this.history.length &&
      this.stage.level.equals(this.history[this.historyIndex])
    ) {
      // Nothing changed. Stay put.
      return;
    }
    // Delete anything after our current position.
    this.history.splice(this.historyIndex + 1, this.history.length);
    // Add the new.
    this.history.push(this.stage.level.copy());
    this.historyIndex += 1;
    // Clear out super old, though it's hard to believe we'll blow out ram.
    if (this.history.length > 100) {
      this.history.shift();
      this.historyIndex -= 1;
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex += 1;
      this.stage.level = this.history[this.historyIndex].copy();
      this.stage.level.updateScene(this.stage);
    }
  }

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

  // Default gets set from HTML settings.
  tool: PartType;

  toolbox: Toolbox;

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex -= 1;
      this.stage.level = this.history[this.historyIndex].copy();
      this.stage.level.updateScene(this.stage);
    }
  }

}
