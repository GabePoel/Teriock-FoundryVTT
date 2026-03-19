import {
  TeriockActiveEffect,
  TeriockItem,
} from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type BaseItemSystemData = {
      /** <schema> Whether this is disabled */
      disabled: boolean;
      /** <schema> IDs for each {@link TeriockActiveEffect} that only activates on use of this {@link TeriockItem}. */
      onUse: Set<ID<TeriockActiveEffect>>;

      get parent(): TeriockItem;
    };
  }
}
