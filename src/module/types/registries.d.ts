declare global {
  namespace Teriock.Registries {
    export interface SingleRegistry<K, V, L> {
      /** Track something within this registry. */
      track(key: K, value: V, options?: object): void;
      /** Remove a tracked value from this registry. */
      untrack(key: K, value: V, options?: object): void;
      /** Retrieve a value from this registry. */
      get(key: L, options?: object): V | undefined;
    }
  }
}

export {};
