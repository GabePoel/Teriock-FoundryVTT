import { cleanFeet, cleanValue } from "../../helpers/clean.mjs";
import { toCamelCaseList } from "../../helpers/utils.mjs";

export default function parseEquipment(rawHTML, item) {
  const doc = new DOMParser().parseFromString(rawHTML, 'text/html');
  const q = s => doc.querySelector(s);
  const getValue = s => q(s)?.getAttribute('data-val');
  const getText = s => q(s)?.textContent.trim();
  const getTextAll = s => Array.from(doc.querySelectorAll(s), el => el.textContent.trim());
  const getHTML = s => q(s)?.innerHTML.trim();

  const referenceEquipment = new Item({ name: 'Reference Equipment', type: 'equipment' });
  const parameters = foundry.utils.deepClone(referenceEquipment.system);

  // Parse damage
  const damageText = getText('.damage');
  if (damageText) {
    const match = damageText.match(/^([^\(]+)\s*\(([^)]+)\)/);
    parameters.damage = match ? match[1].trim() : damageText;
    if (match) parameters.twoHandedDamage = match[2].trim();
  }

  // Parse numeric and range values
  parameters.weight = cleanValue(getValue('.weight')) ?? parameters.weight;
  parameters.shortRange = cleanValue(getText('.short-range')) ?? parameters.shortRange;
  parameters.longRange = cleanValue(getText('.long-range')) ?? parameters.longRange;
  parameters.normalRange = cleanValue(getText('.normal-range')) ?? parameters.normalRange;
  parameters.minStr = cleanValue(getValue('.min-str')) ?? parameters.minStr;

  // Parse arrays
  parameters.equipmentClasses = getTextAll('.equipment-class');
  parameters.properties = getTextAll('.property');

  // Parse full range and add property if present
  const fullRange = getText('.full-range');
  if (fullRange?.includes('(')) {
    const [rangeProperty, range] = fullRange.split('(');
    parameters.range = cleanFeet(range.split(')')[0].trim());
    parameters.properties.push(rangeProperty.trim());
  }

  // Add piercing property if present
  const piercing = getValue('.piercing');
  if (piercing) parameters.properties.push(piercing);

  // Parse sb, av, bv
  parameters.sb = getValue('.sb') ?? parameters.sb;
  parameters.av = cleanValue(getValue('.av')) ?? parameters.av;
  parameters.bv = cleanValue(getValue('.bv')) ?? parameters.bv;

  // Special rules
  parameters.specialRules = getHTML('.special-rules') ?? parameters.specialRules;

  // Sort and filter properties/classes
  parameters.properties = parameters.properties.filter(Boolean).sort((a, b) => a.localeCompare(b));
  parameters.equipmentClasses = parameters.equipmentClasses.filter(Boolean).sort((a, b) => a.localeCompare(b));
  const candidateProperties = toCamelCaseList(parameters.properties);

  // Filter properties by config
  const filterByConfig = (list, configKey) =>
    list.filter(p => Object.keys(CONFIG.TERIOCK.equipmentOptions[configKey]).includes(p));
  parameters.properties = filterByConfig(candidateProperties, 'properties');
  parameters.magicalProperties = filterByConfig(candidateProperties, 'magicalProperties');
  parameters.materialProperties = filterByConfig(candidateProperties, 'materialProperties');
  parameters.equipmentClasses = toCamelCaseList(parameters.equipmentClasses);

  // Set output image
  let img = 'systems/teriock/assets/searchable.svg';
  img = `systems/teriock/assets/equipment/${item.system.equipmentType?.toLowerCase().replace(/\s+/g, '-')}.svg`;

  // Remove unused properties
  [
    'equipmentType', 'powerLevel', 'disabled', 'description', 'flaws', 'tier',
    'effectiveTier', 'notes', 'shattered', 'dampened', 'materialProperties',
    'disabled', 'glued', 'font'
  ].forEach(key => delete parameters[key]);

  // const equipmentClass = parameters.equipmentClasses[0].toLowerCase().replace(/\s+/g, '-');
  // img = `systems/teriock/assets/equipment-classes/${equipmentClass}.svg`;
  
  // if (parameters.equipmentClasses.length > 0) {
  //   img = `systems/teriock/assets/equipment-classes/${equipmentClass}.svg`;
  // }

  return { system: parameters, img };
}
