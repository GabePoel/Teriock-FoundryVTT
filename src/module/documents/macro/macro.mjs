import { dedent } from "../../helpers/string.mjs";
import { mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { Macro } = foundry.documents;

//noinspection JSClosureCompilerSyntax
/**
 * The Teriock Macro implementation.
 * @implements {Teriock.Documents.MacroInterface}
 * @extends {ClientDocument}
 * @extends {Macro}
 * @mixes BaseDocument
 * @mixes EmbedCardDocument
 */
export default class TeriockMacro extends mix(
  Macro,
  mixins.BaseDocumentMixin,
  mixins.EmbedCardDocumentMixin,
  mixins.UsableDocumentMixin,
) {
  /**
   * Hotbar folder for the current user.
   * @returns {TeriockFolder|null}
   */
  static get hotbarFolder() {
    if (!game.teriock.getSetting("sortNewPlayerMacros")) return null;
    return game.folders.find(
      (f) =>
        f.getFlag("teriock", "user") === game.user.id &&
        f.getFlag("teriock", "hotbarFolder") &&
        f.type === "Macro",
    );
  }

  /**
   * Determined the lookup key for some document.
   * @param {TeriockDocument} doc
   * @return {string}
   */
  static documentLookupKey(doc) {
    return foundry.utils.getProperty(doc, "system.identifier") || doc.name;
  }

  /**
   * Get the hotbar folder for the current user.
   * @returns {Promise<TeriockFolder>|null}
   */
  static async ensureHotbarFolder() {
    if (!game.teriock.getSetting("sortNewPlayerMacros")) return null;
    let hotbarFolder = this.hotbarFolder;
    if (hotbarFolder) return hotbarFolder;
    await game.users.queryGM(
      "teriock.createHotbarFolder",
      {
        name: game.user.name,
        id: game.user.id,
      },
      {
        failPrefix: "TERIOCK.SYSTEMS.Macro.QUERY.createHotbarFolder.failPrefix",
        localize: true,
      },
    );
    return this.hotbarFolder;
  }

  /**
   * Create a general use macro from the given document.
   * @param {ChildDocument} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async getGeneralUseMacro(doc) {
    const macro = game.macros.find(
      (m) =>
        m.getFlag("teriock", "user") === game.user.id &&
        m.getFlag("teriock", "macroType") === "useGeneral" &&
        m.getFlag("teriock", "macroDocumentType") === doc.type &&
        m.getFlag("teriock", "macroDocumentName") ===
          this.documentLookupKey(doc),
    );
    if (macro) return macro;
    return this.makeGeneralUseMacro(doc);
  }

  /**
   * Create a linked use macro from the given document.
   * @param {ChildDocument} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async getLinkedUseMacro(doc) {
    const macro = game.macros.find(
      (m) =>
        m.getFlag("teriock", "macroType" === "useLinked") &&
        m.getFlag("teriock", "macroUuid" === doc.uuid),
    );
    if (macro) return macro;
    return this.makeLinkedUseMacro(doc);
  }

  /**
   * Create a general use macro from the given document.
   * @param {ChildDocument} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async makeGeneralUseMacro(doc) {
    const lookup = this.documentLookupKey(doc);
    const command = dedent(`
    await game.teriock.Macro.useDocumentGeneral("${lookup}", { actor, type: "${doc.type}", event })`);
    const macroData = {
      name: _loc("TERIOCK.SYSTEMS.Child.USAGE.use", {
        value: doc.name,
      }),
      type: "script",
      img: doc.img,
      command: command,
      folder: (await this.ensureHotbarFolder())?.id,
      flags: {
        teriock: {
          user: game.user.id,
          macroType: "useGeneral",
          macroDocumentType: doc.type,
          macroDocumentName: this.documentLookupKey(doc),
        },
      },
    };
    return this.create(macroData);
  }

  /**
   * Create a linked use macro from the given document.
   * @param {ChildDocument} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async makeLinkedUseMacro(doc) {
    const command = dedent(`
    await game.teriock.Macro.useDocumentLinked("${doc.uuid}", { event: event })`);
    const macroData = {
      name: _loc("TERIOCK.SYSTEMS.Child.USAGE.use", {
        value: doc.name,
      }),
      type: "script",
      img: doc.img,
      command: command,
      folder: (await this.ensureHotbarFolder())?.id,
      flags: {
        teriock: {
          user: game.user.id,
          macroType: "useLinked",
          macroDocumentUuid: doc.uuid,
        },
      },
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
    const { actor, type, event } = options;
    const tokens = /** @type {TeriockToken[]} */ game.canvas.tokens.controlled;
    const actors = tokens.map((t) => t.actor).filter((_) => _);
    if (actors.length === 0 && options.actor) {
      actors.push(actor);
    }
    if (actors.length === 0) {
      ui.notifications.warn("TERIOCK.DIALOGS.Common.ERRORS.noActor", {
        localize: true,
      });
    }
    for (const a of actors) {
      const doc = await a.getDocument(lookup, type);
      if (doc) await doc.system.use({ actor: a, event });
      else {
        ui.notifications.warn("TERIOCK.SYSTEMS.Macro.EXECUTION.noDocument", {
          localize: true,
          format: {
            actor: a.name,
            name: lookup,
            type: type
              ? TERIOCK.options.document[type].name.toLowerCase()
              : TERIOCK.options.document.document.name.toLowerCase(),
          },
        });
      }
    }
  }

  /**
   * Get a document from its UUID and use it.
   * @param {UUID<ChildDocument>} uuid
   * @param {Teriock.Interaction.UseOptions} [options]
   * @returns {Promise<void>}
   */
  static async useDocumentLinked(uuid, options = {}) {
    const doc = await fromUuid(uuid);
    if (doc) await doc.system.use(Object.assign(options, { actor: doc.actor }));
  }

  /** @inheritDoc */
  get embedActions() {
    return {
      ...super.embedActions,
      execute: { primary: async (event) => await this.scopedExecute(event) },
    };
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, {
      usable: true,
      action: "execute",
    });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    if (game.teriock.getSetting("sortNewPlayerMacros") && !this.folder) {
      if (
        (!game.user.isGM && this.constructor.hotbarFolder) ||
        game.users.activeGM
      ) {
        this.updateSource({
          folder: (await this.constructor.ensureHotbarFolder())?.id,
        });
      }
    }
  }

  /**
   * Generate a scope and execute.
   * @returns {Promise<void>}
   */
  async scopedExecute(event) {
    const actor = game.actors.default;
    await this.execute({
      actor,
      token: actor?.defaultToken,
      event,
    });
  }

  /** @inheritDoc */
  async use(options = {}) {
    await this.execute(options);
  }
}
