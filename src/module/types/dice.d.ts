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

    export type BaseRollOptions = RollOptions & {
      autoFlavor: string;
      flavor: string;
      hideRoll: boolean;
      styles: DieStyles;
      targets: DieTarget[];
    };

    export type ImpactsRollOptions = BaseRollOptions & { impacts: Teriock.Keys.Impact[] };

    export type ThresholdTarget = number | "max" | "min";

    export type ThresholdLevel = -1 | -2 | 0 | 1 | 2;

    export type ThresholdType = "die" | "roll";

    export type ThresholdData = {
      comparison: Teriock.Keys.Comparison;
      inverse: boolean;
      label: string;
      level: ThresholdLevel;
      target: ThresholdTarget;
      type: ThresholdType;
    };

    export type ThresholdRollOptions = BaseRollOptions & { thresholds?: ThresholdData[] };

    export type RollContextMenuConfig = { message?: TeriockChatMessage, messageData?: object, target?: HTMLElement };
  }
}
