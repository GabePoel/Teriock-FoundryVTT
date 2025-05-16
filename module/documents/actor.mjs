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
    let usp = this.itemTypes.equipment.reduce((total, item) => {
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

  rollData() {
    let key = {
      lvl: this.system.lvl,
      pres: this.system.pres,
      usp: this.system.usp,
      unp: this.system.unp,
      rank: this.system.rank,
      p: this.system.p,
      f: this.system.f,
      int: this.system.attributes.int.value,
      mov: this.system.attributes.mov.value,
      per: this.system.attributes.per.value,
      snk: this.system.attributes.snk.value,
      str: this.system.attributes.str.value,
      hp: this.system.hp.value,
      mp: this.system.mp.value,
      hpMax: this.system.hp.max,
      mpMax: this.system.mp.max,
      tempHp: this.system.hp.temp,
      tempMp: this.system.mp.temp,
    }
    key = this._prepareClassRanks(key);
    return key;
  }

  takeDamage(damage) {
    const hp = this.system.hp.value;
    const tempHp = this.system.hp.temp;
    const newTempHp = Math.max(0, tempHp - damage);
    damage = Math.max(0, damage - tempHp);
    const newHp = Math.max(this.system.hp.min, hp - damage);
    this.update({
      'system.hp.value': newHp,
      'system.hp.temp': newTempHp,
    });
  }

  takeDrain(drain) {
    const mp = this.system.mp.value;
    const tempMp = this.system.mp.temp;
    const newTempMp = Math.max(0, tempMp - drain);
    drain = Math.max(0, drain - tempMp);
    const newMp = Math.max(this.system.mp.min, mp - drain);
    this.update({
      'system.mp.value': newMp,
      'system.mp.temp': newTempMp,
    });
  }

  _prepareClassRanks(data) {
    data.fla = 0;
    data.lif = 0;
    data.nat = 0;
    data.nec = 0;
    data.sto = 0;
    data.arc = 0;
    data.ass = 0;
    data.cor = 0;
    data.ran = 0;
    data.thi = 0;
    data.ber = 0;
    data.due = 0;
    data.kni = 0;
    data.pal = 0;
    data.vet = 0;
    data.mag = 0;
    data.sem = 0;
    data.war = 0;
    for (const rank of this.itemTypes.rank) {
      const classKey = rank.system.className ? rank.system.className.slice(0, 3).toLowerCase() : null;
      if (classKey && data.hasOwnProperty(classKey)) {
        data[classKey] += 1;
      }
      const archetypeKey = rank.system.archetype ? rank.system.archetype.slice(0, 3).toLowerCase() : null;
      if (archetypeKey && data.hasOwnProperty(archetypeKey)) {
        data[archetypeKey] += 1;
      }
    }
    return data
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
    const pres = Math.max(Math.floor(1 + (lvl + 1) / 5));
    const rank = Math.max(Math.floor((lvl - 1) / 5));
    const p = Math.max(0, Math.floor(1 + (lvl - 7) / 10));
    const f = Math.max(Math.floor((lvl - 2) / 5));
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
