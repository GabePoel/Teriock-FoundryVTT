import { BaseRoll, ThresholdRoll } from "../../../../dice/rolls/_module.mjs";

/**
 * @param {typeof AbilityExecutionConstructor} Base
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
        if (this.isAttack) {
          let flavor = _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.attack");
          if (this.piercing.ub) flavor = _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.ub", { flavor });
          if (this.warded) flavor = _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.warded", { flavor });
          return flavor;
        } else if (this.isFeat) return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.feat");
        else if (this.isBlock) return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.block");
        else return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.manifest");
      }

      /** @inheritDoc */
      async _buildRolls() {
        const modifyEffectAutomation = this.activeAutomations.find(a => a.type === "modifyEffect");
        const preventThreshold = !!modifyEffectAutomation?.preventThreshold;
        const styles = {
          dice: { classes: this.source.system.interaction },
          total: { classes: this.source.system.interaction },
        };
        if (this.isAttack) {
          const generalRollOptions = { flavor: this.flavor, styles, targets: [] };
          if (this.piercing.ub) {
            generalRollOptions.styles.dice.icon = TERIOCK.display.icons.piercing.ub;
            generalRollOptions.styles.dice.classes += " ub";
            generalRollOptions.styles.dice.tooltip = _loc("TERIOCK.TERMS.Properties.unblockable");
          }
          for (const target of this.targets) {
            const rollOptions = foundry.utils.deepClone(generalRollOptions);
            rollOptions.targets = [target];
            if (target.actor) {
              rollOptions.threshold = target.actor.system.defense.cc;
              rollOptions.comparison = "gte";
              if (this.piercing.ub && (this.warded || !target.actor.system.wielding.blocker?.system.spellTurning)) {
                rollOptions.threshold = target.actor.system.defense.ac;
                rollOptions.comparison = "gt";
              }
              if (this.limb) rollOptions.threshold += TERIOCK.config.target.limb;
              else if (this.vitals) rollOptions.threshold += TERIOCK.config.target.vitals;
            }
            this.rolls.push(new ThresholdRoll(this.formula, this.rollData, rollOptions));
          }
          if (this.rolls.length === 0)
            this.rolls.push(new ThresholdRoll(this.formula, this.rollData, generalRollOptions));
        } else if (this.isFeat && !preventThreshold) {
          styles.total.icon = TERIOCK.display.icons.interaction.feat;
          this.rolls.push(
            new BaseRoll(this.formula, this.rollData, {
              flavor: this.flavor,
              hideRoll: preventThreshold,
              styles,
              targets: Array.from(this.targets),
            }),
          );
        } else if (this.isBlock) {
          styles.total.icon = TERIOCK.display.icons.interaction.block;
          this.rolls.push(
            new BaseRoll(this.formula, this.rollData, {
              flavor: this.flavor,
              styles,
              targets: Array.from(this.targets),
            }),
          );
        } else if (this.isManifest) {
          if (this.targets.size > 0) {
            this.rolls.push(
              new BaseRoll("0", this.rollData, {
                flavor: this.flavor,
                hideRoll: true,
                styles,
                targets: Array.from(this.targets),
              }),
            );
          }
        }
      }
    }
  );
}
