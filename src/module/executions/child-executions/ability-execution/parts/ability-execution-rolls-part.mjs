import { BaseRoll } from "../../../../dice/rolls/_module.mjs";

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityExecutionRolls>}
 */
export default function AbilityExecutionRollsPart(Base) {
  /** @mixin */
  class AbilityExecutionRolls extends Base {
    /** @inheritDoc */
    get flavor() {
      if (this.isAttack) { return super.flavor; }
      if (this.isFeat) { return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.feat"); }
      if (this.isBlock) { return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.block"); }
      return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.manifest");
    }

    /** @inheritDoc */
    async _buildRolls() {
      const overrideAutomation = this.automations.getTypeSync("override", { active: true });
      if (this.isAttack) {
        if (overrideAutomation?.preventAttack) { return; }
        return super._buildRolls();
      }
      const preventThreshold = Boolean(overrideAutomation?.preventThreshold);
      const styles = {
        dice: { classes: [this.source.system.interaction] },
        total: { classes: [this.source.system.interaction] },
      };
      if (this.isFeat && !preventThreshold) {
        styles.total.icon = TERIOCK.display.icons.manifest.interaction.feat;
        this.rolls.push(
          new BaseRoll(this.formula, this.getRollData(), {
            flavor: this.flavor,
            hideRoll: preventThreshold,
            styles,
            targets: Array.from(this.targets),
          }),
        );
      } else if (this.isBlock) {
        styles.total.icon = TERIOCK.display.icons.manifest.interaction.block;
        this.rolls.push(
          new BaseRoll(this.formula, this.getRollData(), {
            flavor: this.flavor,
            styles,
            targets: Array.from(this.targets),
          }),
        );
      } else if (this.isManifest && this.targets.size > 0) {
        this.rolls.push(
          new BaseRoll("0", this.getRollData(), {
            flavor: this.flavor,
            hideRoll: true,
            styles,
            targets: Array.from(this.targets),
          }),
        );
      }
    }
  }

  return AbilityExecutionRolls;
}
