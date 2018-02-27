import {Dialog, EditMode, load} from '../index';

export class Messages extends Dialog {

  constructor(edit: EditMode) {
    super(edit.game);
    this.content = load(require('./messages.html'));
    this.messageText.value = edit.game.level.message;
  }

  content: HTMLElement;

  field(name: string) {
    return this.content.querySelector(`.${name}`) as HTMLElement;
  }

  onHide() {
    console.log('Apply changes.');
  }

  get messageText() {
    return this.field('messageText') as HTMLTextAreaElement;
  }

}
