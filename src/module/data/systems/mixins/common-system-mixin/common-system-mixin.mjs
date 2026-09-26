import { RefreshSystemMixin, RulesSystemMixin } from "../_module.mjs";
import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { pathSorterFactory } from "../../../../helpers/sort.mjs";
import { prefixObject } from "../../../../helpers/utils.mjs";
import { PropagationDataMixin } from "../../../mixins/_module.mjs";
import { Panel } from "../../../pseudo-documents/_module.mjs";

/**
 * @import { ContextMenuEntry } from "@client/applications/ux/context-menu.mjs";
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

/**
 * @template {Constructor<TypeDataModel>} T
 * @param {T} Base
 * @returns {MixinResult<T, CommonSystem & Teriock.Models.CommonSystemData>}
 */
export default function CommonSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.CommonSystemData}
   * @mixes RulesSystem
   * @mixes PropagationData
   * @mixes RefreshSystem
   * @mixin
   */
  class CommonSystem extends mixClasses(Base, PropagationDataMixin, RulesSystemMixin, RefreshSystemMixin) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Common"];

    /**
     * @inheritDoc
     * @type {Teriock.Metadata.CommonSystemMetadata}
     */
    static metadata = mergeMetadata(super.metadata, {
      childTypes: [],
      preserveOnRefresh: ["system.identifier", ...super.metadata.preserveOnRefresh],
      visibleTypes: [],
    });

    /**
     * Check if an embed icon is visible.
     * @param {Teriock.Embeds.EmbedIcon} icon
     */
    #checkEmbedIcon(icon) {
      if (typeof icon.visible === "function") { return icon.visible(); }
      if (typeof icon.visible === "boolean") { return icon.visible; }
      return true;
    }

    /** @returns {Record<string, Teriock.Embeds.EmbedAction>} */
    get _embedActions() {
      return {};
    }

    /** @returns {Teriock.Embeds.EmbedIcon[]} */
    get _embedIcons() {
      return [];
    }

    /** @inheritDoc */
    get _inputContextKey() {
      return "document";
    }

    /** @returns {string} */
    get _masterText() {
      return this.parent.master?.fullName || this.parent.master?.name || "";
    }

    /** @returns {Partial<Teriock.Embeds.EmbedParts>} */
    get embedParts() {
      return {
        color: this.color,
        draggable: this.getNearestDocument().isViewer,
        icons: this._embedIcons.filter(i => this.#checkEmbedIcon(i)),
        id: /** @type {ID<TeriockActiveEffect|TeriockActor|TeriockItem>} */ this.parent.id,
        img: this.parent.img,
        inactive: !this.parent.active,
        makeTooltip: false,
        openable: true,
        parentId: /** @type {ID<TeriockActiveEffect|TeriockActor|TeriockItem>} */ this.parent.parent?.id,
        struck: this.parent.disabled,
        subtitle: TERIOCK.config.document[this.parent.type]?.label,
        text: this._masterText,
        title: this.parent.fullName,
        uuid: this.parent.uuid,
      };
    }

    /**
     * A single icon which denotes something about this document.
     * @returns {Teriock.Embeds.EmbedIcon|null}
     */
    get tagIcon() {
      return null;
    }

    /**
     * Special handling for the types of this document's children that are visible.
     * @returns {Teriock.Documents.CommonType[]}
     */
    get visibleTypes() {
      return this.metadata.visibleTypes;
    }

    /**
     * A context menu entry which lets you open this as a panel.
     * @returns {ContextMenuEntry}
     */
    _getPanelCardContextMenuEntry() {
      return {
        group: "share",
        icon: makeIcon(TERIOCK.display.icons.manifest.ui.panel),
        label: _loc("TERIOCK.SHEETS.Panel.OPEN"),
        onClick: async () => await this.getNearestDocument().openPanelSheet(),
        visible: () => game.settings.get("teriock", "openPanelContextMenuEntry") && this.getNearestDocument().isViewer,
      };
    }

    /**
     * Open a panel instead of a full editable sheet.
     * @param {TeriockDocument} _doc
     * @returns {ContextMenuEntry[]}
     */
    getEmbedContextMenuEntries(_doc) {
      return [];
    }

    /** @inheritDoc */
    getLocalRollData() {
      const rollData = {
        [`identifier.${this.parent.forcedIdentifier}`]: 1,
        [`type.${this.parent.type}`]: 1,
        [this.parent.type]: 1,
      };
      if (this.metadata.tags.armament) { rollData.armament = 1; }
      if (Object.keys(this.parent.flags.rollData ?? {}).length) {
        Object.assign(rollData, foundry.utils.flattenObject({ flags: this.parent.flags.rollData }));
      }
      if (this.parent.parent?.type) { rollData[`parent.${this.parent.parent.type}`] = 1; }
      const actor = this.actor;
      if (actor) { Object.assign(rollData, actor.system.getScalingRollData()); }
      return Object.assign(super.getLocalRollData(), rollData);
    }

    /** @returns {Promise<Partial<Teriock.Panels.PanelParts>>} */
    async getPanelParts() {
      const parts = Object.assign(await super.getPanelParts(), {
        color: this.color,
        icon: TERIOCK.config.document[this.parent.type]?.icon || TERIOCK.config.document.document.icon,
        label: TERIOCK.config.document[this.parent.type]?.label || TERIOCK.config.document.document.label,
      });
      parts.associations ??= [];
      const typeMap = {};
      const children = this.parent.documentName === "Actor"
        ? (await this.parent.children.getContents())
        : await this.parent.previewed.getContents();
      for (const c of children) { (typeMap[c.type] ??= []).push(c); }
      for (const type of this.metadata.visibleTypes) {
        if (typeMap[type]) {
          let docs = typeMap[type];
          if (TERIOCK.config.document[type].documentName === "ActiveEffect") {
            docs = docs.filter(e => !foundry.utils.hasProperty(e, "system.revealed") || e.system.revealed);
          }
          docs = docs.sort(TERIOCK.config.document[type]?.sorter ?? pathSorterFactory("name"));
          parts.associations.push(
            Panel.toAssociation(docs, TERIOCK.config.document[type].plural, TERIOCK.config.document[type].icon),
          );
        }
      }
      return parts;
    }

    /** @inheritDoc */
    getRollData() {
      const actor = this.parent.actor;
      const rollData = actor && actor !== this.parent ? actor.getRollData() : {};
      return Object.assign(rollData, this.getSystemRollData());
    }

    /**
     * The {@link getLocalRollData} of this document's nearest effect and item under `this.effect` and `this.item`.
     * This gets merged into {@link getRollData} so that a document's formulas can reference itself and its host.
     * @returns {object}
     */
    getSystemRollData() {
      const effect = this.parent.getNearestDocument("ActiveEffect");
      const item = this.parent.getNearestDocument("Item");
      return {
        ...(item ? prefixObject(item.system.getLocalRollData(), "this.item") : {}),
        ...(effect ? prefixObject(effect.system.getLocalRollData(), "this.effect") : {}),
      };
    }
  }

  return CommonSystem;
}
