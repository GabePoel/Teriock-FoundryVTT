import { icons } from "../../../../../constants/display/icons.mjs";
import { asInf } from "../../../../../helpers/icon.mjs";
import { simplifyTags } from "../../../../../helpers/panel.mjs";

/**
 * Species panel part.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, SpeciesPanelPart>}
 */
export default function SpeciesPanelPart(Base) {
  /**
   * @mixin
   * @property {TeriockSpecies} parent
   */
  class SpeciesPanelPart extends Base {
    /** @inheritDoc */
    async getPanelParts() {
      const statBar = this._statBar;
      statBar.wrappers.push(_loc("TERIOCK.SYSTEMS.Species.PANELS.br", { value: this.br }));
      const bars = this._withKindBar([statBar, {
        icon: icons.species.lifespan,
        label: _loc("TERIOCK.SYSTEMS.Species.PANELS.lifespan.label"),
        wrappers: [
          this.adult ? _loc("TERIOCK.SYSTEMS.Species.PANELS.lifespan.adult", { value: this.adult }) : "",
          this.adult
            ? this.lifespan
              ? _loc("TERIOCK.SYSTEMS.Species.PANELS.lifespan.max", { value: asInf(this.lifespan) })
              : _loc("TERIOCK.SYSTEMS.Species.PANELS.lifespan.infinite")
            : "",
        ],
      }, {
        icon: icons.species.size,
        label: _loc("TERIOCK.SYSTEMS.Species.FIELDS.size.enabled.label"),
        wrappers: this.size.enabled
          ? [
            _loc("TERIOCK.SYSTEMS.Species.PANELS.size.value", { value: this.size.value }),
            this.size.min && this.size.max
              ? _loc("TERIOCK.SYSTEMS.Species.PANELS.size.min", { value: this.size.min })
              : "",
            this.size.min && this.size.max
              ? _loc("TERIOCK.SYSTEMS.Species.PANELS.size.max", { value: this.size.max })
              : "",
          ]
          : [],
      }, {
        icon: icons.species.traits,
        label: _loc("TERIOCK.SYSTEMS.Species.FIELDS.traits.label"),
        wrappers: simplifyTags(this._traitTags),
      }]);
      return { ...(await super.getPanelParts()), bars };
    }
  }

  return SpeciesPanelPart;
}
