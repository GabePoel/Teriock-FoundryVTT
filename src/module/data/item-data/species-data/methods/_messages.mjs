import { documentOptions } from "../../../../constants/options/document-options.mjs";

/**
 * Generates message parts for a species.
 * @param {TeriockSpeciesModel} speciesData
 * @returns {Partial<Teriock.MessageData.MessagePanel>}
 * @private
 */
export function _messageParts(speciesData) {
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
      wrappers: [...speciesData.traits.map((t) => TERIOCK.index.traits[t])],
    },
  ];
  const blocks = [
    {
      title: "Hit increase",
      text: speciesData.hpIncrease,
    },
    {
      title: "Attribute increase",
      text: speciesData.attributeIncrease,
    },
    {
      title: "Innate ranks",
      text: speciesData.innateRanks,
    },
    {
      title: "Appearance",
      text: speciesData.appearance,
    },
    {
      title: "Description",
      text: speciesData.description,
    },
  ];
  return {
    bars: bars,
    blocks: blocks,
    icon: documentOptions.species.icon,
    label: documentOptions.species.name,
  };
}
