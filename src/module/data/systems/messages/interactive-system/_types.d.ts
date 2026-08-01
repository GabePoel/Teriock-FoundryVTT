import type BaseRoll from "../../../../dice/rolls/base-roll.mjs";
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
    };
  }

  namespace Teriock.Models {
    type Target = {
      actorUuid: UUID<TeriockActor>;
      img: Teriock.System.ImageString;
      name: string;
      tokenUuid: UUID<TeriockTokenDocument>;
    };

    type TargetGroup = { roll: BaseRoll | null, targets: Target[] };

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
