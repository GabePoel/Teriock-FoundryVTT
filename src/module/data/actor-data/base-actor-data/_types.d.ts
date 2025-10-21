import type {
  TeriockActor,
  TeriockTokenDocument,
} from "../../../documents/_module.mjs";
import type {
  ActorAttributeData,
  BarData,
  HackDataCollection,
} from "./types/stats";
import type {
  TeriockConsequence,
  TeriockEquipment,
  TeriockSpecies,
} from "../../../documents/_documents.mjs";
import type { ProtectionData } from "./types/protections";
import type { SheetData } from "./types/sheet";
import type { TradecraftData } from "./types/tradecrafts";
import type { StatDieModel } from "../../models/_module.mjs";

declare global {
  interface TeriockBaseActorData {
    /** <base> Ability flags */
    abilityFlags: Record<string, string>;
    /** <schema> Attributes */
    attributes: {
      /** <schema> Intelligence */
      int: ActorAttributeData;
      /** <schema> Movement */
      mov: ActorAttributeData;
      /** <schema> Perception */
      per: ActorAttributeData;
      /** <schema> Sneak */
      snk: ActorAttributeData;
      /** <schema> Strength */
      str: ActorAttributeData;
      /** <schema> Unused presence */
      unp: ActorAttributeData;
    };
    /** <base> Attunements - IDs of attuned equipment */
    attunements: Set<Teriock.ID<TeriockEquipment>>;
    /** <derived> Carrying capacity */
    carryingCapacity: {
      /** <derived> Light carrying capacity */
      light: number;
      /** <derived> Heavy carrying capacity */
      heavy: number;
      /** <derived> Maximum carrying capacity */
      max: number;
    };
    /** <schema> Stuff that changes during combat */
    combat: {
      /** <schema> Attack penalty */
      attackPenalty: number;
      /** <schema> Whether {@link TeriockActor} still has reaction */
      hasReaction: boolean;
    };
    /** <base> Information explaining conditions in place. */
    conditionInformation: Record<
      Teriock.Parameters.Condition.ConditionKey,
      {
        locked: boolean;
        reasons: Set<string>;
      }
    >;
    /** <schema> Death Bag */
    deathBag: {
      /** <schema> How many stones to pull from the Death Bag */
      pull: string;
      /** <schema> The colors of stones in the Death Bag */
      stones: {
        /** <schema> Black */
        black: string;
        /** <schema> Red */
        red: string;
        /** <schema> White */
        white: string;
      };
    };
    /** <base> Defense */
    defense: {
      /** <base> Armor value */
      av: {
        /** <base> Natural armor value */
        natural: number;
        /** <derived> Armor value */
        value: number;
        /** <derived> Worn armor value */
        worn: number;
      };
      /** <derived> Armor class (av + 10) */
      ac: number;
      /** <derived> Block value of primary blocker */
      bv: number;
      /** <derived> Combat class (ac + bv) */
      cc: number;
    };
    /** <base> <derived> The calculated encumbrance level (0-3) based on carried weight vs capacity */
    encumbranceLevel: number;
    /** <schema> Hacks */
    hacks: HackDataCollection;
    /** <base> Registered pseudo-hook macros to fire */
    hookedMacros: Teriock.Parameters.Actor.HookedActorMacros;
    /** <schema> Hit points */
    hp: {
      /** <base> Base HP */
      base: number;
      /** <base> Maximum HP */
      max: number;
      /** <derived> Minimum HP */
      min: number;
      /** <schema> Morganti damaged HP */
      morganti: number;
      /** <schema> Temp HP */
      temp: number;
      /** <schema> Current HP */
      value: number;
    };
    /** <base> Light */
    light: object;
    /** <schema> Money */
    money: {
      /** <schema> Copper coins */
      copper: number;
      /** <schema> Silver coins */
      silver: number;
      /** <schema> Gold coins */
      gold: number;
      /** <schema> Ent tear amber */
      entTearAmber: number;
      /** <schema> Fire eye rubies */
      fireEyeRuby: number;
      /** <schema> Pixie plum amethysts */
      pixiePlumAmethyst: number;
      /** <schema> Snow diamonds */
      snowDiamond: number;
      /** <schema> Dragon emeralds */
      dragonEmerald: number;
      /** <schema> Moon opals */
      moonOpal: number;
      /** <schema> Magus quartz */
      magusQuartz: number;
      /** <schema> Heartstone rubies */
      heartstoneRuby: number;
      /** <schema> Debt */
      debt: number;
      /** <schema> Total money in gold */
      total: number;
    };
    /** <derived> Movement speed */
    movementSpeed: {
      /** <derived> Base movement speed */
      base: number;
      /** <derived> Current movement speed */
      value: number;
    };
    /** <schema> Mana points */
    mp: {
      /** <base> Base MP */
      base: number;
      /** <base> Maximum MP */
      max: number;
      /** <derived> Minimum MP */
      min: number;
      /** <schema> Morganti drained MP */
      morganti: number;
      /** <schema> Temp MP */
      temp: number;
      /** <schema> Current MP */
      value: number;
    };
    /** <schema> Offense */
    offense: {
      /** <schema> Style bonus */
      sb: boolean;
      /** <schema> Piercing type */
      piercing: "av0" | "ub" | "none";
    };
    /** <schema> Parent */
    parent: TeriockActor;
    /** <base> Presence */
    presence: {
      /** <base> Maximum presence tier */
      max: number;
      /** <base> Minimum presence tier */
      min: number;
      /** <derived> Currently used presence tier */
      value: number;
      /** <derived> Too much presence being used */
      overflow: boolean;
    };
    /** <base> Protections */
    protections: {
      /** <base> Hexproofs */
      hexproofs: ProtectionData;
      /** <base> Hexseals */
      hexseals: ProtectionData;
      /** <base> Immunities */
      immunities: ProtectionData;
      /** <base> Resistances */
      resistances: ProtectionData;
    };
    /** <base> Scaling bonuses */
    scaling: {
      /** <base> Battle rating */
      br: number;
      /** <schema> Scale off BR instead of LVL */
      brScale: boolean;
      /** <base> Fluency bonus derived from level */
      f: number;
      /** <schema> Level */
      lvl: number;
      /** <base> Proficiency bonus derived from level */
      p: number;
      /** <base> Total rank derived from level */
      rank: number;
      /** <base> Scaling term, either LVL or BR */
      scale: number;
    };
    /** <schema> Senses */
    senses: {
      /** <schema> Blind fighting */
      blind: number;
      /** <schema> Dark vision */
      dark: number;
      /** <schema> Ethereal vision */
      ethereal: number;
      /** <schema> Advanced hearing */
      hearing: number;
      /** <schema> See invisible */
      invisible: number;
      /** <schema> Night vision */
      night: number;
      /** <schema> Advanced sight */
      sight: number;
      /** <schema> Advanced smell */
      smell: number;
      /** <schema> True sight */
      truth: number;
    };
    /** <base> HTML strings that get displayed on the sheet */
    sheet: SheetData;
    /** <schema> Size */
    size: {
      /** <schema> Numbered size */
      number: Teriock.Fields.ModifiableDeterministic;
      /** <derived> Named size category */
      category: string;
      /** <derived> */
      reach: number;
      /** <derived> */
      length: number;
    };
    /** <base> Speed adjustments */
    speedAdjustments: {
      /** <base> Climb speed */
      climb: number;
      /** <base> Crawl speed */
      crawl: number;
      /** <base> Difficult terrain speed */
      difficultTerrain: number;
      /** <base> Dig speed */
      dig: number;
      /** <base> Dive speed */
      dive: number;
      /** <base> Fly speed */
      fly: number;
      /** <base> Hidden speed */
      hidden: number;
      /** <base> Horizontal leap speed */
      leapHorizontal: number;
      /** <base> Vertical leap speed */
      leapVertical: number;
      /** <base> Swim speed */
      swim: number;
      /** <base> Walk speed */
      walk: number;
    };
    statDice: {
      hp: {
        dice: StatDieModel[];
        html: string;
      };
      mp: {
        dice: StatDieModel[];
        html: string;
      };
    };
    /** <base> Trackers */
    trackers: Record<
      Teriock.Parameters.Condition.ConditionKey,
      Teriock.UUID<TeriockTokenDocument>[]
    >;
    /** <schema> Tradecrafts */
    tradecrafts: Record<Teriock.Parameters.Fluency.Tradecraft, TradecraftData>;
    /** <base> Transformation */
    transformation: {
      /** <base> Transformed token art */
      image: string | null;
      /** <schema> */
      primary: Teriock.ID<TeriockConsequence> | null;
      /** <base> */
      effect: TeriockConsequence | null;
      /** <base> */
      species: TeriockSpecies[];
      /** <base> */
      level: Teriock.Parameters.Shared.TransformationLevel;
      /** <base> */
      suppression: {
        /** <base> Whether to suppress body parts */
        bodyParts: boolean;
        /** <base> Whether to suppress equipment */
        equipment: boolean;
        /** <base> Whether to suppress fluencies */
        fluencies: boolean;
        /** <base> Whether to suppress ranks */
        ranks: boolean;
      };
    };
    /** <schema> Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;
    /** <schema> Weight of the actor and what they carry */
    weight: {
      /** <derived> Total weight carried by the actor (equipment + money) */
      carried: number;
      /** <derived> Weight of the actor's equipment */
      equipment: number;
      /** <derived> Weight of the actor's money */
      money: number;
      /** <schema> Weight of the actor */
      self: Teriock.Fields.ModifiableDeterministic;
      /** <derived> Total weight of the actor and everything they carry (self + carried) */
      value: number;
    };
    /** <schema> Wielding */
    wielding: {
      /** <schema> Primary attacker ID */
      attacker: Teriock.ID<TeriockEquipment> | null;
      /** <schema> Primary blocker ID */
      blocker: Teriock.ID<TeriockEquipment> | null;
    };
    /** <schema> Wither */
    wither: BarData;
  }
}

declare module "./base-actor-data.mjs" {
  export default interface TeriockBaseActorModel extends TeriockBaseActorData {
    get parent(): TeriockActor;
  }
}
