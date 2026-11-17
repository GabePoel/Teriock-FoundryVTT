import { getSystemClass, makeIcon, mergeMetadata } from "../../../../utils/_module.mjs";
import { effectMorphFields } from "../../../fields/tools/morph-fields.mjs";

const { fields } = foundry.data;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 * @import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 * @import { ActorMorphPart } from "../../actors/abstract/base-actor-system/parts/morph-part/actor-morph-part.mjs";
 * @import { SpeciesMorphPart } from "../../items/species-system/parts/species-morph-part/species-morph-part.mjs";
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
 * @remarks IDK if using using the stats as part of the string is really that robust but it works for now.
 */
function disabledStatDiceFlag(stat) {
  return `disabled${stat.capitalize()}DiceItems`;
}

/**
 * Effect data model that handles morph behavior.
 *
 * Relevant wiki pages:
 * - [Transformed](https://wiki.teriock.com/index.php/Condition:Transformed)
 *
 * @template {MixinBase} T
 * @param {T} Base
 * @see {ActorMorphPart}
 * @see {SpeciesMorphPart}
 * @category Morph
 */
export default function MorphSystemMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.MorphSystemData}
   */
  class MorphSystem extends /** @type {InitializedDataModel<T, Teriock.Models.MorphSystemData>} */ (Base) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SCHEMA.Morph"];

    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, { tags: { morph: true } });

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { morph: new fields.SchemaField(effectMorphFields()) });
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      foundry.abstract.Document._addDataFieldMigration(source, "transformation", "morph");
      foundry.abstract.Document._addDataFieldMigration(
        source,
        "morph.level",
        "transformationLevel",
        d => ["minor", "full", "greater"].indexOf(d.morph.level) + 1,
      );
      return super.migrateData(source, options);
    }

    /**
     * Whether this needs to inherit an image.
     * @returns {boolean}
     */
    get #inheritImg() {
      return this.actor && (!this.morph.img || this.morph.ring && !this.morph.ringImg);
    }

    /**
     * Reset update data.
     * @returns {object}
     */
    get #resetUpdateData() {
      const updateData = {};
      for (const r of this.morph.resets) {
        Object.assign(updateData, TERIOCK.CONFIG.stat[r].morphReset.update);
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
     * Batch a toggle update to a document embedded within the actor.
     * @param {DatabaseWriteOperation[]} operations
     * @param {DocumentCollection} collection
     * @param {ID<TeriockActiveEffect|TeriockItem>} id
     * @param {boolean} value
     */
    #addBatchToggle(operations, collection, id, value) {
      const toggle = TERIOCK.CONFIG.morph.suppress[collection.get(id)?.type]?.path;
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
        !foundry.utils.getProperty(d, TERIOCK.CONFIG.morph.suppress[d.type]?.path) && d.dependee !== this.parent
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
     * Whether this effect is a morph.
     * @returns {boolean}
     */
    get isMorph() {
      return this.morph.enabled;
    }

    /**
     * Whether this is the primary morph.
     * @returns {boolean}
     */
    get isPrimaryMorph() {
      if (this.actor) { return this.isMorph && this.actor.system.morph.primary === this.parent; }
      return this.isMorph;
    }

    /**
     * The primary species this morphs the actor into.
     * @returns {TeriockItem<"species"> | null}
     */
    get primarySpecies() {
      if (!this.isMorph) { return null; }
      return this.morph.primary ?? this.parent.previewedTypes.species[0] ?? null;
    }

    /**
     * Build the flags relevant for applying and undoing this morph.
     * @returns {object}
     */
    _buildMorphFlags() {
      const disabledEffects = [];
      const disabledItems = [];
      const disabledStatDiceItems = Object.fromEntries(POOL_STATS.map(stat => [stat, []]));
      const typeMap = this.actor.children.documentsByType;
      for (const t of this.morph.suppress) {
        const documentName = getSystemClass(t)?.metadata.documentName;
        if (documentName === "ActiveEffect") {
          disabledEffects.push(...this.#enabledFilter(typeMap[t] || []));
        }
        if (documentName === "Item") {
          disabledItems.push(...this.#enabledFilter(typeMap[t] || []));
        }
      }
      const stattedItems = this.actor.items.filter(i => i.system.metadata.tags.statted);
      for (const stat of POOL_STATS) {
        if (this.morph.resets.has(stat)) {
          disabledStatDiceItems[stat].push(...stattedItems.filter(i => !i.system.statDice[stat].disabled));
        }
      }
      const preMorph = { attributes: this.actor.system.toObject(false).attributes };
      for (const r of this.morph.resets) {
        const update = TERIOCK.CONFIG.stat[r].morphReset.update;
        for (const k of Object.keys(update)) { preMorph[k] = foundry.utils.getProperty(this.actor, k); }
      }
      return {
        teriock: {
          disabledEffects: this.#toIds(disabledEffects),
          disabledItems: this.#toIds(disabledItems),
          ...Object.fromEntries(
            POOL_STATS.map(stat => [disabledStatDiceFlag(stat), this.#toIds(disabledStatDiceItems[stat])]),
          ),
          preMorph: foundry.utils.expandObject(preMorph),
        },
      };
    }

    /** @inheritDoc */
    _getTipSuppressions() {
      return Object.assign(super._getTipSuppressions(), { notPrimary: this._isSuppressedMorph.bind(this) });
    }

    /**
     * If this is suppressed due to not being the primary morph.
     * @returns {boolean}
     */
    _isSuppressedMorph() {
      return this.isMorph && this.actor && !this.isPrimaryMorph;
    }

    /** @inheritDoc */
    async _preUpdate(changes, options, user) {
      const yes = await super._preUpdate(changes, options, user);
      if (yes === false) { return false; }

      if (!this.actor || !this.isMorph) { return; }
      if (changes.disabled === false && this.parent._source.disabled) {
        changes.flags = foundry.utils.mergeObject(changes.flags ?? {}, this._buildMorphFlags());
      }
    }

    /** @inheritDoc */
    async getChildrenData() {
      const childrenData = await super.getChildrenData();
      if (!this.isMorph) { return childrenData; }
      for (const s of childrenData.Item.filter(d => d.type === "species")) {
        for (const stat of POOL_STATS) {
          s.system.statDice[stat].disabled = !this.morph.resets.has(stat);
        }
        s.system.competence.raw = this.morph.competence.raw;
        if (s.system.size.min && s.system.size.max) {
          s.system.size.value = Math.clamp(this.actor.system.size.value, s.system.size.min, s.system.size.max);
        }
      }
      return childrenData;
    }

    /** @inheritDoc */
    async getCreateOperations(data = []) {
      const operations = await super.getCreateOperations(data);
      if (!this.isMorph) { return operations; }
      const flags = this._buildMorphFlags();
      operations.push(this.actor.getUpdateChildDocumentsOperation("ActiveEffect", [{ _id: this.parent.id, flags }]));
      this.#addBatchToggleDocuments(operations, true, flags.teriock);
      this.#addBatchActorUpdate(operations, { "system.morph.primary": this.parent.id, ...this.#resetUpdateData });
      return operations;
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      return [...super.getEmbedContextMenuEntries(doc), {
        group: "usage",
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.effect.morph, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Species.MENU.setPrimaryMorph"),
        onClick: this.setPrimaryMorph.bind(this),
        visible: this.isMorph && !this.isPrimaryMorph,
      }];
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), {
        morph: Number(this.morph.enabled),
        "morph.primary": Number(this.isPrimaryMorph),
      });
    }

    /**
     * Operations that apply or remove this morph on its actor.
     * @param {boolean} active
     * @returns {DatabaseWriteOperation[]}
     */
    getMorphOperations(active) {
      const operations = [];
      this.#addBatchToggleDocuments(operations, active);
      if (this.morph.resets.size) {
        this.#addBatchActorUpdate(
          operations,
          active ? this.#resetUpdateData : { system: this.parent.getFlag("teriock", "preMorph.system") ?? {} },
        );
      }
      return operations;
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();
      if (this.isMorph && this.#inheritImg) {
        const s = this.primarySpecies;
        if (s) {
          this.morph.img ||= s.system.morph.img;
          this.morph.ring ??= s.system.morph.ring;
          this.morph.ringImg ||= s.system.morph.ringImg;
        }
      }
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (!this.isPrimaryMorph) { return; }
      const { attribute, size, token } = TERIOCK.CONFIG.morph.changes;
      for (const a of Object.keys(TERIOCK.CONFIG.attribute)) {
        if (!this.morph.attributes.has(a)) {
          const value = foundry.utils.getProperty(this.parent, `flags.teriock.preMorph.attributes.${a}`);
          if (value) { this.changes.push({ key: `system.attributes.${a}`, ...attribute, type: "override", value }); }
        }
      }
      if (this.morph.override.has("art") && this.actor?.system.settings.getSetting("autoMorph")) {
        if (typeof this.morph.ring === "boolean") {
          this.changes.push({ key: "token.ring.enabled", ...token, type: "override", value: this.morph.ring });
        }
        if (this.morph.img) {
          this.changes.push({ key: "token.texture.src", ...token, type: "override", value: this.morph.img });
        }
        if (this.morph.ringImg) {
          this.changes.push({
            key: "token.ring.subject.texture",
            ...token,
            type: "override",
            value: this.morph.ringImg,
          });
        }
      }
      const value = this.primarySpecies?.system.size.value;
      if (this.morph.override.has("size") && value) {
        this.changes.push({ key: "system.size.value", ...size, type: "override", value });
      }
    }

    /**
     * Set this as the primary morph.
     * @param {TeriockItem<"species">|null} [species] Species to set as this morph's primary.
     * @returns {Promise<void>}
     */
    async setPrimaryMorph(species = null) {
      if (!this.parent.actor || !this.isMorph) { return; }
      const operations = [{
        action: "update",
        documentName: this.actor.documentName,
        pack: this.actor?.pack,
        parent: this.actor?.parent,
        updates: [{ _id: this.actor?.id, "system.morph.primary": this.parent.id }],
      }];
      if (species) {
        operations.push({
          action: "update",
          documentName: this.parent.documentName,
          pack: this.parent.pack,
          parent: this.parent.parent,
          updates: [{ _id: this.parent.id, "system.morph.primary": species.id }],
        });
      }
      await foundry.documents.modifyBatch(operations);
    }
  }

  return MorphSystem;
}
