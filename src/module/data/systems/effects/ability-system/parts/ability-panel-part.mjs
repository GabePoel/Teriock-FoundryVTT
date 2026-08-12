import { icons } from "../../../../../constants/display/icons.mjs";
import { elementClass } from "../../../../../helpers/html.mjs";
import { simplifyTags } from "../../../../../helpers/panel.mjs";

/**
 * Ability panel part.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityPanelPart>}
 */
export default function AbilityPanelPart(Base) {
  /**
   * @mixin
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityPanelPart extends Base {
    /** @inheritDoc */
    async getPanelParts() {
      const bars = this._withKindBar([
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
          wrappers: simplifyTags(this._costTags),
        },
        { icon: icons.ui.info, label: "TERIOCK.SYSTEMS.Ability.PANELS.info", wrappers: simplifyTags(this._infoTags) },
        this._metaphysicsBar,
      ]);
      return {
        ...(await super.getPanelParts()),
        bars,
        classes: this.elderSorcery ? ["elder-sorcery", elementClass(this.elements)] : [],
      };
    }
  }

  return AbilityPanelPart;
}
