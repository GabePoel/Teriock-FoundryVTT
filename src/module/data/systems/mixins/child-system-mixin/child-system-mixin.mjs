import impactConfig from "../../../../constants/config/impact-config.mjs";
import { TeriockChatMessage } from "../../../../documents/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { initialBoolean } from "../../../fields/tools/initializers.mjs";
import * as dataMixins from "../../../mixins/_module.mjs";
import { CommonDocumentSettingsModel } from "../../../models/settings-models/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";

const { fields } = foundry.data;
const { ImagePopout } = foundry.applications.apps;

/**
 * @param {typeof TypeDataModel} Base
 */
export default function ChildSystemMixin(Base) {
  return (
    /**
     * @extends {TypeDataModel}
     * @extends {Teriock.Models.ChildSystemData}
     * @mixes CommonSystem
     * @mixes AutomatableSystem
     * @mixes UsableData
     * @mixes HierarchySystem
     * @mixin
     */
    class ChildSystem
      extends mixClasses(
        Base,
        systemMixins.CommonSystemMixin,
        systemMixins.AutomatableSystemMixin,
        dataMixins.UsableDataMixin,
        systemMixins.HierarchySystemMixin,
      )
    {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = super.LOCALIZATION_PREFIXES.concat("TERIOCK.SYSTEMS.Child");

      /** @inheritDoc */
      static PRESERVED_PROPERTIES = ["system.competence", "system.instructions", ...super.PRESERVED_PROPERTIES];

      /** @inheritDoc */
      static get Execution() {
        return teriock.executions.abstract.DocumentExecution;
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          boosts: new fields.SchemaField(
            objectMap(impactConfig, e => new FormulaField({ deterministic: false, initial: "", label: e.label }), {
              filter: e => !e?.hidden,
            }),
            { persisted: false },
          ),
          description: new fields.HTMLField({ initial: "" }),
          forceSuppressed: new initialBoolean(),
          instructions: new fields.HTMLField({ initial: "" }),
          settings: new fields.EmbeddedDataField(CommonDocumentSettingsModel),
        });
      }

      /**
       * Display field for setup instructions.
       * @returns {Teriock.Display.DisplayField}
       */
      get _displayFieldInstructions() {
        return { classes: `${TERIOCK.display.panel.classes.instructions} theme-dark`, path: "system.instructions" };
      }

      /** @inheritDoc */
      get _displayFields() {
        return [this._displayFieldInstructions, "system.description", ...super._displayFields];
      }

      /**
       * Localized error messages for {@link ChildSystem.displayTips}.
       * @returns {Set<string>}
       */
      get _displayMessagesError() {
        return new Set();
      }

      /**
       * Localized suppression messages for {@link ChildSystem.displayTips}.
       * @returns {Set<string>}
       */
      get _displayMessagesSuppression() {
        const messages = new Set();
        if (this.parent.disabled) { this._addSuppressionMessage("disabled", messages); }
        if (this._isSuppressedForced) { this._addSuppressionMessage("forced", messages); }
        if (this._isSuppressedElder) { this._addSuppressionMessage("elder", messages); }
        return messages;
      }

      /** @inheritDoc */
      get _displayTags() {
        return [...super._displayTags, ...this._statusTags];
      }

      /** @inheritDoc */
      get _embedActions() {
        return Object.assign(super._embedActions, {
          useDoc: {
            primary: async (event, relative) => await this.use({ actor: relative?.actor, event }),
            secondary: async (event, relative) => await this.use({ actor: relative?.actor, event }),
          },
        });
      }

      /** @inheritDoc */
      get _embedIcons() {
        return [...super._embedIcons, {
          action: "chatDoc",
          icon: TERIOCK.display.icons.ui.chat,
          tooltip: _loc("TERIOCK.SYSTEMS.Child.MENU.shareWriteup"),
          visible: this.parent.isViewer,
          onClick: async () => await this.parent.toMessage(),
        }, {
          action: "toggleDisabledDoc",
          icon: this.parent.disabled ? TERIOCK.display.icons.ui.disabled : TERIOCK.display.icons.ui.enabled,
          tooltip: this.parent.disabled
            ? _loc("TERIOCK.SYSTEMS.Child.EMBED.disabled")
            : _loc("TERIOCK.SYSTEMS.Child.EMBED.enabled"),
          visible: this.parent?.isOwner,
          onClick: () => this.parent.toggleDisabled(),
        }];
      }

      /**
       * If this is suppressed due to its parent being inactive.
       * @returns {boolean}
       */
      get _isSuppressedElder() {
        return this.parent.elder?.active === false;
      }

      /**
       * If this is suppressed due to something explicitly forcing it to be that way.
       * @returns {boolean}
       */
      get _isSuppressedForced() {
        return this.forceSuppressed;
      }

      /** @inheritDoc */
      get _masterText() {
        return this.parent.master?.documentName === "Actor" ? "" : super._masterText;
      }

      /**
       * Status tags.
       * @returns {Teriock.Display.DisplayTag[]}
       */
      get _statusTags() {
        return [{
          label: this.parent.active ? "TERIOCK.SHEETS.Common.TAGS.active" : "TERIOCK.SHEETS.Common.TAGS.inactive",
          tooltip: "TERIOCK.SHEETS.Child.DISPLAY.activeStatus",
        }];
      }

      /** @inheritDoc */
      get displayTips() {
        return [
          ...[...this._displayMessagesSuppression].map(text => ({ level: "warning", text })),
          ...[...this._displayMessagesError].map(text => ({ level: "error", text })),
        ];
      }

      /** @inheritDoc */
      get embedParts() {
        return Object.assign(super.embedParts, {
          action: "useDoc",
          makeTooltip: true,
          struck: this.parent.disabled,
          usable: true,
        });
      }

      /** @returns {boolean} */
      get isUsable() {
        return this.constructor.metadata.usable;
      }

      /** @returns {boolean} */
      get makeSuppressed() {
        return this._isSuppressedForced || this._isSuppressedElder;
      }

      /**
       * @inheritDoc
       * @returns {AnyChildDocument}
       */
      get parent() {
        return /** @type {AnyChildDocument} */ super.parent;
      }

      /** @inheritDoc */
      get useText() {
        return _loc("TERIOCK.SYSTEMS.Child.USAGE.use", { value: this.parent.name });
      }

      /**
       * Add a configured error message to a set.
       * @param {Teriock.Config.ErrorMessageKey} key
       * @param {Set<string>} messages
       */
      _addErrorMessage(key, messages) {
        const text = TERIOCK.config.tip.error[key];
        if (!text || !game.settings.get("teriock", "errorMessages").has(key)) { return; }
        messages.add(text);
      }

      /**
       * Add a configured suppression message to a set.
       * @param {Teriock.Config.SuppressionMessageKey} key
       * @param {Set<string>} messages
       */
      _addSuppressionMessage(key, messages) {
        const text = TERIOCK.config.tip.suppression[key];
        if (
          !text || !game.settings.get("teriock", "suppressionMessageTypes").has(this.parent.type)
          || !game.settings.get("teriock", "suppressionMessages").has(key)
        ) { return; }
        messages.add(text);
      }

      /** @inheritDoc */
      async _use(data = {}, options = {}) {
        options.actor ??= this.actor;
        options.source = this.parent;
        await this.constructor.Execution.create(data, options);
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        const entries = super.getCardContextMenuEntries(doc);
        entries.push(...[
          {
            group: "usage",
            icon: makeIcon(this.useIcon, "contextMenu"),
            label: this.useText,
            visible: this.isUsable,
            onClick: async () => await this.use(),
          },
          {
            group: "control",
            icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.Child.MENU.enable"),
            onClick: this.parent.enable.bind(this.parent),
            visible: this.parent?.isOwner
              && this.parent.disabled
              && this.parent.type !== "equipment"
              && this.parent.type !== "mount"
              && doc !== this.parent,
          },
          {
            group: "control",
            icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.Child.MENU.disable"),
            onClick: this.parent.disable.bind(this.parent),
            visible: this.parent?.isOwner
              && !this.parent.disabled
              && this.parent.type !== "equipment"
              && this.parent.type !== "mount"
              && !(this.parent.type === "ability" && this.isVirtual)
              && doc !== this.parent,
          },
          {
            group: "open",
            icon: makeIcon(TERIOCK.display.icons.ui.notes, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.Child.MENU.openGmNotes"),
            visible: game.user.isGM,
            onClick: async () => await this.gmNotesOpen(),
          },
          {
            group: "open",
            icon: makeIcon(TERIOCK.display.icons.ui.image, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.Child.MENU.openImage"),
            onClick: async () => {
              await new ImagePopout({
                src: this.parent.img,
                uuid: this.parent.uuid,
                window: { title: this.parent.fullName },
              }).render(true);
            },
          },
          {
            group: "share",
            icon: makeIcon(TERIOCK.display.icons.ui.shareImage, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.Child.MENU.shareImage"),
            onClick: async () => TeriockChatMessage.fromImg(this.parent.img, { actor: this.actor }),
          },
          {
            group: "share",
            icon: makeIcon(TERIOCK.display.icons.ui.shareText, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.Child.MENU.shareWriteup"),
            onClick: this.parent.toMessage.bind(this.parent),
          },
          this._getPanelCardContextMenuEntry(),
          {
            group: "document",
            icon: makeIcon(TERIOCK.display.icons.ui.duplicate, "contextMenu"),
            label: _loc("SIDEBAR.Duplicate"),
            onClick: async () => await this.parent.duplicate(),
            visible: () => this.parent._checkValidEditorDocument(doc, { self: false }),
          },
        ]);
        return entries;
      }

      /**
       * @param {Teriock.Display.DisplayField} field
       * @returns {boolean}
       */
      isInstructionsField(field) {
        return (typeof field === "string" ? field : field.path) === "system.instructions";
      }

      /** @inheritDoc */
      async use(options = {}) {
        await this.parent.hookCall("use");
        Hooks.callAll(`teriock.use${this.parent.type.capitalize()}`, [this.parent]);
        await super.use(options);
      }
    }
  );
}
