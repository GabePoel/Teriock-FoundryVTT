import abilityOverrides from "../ability/ability-overrides.mjs";
import { cleanFeet } from "../../helpers/clean.mjs";

export default function parseAbility(rawHTML, ability) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, 'text/html');

  // Remove unnecessary elements
  doc.querySelectorAll('.ability-sub-container').forEach(el => el.remove());

  // Replace dice elements with roll syntax
  doc.querySelectorAll('.dice').forEach(el => {
    const fullRoll = el.getAttribute('data-full-roll');
    const quickRoll = el.getAttribute('data-quick-roll');
    if (quickRoll) el.textContent = `[[/roll ${fullRoll}]]`;
  });

  // Build tag tree from tag containers
  const tagTree = {};
  doc.querySelectorAll('.tag-container').forEach(el => {
    const tags = Array.from(el.classList)
      .filter(cls => cls.endsWith('-tagged'))
      .map(cls => cls.replace('-tagged', ''));
    if (tags.length) {
      if (tags.length === 1) tagTree[tags[0]] = true;
      else {
        tagTree[tags[0]] = tagTree[tags[0]] || [];
        tagTree[tags[0]].push(...tags.slice(1));
      }
    }
  });

  // Helper functions
  function getBarText(selector, clean = false) {
    const el = doc.querySelector(`.ability-bar-${selector} .ability-bar-content`);
    let text = el?.innerHTML || null;
    if (text && clean) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = text;
      tempDiv.querySelectorAll('span').forEach(span => span.replaceWith(document.createTextNode(' ')));
      text = tempDiv.innerHTML.trim().replace(/\.$/, '').replace(/\./g, ',')
        .replace(/\b\w/g, c => c.toUpperCase());
      text = cleanFeet(text).trim();
    }
    return text;
  }
  const getText = selector => doc.querySelector(`.${selector}`)?.innerHTML || null;

  // Clone reference ability system
  const referenceAbility = new ActiveEffect({ name: 'Reference Ability', type: 'ability' });
  const parameters = foundry.utils.deepClone(referenceAbility.system);
  const changes = [];

  // Tag-driven assignments
  if (tagTree.power) {
    parameters.powerSources = tagTree.power;
    if (parameters.powerSources.includes('unknown') || parameters.powerSources.includes('psionic'))
      parameters.abilityType = 'special';
  }
  if (tagTree.interaction) parameters.interaction = tagTree.interaction[0];
  if (tagTree.saveAttribute) parameters.featSaveAttribute = tagTree.saveAttribute[0];
  if (tagTree.maneuver) {
    parameters.maneuver = tagTree.maneuver[0];
    if (parameters.maneuver === 'passive') parameters.executionTime = 'passive';
  }
  if (!parameters.executionTime && tagTree.executionTime) parameters.executionTime = tagTree.executionTime[0];

  // Determine maneuver type
  if (parameters.executionTime === "passive") parameters.maneuver = 'passive';
  else if (parameters.executionTime && CONFIG.TERIOCK.abilityOptions.executionTime.active[parameters.executionTime])
    parameters.maneuver = 'active';
  else if (parameters.executionTime && CONFIG.TERIOCK.abilityOptions.executionTime.reactive[parameters.executionTime])
    parameters.maneuver = 'reactive';
  else parameters.maneuver = 'slow';

  // Normalize execution time
  if (parameters.executionTime === "shortRest") parameters.executionTime = "Short Rest";
  if (parameters.executionTime === "longRest") parameters.executionTime = "Long Rest";
  if (!parameters.executionTime) parameters.executionTime = getBarText('execution-time', true) || getBarText('casting-time', true);

  if (tagTree.delivery) parameters.delivery.base = tagTree.delivery[0];
  if (tagTree.deliveryPackage) parameters.delivery.package = tagTree.deliveryPackage[0];
  if (tagTree.target) parameters.targets = tagTree.target;
  if (tagTree.element) parameters.elements = tagTree.element;
  parameters.duration = getBarText('duration', true);
  if (tagTree.sustained) parameters.sustained = true;
  parameters.range = getBarText('range', true);
  if (parameters.delivery.base === "self") parameters.range = "Self.";
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
  if (tagTree.piercing) parameters.piercing = tagTree.piercing[0];

  // Attribute improvement
  const attrImp = doc.querySelector('.ability-bar-attribute-improvement');
  if (attrImp) {
    const flags = Array.from(attrImp.classList).filter(cls => cls.startsWith('flag-'));
    const attr = flags.find(cls => cls.startsWith('flag-attribute-'))?.replace('flag-attribute-', '');
    const minVal = flags.find(cls => cls.startsWith('flag-value-'))?.replace('flag-value-', '');
    parameters.improvements.attributeImprovement.attribute = attr;
    parameters.improvements.attributeImprovement.minVal = minVal ? parseInt(minVal, 10) : null;
    changes.push({
      key: `system.attributes.${attr}.value`,
      mode: 4,
      value: minVal,
      priority: 20,
    });
  }

  // Feat save improvement
  const featImp = doc.querySelector('.ability-bar-feat-save-improvement');
  if (featImp) {
    const flags = Array.from(featImp.classList).filter(cls => cls.startsWith('flag-'));
    const attr = flags.find(cls => cls.startsWith('flag-attribute-'))?.replace('flag-attribute-', '');
    const amount = flags.find(cls => cls.startsWith('flag-value-'))?.replace('flag-value-', '');
    parameters.improvements.featSaveImprovement.attribute = attr;
    parameters.improvements.featSaveImprovement.amount = amount;
    let toggle = amount === "fluency" ? "Fluent" : amount === "proficiency" ? "Proficient" : null;
    changes.push({
      key: `system.attributes.${attr}.save${toggle}`,
      mode: 4,
      value: true,
      priority: 20,
    });
  }

  // Other tags
  if (tagTree.skill) parameters.skill = true;
  if (tagTree.spell) parameters.spell = true;
  if (tagTree.standard) parameters.standard = true;
  if (tagTree.rotator) {
    parameters.rotator = true;
    parameters.abilityType = 'special';
  }
  if (tagTree.deliveryPackage?.includes("ritual")) parameters.ritual = true;

  // Costs
  if (tagTree.cost) {
    for (const c of tagTree.cost) {
      if (c.startsWith("mp")) {
        parameters.costs.mp = c.slice(2);
        if (parameters.costs.mp === "x") parameters.costs.manaCost = getBarText('mana-cost');
        else parameters.costs.mp = parseInt(parameters.costs.mp, 10);
      }
      if (c.startsWith("hp")) {
        parameters.costs.hp = c.slice(2);
        if (parameters.costs.hp === "x") parameters.costs.hitCost = getBarText('hit-cost');
        else if (parameters.costs.hp !== "hack") parameters.costs.hp = parseInt(parameters.costs.hp, 10);
      }
      if (c === "shatter") parameters.costs.break = 'shatter';
      if (c === "destroy") parameters.costs.break = 'destroy';
    }
  }

  // Components
  if (tagTree.component) {
    for (const c of tagTree.component) {
      if (c === "invoked") parameters.costs.invoked = true;
      if (c === "verbal") parameters.costs.verbal = true;
      if (c === "somatic") parameters.costs.somatic = true;
      if (c === "material") {
        parameters.costs.material = true;
        parameters.costs.materialCost = getBarText('material-cost');
      }
    }
  }

  parameters.endCondition = getBarText('end-condition');
  parameters.requirements = getBarText('requirements');
  if (tagTree.effect) parameters.effects = tagTree.effect;
  parameters.heightened = getBarText('heightened');
  if (tagTree.expansion) parameters.expansion = tagTree.expansion[0];
  parameters.expansionRange = getBarText('expansion-range', true);
  if (tagTree.expansionAttribute) parameters.expansionSaveAttribute = tagTree.expansionAttribute[0];
  parameters.trigger = getBarText('trigger');
  if (tagTree.class) parameters.class = tagTree.class[0];
  if (tagTree.flaw) parameters.abilityType = 'flaw';

  if (doc.querySelector('.ability-basic')) {
    parameters.basic = true;
    parameters.abilityType = 'intrinsic';
  }

  delete parameters.improvement;
  delete parameters.limitation;

  abilityOverrides(ability, changes);

  // Image selection
  let img = 'systems/teriock/assets/ability.svg';
  if (parameters.spell) img = 'systems/teriock/assets/spell.svg';
  else if (parameters.skill) img = 'systems/teriock/assets/skill.svg';
  if (parameters.class) img = `systems/teriock/assets/classes/${parameters.class}.svg`;

  return { changes, system: parameters, img };
}
