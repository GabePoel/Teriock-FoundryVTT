import { BaseRoll } from "../dice/rolls/_module.mjs";
import TeriockMacro from "../documents/macro/macro.mjs";
import { DependentsRegistry } from "./_module.mjs";
import { resolveDocument } from "./resolve.mjs";
import { inferNameFromIdentifier } from "./utils.mjs";

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
   * Get a document from its identifier.
   * @param {Teriock.System.IdentifierString} identifier
   * @param {Teriock.Documents.CommonType} type
   * @returns {Promise<TeriockDocument|null>}
   */
  async getDocument(identifier, type) {
    const documentName = TERIOCK.options.document[type]?.doc;
    if (!documentName) return null;
    const packs = game.packs.contents.filter(
      (p) => p.documentName === documentName,
    );
    if (type === "ability") {
      for (const key of this.getSetting("compendiumAbilitySources")) {
        const pack = game.packs.get(key);
        if (pack && !packs.includes(pack)) packs.push(pack);
      }
    }
    if (type === "property") {
      for (const key of this.getSetting("compendiumPropertySources")) {
        const pack = game.packs.get(key);
        if (pack && !packs.includes(pack)) packs.push(pack);
      }
    }
    for (const p of packs) {
      const docs = await p.getDocuments({ system: { identifier } });
      if (docs.length > 0) return docs[0];
      if (documentName === "ActiveEffect" && p.documentName === "Item") {
        const doc = await resolveDocument(
          p.index.getName(inferNameFromIdentifier(identifier, type)),
        );
        if (doc?.type === type) return doc;
      }
    }
    const collectionName =
      foundry.utils.getDocumentClass(documentName)?.collectionName;
    if (collectionName === "effects") {
      const collection = game.items;
      const candidate = collection.find(
        (d) =>
          d.type === "wrapper" &&
          d.system?.effect?.type === type &&
          d.system?.effect?.system?.identifier === identifier,
      );
      if (candidate) return candidate.system.effect;
    } else {
      const collection = game[collectionName];
      if (!collection) return null;
      const candidate = collection.find(
        (d) =>
          foundry.utils.getProperty(d, "system.identifier") === identifier &&
          d.type === type,
      );
      if (candidate) return candidate;
    }
    return null;
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
   * @returns {CompendiumCollection<TeriockWrapper<TeriockAbility>>}
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
   * @returns {CompendiumCollection<TeriockWrapper<TeriockProperty>>}
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
