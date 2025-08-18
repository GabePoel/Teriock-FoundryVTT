import type { resourceOptions } from "../../../constants/resource-options.mjs";

declare global {
  namespace Teriock.Parameters.Resource {
    /** Function hook */
    export type FunctionHook = keyof typeof resourceOptions.functionHooks;
  }
}
