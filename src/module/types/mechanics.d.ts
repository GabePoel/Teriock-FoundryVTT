import { MechanicPseudoDocument } from "../data/pseudo-documents/abstract/_module.mjs";

declare global {
  namespace Teriock.Mechanics {
    type MechanicToggleEntry = {
      group: string;
      icon: string;
      id: string;
      name?: string;
      off: string;
      on: string;
      variant?: boolean;
      visible?: (pseudo: MechanicPseudoDocument, doc: TeriockDocument) => boolean;
    };

    type MechanicToggleState = MechanicToggleEntry & { active: boolean };
  }
}

export {};
