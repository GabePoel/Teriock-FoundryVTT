import { EffectChangeData } from "@common/documents/_types.mjs";

interface ConsequenceRolls {
  damage: string[];
  drain: string[];
  wither: string[];
  heal: string[];
  revitalize: string[];
  setTempHp: string[];
  setTempMp: string[];
  gainTempHp: string[];
  gainTempMp: string[];
  sleep: string[];
  kill: string[];
  other: string[];
}

interface ConsequenceHacks {
  arm: string[];
  leg: string[];
  body: string[];
  eye: string[];
  ear: string[];
  mouth: string[];
  nose: string[];
}

interface ConsequenceExpirations {
  turn: {
    who: "target" | "executor" | "every" | "other";
    when: "start" | "end" | "other";
    how: "roll" | "auto";
  };
  movement: boolean;
  dawn: boolean;
  sustained: boolean;
}

interface Consequence {
  instant: {
    rolls: Partial<ConsequenceRolls>;
    hacks: Partial<ConsequenceHacks>;
  };
  ongoing: {
    statuses: string[];
    changes: EffectChangeData[];
    duration: number | null;
    expirations: ConsequenceExpirations;
  };
}

interface Mutations {
  double: boolean;
}

interface Heightened {
  overrides: Consequence;
  scaling: {
    rolls: Partial<ConsequenceRolls>;
    duration: {
      value: number;
      rounding: number;
    };
  };
}

interface SimpleConsequenceData {
  default: Consequence;
  crit: {
    overrides: Consequence;
    mutations: Mutations;
  };
}

interface ModifiedConsequenceData {
  overrides: SimpleConsequenceData;
  mutations: Mutations;
  heightened: Heightened;
}

export interface ConsequencesData {
  base: Record<string, SimpleConsequenceData>;
  proficient: Record<string, ModifiedConsequenceData>;
  fluent: Record<string, ModifiedConsequenceData>;
}

export interface AppliesData {
  statuses: string[];
  damage: string[];
  drain: string[];
  changes: EffectChangeData[];
}
