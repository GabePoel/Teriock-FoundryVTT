import { equipmentclasses } from './generated/equipment-classes.mjs';
import { properties } from './generated/properties.mjs';
import { magicalProperties } from './generated/magical-properties.mjs';
import { materialProperties } from './generated/material-properties.mjs';
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
        }
    },
    equipmentClasses: equipmentclasses,
    properties: properties,
    magicalProperties: magicalProperties,
    materialProperties: materialProperties,
    weaponFightingStyles: weaponFightingStyles,
}