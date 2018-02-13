import {Dialog, Game, Mode, Raw, StatsUtil, Tower} from './index';
import {Report} from './ui/index';

export class PlayMode extends Mode {

  constructor(game: Game) {
    super(game);
    this.onClick('pause', () => this.togglePause());
    // TODO Different handling (and visual display) of stop when really playing? 
    this.onClick('stop', () => this.game.setMode(this.game.edit));
  }

  bodyClass = 'playMode';

  enter() {
    this.game.play.starting = true;
    this.won = false;
    // Sometimes things get confused, and clearing the action might help.
    // We can't directly read keyboard state.
    this.game.control.clear();
    this.game.control.keyAction.clear();
  }

  fail() {
    this.game.stage.ended = true;
    this.updateStats('fails');
    this.showReport('Maybe next time.');
  }

  onHideDialog(dialog: Dialog) {
    if (dialog instanceof Report) {
      this.startNextOrRestart();
    }
  }

  paused = false;

  showReport(message: string) {
    this.game.showDialog(new Report(this.game, message));
  }

  startNextOrRestart() {
    let {game} = this;
    // If we won, get the next level ready.
    if (this.won) {
      let tower = new Tower().load(game.tower.id);
      tower.numberItems();
      let index = tower.items.findIndex(item => item.id == game.level.id);
      if (index == -1) {
        // How did we lose our level?
        console.log(
          `Level ${game.level.id} not found in tower ${game.tower.id}`
        );
        // Get out of here or something ...
        game.setMode(game.edit);
        return;
      }
      let next = tower.items.slice(index + 1).find(item => !item.excluded);
      if (!next) {
        // That was the end of the tower.
        // TODO Show tower-end screen, then go back to the title screen or such.
        game.setMode(game.edit);
        return;
      }
      // Got a level, so use it.
      game.showLevel(next);
      window.localStorage['zym.levelId'] = next.id;
    } else {
      // Restart the current level.
      game.level.updateStage(game, true);
    }
    // And kick things off.
    this.enter();
  }

  tick() {
    if (this.starting) {
      if (this.game.control.active()) {
        this.starting = false;
      }
    }
    if (this.paused || this.starting) {
      // No updates. TODO Any juice for paused mode?
      return;
    }
    this.game.stage.tick();
  }

  starting = true;

  timeElement: HTMLElement;

  togglePause() {
    this.paused = !this.paused;
    this.toggleClasses({
      element: this.getButton('pause'),
      falseClass: 'fa-pause', trueClass: 'fa-play',
      value: this.paused,
    });
  }

  updateStats(key: 'fails' | 'wins') {
    let {level, stage} = this.game;
    // Store score by hash.
    // First, make sure the hash is up to date, so we associate scores right.
    if (level.calculateContentHash() != level.contentHash) {
      // Save should update the content hash, but be explicit anyway.
      level.updateContentHash();
      level.save();
    }
    // Update stats.
    let levelStats = StatsUtil.loadLevelStats(level);
    StatsUtil.update(levelStats[key], stage.time);
    Raw.save(levelStats);
  }

  updateView() {
    this.game.edit.cropTool.selector.style.display = 'none';
  }

  won = false;

  win() {
    this.won = true;
    this.game.stage.ended = true;
    this.updateStats('wins');
    this.showReport('Level complete!');
  }

}

export class TestMode extends PlayMode {

  // TODO Different end-level handling and/or keyboard handling.

  // TODO Probably different bodyClass, too.

  onKeyDown(key: string) {
    switch (key) {
      case 'Enter':
      case 'Escape': {
        this.game.setMode(this.game.edit);
        break;
      }
    }
  }

  onHideDialog(dialog: Dialog) {
    if (dialog instanceof Report) {
      this.game.setMode(this.game.edit);
    }
  }

}
