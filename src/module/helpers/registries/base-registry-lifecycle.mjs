/**
 * A base registry lifecycle pattern.
 */
export default class BaseRegistryLifecycle {
  constructor() {
    this.#setInitialization();
  }

  /**
   * Whether this registry's initialization is complete.
   * @type {boolean}
   */
  #initialized = false;

  /** @type {Promise<void>} */
  #initializing;

  /** @type {(value?: PromiseLike<void> | void) => void} */
  #resolveInitialization;

  /**
   * Initializes or resets the initialization promise.
   */
  #setInitialization() {
    this.#initializing = new Promise(resolve => {
      this.#resolveInitialization = resolve;
    });
  }

  /**
   * Whether this registry's initialization is complete.
   */
  get initialized() {
    return this.#initialized;
  }

  /**
   * A promise that resolves when the registry is first initialized and ready.
   * @returns {Promise<void>}
   */
  get initializing() {
    return this.#initializing;
  }

  /**
   * Populate the registry for the first time.
   */
  _initialize() {
    if (!game._documentsReady || this.#initialized) { return; }
    this.#resolveInitialization();
    this.#initialized = true;
  }
}
