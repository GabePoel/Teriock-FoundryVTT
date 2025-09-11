import {
  addAbilitiesBlock, addFluenciesBlock, addResourcesBlock,
} from "../../../../helpers/messages-builder/message-parts.mjs";

/**
 * Generates message parts for a species.
 * @param {TeriockSpeciesData} speciesData
 * @returns {Partial<Teriock.MessageData.MessageParts>}
 * @private
 */
export function _messageParts(speciesData) {
  const bars = [
    {
      icon: "fa-dice",
      label: "Stat Dice",
      wrappers: [
        speciesData.hpDiceFormula + " Hit Dice",
        speciesData.mpDiceFormula + " Mana Dice",
      ],
    },
    {
      icon: "fa-person",
      label: "Lifespan",
      wrappers: [
        speciesData.adult ? `Adult at ${speciesData.adult} Years` : "",
        speciesData.adult ? speciesData.lifespan ? `Lives to ${speciesData.lifespan} Years` : "Infinite Lifespan" : "",
      ],
    },
    {
      icon: "fa-child-reaching",
      label: "Size",
      wrappers: [
        `Size ${speciesData.size.value}`,
        speciesData.size.min && speciesData.size.max ? `Size ${speciesData.size.min} Minimum` : "",
        speciesData.size.min && speciesData.size.max ? `Size ${speciesData.size.max} Maximum` : "",
      ],
    },
    {
      icon: "fa-flag",
      label: "Traits",
      wrappers: [
        ...speciesData.traits.map((t) => TERIOCK.index.traits[t]),
      ],
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
  addAbilitiesBlock(speciesData.parent.transferredEffects.filter((e) => !e.sup), blocks);
  addResourcesBlock(speciesData.parent.transferredEffects, blocks);
  addFluenciesBlock(speciesData.parent.transferredEffects, blocks);
  return {
    bars: bars,
    blocks: blocks,
  };
}
