import {
  type TeriockAbility,
  type TeriockConsequence,
} from "../documents/_documents.mjs";

export type QueryInCombatExpirationData = {
  effectUuid: Teriock.UUID<TeriockConsequence>;
};

export type QueryAddToSustainingData = {
  sustainingUuid: Teriock.UUID<TeriockAbility>;
  sustainedUuids: Teriock.UUID<TeriockConsequence>[];
};

export type QuerySustainedExpirationData = {
  sustainedUuid: Teriock.UUID<TeriockConsequence>;
};
