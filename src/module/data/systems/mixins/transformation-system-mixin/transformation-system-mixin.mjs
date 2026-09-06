import statConfig from "../../../../constants/config/stat-config.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { consolidateWriteOperations } from "../../../../helpers/utils.mjs";
import { effectTransformationFields } from "../../../fields/tools/transformation-fields.mjs";

const { fields } = foundry.data;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 * @import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 * @import { ActorTransformationPart } from "../../actors/base-actor-system/parts/transformation-part/actor-transformation-part.mjs";
 * @import { SpeciesTransformationPart } from "../../items/species-system/parts/species-transformation-part/species-transformation-part.mjs";
 */

/**
 * @typedef {object} FlagMap
 * @property {ID<TeriockActiveEffect>[]} disabledEffects
 * @property {ID<TeriockItem>[]} disabledItems
 * @property {ID<TeriockItem>[]} disabledStatDiceItems
 */

const POOL_STATS = Object.keys(statConfig).filter(k => statConfig[k].pool?.enabled);

/**
 * Actor flag key storing item ids whose stat dice were disabled for a pool stat.
 * @param {Teriock.Keys.DieStat} stat
 * @returns {string}
 */
function disabledStatDiceFlag(stat) {
  return `disabled${stat[0].toUpperCase()}${stat.slice(1)}DiceItems`;
}

/**
 * Actor flag key storing a stat value when a transformation is disabled.
 * @param {Teriock.Keys.DieStat} stat
 * @returns {string}
 */
function transformationStatFlag(stat) {
  return `transformation${stat[0].toUpperCase()}${stat.slice(1)}`;
}

/**
 * Effect data model that handles transformation behavior.
 *
 * Relevant wiki pages:
 * - [Transformed](https://wiki.teriock.com/index.php/Condition:Transformed)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, TransformationSystem & Teriock.Models.TransformationSystemData>}
 * @see {ActorTransformationPart}
 * @see {SpeciesTransformationPart}
 */
