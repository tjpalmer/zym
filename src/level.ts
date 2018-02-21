import {
  Game, GenericPartType, Grid, Id, Part, PartType, PlayMode, Ref, createId,
} from './index';
import {Hero, None, Parts, Treasure} from './parts/index';
import {Vector2} from 'three';
import md5 from 'blueimp-md5/js/md5.min.js';

export interface ItemMeta {

  // Totally okay to leave off for included items.
  excluded?: boolean;

  id: Id;

  // Totally okay to leave off for unlocked items.
  locked?: boolean;

  name: string;

  type: string;

}

export interface NumberedItem extends ItemMeta {

  number?: number;

}

export interface ListRaw<Item> extends ItemMeta {

  items: Array<Ref<Item>>;

}

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  max: Point;
  min: Point;
}

export function copyPoint(point: Point): Point;
export function copyPoint(point?: Point): Point | undefined;
export function copyPoint(point?: Point): Point | undefined {
  if (point) {
    return {x: point.x, y: point.y};
  }
}

export function copyRect(rect: Rectangle): Rectangle;
export function copyRect(rect?: Rectangle): Rectangle | undefined;
export function copyRect(rect?: Rectangle): Rectangle | undefined {
  if (rect) {
    return {max: copyPoint(rect.max), min: copyPoint(rect.min)};
  }
}

export interface LevelIds {
  contentHash?: string;
  id: string;
}

export interface LevelRaw extends LevelIds, NumberedItem {

  bounds?: Rectangle;

  contentHash?: string;

  tiles: string;

  // This should only be here on import or export.
  // TODO On import, if present, prefill just this part of level stats, if it's
  // TODO lower than any min already present.
  winsMin?: number;

}

export interface LevelStats {

  fails: Stats;

  // For scorecharts, the id is the contentHash of the level.
  id: Id;

  // ISO  8601 UTC (...Z) formatted.
  timestampBest?: string;

  type: 'LevelStats';

  wins: Stats;

}

export interface Stats {
  count: number;
  diff2: number;
  max: number;
  min: number;
  total: number;
}

export class StatsUtil {

  static initLevelStats(level: LevelIds): LevelStats {
    if (!level.contentHash) {
      throw new Error(`no contentHash for level ${level.id}`);
    }
    return {
      fails: this.initStats(),
      id: level.contentHash,
      type: 'LevelStats',
      wins: this.initStats(),
    };
  }

  static initStats(): Stats {
    return {count: 0, diff2: 0, max: -Infinity, min: Infinity, total: 0};
  }

  static loadLevelStats(level: LevelIds) {
    let levelStats = Raw.load<LevelStats>(level.contentHash!);
    if (levelStats) {
      // No inf in json (silly Crockford), so revert nulls.
      function fix(stats: Stats) {
        if (stats.max == null) stats.max = -Infinity;
        if (stats.min == null) stats.min = Infinity;
      }
      fix(levelStats.fails);
      fix(levelStats.wins);
    }
    return levelStats || this.initLevelStats(level);
  }

