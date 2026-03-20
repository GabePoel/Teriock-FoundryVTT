import { BaseRoll } from "../dice/rolls/_module.mjs";
import TeriockPacks from "../documents/collections/packs.mjs";
import TeriockMacro from "../documents/macro/macro.mjs";
import { DependentsRegistry } from "./_module.mjs";

/**
 * Singleton class that manages Teriock-specific states and functionality.
 */
export default class TeriockManager {
  /**
   * Default macro class.
   * @type {TeriockMacro}
   */
  Macro = TeriockMacro;

  /**
   * Default roll class.
   * @type {typeof BaseRoll}
   */
  Roll = BaseRoll;

  /**
   * The singleton dependents registry.
   * @type {DependentsRegistry}
   */
  dependentsRegistry = new DependentsRegistry();

  /**
   * Easy references to system-specific compendium packs.
   * @type {TeriockPacks}
   */
  packs = new TeriockPacks();

  /**
   * Get the value of some Teriock setting.
   * @param {Teriock.Keys.Setting} setting
   * @return {*|Setting}
   */
  getSetting(setting) {
    return game.settings.get("teriock", setting);
  }
}
