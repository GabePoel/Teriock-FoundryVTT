import { addAbilitiesBlock } from "./message-parts.mjs";

export function buildEquipmentMessage(equipment) {
  const ref = CONFIG.TERIOCK.equipmentOptions;
  const src = equipment.system;
  let damageString = '';
  if (src.damage) {
    damageString += src.damage;
    if (src.twoHandedDamage != 0) {
      damageString += ' / ' + src.twoHandedDamage;
    }
    damageString += ' damage';
  }
  let rangeString = '';
  if (src.range) {
    rangeString += src.range;
    if (src.shortRange) {
      rangeString = src.shortRange + ' / ' + rangeString;
    }
    rangeString += ' ft';
  }
  const bars = [
    {
      icon: 'fa-' + ref.powerLevel[src.powerLevel].icon,
      wrappers: [
        ref.powerLevel[src.powerLevel].name,
        src.shattered ? 'Shattered' : '',
        src.equipmentType,
      ]
    },
    {
      icon: 'fa-crosshairs-simple',
      wrappers: [
        damageString,
        rangeString,
        src.sb,
        src.av,
        src.bv
      ]
    },
    {
      icon: 'fa-weight-hanging',
      wrappers: [
        src.weight + ' lb',
        src.minStr + ' min STR',
        src.tier ? 'Tier ' + src.tier : '',
      ]
    },
    {
      icon: 'fa-flag',
      wrappers: [
        ...src.equipmentClasses.map(equipmentClass => ref.equipmentClasses[equipmentClass]),
      ]
    },
    {
      icon: 'fa-circle-info',
      wrappers: [
        ...src.properties.map(prop => ref.properties[prop]),
      ]
    },
    {
      icon: 'fa-sparkle',
      wrappers: [
        ...src.magicalProperties.map(prop => ref.magicalProperties[prop])
      ]
    },
    {
      icon: 'fa-cube',
      wrappers: [
        ...src.materialProperties.map(prop => ref.materialProperties[prop]),
      ]
    }
  ]
  const blocks = [
    {
      title: 'Description',
      text: src.description,
    },
    {
      title: 'Notes',
      text: src.notes,
    },
    {
      title: 'Equipment type rules',
      text: src.specialRules,
    },
    {
      title: 'Mana storing',
      text: src.manaStoring,
    },
    {
      title: 'Flaws',
      text: src.flaws,
    },
    {
      title: 'Item tier',
      text: src.fllTier,
    }
  ]
  addAbilitiesBlock(equipment.transferredEffects, blocks);
  return {
    bars: bars,
    blocks: blocks,
  }
}

export function buildSecretEquipmentMessage(equipment) {
  const ref = CONFIG.TERIOCK.equipmentOptions;
  const src = equipment.system;
  let damageString = '';
  if (src.damage) {
    damageString += src.damage;
    if (src.twoHandedDamage != 0) {
      damageString += ' / ' + src.twoHandedDamage;
    }
    damageString += ' damage';
  }
  const bars = [
    {
      icon: 'fa-cube',
      wrappers: [
        ...src.materialProperties.map(prop => ref.materialProperties[prop]),
      ]
    }
  ]
  const blocks = [
    {
      title: 'Noticeable properties',
      text: src.noticeableProperties,
    }
  ]
  return {
    bars: bars,
    blocks: blocks,
  }
}