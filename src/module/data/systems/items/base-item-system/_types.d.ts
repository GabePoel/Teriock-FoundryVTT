import { TeriockItem } from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type BaseItemSystemData = {
      /** <schema> Whether this is disabled */
      disabled: boolean;
      /** <schema> Text description of flaws */
      flaws: string;

      get parent(): TeriockItem;
    };
  }
}
