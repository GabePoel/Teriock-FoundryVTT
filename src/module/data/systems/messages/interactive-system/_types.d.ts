import { PseudoCollection } from "../../../pseudo-documents/collections/_module.mjs";

declare module "./interactive-system.mjs" {
  export default interface InteractiveSystem extends Teriock.Models.BaseMessageSystemData {
    activations: PseudoCollection<Activation>;
    img: string;
    panels: Teriock.Panels.PanelParts[];
    restrictVisibility: boolean;
    source: UUID<TeriockDocument> | null;
    tags: string[];
  }
}

declare global {
  namespace Teriock.Data {
    export type InteractiveMessageData = Teriock.Data.BaseMessageData & {
      /** <schema> Activations */
      activations: Record<ID, object>;
      /** <schema> Speaker avatar image */
      img: string;
      /** <schema> Panels to render */
      panels: Teriock.Panels.PanelParts[];
      /** <schema> Whether this should restrict viewership more than base messages do by default */
      restrictVisibility: boolean;
      /** <schema> Source document */
      source: UUID<TeriockDocument> | null;
      /** <schema> Strings to be wrapped as tags at the bottom of the message */
      tags: string[];
    };
  }

  namespace Teriock.Models {
  }
}

export {};
