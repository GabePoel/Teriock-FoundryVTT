/**
 * Species panel part.
 * @param {typeof TeriockSpeciesModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockSpeciesModel}
     * @mixin
     */
    class SpeciesPanelPart extends Base {
      /** @inheritDoc */
      get panelParts() {
        const bars = [
          {
            icon: "fa-dice",
            label: "Stat Dice",
            wrappers: [
              this.statDice.hp.formula + " Hit Dice",
              this.statDice.mp.formula + " Mana Dice",
              `BR ${this.br}`,
            ],
          },
          {
            icon: "fa-person",
            label: "Lifespan",
            wrappers: [
              this.adult ? `Adult at ${this.adult} Years` : "",
              this.adult
                ? this.lifespan
                  ? `Lives to ${this.lifespan} Years`
                  : "Infinite Lifespan"
                : "",
            ],
          },
          {
            icon: "fa-child-reaching",
            label: "Size",
            wrappers: [
              `Size ${this.size.value}`,
              this.size.min && this.size.max
                ? `Size ${this.size.min} Minimum`
                : "",
              this.size.min && this.size.max
                ? `Size ${this.size.max} Maximum`
                : "",
            ],
          },
          {
            icon: "fa-flag",
            label: "Traits",
            wrappers: [
              ...this.traits.map((t) => TERIOCK.index.traits[t]),
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
