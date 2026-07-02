import { icons } from "../../../../../constants/display/icons.mjs";
import { simplifyTags } from "../../../../../helpers/panel.mjs";

/**
 * Species panel part.
 * @param {typeof SpeciesSystem} Base
 */
export default function SpeciesPanelPart(Base) {
  return (
    /**
     * @mixin
     */
    class SpeciesPanelPart extends Base {
      /** @inheritDoc */
      async getPanelParts() {
        const statBar = this._statBar;
        statBar.wrappers.push(_loc("TERIOCK.SYSTEMS.Species.PANELS.br", { value: this.br }));
        const bars = [statBar, {
          icon: icons.species.lifespan,
          label: _loc("TERIOCK.SYSTEMS.Species.PANELS.lifespan.label"),
          wrappers: [
            this.adult ? _loc("TERIOCK.SYSTEMS.Species.PANELS.lifespan.adult", { value: this.adult }) : "",
            this.adult
              ? this.lifespan
                ? _loc("TERIOCK.SYSTEMS.Species.PANELS.lifespan.max", { value: this.lifespan })
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
        }];
        return { ...(await super.getPanelParts()), bars };
      }
    }
  );
}
