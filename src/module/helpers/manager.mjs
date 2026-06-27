import { DependentsRegistry, IdentifiersRegistry } from "./registries/_module.mjs";

/**
 * Singleton class that manages Teriock-specific states and functionality.
 */
export default class TeriockManager {
  /** @type {TeriockAbility[]} */
  #basicAbilities = [];

  /** @type {ApplicationV2[]} */
  #minimizedApplications = [];

  /**
   * A private record of registries.
   * @type {{dependents: DependentsRegistry, identifiers: IdentifiersRegistry}}
   */
  #registries = { dependents: new DependentsRegistry(), identifiers: new IdentifiersRegistry() };

  /**
   * Check if what's provided exists or is an empty array or set.
   * @param {Teriock.System.Existable<*>} existable
   * @param {string} [message]
   * @param {string} [type]
   * @param {object} [options]
   * @returns {boolean}
   */
  #check(existable, message, type = "error", options = { localize: true }) {
    let valid = true;
    if (!existable) { valid = false; }
    if (Array.isArray(existable) && !existable.length) { valid = false; }
    if (existable instanceof Set && existable.size === 0) { valid = false; }
    if (message && !valid) { ui.notifications.notify(message, type, options); }
    return valid;
  }

  /**
   * All the basic abilities.
   * @returns {TeriockAbility[]}
   */
  get basicAbilities() {
    return this.#basicAbilities;
  }

  /**
   * The singleton dependents registry.
   * @returns {DependentsRegistry}
   */
  get dependents() {
    return this.#registries.dependents;
  }

  /**
   * The singleton identifiers registry.
   * @returns {IdentifiersRegistry}
   */
  get identifiers() {
    return this.#registries.identifiers;
  }

  /**
   * Check if there's actors and give a warning if not.
   * @param {Teriock.System.Existable<TeriockActor>} actors
   * @returns {boolean}
   */
  checkActors(actors) {
    return this.#check(actors, "TERIOCK.DIALOGS.Common.ERRORS.noActor");
  }

  /**
   * Check if a sheet or document is editable and give a warning if not.
   * @param {ApplicationV2|TeriockDocument} obj
   * @returns {boolean}
   */
  checkEditable(obj) {
    const sheet = obj instanceof foundry.abstract.Document ? obj.sheet : obj;
    const valid = Boolean(sheet.isEditable);
    if (!valid) { ui.notifications.notify("TERIOCK.DIALOGS.Common.ERRORS.notEditable", "error", { localize: true }); }
    return valid;
  }

  /**
   * Check if there's an active scene and give a warning if not.
   * @returns {boolean}
   */
  checkScene() {
    const valid = Boolean(canvas.scene);
    if (!valid) { ui.notifications.notify("TERIOCK.DIALOGS.Common.ERRORS.noScene", "error", { localize: true }); }
    return valid;
  }

  /**
   * Check if there's tokens and give a warning if not.
   * @param {Teriock.System.Existable<TeriockToken|TeriockTokenDocument>} tokens
   * @returns {boolean}
   */
  checkTokens(tokens) {
    return this.#check(tokens, "TERIOCK.DIALOGS.Common.ERRORS.noToken");
  }

  /**
   * Initialize registries.
   */
  initializeRegistries() {
    this.#registries.dependents._initialize();
    this.#registries.identifiers._initialize();
    this.#registries.identifiers.initializing.then(async () => {
      this.#basicAbilities = (await teriock.fromIdentifier("power:basic-abilities")).abilities;
    });
  }

  /**
   * Remove undo {@link minimizeStart}.
   * @returns {Promise<void>}
   */
  async minimizeEnd() {
    if (!this.#minimizedApplications.length) { return; }
    await Promise.all((this.#minimizedApplications || []).map(s => s?.maximize()));
    this.#minimizedApplications = [];
  }

  /**
   * Minimize all applications.
   * @returns {Promise<void>}
   */
  async minimizeStart() {
    this.#minimizedApplications = Array.from(foundry.applications.instances.values()).filter(a =>
      a.hasFrame && !a.minimized
    );
    await Promise.all((this.#minimizedApplications || []).map(s => s?.minimize()));
  }
}
