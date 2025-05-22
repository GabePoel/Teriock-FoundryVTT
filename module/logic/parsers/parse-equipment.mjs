import { cleanFeet, cleanValue } from "../../helpers/clean.mjs";
import { toCamelCaseList } from "../../helpers/utils.mjs";

export default function parseEquipment(rawHTML) {
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
    // console.log('parameters', parameters);

    if (getText('.damage')) {
        // parameters.damage = cleanDamage(getText('.damage'));
        parameters.damage = getText('.damage');
    }
    if (getValue('.weight')) {
        parameters.weight = cleanValue(getValue('.weight'));
    }
    if (getText('.short-range')) {
        parameters.shortRange = cleanValue(getText('.short-range'));
    }
    if (getText('.long-range')) {
        parameters.longRange = cleanValue(getText('.long-range'));
    }
    if (getText('.normal-range')) {
        parameters.normalRange = cleanValue(getText('.normal-range'));
    }
    if (getTextAll('.equipment-class')) {
        parameters.equipmentClasses = getTextAll('.equipment-class');
    }
    if (getValue('.min-str')) {
        parameters.minStr = cleanValue(getValue('.min-str'));
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
    if (getValue('.piercing')) {
        parameters.properties.push(getValue('.piercing'));
    }
    if (getValue('.sb')) {
        parameters.sb = getValue('.sb');
    }
    if (getValue('.av')) {
        // parameters.av = cleanAv(getValue('.av'));
        parameters.av = cleanValue(getValue('.av'));
    }
    if (getValue('.bv')) {
        // parameters.bv = cleanBv(getValue('.bv'));
        parameters.bv = cleanValue(getValue('.bv'));
    }
    if (getText('.special-rules')) {
        parameters.specialRules = getHTML('.special-rules');
    }
    
    parameters.properties.sort((a, b) => a.localeCompare(b));
    parameters.equipmentClasses.sort((a, b) => a.localeCompare(b));
    const candidateProperties = toCamelCaseList(parameters.properties);

    parameters.properties = candidateProperties.filter(property =>
        Object.keys(CONFIG.TERIOCK.equipmentOptions.properties).includes(property)
    );
    parameters.magicalProperties = candidateProperties.filter(property =>
        Object.keys(CONFIG.TERIOCK.equipmentOptions.magicalProperties).includes(property)
    );
    parameters.materialProperties = candidateProperties.filter(property =>
        Object.keys(CONFIG.TERIOCK.equipmentOptions.materialProperties).includes(property)
    );
    parameters.equipmentClasses = toCamelCaseList(parameters.equipmentClasses);
    
    delete parameters.equipmentType;
    delete parameters.powerLevel;
    delete parameters.disabled;
    delete parameters.description;
    delete parameters.flaws;
    delete parameters.tier;
    delete parameters.effectiveTier;
    delete parameters.notes;
    delete parameters.shattered;
    delete parameters.dampened;
    delete parameters.materialProperties;
    delete parameters.disabled;
    delete parameters.glued;
    delete parameters.font;
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