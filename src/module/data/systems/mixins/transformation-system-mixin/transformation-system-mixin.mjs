import statConfig from "../../../../constants/config/stat-config.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { consolidateWriteOperations } from "../../../../helpers/utils.mjs";
import { effectTransformationFields } from "../../../fields/tools/transformation-fields.mjs";

const { fields } = foundry.data;

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
 * @param {typeof ChildSystem} Base
 */
export default function TransformationSystemMixin(Base) {
  return (
    /**
     * @extends {ChildSystem}
     * @extends {Teriock.Models.TransformationSystemData}
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

      /**
       * Batched operations waiting to be applied to the database.
       * @type {DatabaseWriteOperation[]}
       */
      #batchedOperations = [];

      /**
       * @returns {{
       *  disabledEffects: ID<AnyActiveEffect>[],
       *  disabledItems: ID<AnyItem>[],
       *  disabledStatDiceItems: Record<Teriock.Keys.DieStat, ID<AnyItem>[]>
       * }}
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
       * Reset update data.
       * @returns {object}
       */
      get #resetUpdateData() {
        const updateData = {};
        for (const r of this.transformation.reset) {
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
        let species = /** @type {TeriockSpecies[]} */ await Promise.all(uuids.map(uuid => fromUuid(uuid)));
        species = species.filter(s => s);
        if (!species.length) { return; }
        const itemData = /** @type {TeriockSpecies[]} */ species.map(s => s.toObject());
        itemData.forEach(s => {
          s.system.transformationLevel = this.transformation.level;
          for (const stat of POOL_STATS) {
            s.system.statDice[stat].disabled = !this.transformation.reset.has(stat);
          }
          s.system.competence.raw = this.transformation.competence.value;
          if (s.system.size.min && s.system.size.max) {
            s.system.size.value = Math.clamp(this.actor.system.size.value, s.system.size.min, s.system.size.max);
          }
        });
        const op = this.parent.getCreateDependentDocumentsOperation("Item", itemData);
        if (op) { this.#batchedOperations.push(op); }
      }

      /**
       * Batch a toggle update to a document embedded within the actor.
       * @param {DocumentCollection} collection
       * @param {ID<AnyChildDocument>} id
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
       * @param {ID<AnyChildDocument>} id
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
        if (this.transformation.reset.size) {
          this.#addBatchActorUpdate(this.parent.getFlag("teriock", "preTransform") ?? {});
        }
      }

      /**
       * Filter an array of documents to include only the ones that aren't disabled.
       * @param {AnyChildDocument[]} docs
       * @return {AnyChildDocument[]}
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
          if (this.transformation.reset.size) { this.#addBatchActorUpdate(this.#resetUpdateData); }
        }
        await this.#modifyBatch();
      }

      /**
       * Map an array of documents to their ids.
       * @param {AnyChildDocument[]} docs
       * @return {ID<AnyChildDocument>[]}
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
       * @return {TeriockSpecies | null}
       */
      get primarySpecies() {
        return this.isTransformation ? this.parent.species[0] : null;
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
        const statItems = this.actor.items.contents.filter(i => i.system.metadata.stats);
        for (const stat of POOL_STATS) {
          if (this.transformation.reset.has(stat)) {
            disabledStatDiceItems[stat].push(...statItems.filter(i => !i.system.statDice[stat].disabled));
          }
        }
        const preTransform = {};
        for (const r of this.transformation.reset) {
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
      getCardContextMenuEntries(doc) {
        return [...super.getCardContextMenuEntries(doc), {
          group: "usage",
          icon: makeIcon(TERIOCK.display.icons.effect.transform, "contextMenu"),
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
        if (this.isTransformation) {
          if (this.actor && !this.transformation.img) {
            for (const s of this.parent.species) {
              if (s.system.transformation.img && !this.transformation.img) {
                this.transformation.img = s.system.transformation.img;
                this.transformation.ring = s.system.transformation.ring;
              }
            }
          }
        }
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (
          this.isPrimaryTransformation && this.actor?.system.settings.getSetting("autoTransformation")
          && this.transformation.img
        ) {
          this.changes.push(...[{
            key: "token.texture.src",
            phase: "initial",
            priority: 5,
            type: "override",
            value: this.transformation.img,
          }, {
            key: "token.ring.subject.texture",
            phase: "initial",
            priority: 5,
            type: "override",
            value: this.transformation.img,
          }, {
            key: "token.ring.enabled",
            phase: "initial",
            priority: 5,
            type: "override",
            value: this.transformation.ring,
          }]);
        }
      }

      /**
       * Set this is the primary transformation.
       * @returns {Promise<void>}
       */
      async setPrimaryTransformation() {
        if (this.parent.actor && this.isTransformation) {
          await this.parent.actor.update({ "system.transformation.primary": this.parent.id });
        }
      }
    }
  );
}
