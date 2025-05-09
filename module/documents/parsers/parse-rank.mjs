import { TeriockItem } from "../item.mjs";

async function getFolders(pack, path) {
    let children = null;
    const levels = path.split('/');
    let targetFolderName = levels.shift();
    let folder = null;
    let found = false;
    const folders = [];
    for (const f of game.packs.get(pack).folders) {
        if (f.name === targetFolderName) {
            folder = f;
            found = true;
            break;
        }
    }
    if (!found) {
        folder = await foundry.documents.Folder.implementation.create({
            name: targetFolderName,
            type: 'Item',
        }, {
            pack: pack,
        })
    }
    folders.push(folder);
    children = folder.children;
    while (levels.length > 0) {
        found = false;
        targetFolderName = levels.shift();
        for (const f of children) {
            if (f.folder.name === targetFolderName) {
                folder = f;
                found = true;
                break;
            }
        }
        if (!found) {
            const newFolder = await foundry.documents.Folder.implementation.create({
                name: targetFolderName,
                folder: folder._id,
                type: folder.type,
            }, {
                pack: pack,
            })
            folder = newFolder;
        }
        if (folder.folder) {
            folder = folder.folder;
        }
        folders.push(folder);
        children = folder.children;
    }
    return folders;
}

async function checkContents(folder, name) {
    for (const item of folder.contents) {
        if (item.name === name) {
            return item;
        }
    }
    return null;
}

export async function parseRank(rawHTML, item) {
    const className = item.system.className;
    const classRank = item.system.classRank;
    const archetype = item.system.archetype;
    const classValue = CONFIG.TERIOCK.rankOptions[archetype].classes[className].name;
    const archetypeValue = CONFIG.TERIOCK.rankOptions[archetype].name;
    let pack = null;
    if (item.inCompendium) {
        pack = game.packs.get(item.pack);
    }
    let folders = null;
    if (pack) {
        let path = 'Abilities/';
        path += archetypeValue + '/';
        path += classValue;
        folders = await getFolders(item.pack, path);
        console.log(folders);
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
            console.log(abilityName)
            if (abilityName && abilityName.length > 0) {
                rotatorNames.push(abilityName.trim());
            }
        }
    }
    if (classRank < 2) {
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
    console.log('Rank 0', rank0Names);
    for (const name of rank0Names) {
        if (folders) {
            const folder = folders[folders.length - 2];
            let ability = await checkContents(folder, name);
            if (!ability) {
                ability = await TeriockItem.implementation.create({
                    name: name,
                    type: 'ability',
                }, {
                    pack: item.pack,
                });
                await ability._wikiPull();
                await ability.update({ folder: folder._id });
            }
            const abilitySummary = {
                _id: ability._id,
                name: ability.name,
            }
            rank0Abilities.push(abilitySummary);
        }
    }
    for (const name of rank1Names) {
        if (folders) {
            const folder = folders[folders.length - 1];
            let ability = await checkContents(folder, name);
            if (!ability) {
                ability = await TeriockItem.implementation.create({
                    name: name,
                    type: 'ability',
                }, {
                    pack: item.pack,
                });
                await ability._wikiPull();
                await ability.update({ folder: folder._id });
            }
            const abilitySummary = {
                _id: ability._id,
                name: ability.name,
            }
            rank1Abilities.push(abilitySummary);
        }
    }
    for (const name of rank2Names) {
        if (folders) {
            const folder = folders[folders.length - 1];
            let ability = await checkContents(folder, name);
            if (!ability) {
                ability = await TeriockItem.implementation.create({
                    name: name,
                    type: 'ability',
                }, {
                    pack: item.pack,
                });
                await ability._wikiPull();
                await ability.update({ folder: folder._id });
            }
            const abilitySummary = {
                _id: ability._id,
                name: ability.name,
            }
            rank2Abilities.push(abilitySummary);
        }
    }
    for (const name of rank3CombatNames) {
        if (folders) {
            const folder = folders[folders.length - 1];
            let ability = await checkContents(folder, name);
            if (!ability) {
                ability = await TeriockItem.implementation.create({
                    name: name,
                    type: 'ability',
                }, {
                    pack: item.pack,
                });
                await ability._wikiPull();
                await ability.update({ folder: folder._id });
            }
            const abilitySummary = {
                _id: ability._id,
                name: ability.name,
            }
            rank3CombatAbilities.push(abilitySummary);
        }
    }
    for (const name of rank3SupportNames) {
        if (folders) {
            const folder = folders[folders.length - 1];
            let ability = await checkContents(folder, name);
            if (!ability) {
                ability = await TeriockItem.implementation.create({
                    name: name,
                    type: 'ability',
                }, {
                    pack: item.pack,
                });
                await ability._wikiPull();
                await ability.update({ folder: folder._id });
            }
            const abilitySummary = {
                _id: ability._id,
                name: ability.name,
            }
            rank3SupportAbilities.push(abilitySummary);
        }
    }
    for (const name of rotatorNames) {
        if (folders) {
            const folder = folders[folders.length - 1];
            let ability = await checkContents(folder, name);
            if (!ability) {
                ability = await TeriockItem.implementation.create({
                    name: name,
                    type: 'ability',
                }, {
                    pack: item.pack,
                });
                await ability._wikiPull();
                await ability.update({ folder: folder._id });
            }
            const abilitySummary = {
                _id: ability._id,
                name: ability.name,
            }
            rotatorAbilities.push(abilitySummary);
        }
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
    if (classRank >= 2) {
        possibleAbilities.rotator = rotatorAbilities;
    }
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
    if (pack) {
        parameters.sourcePack = item.pack;
    }
    const out = {
        'system': parameters,
        'img': 'systems/teriock/assets/classes/' + className + '.svg',
        'name': 'Rank ' + classRank + ' ' + classValue,
    }
    return out;
}