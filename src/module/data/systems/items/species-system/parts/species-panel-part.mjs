import { Panel } from "../../../../pseudo-documents/_module.mjs";

/**
 * Species panel part.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function SpeciesPanelPart(Base) {
  /**
   * @mixin
   * @property {TeriockItem<"species">} parent
   */
  class SpeciesPanelPart extends Base {
    /** @inheritDoc */
    async getPanelParts() {
      const statBar = this._statBar;
      statBar.wrappers.push(_loc("TERIOCK.SYSTEMS.Species.PANELS.br", { value: this.br }));
      const bars = this._withKindBar([statBar, {
        icon: TERIOCK.DISPLAY.icons.manifest.species.lifespan,
        label: _loc("TERIOCK.SYSTEMS.Species.FIELDS.lifespan.enabled.label"),
        wrappers: this.lifespan.enabled
          ? [
            this.lifespan.adulthood
              ? _loc("TERIOCK.SYSTEMS.Species.PANELS.lifespan.adulthood", { value: this.lifespan.adulthood })
              : "",
            Number.isFinite(this.lifespan.max)
              ? _loc("TERIOCK.SYSTEMS.Species.PANELS.lifespan.max", { value: this.lifespan.max })
              : _loc("TERIOCK.SYSTEMS.Species.PANELS.lifespan.infinite"),
          ]
          : [],
      }, {
        icon: TERIOCK.DISPLAY.icons.manifest.species.size,
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
        icon: TERIOCK.DISPLAY.icons.manifest.species.traits,
        label: _loc("TERIOCK.SYSTEMS.Species.FIELDS.traits.label"),
        wrappers: Panel.simplifyTags(this._traitTags),
      }]);
      return { ...(await super.getPanelParts()), bars };
    }
  }

  return SpeciesPanelPart;
}
