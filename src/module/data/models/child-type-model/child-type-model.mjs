import { TeriockImagePreviewer } from "../../../applications/api/_module.mjs";
import { quickAddAssociation } from "../../../helpers/html.mjs";
import {
  abilitySort,
  makeIcon,
  propertySort,
} from "../../../helpers/utils.mjs";
import { TextField } from "../../shared/fields/_module.mjs";
import CommonTypeModel from "../common-type-model/common-type-model.mjs";

const { fields } = foundry.data;

/**
 * Data model shared by items and effects.
 * @implements {ChildTypeModelInterface}
 * @property {TeriockChild} parent
 * @property {string} description
 * @property {boolean} proficient
 * @property {boolean} fluent
 * @property {Teriock.Parameters.Shared.Font} font
 */
export default class ChildTypeModel extends CommonTypeModel {
  /**
   * @inheritDoc
   * @returns {Record<string, DataField>}
   */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      proficient: new fields.BooleanField({
        initial: false,
        label: "Proficient",
      }),
      fluent: new fields.BooleanField({
        initial: false,
        label: "Fluent",
      }),
      font: new fields.StringField({
        initial: "",
        label: "Font",
        hint: "The font to be used for this document's name on its sheet and in chat messages.",
      }),
      description: new TextField({
        initial: "<p>None.</p>",
        label: "Description",
      }),
    });
    return schema;
  }

  /** @inheritDoc */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Context menu entries to display for cards that represent the parent document.
   * @returns {Teriock.Foundry.ContextMenuEntry[]}
   */
  get cardContextMenuEntries() {
    return [
      {
        name: this.useText,
        icon: makeIcon(this.useIcon, "contextMenu"),
        callback: this.use.bind(this),
        condition: this.isUsable,
        group: "usage",
      },
      {
        name: "Enable",
        icon: makeIcon("check", "contextMenu"),
        callback: this.parent.enable.bind(this.parent),
        condition: this.parent.disabled && this.parent.type !== "equipment",
        group: "control",
      },
      {
        name: "Disable",
        icon: makeIcon("xmark-large", "contextMenu"),
        callback: this.parent.disable.bind(this.parent),
        condition:
          !this.parent.disabled &&
          this.parent.type !== "equipment" &&
          this.parent.type !== "mount" &&
          !(this.parent.type === "ability" && this.isVirtual),
        group: "control",
      },
      {
        name: "Open GM Notes",
        icon: makeIcon("notes", "contextMenu"),
        callback: async () => {
          await this.gmNotesOpen();
        },
        condition: game.user.isGM,
        group: "open",
      },
      {
        name: "Open Image",
        icon: makeIcon("image", "contextMenu"),
        callback: async () => {
          await new TeriockImagePreviewer(this.parent.img).render(true);
        },
        group: "open",
      },
      {
        name: "Open Source",
        icon: makeIcon("arrow-up-right-from-square", "contextMenu"),
        callback: async () => await this.parent.source.sheet.render(true),
        condition: this.parent.source.documentName !== "Actor",
        group: "open",
      },
      {
        name: "Share Image",
        icon: makeIcon("comment-image", "contextMenu"),
        callback: this.parent.chatImage.bind(this.parent),
        group: "share",
      },
      {
        name: "Share Writeup",
        icon: makeIcon("comment-lines", "contextMenu"),
        callback: this.parent.toMessage.bind(this.parent),
        group: "share",
      },
      {
        name: "Delete",
        icon: makeIcon("trash", "contextMenu"),
        callback: async () => {
          await this.deleteThis();
        },
        condition: () =>
          (this.parent.parent.sheet?.editable ||
            (this.parent.parent.source &&
              this.parent.source.sheet?.editable)) &&
          this.parent.isOwner,
        group: "document",
      },
      {
        name: "Duplicate",
        icon: makeIcon("copy", "contextMenu"),
        callback: async () => {
          await this.parent.duplicate();
        },
        condition: () =>
          this.parent.parent.sheet?.editable && this.parent.isOwner,
        group: "document",
      },
    ];
  }

  /**
   * Whether this can be used.
   * @returns {boolean}
   */
  get isUsable() {
    return this.constructor.metadata.usable;
  }

  /**
   * Gets the message rules-parts for displaying the child document in chat.
   * Includes image, name, and font information from the parent document.
   * @returns {Teriock.MessageData.MessagePanel} Object containing message display components.
   */
  get messageParts() {
    const parts = {
      associations: [],
      bars: [],
      blocks: [],
      buttons: [],
      color: this.color,
      font: this.font,
      image: this.parent.img,
      name: this.parent.nameString,
    };
    const properties = propertySort(
      this.parent.getProperties().filter((p) => p.system.revealed),
    );
    const abilities = abilitySort(
      this.parent.getAbilities().filter((a) => a.system.revealed),
    );
    quickAddAssociation(
      properties,
      "Properties",
      TERIOCK.options.document.property.icon,
      parts.associations,
    );
    quickAddAssociation(
      abilities,
      "Abilities",
      TERIOCK.options.document.ability.icon,
      parts.associations,
    );
    return parts;
  }

  /**
   * @inheritDoc
   * @returns {TeriockChild}
   */
  get parent() {
    return /** @type {TeriockChild} */ super.parent;
  }

  /**
   * Checks if the child is suppressed.
   * Children are suppressed if their parents are suppressed.
   * @returns {boolean} True if the effect is suppressed, false otherwise.
   */
  get suppressed() {
    return !!(
      this.parent.source &&
      this.parent.source.documentName === "Item" &&
      !this.parent.source.active
    );
  }

  /**
   * An icon that represents using this.
   * @returns {string}
   */
  get useIcon() {
    return "dice-d20";
  }

  /**
   * A string that represents using this.
   * @returns {string}
   */
  get useText() {
    return `Use ${this.parent.name}`;
  }

  /**
   * Adjust the built message after it's created.
   * @param {HTMLDivElement} messageElement - The raw message HTML.
   * @returns {HTMLDivElement} The modified raw message HTML.
   */
  adjustMessage(messageElement) {
    return messageElement;
  }

  /**
   * Delete this document from its parent.
   * @returns {Promise<void>}
   */
  async deleteThis() {
    await this.parent.parent.deleteEmbeddedDocuments(this.parent.documentName, [
      this.parent.id,
    ]);
  }

  /**
   * Parse an event into usable roll data.
   * @param {PointerEvent} _event
   * @returns {Teriock.Execution.DocumentExecutionOptions}
   */
  parseEvent(_event) {
    return {
      source: this.parent,
    };
  }

  /**
   * Initiates a roll for the child document.
   * Delegates to the parent document's chat functionality.
   * @param {object} options - Options for the roll operation.
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   */
  async roll(options) {
    await this.parent.toMessage(options);
  }

  /**
   * Uses the child document, which triggers a roll.
   * Alias for the roll method to provide consistent interface.
   * @param {object} options - Options for the use operation.
   * @returns {Promise<void>} Promise that resolves when the use is complete.
   */
  async use(options) {
    const data = { doc: this.parent };
    await this.parent.hookCall("use", data);
    if (!data.cancel) {
      Hooks.callAll(
        "teriock.use" +
          this.parent.type.charAt(0).toUpperCase() +
          this.parent.type.slice(1),
        [this.parent],
      );
      await this.roll(options);
    }
  }
}
