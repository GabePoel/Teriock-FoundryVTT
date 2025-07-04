import type { ChildDataMixin } from "../../data/mixins/_types";
import { TeriockEffect } from "../_module.mjs";

export interface ChildDocumentMixin {
  system: ChildDataMixin;
}

export interface ParentDocumentMixinInterface {
  validEffects: TeriockEffect[];

  buildEffectTypes(): {
    effectTypes: Record<string, TeriockEffect[]>;
    effectKeys: Record<string, Set<string>>;
  };

  prepareDerivedData(): void;

  effectTypes: Record<string, TeriockEffect[]>;
  effectKeys: Record<string, Set<string>>;
}
