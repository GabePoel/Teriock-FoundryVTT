import type { ActorStat } from "./stats";
import type { HackDataCollection } from "../types/default";
import type { ActorArmorValue } from "./armor";
import type { ProtectionData } from "../types/protections";
import { TradecraftData } from "../types/tradecrafts";

export default interface NewActorData {
  ac: number;
  av: number;
  bv: number;
  combat: {
    attackPenalty: number;
    armor: ActorArmorValue;
    sb: boolean;
    hasReaction: boolean;
  };
  f: number;
  hacks: HackDataCollection;
  hp: ActorStat;
  lvl: number;
  mp: ActorStat;
  p: number;
  protections: {
    hexproofs: ProtectionData;
    hexseals: ProtectionData;
    immunities: ProtectionData;
    resistances: ProtectionData;
  };
  size: number;
  tradecrafts: Record<Teriock.Parameters.Fluency.Tradecraft, TradecraftData>;
  wielding: {
    blocker: {
      raw: string;
      value: object;
    };
    attacker: {
      raw: string;
      value: object;
    };
  };
}
