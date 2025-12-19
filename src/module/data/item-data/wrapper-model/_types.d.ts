import { TeriockEffect } from "../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface TeriockWrapperModelInterface
      extends Teriock.Models.TeriockBaseItemModelInterface {
      get parent(): TeriockWrapper<TeriockEffect>;
    }
  }
}
