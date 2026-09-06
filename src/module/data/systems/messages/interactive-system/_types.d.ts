import { Panel } from "../../../pseudo-documents/_module.mjs";
import { PseudoCollection } from "../../../pseudo-documents/collections/_module.mjs";

declare module "./interactive-system.mjs" {
  export default interface InteractiveSystem {
    activations: PseudoCollection<Activation>;
    img: string;
    panels: PseudoCollection<Panel>;
    restrictVisibility: boolean;
    source: UUID<TeriockDocument> | null;
    tags: string[];
  }
}

export {};
