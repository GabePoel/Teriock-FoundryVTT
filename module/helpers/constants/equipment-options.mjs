import { equipmentclasses } from './generated/equipment-classes.mjs';
import { magicalProperties } from './generated/magical-properties.mjs';
import { materialProperties } from './generated/material-properties.mjs';
import { properties } from './generated/properties.mjs';
import { weaponFightingStyles } from './generated/weapon-fighting-styles.mjs';

export const equipmentOptions = {
  powerLevel: {
    mundane: {
      name: 'Mundane',
      icon: 'wand',
      color: '#986a44',
    },
    enchanted: {
      name: 'Enchanted',
      icon: 'wand-sparkles',
      color: '#3584e4',
    },
    magic: {
      name: 'Magic',
      icon: 'sparkles',
      color: '#9141ac',
    },
    unknown: {
      name: 'Unknown',
      icon: 'question',
      color: '#77767b',
    }
  },
  powerLevelShort: {
    mundane: "Mundane",
    enchanted: "Enchanted",
    magic: "Magic",
    unknown: "Unknown"
  },
  equipmentClasses: equipmentclasses,
  properties: properties,
  magicalProperties: magicalProperties,
  materialProperties: materialProperties,
  weaponFightingStyles: weaponFightingStyles,
  unidentifiedProperties: [
    'Ammunition',
    'AP',
    'AV0',
    'Bashing',
    'Bejeweled',
    'Blocking',
    'Burning',
    'Cumbersome',
    'Destroyed',
    'Flaming',
    'Fragile',
    'Glowing',
    'Loading',
    'Master Crafted',
    'Morganti',
    'Ranged',
    'Reach',
    'Searchable',
    'Shattered',
    'Small',
    'Snagging',
    'Special',
    'Thrown',
    'Two-Handed',
    'UB',
    'Versatile',
    'Weapon',
  ]
}