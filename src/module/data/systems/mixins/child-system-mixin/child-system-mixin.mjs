import * as systemMixins from "../_module.mjs";
import impactConfig from "../../../../constants/config/impact-config.mjs";
import systemConfig from "../../../../constants/config/system-config.mjs";
import { TeriockChatMessage } from "../../../../documents/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { toKebabCase } from "../../../../helpers/string.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { initialBoolean } from "../../../fields/tools/initializers.mjs";
import * as dataMixins from "../../../mixins/_module.mjs";
import { CommonDocumentSettingsModel } from "../../../models/settings-models/_module.mjs";

const { fields } = foundry.data;
const { ImagePopout } = foundry.applications.apps;

/**
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

/**
 * @template {Constructor<TypeDataModel>} T
 * @param {T} Base
 * @returns {MixinResult<T, ChildSystem & Teriock.Models.ChildSystemData>}
 */
export default function ChildSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.ChildSystemData}
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
    static PRESERVED_PROPERTIES = ["system.competence", ...super.PRESERVED_PROPERTIES];

    /** @inheritDoc */
    static get Execution() {
      return teriock.executions.abstract.DocumentExecution;
    }

    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { initialKind: "normal" });
    }

    /** @inheritDoc */
    static defineSchema() {
      const kinds = this.kinds();
      return Object.assign(super.defineSchema(), {
        boosts: new fields.SchemaField(
          objectMap(impactConfig, e => new FormulaField({ deterministic: false, initial: "", label: e.label }), {
            filter: e => !e?.hidden,
          }),
          { persisted: false },
        ),
        description: new fields.HTMLField({ initial: "" }),
        forceSuppressed: new initialBoolean(),
        kind: new fields.StringField({
          blank: false,
          choices: localizeChoices(objectMap(kinds, v => v.label)),
          initial: this.metadata.initialKind,
          required: true,
        }),
        settings: new fields.EmbeddedDataField(CommonDocumentSettingsModel),
      });
    }

    /**
     * Kind entries available for this system. Override on subclasses.
     * @returns {Record<string, Teriock.Config.KindEntry>}
     */
    static kinds() {
      return systemConfig.defaultKinds;
    }

    /**
     * Localized error messages for {@link ChildSystem.displayTips}.
     * @returns {Set<string>}
     */
    #getTipErrorMessages() {
      return new Set(
        Object.entries(this._getTipErrors()).filter(([k, v]) =>
          game.settings.get("teriock", "errorMessages").has(k) && v()
        ).map(([k, _v]) => k),
      ).map(k => TERIOCK.config.tip.error[k]);
    }

    /**
     * Localized suppression messages for {@link ChildSystem.displayTips}.
     * @returns {Set<string>}
     */
    #getTipSuppressionMessages() {
      if (!game.settings.get("teriock", "suppressionMessageTypes").has(this.parent.type)) { return new Set(); }
      return new Set(
        Object.entries(this._getTipSuppressions()).filter(([k, v]) =>
          game.settings.get("teriock", "suppressionMessages").has(k) && v()
        ).map(([k, _v]) => k),
      ).map(k => TERIOCK.config.tip.suppression[k]);
    }

    /** @inheritDoc */
    get _color() {
      return this._kindEntry.color;
    }

    /** @inheritDoc */
    get _displayFields() {
      return ["system.description", ...super._displayFields];
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
        icon: TERIOCK.display.icons.manifest.ui.chat,
        tooltip: _loc("TERIOCK.SYSTEMS.Child.MENU.shareWriteup"),
        visible: this.parent.isViewer,
        onClick: async () => await this.parent.toMessage(),
      }, {
        action: "toggleDisabledDoc",
        icon: this.parent.disabled
          ? TERIOCK.display.icons.manifest.ui.disabled
          : TERIOCK.display.icons.manifest.ui.enabled,
        tooltip: this.parent.disabled
          ? _loc("TERIOCK.SYSTEMS.Child.EMBED.disabled")
          : _loc("TERIOCK.SYSTEMS.Child.EMBED.enabled"),
        visible: this.parent.isOwner && Boolean(this.metadata.disabledPath),
        onClick: () => this.parent.update({ [this.metadata.disabledPath]: !this.parent.disabled }),
      }];
    }

    /**
     * Panel bar that shows only this document's kind.
     * @returns {Teriock.Panels.PanelBar}
     */
    get _kindBar() {
      return { icon: this._kindEntry.icon, label: this.schema.fields.kind.label, wrappers: [this._kindEntry.label] };
    }

    /**
     * Config entry for the current kind.
     * @returns {Teriock.Config.KindEntry}
     */
    get _kindEntry() {
      return this.constructor.kinds()[this.kind];
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
        ...[...this.#getTipSuppressionMessages()].map(text => ({ level: "warning", text })),
        ...[...this.#getTipErrorMessages()].map(text => ({ level: "error", text })),
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

    /**
     * Whether this should be made suppressed.
     * @returns {boolean}
     */
    get isSuppressed() {
      return Object.values(this._getTipSuppressions()).some(s => s());
    }

    /** @returns {boolean} */
    get isUsable() {
      return this.constructor.metadata.usable;
    }

    /** @inheritDoc */
    get useText() {
      return _loc("TERIOCK.SYSTEMS.Child.USAGE.use", { value: this.parent.name });
    }

    /**
     * Errors are just messages don't affect functionality. Each one has a notification message registered in the tip
     * config and a method to call to check if this has an error.
     * @returns {Record<Teriock.Config.ErrorMessageKey, () => boolean}
     */
    _getTipErrors() {
      return {};
    }

    /**
     * Suppressions determine if this is suppressed or not. Each one has a notification message registered in the tip
     * config and a method to call to check if this is suppressed.
     * @returns {Record<Teriock.Config.SuppressionMessageKey, () => boolean>}
     */
    _getTipSuppressions() {
      return {
        disabled: this._isSuppressedDisabled.bind(this),
        elder: this._isSuppressedElder.bind(this),
        forced: this._isSuppressedForced.bind(this),
      };
    }

    /**
     * If this is suppressed due to being disabled.
     * @returns {boolean}
     */
    _isSuppressedDisabled() {
      return this.parent.disabled;
    }

    /**
     * If this is suppressed due to its parent being inactive.
     * @returns {boolean}
     */
    _isSuppressedElder() {
      return this.parent.elder?.active === false;
    }

    /**
     * If this is suppressed due to something explicitly forcing it to be that way.
     * @returns {boolean}
     */
    _isSuppressedForced() {
      return this.forceSuppressed;
    }

    /** @inheritDoc */
    async _use(data = {}, options = {}) {
      options.actor ??= this.actor;
      options.source = this.parent;
      await this.constructor.Execution.create(data, options);
    }

    /**
     * Ensure {@link ChildSystem._kindBar} is the first panel bar.
     * @param {Teriock.Panels.PanelBar[]} [bars]
     * @returns {Teriock.Panels.PanelBar[]}
     * @todo This is clunky and I should do better. The homies deserve better.
     */
    _withKindBar(bars = []) {
      return [this._kindBar, ...bars];
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      const entries = super.getEmbedContextMenuEntries(doc);
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
          icon: makeIcon(TERIOCK.display.icons.manifest.ui.enable, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Child.MENU.enable"),
          visible: this.parent?.isOwner
            && this.parent.disabled
            && Boolean(this.metadata.disabledPath)
            && this.parent.type !== "equipment"
            && this.parent.type !== "mount"
            && doc !== this.parent,
          onClick: async () => await this.parent.update({ [this.metadata.disabledPath]: false }),
        },
        {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.manifest.ui.disable, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Child.MENU.disable"),
          visible: this.parent?.isOwner
            && !this.parent.disabled
            && Boolean(this.metadata.disabledPath)
            && this.parent.type !== "equipment"
            && this.parent.type !== "mount"
            && !(this.parent.type === "ability" && this.isVirtual)
            && doc !== this.parent,
          onClick: async () => await this.parent.update({ [this.metadata.disabledPath]: true }),
        },
        {
          group: "open",
          icon: makeIcon(TERIOCK.display.icons.manifest.ui.image, "contextMenu"),
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
          icon: makeIcon(TERIOCK.display.icons.manifest.ui.shareImage, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Child.MENU.shareImage"),
          onClick: async () => TeriockChatMessage.fromImg(this.parent.img, { actor: this.actor }),
        },
        {
          group: "share",
          icon: makeIcon(TERIOCK.display.icons.manifest.ui.shareText, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Child.MENU.shareWriteup"),
          onClick: this.parent.toMessage.bind(this.parent),
        },
        this._getPanelCardContextMenuEntry(),
        {
          group: "document",
          icon: makeIcon(TERIOCK.display.icons.manifest.ui.duplicate, "contextMenu"),
          label: _loc("SIDEBAR.Duplicate"),
          onClick: async () => await this.parent.duplicate(),
          visible: () => this.parent._checkValidEditorDocument(doc, { self: false }),
        },
      ]);
      return entries;
    }

    /** @inheritDoc */
    getLocalRollData() {
      return { ...super.getLocalRollData(), [`kind.${toKebabCase(this.kind)}`]: 1, kind: this.kind };
    }

    /** @inheritDoc */
    async getPanelParts() {
      const parts = await super.getPanelParts();
      parts.bars = this._withKindBar(parts.bars);
      return parts;
    }
  }

  return ChildSystem;
}
