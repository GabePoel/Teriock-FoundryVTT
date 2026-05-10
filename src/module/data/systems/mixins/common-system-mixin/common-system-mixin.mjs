import { TeriockJournalEntry } from "../../../../documents/_module.mjs";
import { mix } from "../../../../helpers/construction.mjs";
import { quickAddAssociation } from "../../../../helpers/panel.mjs";
import {
  fancifyFields,
  fromIdentifier,
  prefixObject,
} from "../../../../helpers/utils.mjs";
import {
  AccessDataMixin,
  AutomatedDataMixin,
  PropagationDataMixin,
} from "../../../shared/mixins/_module.mjs";
import {
  AutomatableSystemMixin,
  RulesSystemMixin,
} from "../../mixins/_module.mjs";

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
    class CommonSystem extends mix(
      Base,
      RulesSystemMixin,
      PropagationDataMixin,
      AccessDataMixin,
      AutomatableSystemMixin,
      AutomatedDataMixin,
    ) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.Common",
      ];

      /** @type {string[]} */
      static PRESERVED_PROPERTIES = [
        "_id",
        "_stats",
        "flags",
        "folder",
        "origin",
        "ownership",
        "sort",
        "type",
      ];

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

      /** @returns {typeof EmbeddedDataModel|null} */
      get SettingsFlagsDataModel() {
        return null;
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

      /** @returns {Teriock.Sheet.DisplayField[]} */
      get displayFields() {
        return ["system.description"];
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
          icons: this.embedIcons.filter((i) => this.#checkEmbedIcon(i)),
          id: this.parent.id,
          img: this.parent.img,
          inactive: !this.parent.active,
          makeTooltip: false,
          openable: true,
          parentId: this.parent.parent?.id,
          struck: this.parent.disabled,
          subtitle: TERIOCK.config.document[this.parent.type].label,
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
          .map((f) => {
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
          .filter((f) => f);
      }

      /** @returns {Teriock.Documents.ModelMetadata} */
      get metadata() {
        return this.constructor.metadata;
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
       * Check if an embed icon is visible.
       * @param {Teriock.EmbedData.EmbedIcon} icon
       */
      #checkEmbedIcon(icon) {
        if (typeof icon.visible === "function") return icon.visible();
        if (typeof icon.visible === "boolean") return icon.visible;
        return true;
      }

      /**
       * @param {Record<Teriock.Documents.CommonType, CommonDocument[]>} srcTypeMap
       * @param {Record<Teriock.Documents.CommonType, CommonDocument[]>} dstTypeMap
       * @param {"diff" | "union" | "intersect" | "diffSrc" | "diffDst"} mapType
       * @returns {ChildDeltaMap}
       */
      #makeChildDeltaMap(srcTypeMap, dstTypeMap, mapType) {
        const childMap = {};
        for (const type of new Set([
          ...Object.keys(srcTypeMap),
          ...Object.keys(dstTypeMap),
        ])) {
          const srcChildren = srcTypeMap[type] || [];
          const dstChildren = dstTypeMap[type] || [];
          const srcNames = srcChildren.map((s) => s.name);
          const dstNames = dstChildren.map((d) => d.name);
          let names = [];
          if (mapType === "union") {
            names = Array.from(new Set([...srcNames, ...dstNames]));
          } else if (mapType === "intersect") {
            names = srcNames.filter((s) => dstNames.includes(s));
          } else {
            const srcDiffNames = srcNames.filter((s) => !dstNames.includes(s));
            const dstDiffNames = dstNames.filter((d) => !srcNames.includes(d));
            const diffNames = [...srcNames, ...dstNames];
            if (mapType === "diffSrc") names = srcDiffNames;
            else if (mapType === "diffDst") names = dstDiffNames;
            else if (mapType === "diff") names = diffNames;
          }
          const srcDocs = srcChildren.filter((s) => names.includes(s.name));
          const dstDocs = dstChildren.filter((d) => names.includes(d.name));
          const docNames = new Set([
            ...srcDocs.map((s) => s.documentName),
            ...dstDocs.map((d) => d.documentName),
          ]);
          for (const docName of docNames) {
            const existing = childMap[docName] || { src: [], dst: [] };
            childMap[docName] = {
              src: [
                ...existing.src,
                ...srcDocs.filter((s) => s.documentName === docName),
              ],
              dst: [
                ...existing.dst,
                ...dstDocs.filter((d) => d.documentName === docName),
              ],
            };
          }
        }
        return childMap;
      }

      /**
       * @param {ChildDeltaMap} createMap
       * @returns {Promise<void>}
       */
      async _createFromChildDeltaMap(createMap) {
        for (const [docName, children] of Object.entries(createMap)) {
          await this.parent.createChildDocuments(
            docName,
            children.src.map((s) => s.toObject(true)),
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
            children.dst.map((d) => d.id),
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
        return {
          document: await document,
          label: _loc(label),
        };
      }

      /** @inheritDoc */
      async _propagateOperation(methodName, isAsync = false, args = []) {
        for (const automation of this.automations.contents) {
          if (typeof automation[methodName] === "function") {
            if (isAsync) await automation[methodName](...args);
            else automation[methodName](...args);
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
            children.dst.map(async (d) => {
              const refreshDocument = await fromUuid(d._stats.compendiumSource);
              const obj = refreshDocument
                ? d.system.toRefreshObject(refreshDocument)
                : {};
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
          name: this.parent.name,
          identifier: this.identifier,
          [`identifier.${this.identifier}`]: 1,
          type: this.parent.type,
          [`type.${this.parent.type}`]: 1,
          [this.parent.type]: 1,
        };
        if (this.parent.parent?.type) {
          rollData[`parent.${this.parent.parent.type}`] = 1;
        }
        const actor = this.actor;
        if (actor) Object.assign(rollData, actor.system.getScalingRollData());
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
          icon:
            TERIOCK.config.document[this.metadata.type]?.icon ||
            TERIOCK.config.document.document.icon,
          image: this.parent.img,
          label:
            TERIOCK.config.document[this.metadata.type]?.label ||
            TERIOCK.config.document.document.label,
          name: this.parent.fullName,
          uuid: this.parent.uuid,
        };
        const typeMap = (await this.parent.getChildren()).documentsByType;
        for (const type of this.metadata.visibleTypes) {
          if (typeMap[type]) {
            let docs = typeMap[type];
            if (TERIOCK.config.document[type].documentName === "ActiveEffect") {
              docs = docs.filter(
                (e) =>
                  !foundry.utils.hasProperty(e, "system.revealed") ||
                  e.system.revealed,
              );
            }
            docs = TERIOCK.config.document[type].sorter(docs);
            docs = docs.filter((d) => !d.isEphemeral);
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
        return resolvedNodes.filter(
          (n) =>
            n.document &&
            n.document.isViewer &&
            n.document.uuid !== this.parent.uuid,
        );
      }

      /** @inheritDoc */
      getRollData() {
        let rollData = {};
        if (this.parent.parent?.getRollData) {
          rollData = this.parent.parent.getRollData();
        }
        Object.assign(rollData, this.getSystemRollData());
        return rollData;
      }

      /** @returns {object} */
      getSystemRollData() {
        const localRollData = this.getLocalRollData();
        return {
          ...prefixObject(localRollData, this.parent.type),
        };
      }

      /** @returns {Promise<void>} */
      async gmNotesOpen() {
        let notesPage;
        if (this.gmNotes) notesPage = await fromUuid(this.gmNotes);
        if (notesPage) {
          const notesJournal = notesPage.parent;
          await notesJournal?.sheet.render(true);
          notesJournal?.sheet.goToPage(notesPage.id);
        } else {
          const journalEntryName = game.settings.get(
            "teriock",
            "gmDocumentNotesJournalName",
          );
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
              (p) =>
                p.name === this.parent.name &&
                notesJournal?.categories.get(p.category)?.name ===
                  notesCategoryName,
            );
            if (!notesPage) {
              let notesCategory =
                notesJournal.categories.getName(notesCategoryName);
              if (!notesCategory) {
                const categories = await notesJournal.createEmbeddedDocuments(
                  "JournalEntryCategory",
                  [{ name: notesCategoryName }],
                );
                notesCategory = categories[0];
              }
              const pages = await notesJournal.createEmbeddedDocuments(
                "JournalEntryPage",
                [
                  {
                    category: notesCategory.id,
                    name: this.parent.name,
                    text: { content: `<p>@Embed[${this.parent.uuid}]</p>` },
                    type: "text",
                  },
                ],
              );
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
       * @param {object} [options]
       * @param {boolean} [options.deleteChildren]
       * @param {boolean} [options.createChildren]
       * @param {boolean} [options.updateChildren]
       * @param {boolean} [options.updateDocument]
       * @param {boolean} [options.recursive]
       * @returns {Promise<void>}
       */
      async refreshFromSource(document, options = {}) {
        const {
          deleteChildren = true,
          createChildren = true,
          updateChildren = true,
          updateDocument = true,
          recursive = true,
        } = options;
        if (document) {
          if (updateDocument) {
            if (this.automations?.contents.length) {
              await this.parent.update({ "system.automations": _replace({}) });
            }
            const indexObject = this.toRefreshObject(document);
            delete indexObject.flags;
            delete indexObject.system?._ref;
            delete indexObject.system?._sup;
            await this.parent.update(indexObject);
          }
          if (createChildren || deleteChildren || updateChildren) {
            const srcChildren = await document.getChildren();
            const srcChildTypeMap = srcChildren.documentsByType;
            const dstChildren = await this.parent.getChildren();
            const dstChildTypeMap = dstChildren.documentsByType;
            if (createChildren) {
              const createMap = this.#makeChildDeltaMap(
                srcChildTypeMap,
                dstChildTypeMap,
                "diffSrc",
              );
              await this._createFromChildDeltaMap(createMap);
            }
            if (deleteChildren) {
              const deleteMap = this.#makeChildDeltaMap(
                srcChildTypeMap,
                dstChildTypeMap,
                "diffDst",
              );
              await this._deleteFromChildDeltaMap(deleteMap);
            }
            if (updateChildren) {
              const updateMap = this.#makeChildDeltaMap(
                srcChildTypeMap,
                dstChildTypeMap,
                "intersect",
              );
              await this._updateFromChildDeltaMap(updateMap);
            }
          }
        }
        if (recursive) {
          for (const child of await this.parent.getChildArray()) {
            const childSource = await fromUuid(child._stats.compendiumSource);
            await child.system.refreshFromSource(childSource, {
              deleteChildren,
              createChildren,
              updateChildren,
              updateDocument,
              recursive,
            });
          }
        }
      }

      /**
       * Get a refresh object from a document with the same type as this one.
       * @param {AnyCommonDocument} document
       * @returns {object}
       */
      toRefreshObject(document) {
        const obj = document?.toObject(true) ?? {};
        for (const p of this.metadata.preservedProperties || []) {
          foundry.utils.deleteProperty(obj, p);
        }
        return obj;
      }
    }
  );
}
