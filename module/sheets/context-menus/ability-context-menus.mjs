import { makeIcon } from "../../helpers/utils.mjs";

export function contextMenus(ability) {
    function fetch(keyChain) {
        let keys = CONFIG.TERIOCK.abilityOptions
        const keysArray = keyChain.split('.');
        for (const key of keysArray) {
            keys = keys[key];
        }
        return keys;
    }
    function quickMenu(keyChain, updateKey, nullOption = null) {
        const keys = fetch(keyChain);
        const out = Object.entries(keys).map(([key, value]) => ({
            name: value,
            icon: CONFIG.TERIOCK.icons[key],
            callback: () => ability.update({ [updateKey]: key }),
        }));
        if (nullOption) {
            out.unshift({
                name: 'None',
                icon: CONFIG.TERIOCK.icons.remove,
                callback: () => ability.update({ [updateKey]: null }),
            });
        }
        return out;
    }
    return {
        delivery: quickMenu('delivery', 'system.delivery.base'),
        piercing: [
            {
                name: 'Normal',
                icon: CONFIG.TERIOCK.icons.remove,
                callback: () => ability.update({ 'system.piercing': 'normal' }),
            },
            {
                name: 'AV0',
                icon: CONFIG.TERIOCK.icons.av0,
                callback: () => ability.update({ 'system.piercing': 'av0' }),
            },
            {
                name: 'UB',
                icon: CONFIG.TERIOCK.icons.ub,
                callback: () => ability.update({ 'system.piercing': 'ub' }),
            }
        ],
        maneuver: [
            {
                name: 'Active',
                icon: CONFIG.TERIOCK.icons.active,
                callback: () => ability.update({
                    'system.maneuver': 'active',
                    'system.executionTime': 'a1'
                }),
            },
            {
                name: 'Reactive',
                icon: CONFIG.TERIOCK.icons.reactive,
                callback: () => ability.update({
                    'system.maneuver': 'reactive',
                    'system.executionTime': 'r1'
                }),
            },
            {
                name: 'Passive',
                icon: CONFIG.TERIOCK.icons.passive,
                callback: () => ability.update({
                    'system.maneuver': 'passive',
                    'system.executionTime': 'passive'
                }),
            },
            {
                name: 'Slow',
                icon: CONFIG.TERIOCK.icons.slow,
                callback: () => ability.update({
                    'system.maneuver': 'slow',
                    'system.executionTime': '10 Minutes'
                }),
            },
        ],
        active: quickMenu('executionTime.active', 'system.executionTime'),
        reactive: quickMenu('executionTime.reactive', 'system.executionTime'),
        interaction: quickMenu('interaction', 'system.interaction'),
        featSaveAttribute: quickMenu('featSaveAttribute', 'system.featSaveAttribute'),
        targets: Object.entries(fetch('targets')).flatMap(([key, value]) => ([
            {
                name: value,
                icon: CONFIG.TERIOCK.icons.unchecked,
                callback: async () => {
                    const currentTargets = foundry.utils.getProperty(ability.system, 'targets') || [];
                    const newTargets = [...currentTargets, key];
                    await ability.update({ 'system.targets': newTargets });
                },
                condition: () => {
                    const currentTargets = foundry.utils.getProperty(ability.system, 'targets') || [];
                    return !currentTargets.includes(key);
                }
            },
            {
                name: value,
                icon: CONFIG.TERIOCK.icons.checked,
                callback: async () => {
                    const currentTargets = foundry.utils.getProperty(ability.system, 'targets') || [];
                    const newTargets = currentTargets.filter(t => t !== key);
                    await ability.update({ 'system.targets': newTargets });
                },
                condition: () => {
                    const currentTargets = foundry.utils.getProperty(ability.system, 'targets') || [];
                    return currentTargets.includes(key);
                }
            }
        ])),
        manaCost: [
            {
                name: 'No Mana Cost',
                icon: CONFIG.TERIOCK.icons.remove,
                callback: () => ability.update({
                    'system.costs.mp': null,
                    'system.costs.manaCost': null,
                }),
            },
            {
                name: 'Numerical Cost',
                icon: CONFIG.TERIOCK.icons.numerical,
                callback: () => ability.update({
                    'system.costs.mp': '1 MP',
                    'system.costs.manaCost': null,
                }),
            },
            {
                name: 'Variable Cost',
                icon: CONFIG.TERIOCK.icons.variable,
                callback: () => ability.update({
                    'system.costs.mp': 'x',
                    'system.costs.manaCost': 'Insert text here.',
                }),
            }
        ],
        hitCost: [
            {
                name: 'No Hit Cost',
                icon: CONFIG.TERIOCK.icons.remove,
                callback: () => ability.update({
                    'system.costs.hp': null,
                    'system.costs.hitCost': null,
                }),
            },
            {
                name: 'Numerical Cost',
                icon: CONFIG.TERIOCK.icons.numerical,
                callback: () => ability.update({
                    'system.costs.hp': '1 HP',
                    'system.costs.hitCost': null,
                }),
            },
            {
                name: 'Hack Cost',
                icon: CONFIG.TERIOCK.icons.hack,
                callback: () => ability.update({
                    'system.costs.hp': 'hack',
                    'system.costs.hitCost': null,
                }),
            },
            {
                name: 'Variable Cost',
                icon: CONFIG.TERIOCK.icons.variable,
                callback: () => ability.update({
                    'system.costs.hp': 'x',
                    'system.costs.hitCost': 'Insert text here.',
                }),
            }
        ],
        breakCost: [
            {
                name: 'No Break Cost',
                icon: CONFIG.TERIOCK.icons.remove,
                callback: () => ability.update({
                    'system.costs.break': null,
                }),
            },
            {
                name: 'Shatter Cost',
                icon: CONFIG.TERIOCK.icons.shatter,
                callback: () => ability.update({
                    'system.costs.break': 'shatter',
                }),
            },
            {
                name: 'Destroy Cost',
                icon: CONFIG.TERIOCK.icons.destroy,
                callback: () => ability.update({
                    'system.costs.break': 'destroy',
                }),
            }
        ],
        expansion: quickMenu('expansion', 'system.expansion', true),
        expansionSaveAttribute: quickMenu('featSaveAttribute', 'system.expansionSaveAttribute'),
        attributeImprovement: quickMenu('attribute', 'system.improvements.attributeImprovement.attribute', true),
        attributeImprovementMinVal: Array.from({ length: 9 }, (_, i) => i - 3).map(i => ({
            name: i.toString(),
            icon: CONFIG.TERIOCK.icons.numerical,
            callback: () => ability.update({
                'system.improvements.attributeImprovement.minVal': i,
            }),
        })),
        featSaveImprovement: quickMenu('attribute', 'system.improvements.featSaveImprovement.attribute', true),
        featSaveImprovementAmount: quickMenu('featSaveImprovementAmount', 'system.improvements.featSaveImprovement.amount'),
        abilityType: Object.entries(fetch('abilityType')).map(([key, value]) => ({
            name: value.name,
            icon: makeIcon(value.icon, CONFIG.TERIOCK.iconStyles.contextMenu),
            callback: () => ability.update({
                'system.abilityType': key,
            }),
        })),
    }
}