import { TeriockJournalEntry } from "../../../../documents/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { quickAddAssociation } from "../../../../helpers/panel.mjs";
import { fancifyFields, fromIdentifier, prefixObject } from "../../../../helpers/utils.mjs";
import { AccessDataMixin, AutomatedDataMixin, PropagationDataMixin } from "../../../shared/mixins/_module.mjs";
import { AutomatableSystemMixin, RulesSystemMixin } from "../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @typedef RefreshSourceNode
 * @property {AnyCommonDocument|null} document
 * @property {string} label
 */

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
     * @mixes AutomatableSystem
     * @mixes AutomatedData
     * @mixin
     */
    class CommonSystem extends mixClasses(
      Base,
      RulesSystemMixin,
      PropagationDataMixin,
      AccessDataMixin,
      AutomatableSystemMixin,
      AutomatedDataMixin,
    ) {
      /** @type {string[]} */
      static DEFAULT_PRESERVED_PROPERTIES = [
        "_id",
        "_stats",
        "flags",
        "folder",
        "origin",
        "ownership",
        "sort",
        "system._dep",
        "system._ref",
        "system._sup",
        "type",
      ];

      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Common"];

      /** @type {string[]} */
      static PRESERVED_PROPERTIES = [...this.DEFAULT_PRESERVED_PROPERTIES, "system.identifier"];

      /** @returns {Teriock.Documents.ModelMetadata} */
      static get metadata() {
        return {
          armament: false,
          childEffectTypes: [],
          childItemTypes: [],
          childMacroTypes: [],
          consumable: false,
          hierarchy: false,
          modifies: "Actor",
          namespace: "",
          pageNameKey: "name",
          passive: false,
          preservedProperties: this.PRESERVED_PROPERTIES,
          pseudos: { Automation: "system.automations" },
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
       * @inheritDoc
       * @returns {DataSchema}
       */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          gmNotes: new fields.DocumentUUIDField({
            initial: null,
            nullable: true,
            required: false,
            type: "JournalEntryPage",
          }),
        });
      }

      /**
       * Check if an embed icon is visible.
       * @param {Teriock.EmbedData.EmbedIcon} icon
       */
      #checkEmbedIcon(icon) {
        if (typeof icon.visible === "function") {
          return icon.visible();
        }
        if (typeof icon.visible === "boolean") {
          return icon.visible;
        }
        return true;
      }

      /**
       * @param {Record<Teriock.Documents.CommonType, AnyCommonDocument[]>} srcTypeMap
       * @param {Record<Teriock.Documents.CommonType, AnyCommonDocument[]>} dstTypeMap
       * @param {"diff" | "union" | "intersect" | "diffSrc" | "diffDst"} mapType
       * @returns {ChildDeltaMap}
       */
      #makeChildDeltaMap(srcTypeMap, dstTypeMap, mapType) {
        const childMap = {};
        for (const type of new Set([...Object.keys(srcTypeMap), ...Object.keys(dstTypeMap)])) {
          const srcChildren = srcTypeMap[type] || [];
          const dstChildren = dstTypeMap[type] || [];
          const srcKeys = srcChildren.map(s => s.lookupKey);
          const dstKeys = dstChildren.map(d => d.lookupKey);
          let keys = [];
          if (mapType === "union") {
            keys = Array.from(new Set([...srcKeys, ...dstKeys]));
          } else if (mapType === "intersect") {
            keys = srcKeys.filter(s => dstKeys.includes(s));
          } else {
            const srcDiffKeys = srcKeys.filter(s => !dstKeys.includes(s));
            const dstDiffKeys = dstKeys.filter(d => !srcKeys.includes(d));
            const diffKeys = [...srcKeys, ...dstKeys];
            if (mapType === "diffSrc") {
              keys = srcDiffKeys;
            } else if (mapType === "diffDst") {
              keys = dstDiffKeys;
            } else if (mapType === "diff") {
              keys = diffKeys;
            }
          }
          const srcDocs = srcChildren.filter(s => keys.includes(s.lookupKey));
          const dstDocs = dstChildren.filter(d => keys.includes(d.lookupKey));
          const docNames = new Set([...srcDocs.map(s => s.documentName), ...dstDocs.map(d => d.documentName)]);
          for (const docName of docNames) {
            const existing = childMap[docName] || { dst: [], src: [] };
            childMap[docName] = {
              dst: [...existing.dst, ...dstDocs.filter(d => d.documentName === docName)],
              src: [...existing.src, ...srcDocs.filter(s => s.documentName === docName)],
            };
          }
        }
        return childMap;
      }

      /** @returns {string} */
      get _masterText() {
        return this.parent.master?.fullName || this.parent.master?.name || "";
      }

      /**
       * An array of unresolved promises that resolve to documents this could refresh from.
       * @returns {Promise<RefreshSourceNode>[]}
       */
      get _refreshPromises() {
        const promises = [];
        if (this.parent._stats.compendiumSource) {
          promises.push(
            this._formatRefreshPromise(
              fromUuid(this.parent._stats.compendiumSource),
              "TERIOCK.SHEETS.DocumentSettings.FIELDS.compendiumSource.label",
            ),
          );
        }
        if (this.parent._stats.duplicateSource) {
          promises.push(
            this._formatRefreshPromise(
              fromUuid(this.parent._stats.duplicateSource),
              "TERIOCK.SHEETS.DocumentSettings.FIELDS.duplicateSource.label",
            ),
          );
        }
        if (this.parent.typedIdentifier) {
          promises.push(
            this._formatRefreshPromise(
              fromIdentifier(this.parent.typedIdentifier),
              "TERIOCK.SYSTEMS.Rules.FIELDS.identifier.label",
            ),
          );
        }
        return promises;
      }

      /** @returns {AnyCommonDocument} */
      get document() {
        return this.parent;
      }

      /** @returns {Record<string, Teriock.EmbedData.EmbedAction>} */
      get embedActions() {
        return {};
      }

      /** @returns {Teriock.EmbedData.EmbedIcon[]} */
      get embedIcons() {
        return [];
      }

      /** @returns {Partial<Teriock.EmbedData.EmbedParts>} */
      get embedParts() {
        return {
          color: this.color,
          draggable: true,
          icons: this.embedIcons.filter(i => this.#checkEmbedIcon(i)),
          id: this.parent.id,
          img: this.parent.img,
          inactive: !this.parent.active,
          makeTooltip: false,
          openable: true,
          parentId: this.parent.parent?.id,
          struck: this.parent.disabled,
          subtitle: TERIOCK.config.document[this.parent.type]?.label,
          text: this._masterText,
          title: this.parent.fullName,
          uuid: this.parent.uuid,
        };
      }

      /** @returns {Teriock.Messages.MessageBar[]} */
      get messageBars() {
        return [];
      }

      /** @returns {Teriock.Messages.MessageBlock[]} */
      get messageBlocks() {
        return fancifyFields(this.displayFields)
          .map(f => {
            const schema = this.parent.getSchema(f.path);
            const value = foundry.utils.getProperty(this.parent, f.path);
            if (value && !schema.gmOnly) {
              return {
                classes: f.classes,
                text: value,
                title: f.label || schema.label,
              };
            }
          })
          .filter(f => f);
      }

      /** @returns {Teriock.Documents.ModelMetadata} */
      get metadata() {
        return this.constructor.metadata;
      }

      /** @returns {typeof EmbeddedDataModel|null} */
      get SettingsFlagsDataModel() {
        return null;
      }

      /** @returns {Teriock.EmbedData.EmbedIcon|undefined} */
      get tagIcon() {
        return undefined;
      }

      /** @returns {Teriock.Documents.CommonType[]} */
      get visibleTypes() {
        return this.metadata.visibleTypes;
      }

      /**
       * @param {ChildDeltaMap} createMap
       * @returns {Promise<void>}
       */
      async _createFromChildDeltaMap(createMap) {
        for (const [docName, children] of Object.entries(createMap)) {
          await this.parent.createChildDocuments(
            docName,
            children.src.map(s => s.toObject(true)),
          );
        }
      }

      /**
       * @param {ChildDeltaMap} deleteMap
       * @returns {Promise<void>}
       */
      async _deleteFromChildDeltaMap(deleteMap) {
        for (const [docName, children] of Object.entries(deleteMap)) {
          await this.parent.deleteChildDocuments(
            docName,
            children.dst.map(d => d.id),
          );
        }
      }

      /**
       * Format a refresh promise properly.
       * @param {Promise<AnyCommonDocument|null>} document
       * @param {string} label
       * @returns {Promise<RefreshSourceNode>}
       */
      async _formatRefreshPromise(document, label) {
        return { document: await document, label: _loc(label) };
      }

      /** @inheritDoc */
      async _propagateOperation(methodName, isAsync = false, args = []) {
        for (const automation of this.automations.contents) {
          if (typeof automation[methodName] === "function") {
            if (isAsync) {
              await automation[methodName](...args);
            } else {
              automation[methodName](...args);
            }
          }
        }
        await super._propagateOperation(methodName, isAsync, args);
      }

      /**
       * @param {ChildDeltaMap} updateMap
       * @returns {Promise<void>}
       */
      async _updateFromChildDeltaMap(updateMap) {
        for (const [docName, children] of Object.entries(updateMap)) {
          const updateArray = await Promise.all(
            children.dst.map(async d => {
              const refreshDocument = await fromUuid(d._stats.compendiumSource);
              const obj = refreshDocument ? d.system.toRefreshObject(refreshDocument) : {};
              obj._id = d.id;
              return obj;
            }),
          );
          await this.parent.updateChildDocuments(docName, updateArray);
        }
      }

      /**
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
        if (this.parent.parent?.type) {
          rollData[`parent.${this.parent.parent.type}`] = 1;
        }
        const actor = this.actor;
        if (actor) {
          Object.assign(rollData, actor.system.getScalingRollData());
        }
        return rollData;
      }

      /** @returns {Promise<Partial<Teriock.Messages.MessagePanel>>} */
      async getPanelParts() {
        /** @type {Partial<Teriock.Messages.MessagePanel>} */
        const parts = {
          associations: /** @type {Teriock.Messages.MessageAssociation[]} */ [],
          bars: this.messageBars,
          blocks: this.messageBlocks,
          color: this.color || undefined,
          font: this.font,
          icon: TERIOCK.config.document[this.parent.type]?.icon || TERIOCK.config.document.document.icon,
          image: this.parent.img,
          label: TERIOCK.config.document[this.parent.type]?.label || TERIOCK.config.document.document.label,
          name: this.parent.fullName,
          uuid: this.parent.uuid,
        };
        const typeMap = (await this.parent.getChildren()).documentsByType;
        for (const type of this.metadata.visibleTypes) {
          if (typeMap[type]) {
            let docs = typeMap[type];
            if (TERIOCK.config.document[type].documentName === "ActiveEffect") {
              docs = docs.filter(e => !foundry.utils.hasProperty(e, "system.revealed") || e.system.revealed);
            }
            docs = TERIOCK.config.document[type].sorter(docs);
            docs = docs.filter(d => !d.isEphemeral);
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

      /**
       * Get an array of documents which can be used to refresh this from.
       * @returns {Promise<RefreshSourceNode[]>}
       */
      async getRefreshSources() {
        const resolvedNodes = await Promise.all(this._refreshPromises);
        return resolvedNodes.filter(n => n.document && n.document.isViewer && n.document.uuid !== this.parent.uuid);
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

      /** @returns {Promise<void>} */
      async gmNotesOpen() {
        let notesPage;
        if (this.gmNotes) {
          notesPage = await fromUuid(this.gmNotes);
        }
        if (notesPage) {
          const notesJournal = notesPage.parent;
          await notesJournal?.sheet.render(true);
          notesJournal?.sheet.goToPage(notesPage.id);
        } else {
          const journalEntryName = game.settings.get("teriock", "gmDocumentNotesJournalName");
          let notesJournal = game.journal.getName(journalEntryName);
          if (!notesJournal) {
            notesJournal = await TeriockJournalEntry.create({
              name: journalEntryName,
            });
          }
          if (notesJournal) {
            const notesCategoryName =
              TERIOCK.config.document[this.parent.type]?.label ||
              _loc("TERIOCK.SYSTEMS.Common.FIELDS.gmNotes.otherCategory");
            notesPage = notesJournal.pages.find(
              p => p.name === this.parent.name && notesJournal?.categories.get(p.category)?.name === notesCategoryName,
            );
            if (!notesPage) {
              let notesCategory = notesJournal.categories.getName(notesCategoryName);
              if (!notesCategory) {
                const categories = await notesJournal.createEmbeddedDocuments("JournalEntryCategory", [
                  { name: notesCategoryName },
                ]);
                notesCategory = categories[0];
              }
              const pages = await notesJournal.createEmbeddedDocuments("JournalEntryPage", [
                {
                  category: notesCategory.id,
                  name: this.parent.name,
                  text: { content: `<p>@Embed[${this.parent.uuid}]</p>` },
                  type: "text",
                },
              ]);
              notesPage = pages[0];
            }
            if (notesPage) {
              await notesJournal?.sheet.render(true);
              notesJournal?.sheet.goToPage(notesPage.id);
              if (!this.parent.inCompendium) {
                await this.parent.update({ "system.gmNotes": notesPage.uuid });
              }
            }
          }
        }
      }

      /**
       * @param {AnyCommonDocument} document
       * @param {Partial<Teriock.System.RefreshOptions>} [options]
       * @returns {Promise<void>}
       */
      async refreshFromSource(document, options = {}) {
        const {
          createChildren = true,
          deleteChildren = true,
          fullOverride = false,
          recursive = true,
          updateChildren = true,
          updateDocument = true,
        } = options;
        if (document) {
          if (updateDocument) {
            if (this.automations?.contents.length) {
              await this.parent.update({ "system.automations": _replace({}) });
            }
            const updateObject = this.toRefreshObject(document, options);
            if (fullOverride) {
              updateObject.effects = _replace(updateObject.effects);
              updateObject.items = _replace(updateObject.items);
            }
            delete updateObject.flags;
            await this.parent.update(updateObject);
          }
          if (createChildren || deleteChildren || updateChildren) {
            const srcChildren = await document.getChildren();
            if (fullOverride) {
              for (const id of srcChildren.keys()) {
                if (srcChildren.get(id)?.sup?.uuid !== document.uuid) {
                  srcChildren.delete(id);
                }
              }
            }
            const srcChildTypeMap = srcChildren.documentsByType;
            const dstChildren = await this.parent.getChildren();
            if (fullOverride) {
              for (const id of dstChildren.keys()) {
                if (dstChildren.get(id)?.sup?.uuid !== this.parent.uuid) {
                  dstChildren.delete(id);
                }
              }
            }
            const dstChildTypeMap = dstChildren.documentsByType;
            if (createChildren) {
              const createMap = this.#makeChildDeltaMap(srcChildTypeMap, dstChildTypeMap, "diffSrc");
              await this._createFromChildDeltaMap(createMap);
            }
            if (deleteChildren) {
              const deleteMap = this.#makeChildDeltaMap(srcChildTypeMap, dstChildTypeMap, "diffDst");
              await this._deleteFromChildDeltaMap(deleteMap);
            }
            if (updateChildren) {
              const updateMap = this.#makeChildDeltaMap(srcChildTypeMap, dstChildTypeMap, "intersect");
              await this._updateFromChildDeltaMap(updateMap);
            }
          }
        }
        if (recursive) {
          for (const child of fullOverride ? await this.parent.getSubs() : await this.parent.getChildArray()) {
            const childSource = await fromUuid(child._stats.compendiumSource);
            await child.system.refreshFromSource(childSource, {
              createChildren,
              deleteChildren,
              recursive,
              updateChildren,
              updateDocument,
            });
          }
        }
      }

      /**
       * Get a refresh object from a document with the same type as this one.
       * @param {AnyCommonDocument} document
       * @param {Partial<Teriock.System.RefreshOptions>} [options]
       * @returns {object}
       */
      toRefreshObject(document, options = {}) {
        const obj = document?.toObject(true) ?? {};
        const preservedProperties = options.fullOverride
          ? this.constructor.DEFAULT_PRESERVED_PROPERTIES
          : this.metadata.preservedProperties;
        for (const p of preservedProperties || []) {
          foundry.utils.deleteProperty(obj, p);
        }
        return obj;
      }
    }
  );
}
