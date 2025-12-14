import { isOwnerAndCurrentUser } from "../../helpers/utils.mjs";
import {
  BaseDocumentMixin,
  ChangeableDocumentMixin,
  ChildDocumentMixin,
  CommonDocumentMixin,
  ParentDocumentMixin,
  RetrievalDocumentMixin,
} from "../mixins/_module.mjs";

const { Item } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Item} implementation.
 * @extends {ClientDocument}
 * @extends {Item}
 * @mixes BaseDocument
 * @mixes ChangeableDocument
 * @mixes ChildDocument
 * @mixes CommonDocument
 * @mixes HierarchyDocument
 * @mixes ParentDocument
 * @mixes RetrievalDocument
 * @property {Collection<ID<TeriockEffect>, TeriockEffect>} effects
 * @property {Teriock.Documents.ItemModel} system
 * @property {Teriock.Documents.ItemType} type
 * @property {ID<TeriockItem>} _id
 * @property {ID<TeriockItem>} id
 * @property {UUID<TeriockItem>} uuid
 * @property {TeriockBaseItemSheet} sheet
 */
export default class TeriockItem extends RetrievalDocumentMixin(
  ChangeableDocumentMixin(
    ParentDocumentMixin(
      ChildDocumentMixin(CommonDocumentMixin(BaseDocumentMixin(Item))),
    ),
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
   * @returns {TeriockEffect[]}
   */
  get validEffects() {
    return this.effects.contents;
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (isOwnerAndCurrentUser(this, userId)) {
      for (const a of this.abilities) {
        a.system?.expireSustainedConsequences().then();
      }
    }
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    const elder = await this.getElder();
    if (elder && !elder.metadata.childItemTypes.includes(this.type)) {
      return false;
    }
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
}
