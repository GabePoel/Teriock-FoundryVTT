import { pseudoHooks } from "../../../../../constants/system/pseudo-hooks.mjs";
import { _prepareLighting } from "./_prepare-lighting.mjs";
import { _prepareBonuses, _prepareHpMp } from "./_prepare-stats.mjs";

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
  _prepareBonuses(actorData);
  _prepareHpMp(actorData);
  _prepareLighting(actorData);
  actorData.transformation = {
    img: null,
  };
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
  actorData.lightedTo = [];
  actorData.goadedTo = [];
  for (const pseudoHook of Object.keys(pseudoHooks)) {
    actorData.hookedMacros[pseudoHook] = [];
  }
  actorData.orderings.ranks = actorData.orderings.ranks.filter((r) =>
    actorData.parent.items.get(r),
  );
  actorData.orderings.species = actorData.orderings.species.filter((s) =>
    actorData.parent.items.get(s),
  );
}
