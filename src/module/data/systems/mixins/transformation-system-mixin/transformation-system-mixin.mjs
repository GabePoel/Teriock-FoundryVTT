import { quickAddAssociation } from "../../../../helpers/html.mjs";
import { makeIcon } from "../../../../helpers/utils.mjs";
import { transformationField } from "../../../fields/helpers/builders.mjs";

/**
 * @param {typeof ChildSystem} Base
 */
export default function TransformationSystemMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ChildSystem}
     * @implements {Teriock.Models.TransformationSystemInterface}
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

      /** @inheritDoc */
      get panelParts() {
        const parts = super.panelParts;
        quickAddAssociation(
          this.species,
          "Species",
          TERIOCK.options.document.species.icon,
          parts.associations,
        );
        return parts;
      }

      /**
       * This species this is transforming an actor into.
       * @returns {TeriockSpecies[]}
       */
      get species() {
        if (!this.actor || !this.isTransformation) return [];
        return /** @type {TeriockSpecies[]} */ this.transformation.species
          .map((id) => this.actor.items.get(id))
          .filter((s) => s);
      }

      /**
       * Apply transformation suppression and stat-dice updates using flags built by {@link _buildTransformationFlags}.
       * @returns {Promise<void>}
       */
      async _applyTransformationUpdates() {
        if (!this.actor) return;
        const hasItem = (id) => this.actor.items.has(id);
        const hasEffect = (id) => this.actor.effects.has(id);
        const stashedEquipment = (
          this.parent.getFlag("teriock", "stashedEquipment") ?? []
        ).filter(hasItem);
        const disabledEffects = (
          this.parent.getFlag("teriock", "disabledEffects") ?? []
        ).filter(hasEffect);
        const disabledItems = (
          this.parent.getFlag("teriock", "disabledItems") ?? []
        ).filter(hasItem);
        const disabledHpDiceItems = (
          this.parent.getFlag("teriock", "disabledHpDiceItems") ?? []
        ).filter(hasItem);
        const disabledMpDiceItems = (
          this.parent.getFlag("teriock", "disabledMpDiceItems") ?? []
        ).filter(hasItem);

        /** @type {Record<string, object>} */
        const itemUpdatesById = {};
        for (const id of stashedEquipment) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.stashed"] = true;
        }
        for (const id of disabledItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.disabled"] = true;
        }
        for (const id of disabledHpDiceItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.statDice.hp.disabled"] = true;
        }
        for (const id of disabledMpDiceItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.statDice.mp.disabled"] = true;
        }
        const itemUpdates = Object.values(itemUpdatesById);

        const effectUpdates = disabledEffects.map((id) => ({
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

      _buildTransformationFlags() {
        const stashedEquipment = [];
        const disabledEffects = [];
        const disabledItems = [];
        const disabledHpDiceItems = [];
        const disabledMpDiceItems = [];

        const typeMap = this.actor.children.typeMap;
        if (this.transformation.suppression.equipment) {
          stashedEquipment.push(
            ...(typeMap.equipment?.filter((e) => !e.system.stashed) || []).map(
              (e) => e.id,
            ),
          );
        }
        if (this.transformation.suppression.fluencies) {
          disabledEffects.push(
            ...(typeMap.fluency?.filter((f) => !f.disabled) || []).map(
              (f) => f.id,
            ),
          );
        }
        if (this.transformation.suppression.bodyParts) {
          disabledItems.push(
            ...(typeMap.body?.filter((b) => !b.system.disabled) || []).map(
              (b) => b.id,
            ),
          );
        }
        if (this.transformation.suppression.ranks) {
          disabledItems.push(
            ...(typeMap.rank?.filter((r) => !r.system.disabled) || []).map(
              (r) => r.id,
            ),
          );
        }
        disabledItems.push(
          ...(
            typeMap.species?.filter(
              (s) =>
                !s.system.disabled &&
                !this.transformation.species.includes(s.id),
            ) || []
          ).map((s) => s.id),
        );
        const statItems = this.actor.items.contents.filter(
          (i) => i.system.metadata.stats,
        );
        if (this.transformation.resetHp) {
          disabledHpDiceItems.push(
            ...statItems
              .filter((i) => !i.system.statDice.hp.disabled)
              .map((i) => i.id),
          );
        }
        if (this.transformation.resetMp) {
          disabledMpDiceItems.push(
            ...statItems
              .filter((i) => !i.system.statDice.mp.disabled)
              .map((i) => i.id),
          );
        }

        return {
          teriock: {
            disabledEffects,
            disabledHpDiceItems,
            disabledItems,
            disabledMpDiceItems,
            stashedEquipment,
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
        this._applyTransformationUpdates().then();
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
        actor.update(updateData).then();
      }

      /** @inheritDoc */
      _onDelete(options, userId) {
        super._onDelete(options, userId);
        if (
          !this.parent.checkEditor(userId) ||
          !this.isTransformation ||
          !this.actor
        ) {
          return;
        }
        this._removeTransformationUpdates().then();
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
            this._removeTransformationUpdates().then();
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
        if ((await super._preCreate(data, options, user)) === false) {
          return false;
        }
        if (this.isTransformation && this.parent.actor) {
          const flags = this._buildTransformationFlags();
          this.parent.updateSource({ flags });
          const uuids = this.transformation.uuids;
          let species = /** @type {TeriockSpecies[]} */ await Promise.all(
            uuids.map((uuid) => fromUuid(uuid)),
          );
          species = species.filter((s) => s);
          if (species) {
            const speciesData = /** @type {TeriockSpecies[]} */ species.map(
              (s) => s.toObject(),
            );
            speciesData.forEach((s) => {
              s.system.transformationLevel = this.transformation.level;
              if (this.transformation.level !== "greater") {
                s.system.statDice.mp.disabled = true;
                s.system.proficient = false;
              }
              if (s.system.size.min && s.system.size.max) {
                s.system.size.value = Math.min(
                  s.system.size.max,
                  Math.max(
                    s.system.size.min,
                    this.parent.actor.system.size.number.value,
                  ),
                );
              }
            });
            const created =
              /** @type {TeriockSpecies[]} */ await this.parent.actor.createEmbeddedDocuments(
                "Item",
                speciesData,
              );
            this.parent.updateSource({
              "system.transformation.species": created.map((s) => s.id),
            });
          }
        }
      }

      /** @inheritDoc */
      async _preDelete(options, user) {
        if ((await super._preDelete(options, user)) === false) {
          return false;
        }
        if (!this.isTransformation || !this.parent.actor) return;
        const speciesIds = (this.transformation.species ?? []).filter((id) =>
          this.parent.actor.species.map((s) => s.id).includes(id),
        );
        if (speciesIds.length > 0) {
          await this.parent.actor.deleteEmbeddedDocuments("Item", speciesIds);
        }
      }

      /** @inheritDoc */
      async _preUpdate(changed, options, user) {
        if ((await super._preUpdate(changed, options, user)) === false) {
          return false;
        }
        if (!this.actor || !this.isTransformation) return;
        if (foundry.utils.hasProperty(changed, "disabled")) {
          const wasDisabled = changed.disabled === false;
          if (wasDisabled) {
            const flags = foundry.utils.mergeObject(
              this.parent.flags,
              this._buildTransformationFlags(),
            );
            foundry.utils.setProperty(changed, "flags", flags);
          } else {
            foundry.utils.setProperty(
              changed,
              "flags.teriock.transformationHp",
              this.actor.system.hp.value,
            );
            foundry.utils.setProperty(
              changed,
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
        const hasItem = (id) => this.actor.items.has(id);
        const hasEffect = (id) => this.actor.effects.has(id);
        const stashedEquipment = (
          this.parent.getFlag("teriock", "stashedEquipment") ?? []
        ).filter(hasItem);
        const disabledEffects = (
          this.parent.getFlag("teriock", "disabledEffects") ?? []
        ).filter(hasEffect);
        const disabledItems = (
          this.parent.getFlag("teriock", "disabledItems") ?? []
        ).filter(hasItem);
        const disabledHpDiceItems = (
          this.parent.getFlag("teriock", "disabledHpDiceItems") ?? []
        ).filter(hasItem);
        const disabledMpDiceItems = (
          this.parent.getFlag("teriock", "disabledMpDiceItems") ?? []
        ).filter(hasItem);

        /** @type {Record<string, object>} */
        const itemUpdatesById = {};
        for (const id of stashedEquipment) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.stashed"] = false;
        }
        for (const id of disabledItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.disabled"] = false;
        }
        for (const id of disabledHpDiceItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.statDice.hp.disabled"] = false;
        }
        for (const id of disabledMpDiceItems) {
          if (!itemUpdatesById[id]) itemUpdatesById[id] = { _id: id };
          itemUpdatesById[id]["system.statDice.mp.disabled"] = false;
        }
        const itemUpdates = Object.values(itemUpdatesById);

        const effectUpdates = disabledEffects.map((id) => ({
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
          if (
            !this.transformation.image &&
            this.parent.actor &&
            this.transformation.species.length > 0
          ) {
            const firstSpecies = this.parent.actor.items.get(
              this.transformation.species[0],
            );
            if (firstSpecies) {
              this.transformation.image = firstSpecies.img;
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
