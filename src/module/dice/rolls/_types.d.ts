import { RollOptions } from "@client/dice/_types.mjs";

import { TeriockToken } from "../../canvas/placeables/_module.mjs";
import { TeriockActor, TeriockChatMessage, TeriockTokenDocument } from "../../documents/_module.mjs";

declare global {
  namespace Teriock.Dice {
    type DiePartStyle = { classes?: string[], icon?: string, tooltip?: string };

    type DieStyles = { dice: DiePartStyle, total: DiePartStyle };

    type DieTarget = {
      actorUuid?: UUID<TeriockActor>;
      img?: Teriock.System.ImageString;
      name?: string;
      tokenUuid?: UUID<TeriockTokenDocument>;
    };

    type RawDieTarget = DieTarget | TeriockActor | TeriockToken | TeriockTokenDocument;

    type BaseRollOptions = RollOptions & { hideRoll: boolean, styles: DieStyles, targets: DieTarget[] };

    type ImpactRollOptions = BaseRollOptions & { impact: Teriock.Keys.Impact };

    type ThresholdRollOptions = BaseRollOptions & {
      comparison?: Teriock.Keys.Comparison;
      critFailureThreshold: number;
      critSuccessThreshold: number;
      threshold?: number | null;
    };

    type RollContextMenuConfig = { message?: TeriockChatMessage, messageData?: object, target?: HTMLElement };
  }
}
