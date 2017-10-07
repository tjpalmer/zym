import {
  Bar, BiggieLeft, BiggieRight, Bonus, Brick, Crusher, Dropper, Enemy, Energy,
  EnergyOff, GunLeft, GunRight, Hero, Ladder, LatchLeft, LatchRight,
  LauncherCenter, LauncherDown, LauncherLeft, LauncherRight, LauncherUp, None,
  Spawn, Steel, Treasure,
} from './index';
import {
  cartesianProduct, Multiple, Part, PartOptions, PartType,
} from '../index';
import {Vector2} from 'three';

export class Parts {

  static inventory: Array<PartType> = [
    Bar,
    BiggieLeft,
    BiggieRight,
    Bonus,
    Brick,
    Crusher,
    Dropper,
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
    Spawn,
    Steel,
    Treasure,
  ];

  static charParts = new Map(Parts.inventory.map(
    part => [part.char, part] as [string, PartType]
  ));

  static optionType(baseType: PartType, options: PartOptions) {
    // The type options should be just options, but the options passed in might
    // have extra, so clone just the type options.
    baseType = baseType.base;
    let validOptions = {...baseType.options};
    for (let key in baseType.options) {
      (validOptions as any)[key] &= (options as any)[key];
    }
    let char = Parts.typeChar(baseType, validOptions);
    let type = Parts.charParts.get(char)!;
    return type;
  }

  static typeChar(type: PartType, options: PartOptions) {
    let char = type.char.codePointAt(0)!;
    char |= options.breaking ? 0x200 : 0x00;
    char |= options.ender ? 0x80 : 0x00;
    char |= options.falling ? 0x400 : 0x00;
    char |= options.invisible ? 0x100 : 0x00;
    if (char == 0xAD) {
      // Because 0xAD isn't visible, and they're nice to see, at least.
      char = 0xFF;
    }
    return String.fromCodePoint(char);
  }

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
  let options = {} as Multiple<PartOptions>;
  type Indexed = {[key: string]: boolean};
  for (let key in part.options) {
    (options as Multiple<Indexed>)[key] =
      makeOptions((part.options as any as Indexed)[key]);
  }
  // Take off the all-false case, since we already have those.
  let allOptions = cartesianProduct(options).slice(1);
  allOptions.forEach(option => {
    let char = Parts.typeChar(part, option);
    class OptionPart extends part {
      static get base() {
        return part;
      }
      static breaking = option.breaking;
      static char = char;
      static ender = option.ender;
      static falling = option.falling;
      static invisible = option.invisible;
    }
    let optionClass = OptionPart;
    if (option.breaking) {
      optionClass = makeBreakingClass(optionClass);
    }
    // Add it to things.
    Parts.inventory.push(optionClass);
    Parts.charParts.set(char, optionClass);
    // console.log(
    //   part.char, OptionPart.char, OptionPart.ender, OptionPart.invisible,
    //   Object.getPrototypeOf(OptionPart).name
    // );
  });
});

function makeBreakingClass(optionClass: PartType) {
  class BreakingClass extends optionClass {
    supportedGone(oldSupported: Part) {
      this.die(oldSupported);
      this.active = false;
      this.game.stage.removed(this);
    }
  }
  return BreakingClass;
}
