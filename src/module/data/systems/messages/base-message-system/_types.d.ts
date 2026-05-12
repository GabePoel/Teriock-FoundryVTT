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
      /** <schema> Content to be displayed in addition to and above {@link BaseRoll} results */
      content: string;
      /** <schema> Panels to render */
      panels: Teriock.Messages.MessagePanel[];
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
