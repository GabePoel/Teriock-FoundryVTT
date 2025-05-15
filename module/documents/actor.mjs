/**
 * @extends {Actor}
 */
export class TeriockActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /** @override */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.teriock || {};
    this._prepareHpMp();
    this._prepareBonuses();
    const usp = this.itemTypes.equipment.reduce((total, item) => {
      if (item.system.equipped) {
      return total + (item.system.tier || 0);
      }
      return total;
    }, 0);
    const maxUsp = this.system.pres;
    if (usp > maxUsp) {
      usp = maxUsp;
    }
    const unp = this.system.pres - usp;
    this.system.attributes.unp.value = unp;
    this.system.unp = unp;
    this.system.usp = usp;
    this.system.presence = {
      max: this.system.pres,
      min: 0,
      value: this.system.usp,
    }
    this._prepareAttributes();
    this._prepareTradecrafts();
  }

  _prepareHpMp() {
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
    this.system.hp.max = hpMax;
    this.system.hp.min = -hpMax / 2;
    this.system.mp.max = mpMax;
    this.system.mp.min = -mpMax / 2;
  }

  _prepareBonuses() {
    // const lvl = this.system.level;
    const lvl = this.system.lvl;
    const pres = Math.max(Math.floor( 1 + (lvl + 1) / 5 ));
    const rank = Math.max(Math.floor( (lvl - 1) / 5 ));
    const p = Math.max(0, Math.floor(1 + (lvl - 7) / 10));
    const f = Math.max(Math.floor( (lvl - 2) / 5 ));
    this.system.pres = pres;
    this.system.rank = rank;
    this.system.p = p;
    this.system.f = f;
  }

  _prepareAttribute(attribute) {
    const value = this.system.attributes[attribute].value;
    const proficient = this.system.attributes[attribute].saveProficient;
    const fluent = this.system.attributes[attribute].saveFluent;
    let bonus = 0;
    if (proficient) {
      bonus = this.system.p;
    }
    if (fluent) {
      bonus = this.system.f;
    }
    this.system[attribute + 'Save'] = value + bonus;
  }

  _prepareAttributes() {
    for (const attribute of Object.keys(this.system.attributes)) {
      this._prepareAttribute(attribute);
    }
  }

  _prepareTradecraft(tradecraft) {
    let bonus = 0;
    const proficient = this.system.tradecrafts[tradecraft].proficient;
    if (proficient) {
      bonus = this.system.p;
    }
    this.system.tradecrafts[tradecraft].bonus = bonus;
  }

  _prepareTradecrafts() {
    for (const tradecraft of Object.keys(this.system.tradecrafts)) {
      this._prepareTradecraft(tradecraft);
    }
  }
}
