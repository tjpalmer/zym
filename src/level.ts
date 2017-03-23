import {
  Game, GenericPartType, Grid, Id, Part, PartType, Ref, createId,
} from './';
import {Hero, None, Parts, Treasure} from './parts';
import {Vector2} from 'three';

export interface ItemMeta {

  // Totally okay to leave off for included items.
  excluded?: boolean;

  id: Id;

  name: string;

  type: string;

}

export interface NumberedItem extends ItemMeta {

  number?: number;

}

export interface ListRaw<Item> extends ItemMeta {

  items: Array<Ref<Item>>;

}

export interface LevelRaw extends NumberedItem {

  tiles: string;

}

export type TowerRaw = ListRaw<LevelRaw>;

export type ZoneRaw = ListRaw<TowerRaw>;

export class Raw {

  private constructor() {}

  static encodeMeta(item: ItemMeta) {
    let meta: ItemMeta = {
      id: item.id,
      name: item.name,
      type: item.type,
    };
    if (item.excluded) {
      meta.excluded = true;
    }
    return meta;
  }

  static load<Item extends ItemMeta>(ref: Ref<Item>) {
    let text = window.localStorage[`zym.objects.${ref}`];
    if (text) {
      // TODO Sanitize names?
      return JSON.parse(text) as Item;
    }
    // else undefined
  }

  static save(raw: ItemMeta) {
    // console.log(`Save ${raw.type} ${raw.name} (${raw.id})`);
    window.localStorage[`zym.objects.${raw.id}`] = JSON.stringify(raw);
  }

}

export abstract class Encodable<RawItem extends ItemMeta> implements ItemMeta {

  // Implied: abstract decode(raw: undefined): never;
  abstract decode(raw: RawItem): this;

  abstract encode(): RawItem;

  excluded: boolean;

  id: Id;

  load(id: Id): this {
    this.decode(Raw.load(id) as RawItem);
    return this;
  }

  name: string;

  save() {
    Raw.save(this.encode());
  }

  type: string;

}

export abstract class ItemList<Item extends ItemMeta>
    extends Encodable<ListRaw<Item>> {

  static numberItems(items: Array<NumberedItem>) {
    let number = 1;
    for (let item of items) {
      if (item.excluded) {
        item.number = undefined;
      } else {
        item.number = number;
        ++number;
      }
    }
  }

  decode(encoded: ListRaw<Item>) {
    this.id = encoded.id;
    this.items = encoded.items.
      map(id => Raw.load<Item>(id)).
      filter(item => item) as Array<Item>;
    this.name = encoded.name;
    return this;
  }

  encode(): ListRaw<Item> {
    // This presumes that all individual levels have already been saved under
    // their own ids.
    return {
      items: this.items.map(item => item.id),
      ...Raw.encodeMeta(this),
    }
  }

  encodeExpanded(): ItemMeta & {items: Array<Item>} {
    // Intended for full export.
    return {
      items: this.items,
      ...Raw.encodeMeta(this),
    }
  }

  excluded = false;

  id = createId();

  items = new Array<Item>();

  name = this.type;

  numberItems() {
    ItemList.numberItems(this.items);
  }

  abstract get type(): string;

}

export class Zone extends ItemList<TowerRaw> {

  get type() {
    return 'Zone';
  }

}

export class Tower extends ItemList<LevelRaw> {

  get type() {
    return 'Tower';
  }

}

export class Level extends Encodable<LevelRaw> implements NumberedItem {

  static tileCount = new Vector2(40, 20);

  static tileSize = new Vector2(8, 10);

  static pixelCount = Level.tileCount.clone().multiply(Level.tileSize);

  constructor({id, tiles}: {id?: Id, tiles?: Grid<PartType>} = {}) {
    super();
    this.id = id || createId();
    if (tiles) {
      this.tiles = tiles;
    } else {
      this.tiles = new Grid<PartType>(Level.tileCount);
      this.tiles.items.fill(None);
    }
  }

