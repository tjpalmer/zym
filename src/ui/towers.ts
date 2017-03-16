import {EditorList, Levels} from './';
import {
  Game, ItemMeta, Level, LevelRaw, ListRaw, loadTower, Raw, Tower, TowerRaw,
  Zone,
} from '../';

export class Towers extends EditorList<TowerRaw> {

  constructor(game: Game) {
    super(game, require('./towers.html'));
  }

  addTower() {
    let tower = new Tower().encode();
    let level = new Level().encode();
    Raw.save(level);
    tower.items.push(level.id);
    Raw.save(tower);
    this.zone.items.push(tower);
    this.zone.save();
    this.addItem(tower);
    // Select the new.
    this.selectValue(tower);
  }

  buildTitleBar() {
    this.on('add', () => this.addTower());
  }

  enterSelection() {
    this.game.hideDialog();
    this.game.showDialog(new Levels(this.game));
  }

  getLevel(tower: TowerRaw) {
    if (tower.id == this.originalTower.id) {
      return this.originalLevel;
    } else {
      // TODO Track the last level selected in the editor for each tower?
      return Raw.load<LevelRaw>(tower.items[0])!;
    }
  }

  init() {
    this.originalLevel = this.game.level.encode();
    this.originalTower = {...this.game.tower};
    this.zone = new Zone().load(this.game.zone.id);
    this.selectedValue = this.outsideSelectedValue;
  }

  originalLevel: LevelRaw;

  originalTower: ItemMeta;

  get outsideSelectedValue() {
    return this.zone.items.find(item => item.id == this.game.tower.id)!;
  }

  selectValue(tower: TowerRaw) {
    super.selectValue(tower);
    if (tower.id != window.localStorage['zym.towerId']) {
      let level = this.getLevel(tower);
      window.localStorage['zym.towerId'] = tower.id;
      window.localStorage['zym.levelId'] = level.id;
      this.game.tower = loadTower(this.game.zone);
    }
  }

  showValue(tower: TowerRaw) {
    if (tower.id == this.game.tower.id) {
      // Already good to go.
      return;
    }
    this.game.tower = tower;
    this.game.showLevel(this.getLevel(tower));
  }

  get values() {
    return this.zone.items;
  }

  zone: Zone;

}

declare function require(path: string): any;
