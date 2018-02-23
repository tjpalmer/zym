import {EditorList} from './index';
import {EditMode, ItemMeta, Message} from '../index';

interface FakeMessage extends ItemMeta {
  text: string;
}

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

  showValue(value: FakeMessage) {
    // throw new Error("Method not implemented.");
  }

  get values() {
    return [message];
  }

}

let message: FakeMessage = {
  id: 'hi',
  name: 'Message Name',
  text: 'My lengthy message',
  type: 'Message',
};
