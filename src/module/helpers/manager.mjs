import { DependentsRegistry } from "./_module.mjs";

/**
 * Singleton class that manages Teriock-specific states and functionality.
 */
export default class TeriockManager {
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
   * Check if what's provided exists or is an empty array or set.
   * @param {Teriock.System.Existable<*>} existable
   * @param {string} [message]
   * @param {string} [type]
   * @param {object} [options]
   * @returns {boolean}
   */
  #check(existable, message, type = "error", options = { localize: true }) {
    let valid = true;
    if (!existable) {
      valid = false;
    }
    if (Array.isArray(existable) && !existable.length) {
      valid = false;
    }
    if (existable instanceof Set && existable.size === 0) {
      valid = false;
    }
    if (message && !valid) {
      ui.notifications.notify(message, type, options);
    }
    return valid;
  }

  /**
   * Check if there's actors and give a warning if not.
   * @param {Teriock.System.Existable<TeriockActor>} actors
   * @returns {boolean}
   */
  checkActors(actors) {
    return this.#check(actors, "TERIOCK.DIALOGS.Common.ERRORS.noActor");
  }

  /**
   * Check if a sheet or document is editable and give a warning if not.
   * @param {ApplicationV2|TeriockDocument} obj
   * @returns {boolean}
   */
  checkEditable(obj) {
    const sheet = obj instanceof foundry.abstract.Document ? obj.sheet : obj;
    const valid = !!sheet.isEditable;
    if (!valid) {
      ui.notifications.notify("TERIOCK.DIALOGS.Common.ERRORS.notEditable", "error", { localize: true });
    }
    return valid;
  }

  /**
   * Check if there's an active scene and give a warning if not.
   * @returns {boolean}
   */
  checkScene() {
    const valid = !!canvas.scene;
    if (!valid) {
      ui.notifications.notify("TERIOCK.DIALOGS.Common.ERRORS.noScene", "error", { localize: true });
    }
    return valid;
  }

  /**
   * Check if there's tokens and give a warning if not.
   * @param {Teriock.System.Existable<TeriockToken|TeriockTokenDocument>} tokens
   * @returns {boolean}
   */
  checkTokens(tokens) {
    return this.#check(tokens, "TERIOCK.DIALOGS.Common.ERRORS.noToken");
  }

  /**
   * Get the value of some Teriock setting.
   * @param {Teriock.Keys.Setting} setting
   * @return {*|Setting}
   */
  getSetting(setting) {
    return game.settings.get("teriock", setting);
  }
}

class TeriockPacks {
  /**
   * Official abilities.
   * @returns {CompendiumCollection<TeriockAbility>}
   */
  get abilities() {
    return game.packs.get("teriock.abilities");
  }

  /**
   * Official body parts.
   * @returns {CompendiumCollection<TeriockBody>}
   */
  get bodyParts() {
    return game.packs.get("teriock.bodyParts");
  }

  /**
   * Official classes.
   * @returns {CompendiumCollection<TeriockRank>}
   */
  get classes() {
    return game.packs.get("teriock.classes");
  }

  /**
   * Official creatures.
   * @returns {CompendiumCollection<TeriockCreature>}
   */
  get creatures() {
    return game.packs.get("teriock.creatures");
  }

  /**
   * Official equipment.
   * @returns {CompendiumCollection<TeriockEquipment>}
   */
  get equipment() {
    return game.packs.get("teriock.equipment");
  }

  /**
   * Official common essential items.
   * @returns {CompendiumCollection<AnyItem>}
   */
  get essentials() {
    return game.packs.get("teriock.essentials");
  }

  /**
   * Official ability execution macros.
   * @returns {CompendiumCollection<TeriockMacro>}
   */
  get execution() {
    return game.packs.get("teriock.execution");
  }

  /**
   * Official magic items.
   * @returns {CompendiumCollection<TeriockEquipment>}
   */
  get magicItems() {
    return game.packs.get("teriock.magicItems");
  }

  /**
   * Official maintenance macros.
   * @returns {CompendiumCollection<TeriockMacro>}
   */
  get maintenance() {
    return game.packs.get("teriock.maintenance");
  }

  /**
   * Official player utilities.
   * @returns {CompendiumCollection<TeriockMacro>}
   */
  get player() {
    return game.packs.get("teriock.player");
  }

  /**
   * Official powers.
   * @returns {CompendiumCollection<TeriockPower>}
   */
  get powers() {
    return game.packs.get("teriock.powers");
  }

  /**
   * Official properties.
   * @returns {CompendiumCollection<TeriockProperty>}
   */
  get properties() {
    return game.packs.get("teriock.properties");
  }

  /**
   * Official rules.
   * @returns {CompendiumCollection<TeriockJournalEntry>}
   */
  get rules() {
    return game.packs.get("teriock.rules");
  }

  /**
   * Official species.
   * @returns {CompendiumCollection<TeriockSpecies>}
   */
  get species() {
    return game.packs.get("teriock.species");
  }

  /**
   * Official tables.
   * @returns {CompendiumCollection<TeriockRollTable>}
   */
  get tables() {
    return game.packs.get("teriock.tables");
  }
}
