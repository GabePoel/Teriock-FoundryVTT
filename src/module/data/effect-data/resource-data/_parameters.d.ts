declare global {
  namespace Teriock.Parameters.Resource {
    /** Function hook */
    export type FunctionHook = keyof typeof TERIOCK.options.resource.functionHooks;
  }
}

export {};
