import { documentTypes } from "../../constants/system/document-types.mjs";
import { ChildSettingsModel } from "../../data/models/settings-models/_module.mjs";
import { secondsToReadable } from "../../helpers/unit.mjs";
import { mix } from "../../helpers/utils.mjs";
import TeriockItem from "../item/item.mjs";
import * as mixins from "../mixins/_module.mjs";

const { ActiveEffect } = foundry.documents;

/**
 * The Teriock {@link ActiveEffect} implementation.
 * @extends {ActiveEffect}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes ChildDocument
 * @mixes CommonDocument
 * @mixes HierarchyDocument
 * @mixes RetrievalDocument
 * @mixes SettingsDocument
 * @property {Teriock.Documents.EffectModel} system
 * @property {Teriock.Documents.EffectType} type
 * @property {ID<TeriockEffect>} _id
 * @property {ID<TeriockEffect>} id
 * @property {UUID<TeriockEffect>} uuid
 * @property {TeriockBaseEffectSheet} sheet
 */
export default class TeriockEffect extends mix(
  ActiveEffect,
  mixins.BaseDocumentMixin,
  mixins.CommonDocumentMixin,
  mixins.ChildDocumentMixin,
  mixins.RetrievalDocumentMixin,
  mixins.SettingsDocumentMixin,
) {
  /** @inheritDoc */
  static get documentMetadata() {
    const metadata = super.documentMetadata;
    metadata.types = Object.keys(documentTypes.effects);
    return metadata;
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (typeof data?.type === "string" && data.type === "effect") {
      data.type = "consequence";
    }
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get _settingsFlagsDataModel() {
    return ChildSettingsModel;
  }

  /**
   * Alternative to {@link TeriockEffect.isTemporary} that only references duration.
   * @returns {boolean}
   */
  get hasDuration() {
    return !!this.duration.seconds;
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
    if (this.isOnUse) {
      return true;
    }
    return this.system.isReference;
  }

  /**
   * @inheritDoc
   * @returns {boolean}
   */
  get isSuppressed() {
    return this.system.makeSuppressed || super.isSuppressed;
  }

  /**
   * The number of seconds remaining before this effect expires.
   * @returns {number|null}
   */
  get remaining() {
    if (this.hasDuration) {
      return (
        this.duration.startTime + this.duration.seconds - game.time.worldTime
      );
    }
    return null;
  }

  /**
   * The time remaining before this effect expires, as a string.
   * @returns {string|null}
   */
  get remainingString() {
    const remaining = this.remaining;
    if (remaining !== null) {
      return secondsToReadable(remaining) + " remaining";
    }
    return "No time limit";
  }

  /** @inheritDoc */
  _applyAdd(actor, change, current, delta, changes) {
    if (foundry.utils.getType(current) === "Set") current.add(delta);
    else super._applyAdd(actor, change, current, delta, changes);
  }

  /** @inheritDoc */
  _applyOverride(actor, change, current, delta, changes) {
    if (foundry.utils.getType(current) === "Set") delta = new Set([delta]);
    super._applyOverride(actor, change, current, delta, changes);
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    const elder = await this.getElder();
    if (elder && !elder.metadata.childEffectTypes.includes(this.type)) {
      return false;
    }
  }

  /** @inheritDoc */
  async _preDelete(options, user) {
    if ((await super._preDelete(options, user)) === false) {
      return false;
    }
    if (this.elder?.type === "wrapper") {
      const elder = await this.getElder();
      await elder.delete();
      return false;
    }
  }

  /** @inheritDoc */
  async _preUpdate(changed, options, user) {
    if ((await super._preUpdate(changed, options, user)) === false) {
      return false;
    }
    if (
      this.elder?.type === "wrapper" &&
      foundry.utils.getProperty(this.elder, "system.effect.id") === this.id
    ) {
      const wrapperKeys = ["name", "img"];
      const wrapperUpdates = {};
      for (const key of wrapperKeys) {
        if (
          foundry.utils.hasProperty(changed, key) &&
          foundry.utils.getProperty(changed, key) !==
            foundry.utils.getProperty(this.elder, key)
        ) {
          wrapperUpdates[key] = foundry.utils.getProperty(changed, key);
        }
      }
      if (Object.keys(wrapperUpdates).length > 0) {
        await this.elder?.update(wrapperUpdates);
      }
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
