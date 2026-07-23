import impactConfig from "../../../../constants/config/impact-config.mjs";
import statConfig from "../../../../constants/config/stat-config.mjs";

/**
 * @param {typeof AbilityExecutionConstructor} Base
 */
export default function AbilityExecutionActorUpdatePart(Base) {
  return (
    /**
     * @extends {AbilityExecutionConstructor}
     * @mixin
     */
    class AbilityExecutionActorUpdate extends Base {
      /**
       * Costs that are being paid.
       * @returns {string[]}
       */
      get #paidCosts() {
        return Object.keys(statConfig).filter(c => this.costs[c] > 0 && !this.options[`no${c.titleCase()}`]);
      }

      /**
       * Prepare equipment to be consumed.
       */
      #prepareEquipmentConsumption() {
        if (this.isContact && this.consumeEquipment && this.armament?.system.consumable) {
          this.operations.push({
            action: "update",
            documentName: "Item",
            parent: this.armament.parent,
            updates: [{
              _id: this.armament.id,
              system: {
                quantity: {
                  value: Math.max(0, this.armament.system.quantity.value - this.armament.system.consumptionAmount),
                },
              },
            }],
          });
        }
      }

      /** @inheritDoc */
      async _performUpdates() {
        const yes = await super._performUpdates();
        if (yes === false) { return false; }

        if (this.actor && this.payCosts) {
          for (const c of this.#paidCosts) {
            const config = statConfig[c];
            if (!config?.bar) { await impactConfig[config?.impact]?.apply(this.actor, this.costs[c]); }
          }
        }
      }

      /** @inheritDoc */
      async _prepareUpdates() {
        this.#prepareEquipmentConsumption();
        if (this.actor) {
          if (this.usesReaction) { this.actorUpdates["system.combat.hasReaction"] = false; }
          for (const c of this.#paidCosts) {
            const config = statConfig[c];
            if (config?.bar) {
              this.actorUpdates[`system.${c}.value`] = Math.max(
                this.actor.system[c].value + (config?.multiplier ?? 1) * this.costs[c],
                this.actor.system[c].min ?? 0,
              );
            }
          }
        }
        return super._prepareUpdates();
      }
    }
  );
}
