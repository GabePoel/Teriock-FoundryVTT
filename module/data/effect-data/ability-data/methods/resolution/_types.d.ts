import { EffectChangeData } from "@common/documents/_types.mjs";

type ConsequenceExpiration = {
  type: "condition" | "dawn" | "stationary";
  condition?: {
    value: string | null;
    present: boolean;
  };
};

type ConsequenceDuration = {
  time: number | null;
  expirations: ConsequenceExpiration[];
};

type Consequence = {
  type: "instant" | "ongoing";
  effect: object;
  duration: ConsequenceDuration | null;
};

type InstantConsequence = Consequence & {
  type: "instant";
  duration: null;
  effect: {
    type: string;
    value: number;
  };
};

type OngoingConsequence = Consequence & {
  type: "ongoing";
  duration: ConsequenceDuration;
  effect: {
    conditions: string[];
    changes: EffectChangeData[];
  };
};

export type AbilityResolution = {
  consequences: Consequence[];
};
