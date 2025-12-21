import { ChildSettingsModel } from "../../data/models/settings-models/_module.mjs";
import { mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

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
 * @mixes SettingsDocument
 * @property {Collection<ID<TeriockEffect>, TeriockEffect>} effects
 * @property {Teriock.Documents.ItemModel} system
 * @property {Teriock.Documents.ItemType} type
 * @property {ID<TeriockItem>} _id
 * @property {ID<TeriockItem>} id
 * @property {UUID<TeriockItem>} uuid
 * @property {TeriockBaseItemSheet} sheet
 */
export default class TeriockItem extends mix(
  Item,
  mixins.BaseDocumentMixin,
  mixins.CommonDocumentMixin,
  mixins.ChildDocumentMixin,
  mixins.ParentDocumentMixin,
  mixins.ChangeableDocumentMixin,
  mixins.RetrievalDocumentMixin,
  mixins.SettingsDocumentMixin,
) {
  /** @inheritDoc */
  get _settingsFlagsDataModel() {
    return ChildSettingsModel;
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
   * @returns {TeriockEffect[]}
   */
  get validEffects() {
    return this.effects.contents;
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (this.checkEditor(userId)) {
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
