import { documentTypes } from "../../constants/system/document-types.mjs";
import { mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { Item } = foundry.documents;

//noinspection JSUnresolvedReference,JSClosureCompilerSyntax,JSValidateJSDoc
/**
 * The Teriock Item implementation.
 * @implements {Teriock.Documents.ItemInterface}
 * @extends {ClientDocument}
 * @extends {Item}
 * @mixes BaseDocument
 * @mixes ChildDocument
 * @mixes CommonDocument
 * @mixes ParentDocument
 * @mixes RetrievalDocument
 */
export default class TeriockItem extends mix(
  Item,
  mixins.BaseDocumentMixin,
  mixins.CommonDocumentMixin,
  mixins.ChildDocumentMixin,
  mixins.ParentDocumentMixin,
  mixins.RetrievalDocumentMixin,
) {
  /** @inheritDoc */
  static get documentMetadata() {
    return Object.assign(super.documentMetadata, {
      types: Object.keys(documentTypes.items),
    });
  }

  /**
   * @inheritDoc
   * @param {TeriockItem[]} documents
   * @param {DatabaseCreateOperation & Teriock.System._CreateOperation} operation
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  static async _onCreateOperation(documents, operation, user) {
    const actors = new Set();
    for (const d of documents) if (d.actor) actors.add(d.actor);
    await Promise.all(actors.map((a) => a._processStagedItemCreations()));
    return super._onCreateOperation(documents, operation, user);
  }

  /**
   * @inheritDoc
   * @param {TeriockItem[]} documents
   * @param {DatabaseDeleteOperation} operation
   * @param {TeriockUser} user
   * @returns {Promise<void>}
   */
  static async _onDeleteOperation(documents, operation, user) {
    const actors = new Set();
    for (const d of documents) if (d.actor) actors.add(d.actor);
    await Promise.all(actors.map((a) => a._processStagedItemDeletions()));
    return super._onDeleteOperation(documents, operation, user);
  }

  /**
   * @inheritDoc
   * @param {TeriockItem[]} documents
   * @param {DatabaseCreateOperation & Teriock.System._CreateOperation} operation
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  static async _preCreateOperation(documents, operation, user) {
    for (const d of documents.filter((d) => d.actor)) {
      d.actor._stagedItemCreations = new Set();
    }
    return super._preCreateOperation(documents, operation, user);
  }

  /**
   * @inheritDoc
   * @param {TeriockItem[]} documents
   * @param {DatabaseDeleteOperation} operation
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  static async _preDeleteOperation(documents, operation, user) {
    for (const d of documents.filter((d) => d.actor)) {
      d.actor._stagedItemDeletions = new Set();
    }
    return super._preDeleteOperation(documents, operation, user);
  }

  /**
   * Checks if the item is active.
   * @returns {boolean}
   */
  get active() {
    return !this.isSuppressed && !this.disabled;
  }

  /** @inheritDoc */
  get apps() {
    if (this.type === "wrapper" && this.system?.effect) {
      return {
        [this.system?.effect.sheet.id]: this.system?.effect.sheet,
      };
    } else {
      return super.apps;
    }
  }

  /**
   * Checks if the item is disabled.
   * @returns {boolean} True if the item is disabled, false otherwise.
   */
  get disabled() {
    return this.system.disabled;
  }

  /**
   * Checks if the item is suppressed.
   * @returns {boolean} True if the item is suppressed, false otherwise.
   */
  get isSuppressed() {
    return this.system.makeSuppressed;
  }

  /**
   * @inheritDoc
   * @returns {AnyActiveEffect[]}
   */
  get validEffects() {
    return this.effects.contents;
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (this.checkEditor(userId)) {
      for (const a of this.abilities) {
        a.system?.expireSustainedConsequences();
      }
    }
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const no = await super._preCreate(data, options, user);
    if (no === false) return false;

    const elder = await this.getElder();
    if (elder && !elder.metadata.childItemTypes.includes(this.type)) {
      return false;
    }
  }

  /**
   * @inheritDoc
   * @yields {TeriockActiveEffect}
   * @returns {Generator<AnyActiveEffect, void, void>}
   */
  *allApplicableEffects() {
    for (const effect of this.effects) {
      yield effect;
    }
  }
}
