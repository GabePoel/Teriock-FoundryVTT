export function _messageParts(property) {
  const ref = CONFIG.TERIOCK.abilityOptions;
  const blocks = [
    {
      title: 'Description',
      text: property.system.description,
    },
  ]
  return {
    bars: [
      {
        icon: 'fa-' + ref.abilityType[property.system.propertyType].icon,
        wrappers: [
          ref.abilityType[property.system.propertyType].name,
        ],
      }
    ],
    blocks: blocks,
  }
}