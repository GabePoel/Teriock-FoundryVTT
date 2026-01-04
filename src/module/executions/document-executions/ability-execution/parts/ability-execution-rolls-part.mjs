import { TeriockRoll } from "../../../../dice/_module.mjs";

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
        if (this.source.system.interaction === "attack") {
          let flavor = "Attack Roll";
          if (this.piercing.ub) {
            flavor = `UB ${flavor}`;
          }
          if (this.warded) {
            flavor = `Warded ${flavor}`;
          }
          return flavor;
        } else if (this.source.system.interaction === "feat") {
          return "Feat Save DC";
        } else if (this.source.system.interaction === "block") {
          return "Block and Armor Value";
        } else {
          return "Manifest";
        }
      }

      /** @inheritDoc */
      async _buildRolls() {
        const styles = {
          dice: {
            classes: this.source.system.interaction,
          },
          total: {
            classes: this.source.system.interaction,
          },
        };
        if (this.source.system.interaction === "attack") {
          const generalRollOptions = {
            flavor: this.flavor,
            targets: [],
            styles: styles,
          };
          if (this.piercing.ub) {
            generalRollOptions.styles.dice.classes += " ub";
            generalRollOptions.styles.dice.tooltip = "Unblockable";
          }
          for (const target of this.targets) {
            const rollOptions = foundry.utils.deepClone(generalRollOptions);
            rollOptions.targets = [target];
            if (target.actor) {
              rollOptions.threshold = target.actor.system.defense.cc;
              if (this.vitals) {
                rollOptions.threshold += 3;
              }
              rollOptions.comparison = "gte";
              if (
                this.piercing.ub &&
                (this.warded ||
                  !target.actor.system.primaryBlocker.system.spellTurning)
              ) {
                rollOptions.threshold = target.actor.system.defense.ac;
                rollOptions.comparison = "gt";
              }
            }
            this.rolls.push(
              new TeriockRoll(this.formula, this.rollData, rollOptions),
            );
          }
          if (this.rolls.length === 0) {
            this.rolls.push(
              new TeriockRoll(this.formula, this.rollData, generalRollOptions),
            );
          }
        } else if (this.source.system.interaction === "feat") {
          styles.total.icon = "star";
          this.rolls.push(
            new TeriockRoll(this.formula, this.rollData, {
              flavor: this.flavor,
              targets: Array.from(this.targets),
              styles: styles,
            }),
          );
        } else if (this.source.system.interaction === "block") {
          this.rolls.push(
            new TeriockRoll(this.formula, this.rollData, {
              flavor: this.flavor,
              styles: styles,
              targets: Array.from(this.targets),
            }),
          );
        } else if (this.source.system.interaction === "manifest") {
          if (this.targets.size > 0) {
            this.rolls.push(
              new TeriockRoll("0", this.rollData, {
                flavor: this.flavor,
                hideRoll: true,
                styles: styles,
                targets: Array.from(this.targets),
              }),
            );
          }
        }
      }
    }
  );
}
