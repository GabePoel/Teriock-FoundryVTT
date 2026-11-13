import { Panel } from "../../../pseudo-documents/_module.mjs";
import { PseudoCollection } from "../../../pseudo-documents/collections/_module.mjs";

declare module "./interactive-system.mjs" {
  export default interface InteractiveSystem {
    activations: PseudoCollection<Activation>;
    img: string;
    origin: UUID<TeriockDocument> | null;
    panels: PseudoCollection<Panel>;
    restrictVisibility: boolean;
    tags: string[];
  }
}

export {};
