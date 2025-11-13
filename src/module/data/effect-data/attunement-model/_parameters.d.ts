import { attunementOptions } from "../../../constants/options/attunement-options.mjs";

declare global {
  namespace Teriock.Parameters.Attunement {
    /** Attunement types */
    export type AttunementType = keyof typeof attunementOptions.attunementType;
  }
}
