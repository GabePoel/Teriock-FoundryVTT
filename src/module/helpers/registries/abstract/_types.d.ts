declare global {
  namespace Teriock.Registries {
    export interface SingleRegistry<K, V, L> {
      /** Track something within this registry. */
      track(key: K, value: V): void;
      /** Remove a tracked value from this registry. */
      untrack(key: K, value: V): void;
      /** Retrieve a value from this registry. */
      get(key: L): V | undefined;
    }

    export interface MultiRegistry<K, V, L> {
      /** Track something within this registry. */
      track(key: K, value: V): void;
      /** Remove a tracked value from this registry. */
      untrack(key: K, value: V): void;
      /** Retrieve values from this registry. */
      get(key: L): V[];
    }
  }
}

export {};
