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
    this._prepareBonuses();
    this._prepareHpMp();
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
    this._prepareWeightCarried();
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
    key = this._prepareClassRanksData(key);
    key = this._prepareTradecraftsData(key);
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

  rollTradecraft(tradecraft) {
    const bonus = this.system.tradecrafts[tradecraft].bonus;
    let rollFormula = '1d20';
    if (this.system.tradecrafts[tradecraft].proficient) {
      rollFormula += ' + @p';
    }
    if (this.system.tradecrafts[tradecraft].extra) {
      rollFormula += ' + @' + tradecraft;
    }
    const roll = new Roll(rollFormula, this.rollData());
    roll.evaluate({ async: true }).then((result) => {
      const message = result.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${tradecraft.charAt(0).toUpperCase() + tradecraft.slice(1)} Check`,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rollMode: game.settings.get("core", "rollMode"),
        create: true,
      });
    });
  }

  rollFeatSave(attribute) {
    const bonus = this.system[attribute + 'Save'];
    const roll = new Roll('1d20 + ' + bonus);
    roll.evaluate({ async: true }).then((result) => {
      const message = result.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${attribute.toUpperCase()} Feat Save`,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rollMode: game.settings.get("core", "rollMode"),
        create: true,
      });
    });
  }

  _prepareClassRanksData(data) {
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

  _prepareTradecraftsData(data) {
    for (const tradecraft of Object.keys(this.system.tradecrafts)) {
      data[tradecraft] = this.system.tradecrafts[tradecraft].extra;
    }
    return data;
  }

  _prepareHpMp() {
    let hpMax = 1;
    let mpMax = 1;
    let hitDieBox = "";
    let manaDieBox = "";
    const numDiceRanks = Math.floor(this.system.lvl / 5);
    const allItems = this.itemTypes;
    let rankCount = 0;
    for (const rank of allItems.rank) {
      if (rankCount >= numDiceRanks) break;
      if (rank.system.hp) {
        hpMax += rank.system.hp;
        const rollClass = rank.system.hitDieSpent ? "rolled" : "unrolled";
        const iconClass = !rank.system.hitDieSpent ? "fa-solid" : "fa-light";
        const action = !rank.system.hitDieSpent ? `data-action='rollHitDie'` : "";
        hitDieBox += `<div class="die-box ${rollClass}" data-die="hit" data-id='${rank._id}' ${action}><i class="fa-fw ${iconClass} fa-dice-${rank.system.hitDie}"></i></div>`;
      }
      if (rank.system.mp) {
        mpMax += rank.system.mp;
        const rollClass = rank.system.manaDieSpent ? "rolled" : "unrolled";
        const iconClass = !rank.system.manaDieSpent ? "fa-solid" : "fa-light";
        const action = !rank.system.manaDieSpent ? `data-action='rollManaDie'` : "";
        manaDieBox += `<div class="die-box ${rollClass}" data-die="mana" data-id='${rank._id}' ${action}><i class="fa-fw ${iconClass} fa-dice-${rank.system.manaDie}"></i></div>`;
      }
      rankCount++;
    }
    this.system.hp.max = hpMax;
    this.system.hp.min = -hpMax / 2;
    this.system.hp.value = Math.min(this.system.hp.value, hpMax);
    this.system.mp.max = mpMax;
    this.system.mp.min = -mpMax / 2;
    this.system.mp.value = Math.min(this.system.mp.value, mpMax);
    this.system.sheet.dieBox.hitDice = hitDieBox;
    this.system.sheet.dieBox.manaDice = manaDieBox;
  }

  _prepareBonuses() {
    const lvl = this.system.lvl;
    const pres = Math.max(Math.floor(1 + (lvl + 1) / 5));
    const rank = Math.max(Math.floor((lvl - 1) / 5));
    const p = Math.max(0, Math.floor(1 + (lvl - 7) / 10));
    const f = Math.max(0, Math.floor((lvl - 2) / 5));
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
    this.system.movementSpeed = 30 + (10 * this.system.attributes.mov.value);
    if (this.system.size < 5) {
      this.system.carryingCapacity.light = 65 + (20 * this.system.attributes.str.value);
    } else {
      this.system.carryingCapacity.light = 65 + (20 * (this.system.attributes.str.value + Math.pow(this.system.size - 5, 2)));
    }
    this.system.carryingCapacity.heavy = 2 * this.system.carryingCapacity.light;
    this.system.carryingCapacity.max = 3 * this.system.carryingCapacity.light;
  }

  _prepareWeightCarried() {
    let weightCarried = 0;
    for (const item of this.itemTypes.equipment) {
      if (item.system.equipped) {
        weightCarried += item.system.weight;
      }
    }
    this.system.weightCarried = weightCarried;
  }

  _prepareTradecraft(tradecraft) {
    let bonus = 0;
    const proficient = this.system.tradecrafts[tradecraft].proficient;
    if (proficient) {
      bonus = this.system.p;
    }
    bonus += this.system.tradecrafts[tradecraft].extra;
    this.system.tradecrafts[tradecraft].bonus = bonus;
  }

  _prepareTradecrafts() {
    for (const tradecraft of Object.keys(this.system.tradecrafts)) {
      this._prepareTradecraft(tradecraft);
    }
  }
}
