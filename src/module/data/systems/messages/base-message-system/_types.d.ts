import { TeriockChatMessage } from "../../../../documents/_module.mjs";
import { TypeCollection } from "../../../../documents/collections/_module.mjs";
import { BaseActivation } from "../../../pseudo-documents/activations/abstract/_module.mjs";

declare global {
  namespace Teriock.Data {
    export type BaseMessageData = {
      /** <schema> Activations */
      activations: Record<ID, object>;
      /** <schema> Fallback avatar image to use. */
      avatar: string;
      /** <schema> Custom number of columns */
      columns: number;
      /** <schema> Content to be displayed in addition to {@link BaseRoll} results */
      extraContent: string;
      /** <schema> Panels to render */
      panels: Teriock.MessageData.MessagePanel[];
      /** <schema> Document that the message is sourced from */
      source: UUID<CommonDocument>;
      /** <schema> Strings to be wrapped as tags at the bottom of the message */
      tags: string[];
    };
  }

  namespace Teriock.Models {
    export type BaseMessageSystemData = Teriock.Data.BaseMessageData & {
      activations: TypeCollection<ID<BaseActivation>, BaseActivation>;

      get parent(): TeriockChatMessage;
    };
  }
}
