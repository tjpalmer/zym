import {Bar, Brick, Hero, Ladder, None} from './';
import {Part, PartType} from '../';
import {Vector2} from 'three';

export class Parts {

  static inventory: Array<PartType> = [
    Bar,
    Brick,
    Ladder,
    Hero,
    None,
  ];

  // TODO Assert no duplicate chars!

  static charParts = new Map(Parts.inventory.map(
    part => <[string, PartType]>[part.char, part]
  ));

  static partChars = new Map(Parts.inventory.map(
    part => <[PartType, string]>[part, part.char]
  ));

}
