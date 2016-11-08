import {Level, Mode, Part, PartType, PointEvent, Game, Toolbox} from './';
import {None, Parts} from './parts';
import {Vector2} from 'three';

export class EditMode extends Mode {

  constructor(game: Game) {
    super(game);
    let {body} = document;
    this.toolbox = new Toolbox(body, this);
    // Buttons.
    this.commandsContainer = <HTMLElement>body.querySelector('.panel.commands');
    this.onClick('play', () => this.play());
    this.onClick('redo', () => this.redo());
    this.onClick('undo', () => this.undo());
    // Initial history entry.
    this.pushHistory(true);
  }

  active = false;

  apply(tilePoint: Vector2) {
    // Even if we don't make changes, the user seems active, so push off save.
    this.updateChangeTime();
    let {level} = this.game;
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
      new tool(this.game).editPlacedAt(tilePoint);
    }
    level.updateStage(this.game);
  }

  getButton(command: string): HTMLElement {
    return <HTMLElement>this.commandsContainer.querySelector(`.${command}`);
  }

  commandsContainer: HTMLElement;

  enable(command: string, enabled: boolean) {
    let classes = this.getButton(command).classList;
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
    let {tiles} = this.game.level;
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
    let {tiles} = this.game.level;
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

  onClick(command: string, handler: () => void) {
    this.getButton(command).addEventListener('click', handler);
  }

  play() {
    // TODO Real handling.
    this.game.mode = this.game.mode == this.game.play ?
      this.game.edit : this.game.play;
    let classes = this.getButton('play').classList;
    if (this.game.mode == this.game.edit) {
      // Reset on pause.
      this.game.level.updateStage(this.game, true);
      classes.add('fa-play');
      classes.remove('fa-pause');
    } else {
      classes.add('fa-pause');
      classes.remove('fa-play');
    }
  }

  pushHistory(initial = false) {
    // TODO Check for actual changes here? Or record as changes happen?
    if (
      this.history.length &&
      this.game.level.equals(this.history[this.historyIndex])
    ) {
      // Nothing changed. Stay put.
      return;
    }
    // Delete anything after our current position.
    this.history.splice(this.historyIndex + 1, this.history.length);
    // Add the new.
    this.history.push(this.game.level.copy());
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
      this.game.level = this.history[this.historyIndex].copy();
      this.game.level.updateStage(this.game);
      this.trackChange();
    }
  }

  saveDelay = 3e3;

  saveNeeded = false;

  saveLevel() {
    // TODO Level and world naming conventions. UUIDs with index object?
    let encoded = this.game.level.encode();
    window.localStorage['zym.level'] = JSON.stringify(encoded);
    this.saveNeeded = false;
    // Show saved long enough to let people notice.
    // TODO Replace all this with onbeforeunload to handle potential problems.
    // TODO Could possibly wait out even longer than 3 seconds if we do that.
    // TODO Besides, in Electron we might have more control, anyway.
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
    let element = this.getButton(command);
    // TODO How to default to inline-block through style sheet?
    element.style.display = shown ? 'inline-block' : 'none';
  }

  showingCommand(command: string) {
    let element = this.getButton(command);
    return element.style.display != 'none';
  }

  showSaveState(state: 'changing' | 'none' | 'saved') {
    // These aren't really commands, but eh.
    for (let command of ['changing', 'saved']) {
      this.showCommand(command, command == state);
    }
  }

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
      this.game.level = this.history[this.historyIndex].copy();
      this.game.level.updateStage(this.game);
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
