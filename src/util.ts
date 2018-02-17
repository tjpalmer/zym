import {Vector2} from 'three';

export class Grid<Item> {

  constructor(size: Vector2, items?: Array<Item>) {
    this.items = items || new Array<Item>(size.x * size.y);
    this.size = size.clone();
  }

  copy() {
    return new Grid(this.size, this.items.slice());
  }

  get(point: Vector2): Item | undefined {
    return this.items[this.index(point)];
  }

  index(point: Vector2): number {
    return point.x * this.size.y + point.y;
  }

  items: Array<Item>;

  set(point: Vector2, item: Item) {
    this.items[this.index(point)] = item;
  }

  size: Vector2;

}

export class Group<Item> {
  // Not a mathematical group. Just a group.
  // Doesn't necessarily support set operations, but it's sort of a set.

  clear() {
    // TODO If I say array.length = 0 in Chrome, does it retain memory space?
    // TODO If so, can I trust it to stay that way?
    let {items, length} = this;
    this.length = 0;
    for (let i = 0; i < length; ++i) {
      items[i] = undefined;
    }
  }

  items = new Array<Item | undefined>();

  length = 0;

  push(item: Item) {
    this.items[this.length++] = item;
  }

  removeAt(index: number) {
    let {items} = this;
    items[index] = items[--this.length];
    // Only grow. Don't shrink.
    items[this.length + 1] = undefined;
  }

  *[Symbol.iterator]() {
    // TODO How to make Ring directly Iterable?
    let {items, length} = this;
    for (let i = 0; i < length; ++i) {
      yield items[i]!;
    }
  }

}

export type Id = string;

export type Ref<Item> = Id;

export class Ring<Item> {
  // A circular queue with push and shift functions.
  // TODO Keep this or ditch it?

  constructor(capacity: number) {
    if (!capacity) {
      throw new Error(`capacity ${capacity} <= 0`);
    }
    this.items = new Array<Item>(capacity);
  }

  at(index: number) {
    return this.items[(this.begin + index) % this.items.length];
  }

  begin = 0;

  end = 0;

  clear() {
    // TODO Be more efficient?
    while (!this.empty) {
      this.shift();
    }
  }

  get empty() {
    return this.begin == this.end;
  }

  get first(): Item | undefined {
    return this.items[this.begin];
  }

  get full() {
    return (this.end + 1) % this.items.length == this.begin;
  }

  items: Array<Item | undefined>;

  get length() {
    let length = this.end - this.begin;
    if (length < 0) {
      length += this.items.length;
    }
    return length;
  }

  push(item: Item) {
    let {end, items} = this;
    items[this.end] = item;
    this.end = (end + 1) % items.length;
    // After incrementing, see if we hit the start.
    if (this.end == this.begin) {
      ++this.begin;
    }
  }

  shift() {
    // If not empty, returns the first (oldest) item then clears its spot.
    if (this.empty) {
      return undefined;
    } else {
      let {begin, items} = this;
      let item = items[begin];
      items[begin] = undefined;
      this.begin = (begin + 1) % items.length;
      return item;
    }
  }

  step() {
    // Return the current beginning after making it the new end.
    let wasEmpty = this.empty;
    let item = this.shift();
    if (!wasEmpty) {
      this.push(item!);
    }
    return item;
  }

  *[Symbol.iterator]() {
    // TODO How to make Ring directly Iterable?
    let {items} = this;
    let capacity = items.length;
    for (let i = this.begin; i != this.end; i = (i + 1) % capacity) {
      yield items[i]!;
    }
  }

}

export type Multiple<Single> = {
  [property in keyof Single]: Array<Single[property]>;
};

export function cartesianProduct<Single>(object: Multiple<Single>):
  Array<Single>
{
  function cartProdList(input: any, current?: any): any {
    if (!input || !input.length) {
      return [];
    }
    let head = input[0];
    let tail = input.slice(1);
    let output: any[] = [];
    for (let key in head) {
      for (let i = 0; i < head[key].length; i++) {
        let newCurrent = Object.assign({}, current);
        newCurrent[key] = head[key][i];
        if (tail.length) {
          let productOfTail = cartProdList(tail, newCurrent);
          output = output.concat(productOfTail);
        } else {
          output.push(newCurrent);
        }
      }
    }    
    return output;
  }
  let split = Object.keys(object).map(key => ({[key]: (object as any)[key]}));
  return cartProdList(split);
}

export function createId(byteSize = 16): Id {
  let array = new Uint8Array(byteSize);
  window.crypto.getRandomValues(array);
  return Array.from(array).map(i => i.toString(16)).join('');
}

export function formatTime(seconds: number) {
  let sign = Math.sign(seconds) < 0 ? '-' : '';
  seconds = Math.abs(seconds);
  // Millis.
  let millis = seconds - Math.floor(seconds);
  millis = Math.floor(millis * 1000);
  // Minutes, because we shouldn't ever get to hours.
  seconds = Math.floor(seconds);
  let minutes = Math.floor(seconds / 60);
  let minutesText = minutes ? `${minutes}:` : '';
  // Seconds.
  seconds = seconds % 60;
  // All together.
  return `${sign}${minutesText}${padZero(seconds, 2)}.${padZero(millis, 3)}`;
}

export function load(html: string) {
  let div = window.document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild as HTMLElement;
}

export function padZero(integer: number, size: number) {
  let result = '' + integer;
  if (result.length < size) {
    // Sloppy overkill.
    result = `00000000000000000000000${result}`;
    result = result.slice(-size);
  }
  return result;
}