  static update(stats: Stats, value: number) {
    // Prep variance calculations. See also Wikipedia.
    let diff = value - (stats.count ? stats.total / stats.count : 0);
    // Easy parts.
    stats.count += 1;
    stats.max = Math.max(stats.max, value);
    stats.min = Math.min(stats.min, value);
    stats.total += value;
    // Finish variance.
    let diffAfter = value - (stats.total / stats.count);
    stats.diff2 = stats.diff2 + diff * diffAfter;
  }

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
    if (item.locked) {
      meta.locked = true;
    }
    return meta;
  }

  static load<Item extends {id: string}>(ref: Ref<Item>) {
    let result = internals.get(ref);
    if (result) {
      return result;
    }
    let text = window.localStorage[`zym.objects.${ref}`];
    if (text) {
      // TODO Sanitize names?
      return JSON.parse(text) as Item;
    }
    // else undefined
  }

  static remove(id: string) {
    window.localStorage.removeItem(`zym.objects.${id}`);
  }

  static save(raw: {id: string, locked?: boolean}) {
    if (internals.has(raw.id) || raw.locked) {
      // Don't touch this.
      return;
    }
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

  locked?: boolean;

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

  static hashify(tower: Tower, internal = false) {
    // Reset ids by content hashes for a constant level.
    let ids = tower.items.map(level => {
      let contentHash = level.contentHash;
      if (!contentHash) {
        // Shouldn't come here for recent exports, but I might want to try
        // against older exports.
        let levelFull = new Level().decode(level);
        contentHash = levelFull.calculateContentHash();
      }
      level.id = md5(contentHash);
      level.locked = true;
      if (internal) {
        internals.set(level.id, level);
      }
      return level.id;
    });
    tower.id = md5(ids.join());
    tower.locked = true;
    // This might have been a structural tower without being a tower instance.
    let raw = Tower.prototype.encode.call(tower) as TowerRaw;
    tower = new Tower().decode(raw);
    if (internal) {
      internals.set(tower.id, raw);
    }
    return tower;
  }

  encodeExpanded() {
    // Get common expanded.
    let result = super.encodeExpanded();
    // But we want high scores here for later player evaluation.
    result.items = result.items.map(level => {
      let statsLevel = {...level} as LevelRaw;
      if (statsLevel.contentHash) {
        let levelStats = StatsUtil.loadLevelStats(statsLevel);
        if (isFinite(levelStats.wins.min)) {
          statsLevel.winsMin = levelStats.wins.min;
        }
      }
      return statsLevel;
    });
    // Good to go.
    return result;
  }

  locked?: boolean;

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

  bounds?: Rectangle = undefined;

  contentHash: string;

  calculateContentHash() {
    // Hash of just the things that affect gameplay, not metadata.
    let content = this.encodeTiles(true);
    // MD5 is good enough since this isn't about strict security, just about an
    // easy way to store scores by level content rather than id.
    return md5(content);
  }

  copy() {
    // TODO Include disabled?
    let level = new Level({id: this.id, tiles: this.tiles.copy()});
    level.bounds = copyRect(this.bounds);
    return level;
  }

  copyFrom(level: Level) {
    // TODO Include disabled?
    this.bounds = copyRect(level.bounds);
    this.name = level.name;
    this.tiles = level.tiles.copy();
  }

  decode(encoded: LevelRaw) {
    this.excluded = !!encoded.excluded;
    // Id. Might be missing for old saved levels.
    // TODO Not by now, surely? Try removing checks?
    // TODO Sanitize id, name, and tiles?
    this.bounds = copyRect(encoded.bounds);
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
    // Let this be saved over later rather than loaded here.
    // We want people who need a hash to make sure the hash is saved for use on
    // raw data.
    // this.contentHash = encoded.contentHash || this.calculateContentHash();
    return this;
  }

  encode(): LevelRaw {
    let raw = {
      // Caching the hash could allow for easier score lookups.
      contentHash: this.updateContentHash(),
      tiles: this.encodeTiles(),
      ...Raw.encodeMeta(this),
    } as LevelRaw;
    if (this.bounds) {
      raw.bounds = copyRect(this.bounds);
    }
    return raw;
  }

  encodeTiles(boundsOnly = false) {
    let rows: Array<string> = [];
    let iBegin = Level.tileCount.y - 1;
    let iEnd = -1;
    let jBegin = 0;
    let jEnd = Level.tileCount.x;
    let {bounds} = this;
    if (boundsOnly && bounds) {
      iBegin = bounds.max.y - 1;
      iEnd = bounds.min.y - 1;
      jBegin = bounds.min.x;
      jEnd = bounds.max.x;
    }
    let point = new Vector2();
    for (let i = iBegin; i != iEnd; --i) {
      let row: Array<string> = [];
      for (let j = jBegin; j != jEnd; ++j) {
        let type = this.tiles.get(point.set(j, i))!;
        row.push(type.char || '?');
      }
      rows.push(row.join(''));
    }
    return rows.join('\n');
  }

  equals(other: Level): boolean {
    for (let i = 0; i < this.tiles.items.length; ++i) {
      if (this.tiles.items[i] != other.tiles.items[i]) {
        return false;
      }
    }
    if (this.bounds || other.bounds) {
      if (!(this.bounds && other.bounds)) {
        return false;
      }
      let {max: thisMax, min: thisMin} = this.bounds!;
      let {max: thatMax, min: thatMin} = other.bounds!;
      return (
        thisMax.x == thatMax.x && thisMax.y == thatMax.y &&
        thisMin.x == thatMin.x && thisMin.y == thatMin.y
      );
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

  get tileBounds() {
    let {max, min} = this.tileBoundsCache;
    // Required mess if I allow undefined bounds.
    if (this.bounds) {
      let {max: boundsMax, min: boundsMin} = this.bounds;
      max.set(boundsMax.x, boundsMax.y);
      min.set(boundsMin.x, boundsMin.y);
    } else {
      max.set(Level.tileCount.x, Level.tileCount.y);
      min.set(0, 0);
    }
    return this.tileBoundsCache;
  }

  tileBoundsCache = {max: new Vector2(), min: new Vector2()};

  tiles: Grid<PartType>;

  updateContentHash() {
    return this.contentHash = this.calculateContentHash();
  }

  // For use from the editor.
  updateStage(game: Game, reset = false) {
    let {max, min} = this.tileBounds;
    let play = game.mode instanceof PlayMode;
    let stage = game.stage;
    let theme = game.theme;
    game.mode.updateView();
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
    if (play) {
      stage.tileBounds.max.copy(max);
      stage.tileBounds.min.copy(min);
    } else {
      stage.tileBounds.max.copy(Level.tileCount);
      stage.tileBounds.min.set(0, 0);
    }
    for (let j = 0, k = 0; j < Level.tileCount.x; ++j) {
      for (let i = 0; i < Level.tileCount.y; ++i, ++k) {
        let tile = this.tiles.items[k];
        // Handle enders for play mode.
        if (play && tile.ender) {
          // TODO Need a time for transition animation?
          let options = {...tile.options};
          for (let key in tile.options) {
            (options as any)[key] = (tile as any)[key];
          }
          options.ender = false;
          tile = stage.ending ? Parts.optionType(tile, options) : None;
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
        if (play) {
          part.cropped = j < min.x || i < min.y || j >= max.x || i >= max.y;
        }
        if (part instanceof Hero) {
          stage.hero = part;
        } else if (part instanceof Treasure && !part.cropped) {
          ++stage.treasureCount;
        }
      }
    }
    stage.update();
    if (reset) {
      stage.init();
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

var internals = new Map<string, any>();
