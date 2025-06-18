import { addAbilitiesBlock } from "../../../../helpers/messages-builder/message-parts.mjs";

export function _messageParts(power) {
  const ref = CONFIG.TERIOCK.powerOptions;
  const src = power.system;
  const bars = [
    {
      icon: 'fa-' + ref[src.type].icon,
      wrappers: [
        ref[src.type].name,
      ]
    }
  ]
  if (power.system.type == 'species') {
    bars.push({
      icon: 'fa-user',
      wrappers: [
        power.system.size ? 'Size ' + power.system.size : '',
        power.system.adult ? 'Adult at ' + power.system.adult : '',
        power.system.lifespan ? power.system.lifespan + ' Year Lifespan' : 'Infinite Lifespan',
      ]
    })
  }
  const blocks = [
    {
      title: 'Description',
      text: src.description,
    },
    {
      title: 'Other Flaws',
      text: src.flaws,
    }
  ]
  addAbilitiesBlock(power.transferredEffects, blocks);
  return {
    bars: bars,
    blocks: blocks,
  }
}