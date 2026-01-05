import { quickAddAssociation } from "../../../helpers/html.mjs";
import { makeIcon } from "../../../helpers/utils.mjs";
import { transformationField } from "../../fields/helpers/builders.mjs";

/**
 * @param {typeof ChildTypeModel} Base
 */
export default function TransformationDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ChildTypeModel}
     * @implements {Teriock.Models.TransformationMixinInterface}
     * @mixin
     */
    class TransformationData extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        schema.transformation = transformationField({
          implementation: true,
        });
        return schema;
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
       * Whether this consequence is a transformation.
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
        return /** @type {TeriockSpecies[]} */ this.transformation.species
          .map((id) => this.actor.items.get(id))
          .filter((s) => s);
      }

      /** @inheritDoc */
      _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        if (game.user.id !== userId) {
          return;
        }
        if (!this.isTransformation || !this.parent.actor) {
          return;
        }
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
      async _preCreate(data, options, user) {
        if ((await super._preCreate(data, options, user)) === false) {
          return false;
        }
        if (this.isTransformation && this.parent.actor) {
          this.parent.updateSource({
            flags: {
              teriock: {
                wasTransformed: this.parent.actor.system.isTransformed,
                preTransformHp: this.parent.actor.system.hp.value,
                preTransformMp: this.parent.actor.system.mp.value,
                priorTransform: this.parent.actor.system.transformation.primary,
              },
            },
          });
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
        if (this.parent.actor) {
          const speciesIds = this.transformation.species.filter((id) =>
            this.parent.actor.species.map((s) => s.id).includes(id),
          );
          if (speciesIds.length > 0) {
            await this.parent.actor.deleteEmbeddedDocuments("Item", speciesIds);
          }
          if (this.isTransformation) {
            const updateData = {
              "system.transformation.primary": this.parent.getFlag(
                "teriock",
                "priorTransform",
              ),
            };
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
            await this.parent.actor.update(updateData);
          }
        }
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            name: "Set Primary Transformation",
            icon: makeIcon("tree", "contextMenu"),
            callback: this.setPrimaryTransformation.bind(this),
            condition: this.isTransformation && !this.isPrimaryTransformation,
            group: "usage",
          },
        ];
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          transformation: Number(this.isTransformation),
          "transformation.primary": Number(this.isPrimaryTransformation),
        };
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
