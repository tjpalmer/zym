import {Dialog, Encodable, Game, ItemMeta, Raw, load} from '../';

export abstract class EditorList<
  Value extends ItemMeta  // , Value extends Encodable<RawItem>
> implements Dialog {

  constructor(game: Game, templateText: string) {
    this.game = game;
    this.init();
    let dialogElement = load(templateText);
    this.titleBar = dialogElement.querySelector('.title') as HTMLElement;
    this.buildTitleBar();
    this.itemTemplate = dialogElement.querySelector('.item') as HTMLElement;
    this.list = this.itemTemplate.parentNode as HTMLElement;
    this.list.removeChild(this.itemTemplate);
    this.values.forEach(value => this.addItem(value));
    this.content = dialogElement;
    window.setTimeout(() => this.scrollIntoView(), 0);
  }

  addItem(value: Value) {
    let item = this.itemTemplate.cloneNode(true) as HTMLElement;
    if (value.id == this.outsideSelectedValue.id) {
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
        Raw.save(value);
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
      this.game.hideDialog();
    });
    this.list.appendChild(item);
  }

  abstract buildTitleBar(): void;

  content: HTMLElement;

  defaultValueName: string;

  excludeValue() {
    this.selectedValue.excluded = !this.selectedValue.excluded;
    Raw.save(this.selectedValue);
  }

  game: Game;

  getButton(name: string) {
    return this.titleBar.querySelector(`.${name}`) as HTMLElement;
  }

  getSelectedItem() {
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
      let text = field.innerText.trim();
      if (get() != text) {
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
    this.getButton(name).addEventListener('click', action);
  }

  abstract get outsideSelectedValue(): Value;

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

  selectedValue: Value;

  selectValue(value: Value) {
    for (let old of this.content.querySelectorAll('.selected')) {
      old.classList.remove('selected');
    }
    this.showValue(value);
    this.selectedValue = value;
    this.getSelectedItem().classList.add('selected');
    // console.log(`selected ${value.id}`);
  }

  abstract showValue(value: Value): void;

  abstract get values(): Array<any>;

  private hoverValue: Value | undefined = undefined;

  private itemTemplate: HTMLElement;

  private titleBar: HTMLElement;

}
