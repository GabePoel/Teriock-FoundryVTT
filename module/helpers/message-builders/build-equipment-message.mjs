export function buildEquipmentMessage(equipment) {
    const ref = CONFIG.TERIOCK.equipmentOptions;
    const src = equipment.system;
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
                src.damage ? src.damage + ' Damage' : '',
                src.range,
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
    if (equipment.transferredEffects.length > 0) {
        let abilitiesText = '<ul>';
        for (const effect of equipment.transferredEffects) {
            const name = effect.name;
            abilitiesText += `<li>${name}</li>`;
        }
        abilitiesText += '</ul>';
        blocks.push({
            title: 'Abilities',
            text: abilitiesText,
        })
    }
    return {
        bars: bars,
        blocks: blocks,
    }
}