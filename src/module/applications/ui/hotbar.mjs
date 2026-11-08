import { TeriockMacro } from "../../documents/_module.mjs";
import { findBestDocument, fromIdentifier, makeIcon, toId } from "../../utils/_module.mjs";

const { Hotbar } = foundry.applications.ui;

/** @inheritDoc */
export default class TeriockHotbar extends Hotbar {
  /**
   * Use the documents matching an identifier.
   * @param {string} identifier
   * @param {object} [options]
   * @param {TeriockActor} [options.actor]
   * @param {PointerEvent} [options.event]
   * @returns {Promise<void>}
   */
  static async useMatches(identifier, options) {
    const { actor, event } = options;
    const actors = actor ? [actor] : game.actors.rollers;
    for (const a of actors) { await a.useDocument(identifier, { event }); }
    if (!actors.length) {
      const doc = await teriock.fromIdentifier(identifier);
      await doc?.use?.({ event });
    }
  }

  /**
   * Generate a hash id from the flags for a macro this is creating. If a macro with that hash id exists, return it. If not, set the flags so
   * that they can be added to the macro as it's created.
   * @param {object} flags
   * @returns {TeriockMacro|null}
   */
  #getHashedMacro(flags) {
    flags = foundry.utils.deepClone(flags);
    delete flags.macroHash;
    const macroHash = toId(JSON.stringify([game.user.id, ...Object.entries(flags).sort()]), { hash: true });
    const existing = game.macros.find(m => m.getFlag("teriock", "macroHash") === macroHash);
    if (existing) { return existing; }
    this.creatingMacroFlags = { ...flags, macroHash };
    return null;
  }

  /**
   * A helper method used to retrieve a Macro document from a hotbar slot element.
   * @param {HTMLLIElement} element
   * @returns {TeriockMacro|null}
   */
  #getMacroForSlot(element) {
    const slot = element.dataset.slot;
    const macroId = game.user.hotbar[slot];
    if (!macroId) { return null; }
    return game.macros.get(macroId) ?? null;
  }

  /**
   * Flags to add to a macro being created due to a hotbar drop.
   * @type {object|null}
   */
  creatingMacroFlags = null;

  /**
   * Hotbar folder for the current user.
   * @returns {TeriockFolder|null}
   */
  get hotbarFolder() {
    if (!game.settings.get("teriock", "sortNewPlayerMacros")) { return null; }
    return game.folders.find(f =>
      f.getFlag("teriock", "user") === game.user.id && f.getFlag("teriock", "hotbarFolder") && f.type === "Macro"
    ) ?? null;
  }

  /** @inheritDoc */
  async _createDocumentSheetToggle(doc) {
    const existing = this.#getHashedMacro({ macroAction: "toggleSheet", macroDocumentUuid: doc.uuid });
    if (existing) { return existing; }
    return super._createDocumentSheetToggle(doc);
  }

  /**
   * Create a macro that uses a child document.
   * @param {TeriockActiveEffect|TeriockItem} document
   * @returns {Promise<TeriockMacro>}
   */
  async _createDocumentUse(document) {
    const existing = this.#getHashedMacro({ macroAction: "useDocument", macroDocumentUuid: document.uuid });
    if (existing) { return existing; }
    return TeriockMacro.create({
      command: `const doc = await fromUuid("${document.uuid}");\nawait doc?.use({ actor: doc.actor, event });`,
      img: document.img,
      name: _loc("TERIOCK.SYSTEMS.Child.USAGE.use", { value: document.name }),
      type: "script",
    });
  }

  /**
   * Create a macro that uses the documents matching a child document's identifier.
   * @param {TeriockActiveEffect|TeriockItem} document
   * @returns {Promise<TeriockMacro>}
   */
  async _createMatchesUse(document) {
    const docToUse = (await fromIdentifier(document.lookupKey)) ?? document;
    const existing = this.#getHashedMacro({ macroAction: "useMatches", macroMatchesIdentifier: document.lookupKey });
    if (existing) { return existing; }
    return TeriockMacro.create({
      command: `await CONFIG.ui.hotbar.useMatches("${document.lookupKey}", { actor, event });`,
      img: docToUse.img,
      name: _loc("TERIOCK.HOTBAR.UseMatchesName", { value: docToUse.name }),
      type: "script",
    });
  }

  /** @inheritDoc */
  async _createRollTableRollMacro(table) {
    const existing = this.#getHashedMacro({ macroAction: "rollTable", macroDocumentUuid: table.uuid });
    if (existing) { return existing; }
    return super._createRollTableRollMacro(table);
  }

  /** @inheritDoc */
  _getContextMenuOptions() {
    const options = super._getContextMenuOptions();
    options.push({
      icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.ui.openWindow, "contextMenu"),
      label: _loc("HOTBAR.ToggleSheet", { document: _loc("DOCUMENT.Document") }),
      onClick: async (_ev, li) => {
        const macro = this.#getMacroForSlot(li);
        const uuid = macro.getFlag("teriock", "macroAction") === "useMatches"
          ? (await findBestDocument(macro.getFlag("teriock", "macroMatchesIdentifier"), game.actors.default))?.uuid
          : macro.getFlag("teriock", "macroDocumentUuid");
        if (uuid) { await this.constructor.toggleDocumentSheet(uuid); }
      },
      visible: li => {
        const macro = this.#getMacroForSlot(li);
        if (!macro) { return false; }
        return (macro.getFlag("teriock", "macroDocumentUuid") || macro.getFlag("teriock", "macroMatchesIdentifier"))
          && macro.getFlag("teriock", "macroAction") !== "toggleSheet";
      },
    });
    return options;
  }

  /**
   * Get the hotbar folder for the current user.
   * @returns {Promise<TeriockFolder>|null}
   */
  async ensureHotbarFolder() {
    if (!game.settings.get("teriock", "sortNewPlayerMacros")) { return null; }
    const hotbarFolder = this.hotbarFolder;
    if (hotbarFolder) { return hotbarFolder; }
    await game.users.queryGM("teriock.createHotbarFolder", { id: game.user.id, name: game.user.name }, {
      failPrefix: "TERIOCK.SYSTEMS.Macro.QUERY.createHotbarFolder.failPrefix",
      localize: true,
      timeout: TERIOCK.CONST.WRITE_OPERATION_TIMEOUT,
    });
    return this.hotbarFolder;
  }
}
