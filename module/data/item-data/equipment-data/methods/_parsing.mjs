import { cleanValue } from "../../../../helpers/clean.mjs";
import { createProperty } from "../../../../helpers/create-effects.mjs";
import { toCamelCase } from "../../../../helpers/utils.mjs";
import { _override } from "./_overrides.mjs";

export async function _parse(item, rawHTML) {

  const validProperties = Object.values(CONFIG.TERIOCK.equipmentOptions.properties);
  const validMaterialProperties = Object.values(CONFIG.TERIOCK.equipmentOptions.materialProperties);
  const validMagicalProperties = Object.values(CONFIG.TERIOCK.equipmentOptions.magicalProperties);
  const allValidProperties = [
    ...validProperties,
    ...validMaterialProperties,
    ...validMagicalProperties,
    "Weapon",
  ];

  // Remove existing properties
  for (const effect of item.transferredEffects.filter(e => e.type === 'property')) {
    if (allValidProperties.includes(effect.name)) {
      effect.delete();
    }
  }
  const doc = new DOMParser().parseFromString(rawHTML, 'text/html');
  const q = s => doc.querySelector(s);
  const getValue = s => q(s)?.getAttribute('data-val');
  const getText = s => q(s)?.textContent.trim();
  const getTextAll = s => Array.from(doc.querySelectorAll(s), el => el.textContent.trim());
  const getHTML = s => q(s)?.innerHTML.trim();

  const referenceEquipment = new Item({ name: 'Reference Equipment', type: 'equipment' });
  const parameters = foundry.utils.deepClone(referenceEquipment.system).toObject();

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
  parameters.range = cleanValue(getText('.normal-range')) ?? parameters.range;
  parameters.range = cleanValue(getText('.long-range')) ?? parameters.range;
  parameters.minStr = cleanValue(getValue('.min-str')) ?? parameters.minStr;

  // Parse arrays
  parameters.equipmentClasses = getTextAll('.equipment-class');
  parameters.properties = getTextAll('.property');

  // Add piercing property if present
  const piercing = getValue('.piercing');
  if (piercing) parameters.properties.push(piercing);

  // Parse sb, av, bv
  parameters.sb = toCamelCase(getValue('.sb') || '') ?? parameters.sb;
  parameters.av = cleanValue(getValue('.av')) ?? parameters.av;
  parameters.bv = cleanValue(getValue('.bv')) ?? parameters.bv;

  // Special rules
  parameters.specialRules = getHTML('.special-rules') ?? parameters.specialRules;

  // Sort and filter properties/classes
  // parameters.properties = parameters.properties.filter(Boolean).sort((a, b) => a.localeCompare(b));
  parameters.equipmentClasses = parameters.equipmentClasses.filter(Boolean).sort((a, b) => a.localeCompare(b));
  parameters.equipmentClasses = toCamelCaseList(parameters.equipmentClasses);
  const candidateProperties = toCamelCaseList(parameters.properties);

  // Filter properties by config
  const allowedProperties = [
    ...Object.keys(CONFIG.TERIOCK.equipmentOptions.properties),
    ...Object.keys(CONFIG.TERIOCK.equipmentOptions.materialProperties),
    ...Object.keys(CONFIG.TERIOCK.equipmentOptions.magicalProperties)
  ];
  const filteredProperties = candidateProperties.filter(p => allowedProperties.includes(p));
  candidateProperties.length = 0;
  candidateProperties.push(...filteredProperties);

  for (const key of candidateProperties) {
    await createProperty(item, key);
  }

  parameters.properties = [];

  parameters.editable = false;

  equipmentOverrides(item, parameters);

  const oldImg = item.img;
  let newImg = oldImg;
  if (oldImg?.startsWith('systems/teriock/assets') || oldImg?.startsWith('icons/svg')) {
    newImg = 'systems/teriock/assets/searchable.svg';
    newImg = `systems/teriock/assets/equipment/${item.system.equipmentType?.toLowerCase().replace(/\s+/g, '-')}.svg`;
  }

  // Remove unused properties
  [
    'equipmentType', 'powerLevel', 'disabled', 'description', 'flaws', 'tier',
    'effectiveTier', 'notes', 'shattered', 'dampened', 'materialProperties',
    'disabled', 'glued', 'font'
  ].forEach(key => delete parameters[key]);

  console.log(parameters);

  return { system: parameters, img: newImg };
}
