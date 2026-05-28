import { impactConfig } from "../../../../constants/config/impact-config.mjs";
import { TeriockChatMessage } from "../../../../documents/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { ucFirst } from "../../../../helpers/string.mjs";
import { makeIcon, objectMap } from "../../../../helpers/utils.mjs";
import { EvaluationField, FormulaField } from "../../../fields/_module.mjs";
import { initialBoolean } from "../../../fields/helpers/initializers.mjs";
import { ChildSettingsModel } from "../../../models/settings-models/_module.mjs";
import { UsableDataMixin } from "../../../shared/mixins/_module.mjs";
import { CommonSystemMixin, HierarchySystemMixin } from "../../mixins/_module.mjs";

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
     * @mixes UsableData
     * @mixes HierarchySystem
     * @mixin
     */
    class ChildSystem extends mixClasses(Base, CommonSystemMixin, UsableDataMixin, HierarchySystemMixin) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = super.LOCALIZATION_PREFIXES.concat("TERIOCK.SYSTEMS.Child");

      /** @inheritDoc */
      static PRESERVED_PROPERTIES = ["system.competence", "system.qualifiers", ...super.PRESERVED_PROPERTIES];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          boosts: new fields.SchemaField(
            objectMap(impactConfig, e => new FormulaField({ deterministic: false, initial: "", label: e.label }), {
              filter: e => !e.hidden,
            }),
            { persisted: false },
          ),
          description: new fields.HTMLField({ initial: "" }),
          forceSuppressed: new initialBoolean(),
          qualifiers: new fields.SchemaField({
            ephemeral: new EvaluationField({ deterministic: true, initial: "0" }),
            suppressed: new EvaluationField({ deterministic: true, initial: "0" }),
          }),
        });
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

      /**
       * If this is suppressed due to qualifiers.
       * @returns {boolean}
       */
      get _isSuppressedQualifier() {
        return !!this.qualifiers.suppressed.value || !!this.parent.isEphemeral;
      }

      /** @inheritDoc */
      get _masterText() {
        return this.parent.master?.documentName === "Actor" ? "" : super._masterText;
      }

      /**
       * Status tags.
       * @returns {Teriock.Sheet.DisplayTag[]}
       */
      get _statusTags() {
        return [{
          label: this.parent.active ? "TERIOCK.SHEETS.Common.TAGS.active" : "TERIOCK.SHEETS.Common.TAGS.inactive",
          tooltip: "TERIOCK.SHEETS.Child.DISPLAY.activeStatus",
        }];
      }

      /** @inheritDoc */
      get displayFields() {
        return [...super.displayFields, "system.description"];
      }

      /** @inheritDoc */
      get displayTags() {
        return [...super.displayTags, ...this._statusTags];
      }

      /** @inheritDoc */
      get embedActions() {
        return Object.assign(super.embedActions, {
          useDoc: {
            primary: async (event, relative) => await this.use({ actor: relative?.actor, event }),
            secondary: async (event, relative) => await this.use({ actor: relative?.actor, event }),
          },
        });
      }

      /** @inheritDoc */
      get embedIcons() {
        return [...super.embedIcons, {
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
          visible: this.parent.isOwner,
          onClick: () => this.parent.toggleDisabled(),
        }];
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
      get makeEphemeral() {
        return !!this.parent.elder?.isEphemeral || !!this.qualifiers.ephemeral.value;
      }

      /** @returns {boolean} */
      get makeSuppressed() {
        return this._isSuppressedForced || this._isSuppressedElder || this._isSuppressedQualifier;
      }

      /**
       * @inheritDoc
       * @returns {AnyChildDocument}
       */
      get parent() {
        return /** @type {AnyChildDocument} */ super.parent;
      }

      /** @inheritDoc */
      get SettingsFlagsDataModel() {
        return ChildSettingsModel;
      }

      /** @inheritDoc */
      get useText() {
        return _loc("TERIOCK.SYSTEMS.Child.USAGE.use", { value: this.parent.name });
      }

      /** @inheritDoc */
      async _use(options = {}) {
        await this.parent.toMessage(options);
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        const entries = super.getCardContextMenuEntries(doc);
        entries.push(...[{
          group: "usage",
          icon: makeIcon(this.useIcon, "contextMenu"),
          label: this.useText,
          visible: this.isUsable,
          onClick: async () => await this.use(),
        }, {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Child.MENU.enable"),
          onClick: this.parent.enable.bind(this.parent),
          visible: this.parent.isOwner
            && this.parent.disabled
            && this.parent.type !== "equipment"
            && this.parent.type !== "mount"
            && doc !== this.parent,
        }, {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Child.MENU.disable"),
          onClick: this.parent.disable.bind(this.parent),
          visible: this.parent.isOwner
            && !this.parent.disabled
            && this.parent.type !== "equipment"
            && this.parent.type !== "mount"
            && !(this.parent.type === "ability" && this.isVirtual)
            && doc !== this.parent,
        }, {
          group: "open",
          icon: makeIcon(TERIOCK.display.icons.ui.notes, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Child.MENU.openGmNotes"),
          visible: game.user.isGM,
          onClick: async () => await this.gmNotesOpen(),
        }, {
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
        }, {
          group: "share",
          icon: makeIcon(TERIOCK.display.icons.ui.shareImage, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Child.MENU.shareImage"),
          onClick: async () => TeriockChatMessage.fromImage(this.parent.img, { actor: this.actor }),
        }, {
          group: "share",
          icon: makeIcon(TERIOCK.display.icons.ui.shareText, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Child.MENU.shareWriteup"),
          onClick: this.parent.toMessage.bind(this.parent),
        }, {
          group: "document",
          icon: makeIcon(TERIOCK.display.icons.ui.duplicate, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Common.MENU.duplicate"),
          onClick: async () => await this.parent.duplicate(),
          visible: () => this.parent._checkValidEditorDocument(doc, { self: false }),
        }]);
        return entries;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.qualifiers.suppressed.evaluate();
        this.qualifiers.ephemeral.evaluate();
      }

      /** @inheritDoc */
      async use(options = {}) {
        await this.parent.hookCall("use");
        Hooks.callAll(`teriock.use${ucFirst(this.parent.type)}${this.parent.type.slice(1)}`, [this.parent]);
        await super.use(options);
      }
    }
  );
}
