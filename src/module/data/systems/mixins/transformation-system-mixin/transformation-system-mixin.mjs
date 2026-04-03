import { makeIcon } from "../../../../helpers/utils.mjs";
import { effectTransformationFields } from "../../../fields/helpers/transformation-fields.mjs";

const { fields } = foundry.data;

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
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SCHEMA.Transformation",
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          transformation: new fields.SchemaField(effectTransformationFields()),
        });
      }

      /**
       * @returns {{
       *  disabledEffects: ID<AnyActiveEffect>[],
       *  disabledItems: ID<AnyItem>[],
       *  disabledHpDiceItems: ID<AnyItem>[],
       *  disabledMpDiceItems: ID<AnyItem>[]
       * }}
       */
      get #flagMap() {
        const hasItem = (id) => this.actor.items.has(id);
        const hasEffect = (id) => this.actor.effects.has(id);
        return {
          disabledEffects: (
            this.parent.getFlag("teriock", "disabledEffects") ?? []
          ).filter(hasEffect),
          disabledItems: (
            this.parent.getFlag("teriock", "disabledItems") ?? []
          ).filter(hasItem),
          disabledHpDiceItems: (
            this.parent.getFlag("teriock", "disabledHpDiceItems") ?? []
          ).filter(hasItem),
          disabledMpDiceItems: (
            this.parent.getFlag("teriock", "disabledMpDiceItems") ?? []
          ).filter(hasItem),
        };
      }

      /**
       * Reset update data.
       * @returns {object}
       */
      get #resetUpdateData() {
        const updateData = {};
        for (const r of this.transformation.reset) {
          Object.assign(
            updateData,
            TERIOCK.options.transformation.reset[r].update,
          );
        }
        return updateData;
      }

      /**
       * Whether this is the primary transformation.
       * @returns {boolean}
       */
      get isPrimaryTransformation() {
        if (this.actor) {
          return (
            this.isTransformation &&
            this.actor.system.transformation.primary === this.parent
          );
        } else {
          return this.isTransformation;
        }
      }

      /**
       * Whether this effect is a transformation.
       * @returns {boolean}
       */
      get isTransformation() {
        return this.transformation.enabled;
      }

      /** @inheritDoc */
      get makeSuppressed() {
        let suppressed = super.makeSuppressed;
        if (this.isTransformation && this.parent.actor) {
          suppressed = suppressed || !this.isPrimaryTransformation;
        }
        return suppressed;
      }

      /**
       * The primary species this transforms the actor into.
       * @return {TeriockSpecies | null}
       */
      get primarySpecies() {
        return this.isTransformation ? this.parent.species[0] : null;
      }

      /**
       * Add a document toggle to the update data array.
       * @param {Record<ID<AnyChildDocument>, object>} updatesById
       * @param {DocumentCollection} collection
       * @param {ID<AnyChildDocument>} id
       * @param {boolean} value
       */
      #applyToggle(updatesById, collection, id, value) {
        const toggle =
          TERIOCK.options.transformation.suppress[collection.get(id)?.type]
            ?.path;
        if (toggle) {
          if (!updatesById[id]) updatesById[id] = { _id: id };
          updatesById[id][toggle] = value;
        }
      }

      /**
       * Filter an array of documents to include only the ones that aren't disabled.
       * @param {AnyChildDocument[]} docs
       * @return {AnyChildDocument[]}
       */
      #enabledFilter(docs) {
        return docs.filter(
          (d) =>
            !foundry.utils.getProperty(
              d,
              TERIOCK.options.transformation.suppress[d.type]?.path,
            ) && d.dependee !== this.parent,
        );
      }

      /**
       * Map an array of documents to their ids.
       * @param {AnyChildDocument[]} docs
       * @return {ID<AnyChildDocument>[]}
       */
      #toIds(docs) {
        return docs.map((d) => d.id);
      }

      /**
       * Toggle all documents that this would force on/off to some state.
       * @param {boolean} value
       * @returns {Promise<void>}
       */
      async #toggleDocuments(value) {
        if (!this.actor) return;
        const fm = this.#flagMap;

        /** @type {Record<ID<AnyItem>, object>} */
        const itemUpdatesById = {};
        /** @type {Record<ID<AnyActiveEffect>, object>} */
        const effectUpdatesById = {};
        for (const id of fm.disabledItems) {
          this.#applyToggle(itemUpdatesById, this.actor.items, id, value);
        }
        for (const id of fm.disabledEffects) {
          this.#applyToggle(effectUpdatesById, this.actor.effects, id, value);
        }
        for (const id of fm.disabledHpDiceItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.statDice.hp.disabled"] = value;
        }
        for (const id of fm.disabledMpDiceItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.statDice.mp.disabled"] = value;
        }
        const itemUpdates = Object.values(itemUpdatesById).filter((u) =>
          this.actor.items.get(u._id),
        );
        const effectUpdates = Object.values(effectUpdatesById).filter((u) =>
          this.actor.effects.get(u._id),
        );
        if (itemUpdates.length) {
          await this.actor.updateEmbeddedDocuments("Item", itemUpdates);
        }
        if (effectUpdates.length) {
          await this.actor.updateEmbeddedDocuments(
            "ActiveEffect",
            effectUpdates,
          );
        }
      }

      /**
       * Apply transformation suppression and stat-dice updates using flags built by {@link _buildTransformationFlags}.
       * @returns {Promise<void>}
       */
      async _applyTransformationUpdates() {
        if (!this.actor) return;
        await this.#toggleDocuments(true);
      }

      /**
       * Build the flags relevant for applying and undoing this transformation.
       * @returns {object}
       */
      _buildTransformationFlags() {
        let disabledEffects = [];
        let disabledItems = [];
        const disabledHpDiceItems = [];
        const disabledMpDiceItems = [];
        const typeMap = this.actor.children.typeMap;
        for (const t of this.transformation.suppress) {
          if (TERIOCK.options.document[t].doc === "ActiveEffect") {
            disabledEffects.push(...this.#enabledFilter(typeMap[t] || []));
          }
          if (TERIOCK.options.document[t].doc === "Item") {
            disabledItems.push(...this.#enabledFilter(typeMap[t] || []));
          }
        }
        const statItems = this.actor.items.contents.filter(
          (i) => i.system.metadata.stats,
        );
        if (this.transformation.reset.has("hp")) {
          disabledHpDiceItems.push(
            ...statItems.filter((i) => !i.system.statDice.hp.disabled),
          );
        }
        if (this.transformation.reset.has("mp")) {
          disabledMpDiceItems.push(
            ...statItems.filter((i) => !i.system.statDice.mp.disabled),
          );
        }
        const preTransform = {};
        for (const r of this.transformation.reset) {
          const update = TERIOCK.options.transformation.reset[r].update;
          for (const k of Object.keys(update)) {
            preTransform[k] = foundry.utils.getProperty(this.actor, k);
          }
        }
        return {
          teriock: {
            disabledEffects: this.#toIds(disabledEffects),
            disabledHpDiceItems: this.#toIds(disabledHpDiceItems),
            disabledItems: this.#toIds(disabledItems),
            disabledMpDiceItems: this.#toIds(disabledMpDiceItems),
            preTransform: foundry.utils.expandObject(preTransform),
          },
        };
      }

      /** @inheritDoc */
      _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        if (
          !this.parent.checkEditor(userId) ||
          !this.isTransformation ||
          !this.actor
        ) {
          return;
        }
        this._applyTransformationUpdates();
        const actor = this.parent.actor;
        const updateData = {
          "system.transformation.primary": this.parent.id,
          "flags.teriock.lastTransformation": this.parent.id,
          ...this.#resetUpdateData,
        };
        actor.update(updateData);
      }

      /** @inheritDoc */
      _onDelete(options, userId) {
        super._onDelete(options, userId);
        if (
          this.parent.checkEditor(userId) &&
          this.isTransformation &&
          this.actor
        ) {
          this._removeTransformationUpdates();
        }
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (
          !this.parent.checkEditor(userId) ||
          !this.isTransformation ||
          !this.actor
        ) {
          return;
        }
        if (foundry.utils.hasProperty(changed, "disabled")) {
          if (this.parent.disabled) {
            this._removeTransformationUpdates();
          } else {
            this._applyTransformationUpdates().then(() => {
              if (this.transformation.reset.size) {
                this.actor.update(this.#resetUpdateData);
              }
            });
          }
        }
      }

      /** @inheritDoc */
      async _preCreate(data, options, user) {
        const yes = await super._preCreate(data, options, user);
        if (yes === false) return false;

        if (this.isTransformation && this.actor) {
          const uuids = this.transformation.uuids;
          const flags = this._buildTransformationFlags();
          this.parent.updateSource({ flags });
          let species = /** @type {TeriockSpecies[]} */ await Promise.all(
            uuids.map((uuid) => fromUuid(uuid)),
          );
          species = species.filter((s) => s);
          if (species) {
            const itemData = /** @type {TeriockSpecies[]} */ species.map((s) =>
              s.toObject(),
            );
            itemData.forEach((s) => {
              s.system._dep = this.parent.id;
              s.system.transformationLevel = this.transformation.level;
              s.system.statDice.hp.disabled =
                !this.transformation.reset.has("hp");
              s.system.statDice.mp.disabled =
                !this.transformation.reset.has("mp");
              s.system.competence.raw = this.transformation.competence.value;
              if (s.system.size.min && s.system.size.max) {
                s.system.size.value = Math.clamp(
                  this.parent.actor.system.size.number.value,
                  s.system.size.min,
                  s.system.size.max,
                );
              }
            });
            await this.actor.createEmbeddedDocuments("Item", itemData);
          }
        }
      }

      /** @inheritDoc */
      async _preUpdate(changes, options, user) {
        const yes = await super._preUpdate(changes, options, user);
        if (yes === false) return false;

        if (!this.actor || !this.isTransformation) return;
        if (foundry.utils.hasProperty(changes, "disabled")) {
          const wasDisabled = changes.disabled === false;
          if (wasDisabled) {
            const flags = foundry.utils.mergeObject(
              this.parent.flags,
              this._buildTransformationFlags(),
            );
            foundry.utils.setProperty(changes, "flags", flags);
          } else {
            foundry.utils.setProperty(
              changes,
              "flags.teriock.transformationHp",
              this.actor.system.hp.value,
            );
            foundry.utils.setProperty(
              changes,
              "flags.teriock.transformationMp",
              this.actor.system.mp.value,
            );
          }
        }
      }

      /**
       * Remove transformation suppression and stat-dice updates using flags built by {@link _buildTransformationFlags}.
       * @returns {Promise<void>}
       */
      async _removeTransformationUpdates() {
        if (!this.actor) return;
        await this.#toggleDocuments(false);
        if (this.transformation.reset.size) {
          await this.actor.update(
            this.parent.getFlag("teriock", "preTransform") ?? {},
          );
        }
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.Species.MENU.setPrimaryTransformation",
            ),
            icon: makeIcon(
              TERIOCK.display.icons.effect.transform,
              "contextMenu",
            ),
            callback: this.setPrimaryTransformation.bind(this),
            condition: this.isTransformation && !this.isPrimaryTransformation,
            group: "usage",
          },
        ];
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

      /**
       * Set this is the primary transformation.
       * @returns {Promise<void>}
       */
      async setPrimaryTransformation() {
        if (this.parent.actor && this.isTransformation) {
          await this.parent.actor.update({
            "system.transformation.primary": this.parent.id,
          });
        }
      }
    }
  );
}
