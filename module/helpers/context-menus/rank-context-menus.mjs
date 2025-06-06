import { makeIcon } from "../utils.mjs";

export function archetypeContextMenu(rank) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  let archetypes = CONFIG.TERIOCK.rankOptions;
  for (const archetype in archetypes) {
    const archetypeName = archetypes[archetype].name;
    const archetypeIcon = archetypes[archetype].icon;
    const icon = makeIcon(archetypeIcon, iconStyle);
    const firstClass = Object.keys(archetypes[archetype].classes)[0];
    let hitDie = 'd10';
    let manaDie = 'd10';
    if (archetype === 'warrior') {
      hitDie = 'd12';
      manaDie = 'd8';
    }
    if (archetype === 'mage') {
      hitDie = 'd8';
      manaDie = 'd12';
    }
    const option = {
      name: archetypeName,
      icon: icon,
      callback: () => {
        rank.update({
          'system': {
            'archetype': archetype,
            'className': firstClass,
            'hitDie': hitDie,
            'manaDie': manaDie,
          }
        });
      }
    };
    options.push(option);
  }
  return options;
}

export function classContextMenu(rank) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  let archetypes = CONFIG.TERIOCK.rankOptions;
  for (const archetype in archetypes) {
    const classes = archetypes[archetype].classes;
    for (const className in classes) {
      const classIcon = classes[className].icon;
      const icon = makeIcon(classIcon, iconStyle);
      const option = {
        name: classes[className].name,
        icon: icon,
        callback: () => {
          rank.update({
            'system': {
              'className': className,
              'archetype': archetype,
            }
          });
        },
        condition: () => {
          return foundry.utils.getProperty(rank.system, 'archetype') === archetype;
        }
      };
      options.push(option);
    }
  }
  return options;
}

export function rankContextMenu(rank) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  for (let i = 0; i <= 9; i++) {
    options.push({
      name: `Rank ${i}`,
      icon: makeIcon(`${i}`, iconStyle),
      callback: () => rank.update({ 'system.classRank': i }),
    });
  }
  return options;
}

function dieContextMenu(rank, stat = 'hp') {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const statLong = stat === 'hp' ? 'hit' : 'mana';
  return [
    {
      name: 'd4',
      icon: makeIcon('dice-d4', iconStyle),
      callback: () => rank.update({
        [`system.${statLong}Die`]: 'd4',
        [`system.${stat}`]: 3,
      })
    },
    {
      name: 'd6',
      icon: makeIcon('dice-d6', iconStyle),
      callback: () => rank.update({
        [`system.${statLong}Die`]: 'd6',
        [`system.${stat}`]: 4,
      
      })
    },
    {
      name: 'd8',
      icon: makeIcon('dice-d8', iconStyle),
      callback: () => rank.update({
        [`system.${statLong}Die`]: 'd8',
        [`system.${stat}`]: 5,
      })
    },
    {
      name: 'd10',
      icon: makeIcon('dice-d10', iconStyle),
      callback: () => rank.update({
        [`system.${statLong}Die`]: 'd10',
        [`system.${stat}`]: 6,
      })
    },
    {
      name: 'd12',
      icon: makeIcon('dice-d12', iconStyle),
      callback: () => rank.update({
        [`system.${statLong}Die`]: 'd12',
        [`system.${stat}`]: 7,
      })
    },
    {
      name: 'd20',
      icon: makeIcon('dice-d20', iconStyle),
      callback: () => rank.update({
        [`system.${statLong}Die`]: 'd20',
        [`system.${stat}`]: 11,
      })
    }
  ];
}

export function hitDieContextMenu(rank) {
  return dieContextMenu(rank, 'hp');
}

export function manaDieContextMenu(rank) {
  return dieContextMenu(rank, 'mp');
}