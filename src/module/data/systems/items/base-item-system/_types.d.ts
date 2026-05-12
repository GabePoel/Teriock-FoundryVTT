import { TeriockItem } from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type BaseItemSystemData = {
      /** <schema> Whether this is disabled */
      disabled: boolean;

      get parent(): TeriockItem;
    };
  }
}
