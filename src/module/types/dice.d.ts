import { RollOptions } from "@client/dice/_types.mjs";

import { TeriockToken } from "../canvas/placeables/_module.mjs";
import { TeriockTokenDocument } from "../documents/_module.mjs";

declare global {
  namespace Teriock.Dice {
    export type DiePartStyle = { classes?: string[], icon?: string, tooltip?: string };

    export type DieStyles = { dice: DiePartStyle, total: DiePartStyle };

    export type DieTarget = {
      actorUuid?: UUID<TeriockActor>;
      img?: Teriock.System.ImageString;
      name?: string;
      tokenUuid?: UUID<TeriockTokenDocument>;
    };

    export type RawDieTarget = DieTarget | TeriockActor | TeriockToken | TeriockTokenDocument;

    export type BaseRollOptions = RollOptions & { hideRoll: boolean, styles: DieStyles, targets: DieTarget[] };

    export type ImpactRollOptions = BaseRollOptions & { impact: Teriock.Keys.Impact };

    export type ThresholdRollOptions = BaseRollOptions & {
      comparison?: Teriock.Keys.Comparison;
      critFailureThreshold: number;
      critSuccessThreshold: number;
      threshold?: number | null;
    };

    export type RollContextMenuConfig = { message?: TeriockChatMessage, messageData?: object, target?: HTMLElement };
  }
}
