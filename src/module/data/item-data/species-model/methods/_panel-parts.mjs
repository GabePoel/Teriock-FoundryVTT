/**
 * Generates message parts for a species.
 * @param {TeriockSpeciesModel} speciesData
 * @returns {Partial<Teriock.MessageData.MessagePanel>}
 * @private
 */
export function _panelParts(speciesData) {
  const bars = [
    {
      icon: "fa-dice",
      label: "Stat Dice",
      wrappers: [
        speciesData.statDice.hp.formula + " Hit Dice",
        speciesData.statDice.mp.formula + " Mana Dice",
        `BR ${speciesData.br}`,
      ],
    },
    {
      icon: "fa-person",
      label: "Lifespan",
      wrappers: [
        speciesData.adult ? `Adult at ${speciesData.adult} Years` : "",
        speciesData.adult
          ? speciesData.lifespan
            ? `Lives to ${speciesData.lifespan} Years`
            : "Infinite Lifespan"
          : "",
      ],
    },
    {
      icon: "fa-child-reaching",
      label: "Size",
      wrappers: [
        `Size ${speciesData.size.value}`,
        speciesData.size.min && speciesData.size.max
          ? `Size ${speciesData.size.min} Minimum`
          : "",
        speciesData.size.min && speciesData.size.max
          ? `Size ${speciesData.size.max} Maximum`
          : "",
      ],
    },
    {
      icon: "fa-flag",
      label: "Traits",
      wrappers: [
        ...speciesData.traits.map((t) => TERIOCK.index.traits[t]),
        speciesData.isTransformation
          ? TERIOCK.options.effect.transformationLevel[
              speciesData.transformationLevel
            ]
          : "",
      ],
    },
  ];
  return {
    bars: bars,
  };
}
