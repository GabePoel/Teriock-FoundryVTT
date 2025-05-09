/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class TeriockActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.teriock || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareActorData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareActorData(actorData) {
    let hpMax = 0;
    let mpMax = 0;
    const allItems = this.itemTypes;
    for (const rank of allItems.rank) {
      if (rank.system.hp) {
        hpMax += rank.system.hp;
      }
      if (rank.system.mp) {
        mpMax += rank.system.mp;
      }
    }
    this.system.hpMax = hpMax;
    this.system.mpMax = mpMax;
  }


}
