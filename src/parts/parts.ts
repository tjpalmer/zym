import {
  Bar, BiggieLeft, BiggieRight, Bonus, Brick, Enemy, Energy, EnergyOff, GunLeft,
  GunRight, Hero, Ladder, LatchLeft, LatchRight, LauncherCenter, LauncherDown,
  LauncherLeft, LauncherRight, LauncherUp, None, Steel, Treasure,
} from './';
import {cartesianProduct, Multiple, Part, PartType} from '../';
import {Vector2} from 'three';

export class Parts {

  static inventory: Array<PartType> = [
    Bar,
    BiggieLeft,
    BiggieRight,
    Bonus,
    Brick,
    Enemy,
    Energy,
    EnergyOff,
    GunLeft,
    GunRight,
    Hero,
    Ladder,
    LatchLeft,
    LatchRight,
    LauncherCenter,
    LauncherDown,
    LauncherLeft,
    LauncherRight,
    LauncherUp,
    None,
    Steel,
    Treasure,
  ];

  static charParts = new Map(Parts.inventory.map(
    part => [part.char, part] as [string, PartType]
  ));

}

// Just to check for non-duplicates.
let chars: {[char: string]: string} = {};
Parts.inventory.forEach(({char}) => {
  if (chars[char]) {
    throw new Error(`Duplicate ${char}`);
  }
  chars[char] = char;
});

// This builds all possible parts up front.
// TODO Build them only dynamically?
Parts.inventory.forEach(part => {
  let makeOptions = (condition: boolean) => condition ? [false, true] : [false];
  let options = {} as Multiple<typeof part.options>;
  type Indexed = {[key: string]: boolean};
  for (let key in part.options) {
    (options as Multiple<Indexed>)[key] =
      makeOptions((part.options as Indexed)[key]);
  }
  // Take off the all-false case, since we already have those.
  let allOptions = cartesianProduct(options).slice(1);
  allOptions.forEach(option => {
    let char = part.char.codePointAt(0)!;
    char |= option.ender ? 0x80 : 0x00;
    char |= option.invisible ? 0x100 : 0x00;
    if (char == 0xAD) {
      // Because 0xAD isn't visible, and they're nice to see, at least.
      char = 0xFF;
    }
    class OptionPart extends part {
      static get base() {
        return part;
      }
      static char = String.fromCodePoint(char);
      // TODO Are the following TODOs still relevant?
      // TODO `make` that attends to edit or play mode for ender or base?
      // TODO Or just reference game dynamically in parts?
      static ender = option.ender;
      static invisible = option.invisible;
    }
    // Add it to things.
    Parts.inventory.push(OptionPart);
    Parts.charParts.set(OptionPart.char, OptionPart);
    // console.log(
    //   part.char, OptionPart.char, OptionPart.ender, OptionPart.invisible,
    //   Object.getPrototypeOf(OptionPart).name
    // );
  });
});
