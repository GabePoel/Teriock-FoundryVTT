import { pseudoHooks } from "../../../../../constants/system/pseudo-hooks.mjs";
import { _prepBaseDefense } from "./_prep-base-defense.mjs";
import { _prepBaseLighting } from "./_prep-base-lighting.mjs";
import { _prepareBonuses, _prepareHpMp } from "./_prep-base-stats.mjs";

/**
 * Prepare all data that needs to be initialized but exists to be set with effects.
 *
 * Relevant wiki ages:
 * - [Martial Arts](https://wiki.teriock.com/index.php/Ability:Martial_Arts)
 * - [Hind Claws](https://wiki.teriock.com/index.php/Ability:Hind_Claws)
 * - [Bite](https://wiki.teriock.com/index.php/Ability:Bite)
 * - [Shield Bash](https://wiki.teriock.com/index.php/Ability:Shield_Bash)
 *
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _baseData(actorData) {
  _prepareBonuses(actorData);
  _prepareHpMp(actorData);
  _prepBaseLighting(actorData);
  _prepBaseDefense(actorData);
  actorData.transformation = {
    img: null,
  };
  actorData.abilityFlags = {};
  actorData.damage = {
    standard: "",
  };
  actorData.equipmentChanges = {
    overrides: equipmentChangeKeyField(),
    upgrades: equipmentChangeKeyField(),
  };
  actorData.trackers = {
    lightedTo: [],
    goadedTo: [],
  };
  actorData.encumbranceLevel = 0;
  actorData.hookedMacros = /** @type {Teriock.Parameters.Actor.HookedActorMacros} */ {};
  for (const pseudoHook of Object.keys(pseudoHooks)) {
    actorData.hookedMacros[pseudoHook] = [];
  }
  actorData.hacks = {
    arm: hackField(2),
    body: hackField(1),
    ear: hackField(1),
    eye: hackField(1),
    leg: hackField(2),
    mouth: hackField(1),
    nose: hackField(1),
  };
}

/**
 * Define a hack.
 * @param {number} max
 * @returns {{max, min: 0, value: 0}}
 */
function hackField(max) {
  return {
    max: max,
    min: 0,
    value: 0,
  };
}

/**
 * @returns {Teriock.Parameters.Actor.EquipmentChangeKeys}
 */
function equipmentChangeKeyField() {
  return {
    classes: /** @type {Teriock.Parameters.Actor.EquipmentChangeClassesKeys} */ {},
    ids: /** @type {Teriock.Parameters.Actor.EquipmentChangeIdsKeys} */ {},
    names: /** @type {Teriock.Parameters.Actor.EquipmentChangeNamesKeys} */ {},
    properties: /** @type {Teriock.Parameters.Actor.EquipmentChangePropertiesKeys} */ {},
    types: /** @type {Teriock.Parameters.Actor.EquipmentChangeTypesKeys} */ {},
  };
}