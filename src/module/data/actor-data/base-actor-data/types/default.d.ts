import { TeriockActor } from "../../../../documents/_module.mjs";
import { ActorAttributeData, ActorHackData, BarData } from "./stats";
import { ProtectionData } from "./protections";
import { TeriockEquipment, TeriockRank, TeriockSpecies } from "../../../../documents/_documents.mjs";
import { TradecraftData } from "./tradecrafts";

/** The types of hacks that could be applied. */
export interface HackDataCollection {
  /** Arm hacks */
  arm: ActorHackData;
  /** Body hacks */
  body: ActorHackData;
  /** Ear hacks */
  ear: ActorHackData;
  /** Eye hacks */
  eye: ActorHackData;
  /** Leg hacks */
  leg: ActorHackData;
  /** Mouth hacks */
  mouth: ActorHackData;
  /** Nose hacks */
  nose: ActorHackData;
}

export interface TeriockBaseActorDefault {
  /** Attack penalty */
  attackPenalty: number;
  /** Attributes */
  attributes: {
    /** Intelligence */
    int: ActorAttributeData;
    /** Movement */
    mov: ActorAttributeData;
    /** Perception */
    per: ActorAttributeData;
    /** Sneak */
    snk: ActorAttributeData;
    /** Strength */
    str: ActorAttributeData;
    /** Unused presence */
    unp: ActorAttributeData;
  };
  /** Attunements - IDs of attuned equipment */
  attunements: Set<Teriock.ID<TeriockEquipment>>;
  /** Carrying capacity */
  carryingCapacity: {
    /** Light carrying capacity */
    light: number;
    /** Heavy carrying capacity */
    heavy: number;
    /** Maximum carrying capacity */
    max: number;
  };
  /** Defined damage dice/expressions */
  damage: {
    /** Standard damage */
    standard: string;
  };
  /** Hacks */
  hacks: HackDataCollection;
  /** Whether {@link TeriockActor} still has reaction */
  hasReaction: boolean;
  /** Hit points */
  hp: BarData & {
    /** Base hit points */
    base: number;
    /** Temporary hit points */
    temp: number;
  };
  /** Immunities */
  immunities: ProtectionData;
  /** Level */
  lvl: number;
  /** Money */
  money: {
    /** Copper coins */
    copper: number;
    /** Silver coins */
    silver: number;
    /** Gold coins */
    gold: number;
    /** Ent tear amber */
    entTearAmber: number;
    /** Fire eye rubies */
    fireEyeRuby: number;
    /** Pixie plum amethysts */
    pixiePlumAmethyst: number;
    /** Snow diamonds */
    snowDiamond: number;
    /** Dragon emeralds */
    dragonEmerald: number;
    /** Moon opals */
    moonOpal: number;
    /** Magus quartz */
    magusQuartz: number;
    /** Heartstone rubies */
    heartstoneRuby: number;
    /** Debt */
    debt: number;
    /** Total money in gold */
    total: number;
  };
  /** Movement speed */
  movementSpeed: {
    /** Base movement speed */
    base: number;
    /** Current movement speed */
    value: number;
  };
  /** Mana points */
  mp: BarData & {
    /** Base mana points */
    base: number;
    /** Temporary mana points */
    temp: number;
  };
  /** Natural armor value */
  naturalAv: number;
  /** Orderings */
  orderings: {
    ranks: Teriock.ID<TeriockRank>[];
    species: Teriock.ID<TeriockSpecies>[];
  };
  /** Parent actor */
  parent: TeriockActor;
  /** Piercing type */
  piercing: string;
  /** Presence */
  presence: BarData;
  /** Resistances */
  resistances: ProtectionData;
  /** Style bonus */
  sb: boolean;
  /** Senses */
  senses: {
    /** Night vision */
    night: number;
    /** Dark vision */
    dark: number;
    /** Ethereal vision */
    ethereal: number;
    /** Blind fighting */
    blind: number;
    /** True sight */
    truth: number;
    /** Advanced smell */
    smell: number;
    /** Advanced hearing */
    hearing: number;
    /** Advanced sight */
    sight: number;
    /** See invisible */
    invisible: number;
  };
  /** Size */
  size: number;
  /** Speed adjustments */
  speedAdjustments: {
    /** Walk speed */
    walk: number;
    /** Climb speed */
    climb: number;
    /** Crawl speed */
    crawl: number;
    /** Difficult terrain speed */
    difficultTerrain: number;
    /** Dig speed */
    dig: number;
    /** Dive speed */
    dive: number;
    /** Fly speed */
    fly: number;
    /** Hidden speed */
    hidden: number;
    /** Horizontal leap speed */
    leapHorizontal: number;
    /** Vertical leap speed */
    leapVertical: number;
    /** Swim speed */
    swim: number;
  };
  /** Tradecrafts */
  tradecrafts: Record<Teriock.Parameters.Fluency.Tradecraft, TradecraftData>;
  /** Update counter - used to force an update when adding/removing effects */
  updateCounter: boolean;
  /** Weight */
  weight: number;
  /** Wielding */
  wielding: {
    /** Primary attacker */
    attacker: {
      /** ID for primary attacker */
      raw: Teriock.ID<TeriockEquipment> | null;
      /** @derived Derived primary attacker item */
      derived: TeriockEquipment | null;
    };
    /** Primary blocker */
    blocker: {
      /** ID for primary attacker */
      raw: Teriock.ID<TeriockEquipment> | null;
      /** @derived Derived primary attacker item */
      derived: TeriockEquipment | null;
    };
  };
  /** Wither */
  wither: BarData;
  /** Worn armor class */
  wornAc: number;
  /** Death Bag */
  deathBag: {
    /** How many stones to pull from the Death Bag */
    pull: string;
    /** The colors of stones in the Death Bag */
    stones: {
      black: string;
      red: string;
      white: string;
    }
  };
}
