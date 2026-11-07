import { getSystemClass, makeIcon } from "../../../../utils/_module.mjs";
import { migrateRename, migrateThumbnails } from "../../../fields/tools/migrations.mjs";
import { effectTransformationFields } from "../../../fields/tools/transformation-fields.mjs";

const { fields } = foundry.data;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 * @import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 * @import { ActorTransformationPart } from "../../actors/abstract/base-actor-system/parts/transformation-part/actor-transformation-part.mjs";
 * @import { SpeciesTransformationPart } from "../../items/species-system/parts/species-transformation-part/species-transformation-part.mjs";
 */

/**
 * @typedef {object} FlagMap
 * @property {ID<TeriockActiveEffect>[]} disabledEffects
 * @property {ID<TeriockItem>[]} disabledItems
 * @property {ID<TeriockItem>[]} disabledStatDiceItems
 */

const POOL_STATS = Object.keys(TERIOCK.CONFIG.stat).filter(k => TERIOCK.CONFIG.stat[k].pool?.enabled);

/**
 * Actor flag key storing item ids whose stat dice were disabled for a pool stat.
 * @param {Teriock.Keys.DieStat} stat
 * @returns {string}
 */
function disabledStatDiceFlag(stat) {
  return `disabled${stat.capitalize()}DiceItems`;
}

/**
 * Effect data model that handles transformation behavior.
 *
 * Relevant wiki pages:
 * - [Transformed](https://wiki.teriock.com/index.php/Condition:Transformed)
 *
 * @template {MixinBase} T
 * @param {T} Base
 * @see {ActorTransformationPart}
 * @see {SpeciesTransformationPart}
 * @category Transformation
 */
