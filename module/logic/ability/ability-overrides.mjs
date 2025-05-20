export default function abilityOverrides(ability, changes) {
    if (ability.name == "Unbreachability") {
        changes.push({
            key: 'system.wornAc',
            mode: 4,
            value: 1,
            priority: 20,
        });
    } else if (ability.name == "Dragon Scales") {
        changes.push({
            key: 'system.av',
            mode: 2,
            value: 2,
            priority: 20,
        });
    } else if (ability.name.startsWith("Talented")) {
        const tradecraft = ability.name.split(" ")[1];
        changes.push({
            key: 'system.tradecrafts.' + tradecraft + '.bonus',
            mode: 4,
            value: 1,
            priority: 20,
        });
    } else if (ability.name.startsWith("Expert")) {
        const tradecraft = ability.name.split(" ")[1];
        changes.push({
            key: 'system.tradecrafts.' + tradecraft + '.bonus',
            mode: 4,
            value: 2,
            priority: 20,
        });
    } else if (ability.name.startsWith("Agile")) {
        changes.push({
            key: 'system.speedAdjustments.difficultTerrain',
            mode: 4,
            value: 3,
            priority: 20,
        })
    } else if (ability.name.startsWith("Climbing")) {
        let amount = 2;
        if (ability.parent?.system?.proficient) {
            amount = 3;
        }
        changes.push({
            key: 'system.speedAdjustments.climb',
            mode: 4,
            value: amount,
            priority: 20,
        })
    } else if (ability.name.startsWith("Digging")) {
        changes.push({
            key: 'system.speedAdjustments.dig',
            mode: 4,
            value: 1,
            priority: 20,
        })
    } else if (ability.name.startsWith("Flying")) {
        let amount = 2;
        if (ability.parent?.system?.proficient) {
            amount = 3;
        }
        changes.push({
            key: 'system.speedAdjustments.fly',
            mode: 4,
            value: amount,
            priority: 20,
        })
    } else if (ability.name.startsWith("Gliding")) {
        changes.push({
            key: 'system.speedAdjustments.fly',
            mode: 4,
            value: 1,
            priority: 20,
        })
    } else if (ability.name.startsWith("Leap")) {
        changes.push({
            key: 'system.speedAdjustments.leapHorizontal',
            mode: 4,
            value: 2,
            priority: 20,
        })
        changes.push({
            key: 'system.speedAdjustments.leapVertical',
            mode: 4,
            value: 1,
            priority: 20,
        })
    } else if (ability.name.startsWith("Shadowcreep Acrobatics")) {
        changes.push({
            key: 'system.speedAdjustments.difficultTerrain',
            mode: 2,
            value: 1,
            priority: 25,
        })
        changes.push({
            key: 'system.speedAdjustments.crawl',
            mode: 2,
            value: 1,
            priority: 25,
        })
        changes.push({
            key: 'system.speedAdjustments.climb',
            mode: 2,
            value: 1,
            priority: 25,
        })
        changes.push({
            key: 'system.speedAdjustments.hidden',
            mode: 2,
            value: 1,
            priority: 25,
        })
        changes.push({
            key: 'system.speedAdjustments.leapHorizontal',
            mode: 2,
            value: 1,
            priority: 25,
        })
        changes.push({
            key: 'system.speedAdjustments.leapVertical',
            mode: 2,
            value: 1,
            priority: 25,
        })
    } else if (ability.name.startsWith("Natural Hide")) {
        changes.push({
            key: 'system.naturalAv',
            mode: 4,
            value: 1,
            priority: 20,
        })
    } else if (ability.name.startsWith("Natural Scales")) {
        changes.push({
            key: 'system.naturalAv',
            mode: 4,
            value: 2,
            priority: 20,
        })
    } else if (ability.name.startsWith("Natural Half Plate")) {
        changes.push({
            key: 'system.naturalAv',
            mode: 4,
            value: 3,
            priority: 20,
        })
    } else if (ability.name.startsWith("Natural Full Plate")) {
        changes.push({
            key: 'system.naturalAv',
            mode: 4,
            value: 4,
            priority: 20,
        })
    } else if (ability.name.startsWith("Cannot Swim")) {
        changes.push({
            key: 'system.speedAdjustments.swim',
            mode: 6,
            value: 0,
            priority: 30,
        })
    }
    return changes;
}