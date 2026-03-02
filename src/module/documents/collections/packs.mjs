//eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Collection } = foundry.utils;
const { CompendiumCollection } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax
/**
 * @template T
 * @extends {Collection<ID<T>, T>}
 */
export class TeriockCompendiumCollection extends CompendiumCollection {
  /**
   * @type {Collection<ID<TeriockFolder>, TeriockFolder>}
   */
  folders;

  /**
   * @type {Collection<ID<T>, Index<T>>}
   */
  index;
}

export default class TeriockPacks {
  /**
   * Official abilities.
   * @returns {TeriockCompendiumCollection<TeriockWrapper<TeriockAbility>>}
   */
  get abilities() {
    return game.packs.get("teriock.abilities");
  }

  /**
   * Official body parts.
   * @returns {TeriockCompendiumCollection<TeriockBody>}
   */
  get bodyParts() {
    return game.packs.get("teriock.bodyParts");
  }

  /**
   * Official classes.
   * @returns {TeriockCompendiumCollection<TeriockRank>}
   */
  get classes() {
    return game.packs.get("teriock.classes");
  }

  /**
   * Official creatures.
   * @returns {TeriockCompendiumCollection<TeriockCreature>}
   */
  get creatures() {
    return game.packs.get("teriock.creatures");
  }

  /**
   * Official equipment.
   * @returns {TeriockCompendiumCollection<TeriockEquipment>}
   */
  get equipment() {
    return game.packs.get("teriock.equipment");
  }

  /**
   * Official common essential items.
   * @returns {TeriockCompendiumCollection<GenericItem>}
   */
  get essentials() {
    return game.packs.get("teriock.essentials");
  }

  /**
   * Official ability execution macros.
   * @returns {TeriockCompendiumCollection<TeriockMacro>}
   */
  get execution() {
    return game.packs.get("teriock.execution");
  }

  /**
   * Official magic items.
   * @returns {TeriockCompendiumCollection<TeriockEquipment>}
   */
  get magicItems() {
    return game.packs.get("teriock.magicItems");
  }

  /**
   * Official maintenance macros.
   * @returns {TeriockCompendiumCollection<TeriockMacro>}
   */
  get maintenance() {
    return game.packs.get("teriock.maintenance");
  }

  /**
   * Official player utilities.
   * @returns {TeriockCompendiumCollection<TeriockMacro>}
   */
  get player() {
    return game.packs.get("teriock.player");
  }

  /**
   * Official powers.
   * @returns {TeriockCompendiumCollection<TeriockPower>}
   */
  get powers() {
    return game.packs.get("teriock.powers");
  }

  /**
   * Official properties.
   * @returns {TeriockCompendiumCollection<TeriockWrapper<TeriockProperty>>}
   */
  get properties() {
    return game.packs.get("teriock.properties");
  }

  /**
   * Official rules.
   * @returns {TeriockCompendiumCollection<TeriockJournalEntry>}
   */
  get rules() {
    return game.packs.get("teriock.rules");
  }

  /**
   * Official species.
   * @returns {TeriockCompendiumCollection<TeriockSpecies>}
   */
  get species() {
    return game.packs.get("teriock.species");
  }

  /**
   * Official tables.
   * @returns {TeriockCompendiumCollection<TeriockRollTable>}
   */
  get tables() {
    return game.packs.get("teriock.tables");
  }
}
