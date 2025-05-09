import { TeriockItem } from "../item.mjs";

export async function parseRank(rawHTML, className, classRank) {
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
    if (classRank < 2) {
        const rank0Temp = metaData.getAttribute('data-r0').split(',');
        for (const ability of rank0Temp) {
            rank0Names.push(ability.trim());
        }
    }
    if (classRank === 1) {
        const rank1Temp = metaData.getAttribute('data-r1').split(',');
        for (const ability of rank1Temp) {
            rank1Names.push(ability.trim());
        }
    }
    if (classRank === 2) {
        const rank2Temp = metaData.getAttribute('data-r2').split(',');
        for (const ability of rank2Temp) {
            rank2Names.push(ability.trim());
        }
    }
    if (classRank >= 3) {
        const rank3CombatTemp = metaData.getAttribute('data-r3c').split(',');
        for (const ability of rank3CombatTemp) {
            rank3CombatNames.push(ability.trim());
        }
        const rank3SupportAbilities = metaData.getAttribute('data-r3s').split(',');
        for (const ability of rank3SupportAbilities) {
            rank3SupportNames.push(ability.trim());
        }
    }
    for (const name of rank0Names) {
        const ability = await TeriockItem.implementation.create({
            name: name,
            type: 'ability',
        });
        await ability._wikiPull();
        rank0Abilities.push(ability._id);
    }
    for (const name of rank1Names) {
        const ability = await TeriockItem.implementation.create({
            name: name,
            type: 'ability',
        });
        await ability._wikiPull();
        rank1Abilities.push(ability._id);
    }
    for (const name of rank2Names) {
        const ability = await TeriockItem.implementation.create({
            name: name,
            type: 'ability',
        });
        await ability._wikiPull();
        rank2Abilities.push(ability._id);
    }
    for (const name of rank3CombatNames) {
        const ability = await TeriockItem.implementation.create({
            name: name,
            type: 'ability',
        });
        await ability._wikiPull();
        rank3CombatAbilities.push(ability._id);
    }
    for (const name of rank3SupportNames) {
        const ability = await TeriockItem.implementation.create({
            name: name,
            type: 'ability',
        });
        await ability._wikiPull();
        rank3SupportAbilities.push(ability._id);
    }
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
    const archetype = metaData.getAttribute('data-archetype');
    let hitDie = 'd10';
    let manaDie = 'd10';
    if (archetype == 'mage') {
        hitDie = 'd8';
        manaDie = 'd12';
    }
    if (archetype == 'warrior') {
        hitDie = 'd12';
        manaDie = 'd8';
    }
    const parameters = {
        possibleAbilities: possibleAbilities,
        maxAv: metaData.getAttribute('data-av'),
        archetype: metaData.getAttribute('data-archetype'),
        hitDie: hitDie,
        manaDie: manaDie,
        gainedAbilities: [],
    }
    if (getText('.class-flaws')) {
        parameters.flaws = getHTML('.class-flaws');
    } else {
        parameters.flaws = 'None.';
    }
    if (getText('.class-description')) {
        parameters.description = getHTML('.class-description');
    }
    const toTitleCase = (str) => {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };
    const out = {
        'system': parameters,
        'img': 'systems/teriock/assets/classes/' + className + '.svg',
        'name': 'Rank ' + classRank + ' ' + toTitleCase(className)
    }
    return out;
}