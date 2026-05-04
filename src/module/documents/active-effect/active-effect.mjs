import {
  migrateUuid,
  migrateValueTransform,
} from "../../data/shared/migrations/source-migrations.mjs";
import { mix } from "../../helpers/construction.mjs";
import TeriockItem from "../item/item.mjs";
import * as mixins from "../mixins/_module.mjs";

const { ActiveEffect } = foundry.documents;

//noinspection JSClosureCompilerSyntax
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
export default class TeriockActiveEffect extends mix(
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
   * Checks if this effect is supposed to activate on the use of its parent {@link TeriockItem}.
   * @returns {boolean}
   */
  get isOnUse() {
    if (this.parent instanceof TeriockItem) {
      return this.parent.system.onUse.has(this.id);
    }
    return false;
  }

  /**
   * Whether this effect is a reference and not "real".
   * @returns {boolean}
   */
  get isReference() {
    return this.isOnUse || this.system.isReference;
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
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    const elder = await this.getElder();
    if (elder && !elder.metadata.childEffectTypes.includes(this.type)) {
      return false;
    }
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
