import {Dialog, Game, load} from '../index';

export class ShowMessage extends Dialog {

  constructor(game: Game) {
    super(game);
    this.content = load(require('./showmessage.html'));
    // TODO CommonMark?
    // TODO Replace all innerText with textContent?
    this.field('messageText').textContent = game.level.message;
  }

  content: HTMLElement;

  field(name: string) {
    return this.content.querySelector(`.${name}`) as HTMLElement;
  }

  onKey(event: KeyboardEvent, down: boolean) {
    if (down && event.key == 'Enter') {
      this.game.hideDialog();
    }
  }

}
