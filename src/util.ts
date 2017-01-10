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

export type Id = string;

export class Ring<Item> {
  // A circular queue with push and shift functions.

  constructor(capacity: number) {
    if (!capacity) {
      throw new Error(`capacity ${capacity} <= 0`);
    }
    this.items = new Array<Item>(capacity);
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
  // Seconds.
  seconds = seconds % 60;
  // All together.
  return `${sign}${minutes}:${padZero(seconds, 2)}.${padZero(millis, 3)}`;
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
