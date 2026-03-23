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
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.PANELS.execution",
            ),
            wrappers: this._executionWrappers,
          },
          {
            icon: icons.ability.target,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.PANELS.targeting",
            ),
            wrappers: this._targetingWrappers,
          },
          {
            icon: icons.ability.expansion,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.FIELDS.expansion.label",
            ),
            wrappers: this._expansionWrappers,
          },
          {
            icon: icons.ability.cost,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.FIELDS.costs.label",
            ),
            wrappers: this._costWrappers,
          },
          {
            icon: icons.ui.info,
            label: "TERIOCK.SYSTEMS.Ability.PANELS.info",
            wrappers: simplifyTags(this._infoTags),
          },
          {
            icon: TERIOCK.options.effect.form[this.form].icon,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.PANELS.metaphysics",
            ),
            wrappers: [
              TERIOCK.options.effect.form[this.form].name || "",
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
