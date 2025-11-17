export default class TeriockPacks {
  /**
   * Official abilities.
   * @returns {CompendiumCollection<TeriockAbility> & CompendiumHelper<TeriockAbility>}
   */
  get abilities() {
    return game.packs.get("teriock.abilities");
  }

  /**
   * Official body parts.
   * @returns {CompendiumCollection<TeriockBody> & CompendiumHelper<TeriockBody>}
   */
  get bodyParts() {
    return game.packs.get("teriock.bodyParts");
  }

  /**
   * Official classes.
   * @returns {CompendiumCollection<TeriockRank> & CompendiumHelper<TeriockRank>}
   */
  get classes() {
    return game.packs.get("teriock.classes");
  }

  /**
   * Official creatures.
   * @returns {CompendiumCollection<TeriockCreature> & CompendiumHelper<TeriockCreature>}
   */
  get creatures() {
    return game.packs.get("teriock.creatures");
  }

  /**
   * Official equipment.
   * @returns {CompendiumCollection<TeriockEquipment> & CompendiumHelper<TeriockEquipment>}
   */
  get equipment() {
    return game.packs.get("teriock.equipment");
  }

  /**
   * Official powers common many things.
   * @returns {CompendiumCollection<TeriockPower> & CompendiumHelper<TeriockPower>}
   */
  get essentials() {
    return game.packs.get("teriock.essentials");
  }

  /**
   * Official ability execution macros.
   * @returns {CompendiumCollection<TeriockMacro> & CompendiumHelper<TeriockMacro>}
   */
  get execution() {
    return game.packs.get("teriock.execution");
  }

  /**
   * Official magic items.
   * @returns {CompendiumCollection<TeriockEquipment> & CompendiumHelper<TeriockEquipment>}
   */
  get magicItems() {
    return game.packs.get("teriock.magicItems");
  }

  /**
   * Official maintenance macros.
   * @returns {CompendiumCollection<TeriockMacro> & CompendiumHelper<TeriockMacro>}
   */
  get maintenance() {
    return game.packs.get("teriock.maintenance");
  }

  /**
   * Official powers.
   * @returns {CompendiumCollection<TeriockPower> & CompendiumHelper<TeriockPower>}
   */
  get powers() {
    return game.packs.get("teriock.powers");
  }

  /**
   * Official properties.
   * @returns {CompendiumCollection<TeriockPower> & CompendiumHelper<TeriockPower>}
   */
  get properties() {
    return game.packs.get("teriock.properties");
  }

  /**
   * Official rules.
   * @returns {CompendiumCollection<TeriockJournalEntry> & CompendiumHelper<TeriockJournalEntry>}
   */
  get rules() {
    return game.packs.get("teriock.rules");
  }

  /**
   * Official species.
   * @returns {CompendiumCollection<TeriockSpecies> & CompendiumHelper<TeriockSpecies>}
   */
  get species() {
    return game.packs.get("teriock.species");
  }

  /**
   * Official tables.
   * @returns {CompendiumCollection<TeriockRollTable> & CompendiumHelper<TeriockRollTable>}
   */
  get tables() {
    return game.packs.get("teriock.tables");
  }
}
