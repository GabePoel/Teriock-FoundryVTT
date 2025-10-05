import { copyItem, getAbility, getProperty } from "../../../helpers/fetch.mjs";
import { freeze } from "../../../helpers/utils.mjs";

const { TypeDataModel } = foundry.abstract;

export default class CommonTypeModel extends TypeDataModel {
  /**
   * Metadata.
   * @type {Readonly<Teriock.Documents.ModelMetadata>}
   */
  static metadata = freeze({
    type: "base",
    childEffectTypes: [],
    childItemTypes: [],
    childMacroTypes: [],
    preservedProperties: [],
  });

  /**
   * @returns {TeriockActor|null}
   */
  get actor() {
    return this.parent.actor;
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
        "folder",
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
   * Get a copy of the index reference that this document is based off of, if it exists.
   * @returns {Promise<TeriockCommon|null>}
   */
  async getIndexReference() {
    if (
      this.constructor.metadata.indexCompendiumKey &&
      this.parent.documentName === "Item"
    ) {
      return await copyItem(
        this.parent.name,
        this.constructor.metadata.indexCompendiumKey,
      );
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
}
