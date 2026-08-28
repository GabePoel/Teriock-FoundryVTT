import * as systemMixins from "../_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { pathSorterFactory } from "../../../../helpers/sort.mjs";
import { prefixObject } from "../../../../helpers/utils.mjs";
import * as dataMixins from "../../../mixins/_module.mjs";
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
   * @mixes AccessData
   * @mixes RefreshSystem
   * @mixin
   */
  // dprint-ignore
  class CommonSystem
    extends mixClasses(
      Base,
      systemMixins.RulesSystemMixin,
      dataMixins.PropagationDataMixin,
      dataMixins.AccessDataMixin,
      systemMixins.RefreshSystemMixin,
    )
  {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Common"];

    /** @inheritDoc */
    static PRESERVED_PROPERTIES = ["system.identifier", ...super.PRESERVED_PROPERTIES];

    /** @returns {Teriock.Documents.ModelMetadata} */
    static get metadata() {
      return {
        armament: false,
        childTypes: [],
        consumable: false,
        disabledPath: null,
        hierarchy: false,
        passive: false,
        preservedProperties: this.PRESERVED_PROPERTIES,
        pseudos: {},
        revealable: false,
        stats: false,
        tooltip: true,
        type: "base",
        usable: false,
        visibleTypes: [],
        wiki: false,
      };
    }

    /**
     * Check if an embed icon is visible.
     * @param {Teriock.Embeds.EmbedIcon} icon
     */
    #checkEmbedIcon(icon) {
      if (typeof icon.visible === "function") return icon.visible();
      if (typeof icon.visible === "boolean") return icon.visible;
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

    /** @returns {string} */
    get _masterText() {
      return this.parent.master?.fullName || this.parent.master?.name || "";
    }

    /** @returns {TeriockActiveEffect|TeriockActor|TeriockItem} */
    get document() {
      return this.parent;
    }

    /** @returns {Partial<Teriock.Embeds.EmbedParts>} */
    get embedParts() {
      return {
        color: this.color,
        draggable: this.document.isViewer,
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
        icon: makeIcon(TERIOCK.display.icons.ui.panel),
        label: _loc("TERIOCK.SHEETS.Panel.OPEN"),
        onClick: async () => await this.document.openPanelSheet(),
        visible: () => game.settings.get("teriock", "openPanelContextMenuEntry") && this.document.isViewer,
      }
    }

    /** @inheritDoc */
    async _propagateOperation(methodName, isAsync = false, args = []) {
      for (const collection of Object.values(this.pseudoCollections)) {
        for (const pseudo of collection.contents) {
          if (typeof pseudo[methodName] === "function") {
            if (isAsync) { await pseudo[methodName](...args); }
            else { pseudo[methodName](...args); }
          }
        }
      }
      await super._propagateOperation(methodName, isAsync, args);
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
        identifier: this.parent.forcedIdentifier,
        name: this.parent.name,
        [this.parent.type]: 1,
        type: this.parent.type,
      };
      if (Object.keys(this.parent.flags.rollData ?? {}).length) {
        Object.assign(rollData, foundry.utils.flattenObject({ flags: this.parent.flags.rollData }));
      }
      if (this.parent.parent?.type) rollData[`parent.${this.parent.parent.type}`] = 1;
      const actor = this.actor;
      if (actor) Object.assign(rollData, actor.system.getScalingRollData());
      return rollData;
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
          parts.associations.push(Panel.toAssociation(docs, TERIOCK.config.document[type].plural, TERIOCK.config.document[type].icon))
        }
      }
      return parts;
    }

    /** @inheritDoc */
    getRollData() {
      let rollData = {};
      if (typeof this.parent.parent?.getRollData === "function") {
        rollData = this.parent.parent.getRollData();
      }
      Object.assign(rollData, this.getSystemRollData());
      return rollData;
    }

    /**
     * All the roll data that is specific to this document from {@link getLocalRollData} but prefixed by its
     * type. If this document is an armament (equipment or a body part), the same data is also aliased under
     * `armament`, so it can be referenced without caring whether it's equipment or a body part.
     * This gets merged into {@link getRollData} so that all of an Actor's roll data is always available.
     * @returns {object}
     */
    getSystemRollData() {
      const localData = this.getLocalRollData();
      const rollData = { ...prefixObject(localData, this.parent.type) };
      if (this.metadata.armament) { Object.assign(rollData, prefixObject(localData, "armament")); }
      return rollData;
    }

  }

  return CommonSystem;
}
