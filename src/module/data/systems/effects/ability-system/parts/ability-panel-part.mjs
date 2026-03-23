import { icons } from "../../../../../constants/display/icons.mjs";
import { formulaExists } from "../../../../../helpers/formula.mjs";
import { elementClass } from "../../../../../helpers/html.mjs";

/**
 * Ability panel part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {AbilityCostsPart}
     * @extends {AbilityDurationPart}
     * @extends {AbilityEquipmentPart}
     * @extends {AbilityFlagsPart}
     * @extends {AbilityOverviewPart}
     * @extends {AbilityResultsPart}
     * @extends {AbilityTagsPart}
     * @extends {AbilityUpgradesPart}
     * @extends {AbilityUsagePart}
     * @mixin
     */
    class AbilityPanelPart extends Base {
      /** @inheritDoc */
      get panelParts() {
        const ref = TERIOCK.options.ability;
        let time;
        if (this.maneuver !== "slow") {
          time = ref.executionTime[this.maneuver][this.executionTime.base];
        } else {
          time = this.executionTime.slow.text;
        }
        const bars = [
          {
            icon: icons.ability.execution,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.PANELS.execution",
            ),
            wrappers: [
              time || "",
              this.piercing.value.toUpperCase(),
              ref.delivery[this.delivery] || "",
              this.interaction === "feat"
                ? TERIOCK.reference.attributes[this.featSaveAttribute]
                : "",
              ref.interaction[this.interaction] || "",
            ],
          },
          {
            icon: icons.ability.target,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.PANELS.targeting",
            ),
            wrappers: [
              this.isRanged ? this.range.abbreviation : "",
              ...Array.from(this.targets.map((target) => ref.targets[target])),
              this.duration.text || "",
            ],
          },
          {
            icon: icons.ability.expansion,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.FIELDS.expansion.label",
            ),
            wrappers: this.expansion.type
              ? [
                  ["detonate", "ripple"].includes(this.expansion.type)
                    ? TERIOCK.reference.attributes[
                        this.expansion.featSaveAttribute
                      ]
                    : "",
                  ref.expansion[this.expansion.type] || "",
                  this.expansion.range.abbreviation,
                  formulaExists(this.expansion.cap.raw)
                    ? game.i18n.format(
                        "TERIOCK.SYSTEMS.Ability.PANELS.expansionCap",
                        { value: this.expansion.cap.raw },
                      )
                    : "",
                ]
              : [],
          },
          {
            icon: icons.ability.cost,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.FIELDS.costs.label",
            ),
            wrappers: [
              ...Object.entries(TERIOCK.options.cost.primary.keys).map(
                ([k, v]) =>
                  this.costs.primary[k].type === "formula"
                    ? game.i18n.format(
                        "TERIOCK.SYSTEMS.Ability.PANELS.constant",
                        {
                          value: this.costs.primary[k].formula,
                          cost: v.abbreviation,
                        },
                      )
                    : this.costs.primary[k].type === "description"
                      ? game.i18n.format(
                          "TERIOCK.SYSTEMS.Ability.PANELS.variable",
                          {
                            cost: v.abbreviation,
                          },
                        )
                      : "",
              ),
              ...Object.entries(TERIOCK.options.cost.components.keys).map(
                ([k, v]) => (this.costs.components[k].type ? v : ""),
              ),
            ],
          },
          {
            icon: icons.ability.effectType,
            label: "TERIOCK.SYSTEMS.Ability.PANELS.effectPower",
            wrappers: [
              this.basic
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Ability.FIELDS.basic.label",
                  )
                : "",
              this.sustained
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Ability.FIELDS.sustained.label",
                  )
                : "",
              this.standard && this.skill
                ? game.i18n.localize("TERIOCK.TERMS.Common.semblant")
                : "",
              this.standard && this.spell
                ? game.i18n.localize("TERIOCK.TERMS.Common.conjured")
                : "",
              ...this.powerSources.map(
                (p) => TERIOCK.reference.powerSources[p],
              ),
              ...this.elements.map((e) => TERIOCK.reference.elements[e]),
              this.ritual
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Ability.FIELDS.ritual.label",
                  )
                : "",
              this.rotator
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Ability.FIELDS.rotator.label",
                  )
                : "",
              this.skill
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Ability.FIELDS.skill.label",
                  )
                : "",
              this.spell
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Ability.FIELDS.spell.label",
                  )
                : "",
              this.mundane
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Adjustable.FIELDS.mundane.label",
                  )
                : "",
            ],
          },
          {
            icon: TERIOCK.options.effect.form[this.form].icon,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.PANELS.abilityType",
            ),
            wrappers: [
              TERIOCK.options.effect.form[this.form].name || "",
              this.warded
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label",
                  )
                : "",
              this.elderSorcery
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.label",
                  )
                : "",
              ...this.effectTypes
                .filter((e) => !this.powerSources.has(e))
                .map((e) => TERIOCK.reference.effectTypes[e]),
            ],
          },
        ];
        return {
          ...super.panelParts,
          classes: this.elderSorcery
            ? `elder-sorcery ${elementClass(this.elements)}`
            : "",
          bars: bars,
        };
      }
    }
  );
};
