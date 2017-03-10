import {EditorList} from './';
import {Dialog, Encodable, Game, Level, load} from '../';

export class Levels extends EditorList<Level> {

  constructor(game: Game) {
    super(game, require('./levels.html'));
    this.selectedValue = game.level;
    this.updateNumbers();
  }

  addLevel() {
    let level = new Level();
    this.game.tower.items.push(level);
    this.game.tower.save();
    this.addItem(level);
    this.updateNumbers();
  }

  buildTitleBar() {
    let {tower} = this.game;
    let nameElement = this.getButton('name');
    this.makeEditable(nameElement, 'Tower', () => tower.name, text => {
      tower.name = text;
      tower.save();
    });
    this.on('add', () => this.addLevel());
    // this.on('close', () => this.game.hideDialog());
    this.on('exclude', () => this.excludeValue());
    this.on('save', () => this.saveTower());
  }

  excludeValue() {
    super.excludeValue();
    this.updateNumbers();
  }

  get outsideSelectedValue(): Level {
    return this.game.level;
  }

  saveTower() {
    let link = window.document.createElement('a');
    let data = JSON.stringify(this.game.tower.encodeExpanded());
    // TODO Zip it first?
    link.href = `data:application/json,${encodeURIComponent(data)}`;
    // TODO Base file name on tower name, but need to sanitize first!
    link.setAttribute('download', 'Tower.zym');
    link.click();
  }

  selectValue(level: Level) {
    super.selectValue(level);
    window.localStorage['zym.levelId'] = level.id;
  }

  showValue(level: Level) {
    // TODO Extract all this into a setLevel on game or something.
    this.game.level = level;
    let editState = this.game.edit.editState;
    if (!editState.history.length) {
      // Make sure we have at least one history item.
      editState.pushHistory(true);
    }
    editState.trackChange();
    level.updateStage(this.game, true);
  }

  updateNumbers() {
    let {items} = this.game.tower;
    this.game.tower.numberLevels();
    let numberElements =
      [...this.list.querySelectorAll('.number')] as Array<HTMLElement>;
    // Build the numbers.
    numberElements.forEach((numberElement, index) => {
      let level = items[index];
      numberElement.innerText = (level.number || '') as string;
      // TODO This makes things flicker sometimes.
      // TODO Or just cave and make this a table?
      // TODO Instead make some invisible area for calculation?
      numberElement.style.minWidth = '0';
    });
    // Make their widths uniform.
    // TODO Grid layout might be nice, eh?
    window.setTimeout(() => {
      let maxWidth = 0;
      numberElements.forEach(numberElement => {
        // Calculete width. TODO Extract this?
        let style = window.getComputedStyle(numberElement);
        let padding = Math.ceil(+style.paddingRight!.slice(0, -2));
        let width = Math.max(numberElement.offsetWidth - padding, 0);
        maxWidth = Math.max(width, maxWidth);
      });
      numberElements.forEach(numberElement => {
        numberElement.style.minWidth = `${maxWidth}px`;
      });
    });
  }

  get values() {
    return this.game.tower.items;
  }

}

declare function require(path: string): any;
