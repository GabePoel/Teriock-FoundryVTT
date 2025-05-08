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
            return tempDiv.innerHTML.trim();
        }
        return text;
    }

    function getText(selector) {
        const elements = doc.querySelectorAll('.' + selector);
        // return Array.from(elements).map(el => el.textContent.trim())[0] || null;
        return Array.from(elements).map(el => el.innerHTML)[0] || null;
    }

    // console.log(out);

    const referenceAbility = new Item({
        name: 'Reference Ability',
        type: 'ability',
    })
    const out = foundry.utils.deepClone(referenceAbility.system);

    if (tagTree.power) {
        out.powerSources = tagTree.power;
    }
    if (tagTree.interaction) {
        out.interaction = tagTree.interaction[0];
    }
    if (tagTree.saveAttribute) {
        out.featSaveAttribute = tagTree.saveAttribute[0];
    }
    if (tagTree.maneuver) {
        out.maneuver = tagTree.maneuver[0];
        if (out.maneuver == 'passive') {
            out.executionTime = 'passive';
        }
    }
    if ((!out.executionTime) && tagTree.executionTime) {
        out.executionTime = tagTree.executionTime[0];
    }
    console.log(out.executionTime);
    if (out.executionTime == "passive") {
        out.maneuver = 'passive';
    } else if (out.executionTime && CONFIG.TERIOCK.abilityOptions.executionTime.active[out.executionTime]) {
        out.maneuver = 'active';
    } else if (out.executionTime && CONFIG.TERIOCK.abilityOptions.executionTime.reactive[out.executionTime]) {
        out.maneuver = 'reactive';
    } else {
        out.maneuver = 'slow';
    }
    if (out.executionTime == "shortRest") {
        out.executionTime = "Short Rest";
    }
    if (out.executionTime == "longRest") {
        out.executionTime = "Long Rest";
    }
    if (!out.executionTime) {
        out.executionTime = getBarText('execution-time', true);
    }
    if (!out.executionTime) {
        out.executionTime = getBarText('casting-time', true);
    }
    if (tagTree.delivery) {
        out.delivery.base = tagTree.delivery[0];
    }
    if (tagTree.deliveryPackage) {
        out.delivery.package = tagTree.deliveryPackage[0];
    }
    // deliveryParent is skipped for now
    if (tagTree.target) {
        out.targets = tagTree.target;
    }
    if (tagTree.element) {
        out.elements = tagTree.element;
    }
    out.duration = getBarText('duration', true);
    // We have to remove the little sustained label. But there's for sure a better way to do this.
    // if (out.duration && out.duration.includes("( ⏳️Sustained )")) {
    //     out.duration = out.duration.replace("( ⏳️Sustained )", "").trim();
    // }
    if (tagTree.sustained) {
        out.sustained = true;
    }
    out.range = getBarText('range', true);
    if (out.delivery.base == "self") {
        out.range = "Self.";
    }
    out.overview.base = getText('ability-overview-base');
    out.overview.proficient = getBarText('if-proficient');
    out.overview.fluent = getBarText('if-fluent');
    out.results.hit = getBarText('on-hit');
    out.results.critHit = getBarText('on-critical-hit');
    out.results.miss = getBarText('on-miss');
    out.results.critMiss = getBarText('on-critical-miss');
    out.results.save = getBarText('on-success');
    out.results.critSave = getBarText('on-critical-success');
    out.results.fail = getBarText('on-fail');
    out.results.critFail = getBarText('on-critical-fail');
    if (tagTree.piercing) {
        out.piercing = tagTree.piercing[0];
    }
    const attributeImprovementElement = doc.querySelector('.ability-bar-attribute-improvement');
    if (attributeImprovementElement) {
        const attributeImprovementFlags = Array.from(attributeImprovementElement.classList).filter(className => className.startsWith('flag-'));
        const attributeFlag = attributeImprovementFlags.filter(className => className.startsWith('flag-attribute-'))[0];
        const attribute = attributeFlag ? attributeFlag.replace('flag-attribute-', '') : null;
        const minValFlag = attributeImprovementFlags.filter(className => className.startsWith('flag-value-'))[0];
        const minVal = minValFlag ? minValFlag.replace('flag-value-', '') : null;
        out.improvements.attributeImprovement.attribute = attribute;
        out.improvements.attributeImprovement.minVal = minVal ? parseInt(minVal, 10) : null;
    }
    const featSaveImprovementElement = doc.querySelector('.ability-bar-feat-save-improvement');
    if (featSaveImprovementElement) {
        const featSaveImprovementFlags = Array.from(featSaveImprovementElement.classList).filter(className => className.startsWith('flag-'));
        const attributeFlag = featSaveImprovementFlags.filter(className => className.startsWith('flag-attribute-'))[0];
        const attribute = attributeFlag ? attributeFlag.replace('flag-attribute-', '') : null;
        const amountFlag = featSaveImprovementFlags.filter(className => className.startsWith('flag-value-'))[0];
        const amount = amountFlag ? amountFlag.replace('flag-value-', '') : null;
        out.improvements.featSaveImprovement.attribute = attribute;
        out.improvements.featSaveImprovement.amount = amount;
    }

    // out.attributeImprovement = Array.from(attributeImprovementElement.classList);
    if (tagTree.skill) {
        out.skill = true;
    }
    if (tagTree.spell) {
        out.spell = true;
    }
    if (tagTree.standard) {
        out.standard = true;
    }
    if (tagTree.rotator) {
        out.rotator = true;
    }
    if (tagTree.ritual) {
        out.ritual = true;
    }
    if (tagTree.cost) {
        for (const c of tagTree.cost) {
            if (c.startsWith("mp")) {
                out.costs.mp = c.slice(2);
                if (out.costs.mp == "x") {
                    out.costs.manaCost = getBarText('mana-cost');
                } else {
                    out.costs.mp = parseInt(out.costs.mp, 10);
                }
            }
            if (c.startsWith("hp")) {
                out.costs.hp = c.slice(2);
                if (out.costs.hp == "x") {
                    out.costs.hitCost = getBarText('hit-cost');
                } else if (out.costs.hp != "hack") {
                    out.costs.hp = parseInt(out.costs.hp, 10);
                }
            }
            if (c == "shatter") {
                out.costs.break = 'shatter';
            }
            if (c == "destroy") {
                out.costs.break = 'destroy';
            }
            if (c == "invoked") {
                out.costs.invoked = true;
            }
        }
    }
    if (tagTree.component) {
        for (const c of tagTree.component) {
            if (c == "verbal") {
                out.costs.verbal = true;
            }
            if (c == "somatic") {
                out.costs.somatic = true;
            }
            if (c == "material") {
                out.costs.material = true;
                out.costs.materialCost = getBarText('material-cost');
            }
        }
    }
    out.endCondition = getBarText('end-condition');
    out.requirements = getBarText('requirements');
    if (tagTree.effect) {
        out.effects = tagTree.effect;
    }
    out.heightened = getBarText('heightened');
    out.endCondition = getBarText('end-condition');
    if (tagTree.expansion) {
        out.expansion = tagTree.expansion[0];
    }
    out.expansionRange = getBarText('expansion-range', true);
    if (tagTree.expansionAttribute) {
        out.expansionSaveAttribute = tagTree.expansionAttribute[0];
    }
    out.trigger = getBarText('trigger');
    if (tagTree.class) {
        out.class = tagTree.class[0];
    }
    const abilityBasicElement = doc.querySelector('.ability-basic');
    if (abilityBasicElement) {
        out.basic = true;
    }

    return out;
}
