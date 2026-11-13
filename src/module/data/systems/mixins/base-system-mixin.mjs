import { fancifyFields, makeIconClass, mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { AbstractDataMixin, AccessDataMixin } from "../../mixins/_module.mjs";

/**
 * @import { DialogV2 } from "@client/applications/api/_module.mjs";
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 * @import { ColorSource } from "@common/_types.mjs";
 */

/**
 * @template {MixinBase<typeof TypeDataModel>} T
 * @param {T} Base
 */
export default function BaseSystemMixin(Base) {
  /**
   * @mixes AbstractData
   * @mixes AccessData
   * @mixin
   */
  class BaseSystem extends mixClasses(Base, AbstractDataMixin, AccessDataMixin) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [];

    /**
     * @inheritDoc
     * @type {Teriock.Metadata.SystemMetadata}
     */
    static metadata = mergeMetadata(super.metadata, {
      descriptionPath: null,
      disabledPath: null,
      documentName: "",
      icon: TERIOCK.DISPLAY.icons.manifest.ui.document,
      img: TERIOCK.DISPLAY.thumbnails.common.unknown,
      initialConsumable: false,
      preserveOnRefresh: [],
      sortPaths: ["name", "_stats.createdTime"],
      tags: {
        applicable: false,
        armament: false,
        attunable: false,
        blocks: false,
        consumable: false,
        granted: false,
        hierarchy: false,
        revealable: false,
        simple: false,
        statted: false,
        transformation: false,
        triggerable: false,
        untrackable: false,
        usable: false,
        wiki: false,
      },
      type: "",
    });

    /**
     * Localization key for this system class' type label.
     * @returns {string}
     */
    static get typeLabel() {
      if (!this.metadata.documentName) { return ""; }
      return `TYPES.${this.metadata.documentName}.${this.metadata.type}`;
    }

    /**
     * Update a {@link BaseDocument.createDialog} whenever its form changes while this type is selected. Elements added
     * to the form should have a `data-system-field` attribute so they're removed when the type changes.
     * @param {DialogV2} _dialog
     */
    static _onChangeCreateDialog(_dialog) {}

    /** @inheritDoc */
    static defineSchema() {
      return Base.defineSchema === foundry.abstract.DataModel.defineSchema ? {} : super.defineSchema();
    }

    /**
     * Register this data model in the `CONFIG`.
     */
    static registerModel() {
      const documentName = this.metadata.documentName;
      const type = this.metadata.type;
      if (!documentName) { return; }
      const config = CONFIG[documentName];
      if (config && type) {
        CONFIG[documentName].dataModels[type] = this;
        CONFIG[documentName].typeHints[type] = `TERIOCK.DOCUMENTS.${documentName}.${type}.hint`;
        CONFIG[documentName].typeIcons[type] = makeIconClass(this.metadata.icon, "title");
        CONFIG[documentName].typeLabels[type] = this.typeLabel;
      }
    }

    /**
     * Raw color source or null.
     * @returns {ColorSource|null}
     */
    get _color() {
      return null;
    }

    /**
     * System-specific handling of the default embed type.
     * @returns {Teriock.Keys.EmbedType|null}
     */
    get _defaultEmbedType() {
      return null;
    }

    /**
     * Custom buttons to activate things from sheet menus. Should not toggle HTML fields.
     * @returns {Teriock.Display.DisplayButton[]}
     */
    get _displayButtons() {
      return [];
    }

    /**
     * The canonical description field.
     * @returns {Teriock.Display.DisplayField}
     */
    get _displayFieldDescription() {
      return { label: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"), path: this.metadata.descriptionPath };
    }

    /**
     * HTML fields to display on sheets and in panels.
     * @returns {Teriock.Display.DisplayField[]}
     */
    get _displayFields() {
      return [...this._displayFieldsImportant, ...this._displayFieldsContent];
    }

    /**
     * HTML content fields to display on sheets and in panels.
     * @returns {Teriock.Display.DisplayField[]}
     */
    get _displayFieldsContent() {
      return this.metadata.descriptionPath ? [this._displayFieldDescription] : [];
    }

    /**
     * Important HTML fields to display on sheets and in panels.
     * @returns {Teriock.Display.DisplayField[]}
     */
    get _displayFieldsImportant() {
      return [];
    }

    /**
     * Inputs to display in sheet menus.
     * @returns {Teriock.Display.DisplayField[]}
     */
    get _displayInputs() {
      return [];
    }

    /**
     * Tags to display on sheets below the menu.
     * @returns {Teriock.Display.DisplayTag[]}
     */
    get _displayTags() {
      return [];
    }

    /**
     * Toggles to display in sheet menus.
     * @returns {Teriock.Display.DisplayField[]}
     */
    get _displayToggles() {
      return [];
    }

    /**
     * Mechanic toggles to display on things that hit other things.
     * @returns {Teriock.Mechanics.MechanicToggleEntry[]}
     */
    get _mechanicTogglesHit() {
      return [{
        group: "results",
        icon: TERIOCK.DISPLAY.icons.manifest.results.baseCrit,
        id: "resultsBaseCrit",
        off: "TERIOCK.MECHANIC_TOGGLES.Results.critHit.off",
        on: "TERIOCK.MECHANIC_TOGGLES.Results.critHit.on",
        visible: pseudo => pseudo.modifiesChatData,
      }, {
        group: "results",
        icon: TERIOCK.DISPLAY.icons.manifest.results.base,
        id: "resultsBase",
        off: "TERIOCK.MECHANIC_TOGGLES.Results.hit.off",
        on: "TERIOCK.MECHANIC_TOGGLES.Results.hit.on",
        visible: pseudo => pseudo.modifiesChatData,
      }];
    }

    /**
     * A string to display following a colon after a document's name. Used for documents where there's one key scaling
     * parameter that is always important to see with the document.
     * @returns {string}
     */
    get _nameBadge() {
      return "";
    }

    /**
     * Tags to display in parentheses after a document's name. Used for things that distinguish variations on some
     * modified document.
     * @returns {string[]}
     */
    get _nameTags() {
      return [];
    }

    /**
     * Bars to show in a panel.
     * @returns {Teriock.Panels.PanelBar[]}
     */
    get _panelBars() {
      return [];
    }

    /**
     * Blocks to show in a panel.
     * @returns {Teriock.Panels.PanelBlock[]}
     */
    get _panelBlocks() {
      return fancifyFields(this._displayFields ?? []).map(f => {
        const schema = this.parent.getFieldForProperty(f.path);
        const value = foundry.utils.getProperty(this.parent._source, f.path)
          || foundry.utils.getProperty(this.parent, f.path);
        if (!value) { return; }
        const text = this.metadata.tags.blocks ? `@Embed[${this.parent.uuid} path=${f.path} inline]` : value;
        const gm = Boolean(schema?.options.gm || (schema?.options.secret && this.hasSecrets));
        return { classes: f.classes, gm, text, title: f.label || schema.label };
      }).filter(Boolean);
    }

    /**
     * A color to display around the image for this document.
     * @returns {Color}
     */
    get color() {
      return foundry.utils.Color.from(this._color);
    }

    /**
     * Tips that appear on document sheets and tooltips.
     * @returns {Teriock.UI.Tip[]}
     */
    get displayTips() {
      return [];
    }

    /**
     * A string containing the document's name and any other additional adjustments that go along with it.
     * @returns {string}
     */
    get fullName() {
      let name = this.parent?.name ?? "";
      if (this._nameBadge) {
        name = _loc("TERIOCK.SYSTEMS.Base.EMBED.valueNameString", { name, value: this._nameBadge.trim() });
      }
      if (this._nameTags.length > 0) {
        name = _loc("TERIOCK.SYSTEMS.Base.EMBED.taggedNameString", {
          name,
          tags: this._nameTags.join(_loc("TERIOCK.SYSTEMS.Base.EMBED.valueSeparator")),
        });
      }
      return name.trim();
    }

    /**
     * Whether this document has secret fields which should be hidden from players.
     * @returns {boolean}
     */
    get hasSecrets() {
      return false;
    }

    /**
     * Whether this document applies passively instead of only when used.
     * @returns {boolean}
     */
    get isPassive() {
      return true;
    }

    /**
     * Whether using this document makes chat data.
     * @returns {boolean}
     */
    get makesChatData() {
      return this.metadata.tags.usable;
    }

    /**
     * Whether using this document makes effect data.
     * @returns {boolean}
     */
    get makesEffectData() {
      return false;
    }

    /**
     * The toggles that will be displayed on mechanic pseudo-documents.
     * @returns {Teriock.Mechanics.MechanicToggleEntry[]}
     */
    get mechanicToggles() {
      return [];
    }

    /**
     * @inheritDoc
     * @returns {Teriock.Metadata.SystemMetadata}
     */
    get metadata() {
      return this.constructor.metadata;
    }

    /**
     * Parts of a panel.
     * @returns {Promise<Partial<Teriock.Panels.PanelParts>>}
     */
    async getPanelParts() {
      return {
        associations: /** @type {Teriock.Panels.PanelAssociation[]} */ [],
        bars: this._panelBars,
        blocks: this._panelBlocks,
      };
    }

    /**
     * Get the tips allowed by the client settings.
     * @param {"sheets"|"tooltips"} category
     * @returns {Teriock.UI.Tip[]}
     */
    getVisibleTips(category) {
      const settings = TERIOCK.CONFIG.tip.settings[category];
      return this.displayTips.filter(tip => !settings[tip.level] || game.settings.get("teriock", settings[tip.level]));
    }
  }

  return BaseSystem;
}
