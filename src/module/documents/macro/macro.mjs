import { getItem } from "../../helpers/fetch.mjs";
import { dedent, queryGM } from "../../helpers/utils.mjs";
import { BlankMixin } from "../mixins/_module.mjs";

const { Macro } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Macro} implementation.
 * @extends {Macro}
 * @mixes ClientDocumentMixin
 */
export default class TeriockMacro extends BlankMixin(Macro) {
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
      const basicAbilitiesItem = await getItem("Basic Abilities", "essentials");
      doc = basicAbilitiesItem.abilities.find((a) => a.name === name);
    }
    return doc;
  }

  /**
   * Create a macro from the given document.
   * @param {TeriockChild} doc
   * @returns {Promise<TeriockMacro>}
   */
  static async getUseMacro(doc) {
    await queryGM(
      "teriock.createHotbarFolder",
      {
        name: game.user.name,
        id: game.user.id,
      },
      {
        failPrefix: "Could not create a hotbar folder.",
      },
    );
    const folders =
      /** @type {Collection<Teriock.ID<TeriockFolder>,TeriockFolder>} */ game.folders;
    const macroFolder = folders.find(
      (f) =>
        f.getFlag("teriock", "user") === game.user.id &&
        f.getFlag("teriock", "hotbarFolder") &&
        f.type === "Macro",
    );
    const macros =
      /** @type {Collection<Teriock.ID<TeriockMacro>,TeriockMacro>} */ game.macros;
    let macro = macros.find(
      (m) =>
        m.getFlag("teriock", "user") === game.user.id &&
        m.getFlag("teriock", "macroType") === "use" &&
        m.getFlag("teriock", "macroDocumentType") === doc.type &&
        m.getFlag("teriock", "macroDocumentName") === doc.name,
    );
    if (macro) {
      return macro;
    }
    const command = dedent(`
    await game.teriock.Macro.useDocuments("${doc.name}", { actor, type: "${doc.type}", event: event })`);
    const macroData = {
      name: `Use ${doc.name}`,
      type: "script",
      img: doc.img,
      command: command,
      folder: macroFolder.id,
      flags: {
        teriock: {
          user: game.user.id,
          macroType: "use",
          macroDocumentType: doc.type,
          macroDocumentName: doc.name,
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
  static async useDocuments(name, options) {
    const { actor, type, event } = options;
    //noinspection JSUnresolvedReference
    /** @type {TeriockToken[]} */
    const tokens = game.canvas.tokens.controlled;
    const actors = tokens.map((t) => t.actor);
    if (actors.length === 0 && options.actor) {
      actors.push(actor);
    }
    if (actors.length === 0) {
      foundry.ui.notifications.warn("No actors selected.");
    }
    for (const a of actors) {
      const doc = await this.getDocument(a, name, type);
      if (doc) {
        const useOptions = {
          actor: a,
        };
        let secret = game.settings.get("teriock", "secretEquipment");
        if (event.shiftKey) {
          secret = !secret;
        }
        if (event) {
          useOptions.advantage = event.altKey;
          useOptions.disadvantage = event.shiftKey;
          useOptions.twoHanded = event.ctrlKey;
          useOptions.secret = secret;
        }
        await doc.system.use(useOptions);
      } else {
        foundry.ui.notifications.warn(
          `${a.name} has no ${type ? TERIOCK.options.document[type].name.toLowerCase() : "document"} called ${name}.`,
        );
      }
    }
  }

  /**
   * @inheritDoc
   * @param {Teriock.RollOptions.MacroScope} scope
   */
  async execute(scope = {}) {
    await super.execute(scope);
  }
}
