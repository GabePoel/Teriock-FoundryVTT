import {
  BlankMixin,
  ChangeableDocumentMixin,
  ChildDocumentMixin,
  CommonDocumentMixin,
  ParentDocumentMixin,
} from "../mixins/_module.mjs";

const { Item } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Item} implementation.
 * @extends {Item}
 * @mixes ChangeableDocumentMixin
 * @mixes ChildDocumentMixin
 * @mixes ClientDocumentMixin
 * @mixes CommonDocumentMixin
 * @mixes ParentDocumentMixin
 * @property {EmbeddedCollection<Teriock.ID<TeriockEffect>, TeriockEffect>} effects
 */
export default class TeriockItem extends ChangeableDocumentMixin(
  ParentDocumentMixin(
    ChildDocumentMixin(CommonDocumentMixin(BlankMixin(Item))),
  ),
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
   * @inheritDoc
   * @returns {TeriockActor|null}
   */
  get actor() {
    return super.actor;
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
   * @returns {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  get metadata() {
    return /** @type {Readonly<Teriock.Documents.ItemModelMetadata>} */ super
      .metadata;
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
  async roll(options) {
    await this.system.roll(options);
  }
}
