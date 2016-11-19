import {Bar, Brick, Enemy, Hero, Ladder, None, Steel} from './';
import {Part, PartType} from '../';
import {Vector2} from 'three';

export class Parts {

  static inventory: Array<PartType> = [
    Bar,
    Brick,
    Enemy,
    Ladder,
    Hero,
    None,
    Steel,
  ];

  // TODO Assert no duplicate chars!

  static charParts = new Map(Parts.inventory.map(
    part => [part.char, part] as [string, PartType]
  ));

}
