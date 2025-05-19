export function buildAbilityMessage(ability) {
    const ref = CONFIG.TERIOCK.abilityOptions;
    const src = ability.system;
    const bars = [
        {
            icon: 'fa-wreath-laurel',
            wrappers: [
                ref.executionTime[src.maneuver][src.executionTime],
                ref.piercing[src.piercing],
                ref.delivery[src.delivery.base],
                src.interaction == 'feat' ? ref.featSaveAttribute[src.featSaveAttribute] : '',
                ref.interaction[src.interaction],
            ]
        },
        {
            icon: 'fa-crosshairs-simple',
            wrappers: [
                ['missile', 'cone', 'sight', 'aura'].includes(src.delivery.base) ? src.range : '',
                src.delivery.base != 'self' ? src.targets.map(target => ref.targets[target]).join(', ') : '',
                src.duration,
            ]
        },
        {
            icon: 'fa-expand',
            wrappers: [
                ['detonate', 'ripple'].includes(src.expansion) ? ref.attribute[src.expansionSaveAttribute] : '',
                ref.expansion[src.expansion],
                src.expansionRange?.includes(',') ? src.expansionRange.split(',')[0] : [src.expansionRange],
                src.expansionRange?.includes(',') ? src.expansionRange.split(',')[1] : [src.expansionRange],
            ]
        },
        {
            icon: 'fa-coins',
            wrappers: [
                src.costs.mp == 'x' ? 'Variable MP' : src.costs.mp ? src.costs.mp + ' MP' : '',
                src.costs.hp == 'x' ? 'Variable HP' : src.costs.hp == 'hack' ? 'Hack' : src.costs.hp ? src.costs.hp + ' HP' : '',
                ref.breakCost[src.costs.break],
                src.costs.verbal ? 'Verbal' : '',
                src.costs.somatic ? 'Somatic' : '',
                src.costs.material ? 'Material' : '',
                src.costs.invoked ? 'Invoked' : ''
            ]
        },
        {
            icon: 'fa-bolt',
            wrappers: [
                src.basic ? 'Basic' : '',
                src.sustained ? 'Sustained' : '',
                src.standard && src.skill ? 'Semblant' : '',
                src.standard && src.spell ? 'Conjured' : '',
                ...src.powerSources.map(power => ref.powerSources[power]),
                ...src.elements.map(element => ref.elements[element]),
                src.ritual ? 'Ritual' : '',
                src.rotator ? 'Rotator' : '',
                src.skill ? 'Skill' : '',
                src.spell ? 'Spell' : ''
            ]
        },
        {
            icon: 'fa-sparkle',
            wrappers: [
                ...src.effects.map(effect => ref.effects[effect])
            ]
        }
    ]
    const blocks = [
        {
            title: 'Elder Sorcery incant',
            text: src.elderSorceryIncant,
        },
        {
            title: 'Mana cost',
            text: src.costs.manaCost,
        },
        {
            title: 'Hit cost',
            text: src.costs.hitCost,
        },
        {
            title: 'Material cost',
            text: src.costs.materialCost,
        },
        {
            title: 'Trigger',
            text: src.trigger,
        },
        {
            title: 'Requirements',
            text: src.requirements,
        },
        {
            title: 'Description',
            text: src.overview.base,
        },
        {
            title: 'If proficient',
            text: src.overview.proficient,
        },
        {
            title: 'If fluent',
            text: src.overview.fluent,
        },
        {
            title: 'On critical fail',
            text: src.results.critFail,
        },
        {
            title: 'On fail',
            text: src.results.fail,
        },
        {
            title: 'On success',
            text: src.results.save,
        },
        {
            title: 'On critical success',
            text: src.results.critSave,
        },
        {
            title: 'On critical hit',
            text: src.results.critHit,
        },
        {
            title: 'On hit',
            text: src.results.hit,
        },
        {
            title: 'On miss',
            text: src.results.miss,
        },
        {
            title: 'On critical miss',
            text: src.results.critMiss,
        },
        {
            title: 'Heightened',
            text: src.heightened,
        },
        {
            title: 'End condition',
            text: src.endCondition,
        },
    ]
    return {
        bars: bars,
        blocks: blocks
    }
}