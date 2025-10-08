import { modifyChangePrefix, secondsToReadable } from "../helpers/utils.mjs";
import { ChildDocumentMixin, CommonDocumentMixin } from "./mixins/_module.mjs";

const { ActiveEffect } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link ActiveEffect} implementation.
 * @extends {ActiveEffect}
 * @mixes ClientDocumentMixin
 * @mixes ChildDocumentMixin
 * @mixes CommonDocumentMixin
 * @property {"ActiveEffect"} documentName
 * @property {Teriock.Documents.EffectType} type
 * @property {Teriock.UUID<TeriockEffect>} uuid
 * @property {TeriockBaseEffectModel} system
 * @property {TeriockBaseEffectSheet} sheet
 * @property {TeriockParent} parent
 * @property {boolean} isOwner
 * @property {boolean} limited
 */
export default class TeriockEffect extends ChildDocumentMixin(
  CommonDocumentMixin(ActiveEffect),
) {
  /**
   * Change the IDs for many client effects consistently.
   * @param {TeriockEffect[]} effects - Client documents.
   * @param {Record<string,string>} idMap - Mapping of old IDs to new IDs.
   * @param {string} rootUuid - UUID for the parent {@link TeriockActor} or {@link TeriockItem} document.
   * @returns {TeriockEffect[]}
   * @private
   */
  static _changeEffectIds(effects, idMap, rootUuid) {
    const oldIds = Object.keys(idMap);
    return effects.map((oldEffect) => {
      const newEffect = /** @type {TeriockEffect} */ oldEffect.clone();
      const updateData = {
        "system.hierarchy.rootUuid": rootUuid,
      };
      if (oldIds.includes(oldEffect.id)) {
        updateData["_id"] = idMap[oldEffect.id];
      }
      if (oldEffect.metadata.hierarchy) {
        if (oldIds.includes(oldEffect.system.hierarchy.supId)) {
          updateData["system.hierarchy.supId"] =
            idMap[oldEffect.system.hierarchy.supId];
        }
        const newSubIds = new Set();
        for (const oldId of oldEffect.system.hierarchy.subIds) {
          newSubIds.add(idMap[oldId]);
        }
        updateData["system.hierarchy.subIds"] = newSubIds;
      }
      newEffect.updateSource(updateData);
      return newEffect;
    });
  }

  /**
   * Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only
   * occur for the client which requested the operation.
   * This batch-wise workflow occurs after individual {@link _preCreate} workflows and provides a final pre-flight check
   * before a database operation occurs.
   * Modifications to pending documents must mutate the documents array or alter individual document instances using
   * {@link updateSource}.
   * @param {TeriockEffect[]} documents - Pending document instances to be created
   * @param {DatabaseCreateOperation} operation - Parameters of the database creation operation
   * @param {TeriockUser} user - The User requesting the creation operation
   * @returns {Promise<boolean|void>} - Return false to cancel the creation operation entirely
   * @protected
   */
  static async _preCreateOperation(documents, operation, user) {
    await super._preCreateOperation(documents, operation, user);
    /** @type {TeriockEffect[]} */
    const toCreate = [];
    for (const supEffect of documents) {
      const newSupId = foundry.utils.randomID();
      toCreate.push(supEffect);
      if (supEffect?.metadata.hierarchy) {
        supEffect.updateSource({ _id: newSupId });
        if (supEffect.rootSubIds.size > 0) {
          const oldSupId = supEffect.rootSubs[0].system.hierarchy.supId;
          const subEffects = supEffect.rootAllSubs;
          const idMap = {};
          for (const id of subEffects.map((sub) => sub.id)) {
            idMap[id] = foundry.utils.randomID();
          }
          idMap[oldSupId] = newSupId;
          const newSubs = this._changeEffectIds(
            subEffects,
            idMap,
            operation.parent.uuid,
          );
          supEffect.updateSource({
            "system.hierarchy.subIds": supEffect.rootSubIds.map(
              (oldId) => idMap[oldId],
            ),
          });
          toCreate.push(...newSubs);
        }
        supEffect.updateSource({
          "system.hierarchy.rootUuid": operation.parent.uuid,
        });
        operation.keepId = true;
      }
    }
    documents.length = 0;
    documents.push(...toCreate);
  }

  /**
   * Pre-process a deletion operation, potentially altering its instructions or input data. Pre-operation events only
   * occur for the client which requested the operation.
   * This batch-wise workflow occurs after individual {@link _preDelete} workflows and provides a final pre-flight check
   * before a database operation occurs.
   * Modifications to the requested deletions are performed by mutating the operation object.
   * {@link updateSource}.
   * @param {TeriockEffect[]} documents - Document instances to be deleted
   * @param {DatabaseDeleteOperation} operation - Parameters of the database update operation
   * @param {TeriockUser} user - The User requesting the deletion operation
   * @returns {Promise<boolean|void>} - Return false to cancel the deletion operation entirely
   * @protected
   */
  static async _preDeleteOperation(documents, operation, user) {
    await super._preDeleteOperation(documents, operation, user);
    for (const supEffect of documents) {
      if (supEffect?.metadata.hierarchy) {
        operation.ids.push(...Array.from(supEffect.allSubs.map((e) => e.id)));
      }
    }
  }

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
   * @inheritDoc
   * @returns {TeriockActor|null}
   */
  get actor() {
    return this.parent?.actor;
  }

  /**
   * Gets all sub-effect descendants from this effect recursively.
   * @returns {TeriockEffect[]} Array of all descendant effects.
   */
  get allSubs() {
    const allSubEffects = [];
    const subEffects = this.subs;
    for (const subEffect of subEffects) {
      allSubEffects.push(subEffect);
      allSubEffects.push(...subEffect.allSubs);
    }
    return allSubEffects;
  }

  /**
   * Gets all effects that this effect is a sub-effect of.
   * @returns {TeriockEffect[]} Array of super-effects, ordered from immediate sup to top level.
   */
  get allSups() {
    const supEffects = [];
    let supEffect = this.sup;
    if (supEffect) {
      supEffects.push(supEffect);
      supEffects.push(...supEffect.allSups);
    }
    return supEffects;
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
    return (
      this.parent.documentName === "Item" &&
      this.parent.system.onUse.has(this.id)
    );
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

  /** @inheritDoc */
  get isSuppressed() {
    let suppressed = super.isSuppressed;
    return this.system.suppressed || suppressed;
  }

  /**
   * @inheritDoc
   * @returns {Readonly<Teriock.Documents.EffectModelMetadata>}
   */
  get metadata() {
    return /** @type {Readonly<Teriock.Documents.EffectModelMetadata>} */ super
      .metadata;
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

  /**
   * Gets all sub-effect descendants from this effect recursively via its root.
   * @returns {TeriockEffect[]} Array of all descendant effects.
   */
  get rootAllSubs() {
    const allSubEffects = [];
    const subEffects = this.rootSubs;
    for (const subEffect of subEffects) {
      allSubEffects.push(subEffect);
      allSubEffects.push(...subEffect.allSubs);
    }
    return allSubEffects;
  }

  /**
   * Safely gets the IDS of all sub-effects that are derived from this effect via its root.
   * @returns {Set<string>}
   */
  get rootSubIds() {
    if (this.metadata.hierarchy && this.system.hierarchy.subIds.size > 0) {
      const root = /** @type {TeriockParent} */ foundry.utils.fromUuidSync(
        this.system.hierarchy.rootUuid,
      );
      return this.system.hierarchy.subIds.filter((id) => root.effects.has(id));
    }
    return new Set();
  }

  /**
   * Gets all sub-effects that are derived from this effect via it's root.
   * @returns {TeriockEffect[]}
   */
  get rootSubs() {
    /** @type {TeriockEffect[]} */
    const subEffects = [];
    for (const id of this.rootSubIds) {
      const root = /** @type {TeriockParent} */ foundry.utils.fromUuidSync(
        this.system.hierarchy.rootUuid,
      );
      subEffects.push(root.effects.get(id));
    }
    return subEffects;
  }

  /**
   * Gets the document that most directly applies this effect. If it's an effect, return that.
   * Otherwise, gets what Foundry considers to be the parent.
   * @returns {TeriockActor|TeriockEffect|TeriockItem} The source document that applies this effect.
   */
  get source() {
    let source = this.sup;
    if (!source) {
      source = this.parent;
    }
    return source;
  }

  /**
   * Safely gets the IDS of all sub-effects that are derived from this effect.
   * @returns {Set<string>}
   */
  get subIds() {
    if (this.metadata.hierarchy && this.system.hierarchy.subIds.size > 0) {
      const root = this.parent;
      return this.system.hierarchy.subIds.filter((id) => root.effects.has(id));
    }
    return new Set();
  }

  /**
   * Gets all sub-effects that are derived from this effect.
   * @returns {TeriockEffect[]}
   */
  get subs() {
    /** @type {TeriockEffect[]} */
    const subEffects = [];
    for (const id of this.subIds) {
      const root = this.parent;
      subEffects.push(root.effects.get(id));
    }
    return subEffects;
  }

  /**
   * Gets the effect that provides this effect if there is one.
   * @returns {TeriockEffect|null}
   */
  get sup() {
    if (this.supId) {
      return /** @type {TeriockEffect} */ this.parent.getEmbeddedDocument(
        "ActiveEffect",
        this.supId,
      );
    }
    return null;
  }

  /**
   * Safely gets the ID of the effect that provides this effect if there is one.
   * @returns {Teriock.ID<TeriockEffect>}
   */
  get supId() {
    if (
      this.metadata.hierarchy &&
      this.system.hierarchy.supId &&
      this.parent.effects.has(this.system.hierarchy.supId)
    ) {
      return this.system.hierarchy.supId;
    }
    return null;
  }

  /** @inheritDoc */
  async _preCreate(data, operations, user) {
    this.updateSource({ sort: game.time.serverTime });
    return await super._preCreate(data, operations, user);
  }

  /** @inheritDoc */
  async _preUpdate(changed, options, user) {
    if ((await super._preUpdate(changed, options, user)) === false) {
      return false;
    }
    if (
      this.parent.type === "wrapper" &&
      this.parent.system.effect.id === this.id
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

  /**
   * Add a sub-effect to this one.
   * @param {TeriockEffect} sub
   * @returns {Promise<void>}
   */
  async addSub(sub) {
    if (this.metadata.hierarchy && sub.metadata.hierarchy) {
      const newSubIds = this.subIds;
      newSubIds.add(sub.id);
      await this.parent.updateEmbeddedDocuments(this.documentName, [
        {
          _id: this.id,
          "system.hierarchy.subIds": newSubIds,
        },
        {
          _id: sub.id,
          "system.hierarchy.supId": this.id,
        },
      ]);
    }
  }

  /**
   * Add multiple sub-effects to this one.
   * @param {TeriockEffect[]} subs
   * @returns {Promise<void>}
   */
  async addSubs(subs) {
    subs = subs.filter((s) => s.metadata.hierarchy);
    if (this.metadata.hierarchy) {
      const newSubIds = this.subIds;
      for (const s of subs) {
        newSubIds.add(s.id);
      }
      await this.parent.updateEmbeddedDocuments(this.documentName, [
        {
          _id: this.id,
          "system.hierarchy.subIds": newSubIds,
        },
        ...subs.map((s) => {
          return {
            _id: s.id,
            "system.hierarchy.supId": this.id,
          };
        }),
      ]);
    }
  }

  /**
   * Deletes all sub-effects and clears the sub IDs from this effect.
   * @returns {Promise<void>} Promise that resolves when all subs are deleted.
   */
  async deleteSubs() {
    if (this.subIds.size > 0) {
      await this.parent?.deleteEmbeddedDocuments(
        "ActiveEffect",
        Array.from(this.subIds),
      );
      await this.update({
        "system.hierarchy.subIds": new Set(),
      });
    }
  }

  /** @inheritDoc */
  async disable() {
    await this.update({ disabled: true });
  }

  /**
   * @inheritDoc
   * @returns {Promise<TeriockEffect>}
   */
  async duplicate() {
    const copy = /** @type {TeriockEffect} */ await super.duplicate();
    const sup = copy.sup;
    if (sup) {
      await sup.addSub(copy);
    }
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
