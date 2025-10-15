import { TeriockImagePreviewer } from "../../../applications/api/_module.mjs";
import {
  abilitySort,
  freeze,
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
    passive: false,
    preservedProperties: [],
  });

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
    const properties = propertySort(this.parent.getProperties());
    if (properties.length > 0) {
      parts.associations.push({
        title: "Properties",
        icon: TERIOCK.options.document.property.icon,
        cards: properties.map((p) => {
          return {
            color: p.system.color,
            id: p.id,
            img: p.img,
            name: p.system.nameString,
            rescale: false,
            type: p.documentName,
            uuid: p.uuid,
          };
        }),
      });
    }
    const abilities = abilitySort(this.parent.getAbilities());
    if (abilities.length > 0) {
      parts.associations.push({
        title: "Abilities",
        icon: TERIOCK.options.document.ability.icon,
        cards: abilities.map((a) => {
          return {
            color: a.system.color,
            id: a.id,
            img: a.img,
            name: a.system.nameString,
            rescale: false,
            type: a.documentName,
            uuid: a.uuid,
          };
        }),
      });
    }
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
   * Roll data.
   * @returns {object}
   */
  getRollData() {
    let rollData = {};
    if (this.parent.actor) {
      rollData = this.parent.actor.getRollData();
    }
    rollData[this.parent.documentName] = this.toObject();
    rollData[this.parent.documentName]["name"] = this.parent.name;
    rollData[this.parent.type] = rollData[this.parent.documentName];
    return rollData;
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
