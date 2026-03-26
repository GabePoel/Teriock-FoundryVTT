import { makeIcon } from "../../../../helpers/utils.mjs";
import { transformationField } from "../../../fields/helpers/builders.mjs";

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
          transformation: transformationField({
            implementation: true,
          }),
        });
      }

      /**
       * @returns {{
       *  stashedEquipment: TeriockEquipment[],
       *  disabledEffects: AnyActiveEffect[],
       *  disabledItems: AnyItem[],
       *  disabledHpDiceItems: AnyItem[],
       *  disabledMpDiceItems: AnyItem[]
       * }}
       */
      get #flagMap() {
        const hasItem = (id) => this.actor.items.has(id);
        const hasEffect = (id) => this.actor.effects.has(id);
        return {
          stashedEquipment: (
            this.parent.getFlag("teriock", "stashedEquipment") ?? []
          ).filter(hasItem),
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
       * Whether this is the primary transformation.
       * @returns {boolean}
       */
      get isPrimaryTransformation() {
        if (this.actor) {
          return (
            this.isTransformation &&
            this.actor.system.transformation.primary === this.parent.id
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
       * Filter an array of documents to include only the ones that aren't disabled.
       * @param {AnyChildDocument[]} docs
       * @return {AnyChildDocument[]}
       */
      #enabledFilter(docs) {
        return docs.filter((d) => !d.disabled);
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
       * Apply transformation suppression and stat-dice updates using flags built by {@link _buildTransformationFlags}.
       * @returns {Promise<void>}
       */
      async _applyTransformationUpdates() {
        if (!this.actor) return;
        const fm = this.#flagMap;

        /** @type {Record<string, object>} */
        const itemUpdatesById = {};
        for (const id of fm.stashedEquipment) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.stashed"] = true;
        }
        for (const id of fm.disabledItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.disabled"] = true;
        }
        for (const id of fm.disabledHpDiceItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.statDice.hp.disabled"] = true;
        }
        for (const id of fm.disabledMpDiceItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.statDice.mp.disabled"] = true;
        }
        const itemUpdates = Object.values(itemUpdatesById);

        const effectUpdates = fm.disabledEffects.map((id) => ({
          _id: id,
          disabled: true,
        }));

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
       * Build the flags relevant for applying and undoing this transformation.
       * @returns {object}
       */
      _buildTransformationFlags() {
        const stashedEquipment = [];
        let disabledEffects = [];
        let disabledItems = [];
        const disabledHpDiceItems = [];
        const disabledMpDiceItems = [];

        const typeMap = this.actor.children.typeMap;
        if (this.transformation.suppression.equipment) {
          stashedEquipment.push(
            ...(typeMap.equipment?.filter((e) => !e.system.stashed) || []),
          );
        }
        if (this.transformation.suppression.fluencies) {
          disabledEffects.push(...this.#enabledFilter(typeMap.fluency || []));
        }
        disabledEffects = disabledEffects.filter(
          (e) => e.dependee !== this.parent,
        );

        if (this.transformation.suppression.bodyParts) {
          disabledItems.push(...this.#enabledFilter(typeMap.body || []));
        }
        if (this.transformation.suppression.ranks) {
          disabledItems.push(...this.#enabledFilter(typeMap.rank || []));
        }
        disabledItems.push(...this.#enabledFilter(typeMap.species || []));
        disabledItems = disabledItems.filter((i) => i.dependee !== this.parent);

        const statItems = this.actor.items.contents.filter(
          (i) => i.system.metadata.stats,
        );
        if (this.transformation.resetHp) {
          disabledHpDiceItems.push(
            ...statItems.filter((i) => !i.system.statDice.hp.disabled),
          );
        }
        if (this.transformation.resetMp) {
          disabledMpDiceItems.push(
            ...statItems.filter((i) => !i.system.statDice.mp.disabled),
          );
        }

        return {
          teriock: {
            disabledEffects: this.#toIds(disabledEffects),
            disabledHpDiceItems: this.#toIds(disabledHpDiceItems),
            disabledItems: this.#toIds(disabledItems),
            disabledMpDiceItems: this.#toIds(disabledMpDiceItems),
            stashedEquipment: this.#toIds(stashedEquipment),
            preTransformHp: this.actor.system.hp.value,
            preTransformMp: this.actor.system.mp.value,
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
        };
        // This high number is included because just setting to `system.hp.max` or `system.mp.max` uses the former
        // values. This requires explicit filtering when rendering numbers on the actor's tokens.
        if (this.transformation.resetHp) {
          updateData["system.hp.value"] = 99999999;
        }
        if (this.transformation.resetMp) {
          updateData["system.mp.value"] = 99999999;
        }
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
              if (this.transformation.resetHp || this.transformation.resetMp) {
                const updateData = {};
                if (this.transformation.resetHp) {
                  updateData["system.hp.value"] = this.parent.getFlag(
                    "teriock",
                    "transformationHp",
                  );
                }
                if (this.transformation.resetMp) {
                  updateData["system.mp.value"] = this.parent.getFlag(
                    "teriock",
                    "transformationMp",
                  );
                }
                if (Object.keys(updateData).length && this.actor) {
                  return this.actor.update(updateData);
                }
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
              if (this.transformation.level !== "greater") {
                s.system.statDice.mp.disabled = true;
                s.system.proficient = false;
              }
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
       * Revert transformation suppression and stat-dice updates using flags from
       * _buildTransformationFlags. Unstashes equipment, re-enables effects/items,
       * and re-enables hp/mp stat dice.
       * @returns {Promise<void>}
       */
      async _removeTransformationUpdates() {
        if (!this.actor) return;
        const fm = this.#flagMap;

        /** @type {Record<string, object>} */
        const itemUpdatesById = {};
        for (const id of fm.stashedEquipment) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.stashed"] = false;
        }
        for (const id of fm.disabledItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.disabled"] = false;
        }
        for (const id of fm.disabledHpDiceItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.statDice.hp.disabled"] = false;
        }
        for (const id of fm.disabledMpDiceItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.statDice.mp.disabled"] = false;
        }
        const itemUpdates = Object.values(itemUpdatesById);

        const effectUpdates = fm.disabledEffects.map((id) => ({
          _id: id,
          disabled: false,
        }));

        if (itemUpdates.length) {
          await this.actor.updateEmbeddedDocuments("Item", itemUpdates);
        }
        if (effectUpdates.length) {
          await this.actor.updateEmbeddedDocuments(
            "ActiveEffect",
            effectUpdates,
          );
        }

        if (this.transformation.resetHp || this.transformation.resetMp) {
          const updateData = {};
          if (this.transformation.resetHp) {
            updateData["system.hp.value"] = this.parent.getFlag(
              "teriock",
              "preTransformHp",
            );
          }
          if (this.transformation.resetMp) {
            updateData["system.mp.value"] = this.parent.getFlag(
              "teriock",
              "preTransformMp",
            );
          }
          await this.actor.update(updateData);
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
          transformation: Number(this.isTransformation),
          "transformation.primary": Number(this.isPrimaryTransformation),
        });
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        if (this.isTransformation) {
          if (!this.transformation.img && this.actor && this.primarySpecies) {
            this.transformation.img = this.primarySpecies.img;
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
