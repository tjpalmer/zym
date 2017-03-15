import {EditorList, Towers} from './';
import {
  Dialog, Encodable, Game, ItemList, Level, LevelRaw, Tower, load,
} from '../';

export class Levels extends EditorList<LevelRaw> {

  constructor(game: Game) {
    super(game, require('./levels.html'));
    this.updateNumbers();
  }

  addLevel() {
    let level = new Level().encode();
    this.tower.items.push(level);
    this.tower.save();
    this.addItem(level);
    this.updateNumbers();
  }

  buildTitleBar() {
    // First time through, we haven't yet set our own tower.
    let {tower} = this.game;
    let nameElement = this.getButton('name');
    this.makeEditable(nameElement, 'Tower', () => tower.name, text => {
      this.game.tower.name = text;
      this.tower.name = text;
      this.tower.save();
    });
    this.on('add', () => this.addLevel());
    // this.on('close', () => this.game.hideDialog());
    this.on('exclude', () => this.excludeValue());
    this.on('save', () => this.saveTower());
    this.on('towers', () => this.showTowers());
  }

  enterSelection() {
    this.game.hideDialog();
  }

  excludeValue() {
    super.excludeValue();
    this.updateNumbers();
  }

  init() {
    this.tower = new Tower().load(this.game.tower.id);
    this.selectedValue = this.game.level.encode();
  }

  get outsideSelectedValue(): LevelRaw {
    return this.game.level.encode();
  }

  saveTower() {
    let link = window.document.createElement('a');
    let data = JSON.stringify(this.tower.encodeExpanded());
    // TODO Zip it first?
    link.href = `data:application/json,${encodeURIComponent(data)}`;
    // TODO Base file name on tower name, but need to sanitize first!
    link.setAttribute('download', 'Tower.zym');
    link.click();
  }

  selectValue(level: LevelRaw) {
    super.selectValue(level);
    window.localStorage['zym.levelId'] = level.id;
  }

  showTowers() {
    this.game.hideDialog();
    this.game.showDialog(new Towers(this.game));
  }

  showValue(level: LevelRaw) {
    this.game.showLevel(level);
  }

  tower: Tower;

  updateNumbers() {
    let {items} = this.tower;
    ItemList.numberItems(items);
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
    return this.tower.items;
  }

}

declare function require(path: string): any;
