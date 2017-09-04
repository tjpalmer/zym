import {
  CopyTool, CropTool, Level, Mode, NopTool, Part, PartOptions, PartTool,
  PartType, PasteTool, PointEvent, Game, Tool, Toolbox,
} from './index';
import {Levels} from './ui/index';
import {None, Parts} from './parts/index';
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
    this.onClick('exit', () => this.game.setMode(this.game.play));
    this.onClick('play', () => this.togglePlay());
    this.onClick('redo', () => this.editState.redo());
    this.onClick('showLevels', () => this.showLevels());
    this.onClick('undo', () => this.editState.undo());
    // Tools.
    this.namedTools.set('copy', this.copyTool = new CopyTool(this));
    this.namedTools.set('paste', new PasteTool(this));
    this.namedTools.set('crop', this.cropTool = new CropTool(this));
    // Initial history entry.
    this.editState.pushHistory(true);
  }

  active = false;

  apply(begin: boolean, tilePoint: Vector2) {
    // Even if we don't make changes, the user seems active, so push off save.
    this.editState.updateChangeTime();
    if (begin) {
      this.tool.begin(tilePoint);
    } else {
      this.tool.drag(tilePoint);
    }
  }

  bodyClass = 'editMode';

  commandsContainer: HTMLElement;

  copyTool: CopyTool;

  cropTool: CropTool;

  draw(tilePoint: Vector2, tile: PartType) {
    // Need to call level.updateStage after this.
    let {game} = this;
    let {level} = game;
    if (level.tiles.get(tilePoint) == tile) {
      // No need to spin wheels when no change.
      return;
    }
    level.tiles.set(tilePoint, tile);
    if (tile) {
      // TODO Move function to PartType?
      tile.make(game).editPlacedAt(tilePoint);
    }
  }

  // TODO Limit the total number of editStates?
  editStates: {[levelId: string]: EditState} = {};

  get editState() {
    let id = this.game.level.id;
    let editState = this.editStates[id];
    if (!editState) {
      this.editStates[id] = editState = new EditState(this);
    }
    // Level object sometimes changes out, so update each time.
    editState.level = this.game.level;
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
    return this.getToolBoxState('ender');
  }

  enter() {
    // Unpause on stop, so the characters can react.
    // TODO Is this doing the right thing?
    if (this.game.play.paused) {
      // TODO Activate function on modes for general handling?
      this.game.play.togglePause();
    }
    this.tool.activate();
    this.updateView();
  }

  exit() {
    this.saveAll();
    this.tool.deactivate();
  }

  getToolBoxState(className: string) {
    // Check toolbox existence because this gets called on construction, too.
    return !!this.toolbox && this.toolbox.getState(className);
  }

  get invisible() {
    return this.getToolBoxState('invisible');
  }

  mouseDown(event: PointEvent) {
    // Mouse down is always in bounds.
    let point = this.tilePoint(event.point)!;
    this.apply(true, point);
    this.active = true;
  }

  mouseMove(event: PointEvent) {
    // TODO Don't send these events when level list or such is up!
    let point = this.tilePoint(event.point);
    if (!point) {
      // Move and up can be out of bounds.
      return;
    }
    if (this.active) {
      this.apply(false, point);
    } else {
      if (this.tool && !this.game.showingDialog()) {
        this.tool.hover(point);
      }
    }
  }

  mouseUp(event: PointEvent) {
    // console.log('mouseUp', event);
    if (this.tool && this.active) {
      this.tool.end();
    }
    this.active = false;
    this.editState.pushHistory();
  }

  partTool(name: string, options: PartOptions) {
    // console.log(name, this.namedTools.get(name));
    let tool = this.namedTools.get(name);
    let baseType = tool && (tool as PartTool).type;
    if (!baseType) {
      return;
    }
    let type = Parts.optionType(baseType, options);
    return new PartTool(this, type);
  }

  namedTools = new Map(Parts.inventory.filter(type => !type.ender).map(
    type => [
      // Split based on ModuleConcatenationPlugin style like 'hero_Hero'.
      // I might just need to make things explicit if I use a minifier, instead
      // of depending on class names.
      type.name.split('_').slice(-1)[0].toLowerCase(),
      new PartTool(this, type),
    ] as [string, Tool],
  ));

  onClick(command: string, handler: () => void) {
    // Hide tool effects.
    this.getButton(command).addEventListener('click', () => {
      if (this.tool) {
        this.tool.deactivate();
      }
    });
    // And the requested handler, too.
    super.onClick(command, handler);
  }

  onKeyDown(key: string) {
    switch (key) {
      case 'Enter': {
        this.game.setMode(this.game.test);
        break;
      }
      case 'Escape': {
        if (!(this.game.dialog instanceof Levels)) {
          // Will happen after the any other hides.
          window.setTimeout(() => this.showLevels(), 0);
        }
        break;
      }
    }
  }

  resize() {
    if (this.tool) {
      this.tool.resize();
    }
    this.updateView();
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
    // Should only be undefined the first time in.
    if (this.tool) {
      this.tool.deactivate();
    }
    let tool = this.toolFromName(name);
    if (tool) {
      this.tool = tool;
    } else {
      // This shouldn't happen when things are complete. It's just a fallback.
      console.warn(`No such tool: ${name}`);
      this.tool = new NopTool(this);
    }
    this.tool.activate();
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
    this.saveAll();
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

  togglePlay() {
    this.game.setMode(
      this.game.mode == this.game.test ? this.game.edit : this.game.test
    );
  }

  // Default gets set from HTML settings.
  tool: Tool;

  toolFromName(name: string) {
    let tool = this.namedTools.get(name);
    if (tool instanceof PartTool) {
      // Be more precise, in terms of our options.
      tool = this.partTool(name, this);
    }
    return tool;
  }

  toolbox: Toolbox;

  updateTool() {
    if (this.tool instanceof PartTool) {
      this.setToolFromName(this.tool.type.base.name.toLowerCase());
    }
  }

  updateView() {
    this.cropTool.updateView();
  }

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
