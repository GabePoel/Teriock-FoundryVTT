import type { traits } from "../../../helpers/constants/generated/traits.mjs";

declare global {
  namespace Teriock.Parameters.Species {
    export type Trait = keyof typeof traits;
  }
}
