export const DEFAULT_ROLL_CONFIG = {
  /** @type {Partial<AbilityUseData>} */
  useData: {
    rollOptions: {},
    costs: {
      hp: 0,
      mp: 0,
      gp: 0
    },
    modifiers: {
      heightened: 0,
      noHeighten: false,
    },
    formula: "",
    rollData: {},
    targets: new Set(),
  },
  abilityData: {},
  chatData: {
    content: "",
    rolls: [],
    system: {
      buttons: [],
      tags: [],
    },
  },
}