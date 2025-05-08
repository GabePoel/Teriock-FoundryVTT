import { cleanFeet, cleanPounds, cleanDamage, cleanAv, cleanBv, cleanStr } from "../../helpers/clean.mjs";

export function parseEquipment(rawHTML) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHTML, 'text/html');
    function getValue(selector) {
        const element = doc.querySelector(selector);
        if (element) {
            return element.getAttribute('data-val');
        }
    }
    function getText(selector) {
        const element = doc.querySelector(selector);
        if (element) {
            return element.textContent.trim();
        }
    }
    function getTextAll(selector) {
        const elements = doc.querySelectorAll(selector);
        return Array.from(elements).map((element) => element.textContent.trim());
    }
    function getHTML(selector) {
        const element = doc.querySelector(selector);
        if (element) {
            return element.innerHTML.trim();
        }
    }

    const referenceEquipment = new Item({
        name: 'Reference Equipment',
        type: 'equipment',
    })
    const parameters = foundry.utils.deepClone(referenceEquipment.system);
    console.log('parameters', parameters);

    if (getText('.damage')) {
        parameters.damage = cleanDamage(getText('.damage'));
    }
    if (getValue('.weight')) {
        parameters.weight = cleanPounds(getValue('.weight'));
    }
    if (getText('.short-range')) {
        parameters.shortRange = getText('.short-range');
    }
    if (getText('.long-range')) {
        parameters.longRange = getText('.long-range');
    }
    if (getText('.normal-range')) {
        parameters.normalRange = getText('.normal-range');
    }
    if (getTextAll('.equipment-class')) {
        parameters.equipmentClasses = getTextAll('.equipment-class');
    }
    if (getValue('.min-str')) {
        parameters.minStr = cleanStr(getValue('.min-str'));
    }
    if (getTextAll('.property')) {
        parameters.properties = getTextAll('.property');
    }
    if (getText('.full-range')) {
        let range = getText('.full-range');
        if (range.includes('(')) {
            const rangeProperty = range.split('(')[0].trim();
            range = range.split('(')[1].trim();
            range = range.split(')')[0].trim();
            const finalRange = cleanFeet(range);
            parameters.range = finalRange;
            parameters.properties.push(rangeProperty);
        }
    }
    if (getValue('.sb')) {
        parameters.sb = getValue('.sb');
    }
    if (getValue('.av')) {
        parameters.av = cleanAv(getValue('.av'));
    }
    if (getValue('.bv')) {
        parameters.bv = cleanBv(getValue('.bv'));
    }
    if (getText('.special-rules')) {
        parameters.specialRules = getHTML('.special-rules');
    }
    parameters.properties.sort((a, b) => a.localeCompare(b));
    parameters.equipmentClasses.sort((a, b) => a.localeCompare(b));
    const out = {
        'system': parameters,
        'img': 'systems/teriock/assets/searchable.svg',
    }
    if (parameters.equipmentClasses.length > 0) {
        let equipmentClass = parameters.equipmentClasses[0];
        equipmentClass = equipmentClass.toLowerCase().replace(/\s+/g, '-');
        out.img = `systems/teriock/assets/equipment-classes/${equipmentClass}.svg`;
    }
    return out
}