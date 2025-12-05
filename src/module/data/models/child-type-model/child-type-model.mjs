import { fancifyFields, getSchema, makeIcon } from "../../../helpers/utils.mjs";
import { EvaluationField, TextField } from "../../shared/fields/_module.mjs";
import CommonTypeModel from "../common-type-model/common-type-model.mjs";

const { fields } = foundry.data;
const { ImagePopout } = foundry.applications.apps;

/**
 * Data model shared by items and effects.
 */
export default class ChildTypeModel extends CommonTypeModel {
  /** @inheritDoc */
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
        initial: "",
        label: "Description",
      }),
      qualifiers: new fields.SchemaField({
        ephemeral: new EvaluationField({
          hint: "When this formula is true, the document will be hidden and treated as if it doesn't exist.",
          initial: "0",
          label: "Ephemeral Formula",
        }),
        suppressed: new EvaluationField({
          hint: "When this formula is true, the document will be made inactive.",
          initial: "0",
          label: "Suppressed Formula",
        }),
      }),
    });
    return schema;
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (typeof data?.qualifiers?.ephemeral !== "object") {
      foundry.utils.setProperty(data, "qualifiers.ephemeral", { raw: "0" });
    }
    if (typeof data?.qualifiers?.suppressed !== "object") {
      foundry.utils.setProperty(data, "qualifiers.suppressed", { raw: "0" });
    }
    return super.migrateData(data);
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    const entries = super.getCardContextMenuEntries(doc);
    entries.push(
      ...[
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
          condition:
            this.parent.parent?.isOwner &&
            this.parent.disabled &&
            this.parent.type !== "equipment",
          group: "control",
        },
        {
          name: "Disable",
          icon: makeIcon("xmark-large", "contextMenu"),
          callback: this.parent.disable.bind(this.parent),
          condition:
            this.parent.parent?.isOwner &&
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
            await new ImagePopout({
              src: this.parent.img,
              uuid: this.parent.uuid,
              window: { title: this.parent.nameString },
            }).render(true);
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
          name: "Duplicate",
          icon: makeIcon("copy", "contextMenu"),
          callback: async () => {
            await this.parent.duplicate();
          },
          condition: () =>
            this.parent?.elder?.sheet?.editable && this.parent.isOwner,
          group: "document",
        },
      ],
    );
    return entries;
  }

  /**
   * Fields to display in panels and sheets.
   * @returns {Teriock.Sheet.DisplayField[]}
   */
  get displayFields() {
    return ["system.description"];
  }

  /**
   * Toggles to display in sheets.
   * @returns {Teriock.Sheet.DisplayField[]}
   */
  get displayToggles() {
    return ["system.proficient", "system.fluent"];
  }

  /** @inheritDoc */
  get embedActions() {
    const embedActions = super.embedActions;
    Object.assign(embedActions, {
      useDoc: {
        primary: async (event, relative) => {
          const options = this.parseEvent(event);
          if (relative?.actor) {
            options.actor = relative.actor;
          }
          await this.parent.use(options);
        },
      },
    });
    return embedActions;
  }

  /** @inheritDoc */
  get embedIcons() {
    return [
      ...super.embedIcons,
      {
        icon: "comment",
        action: "chatDoc",
        tooltip: "Send to Chat",
        callback: async () => {
          await this.parent.toMessage();
        },
        condition: this.parent.isViewer,
      },
      {
        icon: this.parent.disabled ? "circle" : "circle-check",
        action: "toggleDisabledDoc",
        callback: () => this.parent.toggleDisabled(),
        tooltip: this.parent.disabled ? "Disabled" : "Enabled",
        condition: this.parent.isOwner,
      },
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.makeTooltip = true;
    parts.action = "useDoc";
    parts.struck = this.parent.disabled;
    parts.usable = true;
    return parts;
  }

  /**
   * Whether this can be used.
   * @returns {boolean}
   */
  get isUsable() {
    return this.constructor.metadata.usable;
  }

  /**
   * Make this document ephemeral.
   * @returns {boolean}
   */
  get makeEphemeral() {
    return (
      !!this.parent.elder?.isEphemeral || !!this.qualifiers.ephemeral.value
    );
  }

  /**
   * Make this document suppressed.
   * @returns {boolean}
   */
  get makeSuppressed() {
    return (
      !!(this.parent.elder && !this.parent.elder?.active) ||
      !!this.qualifiers.suppressed.value ||
      !!this.parent.isEphemeral
    );
  }

  /**
   * Message panel bars.
   * @returns {Teriock.MessageData.MessageBar[]}
   */
  get messageBars() {
    return [];
  }

  /**
   * Message panel blocks.
   * @returns {Teriock.MessageData.MessageBlock[]}
   */
  get messageBlocks() {
    return fancifyFields(this.displayFields)
      .map((f) => {
        const schema = getSchema(this.parent, f.path);
        const value = foundry.utils.getProperty(this.parent, f.path);
        if (value && !schema.gmOnly) {
          return {
            title: f.label || schema.label,
            text: value,
            classes: f.classes,
          };
        }
      })
      .filter((f) => f);
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

  /** @inheritDoc */
  async deleteThis() {
    if (this.parent.parent) {
      await this.parent.parent.deleteEmbeddedDocuments(
        this.parent.documentName,
        [this.parent.id],
      );
    } else {
      await super.deleteThis();
    }
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

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    this.qualifiers.suppressed.evaluate();
    this.qualifiers.ephemeral.evaluate();
  }

  /**
   * Initiates a roll for the child document.
   * Delegates to the parent document's chat functionality.
   * @param {object} options - Options for the roll operation.
   * @returns {Promise<void>}
   */
  async roll(options = {}) {
    await this.parent.toMessage(options);
  }

  /**
   * Uses the child document, which triggers a roll.
   * Alias for the roll method to provide a consistent interface.
   * @param {object} options - Options for the use operation.
   * @returns {Promise<void>}
   */
  async use(options = {}) {
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
