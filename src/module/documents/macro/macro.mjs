import { mixClasses } from "../../helpers/construction.mjs";
import { dedent } from "../../helpers/string.mjs";
import { findBestDocument } from "../../helpers/utils.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { Macro } = foundry.documents;

/**
 * The Teriock Macro implementation.
 * @implements {Teriock.Documents.MacroInterface}
 * @extends {ClientDocument}
 * @extends {Macro}
 * @mixes BaseDocument
 * @mixes EmbedCardDocument
 */
export default class TeriockMacro
  extends mixClasses(
    Macro,
    documentMixins.BaseDocumentMixin,
    documentMixins.EmbedCardDocumentMixin,
    documentMixins.UsableDocumentMixin,
  )
{
  /**
   * Hotbar folder for the current user.
   * @returns {TeriockFolder|null}
   */
  static get hotbarFolder() {
    if (!game.settings.get("teriock", "sortNewPlayerMacros")) { return null; }
    return game.folders.find(f =>
      f.getFlag("teriock", "user") === game.user.id && f.getFlag("teriock", "hotbarFolder") && f.type === "Macro"
    ) ?? null;
  }

  /**
   * Get the hotbar folder for the current user.
   * @returns {Promise<TeriockFolder>|null}
   */
  static async ensureHotbarFolder() {
    if (!game.settings.get("teriock", "sortNewPlayerMacros")) { return null; }
    const hotbarFolder = this.hotbarFolder;
    if (hotbarFolder) { return hotbarFolder; }
    await game.users.queryGM("teriock.createHotbarFolder", { id: game.user.id, name: game.user.name }, {
      failPrefix: "TERIOCK.SYSTEMS.Macro.QUERY.createHotbarFolder.failPrefix",
      localize: true,
      timeout: TERIOCK.config.system.timeout.writeOperation,
    });
    return this.hotbarFolder;
  }

  /**
   * Create a general use macro from the given document.
   * @param {AnyChildDocument} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async getGeneralUseMacro(doc) {
    const macro = game.macros.find(m =>
      m.getFlag("teriock", "user") === game.user.id
      && m.getFlag("teriock", "macroType") === "useGeneral"
      && m.getFlag("teriock", "macroLookupKey") === doc.lookupKey
    );
    if (macro) { return macro; }
    return this.makeGeneralUseMacro(doc);
  }

  /**
   * Create a linked use macro from the given document.
   * @param {AnyChildDocument} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async getLinkedUseMacro(doc) {
    const macro = game.macros.find(m =>
      m.getFlag("teriock", "macroType") === "useLinked" && m.getFlag("teriock", "macroUuid") === doc.uuid
    );
    if (macro) { return macro; }
    return this.makeLinkedUseMacro(doc);
  }

  /**
   * Create a general use macro from the given document.
   * @param {AnyChildDocument} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async makeGeneralUseMacro(doc) {
    const lookup = doc.lookupKey;
    const command = dedent(`
    await Macro.implementation.useDocumentGeneral("${lookup}", { actor, event })`);
    const macroData = {
      command,
      flags: { teriock: { macroLookupKey: lookup, macroType: "useGeneral", user: game.user.id } },
      folder: (await this.ensureHotbarFolder())?.id,
      img: doc.img,
      name: _loc("TERIOCK.SYSTEMS.Child.USAGE.use", { value: doc.name }),
      type: "script",
    };
    return this.create(macroData);
  }

  /**
   * Create a linked use macro from the given document.
   * @param {AnyChildDocument} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async makeLinkedUseMacro(doc) {
    const command = dedent(`
    await Macro.implementation.useDocumentLinked("${doc.uuid}", { event: event })`);
    const macroData = {
      command,
      flags: { teriock: { macroDocumentUuid: doc.uuid, macroType: "useLinked", user: game.user.id } },
      folder: (await this.ensureHotbarFolder())?.id,
      img: doc.img,
      name: _loc("TERIOCK.SYSTEMS.Child.USAGE.use", { value: doc.name }),
      type: "script",
    };
    return this.create(macroData);
  }

  /**
   * Get a document on an actor and use it.
   * @param {string} lookup
   * @param {object} [options]
   * @param {TeriockActor} [options.actor]
   * @param {Teriock.Documents.ChildType} [options.type]
   * @param {PointerEvent} [options.event]
   * @returns {Promise<void>}
   */
  static async useDocumentGeneral(lookup, options) {
    const { actor, event } = options;
    const tokens = /** @type {TeriockToken[]} */ game.canvas?.tokens.controlled ?? [];
    const actors = tokens.map(t => t.actor).filter(Boolean);
    if (actors.length === 0 && options.actor) { actors.push(actor); }
    game.actors.check(actors);
    for (const a of actors) {
      const doc = await findBestDocument(lookup, a);
      if (doc) { await doc.system.use({ actor: a, event }); }
      else {
        ui.notifications.warn("TERIOCK.SYSTEMS.Macro.EXECUTION.noDocument", {
          format: { actor: a.name, lookup },
          localize: true,
        });
      }
    }
  }

  /**
   * Get a document from its UUID and use it.
   * @param {UUID<AnyChildDocument>} uuid
   * @param {Teriock.Command.UseOptions} [options]
   * @returns {Promise<void>}
   */
  static async useDocumentLinked(uuid, options = {}) {
    const doc = await fromUuid(uuid);
    if (doc) { await doc.system.use(Object.assign(options, { actor: doc.actor })); }
  }

  /** @inheritDoc */
  get _embedActions() {
    return { ...super._embedActions, execute: { primary: async event => await this.scopedExecute(event) } };
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { action: "execute", usable: true });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    if (game.settings.get("teriock", "sortNewPlayerMacros") && !this.folder) {
      if ((!game.user.isGM && this.constructor.hotbarFolder) || game.users.activeGM) {
        this.updateSource({ folder: (await this.constructor.ensureHotbarFolder())?.id });
      }
    }
  }

  /**
   * Generate a scope and execute.
   * @returns {Promise<void>}
   */
  async scopedExecute(event) {
    const actor = game.actors.default;
    await this.execute({ actor, event, token: actor?.defaultToken });
  }

  /** @inheritDoc */
  async use(options = {}) {
    await this.execute(options);
  }
}
