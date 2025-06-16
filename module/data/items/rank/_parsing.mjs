import { createAbility } from "../../../helpers/create-effects.mjs";

const ARCHETYPE_STATS = {
  mage: { hitDie: 'd8', manaDie: 'd12', hp: 5, mp: 7 },
  warrior: { hitDie: 'd12', manaDie: 'd8', hp: 7, mp: 5 },
  default: { hitDie: 'd10', manaDie: 'd10', hp: 6, mp: 6 }
};

function extractAbilityNames(metaData, attr) {
  const val = metaData.getAttribute(attr);
  return val ? val.split(',').map(a => a.trim()).filter(Boolean) : [];
}

export async function _parse(item, rawHTML) {
  const { className, classRank, archetype } = item.system;
  const classValue = CONFIG.TERIOCK.rankOptions[archetype].classes[className].name;

  // Remove existing abilities
  for (const effect of item.transferredEffects.filter(e => e.type === 'ability')) {
    effect.delete();
  }

  const doc = new DOMParser().parseFromString(rawHTML, 'text/html');
  const metaData = doc.querySelector('.class-metadata');

  // Extract ability names by rank
  const rankNames = {
    0: extractAbilityNames(metaData, 'data-r0'),
    1: extractAbilityNames(metaData, 'data-r1'),
    2: extractAbilityNames(metaData, 'data-r2'),
    "3c": extractAbilityNames(metaData, 'data-r3c'),
    "3s": extractAbilityNames(metaData, 'data-r3s')
  };

  // Rotator abilities (for rank >= 2)
  const rotatorNames = classRank >= 2
    ? Array.from(doc.querySelectorAll('.rotator')).map(e => e.textContent.trim()).filter(Boolean)
    : [];

  // Create abilities
  for (const rank of [0, 1, 2]) {
    if (classRank === rank) {
      for (const name of rankNames[rank]) await createAbility(item, name);
    }
  }
  if (classRank >= 3) {
    for (const name of rankNames['3c']) await createAbility(item, name);
    for (const name of rankNames['3s']) await createAbility(item, name);
  }
  // Uncomment if rotator abilities should be created
  // for (const name of rotatorNames) await createAbility(item, name);

  // Build possibleAbilities
  const possibleAbilities = {
    normal: classRank === 1 ? rankNames[1] : classRank === 2 ? rankNames[2] : [],
    archetype: classRank < 2 ? rankNames[0] : [],
    combat: classRank >= 3 ? rankNames['3c'] : [],
    support: classRank >= 3 ? rankNames['3s'] : [],
    rotator: classRank >= 2 ? rotatorNames : []
  };

  // Archetype stats
  const stats = ARCHETYPE_STATS[archetype] || ARCHETYPE_STATS.default;

  // Helper for HTML/text extraction
  const getHTML = sel => doc.querySelector(sel)?.innerHTML.trim();
  const getText = sel => doc.querySelector(sel)?.textContent.trim();

  const parameters = {
    possibleAbilities,
    maxAv: metaData.getAttribute('data-av'),
    archetype: metaData.getAttribute('data-archetype'),
    ...stats,
    gainedAbilities: [],
    flaws: getHTML('.class-flaws') || 'None.',
    description: getHTML('.class-description') || ''
  };

  parameters.editable = false;

  return {
    system: parameters,
    img: `systems/teriock/assets/classes/${className}.svg`,
    name: `Rank ${classRank} ${classValue}`
  };
}
