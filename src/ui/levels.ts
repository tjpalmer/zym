import {Dialog, Game, Level} from '../';

export class Levels implements Dialog {

  constructor(game: Game) {
    let dialogElement = load('./levels.html');
    this.titleBar = dialogElement.querySelector('.title') as HTMLElement;
    this.buildTitleBar();
    this.itemTemplate = dialogElement.querySelector('.item') as HTMLElement;
    this.list = this.itemTemplate.parentNode as HTMLElement;
    this.list.removeChild(this.itemTemplate);
    this.game = game;
    game.world.levels.forEach(level => this.addItem(level));
    this.content = dialogElement;
  }

  addItem(level: Level) {
    let item = this.itemTemplate.cloneNode(true) as HTMLElement;
    let nameElement = item.querySelector('.name') as HTMLElement;
    nameElement.innerText = level.name;
    let nameBox = item.querySelector('.nameBox') as HTMLElement;
    nameBox.addEventListener('click', () => {
      // TODO Select level.
      console.log('Select level.');
    });
    let edit = item.querySelector('.edit') as HTMLElement;
    edit.addEventListener('click', () => {
      // TODO Select level.
      // TODO Close dialog.
      console.log('Edit level.');
    });
    this.list.appendChild(item);
  }

  addLevel() {
    let level = new Level();
    this.game.world.levels.push(level);
    // TODO Save the new level for the world.
    this.addItem(level);
  }

  buildTitleBar() {
    let add = this.titleBar.querySelector('.add') as HTMLElement;
    add.addEventListener('click', () => this.addLevel());
    let close = this.titleBar.querySelector('.close') as HTMLElement;
    close.addEventListener('click', () => this.game.hideDialog());
  }

  content: HTMLElement;

  game: Game;

  private itemTemplate: HTMLElement;

  private list: HTMLElement;

  private titleBar: HTMLElement;

}

function load(path: string) {
  let html = require(path);
  let div = window.document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild as HTMLElement;
}

declare function require(path: string): any;
