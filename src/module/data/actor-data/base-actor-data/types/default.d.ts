import { TeriockActor } from "../../../../documents/_module.mjs";
import { ActorAttributeData, BarData, ActorHackData } from "./stats";
import { ProtectionData } from "./protections";
import { TeriockEquipment } from "../../../../documents/_documents.mjs";
import { TradecraftData } from "./tradecrafts";

/** The types of hacks that could be applied. */
export interface HackDataCollection {
  /** Arm hacks */
  arm: ActorHackData;
  /** Leg hacks */
  leg: ActorHackData;
  /** Body hacks */
  body: ActorHackData;
  /** Eye hacks */
  eye: ActorHackData;
  /** Ear hacks */
  ear: ActorHackData;
  /** Mouth hacks */
  mouth: ActorHackData;
  /** Nose hacks */
  nose: ActorHackData;
}

export interface TeriockBaseActorDefault {
  /** Parent actor */
  parent: TeriockActor;
  /** Level */
  lvl: number;
  /** Size */
  size: number;
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
  /** Movement speed */
  movementSpeed: {
    /** Base movement speed */
    base: number;
    /** Current movement speed */
    value: number;
  };
  /** Carrying capacity */
  carryingCapacity: {
    /** Light carrying capacity */
    light: number;
    /** Heavy carrying capacity */
    heavy: number;
    /** Maximum carrying capacity */
    max: number;
  };
  /** Weight */
  weight: number;
  /** Worn armor class */
  wornAc: number;
  /** Natural armor value */
  naturalAv: number;
  /** Attack penalty */
  attackPenalty: number;
  /** Style bonus */
  sb: boolean;
  /** Piercing type */
  piercing: string;
  /** Defined damage dice/expressions */
  damage: {
    /** Standard damage */
    standard: string;
  };
  /** Hacks */
  hacks: HackDataCollection;
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
  /** Hit points */
  hp: BarData & {
    /** Base hit points */
    base: number;
    /** Temporary hit points */
    temp: number;
  };
  /** Mana points */
  mp: BarData & {
    /** Base mana points */
    base: number;
    /** Temporary mana points */
    temp: number;
  };
  /** Wither */
  wither: BarData;
  /** Presence */
  presence: BarData;
  /** Tradecrafts */
  tradecrafts: Record<Teriock.Parameters.Fluency.Tradecraft, TradecraftData>;
  /** Resistances */
  resistances: ProtectionData;
  /** Immunities */
  immunities: ProtectionData;
  /** Update counter - used to force an update when adding/removing effects */
  updateCounter: boolean;
  /** Attunements - IDs of attuned equipment */
  attunements: Set<Teriock.ID<TeriockEquipment>>;
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
  /** Whether {@link TeriockActor} still has reaction */
  hasReaction: boolean;
}
