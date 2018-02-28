import {Dialog, Encodable, Game, ItemMeta, Raw, load} from '../index';

export abstract class EditorList<
  Value extends ItemMeta  // , Value extends Encodable<RawItem>
> extends Dialog {

  constructor(game: Game, templateText: string) {
    super(game);
    this.game = game;
    this.init();
    let dialogElement = load(templateText);
    this.titleBar = dialogElement.querySelector('.title') as HTMLElement;
    this.buildTitleBar();
    this.itemTemplate = dialogElement.querySelector('.item') as HTMLElement;
    this.list = this.itemTemplate.parentNode as HTMLElement;
    this.list.removeChild(this.itemTemplate);
    // It doesn't like accessing abstract, but we make it work, so cast.
    let values = (this as {values: any[]}).values;
    values.forEach(value => this.addItem(value));
    this.content = dialogElement;
    this.updateDelete();
    window.setTimeout(() => this.scrollIntoView(), 0);
  }

  addItem(value: Value, afterSelected = false) {
    let item = this.itemTemplate.cloneNode(true) as HTMLElement;
    let outsideSelectedValue = this.outsideSelectedValue;
    if (outsideSelectedValue && value.id == outsideSelectedValue.id) {
      item.classList.add('selected');
    }
    item.dataset['value'] = value.id;
    item.addEventListener('mouseenter', () => {
      this.hoverValue = value;
      this.showValue(value);
    });
    item.addEventListener('mouseleave', () => {
      if (value == this.hoverValue) {
        this.hoverValue = undefined;
        // TODO Timeout before this to avoid flicker?
        this.showValue(this.selectedValue);
      }
    });
    let nameElement = item.querySelector('.name') as HTMLElement;
    this.makeEditable(
      nameElement, this.defaultValueName, () => value.name, text => {
        value.name = text;
        this.save(value);
      }
    );
    let nameBox = item.querySelector('.nameBox') as HTMLElement;
    nameBox.addEventListener('click', () => {
      for (let other of this.list.querySelectorAll('.name')) {
        if (other != nameElement) {
          (other as HTMLElement).contentEditable = 'false';
        }
      }
      this.selectValue(value);
    });
    let edit = item.querySelector('.edit') as HTMLElement;
    edit.addEventListener('click', () => {
      this.selectValue(value);
      this.enterSelection();
    });
    // Actually add to the list. I wish I'd done this in React ...
    if (afterSelected && this.selectedValue) {
      this.getSelectedItem()!.insertAdjacentElement('afterend', item);
    } else {
      this.list.appendChild(item);
    }
  }

  abstract buildTitleBar(): void;

  content: HTMLElement;

  defaultValueName: string;

  abstract enterSelection(): void;

  excludeValue() {
    if (!this.selectedValue) return;
    this.selectedValue.excluded = !this.selectedValue.excluded;
    this.updateDelete();
    this.save(this.selectedValue);
  }

  game: Game;

  getButton(name: string) {
    return this.titleBar.querySelector(`.${name}`) as HTMLElement;
  }

  getSelectedItem() {
    if (!this.selectedValue) return;
    return this.content.querySelector(
      `[data-value="${this.selectedValue.id}"]`
    ) as HTMLElement;
  }

  abstract init(): void;

  list: HTMLElement;

  makeEditable(
    field: HTMLElement,
    defaultText: string,
    get: () => string,
    set: (text: string) => void,
  ) {
    field.spellcheck = false;
    field.innerText = get().trim() || defaultText;
    field.addEventListener('blur', () => {
      // console.log('Blur!');
      let text = field.innerText.trim();
      if (get() != text) {
        // console.log('Set!');
        set(text);
      }
      if (!text) {
        field.innerText = this.defaultValueName;
      }
    });
    field.addEventListener('click', () => {
      field.contentEditable = 'plaintext-only';
    });
    field.addEventListener('keydown', event => {
      // console.log('Down!');
      switch (event.key) {
        case 'Enter': {
          field.contentEditable = 'false';
          field.blur();
          break;
        }
        case 'Escape': {
          field.innerText = get();
          field.contentEditable = 'false';
          break;
        }
        default: {
          return;
        }
      }
      event.cancelBubble = true;
    });
  }

  on(name: string, action: () => void) {
    let button = this.getButton(name);
    button.addEventListener('click', () => {
      if (!button.classList.contains('disabled')) {
        action();
      }
    });
  }

  abstract get outsideSelectedValue(): Value | undefined;

  save(value: Value) {
    Raw.save(value);
  }

  scrollIntoView() {
    if (!this.selectedValue) return;
    let {list} = this;
    let item = this.getSelectedItem()!;
    // This automatically limits to top and bottom of scroll area.
    // Other than that, try to center.
    let top = item.offsetTop;
    top -= list.offsetHeight / 2;
    top += item.offsetHeight / 2;
    list.scrollTop = top;
  }

  selectedValue: Value | undefined;

  selectValue(value: Value | undefined) {
    for (let old of this.content.querySelectorAll('.selected')) {
      old.classList.remove('selected');
    }
    this.showValue(value);
    this.selectedValue = value;
    if (value) {
      this.getSelectedItem()!.classList.add('selected');
    }
    // console.log(`selected ${value.id}`);
    this.updateDelete();
  }

  abstract showValue(value: Value | undefined): void;

  abstract get values(): Array<any>;

  private hoverValue: Value | undefined = undefined;

  private itemTemplate: HTMLElement;

  private titleBar: HTMLElement;

  updateDelete() {
    let del = this.getButton('delete');
    if (del) {
      // Base on whether currently excluded.
      if (this.selectedValue && this.selectedValue.excluded) {
        del.classList.remove('disabled');
      } else {
        del.classList.add('disabled');
      }
    }
  }

}
