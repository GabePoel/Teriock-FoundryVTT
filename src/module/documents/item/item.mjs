import {
  ChangeableDocumentMixin,
  ChildDocumentMixin,
  CommonDocumentMixin,
  ParentDocumentMixin,
} from "../mixins/_module.mjs";

const { Item } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Item} implementation.
 * @extends {ClientDocument}
 * @extends {Item}
 * @mixes ChangeableDocument
 * @mixes ChildDocument
 * @mixes CommonDocument
 * @mixes ParentDocument
 * @property {EmbeddedCollection<Teriock.ID<TeriockEffect>, TeriockEffect>} effects
 * @property {Teriock.Documents.ItemModel} system
 * @property {Teriock.Documents.ItemType} type
 * @property {Teriock.ID<TeriockItem>} _id
 * @property {Teriock.ID<TeriockItem>} id
 * @property {Teriock.UUID<TeriockItem>} uuid
 * @property {TeriockBaseItemSheet} sheet
 */
export default class TeriockItem extends ChangeableDocumentMixin(
  ParentDocumentMixin(ChildDocumentMixin(CommonDocumentMixin(Item))),
) {
  /** @inheritDoc */
  changesField = "itemChanges";

  /**
   * Checks if the item is active.
   * @returns {boolean}
   */
  get active() {
    return !this.isSuppressed && !this.disabled;
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
    return this.system.suppressed;
  }

  /**
   * @inheritDoc
   * @returns {TeriockEffect[]}
   */
  get validEffects() {
    return this.effects.contents;
  }

  /** @inheritDoc */
  async _preCreate(data, operations, user) {
    this.updateSource({ sort: game.time.serverTime });
    return await super._preCreate(data, operations, user);
  }

  /**
   * @inheritDoc
   * @yields {TeriockEffect}
   * @returns {Generator<TeriockEffect, void, void>}
   */
  *allApplicableEffects() {
    for (const effect of this.effects) {
      yield effect;
    }
  }

  /**
   * @inheritDoc
   * @param {"ActiveEffect"} embeddedName
   * @param {object[]} data
   * @param {DatabaseCreateOperation} [operation={}]
   * @returns {Promise<TeriockEffect[]>}
   */
  async createEmbeddedDocuments(embeddedName, data = [], operation = {}) {
    this._filterDocumentCreationData(embeddedName, data);
    return await super.createEmbeddedDocuments(embeddedName, data, operation);
  }

  /** @inheritDoc */
  getBodyParts() {
    return this.subs.filter((s) => s.type === "body");
  }

  /** @inheritDoc */
  getEquipment() {
    return this.subs.filter((s) => s.type === "equipment");
  }

  /** @inheritDoc */
  getRanks() {
    return this.subs.filter((s) => s.type === "rank");
  }

  /** @inheritDoc */
  async roll(options = {}) {
    await this.system.roll(options);
  }
}