  copy() {
    // TODO Include disabled?
    return new Level({id: this.id, tiles: this.tiles.copy()});
  }

  copyFrom(level: Level) {
    // TODO Include disabled?
    this.name = level.name;
    this.tiles = level.tiles.copy();
  }

  decode(encoded: LevelRaw) {
    this.excluded = !!encoded.excluded;
    // Id. Might be missing for old saved levels.
    // TODO Not by now, surely? Try removing checks?
    // TODO Sanitize id, name, and tiles?
    if (encoded.id) {
      this.id = encoded.id;
    }
    if (encoded.name) {
      this.name = encoded.name;
    }
    this.number = encoded.number;
    // Tiles.
    let point = new Vector2();
    let rows = encoded.tiles.split('\n').slice(0, Level.tileCount.y);
    rows.forEach((row, i) => {
      i = Level.tileCount.y - i - 1;
      for (let j = 0; j < Math.min(row.length, Level.tileCount.x); ++j) {
        let type = Parts.charParts.get(row.charAt(j));
        this.tiles.set(point.set(j, i), type || None);
      }
    });
    return this;
  }

  encode(): LevelRaw {
    let point = new Vector2();
    let rows: Array<string> = [];
    for (let i = Level.tileCount.y - 1 ; i >= 0; --i) {
      let row: Array<string> = [];
      for (let j = 0; j < Level.tileCount.x; ++j) {
        let type = this.tiles.get(point.set(j, i))!;
        row.push(type.char || '?');
      }
      rows.push(row.join(''));
    }
    let raw = {
      tiles: rows.join('\n'),
      ...Raw.encodeMeta(this),
    } as LevelRaw;
    return raw;
  }

  equals(other: Level): boolean {
    for (let i = 0; i < this.tiles.items.length; ++i) {
      if (this.tiles.items[i] != other.tiles.items[i]) {
        return false;
      }
    }
    return true;
  }

  excluded = false;

  id: Id;

  load(id: Id) {
    try {
      super.load(id);
    } catch (e) {
      // TODO Is this catch really a good idea?
      this.tiles.items.fill(None);
    }
    // For convenience.
    return this;
  }

  name = 'Level';

  // Starting from 1, undefined for excluded levels.
  // Lazily applied.
  number?: number;

  tiles: Grid<PartType>;

  // For use from the editor.
  updateStage(game: Game, reset = false) {
    let play = game.mode == game.play;
    let stage = game.stage;
    let theme = game.theme;
    if (reset) {
      // Had some phantoms on a level. Clear the grid helps?
      stage.clearGrid();
      stage.ended = false;
      stage.ending = false;
      stage.energyOn = true;
      stage.time = 0;
      stage.particles.clear();
    }
    stage.hero = undefined;
    stage.treasureCount = 0;
    for (let j = 0, k = 0; j < Level.tileCount.x; ++j) {
      for (let i = 0; i < Level.tileCount.y; ++i, ++k) {
        let tile = this.tiles.items[k];
        // Handle enders for play mode.
        if (play && tile.ender) {
          // TODO Need a time for transition animation?
          tile = stage.ending ? tile.base : None;
        }
        // Build a new part if needed.
        let oldPart = stage.parts[k];
        let part: Part;
        // If it's the same type as what we already had, presume it's already in
        // the right place.
        if (reset || !oldPart || oldPart.type != tile) {
          // Needs to be a new part.
          part = tile.make(game);
          theme.buildArt(part);
          part.point.set(j, i).multiply(Level.tileSize);
          stage.parts[k] = part;
          if (oldPart) {
            stage.removed(oldPart);
          }
          stage.added(part);
        } else {
          part = oldPart;
        }
        if (part instanceof Hero) {
          stage.hero = part;
        } else if (part instanceof Treasure) {
          ++stage.treasureCount;
        }
      }
    }
    if (reset) {
      if (!stage.treasureCount) {
        // Already got them all!
        stage.ending = true;
        this.updateStage(game);
      }
    }
    theme.buildDone(game);
  }

  get type() {
    return 'Level';
  }

}
