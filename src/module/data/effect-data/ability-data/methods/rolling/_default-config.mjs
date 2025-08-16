/** @type {AbilityUseData} */
const DEFAULT_USE_DATA = {
  actor: null,
  dontUse: false,
  proficient: false,
  fluent: false,
  rollOptions: {},
  costs: {
    hp: 0,
    mp: 0,
    gp: 0,
  },
  modifiers: {
    heightened: 0,
    noHeighten: false,
  },
  formula: "",
  rollData: {},
  targets: new Set(),
};

/** @type {AbilityChatData} */
const DEFAULT_CHAT_DATA = {
  content: "",
  speaker: {},
  rolls: [],
  system: {
    buttons: [],
    tags: [],
  },
};

/**
 * Build the default config for this roll.
 *
 * @param {TeriockAbilityData} abilityData
 * @param {Teriock.RollOptions.AbilityRoll} options
 * @returns {AbilityRollConfig}
 * @private
 */
export function _defaultConfig(abilityData, options = {}) {
  // Build initial roll config
  const rollConfig = {
    useData: foundry.utils.deepClone(DEFAULT_USE_DATA),
    abilityData: abilityData,
    chatData: foundry.utils.deepClone(DEFAULT_CHAT_DATA),
  };
  // Set roll options
  rollConfig.useData.rollOptions = options;
  // Reset targets since deep cloning doesn't support sets
  rollConfig.useData.targets = new Set();
  // Determine the actor using ability
  if (options.actor) {
    rollConfig.useData.actor = options.actor;
  } else {
    rollConfig.useData.actor = abilityData.actor;
  }
  // An ability must have an actor to be used
  if (!rollConfig.useData.actor) {
    rollConfig.useData.dontUse = true;
    ui.notifications.error("Abilities must be on an actor to be used.", {
      console: false,
    });
    return rollConfig;
  }
  // Determine if ability is proficient
  if (options.proficient !== undefined) {
    rollConfig.useData.proficient = options.proficient;
  } else if (
    abilityData.actor &&
    abilityData.actor.uuid === rollConfig.useData.actor.uuid
  ) {
    rollConfig.useData.proficient = abilityData.parent.isProficient;
  }
  // Determine if ability is fluent
  if (options.fluent !== undefined) {
    rollConfig.useData.fluent = options.fluent;
  } else if (
    abilityData.actor &&
    abilityData.actor.uuid === rollConfig.useData.actor.uuid
  ) {
    rollConfig.useData.fluent = abilityData.parent.isFluent;
  }
  // Determine if ability should not be heightened
  if (options.noHeighten !== undefined) {
    rollConfig.useData.modifiers.noHeighten = options.noHeighten;
  }
  return rollConfig;
}
