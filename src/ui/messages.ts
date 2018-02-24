import {EditorList} from './index';
import {EditMode, ItemMeta, Message, createId} from '../index';

interface FakeMessage extends ItemMeta {
  // Retain the link to the original so we keep display conditions.
  message?: Message;
}

export class Messages extends EditorList<FakeMessage> {

  constructor(edit: EditMode) {
    super(edit.game, require('./messages.html'));
  }

  addMessage() {
    let message = {
      id: createId(), name: 'Enter message text.', type: 'Message',
    };
    this.values.push(message);
    this.addItem(message);
    this.save();
  }

  buildTitleBar() {
    this.on('add', () => this.addMessage());
    this.on('delete', () => this.deleteMessage());
    this.on('exclude', () => this.excludeValue());
  }

  deleteMessage() {
    if (window.confirm(`Are you sure you want to delete this message?`)) {
      let messageId = this.selectedValue!.id;
      let index = this.messages.findIndex(message => message.id == messageId);
      this.messages.splice(index, 1);
      this.save();
      this.getSelectedItem()!.remove();
      if (this.values.length) {
        if (index >= this.values.length) {
          --index;
        }
        this.selectValue(this.values[index]);
      }
    }
  }

  enterSelection() {
    // TODO Make sure the editor knows the currently selected comment.
    this.game.hideDialog();
  }

  init() {
    this.selectedValue = this.outsideSelectedValue;
  }

  messages: FakeMessage[];

  get outsideSelectedValue() {
    return this.values.length ? this.values[0] : undefined;
  }

  save() {
    let {level} = this.game;
    // This might have changed the order or the content, but it retains the
    // original objects and their conditions, if they were present.
    level.messages = this.messages.map(message => {
      let actual: Message = message.message || {text: ''};
      actual.text = message.name;
      if (message.excluded) {
        actual.excluded = true;
      } else {
        delete actual.excluded;
      }
      // TODO Apply any custom conditions.
      return actual;
    });
    level.save();
  }

  showValue(value: FakeMessage) {
    // If we can keep it inline in name, there's nothing more to show.
    // TODO What about conditions? Fixed inline set of bools?
  }

  get values() {
    if (!this.messages) {
      let {level} = this.game;
      this.messages = level.messages.map(message => ({
        excluded: message.excluded,
        // Temporary id just for during editing the list.
        id: createId(),
        message,
        name: message.text,
        type: 'Message',
      }));
    }
    return this.messages;
  }

}
