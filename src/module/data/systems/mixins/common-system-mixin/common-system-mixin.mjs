import { mixClasses } from "../../../../helpers/construction.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { quickAddAssociation } from "../../../../helpers/panel.mjs";
import { prefixObject } from "../../../../helpers/utils.mjs";
import * as dataMixins from "../../../mixins/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";

/**
 * @param {typeof TypeDataModel} Base
 */
export default function CommonSystemMixin(Base) {
  return (
    /**
     * @extends {Teriock.Models.CommonSystemData}
     * @mixes RulesSystem
     * @mixes PropagationData
     * @mixes AccessData
     * @mixes AutomatedData
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
        dataMixins.AutomatedDataMixin,
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
          childEffectTypes: [],
          childItemTypes: [],
          consumable: false,
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
       * @param {Teriock.EmbedData.EmbedIcon} icon
       */
      #checkEmbedIcon(icon) {
        if (typeof icon.visible === "function") return icon.visible();
        if (typeof icon.visible === "boolean") return icon.visible;
        return true;
      }

      /** @returns {Record<string, Teriock.EmbedData.EmbedAction>} */
      get _embedActions() {
        return {};
      }

      /** @returns {Teriock.EmbedData.EmbedIcon[]} */
      get _embedIcons() {
        return [];
      }

      /** @returns {string} */
      get _masterText() {
        return this.parent.master?.fullName || this.parent.master?.name || "";
      }

      /** @returns {AnyCommonDocument} */
      get document() {
        return this.parent;
      }

      /** @returns {Partial<Teriock.EmbedData.EmbedParts>} */
      get embedParts() {
        return {
          color: this.color,
          draggable: this.document.isViewer,
          icons: this._embedIcons.filter(i => this.#checkEmbedIcon(i)),
          id: /** @type {ID<AnyCommonDocument>} */ this.parent.id,
          img: this.parent.img,
          inactive: !this.parent.active,
          makeTooltip: false,
          openable: true,
          parentId: /** @type {ID<AnyCommonDocument>} */ this.parent.parent?.id,
          struck: this.parent.disabled,
          subtitle: TERIOCK.config.document[this.parent.type]?.label,
          text: this._masterText,
          title: this.parent.fullName,
          uuid: this.parent.uuid,
        };
      }

      /**
       * A single icon which denotes something about this document.
       * @returns {Teriock.EmbedData.EmbedIcon|null}
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
      getCardContextMenuEntries(_doc) {
        return [];
      }

      /** @inheritDoc */
      getLocalRollData() {
        const rollData = {
          [`identifier.${this.identifier}`]: 1,
          [`type.${this.parent.type}`]: 1,
          identifier: this.identifier,
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
          color: this.color || undefined,
          icon: TERIOCK.config.document[this.parent.type]?.icon || TERIOCK.config.document.document.icon,
          image: this.parent.img,
          label: TERIOCK.config.document[this.parent.type]?.label || TERIOCK.config.document.document.label,
          name: this.parent.fullName,
          uuid: this.parent.uuid,
        });
        const typeMap = (await this.parent.getChildren()).documentsByType;
        for (const type of this.metadata.visibleTypes) {
          if (typeMap[type]) {
            let docs = typeMap[type];
            if (TERIOCK.config.document[type].documentName === "ActiveEffect") {
              docs = docs.filter(e => !foundry.utils.hasProperty(e, "system.revealed") || e.system.revealed);
            }
            docs = TERIOCK.config.document[type].sorter(docs);
            quickAddAssociation(
              docs,
              TERIOCK.config.document[type].plural,
              TERIOCK.config.document[type].icon,
              parts.associations,
            );
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
       * All the roll data that is specific to this document from {@link getLocalRollData} but prefixed by its type.
       * This gets merged into {@link getRollData} so that all of an Actor's roll data is always available.
       * @returns {object}
       */
      getSystemRollData() {
        return { ...prefixObject(this.getLocalRollData(), this.parent.type) };
      }

    }
  );
}