export default function TransformationSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.TransformationSystemData}
   * @mixin
   */
  class TransformationSystem extends Base {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SCHEMA.Transformation"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        transformation: new fields.SchemaField(effectTransformationFields()),
      });
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      if (source.transformation && "reset" in source.transformation) {
        source.transformation.resets ??= source.transformation.reset;
        delete source.transformation.reset;
      }
      return super.migrateData(source, options);
    }

    /**
     * Batched operations waiting to be applied to the database.
     * @type {DatabaseWriteOperation[]}
     */
    #batchedOperations = [];

    /**
     * @returns {FlagMap}
     */
    get #flagMap() {
      const hasItem = id => this.actor.items.has(id);
      const hasEffect = id => this.actor.effects.has(id);
      return {
        disabledEffects: (this.parent.getFlag("teriock", "disabledEffects") ?? []).filter(hasEffect),
        disabledItems: (this.parent.getFlag("teriock", "disabledItems") ?? []).filter(hasItem),
        disabledStatDiceItems: Object.fromEntries(
          POOL_STATS.map(
            stat => [stat, (this.parent.getFlag("teriock", disabledStatDiceFlag(stat)) ?? []).filter(hasItem)]
          ),
        ),
      };
    }

    /**
     * Whether this needs to inherit an image.
     * @return {boolean}
     */
    get #inheritImg() {
      return this.actor && (!this.transformation.img || this.transformation.ring && !this.transformation.ringImg);
    }

    /**
     * Reset update data.
     * @returns {object}
     */
    get #resetUpdateData() {
      const updateData = {};
      for (const r of this.transformation.resets) {
        Object.assign(updateData, statConfig[r].transformationReset.update);
      }
      return updateData;
    }

    /**
     * Batch an update to the actor itself.
     * @param {object} data
     */
    #addBatchActorUpdate(data) {
      this.#batchedOperations.push({
        action: "update",
        documentName: "Actor",
        ids: [this.actor.id],
        pack: this.actor.pack,
        parent: this.actor.parent,
        updates: [{ _id: this.actor.id, ...data }],
      });
    }

    /**
     * Pull species data, configure it, and batch it to be added to the actor.
     * @returns {Promise<void>}
     */
    async #addBatchCreateTransformedSpecies() {
      if (!this.isTransformation || !this.actor) { return; }
      const uuids = this.transformation.uuids;
      const flags = this._buildTransformationFlags();
      this.parent.updateSource({ flags });
      let species = /** @type {TeriockItem<"species">[]} */ await Promise.all(uuids.map(uuid => fromUuid(uuid)));
      species = species.filter(s => s);
      if (!species.length) { return; }
      const itemData = /** @type {TeriockItem<"species">[]} */ species.map(s => s.toObject());
      itemData.forEach(s => {
        s._id = foundry.utils.randomID();
        s.system.transformationLevel = this.transformation.level;
        for (const stat of POOL_STATS) {
          s.system.statDice[stat].disabled = !this.transformation.resets.has(stat);
        }
        s.system.competence.raw = this.transformation.competence.value;
        if (s.system.size.min && s.system.size.max) {
          s.system.size.value = Math.clamp(this.actor.system.size.value, s.system.size.min, s.system.size.max);
        }
      });
      const op = this.parent.getCreateDependentDocumentsOperation("Item", itemData, { keepId: true });
      if (op) { this.#batchedOperations.push(op); }
      this.#batchedOperations.push(
        this.actor.getUpdateChildDocumentsOperation("ActiveEffect", [{
          _id: this.parent.id,
          "system.transformation.primary": itemData[0]._id,
        }]),
      );
    }

    /**
     * Batch a toggle update to a document embedded within the actor.
     * @param {DocumentCollection} collection
     * @param {ID<TeriockActiveEffect|TeriockItem>} id
     * @param {boolean} value
     */
    #addBatchToggle(collection, id, value) {
      const toggle = TERIOCK.config.transformation.suppress[collection.get(id)?.type]?.path;
      if (!toggle) { return; }
      this.#addBatchUpdateDocument(collection, id, { [toggle]: value });
    }

    /**
     * Batch many update toggles for documents embedded within the actor.
     * @param value
     */
    #addBatchToggleDocuments(value) {
      if (!this.actor) { return; }
      const fm = this.#flagMap;
      for (const id of fm.disabledItems) { this.#addBatchToggle(this.actor.items, id, value); }
      for (const id of fm.disabledEffects) { this.#addBatchToggle(this.actor.effects, id, value); }
      for (const stat of POOL_STATS) {
        for (const id of fm.disabledStatDiceItems[stat]) {
          this.#addBatchUpdateDocument(this.actor.items, id, { [`system.statDice.${stat}.disabled`]: value });
        }
      }
    }

    /**
     * Batch an update to a document embedded within the actor.
     * @param {DocumentCollection} collection
     * @param {ID<TeriockActiveEffect|TeriockItem>} id
     * @param {object} data
     */
    #addBatchUpdateDocument(collection, id, data) {
      if (!collection.get(id)) { return; }
      const operation = this.#batchedOperations.find(op =>
        op.documentName === collection.documentName && op.action === "update" && op.updates?.some(u => u._id === id)
      );
      if (operation) {
        const update = operation.updates.find(u => u._id === id);
        Object.assign(update, data);
      } else {
        this.#batchedOperations.push(
          this.actor.getUpdateChildDocumentsOperation(collection.documentName, [{ _id: id, ...data }]),
        );
      }
    }

    /**
     * Batch all transformation application updates.
     */
    #addBatchUpdatesApplyTransformation() {
      if (!this.actor) { return; }
      this.#addBatchToggleDocuments(true);
    }

    /**
     * Batch all transformation removal updates.
     */
    #addBatchUpdatesRemoveTransformation() {
      if (!this.actor) { return; }
      this.#addBatchToggleDocuments(false);
      if (this.transformation.resets.size) {
        this.#addBatchActorUpdate(this.parent.getFlag("teriock", "preTransform") ?? {});
      }
    }

    /**
     * Filter an array of documents to include only the ones that aren't disabled.
     * @param {(TeriockActiveEffect|TeriockItem)[]} docs
     * @return {(TeriockActiveEffect|TeriockItem)[]}
     */
    #enabledFilter(docs) {
      return docs.filter(d =>
        !foundry.utils.getProperty(d, TERIOCK.config.transformation.suppress[d.type]?.path)
        && d.dependee !== this.parent
      );
    }

    /**
     * Apply all batched operations.
     * @returns {Promise<void>}
     */
    async #modifyBatch() {
      const ops = consolidateWriteOperations(this.#batchedOperations);
      await foundry.documents.modifyBatch(ops);
      this.#batchedOperations = [];
    }

    /**
     * Apply all database modifications for when this is created.
     * @returns {Promise<void>}
     */
    async #modifyOnCreate() {
      await this.#addBatchCreateTransformedSpecies();
      this.#addBatchUpdatesApplyTransformation();
      this.#addBatchActorUpdate({
        "flags.teriock.lastTransformation": this.parent.id,
        "system.transformation.primary": this.parent.id,
        ...this.#resetUpdateData,
      });
      await this.#modifyBatch();
    }

    /**
     * Apply all database modifications for when this is deleted.
     * @returns {Promise<void>}
     */
    async #modifyOnDelete() {
      this.#addBatchUpdatesRemoveTransformation();
      await this.#modifyBatch();
    }

    /**
     * Apply all database modifications for when this is updated.
     * @returns {Promise<void>}
     */
    async #modifyOnUpdate() {
      if (this.parent.disabled) { this.#addBatchUpdatesRemoveTransformation(); }
      else {
        this.#addBatchUpdatesApplyTransformation();
        if (this.transformation.resets.size) { this.#addBatchActorUpdate(this.#resetUpdateData); }
      }
      await this.#modifyBatch();
    }

    /**
     * Map an array of documents to their ids.
     * @param {(TeriockActiveEffect|TeriockItem)[]} docs
     * @return {ID<TeriockActiveEffect|TeriockItem>[]}
     */
    #toIds(docs) {
      return docs.map(d => d.id);
    }

    /**
     * Whether this is the primary transformation.
     * @returns {boolean}
     */
    get isPrimaryTransformation() {
      if (this.actor) { return this.isTransformation && this.actor.system.transformation.primary === this.parent; }
      return this.isTransformation;
    }

    /**
     * Whether this effect is a transformation.
     * @returns {boolean}
     */
    get isTransformation() {
      return this.transformation.enabled;
    }

    /**
     * The primary species this transforms the actor into.
     * @return {TeriockItem<"species"> | null}
     */
    get primarySpecies() {
      if (!this.isTransformation) { return null; }
      return this.transformation.primary ?? this.parent.species[0] ?? null;
    }

    /**
     * Build the flags relevant for applying and undoing this transformation.
     * @returns {object}
     */
    _buildTransformationFlags() {
      const disabledEffects = [];
      const disabledItems = [];
      const disabledStatDiceItems = Object.fromEntries(POOL_STATS.map(stat => [stat, []]));
      const typeMap = this.actor.children.documentsByType;
      for (const t of this.transformation.suppress) {
        if (TERIOCK.config.document[t].documentName === "ActiveEffect") {
          disabledEffects.push(...this.#enabledFilter(typeMap[t] || []));
        }
        if (TERIOCK.config.document[t].documentName === "Item") {
          disabledItems.push(...this.#enabledFilter(typeMap[t] || []));
        }
      }
      const statItems = this.actor.items.contents.filter(i => i.system.metadata.tags.statGiver);
      for (const stat of POOL_STATS) {
        if (this.transformation.resets.has(stat)) {
          disabledStatDiceItems[stat].push(...statItems.filter(i => !i.system.statDice[stat].disabled));
        }
      }
      const preTransform = {};
      for (const r of this.transformation.resets) {
        const update = statConfig[r].transformationReset.update;
        for (const k of Object.keys(update)) { preTransform[k] = foundry.utils.getProperty(this.actor, k); }
      }
      return {
        teriock: {
          disabledEffects: this.#toIds(disabledEffects),
          disabledItems: this.#toIds(disabledItems),
          ...Object.fromEntries(
            POOL_STATS.map(stat => [disabledStatDiceFlag(stat), this.#toIds(disabledStatDiceItems[stat])]),
          ),
          preTransform: foundry.utils.expandObject(preTransform),
        },
      };
    }

    /** @inheritDoc */
    _getTipSuppressions() {
      return Object.assign(super._getTipSuppressions(), { notPrimary: this._isSuppressedTransformation.bind(this) });
    }

    /**
     * If this is suppressed due to not being the primary transformation.
     * @returns {boolean}
     */
    _isSuppressedTransformation() {
      return this.isTransformation && this.actor && !this.isPrimaryTransformation;
    }

    /** @inheritDoc */
    _onCreate(data, options, userId) {
      super._onCreate(data, options, userId);
      if (this.parent.checkEditor(userId) && this.isTransformation && this.actor) { this.#modifyOnCreate(); }
    }

    /** @inheritDoc */
    _onDelete(options, userId) {
      super._onDelete(options, userId);
      if (this.parent.checkEditor(userId) && this.isTransformation && this.actor) { this.#modifyOnDelete(); }
    }

    /** @inheritDoc */
    _onUpdate(changed, options, userId) {
      super._onUpdate(changed, options, userId);
      if (
        this.parent.checkEditor(userId)
        && this.isTransformation
        && this.actor
        && foundry.utils.hasProperty(changed, "disabled")
      ) {
        this.#modifyOnUpdate();
      }
    }

    /** @inheritDoc */
    async _preUpdate(changes, options, user) {
      const yes = await super._preUpdate(changes, options, user);
      if (yes === false) { return false; }

      if (!this.actor || !this.isTransformation) { return; }
      if (foundry.utils.hasProperty(changes, "disabled")) {
        const wasDisabled = changes.disabled === false;
        if (wasDisabled) {
          const flags = foundry.utils.mergeObject(this.parent.flags, this._buildTransformationFlags());
          foundry.utils.setProperty(changes, "flags", flags);
        } else {
          for (const stat of POOL_STATS) {
            foundry.utils.setProperty(
              changes,
              `flags.teriock.${transformationStatFlag(stat)}`,
              this.actor.system[stat].value,
            );
          }
        }
      }
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      return [...super.getEmbedContextMenuEntries(doc), {
        group: "usage",
        icon: makeIcon(TERIOCK.display.icons.manifest.effect.transform, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Species.MENU.setPrimaryTransformation"),
        onClick: this.setPrimaryTransformation.bind(this),
        visible: this.isTransformation && !this.isPrimaryTransformation,
      }];
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), {
        transformation: Number(this.transformation.enabled),
        "transformation.primary": Number(this.isPrimaryTransformation),
      });
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();
      if (this.isTransformation && this.#inheritImg) {
        const s = this.primarySpecies;
        if (s) {
          this.transformation.img ||= s.system.transformation.img;
          this.transformation.ring ??= s.system.transformation.ring;
          this.transformation.ringImg ||= s.system.transformation.ringImg;
        }
      }
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (
        this.isPrimaryTransformation && this.transformation.override.has("art")
        && this.actor?.system.settings.getSetting("autoTransformation")
      ) {
        const changes = [];
        if (typeof this.transformation.ring === "boolean") {
          changes.push({
            key: "token.ring.enabled",
            phase: TERIOCK.config.transformation.tokenChange.phase,
            priority: TERIOCK.config.transformation.tokenChange.priority,
            type: "override",
            value: this.transformation.ring,
          });
        }
        if (this.transformation.img) {
          changes.push({
            key: "token.texture.src",
            phase: TERIOCK.config.transformation.tokenChange.phase,
            priority: TERIOCK.config.transformation.tokenChange.priority,
            type: "override",
            value: this.transformation.img,
          });
        }
        if (this.transformation.ringImg) {
          changes.push({
            key: "token.ring.subject.texture",
            phase: TERIOCK.config.transformation.tokenChange.phase,
            priority: TERIOCK.config.transformation.tokenChange.priority,
            type: "override",
            value: this.transformation.ringImg,
          });
        }
        this.changes.push(...changes);
      }
    }

    /**
     * Set this as the primary transformation, optionally designating a primary species.
     * @param {TeriockItem<"species">|null} [species] Species to set as this transformation's primary.
     * @returns {Promise<void>}
     */
    async setPrimaryTransformation(species = null) {
      if (!this.parent.actor || !this.isTransformation) { return; }
      const operations = [{
        action: "update",
        documentName: this.actor.documentName,
        pack: this.actor?.pack,
        parent: this.actor?.parent,
        updates: [{ _id: this.actor?.id, "system.transformation.primary": this.parent.id }],
      }];
      if (species) {
        operations.push({
          action: "update",
          documentName: this.parent.documentName,
          pack: this.parent.pack,
          parent: this.parent.parent,
          updates: [{ _id: this.parent.id, "system.transformation.primary": species.id }],
        });
      }
      await foundry.documents.modifyBatch(operations);
    }
  }

  return TransformationSystem;
}
