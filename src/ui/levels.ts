import {Dialog, Game, Level, load} from '../';

export class Levels implements Dialog {

  constructor(game: Game) {
    let dialogElement = load(require('./levels.html'));
    this.titleBar = dialogElement.querySelector('.title') as HTMLElement;
    this.buildTitleBar();
    this.itemTemplate = dialogElement.querySelector('.item') as HTMLElement;
    this.list = this.itemTemplate.parentNode as HTMLElement;
    this.list.removeChild(this.itemTemplate);
    this.game = game;
    this.selectedLevel = game.level;
    game.world.levels.forEach(level => this.addItem(level));
    this.content = dialogElement;
    window.setTimeout(() => this.scrollIntoView(), 0);
  }

  addItem(level: Level) {
    let item = this.itemTemplate.cloneNode(true) as HTMLElement;
    if (level.id == this.game.level.id) {
      item.classList.add('selected');
    }
    item.dataset['level'] = level.id;
    item.addEventListener('mouseenter', () => {
      this.hoverLevel = level;
      this.showLevel(level);
    });
    item.addEventListener('mouseleave', () => {
      if (level == this.hoverLevel) {
        this.hoverLevel = undefined;
        // TODO Timeout before this to avoid flicker?
        this.showLevel(this.selectedLevel);
      }
    });
    let nameElement = item.querySelector('.name') as HTMLElement;
    nameElement.innerText = level.name;
    nameElement.addEventListener('click', () => {
      nameElement.contentEditable = 'plaintext-only';
    });
    nameElement.addEventListener('blur', () => {
      let text = nameElement.innerText;
      if (level.name != text) {
        level.name = text;
        level.save();
      }
    });
    let nameBox = item.querySelector('.nameBox') as HTMLElement;
    nameBox.addEventListener('click', () => {
      for (let other of this.list.querySelectorAll('.name')) {
        if (other != nameElement) {
          (other as HTMLElement).contentEditable = 'false';
        }
      }
      this.selectLevel(level);
    });
    // TODO Name input!
    let edit = item.querySelector('.edit') as HTMLElement;
    edit.addEventListener('click', () => {
      this.selectLevel(level);
      this.game.hideDialog();
    });
    this.list.appendChild(item);
    // TODO Save world.
  }

  addLevel() {
    let level = new Level();
    this.game.world.levels.push(level);
    this.game.world.save();
    this.addItem(level);
  }

  buildTitleBar() {
    this.on('add', () => this.addLevel());
    // this.on('close', () => this.game.hideDialog());
    this.on('save', () => this.saveWorld());
  }

  content: HTMLElement;

  game: Game;

  getButton(name: string) {
    return this.titleBar.querySelector(`.${name}`) as HTMLElement;
  }

  getSelectedItem() {
    return this.content.querySelector(
      `[data-level="${this.selectedLevel.id}"]`
    ) as HTMLElement;
  }

  on(name: string, action: () => void) {
    this.getButton(name).addEventListener('click', action);
  }

  saveWorld() {
    let link = window.document.createElement('a');
    let data = JSON.stringify(this.game.world.encodeExpanded());
    // TODO Zip it first?
    link.href = `data:application/json,${encodeURIComponent(data)}`;
    link.setAttribute('download', 'world.zym');
    link.click();
  }

  scrollIntoView() {
    let {list} = this;
    let item = this.getSelectedItem();
    // This automatically limits to top and bottom of scroll area.
    // Other than that, try to center.
    let top = item.offsetTop;
    top -= list.offsetHeight / 2;
    top += item.offsetHeight / 2;
    list.scrollTop = top;
  }

  selectLevel(level: Level) {
    for (let old of this.content.querySelectorAll('.selected')) {
      old.classList.remove('selected');
    }
    this.showLevel(level);
    this.selectedLevel = level;
    this.getSelectedItem().classList.add('selected');
    window.localStorage['zym.levelId'] = level.id;
  }

  showLevel(level: Level) {
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

  private hoverLevel: Level | undefined = undefined;

  private itemTemplate: HTMLElement;

  private list: HTMLElement;

  private selectedLevel: Level;

  private titleBar: HTMLElement;

}

declare function require(path: string): any;
