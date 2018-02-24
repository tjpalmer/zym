import {EditorList} from './index';
import {EditMode, ItemMeta, Message} from '../index';

type FakeMessage = ItemMeta;

export class Messages extends EditorList<FakeMessage> {

  constructor(edit: EditMode) {
    super(edit.game, require('./messages.html'));
  }

  buildTitleBar() {
    // throw new Error("Method not implemented.");
  }

  enterSelection() {
    // throw new Error("Method not implemented.");
  }

  init() {
    this.selectedValue = this.outsideSelectedValue;
  }

  get outsideSelectedValue() {
    return message;
  }

  save() {
    // TODO Save level.
  }

  showValue(value: FakeMessage) {
    // throw new Error("Method not implemented.");
  }

  get values() {
    // TODO From current level messages.
    return [message];
  }

}

let message: FakeMessage = {
  id: 'hi',
  name: 'Message Name',
  type: 'Message',
};
