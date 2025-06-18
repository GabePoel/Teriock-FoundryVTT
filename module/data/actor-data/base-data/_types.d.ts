import { TeriockActor } from "../../../documents/_module.mjs";
import { AttributeData, HackData, SheetData, TradecraftData } from "./methods/schema/_types";

declare module "./base-data.mjs" {
  export default interface TeriockBaseActorData {
    parent: TeriockActor;
    lvl: number;
    size: number;
    attributes: {
      int: AttributeData;
      mov: AttributeData;
      per: AttributeData;
      snk: AttributeData;
      str: AttributeData;
      unp: AttributeData;
    }
    movementSpeed: number;
    carryingCapacity: {
      light: number;
      heavy: number;
      max: number;
    };
    weight: number;
    wornAc: number;
    naturalAv: number;
    attackPenalty: number;
    sb: boolean;
    piercing: string;
    damage: {
      standard: string;
      hand: string;
      foot: string;
      mouth: string;
      bucklerShield: string;
      largeShield: string;
      towerShield: string;
    };
    hacks: {
      arm: HackData;
      leg: HackData;
      body: HackData;
      eye: HackData;
      ear: HackData;
      mouth: HackData;
      nose: HackData;
    };
    money: {
      copper: number;
      silver: number;
      gold: number;
      entTearAmber: number;
      fireEyeRuby: number;
      pixiePlumAmethyst: number;
      snowDiamond: number;
      dragonEmerald: number;
      moonOpal: number;
      magusQuartz: number;
      heartstoneRuby: number;
      total: number;
    };
    senses: {
      night: number;
      dark: number;
      ethereal: number;
      blind: number;
      truth: number;
      smell: number;
      hearing: number;
      sight: number;
    };
    sheet: SheetData;
    speed: {
      walk: number;
      climb: number;
      crawl: number;
      difficultTerrain: number;
      dig: number;
      dive: number;
      fly: number;
      hidden: number;
      leapHorizontal: number;
      leapVertical: number;
      swim: number;
    };
    hp: {
      min: number;
      max: number;
      value: number;
      base: number;
      temp: number;
    };
    mp: {
      min: number;
      max: number;
      value: number;
      base: number;
      temp: number;
    };
    wither: {
      min: number;
      max: number;
      value: number;
    };
    presence: {
      min: number;
      max: number;
      value: number;
    }
    tradecrafts: Record<string, TradecraftData>;
  }
}
