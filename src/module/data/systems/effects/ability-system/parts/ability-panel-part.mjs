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
      const bars = this._withKindBar([{
        icon: TERIOCK.display.icons.manifest.ability.execution,
        label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.execution"),
        wrappers: this._executionWrappers,
      }, {
        icon: TERIOCK.display.icons.manifest.ability.target,
        label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.targeting"),
        wrappers: this._targetingWrappers,
      }, {
        icon: TERIOCK.display.icons.manifest.ability.expansion,
        label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.expansion.label"),
        wrappers: this._expansionWrappers,
      }, {
        icon: TERIOCK.display.icons.manifest.ability.cost,
        label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.costs.label"),
        wrappers: simplifyTags(this._costTags),
      }, {
        icon: TERIOCK.display.icons.manifest.ui.info,
        label: "TERIOCK.SYSTEMS.Ability.PANELS.info",
        wrappers: simplifyTags(this._infoTags),
      }, this._metaphysicsBar]);
      return {
        ...(await super.getPanelParts()),
        bars,
        classes: this.elderSorcery ? ["elder-sorcery", elementClass(this.elements)] : [],
      };
    }
  }

  return AbilityPanelPart;
}
