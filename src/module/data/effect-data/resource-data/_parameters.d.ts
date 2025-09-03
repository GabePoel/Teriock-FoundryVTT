import type { resourceOptions } from "../../../constants/options/resource-options.mjs";

declare global {
  namespace Teriock.Parameters.Resource {
    /** Function hook */
    export type FunctionHook = keyof typeof resourceOptions.functionHooks;
  }
}
