import {Dialog, Game, Level, load} from '../';

export class Levels implements Dialog {

  constructor(game: Game) {
    this.game = game;
    let dialogElement = load(require('./levels.html'));
    this.titleBar = dialogElement.querySelector('.title') as HTMLElement;
    this.buildTitleBar();
    this.itemTemplate = dialogElement.querySelector('.item') as HTMLElement;
    this.list = this.itemTemplate.parentNode as HTMLElement;
    this.list.removeChild(this.itemTemplate);
    this.selectedLevel = game.level;
    game.world.levels.forEach(level => this.addItem(level));
    this.updateNumbers();
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
    nameElement.innerText = level.name.trim() || 'Level';
    nameElement.addEventListener('blur', () => {
      let text = nameElement.innerText.trim();
      if (level.name != text) {
        level.name = text;
        level.save();
      }
      if (!text) {
        nameElement.innerText = 'Level';
      }
    });
    nameElement.addEventListener('click', () => {
      nameElement.contentEditable = 'plaintext-only';
    });
    nameElement.addEventListener('keydown', event => {
      switch (event.key) {
        case 'Enter': {
          nameElement.contentEditable = 'false';
          nameElement.blur();
          break;
        }
        case 'Escape': {
          nameElement.innerText = level.name;
          nameElement.contentEditable = 'false';
          break;
        }
        default: {
          return;
        }
      }
      event.cancelBubble = true;
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
    let edit = item.querySelector('.edit') as HTMLElement;
    edit.addEventListener('click', () => {
      this.selectLevel(level);
      this.game.hideDialog();
    });
    this.list.appendChild(item);
  }

  addLevel() {
    let level = new Level();
    this.game.world.levels.push(level);
    this.game.world.save();
    this.addItem(level);
    this.updateNumbers();
  }

  buildTitleBar() {
    this.getButton('name').innerText = this.game.world.name.trim() || 'Zone';
    this.on('add', () => this.addLevel());
    // this.on('close', () => this.game.hideDialog());
    this.on('exclude', () => this.excludeLevel());
    this.on('save', () => this.saveWorld());
  }

  content: HTMLElement;

  excludeLevel() {
    this.selectedLevel.excluded = !this.selectedLevel.excluded;
    this.selectedLevel.save();
    this.updateNumbers();
  }

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
    // TODO Base file name on zone name, but need to sanitize first!
    link.setAttribute('download', 'Zone.zym');
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

  updateNumbers() {
    let {levels} = this.game.world;
    this.game.world.numberLevels();
    let numberElements =
      [...this.list.querySelectorAll('.number')] as Array<HTMLElement>;
    // Build the numbers.
    numberElements.forEach((numberElement, index) => {
      let level = levels[index];
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

  private hoverLevel: Level | undefined = undefined;

  private itemTemplate: HTMLElement;

  private list: HTMLElement;

  private selectedLevel: Level;

  private titleBar: HTMLElement;

}

declare function require(path: string): any;
