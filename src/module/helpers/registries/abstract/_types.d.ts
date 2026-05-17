declare global {
  namespace Teriock.Registries {
    export interface Lifecycle {
      /** Activate this registry. */
      activate(): Promise<void>;
      /** Deactivate this registry. */
      deactivate(): void;
      /** Whether this registry is currently active. */
      get active(): boolean;
      /** A promise that resolves then the registry has finished activating. */
      get ready(): Promise<void>;
    }

    export interface SingleRegistry<K, V, L> extends Lifecycle {
      /** Track something within this registry. */
      track(key: K, value: V): void;
      /** Remove a tracked value from this registry. */
      untrack(key: K, value: V): void;
      /** Retrieve a value from this registry. */
      get(key: L): V | undefined;
    }

    export interface MultiRegistry<K, V, L> extends Lifecycle {
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
