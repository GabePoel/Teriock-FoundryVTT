import { IdentifiersRegistry } from "./registries/_module.mjs";

/**
 * @import { ApplicationV2 } from "@client/applications/api/_module.mjs";
 */

/**
 * Singleton class that manages Teriock-specific states and functionality.
 */
export default class TeriockManager {
  /** @type {TeriockActiveEffect<"ability">[]} */
  #basicAbilities = [];

  /** @type {ApplicationV2[]} */
  #minimizedApplications = [];

  /**
   * A private record of registries.
   * @type {{identifiers: IdentifiersRegistry}}
   */
  #registries = { identifiers: new IdentifiersRegistry() };

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
   * Actors that need basic abilities added to them once ready.
   * @type {Set<TeriockActor>}
   */
  actorsNeedingBasicAbilities = new Set();

  /**
   * Whether i18n localization is ready.
   * @type {boolean}
   */
  i18nReady = false;

  /**
   * Resolves when all Handlebars template aliases from `templates.json` are registered.
   * @type {Promise<Handlebars.TemplateDelegate[]>}
   */
  templatesReady = Promise.resolve([]);

  /**
   * All the basic abilities.
   * @returns {TeriockActiveEffect<"ability">[]}
   */
  get basicAbilities() {
    return this.#basicAbilities;
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
   * @param {ApplicationV2|TeriockDocument} appOrDoc
   * @returns {boolean}
   */
  checkEditable(appOrDoc) {
    const sheet = appOrDoc instanceof foundry.abstract.Document ? appOrDoc.sheet : appOrDoc;
    const valid = Boolean(sheet.isEditable);
    if (!valid) { ui.notifications.notify("TERIOCK.DIALOGS.Common.ERRORS.notEditable", "error", { localize: true }); }
    return valid;
  }

  /**
   * Check if there's an active scene and give a warning if not.
   * @returns {boolean}
   */
  checkScene() {
    const valid = Boolean(canvas?.scene);
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
   * Initialize the identifiers registry.
   */
  initializeIdentifiers() {
    this.#registries.identifiers._initialize();
    this.#registries.identifiers.initializing.then(async () => {
      this.#basicAbilities = (await teriock.fromIdentifier("power:basic-abilities"))?.children.documentsByType.ability;
      game.tables.forEach(t => t.prepareData());
      for (const a of this.actorsNeedingBasicAbilities) { a.resetChildMaps(); }
      this.actorsNeedingBasicAbilities.clear();
      Hooks.call("teriock.identifiersInit");
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

  /**
   * Re-render UI components.
   * @param {object} [options]
   * @param {boolean} [options.actors=false] - Re-render Actor sheets.
   * @param {boolean} [options.applications=false] - Re-render all Applications.
   * @param {boolean} [options.compendiums=false] - Re-render compendiums.
   * @param {boolean} [options.sidebar=false] - Re-render sidebar.
   * @param {boolean} [options.tooltips=false] - Re-render tooltips.
   * @returns {Promise<void>}
   */
  async render({ actors = false, applications = false, compendiums = false, sidebar = false, tooltips = false } = {}) {
    const promises = [];
    for (const app of foundry.applications.instances.values()) {
      if (!app.rendered) { continue; }
      const shouldRender = applications
        || (actors && app instanceof foundry.applications.sheets.ActorSheetV2)
        || (compendiums && app instanceof foundry.applications.sidebar.apps.Compendium)
        || (sidebar && app instanceof foundry.applications.sidebar.AbstractSidebarTab);
      if (shouldRender) { promises.push(app.render()); }
    }
    await Promise.all(promises);
    if (tooltips) { game.tooltip.reactivate(); }
  }
}
