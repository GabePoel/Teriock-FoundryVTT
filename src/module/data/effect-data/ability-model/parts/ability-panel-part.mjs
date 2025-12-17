import { elementClass } from "../../../../helpers/html.mjs";

/**
 * Ability panel part.
 * @param {typeof TeriockAbilityModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockAbilityModel}
     * @mixin
     */
    class AbilityPanelPart extends Base {
      /** @inheritDoc */
      get panelParts() {
        const ref = TERIOCK.options.ability;
        let mpCost = "";
        if (this.costs.mp.type === "variable") {
          mpCost = "Variable MP";
        } else if (this.costs.mp.type === "formula") {
          mpCost = this.costs.mp.value.formula + " MP";
        } else if (this.costs.mp.type === "static") {
          mpCost = this.costs.mp.value.static + " MP";
        }
        let hpCost = "";
        if (this.costs.hp.type === "variable") {
          hpCost = "Variable HP";
        } else if (this.costs.hp.type === "formula") {
          hpCost = this.costs.hp.value.formula + " HP";
        } else if (this.costs.hp.type === "static") {
          hpCost = this.costs.hp.value.static + " HP";
        } else if (this.costs.hp.type === "hack") {
          hpCost = "Hack";
        }
        let gpCost = "";
        if (this.costs.gp.type === "variable") {
          gpCost = "Variable ₲";
        } else if (this.costs.gp.type === "formula") {
          gpCost = this.costs.gp.value.formula + " ₲";
        } else if (this.costs.gp.type === "static") {
          gpCost = this.costs.gp.value.static + " ₲";
        }
        const bars = [
          {
            icon: "fa-arrows-turn-right",
            label: "Execution",
            wrappers: [
              ref.executionTime[this.maneuver][this.executionTime] || "",
              ref.piercing[this.piercing] || "",
              ref.delivery[this.delivery.base] || "",
              this.interaction === "feat"
                ? ref.featSaveAttribute[this.featSaveAttribute]
                : "",
              ref.interaction[this.interaction] || "",
            ],
          },
          {
            icon: "fa-crosshairs-simple",
            label: "Targeting",
            wrappers: [
              ["missile", "cone", "sight", "aura"].includes(this.delivery.base)
                ? this.range + " ft"
                : "",
              Array.from(
                this.targets.map((target) => ref.targets[target]),
              ).join(", "),
              this.duration.description || "",
            ],
          },
          {
            icon: "fa-expand",
            label: "Expansion",
            wrappers: [
              ["detonate", "ripple"].includes(this.expansion)
                ? ref.attribute[this.expansionSaveAttribute]
                : "",
              ref.expansion[this.expansion] || "",
              this.expansionRange?.includes(",")
                ? this.expansionRange.split(",")[0]
                : this.expansionRange || "",
              this.expansionRange?.includes(",")
                ? this.expansionRange.split(",")[1]
                : this.expansionRange || "",
            ],
          },
          {
            icon: "fa-coins",
            label: "Costs",
            wrappers: [
              mpCost || "",
              hpCost || "",
              gpCost || "",
              ref.breakCost[this.costs.break] || "",
              this.costs.verbal ? "Verbal" : "",
              this.costs.somatic ? "Somatic" : "",
              this.costs.material ? "Material" : "",
              this.invoked ? "Invoked" : "",
            ],
          },
          {
            icon: "fa-bolt",
            label: "Effects and Power Sources",
            wrappers: [
              this.basic ? "Basic" : "",
              this.sustained ? "Sustained" : "",
              this.standard && this.skill ? "Semblant" : "",
              this.standard && this.spell ? "Conjured" : "",
              ...this.powerSources.map((power) => ref.powerSources[power]),
              ...this.elements.map((element) => ref.elements[element]),
              this.ritual ? "Ritual" : "",
              this.rotator ? "Rotator" : "",
              this.skill ? "Skill" : "",
              this.spell ? "Spell" : "",
            ],
          },
          {
            icon: "fa-" + ref.form[this.form].icon,
            label: "Ability Type",
            wrappers: [
              ref.form[this.form].name || "",
              this.elderSorcery ? "Elder Sorcery" : "",
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
