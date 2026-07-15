import {
  AbilityPreviewModel,
  EquipmentPreviewModel,
  FluencyPreviewModel,
  MetaphysicsPreviewModel,
  PowerPreviewModel,
  RankPreviewModel,
} from "../../../../../data/models/preview-models/_module.mjs";

/**
 * @param {typeof BaseActorSheet} Base
 */
export default function PreviewActorSheetPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class PreviewActorSheetPart extends Base {
      /**
       * @this {PreviewActorSheetPart}
       * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
       */
      static async #previewGroupAbility() {
        const visible = a => !a.isReference && (a.system.revealed || game.user.isGM);
        return [{
          docs: this.document.abilities.filter(visible),
          empty: _loc("TERIOCK.SHEETS.Actor.TABS.Abilities.nonBasic"),
        }, {
          docs: game.teriock.basicAbilities.filter(visible),
          empty: _loc("TERIOCK.SHEETS.Actor.TABS.Abilities.basic"),
        }];
      }

      /**
       * @this {PreviewActorSheetPart}
       * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
       */
      static async #previewGroupConsequence() {
        return [{ docs: this._childrenOfType("consequence"), empty: TERIOCK.config.document.consequence.plural }, {
          docs: this._childrenOfType("attunement"),
          empty: TERIOCK.config.document.attunement.plural,
        }, {
          docs: this.document.effects.filter(e =>
            ["base", "condition", "cover", "hack"].includes(e.type) && !e.isStatus
          ),
          empty: TERIOCK.config.document.effect.plural,
          optional: true,
        }];
      }

      /**
       * @this {PreviewActorSheetPart}
       * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
       */
      static async #previewGroupEquipment() {
        return [
          {
            docs: this._childrenOfType("equipment").filter(e => !e.sup || e.sup.type !== "equipment"),
            empty: TERIOCK.config.document.equipment.plural,
          },
          { docs: this._childrenOfType("body"), empty: TERIOCK.config.document.body.plural },
          { docs: this._childrenOfType("mount"), empty: TERIOCK.config.document.mount.plural },
        ];
      }

      /**
       * @this {PreviewActorSheetPart}
       * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
       */
      static async #previewGroupFluency() {
        return [{ docs: this._childrenOfType("fluency"), empty: TERIOCK.config.document.fluency.plural }];
      }

      /**
       * @this {PreviewActorSheetPart}
       * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
       */
      static async #previewGroupPower() {
        return [{ docs: this._childrenOfType("species"), empty: TERIOCK.config.document.species.plural }, {
          docs: this._childrenOfType("power"),
          empty: TERIOCK.config.document.power.plural,
        }];
      }

      /**
       * @this {PreviewActorSheetPart}
       * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
       */
      static async #previewGroupRank() {
        return [{ docs: this._childrenOfType("rank"), empty: TERIOCK.config.document.rank.plural }, {
          docs: this._childrenOfType("archetype"),
          empty: TERIOCK.config.document.archetype.plural,
          optional: true,
        }];
      }

      /**
       * @this {PreviewActorSheetPart}
       * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
       */
      static async #previewGroupResource() {
        const consumable = "TERIOCK.SHEETS.Actor.TABS.Resources.consumable";
        return [{ docs: this._childrenOfType("resource"), empty: TERIOCK.config.document.resource.plural }, {
          docs: this.document.abilities.filter(a => a.system.consumable),
          empty: _loc(consumable, { value: TERIOCK.config.document.ability.plural }),
        }, {
          docs: this.document.properties.filter(a => a.system.consumable),
          empty: _loc(consumable, { value: TERIOCK.config.document.property.plural }),
        }];
      }

      /** @inheritDoc */
      static PREVIEWS = {
        ability: {
          data: { display: { gapless: true, size: "small" } },
          groups: this.#previewGroupAbility,
          model: AbilityPreviewModel,
        },
        consequence: {
          addButton: { type: "consequence", types: ["consequence", "attunement"] },
          data: { display: { gapless: true, size: "small" } },
          groups: this.#previewGroupConsequence,
        },
        equipment: {
          addButton: { type: "equipment", types: ["equipment", "body", "mount"] },
          data: { display: { gapless: true, size: "small" } },
          groups: this.#previewGroupEquipment,
          model: EquipmentPreviewModel,
        },
        fluency: { addButton: { type: "fluency" }, groups: this.#previewGroupFluency, model: FluencyPreviewModel },
        power: {
          addButton: { type: "power", types: ["power", "species"] },
          groups: this.#previewGroupPower,
          model: PowerPreviewModel,
        },
        rank: { addButton: { type: "rank" }, groups: this.#previewGroupRank, model: RankPreviewModel },
        resource: {
          addButton: { type: "resource" },
          groups: this.#previewGroupResource,
          model: MetaphysicsPreviewModel,
        },
      };
    }
  );
}
