/**
 * A base registry lifecycle pattern.
 * @implements {Teriock.Registries.Lifecycle}
 */
export default class RegistryLifecycle {
  /**
   * Whether this registry is currently disabled.
   * @type {boolean}
   */
  #disabled = true;

  /** @type {Promise<void>} */
  #readyPromise;

  /** @type {function(): void} */
  #resolveReady;

  constructor() {
    this.#initializePromise();
  }

  /** @inheritDoc */
  get active() {
    return !this.#disabled;
  }

  /** @inheritDoc */
  get ready() {
    return this.#readyPromise;
  }

  /**
   * Initializes or resets the ready promise.
   */
  #initializePromise() {
    this.#readyPromise = new Promise(resolve => {
      this.#resolveReady = resolve;
    });
  }

  /** @inheritDoc */
  async activate() {
    this.#disabled = false;
    this.#resolveReady();
  }

  /** @inheritDoc */
  deactivate() {
    this.#disabled = true;
    // Reset the promise so it can be awaited again if the registry is reactivated
    this.#initializePromise();
  }
}
