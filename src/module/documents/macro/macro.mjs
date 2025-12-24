import { getDocument } from "../../helpers/fetch.mjs";
import { dedent } from "../../helpers/string.mjs";
import { mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { Macro } = foundry.documents;

/**
 * The Teriock {@link Macro} implementation.
 * @extends {ClientDocument}
 * @extends {Macro}
 * @mixes BaseDocument
 * @mixes EmbedCardDocument
 */
export default class TeriockMacro extends mix(
  Macro,
  mixins.BaseDocumentMixin,
  mixins.EmbedCardDocumentMixin,
) {
  /**
   * Hotbar folder for the current user.
   * @returns {TeriockFolder}
   */
  static get hotbarFolder() {
    return game.folders.find(
      (f) =>
        f.getFlag("teriock", "user") === game.user.id &&
        f.getFlag("teriock", "hotbarFolder") &&
        f.type === "Macro",
    );
  }

  /**
   * Get the hotbar folder for the current user.
   * @returns {Promise<TeriockFolder>}
   */
  static async ensureHotbarFolder() {
    let hotbarFolder = this.hotbarFolder;
    if (hotbarFolder) return hotbarFolder;
    await game.users.queryGM(
      "teriock.createHotbarFolder",
      {
        name: game.user.name,
        id: game.user.id,
      },
      {
        failPrefix: "Could not create a hotbar folder.",
      },
    );
    return this.hotbarFolder;
  }

  /**
   * Get a document from an actor.
   * @param {TeriockActor} actor - The actor to get the document from.
   * @param {string} name - The name of the document. This is case-sensitive.
   * @param {Teriock.Documents.ChildType} [type] - The type of the document.
   * @returns {Promise<TeriockChild|null>}
   */
  static async getDocument(actor, name, type) {
    let doc = null;
    if (!type) {
      doc = actor.items.find((i) => i.name === name);
      if (!doc) {
        doc = actor.validEffects.find((e) => e.name === name);
      }
      return doc;
    } else if (
      Object.keys(TERIOCK.system.documentTypes.effects).includes(type)
    ) {
      doc = actor.validEffects.find((e) => e.name === name && e.type === type);
    } else if (Object.keys(TERIOCK.system.documentTypes.items).includes(type)) {
      doc = actor.items.find((i) => i.name === name && i.type === type);
    }
    if (!doc && type === "ability") {
      const basicAbilitiesItem = await getDocument(
        "Basic Abilities",
        "essentials",
      );
      doc = basicAbilitiesItem?.abilities.find((a) => a.name === name);
    }
    return doc;
  }

  /**
   * Create a general use macro from the given document.
   * @param {TeriockChild} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async getGeneralUseMacro(doc) {
    const macro = game.macros.find(
      (m) =>
        m.getFlag("teriock", "user") === game.user.id &&
        m.getFlag("teriock", "macroType") === "useGeneral" &&
        m.getFlag("teriock", "macroDocumentType") === doc.type &&
        m.getFlag("teriock", "macroDocumentName") === doc.name,
    );
    if (macro) {
      return macro;
    }
    return this.makeGeneralUseMacro(doc);
  }

  /**
   * Create a linked use macro from the given document.
   * @param {TeriockChild} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async getLinkedUseMacro(doc) {
    const macro = game.macros.find(
      (m) =>
        m.getFlag("teriock", "macroType" === "useLinked") &&
        m.getFlag("teriock", "macroUuid" === doc.uuid),
    );
    if (macro) {
      return macro;
    }
    return this.makeLinkedUseMacro(doc);
  }

  /**
   * Create a general use macro from the given document.
   * @param {TeriockChild} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async makeGeneralUseMacro(doc) {
    const command = dedent(`
    await game.teriock.Macro.useDocumentGeneral("${doc.name}", { actor, type: "${doc.type}", event: event })`);
    const macroData = {
      name: `Use ${doc.name}`,
      type: "script",
      img: doc.img,
      command: command,
      folder: (await this.ensureHotbarFolder()).id,
      flags: {
        teriock: {
          user: game.user.id,
          macroType: "useGeneral",
          macroDocumentType: doc.type,
          macroDocumentName: doc.name,
        },
      },
    };
    return this.create(macroData);
  }

  /**
   * Create a linked use macro from the given document.
   * @param {TeriockChild} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async makeLinkedUseMacro(doc) {
    const command = dedent(`
    await game.teriock.Macro.useDocumentLinked("${doc.uuid}", { event: event })`);
    const macroData = {
      name: `Use ${doc.name}`,
      type: "script",
      img: doc.img,
      command: command,
      folder: (await this.ensureHotbarFolder()).id,
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
   * @param {string} name
   * @param {object} [options]
   * @param {TeriockActor} [options.actor]
   * @param {Teriock.Documents.ChildType} [options.type]
   * @param {MouseEvent} [options.event]
   * @returns {Promise<void>}
   */
  static async useDocumentGeneral(name, options) {
    const { actor, type, event } = options;
    const tokens = /** @type {TeriockToken[]} */ game.canvas.tokens.controlled;
    const actors = tokens.map((t) => t.actor);
    if (actors.length === 0 && options.actor) {
      actors.push(actor);
    }
    if (actors.length === 0) {
      ui.notifications.warn("No actors selected.");
    }
    for (const a of actors) {
      const doc = await this.getDocument(a, name, type);
      if (doc) {
        const useOptions = {
          actor: a,
        };
        if (event) {
          Object.assign(useOptions, doc.system.parseEvent(event));
        }
        await doc.system.use(useOptions);
      } else {
        ui.notifications.warn(
          `${a.name} has no ${type ? TERIOCK.options.document[type].name.toLowerCase() : "document"} called ${name}.`,
        );
      }
    }
  }

  /**
   * Get a document from its UUID and use it.
   * @param {UUID<TeriockChild>} uuid
   * @param {object} [options]
   * @param {MouseEvent} [options.event]
   * @returns {Promise<void>}
   */
  static async useDocumentLinked(uuid, options) {
    const { event } = options.event;
    const doc = await fromUuid(uuid);
    if (doc) {
      const useOptions = {
        actor: doc.actor,
      };
      if (event) {
        Object.assign(useOptions, doc.system.parseEvent(event));
      }
      await doc.system.use(useOptions);
    }
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
    const parts = super.embedParts;
    parts.usable = true;
    parts.action = "execute";
    return parts;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    if (!this.folder) {
      if (
        (!game.user.isGM && this.constructor.hotbarFolder) ||
        game.users.activeGM
      ) {
        this.updateSource({
          folder: (await this.constructor.ensureHotbarFolder()).id,
        });
      }
    }
  }

  /**
   * Generate a scope and execute.
   * @returns {Promise<void>}
   */
  async scopedExecute(event) {
    const actor = game.actors.defaultActor;
    await this.execute({
      actor,
      token: actor?.defaultToken,
      event,
    });
  }
}
