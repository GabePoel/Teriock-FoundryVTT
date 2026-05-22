import { RollOptions } from "@client/dice/_types.mjs";

import { TeriockToken } from "../../canvas/placeables/_module.mjs";
import { TeriockActor, TeriockTokenDocument } from "../../documents/_module.mjs";
import { BaseRoll } from "./_module.mjs";

declare global {
  namespace Teriock.Dice {
    type DiePartStyle = { classes?: string, icon?: string, tooltip?: string };

    type DieStyles = { dice: DiePartStyle, total: DiePartStyle };

    type DieTarget = {
      actorUuid?: UUID<TeriockActor>;
      img?: Teriock.System.ImageString;
      name?: string;
      rescale?: boolean;
      tokenUuid?: UUID<TeriockTokenDocument>;
    };

    type RawDieTarget = DieTarget | TeriockActor | TeriockToken | TeriockTokenDocument;

    type BaseRollOptions = RollOptions & {
      _id?: ID<BaseRoll>;
      comparison?: Teriock.Fields.ComparisonCheck;
      hideRoll: boolean;
      keepId?: boolean;
      styles: DieStyles;
      targets: DieTarget[];
      threshold?: number | null;
    };

    type ImpactRollOptions = BaseRollOptions & { impact: Teriock.Keys.Impact };

    type ThresholdRollOptions = BaseRollOptions & { critFailureThreshold: number, critSuccessThreshold: number };
  }
}
