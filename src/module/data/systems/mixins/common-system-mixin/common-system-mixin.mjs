import { TeriockJournalEntry } from "../../../../documents/_module.mjs";
import { mix } from "../../../../helpers/construction.mjs";
import { quickAddAssociation } from "../../../../helpers/panel.mjs";
import { fancifyFields } from "../../../../helpers/utils.mjs";
import {
  AccessDataMixin,
  PropagationDataMixin,
} from "../../../shared/mixins/_module.mjs";
import {
  AutomatableSystemMixin,
  RulesSystemMixin,
} from "../../mixins/_module.mjs";

const { fields } = foundry.data;

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
     * @mixin
     */
    class CommonSystem extends mix(
      Base,
      RulesSystemMixin,
      PropagationDataMixin,
      AccessDataMixin,
      AutomatableSystemMixin,
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
          pseudos: {
            Automation: "system.automations",
          },
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
        return this.parent.master?.fullName || "";
      }

      /** @returns {BaseAutomation[]} */
      get activeAutomations() {
        const automations =
          /** @type {BaseAutomation[]} */ this.automations.contents;
        return automations.filter((a) => a.active);
      }

      /** @returns {string|null} */
      get color() {
        return null;
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
          title: this.parent.fullName,
          img: this.parent.img,
          text: this._masterText,
          color: this.color,
          openable: true,
          draggable: true,
          inactive: !this.parent.active,
          struck: this.parent.disabled,
          makeTooltip: false,
          uuid: this.parent.uuid,
          id: this.parent.id,
          parentId: this.parent.parent?.id,
          icons: this.embedIcons,
        };
      }

      /** @returns {Teriock.MessageData.MessageBar[]} */
      get messageBars() {
        return [];
      }

      /** @returns {Teriock.MessageData.MessageBlock[]} */
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

      /** @returns {Teriock.Documents.ModelMetadata} */
      get metadata() {
        return this.constructor.metadata;
      }

      /** @returns {Partial<Teriock.MessageData.MessagePanel>} */
      get panelParts() {
        /** @type {Partial<Teriock.MessageData.MessagePanel>} */
        const parts = {
          associations:
            /** @type {Teriock.MessageData.MessageAssociation[]} */ [],
          bars: this.messageBars,
          blocks: this.messageBlocks,
          color: this.color || undefined,
          font: this.font,
          image: this.parent.img,
          name: this.parent.fullName,
          uuid: this.parent.uuid,
          icon: TERIOCK.options.document[this.metadata.type].icon,
          label: TERIOCK.options.document[this.metadata.type].name,
        };
        const typeMap = this.parent.children.typeMap;
        for (const type of this.metadata.visibleTypes) {
          if (typeMap[type]) {
            let docs = typeMap[type];
            if (TERIOCK.options.document[type].doc === "ActiveEffect") {
              docs = docs.filter(
                (e) =>
                  !foundry.utils.hasProperty(e, "system.revealed") ||
                  e.system.revealed,
              );
            }
            docs = TERIOCK.options.document[type].sorter(docs);
            docs = docs.filter((d) => !d.isEphemeral);
            quickAddAssociation(
              docs,
              TERIOCK.options.document[type].plural,
              TERIOCK.options.document[type].icon,
              parts.associations,
            );
          }
        }
        return parts;
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
            if (mapType === "diffSrc") {
              names = srcDiffNames;
            } else if (mapType === "diffDst") {
              names = dstDiffNames;
            } else if (mapType === "diff") {
              names = diffNames;
            }
          }
          const srcDocs = srcChildren.filter((s) => names.includes(s.name));
          const dstDocs = dstChildren.filter((d) => names.includes(d.name));
          const docNames = new Set([
            ...srcDocs.map((s) => s.documentName),
            ...dstDocs.map((d) => d.documentName),
          ]);
          for (const docName of docNames) {
            childMap[docName] = {
              src: srcDocs.filter((s) => s.documentName === docName),
              dst: dstDocs.filter((d) => d.documentName === docName),
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
            children.src.map((s) => s.toObject()),
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
              const obj = await d.system.getCompendiumSourceRefreshObject();
              obj._id = d.id;
              return obj;
            }),
          );
          await this.parent.updateChildDocuments(docName, updateArray);
        }
      }

      /** @returns {Promise<void>} */
      async deleteThis() {
        await this.parent.delete();
      }

      /**
       * @param {TeriockDocument} _doc
       * @returns {ContextMenuEntry[]}
       */
      getCardContextMenuEntries(_doc) {
        return [];
      }

      /** @returns {Promise<CommonDocument|void>} */
      async getCompendiumSource() {
        const reference = await fromUuid(this.parent._stats.compendiumSource);
        if (!reference) return;
        if (
          reference.type === "wrapper" &&
          this.parent.documentName === "ActiveEffect"
        ) {
          return reference.system.effect;
        }
        return reference;
      }

      /** @returns {Promise<object>} */
      async getCompendiumSourceRefreshObject() {
        const reference = await this.getCompendiumSource();
        if (reference) {
          const object = reference.toObject();
          for (const property of this.metadata.preservedProperties || []) {
            foundry.utils.deleteProperty(object, property);
          }
          return object;
        }
        return {};
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          name: this.parent.name,
          identifier: this.identifier,
          [`identifier.${this.identifier}`]: 1,
          type: this.parent.type,
          [`type.${this.parent.type}`]: 1,
        };
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
          [this.parent.documentName]: localRollData,
          [this.parent.type]: localRollData,
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
              TERIOCK.options.document[this.parent.type]?.name ||
              _loc("TERIOCK.SYSTEMS.Common.FIELDS.gmNotes.otherCategory");
            notesPage = notesJournal.pages.find(
              (p) =>
                p.name === this.parent.name &&
                notesJournal.categories.get(p.category)?.name ===
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
                    name: this.parent.name,
                    type: "text",
                    category: notesCategory.id,
                    text: { content: `<p>@Embed[${this.parent.uuid}]</p>` },
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
       * @param {object} [options]
       * @param {boolean} [options.deleteChildren]
       * @param {boolean} [options.createChildren]
       * @param {boolean} [options.updateChildren]
       * @param {boolean} [options.updateDocument]
       * @param {boolean} [options.recursive]
       * @returns {Promise<void>}
       */
      async refreshFromCompendiumSource(options = {}) {
        const {
          deleteChildren = true,
          createChildren = true,
          updateChildren = true,
          updateDocument = true,
          recursive = true,
        } = options;
        if (this.parent._stats.compendiumSource) {
          if (updateDocument) {
            const updateObject = {};
            const automations =
              /** @type {BaseAutomation[]} */ this.automations?.contents;
            if (automations) {
              for (const automation of automations) {
                updateObject[`${automation.fieldPath}.${automation.id}`] = _del;
              }
              await this.parent.update(updateObject);
            }
            const indexObject = await this.getCompendiumSourceRefreshObject();
            delete indexObject.flags;
            delete indexObject.system?._ref;
            delete indexObject.system?._sup;
            await this.parent.update(indexObject);
          }
          const reference = await this.getCompendiumSource();
          if (reference) {
            const srcChildren = await reference.getChildren();
            const srcChildTypeMap = srcChildren.typeMap;
            const dstChildren = await this.parent.getChildren();
            const dstChildTypeMap = dstChildren.typeMap;
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
            await child.system.refreshFromCompendiumSource({
              deleteChildren,
              createChildren,
              updateChildren,
              updateDocument,
              recursive,
            });
          }
        }
      }
    }
  );
}
