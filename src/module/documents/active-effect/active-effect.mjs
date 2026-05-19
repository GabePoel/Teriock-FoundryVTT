import { migrateUuid, migrateValueTransform } from "../../data/shared/migrations/source-migrations.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import * as mixins from "../mixins/_module.mjs";

const { ActiveEffect } = foundry.documents;

/**
 * The Teriock ActiveEffect implementation.
 * @extends {Teriock.Documents.ActiveEffectInterface}
 * @extends {ActiveEffect}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes ChildDocument
 * @mixes CommonDocument
 * @mixes RetrievalDocument
 */
export default class TeriockActiveEffect extends mixClasses(
  ActiveEffect,
  mixins.BaseDocumentMixin,
  mixins.CommonDocumentMixin,
  mixins.ChildDocumentMixin,
  mixins.RetrievalDocumentMixin,
) {
  /** @inheritDoc */
  static get documentMetadata() {
    return Object.assign(super.documentMetadata, {
      types: Object.keys(CONFIG.ActiveEffect.dataModels),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateValueTransform(source, "_stats.compendiumSource", migrateUuid);
    return super.migrateData(source, options, state);
  }

  /**
   * Whether this effect is a reference and not "real".
   * @returns {boolean}
   */
  get isReference() {
    return this.system.isReference;
  }

  /**
   * Whether this is a status effect.
   * @returns {boolean}
   */
  get isStatus() {
    return Object.values(CONFIG.statusEffects)
      .map(s => s?._id)
      .includes(this.id);
  }

  /**
   * The time remaining before this effect expires, as a string.
   * @returns {string|null}
   */
  get remainingString() {
    return this.duration.remaining < Infinity
      ? this.duration.label
      : _loc("TERIOCK.SYSTEMS.BaseEffect.PANELS.noTimeLimit");
  }

  /** @inheritDoc */
  async createChildDocuments(embeddedName, data = [], operation = {}) {
    if (embeddedName === "Item") {
      return this.createDependentDocuments(embeddedName, data, operation);
    } else {
      return super.createChildDocuments(embeddedName, data, operation);
    }
  }

  /** @inheritDoc */
  async disable() {
    await this.update({ disabled: true });
  }

  /** @inheritDoc */
  async enable() {
    await this.update({ disabled: false });
  }

  /** @inheritDoc */
  async toggleDisabled() {
    await this.update({ disabled: !this.disabled });
  }
}
