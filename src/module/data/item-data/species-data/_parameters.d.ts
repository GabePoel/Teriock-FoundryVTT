import type { traits } from "../../../constants/index/_module.mjs";

declare global {
  namespace Teriock.Parameters.Species {
    export type Trait = keyof typeof traits;
  }
}
