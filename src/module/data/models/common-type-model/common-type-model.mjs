import { TeriockJournalEntry } from "../../../documents/_module.mjs";
import { copyItem, getAbility, getProperty } from "../../../helpers/fetch.mjs";
import { systemPath } from "../../../helpers/path.mjs";

const { TypeDataModel } = foundry.abstract;
const { fields } = foundry.data;

/**
 * @extends {DataModel}
 */
export default class CommonTypeModel extends TypeDataModel {
  /**
   * Metadata.
   * @returns {Teriock.Documents.ModelMetadata}
   */
  static get metadata() {
    return {
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
      wiki: false,
      armament: false,
    };
  }

  /** @inheritDoc */
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
   * The color that this should be displayed with.
   * @returns {string|null}
   */
  get color() {
    return null;
  }

  /**
   * Actions that can fire from an embedded element representing this.
   * @returns {Record<string, function>}
   */
  get embedActions() {
    const actions = {
      openDoc: async () => this.parent.sheet.render(true),
    };
    for (const embedIcon of this.embedIcons) {
      if (embedIcon.action && embedIcon.callback) {
        actions[embedIcon.action] = embedIcon.callback;
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
   * Parts that will be passed into a handlebars helper to asynchronously make an embedded element.
   * @returns {Teriock.EmbedData.EmbedParts}
   */
  get embedParts() {
    return {
      title: this.parent.nameString,
      img: this.parent.img,
      text: this.parent.source?.nameString,
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
        "hierarchy",
        "items",
        "origin",
        "sort",
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
    if (this.parent.actor) {
      rollData = this.parent.actor.getRollData();
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
      //noinspection JSUnresolvedReference
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
          await notesJournal.sheet.render(true);
          notesJournal.sheet.goToPage(notesPage.id);
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
      const indexAbilityNames = reference.getAbilities().map((a) => a.name);
      const toDeleteAbilities = this.parent
        .getAbilities()
        .filter((a) => !indexAbilityNames.includes(a.name))
        .map((a) => a.id);
      const indexPropertyNames = reference.getProperties().map((p) => p.name);
      const toDeleteProperties = this.parent
        .getProperties()
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
   * not stored to the database. This happens after the actor has completed all operations.
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
      delete indexObject.system.hierarchy;
      await this.parent.update(indexObject);
    }
    const reference = await this.getIndexReference();
    if (reference) {
      const indexAbilityNames = reference.getAbilities().map((a) => a.name);
      const indexPropertyNames = reference.getProperties().map((p) => p.name);
      let effectParent = this.parent;
      if (this.parent.documentName === "ActiveEffect") {
        effectParent = this.parent.parent;
      }
      const abilitiesToCreate = await Promise.all(
        indexAbilityNames
          .filter(
            (n) =>
              !this.parent
                .getAbilities()
                .map((a) => a.name)
                .includes(n),
          )
          .map((n) => getAbility(n)),
      );
      const propertiesToCreate = await Promise.all(
        indexPropertyNames
          .filter(
            (n) =>
              !this.parent
                .getProperties()
                .map((p) => p.name)
                .includes(n),
          )
          .map((n) => getProperty(n)),
      );
      const toCreate = [...abilitiesToCreate, ...propertiesToCreate];
      const createdEffects = await effectParent.createEmbeddedDocuments(
        "ActiveEffect",
        toCreate,
      );
      if (this.parent.documentName === "ActiveEffect") {
        await this.parent.addSubs(createdEffects);
      }
    }
    for (const a of this.parent.getAbilities()) {
      await a.system.hardRefreshFromIndex();
    }
    for (const p of this.parent.getProperties()) {
      await p.system.hardRefreshFromIndex();
    }
    if (this.parent.documentName === "Actor") {
      for (const item of this.parent.items.values()) {
        await item.system.refreshFromIndex();
      }
    }
  }

  /** @inheritDoc */
  async toEmbed(config, options = {}) {
    const embedContext = this.embedParts;
    if (options.relativeTo) {
      embedContext.relative = options.relativeTo.uuid;
    }
    const html = await foundry.applications.handlebars.renderTemplate(
      systemPath("templates/embed-templates/embed-card.hbs"),
      embedContext,
    );
    config.caption = false;
    config.cite = false;
    return foundry.utils.parseHTML(html);
  }
}
