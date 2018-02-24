import {EditorList, Towers} from './index';
import {
  Dialog, Encodable, Game, ItemList, Level, LevelRaw, Raw, StatsUtil, Tower,
  formatTime, load,
} from '../index';

export class Levels extends EditorList<LevelRaw> {

  constructor(game: Game) {
    super(game, require('./levels.html'));
    this.updateNumbers();
    this.updateStats();
  }

  addLevel() {
    let level = new Level().encode();
    // Insert after selected position.
    let {items} = this.tower;
    let selectedIndex = items.findIndex(
      level => level.id == this.selectedValue!.id,
    );
    let afterSelected = selectedIndex >= 0;
    if (afterSelected) {
      // Insert after selected.
      items.splice(selectedIndex + 1, 0, level);
    } else {
      // Should this ever happen???
      items.push(level);
    }
    this.tower.save();
    this.addItem(level, afterSelected);
    this.updateNumbers();
    // Select the new.
    this.selectValue(level);
    Raw.save(this.selectedValue!);
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
    this.on('delete', () => this.deleteLevel());
    this.on('exclude', () => this.excludeValue());
    this.on('save', () => this.saveTower());
    this.on('towers', () => this.showTowers());
  }

  deleteLevel() {
    if (window.confirm(`Are you sure you want to delete this level?`)) {
      let levelId = this.selectedValue!.id;
      let index = this.tower.items.findIndex(level => level.id == levelId);
      this.tower.items.splice(index, 1);
      this.tower.save();
      Raw.remove(levelId);
      this.getSelectedItem()!.remove();
      if (this.values.length) {
        if (index >= this.values.length) {
          --index;
        }
        this.selectValue(this.values[index]);
      } else {
        this.addLevel();
      }
    }
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
    this.tower.numberItems();
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

  updateStats() {
    let itemElements =
      [...this.list.querySelectorAll('.item')] as Array<HTMLElement>;
    itemElements.forEach(itemElement => {
      let level = Raw.load<LevelRaw>(itemElement.dataset.value!)!;
      if (level.contentHash) {
        let levelStats = StatsUtil.loadLevelStats(level);
        let statsElement = itemElement.querySelector('.stats') as HTMLElement;
        let best = levelStats.wins.min;
        let texts = [];
        let titles = [
          `Win/fail total time: ${
            formatTime(levelStats.fails.total + levelStats.wins.total)
          }`,
        ];
        if (isFinite(best)) {
          texts.push(formatTime(best));
          if (levelStats.timestampBest) {
            titles.push(`Record set at ${levelStats.timestampBest}`);
          }
        }
        statsElement.title = titles.join(' - ');
        let total = levelStats.wins.count + levelStats.fails.count;
        texts.push(`${levelStats.wins.count}/${total}`);
        statsElement.innerText = `(${texts.join(', ')})`;
      }
    });
  }

  get values() {
    return this.tower.items;
  }

}
