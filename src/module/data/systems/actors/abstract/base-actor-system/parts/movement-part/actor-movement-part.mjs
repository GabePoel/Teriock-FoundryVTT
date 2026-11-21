import { objectMap } from "../../../../../../../utils/_module.mjs";
import { MultiChangeField } from "../../../../../../fields/_module.mjs";
import { terrainsField } from "../../../../../../fields/tools/builders.mjs";
import { initialBoolean } from "../../../../../../fields/tools/initializers.mjs";

/**
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 * @import RegionBehavior from "@client/documents/region-behavior.mjs";
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
        movementSpeed: new fields.NumberField({ initial: null, nullable: true, units: "TERIOCK.LENGTH.ft.symbol" }),
        speedAdjustments: new MultiChangeField(
          objectMap(TERIOCK.CONFIG.actor.movement, e => speedField(e.initial, e.label)),
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
     * The stuff from regions and scenes this actor's tokens are in.
     * @returns {{ difficultTerrain: boolean, suppressBehaviors: Set<RegionBehavior>, terrains: Set<Teriock.Keys.Terrain> }}
     * @remarks This might differ from the actor's terrains because changes could modify it.
     * @category Terrain
     */
    #getTokenSurroundings() {
      const tokens = this.#getTokens();
      if (!tokens.length) {
        return {
          difficultTerrain: false,
          suppressBehaviors: new Set(),
          terrains: game.settings.get("teriock", "terrains"),
        };
      }
      return {
        difficultTerrain: tokens.some(t => t.isInDifficultTerrain),
        suppressBehaviors: new Set(tokens.flatMap(t => t.getQualifiedBehaviors("suppress"))),
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
        Object.entries(TERIOCK.CONFIG.actor.movement).filter(([key, entry]) =>
          actions.has(entry.movementAction) || this.parent.statuses.has(entry.status)
          || (key === "difficultTerrain" && this.difficultTerrain)
        ).map(([key]) => key),
      );
    }

    /**
     * Check if token surroundings have changed and reset if needed.
     * @category Terrain
     */
    checkSurroundings() {
      const cache = this.parent._cache;
      if (cache.checkingSurroundings) { return; }
      const { difficultTerrain, suppressBehaviors, terrains } = this.#getTokenSurroundings();
      if (
        difficultTerrain === Boolean(cache.difficultTerrain)
        && suppressBehaviors.equals(cache.suppressBehaviors ?? new Set())
        && terrains.equals(cache.terrains ?? new Set())
      ) {
        return;
      }
      cache.checkingSurroundings = true;
      try {
        this.parent.reset();
      } finally {
        cache.checkingSurroundings = false;
      }
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
      for (const [key, entry] of Object.entries(TERIOCK.CONFIG.actor.movement)) {
        if (entry.movementAction !== action && !this.parent.statuses.has(entry.status)) { continue; }
        for (const d of entry.direction ? [entry.direction] : ["horizontal", "vertical"]) {
          multipliers[d] *= TERIOCK.CONFIG.actor.speedAdjustments[this.speedAdjustments[key]].multiplier;
        }
      }
      const difficult = TERIOCK.CONFIG.actor.speedAdjustments[this.speedAdjustments.difficultTerrain].multiplier;
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
      for (const [k, v] of Object.entries(TERIOCK.CONFIG.actor.movement)) {
        rollData[`speed.${v.slug}`] = this.speedAdjustments[k] || 0;
      }
      for (const terrain of this.terrains) { rollData[`terrain.${terrain}`] = 1; }
      return rollData;
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();
      const { difficultTerrain, suppressBehaviors, terrains } = this.#getTokenSurroundings();
      Object.assign(this.parent._cache, { difficultTerrain, suppressBehaviors, terrains });
      this.difficultTerrain = difficultTerrain;
      this.terrains = this.terrains.union(terrains);
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      this.movementSpeed ??= 30 + 10 * this.attributes.mov.score;
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
    choices: TERIOCK.CONFIG.actor.speedAdjustments,
    initial,
    integer: true,
    label,
    max: 4,
    min: 0,
    step: 1,
  });
}

/**
 * Make sure linked actors have the correct surroundings when the scene changes or the canvas loads.
 * @see {canvasReady}
 * @category Terrain
 */
function checkSceneSurroundings() {
  const actors = new Set(game.actors.filter(a => a._cache.terrains?.size || a._cache.suppressBehaviors?.size));
  for (const token of canvas.scene?.tokens ?? []) { if (token.actor) { actors.add(token.actor); } }
  for (const actor of actors) { actor.system.checkSurroundings?.(); }
}
Hooks.on("canvasReady", checkSceneSurroundings);
