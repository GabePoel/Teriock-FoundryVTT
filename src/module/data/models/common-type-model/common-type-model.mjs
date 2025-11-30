import { TeriockJournalEntry } from "../../../documents/_module.mjs";
import { copyItem, getAbility, getProperty } from "../../../helpers/fetch.mjs";

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
   * Delete this document from its parent.
   * @returns {Promise<void>}
   */
  async deleteThis() {
    await this.parent.delete();
  }

  /**
   * Get an object that represents the non-embedded data for the reference of this document.
   * @returns {Promise<object>}
   */
  async getIndexObject() {
    const reference = await this.getIndexReference();
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
        "system.qualifiers.ephemeral",
        "system.qualifiers.suppressed",
        "tint",
        "transfer",
        "type",
      ];
      const object = reference.toObject();
      for (const property of preservedProperties) {
        foundry.utils.deleteProperty(object, property);
      }
      for (const property of this.parent.metadata.preservedProperties || []) {
        foundry.utils.deleteProperty(object, property);
      }
      return object;
    }
    return {};
  }

  /**
   * Get a copy of the index reference that this document is based off of if it exists.
   * @returns {Promise<TeriockCommon|null>}
   */
  async getIndexReference() {
    if (
      this.metadata.indexCompendiumKey &&
      this.parent.documentName === "Item"
    ) {
      return await copyItem(this.parent.name, this.metadata.indexCompendiumKey);
    }
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
    const reference = await this.getIndexReference();
    if (reference) {
      const indexAbilityNames = reference.abilities.map((a) => a.name);
      const toDeleteAbilities = this.parent.abilities
        .filter((a) => !indexAbilityNames.includes(a.name))
        .map((a) => a.id);
      const indexPropertyNames = reference.properties.map((p) => p.name);
      const toDeleteProperties = this.parent.properties
        .filter((p) => !indexPropertyNames.includes(p.name))
        .map((p) => p.id);
      const toDelete = [...toDeleteAbilities, ...toDeleteProperties];
      let effectParent = this.parent;
      if (this.parent.documentName === "ActiveEffect") {
        effectParent = this.parent.parent;
      }
      if (toDelete.length > 0) {
        await effectParent.deleteEmbeddedDocuments("ActiveEffect", toDelete);
      }
    }
    await this.refreshFromIndex();
  }

  /**
   * Apply transformations of derivations to the values of the source data object. Compute data fields whose values are
   * not stored in the database. This happens after the actor has completed all operations.
   */
  prepareSpecialData() {}

  /**
   * Refresh this document from the index.
   * @returns {Promise<void>}
   */
  async refreshFromIndex() {
    const indexObject = await this.getIndexObject();
    if (Object.keys(indexObject).length > 0) {
      delete indexObject.flags;
      delete indexObject.system._ref;
      delete indexObject.system._sup;
      delete indexObject.system.hierarchy;
      await this.parent.update(indexObject);
    }
    const reference = await this.getIndexReference();
    if (reference) {
      const indexAbilityNames = reference.abilities.map((a) => a.name);
      const indexPropertyNames = reference.properties.map((p) => p.name);
      const abilitiesToCreate = await Promise.all(
        indexAbilityNames
          .filter((n) => !this.parent.abilities.map((a) => a.name).includes(n))
          .map((n) => getAbility(n)),
      );
      const propertiesToCreate = await Promise.all(
        indexPropertyNames
          .filter((n) => !this.parent.properties.map((p) => p.name).includes(n))
          .map((n) => getProperty(n)),
      );
      const toCreate = [...abilitiesToCreate, ...propertiesToCreate];
      await this.parent.createChildDocuments("ActiveEffect", toCreate);
    }
    const referenceAbilities = reference ? await reference.getAbilities() : [];
    const abilities = await this.parent.getAbilities();
    for (const a of abilities) {
      await a.system.hardRefreshFromIndex();
      if (reference) {
        const referenceAbility = referenceAbilities.find(
          (r) => r.name === a.name,
        );
        if (referenceAbility) {
          const referenceObject = referenceAbility.toObject();
          const abilityUpdates = {};
          for (const p of [
            "system.adept",
            "system.consumable",
            "system.fluent",
            "system.gifted",
            "system.grantOnly",
            "system.improvement",
            "system.limitation",
            "system.maxQuantity",
            "system.proficient",
            "system.quantity",
          ]) {
            abilityUpdates[p] = foundry.utils.getProperty(referenceObject, p);
          }
          if (Object.keys(abilityUpdates).length > 0) {
            await a.update(abilityUpdates);
          }
        }
      }
    }
    for (const p of await this.parent.getProperties()) {
      await p.system.hardRefreshFromIndex();
    }
    if (this.parent.documentName === "Actor") {
      for (const item of this.parent.items.values()) {
        await item.system.refreshFromIndex();
      }
    }
  }
}
