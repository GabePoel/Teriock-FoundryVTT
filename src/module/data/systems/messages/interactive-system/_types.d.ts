import { TeriockToken } from "../../../../canvas/placeables/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { TeriockActor, TeriockChatMessage, TeriockTokenDocument } from "../../../../documents/_module.mjs";
import { TypeCollection } from "../../../../documents/collections/_module.mjs";
import { BaseActivation } from "../../../pseudo-documents/activations/abstract/_module.mjs";

declare global {
  namespace Teriock.Data {
    export type InteractiveMessageData = Teriock.Data.BaseMessageData & {
      /** <schema> Activations */
      activations: Record<ID, object>;
      /** <schema> Speaker avatar image */
      img: string;
      /** <schema> Panels to render */
      panels: Teriock.Panels.PanelParts[];
      /** <schema> Source document */
      source: UUID<TeriockDocument> | null;
      /** <schema> Strings to be wrapped as tags at the bottom of the message */
      tags: string[];
      /** <schema> Rolls paired with the targets they were made against */
      targetGroups: Teriock.Models.TargetGroupData[];
    };
  }

  namespace Teriock.Models {
    type Target = {
      actorUuid: UUID<TeriockActor> | null;
      img: Teriock.System.ImageString;
      name: string;
      tokenUuid: UUID<TeriockTokenDocument> | null;
    };

    /** Anything that can be normalized into a {@link Target}. */
    type RawTarget = Partial<Target> | TeriockActor | TeriockToken | TeriockTokenDocument;

    type TargetGroupData = { flavor: string, roll: string | null, targets: Target[] };

    type TargetGroup = { flavor: string, roll: BaseRoll | null, targets: Target[] };

    type TargetGroupContext = Record<string, unknown> & { flavor: string, hasRoll: boolean, targets: Target[] };

    export type InteractiveMessageSystemData = Teriock.Models.BaseMessageSystemData & {
      activations: TypeCollection<ID<BaseActivation>, BaseActivation>;
      img: string;
      panels: Teriock.Panels.PanelParts[];
      source: UUID<TeriockDocument> | null;
      tags: string[];
      targetGroups: TargetGroup[];

      get parent(): TeriockChatMessage;
    };
  }
}

export {};
