import { TeriockActor, TeriockTokenDocument } from "../documents/_module.mjs";
import { TeriockToken } from "../canvas/placeables/_module.mjs";

declare global {
  namespace Teriock.Dice {
    export type RollTargetOption =
      | TeriockActor
      | TeriockTokenDocument
      | TeriockToken
      | Teriock.Dice.RollTarget;
    export type RollTarget = {
      actorUuid?: UUID<TeriockActor>;
      img: string;
      name: string;
      rescale: boolean;
      tokenUuid?: UUID<TeriockTokenDocument>;
    };
    export type RollOptions = {
      comparison?: Teriock.Fields.ComparisonCheck;
      hideRoll?: boolean;
      infinity?: boolean;
      styles?: {
        dice?: {
          classes?: string;
          tooltip?: string;
          icon?: string;
        };
        total?: {
          classes?: string;
          tooltip?: string;
          icon?: string;
        };
      };
      targets?: Teriock.Dice.RollTargetOption[];
      threshold?: number | null;
    };
    export type TakeRollOptions = Teriock.Dice.RollOptions & {
      take?: Teriock.Parameters.Consequence.RollConsequenceKey;
    };
  }
}

export {};
