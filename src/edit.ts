import {Level, Mode, Part, PartType, PointEvent, Stage, Toolbox} from './';
import {None, Parts} from './parts';
import {Vector2} from 'three';

export class EditMode implements Mode {

  constructor(stage: Stage) {
    let {body} = document;
    this.stage = stage;
    this.toolbox = new Toolbox(body, this);
    // Buttons.
    let panel = <HTMLElement>body.querySelector('.panel.commands');
    this.commandsContainer = panel;
    panel.querySelector('.redo').addEventListener('click', () => this.redo());
    panel.querySelector('.undo').addEventListener('click', () => this.undo());
    // Initial history entry.
    this.pushHistory(true);
  }

  active = false;

  apply(tilePoint: Vector2) {
    // Even if we don't make changes, the user seems active, so push off save.
    this.updateChangeTime();
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
    if (level.tiles.get(tilePoint) == tool) {
      // No need to spin wheels when no change.
      return;
    }
    level.tiles.set(tilePoint, tool);
    if (tool) {
      // TODO Some static interface to avoid construction?
      new tool().editPlacedAt(this.stage, tilePoint);
    }
    // TODO Push history after edit, not before!
    level.updateScene(this.stage);
  }

  commandsContainer: HTMLElement;

  enable(command: string, enabled: boolean) {
    let classes = this.commandsContainer.querySelector(`.${command}`).classList;
    if (enabled) {
      classes.remove('disabled');
    } else {
      classes.add('disabled');
    }
  }

  erasing = false;

  history = new Array<Level>();

  historyIndex = -1;

  lastChangeTime = 0;

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

  pushHistory(initial = false) {
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
    this.trackChange(initial);
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex += 1;
      this.stage.level = this.history[this.historyIndex].copy();
      this.stage.level.updateScene(this.stage);
      this.trackChange();
    }
  }

  saveDelay = 3e3;

  saveNeeded = false;

  saveLevel() {
    // TODO Level and world naming conventions. UUIDs with index object?
    let encoded = this.stage.level.encode();
    window.localStorage['zym.level'] = JSON.stringify(encoded);
    this.saveNeeded = false;
    // Show saved long enough to let people notice.
    this.showSaveState('saved');
    window.setTimeout(() => {
      if (this.showingCommand('saved')) {
        this.showSaveState('none');
      }
    }, 1e3);
  }

  saveLevelMaybe() {
    if (this.saveNeeded) {
      if (window.performance.now() - this.lastChangeTime > this.saveDelay) {
        // console.log(`Saving at ${window.performance.now()}`)
        this.saveLevel();
      } else {
        // console.log(`Waiting to save at ${window.performance.now()}`)
      }
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

  showCommand(command: string, shown: boolean) {
    let element =
      <HTMLElement>this.commandsContainer.querySelector(`.${command}`);
    // TODO How to default to inline-block through style sheet?
    element.style.display = shown ? 'inline-block' : 'none';
  }

  showingCommand(command: string) {
    let element =
      <HTMLElement>this.commandsContainer.querySelector(`.${command}`);
    return element.style.display != 'none';
  }

  showSaveState(state: 'changing' | 'none' | 'saved') {
    // These aren't really commands, but eh.
    for (let command of ['changing', 'saved']) {
      this.showCommand(command, command == state);
    }
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

  trackChange(initial = false) {
    if (!initial) {
      // Track time for saving.
      this.saveNeeded = true;
      this.updateChangeTime();
    }
    // Enable or disable undo/redo.
    this.enable('redo', this.historyIndex < this.history.length - 1);
    this.enable('undo', this.historyIndex > 0);
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex -= 1;
      this.stage.level = this.history[this.historyIndex].copy();
      this.stage.level.updateScene(this.stage);
      this.trackChange();
    }
  }

  updateChangeTime() {
    this.lastChangeTime = window.performance.now();
    // Change/save indicators aren't really commands, but eh.
    this.showSaveState('changing');
    if (this.saveNeeded) {
      // Make sure we have some event out past save time.
      // console.log(`Setting timeout for save at ${window.performance.now()}`);
      window.setTimeout(() => this.saveLevelMaybe(), this.saveDelay + 0.5);
    }
  }

}
