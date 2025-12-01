import { TeriockJournalEntry } from "../../../documents/_module.mjs";

const { TypeDataModel } = foundry.abstract;
const { fields } = foundry.data;

export default class CommonTypeModel extends TypeDataModel {
  /**
   * Metadata.
   * @returns {Teriock.Documents.ModelMetadata}
   */
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
      preservedProperties: [],
      revealable: false,
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
    return {
      gmNotes: new fields.DocumentUUIDField({
        required: false,
        nullable: true,
        initial: null,
        gmOnly: true,
      }),
    };
  }

  /**
   * @returns {TeriockActor|null}
   */
  get actor() {
    return this.parent.actor;
  }

  /**
   * Context menu entries to display for cards that represent the parent document.
   * @returns {Teriock.Foundry.ContextMenuEntry[]}
   */
  get cardContextMenuEntries() {
    return [];
  }

  /**
   * The color that this should be displayed with.
   * @returns {string|null}
   */
  get color() {
    return null;
  }

  /**
   * Actions that can fire from an embedded element representing this.
   * @returns {Record<string, Teriock.EmbedData.EmbedAction>}
   */
  get embedActions() {
    const actions = {
      openDoc: { primary: async () => this.parent.sheet.render(true) },
    };
    for (const embedIcon of this.embedIcons) {
      if (embedIcon.action && embedIcon.callback) {
        actions[embedIcon.action] = { primary: embedIcon.callback };
      }
    }
    return actions;
  }

  /**
   * Interactive icons to display in embedded elements.
   * @returns {Teriock.EmbedData.EmbedIcon[]}
   */
  get embedIcons() {
    return [];
  }

  /**
   * Parts that will be passed into a handlebar helper to asynchronously make an embedded element.
   * @returns {Teriock.EmbedData.EmbedParts}
   */
  get embedParts() {
    return {
      title: this.parent.nameString,
      img: this.parent.img,
      text: this.parent.elder?.nameString,
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

  /**
   * Gets the message rules-parts for displaying the child document in chat.
   * Includes image, name, and font information from the parent document.
   * @returns {Teriock.MessageData.MessagePanel} Object containing message display components.
   */
  get messageParts() {
    return {
      associations: [],
      bars: this.messageBars,
      blocks: this.messageBlocks,
      color: this.color,
      font: this.font,
      image: this.parent.img,
      name: this.parent.nameString,
      uuid: this.parent.uuid,
      icon: TERIOCK.options.document[this.metadata.type].icon,
      label: TERIOCK.options.document[this.metadata.type].name,
    };
  }

  /**
   * Metadata.
   * @returns {Teriock.Documents.ModelMetadata}
   */
  get metadata() {
    return this.constructor.metadata;
  }

  /**
   * Type-specific changes to the name string.
   * @returns {string}
   */
  get nameString() {
    return this.parent.name;
  }

  /**
   * @inheritDoc
   * @returns {TeriockCommon}
   */
  get parent() {
    return /** @type {TeriockCommon} */ super.parent;
  }

  /**
   * Make a map of documents by `documentName` based on some operation between two maps of documents by their `type`.
   * @param {Record<Teriock.Documents.CommonType, TeriockCommon[]>} srcTypeMap
   * @param {Record<Teriock.Documents.CommonType, TeriockCommon[]>} dstTypeMap
   * @param {"diff" | "union" | "intersect" | "diffSrc" | "diffDst"} mapType
   * @returns {Record<TeriockCommonName, { src: TeriockCommon[], dst: TeriockCommon[] }>}
   */
  #makeChildMap(srcTypeMap, dstTypeMap, mapType) {
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
   * Delete this document from its parent.
   * @returns {Promise<void>}
   */
  async deleteThis() {
    await this.parent.delete();
  }

  /**
   * Get a copy of the index reference that this document is based off of if it exists.
   * @returns {Promise<TeriockCommon|void>}
   */
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

  /**
   * Get an object that represents the non-embedded data for the reference of this document.
   * @returns {Promise<object>}
   */
  async getIndexObject() {
    const reference = await this.getCompendiumSource();
    if (reference) {
      const preservedProperties = [
        "_id",
        "_stats",
        "changes",
        "disabled",
        "duration",
        "effects",
        "flags",
        "folder",
        "items",
        "origin",
        "sort",
        "system._ref",
        "system._sup",
        "system.qualifiers",
        "tint",
        "transfer",
        "type",
      ];
      const object = reference.toObject();
      for (const property of preservedProperties) {
        foundry.utils.deleteProperty(object, property);
      }
      for (const property of this.metadata.preservedProperties || []) {
        foundry.utils.deleteProperty(object, property);
      }
      return object;
    }
    return {};
  }

  /**
   * Fetch roll data.
   * @returns {object}
   */
  getRollData() {
    let rollData = {};
    if (this.parent.parent) {
      rollData = this.parent.parent.getRollData();
    }
    Object.assign(rollData, this.getSystemRollData());
    return rollData;
  }

  /**
   * Fetch roll data specific to this document.
   * @returns {object}
   */
  getSystemRollData() {
    const object = this.toObject();
    object.name = this.parent.name;
    return {
      [this.parent.documentName]: object,
      [this.parent.type]: object,
    };
  }

  /**
   * Open the GM notes or make them if they don't exist.
   * @returns {Promise<void>}
   */
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
          TERIOCK.options.document[this.parent.type]?.name || "Other";
        notesPage = notesJournal.pages.find(
          (p) =>
            p.name === this.parent.name &&
            notesJournal.categories.get(p.category)?.name === notesCategoryName,
        );
        if (!notesPage) {
          let notesCategory =
            notesJournal.categories.getName(notesCategoryName);
          if (!notesCategory) {
            const categories = await notesJournal.createEmbeddedDocuments(
              "JournalEntryCategory",
              [
                {
                  name: notesCategoryName,
                },
              ],
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
                text: {
                  content: `<p>@Embed[${this.parent.uuid}]</p>`,
                },
              },
            ],
          );
          notesPage = pages[0];
        }
        if (notesPage) {
          await notesJournal?.sheet.render(true);
          notesJournal?.sheet.goToPage(notesPage.id);
          if (!this.parent.inCompendium) {
            await this.parent.update({
              "system.gmNotes": notesPage.uuid,
            });
          }
        }
      }
    }
  }

  /**
   * Destructively refresh this document from the index.
   * @returns {Promise<void>}
   */
  async hardRefreshFromIndex() {
    await this.refreshFromIndex({ deleteChildren: true });
  }

  /**
   * Apply transformations of derivations to the values of the source data object. Compute data fields whose values are
   * not stored in the database. This happens after the actor has completed all operations.
   */
  prepareSpecialData() {}

  /**
   * Refresh this document from the index.
   * @param {object} [options]
   * @param {boolean} [options.deleteChildren] - Delete children that aren't in reference.
   * @param {boolean} [options.createChildren] - Create children that are missing from reference.
   * @param {boolean} [options.updateChildren] - Update children to match reference.
   * @param {boolean} [options.updateDocument] - Update this to match reference.
   * @param {boolean} [options.recursive] - Update recursively.
   * @returns {Promise<void>}
   */
  async refreshFromIndex(options = {}) {
    const {
      deleteChildren = false,
      createChildren = true,
      updateChildren = true,
      updateDocument = true,
      recursive = true,
    } = options;
    const indexObject = await this.getIndexObject();
    if (updateDocument && Object.keys(indexObject).length > 0) {
      delete indexObject.flags;
      delete indexObject.system._ref;
      delete indexObject.system._sup;
      await this.parent.update(indexObject);
    }
    const reference = await this.getCompendiumSource();
    if (reference) {
      const srcChildren = await reference.getChildren();
      const srcChildTypeMap = srcChildren.typeMap;
      const dstChildren = await this.parent.getChildren();
      const dstChildTypeMap = dstChildren.typeMap;
      if (createChildren) {
        const createMap = this.#makeChildMap(
          srcChildTypeMap,
          dstChildTypeMap,
          "diffSrc",
        );
        for (const [docName, children] of Object.entries(createMap)) {
          await this.parent.createChildDocuments(
            docName,
            children.src.map((s) => s.toObject()),
          );
        }
      }
      if (deleteChildren) {
        const deleteMap = this.#makeChildMap(
          srcChildTypeMap,
          dstChildTypeMap,
          "diffDst",
        );
        for (const [docName, children] of Object.entries(deleteMap)) {
          await this.parent.deleteChildDocuments(
            docName,
            children.dst.map((d) => d.id),
          );
        }
      }
      if (updateChildren) {
        const updateMap = this.#makeChildMap(
          srcChildTypeMap,
          dstChildTypeMap,
          "intersect",
        );
        for (const [docName, children] of Object.entries(updateMap)) {
          const updateArray = await Promise.all(
            children.dst.map(async (d) => {
              const obj = await d.system.getIndexObject();
              obj._id = d.id;
              return obj;
            }),
          );
          await this.parent.updateChildDocuments(docName, updateArray);
        }
      }
      if (recursive) {
        for (const child of await this.parent.getChildArray()) {
          await child.system.refreshFromIndex({
            deleteChildren,
            createChildren,
            updateChildren,
            updateDocument: false,
            recursive,
          });
        }
      }
    }
  }
}
