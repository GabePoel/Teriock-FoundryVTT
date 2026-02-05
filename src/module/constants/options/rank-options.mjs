import { icons } from "../display/icons.mjs";

export const rankOptions = {
  mage: {
    classes: {
      flameMage: {
        name: "Flame Mage",
        icon: icons.class.flameMage,
      },
      lifeMage: {
        name: "Life Mage",
        icon: icons.class.lifeMage,
      },
      natureMage: {
        name: "Nature Mage",
        icon: icons.class.natureMage,
      },
      necromancer: {
        name: "Necromancer",
        icon: icons.class.necromancer,
      },
      stormMage: {
        name: "Storm Mage",
        icon: icons.class.stormMage,
      },
    },
    hp: 8,
    icon: icons.archetype.mage,
    mp: 12,
    name: "Mage",
  },
  semi: {
    classes: {
      archer: {
        name: "Archer",
        icon: icons.class.archer,
      },
      assassin: {
        name: "Assassin",
        icon: icons.class.assassin,
      },
      corsair: {
        name: "Corsair",
        icon: icons.class.corsair,
      },
      ranger: {
        name: "Ranger",
        icon: icons.class.ranger,
      },
      thief: {
        name: "Thief",
        icon: icons.class.thief,
      },
    },
    hp: 10,
    icon: icons.archetype.semi,
    mp: 10,
    name: "Semi",
  },
  warrior: {
    classes: {
      berserker: {
        name: "Berserker",
        icon: icons.class.berserker,
      },
      duelist: {
        name: "Duelist",
        icon: icons.class.duelist,
      },
      knight: {
        name: "Knight",
        icon: icons.class.knight,
      },
      paladin: {
        name: "Paladin",
        icon: icons.class.paladin,
      },
      veteran: {
        name: "Veteran",
        icon: icons.class.veteran,
      },
    },
    hp: 12,
    icon: icons.archetype.warrior,
    mp: 8,
    name: "Warrior",
  },
  everyman: {
    classes: {
      tradesman: {
        name: "Tradesman",
        icon: icons.class.tradesman,
      },
      journeyman: {
        name: "Journeyman",
        icon: icons.class.journeyman,
      },
    },
    hp: 10,
    icon: icons.archetype.everyman,
    mp: 10,
    name: "Everyman",
  },
};
