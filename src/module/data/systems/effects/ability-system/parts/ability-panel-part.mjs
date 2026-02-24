import { icons } from "../../../../../constants/display/icons.mjs";
import { formulaExists } from "../../../../../helpers/formula.mjs";
import { elementClass } from "../../../../../helpers/html.mjs";

/**
 * Ability panel part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {AbilitySystem}
     * @mixin
     */
    class AbilityPanelPart extends Base {
      /** @inheritDoc */
      get panelParts() {
        const ref = TERIOCK.options.ability;
        let mpCost = "";
        if (this.costs.mp.type === "variable") {
          mpCost = game.i18n.format("TERIOCK.SYSTEMS.Ability.PANELS.variable", {
            cost: game.i18n.localize("TERIOCK.STATS.mp.abbreviation"),
          });
        } else if (this.costs.mp.type === "formula") {
          mpCost = game.i18n.format("TERIOCK.SYSTEMS.Ability.PANELS.constant", {
            value: this.costs.mp.value.formula,
            cost: game.i18n.localize("TERIOCK.STATS.mp.abbreviation"),
          });
        } else if (this.costs.mp.type === "static") {
          mpCost = game.i18n.format("TERIOCK.SYSTEMS.Ability.PANELS.constant", {
            value: this.costs.mp.value.static,
            cost: game.i18n.localize("TERIOCK.STATS.mp.abbreviation"),
          });
        }
        let hpCost = "";
        if (this.costs.hp.type === "variable") {
          hpCost = game.i18n.format("TERIOCK.SYSTEMS.Ability.PANELS.variable", {
            cost: game.i18n.localize("TERIOCK.STATS.hp.abbreviation"),
          });
        } else if (this.costs.hp.type === "formula") {
          hpCost = game.i18n.format("TERIOCK.SYSTEMS.Ability.PANELS.constant", {
            value: this.costs.hp.value.formula,
            cost: game.i18n.localize("TERIOCK.STATS.hp.abbreviation"),
          });
        } else if (this.costs.hp.type === "static") {
          hpCost = game.i18n.format("TERIOCK.SYSTEMS.Ability.PANELS.constant", {
            value: this.costs.hp.value.static,
            cost: game.i18n.localize("TERIOCK.STATS.hp.abbreviation"),
          });
        } else if (this.costs.hp.type === "hack") {
          hpCost = game.i18n.localize("TERIOCK.TERMS.Common.hack");
        }
        let gpCost = "";
        if (this.costs.gp.type === "variable") {
          gpCost = game.i18n.format("TERIOCK.SYSTEMS.Ability.PANELS.variable", {
            cost: game.i18n.localize("TERIOCK.STATS.gp.abbreviation"),
          });
        } else if (this.costs.gp.type === "formula") {
          gpCost = game.i18n.format("TERIOCK.SYSTEMS.Ability.PANELS.constant", {
            value: this.costs.gp.value.formula,
            cost: game.i18n.localize("TERIOCK.STATS.gp.abbreviation"),
          });
        } else if (this.costs.gp.type === "static") {
          gpCost = game.i18n.format("TERIOCK.SYSTEMS.Ability.PANELS.constant", {
            value: this.costs.gp.value.static,
            cost: game.i18n.localize("TERIOCK.STATS.gp.abbreviation"),
          });
        }
        const bars = [
          {
            icon: icons.ability.execution,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.PANELS.execution",
            ),
            wrappers: [
              ref.executionTime[this.maneuver][this.executionTime] || "",
              this.piercing.value.toUpperCase(),
              ref.delivery[this.delivery.base] || "",
              this.interaction === "feat"
                ? ref.featSaveAttribute[this.featSaveAttribute]
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
              ["missile", "cone", "sight", "aura"].includes(this.delivery.base)
                ? this.range.abbreviation
                : "",
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
                    ? ref.attribute[this.expansion.featSaveAttribute]
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
              mpCost || "",
              hpCost || "",
              gpCost || "",
              ref.breakCost[this.costs.break] || "",
              this.costs.verbal
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Ability.FIELDS.costs.verbal.label",
                  )
                : "",
              this.costs.somatic
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Ability.FIELDS.costs.somatic.label",
                  )
                : "",
              this.costs.material
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Ability.FIELDS.costs.material.label",
                  )
                : "",
              this.invoked
                ? game.i18n.localize(
                    "TERIOCK.SYSTEMS.Ability.FIELDS.invoked.label",
                  )
                : "",
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
              ...this.powerSources.map((power) => ref.powerSources[power]),
              ...this.elements.map((element) => ref.elements[element]),
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
            ],
          },
          {
            icon: ref.form[this.form].icon,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.PANELS.abilityType",
            ),
            wrappers: [
              ref.form[this.form].name || "",
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
                .map((effect) => ref.effectTypes[effect]),
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
