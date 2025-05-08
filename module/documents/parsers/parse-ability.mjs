import { cleanFeet, cleanMp, cleanHp } from "../../helpers/clean.mjs";

export function parseAbility(rawHTML) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHTML, 'text/html');

    const subContainers = doc.querySelectorAll('.ability-sub-container');
    subContainers.forEach(el => el.remove());

    const diceElements = doc.querySelectorAll('.dice');
    diceElements.forEach(el => {
        const fullRoll = el.getAttribute('data-full-roll');
        const quickRoll = el.getAttribute('data-quick-roll');
        if (quickRoll) {
            el.textContent = `[[/roll ${fullRoll}]]`;
        }
    });

    // const allElements = doc.querySelectorAll('[class]');
    const allElements = doc.querySelectorAll('.tag-container');
    console.log(allElements);
    const masterTaggedLists = [];

    allElements.forEach(el => {
        const taggedClasses = Array.from(el.classList)
            .filter(className => className.endsWith('-tagged'))
            .map(className => className.replace('-tagged', ''));

        if (taggedClasses.length > 0) {
            masterTaggedLists.push(taggedClasses);
        }
    });

    const tagSubs = doc.querySelectorAll('.tag-sub');
    tagSubs.forEach(el => el.remove());

    // console.log('Master list of cleaned tagged classes:', masterTaggedLists);

    const tagTree = {};

    masterTaggedLists.forEach(list => {
        if (list.length === 1) {
            if (!tagTree[list[0]]) {
                tagTree[list[0]] = true;
            }
        } else if (list.length > 1) {
            if (!tagTree[list[0]]) {
                tagTree[list[0]] = [];
            }
            tagTree[list[0]].push(...list.slice(1));
        }
    });

    console.log(tagTree);

    function getBarText(selector, clean = false) {
        const elements = doc.querySelectorAll('.ability-bar-' + selector + ' .ability-bar-content');
        const text = Array.from(elements).map(el => el.innerHTML)[0] || null;
        if (text && clean) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            tempDiv.querySelectorAll('span').forEach(span => {
                const space = document.createTextNode(' ');
                span.replaceWith(space);
            });
            tempDiv.innerHTML.trim();
            if (tempDiv.innerHTML.endsWith('.')) {
                tempDiv.innerHTML = tempDiv.innerHTML.slice(0, -1);
            }
            tempDiv.innerHTML = tempDiv.innerHTML.replace(/\./g, ',');
            tempDiv.innerHTML = tempDiv.innerHTML.replace(/\b\w/g, char => char.toUpperCase());
            tempDiv.innerHTML = cleanFeet(tempDiv.innerHTML);
            return tempDiv.innerHTML.trim();
        }
        return text;
    }

    function getText(selector) {
        const elements = doc.querySelectorAll('.' + selector);
        // return Array.from(elements).map(el => el.textContent.trim())[0] || null;
        return Array.from(elements).map(el => el.innerHTML)[0] || null;
    }

    // console.log(parameters);

    const referenceAbility = new Item({
        name: 'Reference Ability',
        type: 'ability',
    })
    const parameters = foundry.utils.deepClone(referenceAbility.system);

    if (tagTree.power) {
        parameters.powerSources = tagTree.power;
    }
    if (tagTree.interaction) {
        parameters.interaction = tagTree.interaction[0];
    }
    if (tagTree.saveAttribute) {
        parameters.featSaveAttribute = tagTree.saveAttribute[0];
    }
    if (tagTree.maneuver) {
        parameters.maneuver = tagTree.maneuver[0];
        if (parameters.maneuver == 'passive') {
            parameters.executionTime = 'passive';
        }
    }
    if ((!parameters.executionTime) && tagTree.executionTime) {
        parameters.executionTime = tagTree.executionTime[0];
    }
    console.log(parameters.executionTime);
    if (parameters.executionTime == "passive") {
        parameters.maneuver = 'passive';
    } else if (parameters.executionTime && CONFIG.TERIOCK.abilityOptions.executionTime.active[parameters.executionTime]) {
        parameters.maneuver = 'active';
    } else if (parameters.executionTime && CONFIG.TERIOCK.abilityOptions.executionTime.reactive[parameters.executionTime]) {
        parameters.maneuver = 'reactive';
    } else {
        parameters.maneuver = 'slow';
    }
    if (parameters.executionTime == "shortRest") {
        parameters.executionTime = "Short Rest";
    }
    if (parameters.executionTime == "longRest") {
        parameters.executionTime = "Long Rest";
    }
    if (!parameters.executionTime) {
        parameters.executionTime = getBarText('execution-time', true);
    }
    if (!parameters.executionTime) {
        parameters.executionTime = getBarText('casting-time', true);
    }
    if (tagTree.delivery) {
        parameters.delivery.base = tagTree.delivery[0];
    }
    if (tagTree.deliveryPackage) {
        parameters.delivery.package = tagTree.deliveryPackage[0];
    }
    // deliveryParent is skipped for now
    if (tagTree.target) {
        parameters.targets = tagTree.target;
    }
    if (tagTree.element) {
        parameters.elements = tagTree.element;
    }
    parameters.duration = getBarText('duration', true);
    // We have to remove the little sustained label. But there's for sure a better way to do this.
    // if (parameters.duration && parameters.duration.includes("( ⏳️Sustained )")) {
    //     parameters.duration = parameters.duration.replace("( ⏳️Sustained )", "").trim();
    // }
    if (tagTree.sustained) {
        parameters.sustained = true;
    }
    parameters.range = getBarText('range', true);
    if (parameters.delivery.base == "self") {
        parameters.range = "Self.";
    }
    parameters.overview.base = getText('ability-overview-base');
    parameters.overview.proficient = getBarText('if-proficient');
    parameters.overview.fluent = getBarText('if-fluent');
    parameters.results.hit = getBarText('on-hit');
    parameters.results.critHit = getBarText('on-critical-hit');
    parameters.results.miss = getBarText('on-miss');
    parameters.results.critMiss = getBarText('on-critical-miss');
    parameters.results.save = getBarText('on-success');
    parameters.results.critSave = getBarText('on-critical-success');
    parameters.results.fail = getBarText('on-fail');
    parameters.results.critFail = getBarText('on-critical-fail');
    if (tagTree.piercing) {
        parameters.piercing = tagTree.piercing[0];
    }
    const attributeImprovementElement = doc.querySelector('.ability-bar-attribute-improvement');
    if (attributeImprovementElement) {
        const attributeImprovementFlags = Array.from(attributeImprovementElement.classList).filter(className => className.startsWith('flag-'));
        const attributeFlag = attributeImprovementFlags.filter(className => className.startsWith('flag-attribute-'))[0];
        const attribute = attributeFlag ? attributeFlag.replace('flag-attribute-', '') : null;
        const minValFlag = attributeImprovementFlags.filter(className => className.startsWith('flag-value-'))[0];
        const minVal = minValFlag ? minValFlag.replace('flag-value-', '') : null;
        parameters.improvements.attributeImprovement.attribute = attribute;
        parameters.improvements.attributeImprovement.minVal = minVal ? parseInt(minVal, 10) : null;
    }
    const featSaveImprovementElement = doc.querySelector('.ability-bar-feat-save-improvement');
    if (featSaveImprovementElement) {
        const featSaveImprovementFlags = Array.from(featSaveImprovementElement.classList).filter(className => className.startsWith('flag-'));
        const attributeFlag = featSaveImprovementFlags.filter(className => className.startsWith('flag-attribute-'))[0];
        const attribute = attributeFlag ? attributeFlag.replace('flag-attribute-', '') : null;
        const amountFlag = featSaveImprovementFlags.filter(className => className.startsWith('flag-value-'))[0];
        const amount = amountFlag ? amountFlag.replace('flag-value-', '') : null;
        parameters.improvements.featSaveImprovement.attribute = attribute;
        parameters.improvements.featSaveImprovement.amount = amount;
    }

    // parameters.attributeImprovement = Array.from(attributeImprovementElement.classList);
    if (tagTree.skill) {
        parameters.skill = true;
    }
    if (tagTree.spell) {
        parameters.spell = true;
    }
    if (tagTree.standard) {
        parameters.standard = true;
    }
    if (tagTree.rotator) {
        parameters.rotator = true;
    }
    if (tagTree.ritual) {
        parameters.ritual = true;
    }
    if (tagTree.cost) {
        for (const c of tagTree.cost) {
            if (c.startsWith("mp")) {
                parameters.costs.mp = c.slice(2);
                if (parameters.costs.mp == "x") {
                    parameters.costs.manaCost = getBarText('mana-cost');
                } else {
                    parameters.costs.mp = cleanMp(parameters.costs.mp);
                }
            }
            if (c.startsWith("hp")) {
                parameters.costs.hp = c.slice(2);
                if (parameters.costs.hp == "x") {
                    parameters.costs.hitCost = getBarText('hit-cost');
                } else if (parameters.costs.hp != "hack") {
                    parameters.costs.hp = cleanHp(parameters.costs.hp);
                }
            }
            if (c == "shatter") {
                parameters.costs.break = 'shatter';
            }
            if (c == "destroy") {
                parameters.costs.break = 'destroy';
            }
            if (c == "invoked") {
                parameters.costs.invoked = true;
            }
        }
    }
    if (tagTree.component) {
        for (const c of tagTree.component) {
            if (c == "verbal") {
                parameters.costs.verbal = true;
            }
            if (c == "somatic") {
                parameters.costs.somatic = true;
            }
            if (c == "material") {
                parameters.costs.material = true;
                parameters.costs.materialCost = getBarText('material-cost');
            }
        }
    }
    parameters.endCondition = getBarText('end-condition');
    parameters.requirements = getBarText('requirements');
    if (tagTree.effect) {
        parameters.effects = tagTree.effect;
    }
    parameters.heightened = getBarText('heightened');
    parameters.endCondition = getBarText('end-condition');
    if (tagTree.expansion) {
        parameters.expansion = tagTree.expansion[0];
    }
    parameters.expansionRange = getBarText('expansion-range', true);
    if (tagTree.expansionAttribute) {
        parameters.expansionSaveAttribute = tagTree.expansionAttribute[0];
    }
    parameters.trigger = getBarText('trigger');
    if (tagTree.class) {
        parameters.class = tagTree.class[0];
    }
    const abilityBasicElement = doc.querySelector('.ability-basic');
    if (abilityBasicElement) {
        parameters.basic = true;
    }
    const out = {
        'system': parameters,
        'img': 'systems/teriock/assets/ability.svg',
    }
    if (parameters.spell) {
        out.img = 'systems/teriock/assets/spell.svg';
    } else if (parameters.skill) {
        out.img = 'systems/teriock/assets/skill.svg';
    }
    if (parameters.class) {
        out.img = 'systems/teriock/assets/classes/' + parameters.class + '.svg';
    }

    return out;
}
