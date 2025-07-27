import { pseudoHooks } from "../../../../helpers/constants/pseudo-hooks.mjs";

/**
 * Prepare all data that needs to be initialized but exists to be set with effects.
 *
 * Relevant wiki ages:
 * - [Martial Arts](https://wiki.teriock.com/index.php/Ability:Martial_Arts)
 * - [Hind Claws](https://wiki.teriock.com/index.php/Ability:Hind_Claws)
 * - [Bite](https://wiki.teriock.com/index.php/Ability:Bite)
 * - [Shield Bash](https://wiki.teriock.com/index.php/Ability:Shield_Bash)
 *
 * @param {TeriockBaseActorData} actorData
 * @private
 */
export function _prepareBaseData(actorData) {
  actorData.abilityFlags = {};
  actorData.damage = {
    standard: "",
  };
  actorData.equipmentChanges = {
    upgrades: {
      classes: {},
      ids: {},
      names: {},
      properties: {},
      types: {},
    },
    overrides: {
      classes: {},
      ids: {},
      names: {},
      properties: {},
      types: {},
    },
  };
  actorData.hookedMacros = {};
  for (const pseudoHook of Object.keys(pseudoHooks)) {
    actorData.hookedMacros[pseudoHook] = [];
  }
}
