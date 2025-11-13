import { modifyChangePrefix, secondsToReadable } from "../../helpers/utils.mjs";
import TeriockItem from "../item/item.mjs";
import { ChildDocumentMixin, CommonDocumentMixin } from "../mixins/_module.mjs";

const { ActiveEffect } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link ActiveEffect} implementation.
 * @extends {ActiveEffect}
 * @extends {ClientDocument}
 * @mixes ChildDocument
 * @mixes CommonDocument
 * @property {Teriock.Documents.EffectModel} system
 * @property {Teriock.Documents.EffectType} type
 * @property {Teriock.ID<TeriockEffect>} _id
 * @property {Teriock.ID<TeriockEffect>} id
 * @property {Teriock.UUID<TeriockEffect>} uuid
 * @property {TeriockBaseEffectSheet} sheet
 */
export default class TeriockEffect extends ChildDocumentMixin(
  CommonDocumentMixin(ActiveEffect),
) {
  /** @inheritDoc */
  static migrateData(data) {
    if (typeof data?.type === "string" && data.type === "effect") {
      data.type = "consequence";
    }
    return data;
  }

  /**
   * Changes that apply to {@link TeriockItem}s.
   * @type {EffectChangeData[]}
   */
  itemChanges = [];

  /**
   * Changes that apply only to certain {@link TeriockChild} documents.
   * @type {Teriock.Fields.SpecialChange[]}
   */
  specialChanges = [];

  /**
   * Changes that apply to {@link TeriockItem}s.
   * @type {EffectChangeData[]}
   */
  tokenChanges = [];

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
   * Checks if this effect is a reference effect by examining its sups for non-passive maneuvers.
   * @returns {boolean} True if this is a reference effect, false otherwise.
   */
  get isReference() {
    const sups = this.allSups;
    if (this.isOnUse) {
      return true;
    }
    for (const sup of sups) {
      if (sup.system.maneuver !== "passive") {
        return true;
      }
    }
    return false;
  }

  /**
   * @inheritDoc
   * @returns {boolean}
   */
  get isSuppressed() {
    let suppressed = super.isSuppressed;
    return this.system.suppressed || suppressed;
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
      return secondsToReadable(remaining);
    }
    return null;
  }

  /** @inheritDoc */
  async _preCreate(data, operations, user) {
    this.updateSource({ sort: game.time.serverTime });
    return await super._preCreate(data, operations, user);
  }

  /** @inheritDoc */
  async _preDelete(options, user) {
    if ((await super._preDelete(options, user)) === false) {
      return false;
    }
    if (this.parent.type === "wrapper") {
      await this.parent.delete();
      return false;
    }
  }

  /** @inheritDoc */
  async _preUpdate(changed, options, user) {
    if ((await super._preUpdate(changed, options, user)) === false) {
      return false;
    }
    if (
      this.parent.type === "wrapper" &&
      foundry.utils.getProperty(this.parent, "system.effect.id") === this.id
    ) {
      const wrapperKeys = ["name", "img"];
      const wrapperUpdates = {};
      for (const key of wrapperKeys) {
        if (
          foundry.utils.hasProperty(changed, key) &&
          foundry.utils.getProperty(changed, key) !==
            foundry.utils.getProperty(this.parent, key)
        ) {
          wrapperUpdates[key] = foundry.utils.getProperty(changed, key);
        }
      }
      if (Object.keys(wrapperUpdates).length > 0) {
        await this.parent.update(wrapperUpdates);
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

  /**
   * @inheritDoc
   * @returns {TeriockAbility[]}
   */
  getAbilities() {
    //noinspection JSValidateTypes
    return this.subs.filter((s) => s.type === "ability");
  }

  /**
   * @inheritDoc
   * @returns {TeriockProperty[]}
   */
  getProperties() {
    //noinspection JSValidateTypes
    return this.subs.filter((s) => s.type === "property");
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    // Effects can change Actors, Items, and TokenDocuments. By default, they change actors. But if the change key is
    // prefixed by "item" or "token" then it changes "Items" and "TokenDocuments" respectively.
    const actorChanges = [];
    const itemChanges = [];
    const tokenChanges = [];
    const rawSpecialChanges = [];
    for (const change of this.changes) {
      let newChanges = [change];
      // Make sure changes to the base damage also apply to two-handed damage.
      if (change.key.includes("system.damage.base.raw")) {
        const newChange = foundry.utils.deepClone(change);
        newChange.key = newChange.key.replaceAll(
          "system.damage.base.raw",
          "system.damage.twoHanded.raw",
        );
        newChanges.push(newChange);
      }
      if (change.key.startsWith("item")) {
        itemChanges.push(
          ...newChanges.map((c) => modifyChangePrefix(c, "item.", "")),
        );
      } else if (change.key.startsWith("token")) {
        tokenChanges.push(
          ...newChanges.map((c) => modifyChangePrefix(c, "token.", "")),
        );
      } else if (
        change.key.startsWith("!") &&
        change.key.split("__").length >= 4
      ) {
        rawSpecialChanges.push(
          ...newChanges.map((c) => modifyChangePrefix(c, "!", "")),
        );
      } else {
        actorChanges.push(...newChanges);
      }
    }
    const specialChanges = [];
    for (const change of rawSpecialChanges) {
      const changeParts = change.key.split("__");
      /** @type {Teriock.Fields.SpecialChange} */
      const specialChange = {
        key: changeParts.at(-1),
        mode: change.mode,
        priority: change.priority,
        reference: {
          key: changeParts[1],
          check: changeParts[2],
          type: changeParts[0],
          value: changeParts.slice(3, -1).join(""),
        },
        value: change.value,
      };
      specialChanges.push(specialChange);
    }
    this.changes = actorChanges;
    this.itemChanges = itemChanges;
    this.tokenChanges = tokenChanges;
    this.specialChanges = specialChanges;
  }

  /** @inheritDoc */
  async toggleDisabled() {
    await this.update({ disabled: !this.disabled });
  }
}
