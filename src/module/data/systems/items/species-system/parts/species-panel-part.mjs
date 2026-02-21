import { icons } from "../../../../../constants/display/icons.mjs";

/**
 * Species panel part.
 * @param {typeof SpeciesSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {SpeciesSystem}
     * @mixin
     */
    class SpeciesPanelPart extends Base {
      /** @inheritDoc */
      get panelParts() {
        const statBar = this._statBar;
        statBar.wrappers.push(
          game.i18n.format("TERIOCK.SYSTEMS.Species.PANELS.br", {
            value: this.br,
          }),
        );
        const bars = [
          statBar,
          {
            icon: icons.species.lifespan,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Species.PANELS.lifespan.label",
            ),
            wrappers: [
              this.adult
                ? game.i18n.format(
                    "TERIOCK.SYSTEMS.Species.PANELS.lifespan.adult",
                    {
                      value: this.adult,
                    },
                  )
                : "",
              this.adult
                ? this.lifespan
                  ? game.i18n.format(
                      "TERIOCK.SYSTEMS.Species.PANELS.lifespan.max",
                      { value: this.lifespan },
                    )
                  : game.i18n.localize(
                      "TERIOCK.SYSTEMS.Species.PANELS.lifespan.infinite",
                    )
                : "",
            ],
          },
          {
            icon: icons.species.size,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Species.FIELDS.size.enabled.label",
            ),
            wrappers: this.size.enabled
              ? [
                  game.i18n.format(
                    "TERIOCK.SYSTEMS.Species.PANELS.size.value",
                    {
                      value: this.size.value,
                    },
                  ),
                  this.size.min && this.size.max
                    ? game.i18n.format(
                        "TERIOCK.SYSTEMS.Species.PANELS.size.min",
                        {
                          value: this.size.min,
                        },
                      )
                    : "",
                  this.size.min && this.size.max
                    ? game.i18n.format(
                        "TERIOCK.SYSTEMS.Species.PANELS.size.max",
                        {
                          value: this.size.max,
                        },
                      )
                    : "",
                ]
              : [],
          },
          {
            icon: icons.species.traits,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Species.FIELDS.traits.label",
            ),
            wrappers: [
              ...this.traits.map((t) => TERIOCK.reference.traits[t]),
              this.isTransformation
                ? TERIOCK.options.effect.transformationLevel[
                    this.transformationLevel
                  ]
                : "",
            ],
          },
        ];
        return {
          ...super.panelParts,
          bars,
        };
      }
    }
  );
};
