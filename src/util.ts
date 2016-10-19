import {Vector2} from 'three';

export class Grid<Item> {

  constructor(size: Vector2) {
    this.items = new Array<Item>(size.x * size.y);
    this.size = size.clone();
  }

  public get(index: Vector2): Item {
    // TODO Bounds check?
    return this.items[index.x * this.size.y + index.y];
  }

  private items: Array<Item>;

  size: Vector2;

}
