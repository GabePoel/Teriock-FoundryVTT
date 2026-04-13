import { icons } from "../../../../../constants/display/icons.mjs";
import { elementClass } from "../../../../../helpers/html.mjs";
import { simplifyTags } from "../../../../../helpers/panel.mjs";

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
     * @extends {AbilityInfoPart}
     * @extends {AbilityMetaphysicsPart}
     * @extends {AbilityOverviewPart}
     * @extends {AbilityResultsPart}
     * @extends {AbilityUpgradesPart}
     * @extends {AbilityUsagePart}
     * @mixin
     */
    class AbilityPanelPart extends Base {
      /** @inheritDoc */
      get panelParts() {
        const bars = [
          {
            icon: icons.ability.execution,
            label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.execution"),
            wrappers: this._executionWrappers,
          },
          {
            icon: icons.ability.target,
            label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.targeting"),
            wrappers: this._targetingWrappers,
          },
          {
            icon: icons.ability.expansion,
            label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.expansion.label"),
            wrappers: this._expansionWrappers,
          },
          {
            icon: icons.ability.cost,
            label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.costs.label"),
            wrappers: this._costWrappers,
          },
          {
            icon: icons.ui.info,
            label: "TERIOCK.SYSTEMS.Ability.PANELS.info",
            wrappers: simplifyTags(this._infoTags),
          },
          {
            icon: TERIOCK.options.effect.form[this.form].icon,
            label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.metaphysics"),
            wrappers: [
              TERIOCK.options.effect.form[this.form].label || "",
              ...simplifyTags(this._metaphysicsTags),
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
