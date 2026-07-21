import { CostPayer } from "../../../../applications/dialogs/_module.mjs";

/**
 * @param {typeof AbilityExecutionConstructor} Base
 */
export default function AbilityExecutionGetInputPart(Base) {
  return (
    /**
     * @extends {AbilityExecutionConstructor}
     * @extends {DocumentExecution}
     * @mixin
     */
    class AbilityExecutionGetInput extends Base {
      /** @inheritDoc */
      get _dialogDocuments() {
        const docs = super._dialogDocuments;
        if (this.isContact && this.armament?.system.ammunition?.enabled) {
          docs.push({
            document: this.ammunition,
            editable: true,
            label: _loc("TERIOCK.TERMS.EquipmentClasses.ammunition"),
            getChoices: () => this.actor?.equipment.filter(e => e.system.consumable) ?? [],
            update: ammunition => this.ammunition = ammunition,
          });
        }
        return docs;
      }

      /** @inheritDoc */
      get _postAttackFormPaths() {
        const paths = super._postAttackFormPaths;
        if (this.source.system.maneuver === "reactive") { paths.push("usesReaction"); }
        paths.push("autoPayCosts");
        if (this.isContact) {
          if (this.armament?.system.consumable) { paths.push("consumeEquipment"); }
          if (this.armament?.system.ammunition?.enabled && this.ammunition) { paths.push("consumeAmmunition"); }
        }
        return paths;
      }

      /** @inheritDoc */
      get _preAttackFormPaths() {
        const paths = super._preAttackFormPaths;
        if (this.isBlock) { paths.push("bv"); }
        return paths;
      }

      /** @inheritDoc */
      get requiresCompetence() {
        return true;
      }

      /**
       * Get user input on costs.
       * @returns {Promise<object|false>}
       */
      async _getCostInput() {
        const result = await CostPayer.prompt(this, { autoPay: this.autoPayCosts });
        if (result) {
          Object.assign(this.costs, result.costs);
          this.heightened = result.heightened;
        }
        return result;
      }

      /** @inheritDoc */
      async _getInput() {
        const yes = await super._getInput();
        if (yes === false) { return yes; }

        return this._getCostInput();
      }

      /** @inheritDoc */
      async _getTargets() {
        if (this.source.system.targets.size === 1 && this.source.system.targets.has("self") && this.executor) {
          this.targets.add(this.executor);
        } else { await super._getTargets(); }
      }
    }
  );
}
