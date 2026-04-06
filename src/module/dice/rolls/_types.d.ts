import {
  TeriockActor,
  TeriockTokenDocument,
} from "../../documents/_module.mjs";
import { TeriockToken } from "../../canvas/placeables/_module.mjs";

declare global {
  namespace Teriock.Dice {
    type DiePartStyle = {
      classes?: string;
      tooltip?: string;
      icon?: string;
    };

    type DieStyles = {
      dice: DiePartStyle;
      total: DiePartStyle;
    };

    type DieTarget = {
      actorUuid?: UUID<TeriockActor>;
      img?: Teriock.System.ImageString;
      name?: string;
      rescale?: boolean;
      tokenUuid?: UUID<TeriockTokenDocument>;
    };

    type RawDieTarget =
      | TeriockToken
      | TeriockActor
      | TeriockTokenDocument
      | DieTarget;

    type BaseRollOptions = {
      hideRoll: boolean;
      styles: DieStyles;
      targets: DieTarget[];
      threshold?: number | null;
      comparison?: Teriock.Fields.ComparisonCheck;
    };

    type ImpactRollOptions = BaseRollOptions & {
      impact: Teriock.Keys.Impact;
    };
  }
}
