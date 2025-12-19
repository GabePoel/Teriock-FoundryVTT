import { TeriockEffect, TeriockItem } from "../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface TeriockBaseItemModelInterface
      extends Teriock.Models.ChildTypeModelInterface {
      /** <schema> Whether this is disabled */
      disabled: boolean;
      /** <schema> IDs for each {@link TeriockEffect} that only activates on use of this {@link TeriockItem}. */
      onUse: Set<ID<TeriockEffect>>;

      get parent(): TeriockItem;
    }
  }
}
