import { objectMap } from "../../../../../../../utils/_module.mjs";
import { terrainsField } from "../../../../../../fields/tools/builders.mjs";
import { initialBoolean, initialNumber } from "../../../../../../fields/tools/initializers.mjs";

/**
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

const { fields } = foundry.data;

/**
 * Actor data model that handles movement.
 *
 * Relevant wiki pages:
 * - [Movement](https://wiki.teriock.com/index.php/Core:Movement)
 *
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 */
export default function ActorMovementPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ActorMovementPartData}
   * @property {TeriockActor} parent
   */
  class ActorMovementPart extends /** @type {InitializedDataModel<T, Teriock.Models.ActorMovementPartData>} */ (Base) {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        difficultTerrain: initialBoolean(),
        movementSpeed: initialNumber(30),
        speedAdjustments: new fields.SchemaField(
          objectMap(TERIOCK.CONFIG.character.movement, e => speedField(e.initial, e.label)),
        ),
        terrains: terrainsField({ persisted: false }),
      });
    }

    /**
     * This actor's active tokens.
     * @returns {TeriockTokenDocument[]}
     */
    #getTokens() {
      return this.parent.token ? [this.parent.token] : this.parent.getActiveTokens(true, true);
    }

    /**
     * The types of terrain this actor's tokens are in.
     * @returns {{ difficultTerrain: boolean, terrains: Set<Teriock.Keys.Terrain> }}
     * @remarks This might differ from the actor's terrains because changes could modify it.
     * @category Terrain
     */
    #getTokenTerrains() {
      const tokens = this.#getTokens();
      return {
        difficultTerrain: tokens.some(t => t.difficultTerrain),
        terrains: new Set(tokens.flatMap(t => Array.from(t.terrains))),
      };
    }

    /**
     * Speed adjustments that currently apply.
     * @returns {Set<Teriock.Keys.Movement>}
     */
    get activeSpeedAdjustments() {
      const tokens = this.#getTokens();
      const actions = new Set(
        tokens.length ? tokens.map(t => t.movementAction) : [CONFIG.Token.movement.defaultAction],
      );
      return new Set(
        Object.entries(TERIOCK.CONFIG.character.movement).filter(([key, entry]) =>
          actions.has(entry.movementAction) || this.parent.statuses.has(entry.status)
          || (key === "difficultTerrain" && this.difficultTerrain)
        ).map(([key]) => key),
      );
    }

    /**
     * Check if token terrains have changed and reset if needed.
     * @category Terrain
     */
    checkTerrains() {
      const { difficultTerrain, terrains } = this.#getTokenTerrains();
      if (
        difficultTerrain === Boolean(this.parent._cache.difficultTerrain)
        && terrains.equals(this.parent._cache.terrains ?? new Set())
      ) {
        return;
      }
      this.parent.reset();
      this.parent.render();
    }

    /**
     * Create a Token movement cost function for a movement action. Costs are in feet of movement.
     *
     * Relevant wiki pages:
     * - [Movement Speed](https://wiki.teriock.com/index.php/Core:Movement_Speed)
     *
     * @param {string} action
     * @returns {TokenMovementActionCostFunction}
     */
    getMovementCostFunction(action) {
      const multipliers = { horizontal: 1, vertical: 1 };
      for (const [key, entry] of Object.entries(TERIOCK.CONFIG.character.movement)) {
        if (entry.movementAction !== action && !this.parent.statuses.has(entry.status)) { continue; }
        for (const d of entry.direction ? [entry.direction] : ["horizontal", "vertical"]) {
          multipliers[d] *= TERIOCK.CONFIG.character.speed[this.speedAdjustments[key]].multiplier;
        }
      }
      const difficult = TERIOCK.CONFIG.character.speed[this.speedAdjustments.difficultTerrain].multiplier;
      return (baseCost, from, to, distance, segment) => {
        if (!distance) { return baseCost; }
        const terrain = segment.terrain?.difficultTerrain ? difficult : 1;
        const h = from.i !== to.i || from.j !== to.j ? multipliers.horizontal : Infinity;
        const v = from.k !== to.k ? multipliers.vertical : Infinity;
        return baseCost / (terrain * Math.min(h, v));
      };
    }

    /** @inheritDoc */
    getRollData() {
      const rollData = super.getRollData();
      rollData.speed = this.movementSpeed;
      for (const k of Object.keys(TERIOCK.CONFIG.character.movement)) {
        rollData[`speed.${k}`] = this.speedAdjustments[k] || 0;
      }
      for (const terrain of this.terrains) { rollData[`terrain.${terrain}`] = 1; }
      return rollData;
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();
      this.movementSpeed = 30 + 10 * this.attributes.mov.score;
      const { difficultTerrain, terrains } = this.#getTokenTerrains();
      Object.assign(this.parent._cache, { difficultTerrain, terrains });
      this.difficultTerrain = difficultTerrain;
      this.terrains = this.terrains.union(terrains);
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      this.movementSpeed = 30 + 10 * this.attributes.mov.score;
    }

    /** @inheritDoc */
    prepareVirtualEffects() {
      super.prepareVirtualEffects();
      for (const key of Object.keys(this.speedAdjustments)) {
        if (this.parent.statuses.has("slowed")) { this.speedAdjustments[key] -= 1; }
        if (this.parent.statuses.has("immobilized")) { this.speedAdjustments[key] = 0; }
        this.speedAdjustments[key] = Math.max(this.speedAdjustments[key], 0);
      }
    }
  }

  return ActorMovementPart;
}

/**
 * Creates a speed adjustment field definition for different movement types.
 *
 * Relevant wiki pages:
 * - [Movement Speed](https://wiki.teriock.com/index.php/Core:Movement_Speed)
 *
 * @param {number} initial - The initial speed adjustment value (0-4)
 * @param {string} label - The display name for this speed adjustment type
 */
function speedField(initial, label) {
  return new fields.NumberField({
    choices: TERIOCK.CONFIG.character.speed,
    initial,
    integer: true,
    label,
    max: 4,
    min: 0,
    step: 1,
  });
}
