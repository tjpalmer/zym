import {Level, Mode, Part, PartType, PointEvent, Game, Toolbox} from './';
import {Levels} from './ui';
import {None, Parts} from './parts';
import {Vector2} from 'three';

export class EditMode extends Mode {

  constructor(game: Game) {
    super(game);
    let {body} = document;
    this.toolbox = new Toolbox(body, this);
    // Always save on exit.
    window.addEventListener('beforeunload', () => this.saveAll());
    // Buttons.
    this.commandsContainer =
      body.querySelector('.panel.commands') as HTMLElement;
    this.onClick('play', () => this.play());
    this.onClick('redo', () => this.editState.redo());
    this.onClick('showLevels', () => this.showLevels());
    this.onClick('undo', () => this.editState.undo());
    // Initial history entry.
    this.editState.pushHistory(true);
  }

  active = false;

  apply(tilePoint: Vector2) {
    // Even if we don't make changes, the user seems active, so push off save.
    this.editState.updateChangeTime();
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
      tool.make(this.game).editPlacedAt(tilePoint);
    }
    level.updateStage(this.game);
  }

  commandsContainer: HTMLElement;

  // TODO Histories by level id.
  editStates: {[levelId: string]: EditState} = {};

  get editState() {
    let id = this.game.level.id;
    let editState = this.editStates[id];
    if (!editState) {
      this.editStates[id] = editState = new EditState(this);
    }
    return editState;
  }

  enable(command: string, enabled: boolean) {
    let classes = this.getButton(command).classList;
    if (enabled) {
      classes.remove('disabled');
    } else {
      classes.add('disabled');
    }
  }

  get ender() {
    // Check toolbox existence because this gets called on construction, too.
    return !!this.toolbox && this.toolbox.getState('ender');
  }

  erasing = false;

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
    this.editState.pushHistory();
  }

  namedEnderTools = new Map(Parts.inventory.filter(type => type.ender).map(
    type => [type.name.toLowerCase(), type] as [string, PartType])
  );

  namedTools = new Map(Parts.inventory.filter(type => !type.ender).map(
    type => [type.name.toLowerCase(), type] as [string, PartType])
  );

  play() {
    this.game.mode = this.game.mode == this.game.play ?
      this.game.edit : this.game.play;
    let isEdit = this.game.mode == this.game.edit;
    if (isEdit) {
      // Reset on stop.
      this.game.level.updateStage(this.game, true);
      if (this.game.play.paused) {
        // TODO Activate function on modes for general handling?
        this.game.play.togglePause();
      }
    }
    this.toggleClasses({
      element: this.game.body,
      falseClass: 'playMode', trueClass: 'editMode',
      value: isEdit,
    });
  }

  saveAll() {
    for (let key in this.editStates) {
      let editState = this.editStates[key];
      if (editState.saveNeeded) {
        editState.saveLevel();
      }
    }
  }

  saveDelay = 10e3;

  setToolFromName(name: string) {
    // TODO If 'ender' active, choose the ender version.
    console.log('ender', this.ender);
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

  showLevels() {
    this.game.showDialog(new Levels(this.game));
  }

  showSaveState(state: 'changing' | 'none' | 'saved') {
    // Once saving beforeunload, these become less useful.
    // TODO Indicators useful to show saving to servers?
    // // These aren't really commands, but eh.
    // for (let command of ['changing', 'saved']) {
    //   this.showCommand(command, command == state);
    // }
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

}

class EditState {

  constructor(edit: EditMode) {
    this.edit = edit;
    // Remember the current level.
    this.level = this.game.level;
  }

  edit: EditMode;

  get game() {
    return this.edit.game;
  }

  history: Array<Level> = [];

  historyIndex = -1;

  lastChangeTime = 0;

  level: Level;

  pushHistory(initial = false) {
    // TODO Check for actual changes here? Or record as changes happen?
    if (
      this.history.length &&
      this.level.equals(this.history[this.historyIndex])
    ) {
      // Nothing changed. Stay put.
      return;
    }
    // Delete anything after our current position.
    this.history.splice(this.historyIndex + 1, this.history.length);
    // Add the new.
    this.history.push(this.level.copy());
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
      this.level.copyFrom(this.history[this.historyIndex]);
      this.level.updateStage(this.game);
      this.trackChange();
    }
  }

  saveLevel() {
    this.level.save();
    this.saveNeeded = false;
    // Show saved long enough to let people notice.
    // TODO Replace all this with onbeforeunload to handle potential problems.
    // TODO Could possibly wait out even longer than 3 seconds if we do that.
    // TODO Besides, in Electron we might have more control, anyway.
    // this.showSaveState('saved');
    // window.setTimeout(() => {
    //   if (this.showingCommand('saved')) {
    //     this.showSaveState('none');
    //   }
    // }, 1e3);
  }

  saveLevelMaybe() {
    if (this.saveNeeded) {
      if (
        window.performance.now() - this.lastChangeTime > this.edit.saveDelay
      ) {
        // console.log(`Saving at ${window.performance.now()}`)
        // Remember the level that we need to save.
        this.saveLevel();
      } else {
        // console.log(`Waiting to save at ${window.performance.now()}`)
      }
    }
  }

  saveNeeded = false;

  trackChange(initial = false) {
    if (!initial) {
      // Track time for saving.
      this.saveNeeded = true;
      this.updateChangeTime();
    }
    // Enable or disable undo/redo.
    this.edit.enable('redo', this.historyIndex < this.history.length - 1);
    this.edit.enable('undo', this.historyIndex > 0);
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex -= 1;
      this.level.copyFrom(this.history[this.historyIndex]);
      this.level.updateStage(this.game);
      this.trackChange();
    }
  }

  updateChangeTime() {
    this.lastChangeTime = window.performance.now();
    // Change/save indicators aren't really commands, but eh.
    this.edit.showSaveState('changing');
    if (this.saveNeeded) {
      // Make sure we have some event out past save time.
      // console.log(`Setting timeout for save at ${window.performance.now()}`);
      window.setTimeout(
        () => this.saveLevelMaybe(), this.edit.saveDelay + 0.5
      );
    }
  }

}
