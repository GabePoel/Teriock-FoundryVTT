import { fancifyFields, makeIcon } from "../../../../helpers/utils.mjs";
import { EvaluationField, TextField } from "../../../fields/_module.mjs";
import { ChildSettingsModel } from "../../../models/settings-models/_module.mjs";
import { UsableDataMixin } from "../../../shared/mixins/_module.mjs";
import CommonSystem from "../common-system/common-system.mjs";

const { fields } = foundry.data;
const { ImagePopout } = foundry.applications.apps;

//noinspection JSClosureCompilerSyntax
/**
 * Data model shared by items and effects.
 * @extends {Teriock.Models.CommonSystemInterface}
 * @mixes UsableData
 * @implements {Teriock.Models.ChildSystemInterface}
 */
export default class ChildSystem extends UsableDataMixin(CommonSystem) {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
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
          deterministic: true,
          hint: "When this formula is true, the document will be hidden and treated as if it doesn't exist.",
          initial: "0",
          label: "Ephemeral Formula",
        }),
        suppressed: new EvaluationField({
          deterministic: true,
          hint: "When this formula is true, the document will be made inactive.",
          initial: "0",
          label: "Suppressed Formula",
        }),
      }),
    });
  }

  /** @inheritDoc */
  get _settingsFlagsDataModel() {
    return ChildSettingsModel;
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
    return [];
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
        icon: TERIOCK.display.icons.ui.chat,
        action: "chatDoc",
        tooltip: "Send to Chat",
        callback: async () => {
          await this.parent.toMessage();
        },
        condition: this.parent.isViewer,
      },
      {
        icon: this.parent.disabled
          ? TERIOCK.display.icons.ui.disabled
          : TERIOCK.display.icons.ui.enabled,
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
        const schema = this.parent.getSchema(f.path);
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

  /** @inheritDoc */
  get useText() {
    return `Use ${this.parent.name}`;
  }

  /** @inheritDoc */
  async _use(options = {}) {
    await this.parent.toMessage(options);
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
          icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
          callback: this.parent.enable.bind(this.parent),
          condition:
            this.parent.parent?.isOwner &&
            this.parent.disabled &&
            this.parent.type !== "equipment",
          group: "control",
        },
        {
          name: "Disable",
          icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
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
          icon: makeIcon(TERIOCK.display.icons.ui.notes, "contextMenu"),
          callback: async () => {
            await this.gmNotesOpen();
          },
          condition: game.user.isGM,
          group: "open",
        },
        {
          name: "Open Image",
          icon: makeIcon(TERIOCK.display.icons.ui.image, "contextMenu"),
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
          icon: makeIcon(TERIOCK.display.icons.ui.shareImage, "contextMenu"),
          callback: this.parent.chatImage.bind(this.parent),
          group: "share",
        },
        {
          name: "Share Writeup",
          icon: makeIcon(TERIOCK.display.icons.ui.shareText, "contextMenu"),
          callback: this.parent.toMessage.bind(this.parent),
          group: "share",
        },
        {
          name: "Duplicate",
          icon: makeIcon(TERIOCK.display.icons.ui.duplicate, "contextMenu"),
          callback: async () => {
            await this.parent.duplicate();
          },
          condition: () =>
            this.parent?.elder?.sheet?.isEditable && this.parent.isOwner,
          group: "document",
        },
      ],
    );
    return entries;
  }

  /** @inheritDoc */
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      flu: Number(this.competence.fluent),
      pro: Number(this.competence.proficient),
      c: this.competence.bonus,
    };
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
    this.boosts =
      /** @type {Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>} */ {};
  }

  /** @inheritDoc */
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
      await this._use(options);
    }
  }
}
