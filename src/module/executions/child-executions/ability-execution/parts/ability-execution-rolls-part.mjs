import { BaseRoll } from "../../../../dice/rolls/_module.mjs";

/**
 * @template {Constructor<AbilityExecutionConstructor>} T
 * @param {T} Base
 */
export default function AbilityExecutionRollsPart(Base) {
  return (
    /**
     * @extends {AbilityExecutionConstructor}
     * @mixin
     */
    class AbilityExecutionRolls extends Base {
      /** @inheritDoc */
      get flavor() {
        if (this.isAttack) { return super.flavor; }
        if (this.isFeat) { return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.feat"); }
        if (this.isBlock) { return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.block"); }
        return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.manifest");
      }

      /** @inheritDoc */
      async _buildTargetGroups() {
        const overrideAutomation = this.activeAutomations.find(a => a.type === "override");
        if (this.isAttack) {
          if (overrideAutomation?.preventAttack) { return; }
          return super._buildTargetGroups();
        }
        const preventThreshold = Boolean(overrideAutomation?.preventThreshold);
        const styles = {
          dice: { classes: [this.source.system.interaction] },
          total: { classes: [this.source.system.interaction] },
        };
        const targets = Array.from(this.targets);
        if (this.isFeat && !preventThreshold) {
          styles.total.icon = TERIOCK.display.icons.interaction.feat;
          this._addTargetGroup({
            roll: new BaseRoll(this.formula, this.getRollData(), { flavor: this.flavor, styles }),
            targets,
          });
        } else if (this.isBlock) {
          styles.total.icon = TERIOCK.display.icons.interaction.block;
          this._addTargetGroup({
            roll: new BaseRoll(this.formula, this.getRollData(), { flavor: this.flavor, styles }),
            targets,
          });
        } else if (this.isManifest && this.targets.size > 0) {
          // Nothing is rolled for a manifest, so the group carries its targets alone.
          this._addTargetGroup({ flavor: this.flavor, targets });
        }
      }
    }
  );
}
