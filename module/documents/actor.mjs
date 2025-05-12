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
    this._prepareHpMp(actorData);
    this._prepareBonuses(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareHpMp(actorData) {
    let hpMax = 1;
    let mpMax = 1;
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

  _prepareBonuses(actorData) {
    // const lvl = this.system.level;
    const lvl = this.system.lvl;
    const pres = Math.floor( 1 + (lvl + 1) / 5 );
    const rank = Math.floor( (lvl - 1) / 5 );
    const p = Math.floor( 1 + (lvl - 7) / 10 );
    const f = Math.floor( (lvl - 2) / 5 );
    this.system.pres = pres;
    this.system.rank = rank;
    this.system.p = p;
    this.system.f = f;
    console.log('lvl', lvl);
    console.log('pres', pres);
    console.log('rank', rank);
    console.log('p', p);
    console.log('f', f);
  }
}
