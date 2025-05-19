import { createAbility } from "../../helpers/create-effects.mjs";

export default async function parseRank(rawHTML, item) {
    const className = item.system.className;
    const classRank = item.system.classRank;
    const archetype = item.system.archetype;
    const classValue = CONFIG.TERIOCK.rankOptions[archetype].classes[className].name;
    const abilities = item.transferredEffects.filter((effect) => effect.type === 'ability');
    for (const ability of abilities) {
        ability.delete();
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHTML, 'text/html');
    const metaData = doc.querySelector('.class-metadata');
    function getText(selector) {
        const element = doc.querySelector(selector);
        if (element) {
            return element.textContent.trim();
        }
    }
    function getHTML(selector) {
        const element = doc.querySelector(selector);
        if (element) {
            return element.innerHTML.trim();
        }
    }
    let possibleAbilities = {
        normal: [],
        archetype: [],
        combat: [],
        support: [],
    }
    let rank0Names = [];
    let rank0Abilities = [];
    let rank1Names = [];
    let rank1Abilities = [];
    let rank2Names = [];
    let rank2Abilities = [];
    let rank3CombatNames = [];
    let rank3CombatAbilities = [];
    let rank3SupportNames = [];
    let rank3SupportAbilities = [];
    let rotatorNames = [];
    let rotatorAbilities = [];
    if (classRank >= 2) {
        const rotatorElements = doc.querySelectorAll('.rotator');
        for (const element of rotatorElements) {
            const abilityName = element.textContent
            // console.log(abilityName)
            if (abilityName && abilityName.length > 0) {
                rotatorNames.push(abilityName.trim());
            }
        }
    }
    if (classRank === 0) {
        const rank0Temp = metaData.getAttribute('data-r0').split(',');
        for (const ability of rank0Temp) {
            if (ability.length > 0) {
                rank0Names.push(ability.trim());
            }
        }
    }
    if (classRank === 1) {
        const rank1Temp = metaData.getAttribute('data-r1').split(',');
        for (const ability of rank1Temp) {
            if (ability.length > 0) {
                rank1Names.push(ability.trim());
            }
        }
    }
    if (classRank === 2) {
        const rank2Temp = metaData.getAttribute('data-r2').split(',');
        for (const ability of rank2Temp) {
            if (ability.length > 0) {
                rank2Names.push(ability.trim());
            }
        }
    }
    if (classRank >= 3) {
        const rank3CombatTemp = metaData.getAttribute('data-r3c').split(',');
        for (const ability of rank3CombatTemp) {
            if (ability.length > 0) {
                rank3CombatNames.push(ability.trim());
            }
        }
        const rank3SupportAbilities = metaData.getAttribute('data-r3s').split(',');
        for (const ability of rank3SupportAbilities) {
            if (ability.length > 0) {
                rank3SupportNames.push(ability.trim());
            }
        }
    }
    for (const name of rank0Names) {
        await createAbility(item, name);
    }
    for (const name of rank1Names) {
        await createAbility(item, name);
    }
    for (const name of rank2Names) {
        await createAbility(item, name);
    }
    for (const name of rank3CombatNames) {
        await createAbility(item, name);
    }
    for (const name of rank3SupportNames) {
        await createAbility(item, name);
    }
    // for (const name of rotatorNames) {
    //     await createAbility(item, name);
    // }
    if (classRank < 2) {
        possibleAbilities.archetype = rank0Abilities;
    }
    if (classRank === 1) {
        possibleAbilities.normal = rank1Abilities;
    }
    if (classRank === 2) {
        possibleAbilities.normal = rank2Abilities;
    }
    if (classRank >= 3) {
        possibleAbilities.combat = rank3CombatAbilities;
        possibleAbilities.support = rank3SupportAbilities;
    }
    if (classRank >= 2) {
        possibleAbilities.rotator = rotatorAbilities;
    }
    let hitDie = 'd10';
    let manaDie = 'd10';
    let hp = 6;
    let mp = 6;
    if (archetype == 'mage') {
        hitDie = 'd8';
        manaDie = 'd12';
        hp = 5;
        mp = 7;
    }
    if (archetype == 'warrior') {
        hitDie = 'd12';
        manaDie = 'd8';
        hp = 7;
        mp = 5;
    }
    const parameters = {
        possibleAbilities: possibleAbilities,
        maxAv: metaData.getAttribute('data-av'),
        archetype: metaData.getAttribute('data-archetype'),
        hitDie: hitDie,
        manaDie: manaDie,
        gainedAbilities: [],
        hp: hp,
        mp: mp,
    }
    if (getText('.class-flaws')) {
        parameters.flaws = getHTML('.class-flaws');
    } else {
        parameters.flaws = 'None.';
    }
    if (getText('.class-description')) {
        parameters.description = getHTML('.class-description');
    }
    const out = {
        'system': parameters,
        'img': 'systems/teriock/assets/classes/' + className + '.svg',
        'name': 'Rank ' + classRank + ' ' + classValue,
    }
    return out;
}
