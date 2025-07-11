import type { ChildDataMixin } from "../../data/mixins/_types";
import { TeriockEffect } from "../_module.mjs";

export interface ChildDocumentMixin {
  system: ChildDataMixin;
}

export interface ParentDocumentMixinInterface {
  validEffects: TeriockEffect[];
  effectTypes: Record<string, TeriockEffect[]>;
  effectKeys: Record<string, Set<string>>;

  buildEffectTypes(): {
    effectTypes: Record<string, TeriockEffect[]>;
    effectKeys: Record<string, Set<string>>;
  };

  prepareDerivedData(): void;
}