export default function TransformationSystemMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.TransformationSystemData}
   */
  class TransformationSystem
    extends /** @type {InitializedDataModel<T, Teriock.Models.TransformationSystemData>} */ (Base)
  {
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
      migrateThumbnails(source, "transformation.img", "transformation.ringImg");
      migrateRename(source, "transformation.reset", "transformation.resets");
      return super.migrateData(source, options);
    }

    /**
     * Whether this needs to inherit an image.
     * @returns {boolean}
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
        Object.assign(updateData, TERIOCK.CONFIG.stat[r].transformationReset.update);
      }
      return updateData;
    }

    /**
     * Batch an update to the actor itself.
     * @param {DatabaseWriteOperation[]} operations
     * @param {object} data
     */
    #addBatchActorUpdate(operations, data) {
      operations.push({
        action: "update",
        documentName: "Actor",
        pack: this.actor.pack,
        parent: this.actor.parent,
        teriock: { dontDisplayStatChange: true },
        updates: [{ _id: this.actor.id, ...data }],
      });
    }

    /**
     * Pull species data, configure it, and batch it to be added to the actor.
     * @param {DatabaseWriteOperation[]} operations
     * @returns {Promise<ID<TeriockItem>|null>} The ID of the primary species if one is created.
     */
    async #addBatchCreateTransformedSpecies(operations) {
      const uuids = this.transformation.uuids;
      let species = /** @type {TeriockItem<"species">[]} */ await Promise.all(uuids.map(uuid => fromUuid(uuid)));
      species = species.filter(Boolean);
      if (!species.length) { return null; }
      const itemData = /** @type {TeriockItem<"species">[]} */ species.map(s => s.toObject());
      itemData.forEach(s => {
        s._id = foundry.utils.randomID();
        s.system.transformationLevel = this.transformation.level;
        for (const stat of POOL_STATS) {
          s.system.statDice[stat].disabled = !this.transformation.resets.has(stat);
        }
        s.system.competence.raw = this.transformation.competence.raw;
        if (s.system.size.min && s.system.size.max) {
          s.system.size.value = Math.clamp(this.actor.system.size.value, s.system.size.min, s.system.size.max);
        }
      });
      const op = this.parent.getCreateDependentDocumentsOperation("Item", itemData, {
        keepId: true,
        keepSubIds: false,
      });
      if (op) { operations.push(op); }
      return itemData[0]._id;
    }

    /**
     * Batch a toggle update to a document embedded within the actor.
     * @param {DatabaseWriteOperation[]} operations
     * @param {DocumentCollection} collection
     * @param {ID<TeriockActiveEffect|TeriockItem>} id
     * @param {boolean} value
     */
    #addBatchToggle(operations, collection, id, value) {
      const toggle = TERIOCK.CONFIG.transformation.suppress[collection.get(id)?.type]?.path;
      if (!toggle) { return; }
      this.#addBatchUpdateDocument(operations, collection, id, { [toggle]: value });
    }

    /**
     * Batch many update toggles for documents embedded within the actor.
     * @param {DatabaseWriteOperation[]} operations
     * @param {boolean} value
     * @param {object} [flags] - Teriock-scoped flags to read instead of this effect's own.
     */
    #addBatchToggleDocuments(operations, value, flags) {
      const fm = this.#getFlagMap(flags);
      for (const id of fm.disabledItems) { this.#addBatchToggle(operations, this.actor.items, id, value); }
      for (const id of fm.disabledEffects) { this.#addBatchToggle(operations, this.actor.effects, id, value); }
      for (const stat of POOL_STATS) {
        for (const id of fm.disabledStatDiceItems[stat]) {
          this.#addBatchUpdateDocument(operations, this.actor.items, id, {
            [`system.statDice.${stat}.disabled`]: value,
          });
        }
      }
    }

    /**
     * Batch an update to a document embedded within the actor.
     * @param {DatabaseWriteOperation[]} operations
     * @param {DocumentCollection} collection
     * @param {ID<TeriockActiveEffect|TeriockItem>} id
     * @param {object} data
     */
    #addBatchUpdateDocument(operations, collection, id, data) {
      if (!collection.get(id)) { return; }
      const operation = operations.find(op =>
        op.documentName === collection.documentName && op.action === "update" && op.updates?.some(u => u._id === id)
      );
      if (operation) {
        const update = operation.updates.find(u => u._id === id);
        Object.assign(update, data);
      } else {
        operations.push(this.actor.getUpdateChildDocumentsOperation(collection.documentName, [{ _id: id, ...data }]));
      }
    }

    /**
     * Filter an array of documents to include only the ones that aren't disabled.
     * @param {(TeriockActiveEffect|TeriockItem)[]} docs
     * @returns {(TeriockActiveEffect|TeriockItem)[]}
     */
    #enabledFilter(docs) {
      return docs.filter(d =>
        !foundry.utils.getProperty(d, TERIOCK.CONFIG.transformation.suppress[d.type]?.path)
        && d.dependee !== this.parent
      );
    }

    /**
     * @param {object} [flags] - Teriock-scoped flags to read instead of this effect's own.
     * @returns {FlagMap}
     */
    #getFlagMap(flags = this.parent.flags.teriock ?? {}) {
      const hasItem = id => {
        const item = this.actor.items.get(id);
        return item && (item.dependee || !item.system._dep);
      };
      const hasEffect = id => this.actor.effects.has(id);
      return {
        disabledEffects: (flags.disabledEffects ?? []).filter(hasEffect),
        disabledItems: (flags.disabledItems ?? []).filter(hasItem),
        disabledStatDiceItems: Object.fromEntries(
          POOL_STATS.map(stat => [stat, (flags[disabledStatDiceFlag(stat)] ?? []).filter(hasItem)]),
        ),
      };
    }

    /**
     * Map an array of documents to their ids.
     * @param {(TeriockActiveEffect|TeriockItem)[]} docs
     * @returns {ID<TeriockActiveEffect|TeriockItem>[]}
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
     * @returns {TeriockItem<"species"> | null}
     */
    get primarySpecies() {
      if (!this.isTransformation) { return null; }
      return this.transformation.primary ?? this.parent.previewedTypes.species[0] ?? null;
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
        const documentName = getSystemClass(t)?.metadata.documentName;
        if (documentName === "ActiveEffect") {
          disabledEffects.push(...this.#enabledFilter(typeMap[t] || []));
        }
        if (documentName === "Item") {
          disabledItems.push(...this.#enabledFilter(typeMap[t] || []));
        }
      }
      const statItems = this.actor.items.filter(i => i.system.metadata.tags.statGiver);
      for (const stat of POOL_STATS) {
        if (this.transformation.resets.has(stat)) {
          disabledStatDiceItems[stat].push(...statItems.filter(i => !i.system.statDice[stat].disabled));
        }
      }
      const preTransform = { attributes: this.actor.system.toObject(false).attributes };
      for (const r of this.transformation.resets) {
        const update = TERIOCK.CONFIG.stat[r].transformationReset.update;
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
    async _preUpdate(changes, options, user) {
      const yes = await super._preUpdate(changes, options, user);
      if (yes === false) { return false; }

      if (!this.actor || !this.isTransformation) { return; }
      if (changes.disabled === false && this.parent._source.disabled) {
        changes.flags = foundry.utils.mergeObject(changes.flags ?? {}, this._buildTransformationFlags());
      }
    }

    /**
     * Operations that first apply this transformation to its actor.
     * @returns {Promise<DatabaseWriteOperation[]>}
     */
    async getCreateTransformationOperations() {
      const operations = [];
      const flags = this._buildTransformationFlags();
      const update = { _id: this.parent.id, flags, "system.transformation.uuids": [] };
      const primary = await this.#addBatchCreateTransformedSpecies(operations);
      if (primary) { update["system.transformation.primary"] = primary; }
      operations.push(this.actor.getUpdateChildDocumentsOperation("ActiveEffect", [update]));
      this.#addBatchToggleDocuments(operations, true, flags.teriock);
      this.#addBatchActorUpdate(operations, {
        "system.transformation.primary": this.parent.id,
        ...this.#resetUpdateData,
      });
      return operations;
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      return [...super.getEmbedContextMenuEntries(doc), {
        group: "usage",
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.effect.transform, "contextMenu"),
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

    /**
     * Operations that apply or remove this transformation on its actor.
     * @param {boolean} active
     * @returns {DatabaseWriteOperation[]}
     */
    getTransformationOperations(active) {
      const operations = [];
      this.#addBatchToggleDocuments(operations, active);
      if (this.transformation.resets.size) {
        this.#addBatchActorUpdate(
          operations,
          active ? this.#resetUpdateData : { system: this.parent.getFlag("teriock", "preTransform.system") ?? {} },
        );
      }
      return operations;
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
      if (!this.isPrimaryTransformation) { return; }
      const { attribute, size, token } = TERIOCK.CONFIG.transformation.changes;
      for (const a of Object.keys(TERIOCK.CONFIG.attribute)) {
        if (!this.transformation.attributes.has(a)) {
          const value = foundry.utils.getProperty(this.parent, `flags.teriock.preTransform.attributes.${a}`);
          if (value) { this.changes.push({ key: `system.attributes.${a}`, ...attribute, type: "override", value }); }
        }
      }
      if (this.transformation.override.has("art") && this.actor?.system.settings.getSetting("autoTransformation")) {
        if (typeof this.transformation.ring === "boolean") {
          this.changes.push({ key: "token.ring.enabled", ...token, type: "override", value: this.transformation.ring });
        }
        if (this.transformation.img) {
          this.changes.push({ key: "token.texture.src", ...token, type: "override", value: this.transformation.img });
        }
        if (this.transformation.ringImg) {
          this.changes.push({
            key: "token.ring.subject.texture",
            ...token,
            type: "override",
            value: this.transformation.ringImg,
          });
        }
      }
      const value = this.primarySpecies?.system.size.value;
      if (this.transformation.override.has("size") && value) {
        this.changes.push({ key: "system.size.value", ...size, type: "override", value });
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
