import {Game, Grid, Id, Part, PartType, createId} from './';
import {None, Parts} from './parts';
import {Vector2} from 'three';

export class World {

  constructor() {
    this.id = createId();
    this.levels.push(new Level());
  }

  id: Id;

  levels = new Array<Level>();

  // TODO name = '';

}

export class Level {

  static tileCount = new Vector2(40, 20);

  static tileSize = new Vector2(8, 10);

  static pixelCount = Level.tileCount.clone().multiply(Level.tileSize);

  constructor({id, tiles}: {id?: Id, tiles?: Grid<PartType>} = {}) {
    this.id = id || createId();
    if (tiles) {
      this.tiles = tiles;
    } else {
      this.tiles = new Grid<PartType>(Level.tileCount);
      this.tiles.items.fill(None);
    }
  }

  copy() {
    return new Level({id: this.id, tiles: this.tiles.copy()});
  }

  decode(encoded: EncodedLevel) {
    // Id. Might be missing for old saved levels.
    if (encoded.id) {
      this.id = encoded.id;
    }
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
  }

  disabled = false;

  encode(): EncodedLevel {
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
    return {id: this.id, tiles: rows.join('\n')};
  }

  equals(other: Level): boolean {
    for (let i = 0; i < this.tiles.items.length; ++i) {
      if (this.tiles.items[i] != other.tiles.items[i]) {
        return false;
      }
    }
    return true;
  }

  id: Id;

  load(text: string) {
    if (text) {
      this.decode(JSON.parse(text));
    } else {
      this.tiles.items.fill(None);
    }
  }

  name = 'Level';

  tiles: Grid<PartType>;

  // For use from the editor.
  updateStage(game: Game, reset = false) {
    let stage = game.stage;
    let theme = game.theme;
    for (let j = 0, k = 0; j < Level.tileCount.x; ++j) {
      for (let i = 0; i < Level.tileCount.y; ++i, ++k) {
        let tile = this.tiles.items[k];
        let oldPart = stage.parts[k];
        // If it's the same type as what we already had, presume it's already in
        // the right place.
        if (reset || !(oldPart instanceof tile)) {
          // Needs to be a new part.
          let part = new tile(game);
          theme.buildArt(part);
          part.point.set(j, i).multiply(Level.tileSize);
          stage.parts[k] = part;
          if (oldPart) {
            stage.removed(oldPart);
          }
          stage.added(part);
        }
      }
    }
    theme.buildDone(game);
  }

}

export interface EncodedLevel {

  id: Id;

  tiles: string;

}

export interface EncodedWorld {

  id: Id;

  levels: Array<string>;

}
