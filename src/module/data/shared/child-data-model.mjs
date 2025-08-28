import TeriockImageSheet from "../../applications/sheets/misc-sheets/image-sheet/image-sheet.mjs";
import { freeze, makeIcon } from "../../helpers/utils.mjs";
import { TextField } from "./fields.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

/**
 * Mixin that provides child document functionality for embedded documents.
 * Adds proficiency tracking, font customization, and message generation capabilities.
 *
 * @implements {ChildDataInterface}
 * @property {TeriockItem|TeriockEffect} parent
 * @property {string} description
 * @property {boolean} proficient
 * @property {boolean} fluent
 * @property {Teriock.Parameters.Shared.Font} font
 */
export default class ChildDataModel extends TypeDataModel {
  /**
   * Metadata.
   * @type {Readonly<Teriock.Documents.ChildModelMetadata>}
   */
  static metadata = freeze({
    usable: false,
    consumable: false,
    wiki: false,
    namespace: "",
    pageNameKey: "name",
    type: "base",
    childEffectTypes: [],
    childItemTypes: [],
    childMacroTypes: [],
  });

  /**
   * @inheritDoc
   * @returns {Record<string, DataField>}
   */
  static defineSchema() {
    const schema = {};
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
   * @returns {TeriockActor|null}
   */
  get actor() {
    return this.parent.actor;
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
        condition: this.constructor.metadata.usable,
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
        condition: !this.parent.disabled && this.parent.type !== "equipment",
        group: "control",
      },
      {
        name: "Open Image",
        icon: makeIcon("image", "contextMenu"),
        callback: async () => {
          await new TeriockImageSheet(this.parent.img).render(true);
        },
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
        callback: this.parent.chat.bind(this.parent),
        group: "share",
      },
      {
        name: "Delete",
        icon: makeIcon("trash", "contextMenu"),
        callback: async () => {
          await this.parent.parent.deleteEmbeddedDocuments(
            this.parent.documentName,
            [this.parent.id],
          );
        },
        condition: () =>
          (this.parent.parent.sheet?.editable ||
            this.parent.source?.sheet?.editable) &&
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
   * Gets the message rules-parts for displaying the child document in chat.
   * Includes image, name, and font information from the parent document.
   * @returns {Teriock.MessageData.Parts} Object containing message display components.
   */
  get messageParts() {
    return {
      image: this.parent.img,
      name: this.parent.name,
      bars: [],
      blocks: [],
      font: this.font,
    };
  }

  /**
   * @inheritDoc
   * @returns {TeriockItem|TeriockEffect}
   */
  get parent() {
    return super.parent;
  }

  /**
   * Gets the secret message rules-parts for displaying hidden child documents.
   * Uses generic uncertainty image and type-based name for privacy.
   * @returns {Teriock.MessageData.Parts} Object containing secret message display components.
   */
  get secretMessageParts() {
    return {
      image: "systems/teriock/assets/uncertainty.svg",
      name:
        this.parent.type.charAt(0).toUpperCase() + this.parent.type.slice(1),
      bars: [],
      blocks: [],
      font: null,
    };
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
   * Initiates a roll for the child document.
   * Delegates to the parent document's chat functionality.
   * @param {object} options - Options for the roll operation.
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   */
  async roll(options) {
    await this.parent.chat(options);
  }

  /**
   * Uses the child document, which triggers a roll.
   * Alias for the roll method to provide consistent interface.
   * @param {object} options - Options for the use operation.
   * @returns {Promise<void>} Promise that resolves when the use is complete.
   */
  async use(options) {
    Hooks.callAll(
      "teriock.use" +
        this.parent.type.charAt(0).toUpperCase() +
        this.parent.type.slice(1),
      [this.parent],
    );
    await this.roll(options);
  }
}
