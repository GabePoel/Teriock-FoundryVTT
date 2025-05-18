/**
 * @extends {Actor}
 */
export class TeriockActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareDerivedData() {
    this._prepareBonuses();
    this._prepareHpMp();

    const equipped = this.itemTypes.equipment.filter(i => i.system.equipped);
    let usp = equipped.reduce((sum, item) => sum + (item.system.tier || 0), 0);
    usp = Math.min(usp, this.system.pres);

    const unp = this.system.pres - usp;
    Object.assign(this.system, {
      unp,
      usp,
      attributes: {
        ...this.system.attributes,
        unp: { ...this.system.attributes.unp, value: unp }
      },
      presence: {
        max: this.system.pres,
        min: 0,
        value: usp
      }
    });

    this._prepareAttributes();
    this._prepareTradecrafts();
    this._prepareWeightCarried();
    this._prepareDefenses();
    this._prepareOffenses();
  }

  rollData() {
    const { system } = this;
    const attr = system.attributes;

    let data = {
      lvl: system.lvl,
      pres: system.pres,
      usp: system.usp,
      unp: system.unp,
      rank: system.rank,
      p: system.p,
      f: system.f,
      int: attr.int.value,
      mov: attr.mov.value,
      per: attr.per.value,
      snk: attr.snk.value,
      str: attr.str.value,
      hp: system.hp.value,
      mp: system.mp.value,
      hpMax: system.hp.max,
      mpMax: system.mp.max,
      tempHp: system.hp.temp,
      tempMp: system.mp.temp,
      av0: (
        (system.piercing === 'av0' || system.piercing === 'ub')
      ) ? 2 : 0,
      sb: system.sb ? 1 : 0,
      atkPen: system.attackPenalty,
    };

    data = this._prepareClassRanksData(data);
    data = this._prepareTradecraftsData(data);
    return data;
  }

  takeDamage(damage) {
    const { hp } = this.system;
    const temp = Math.max(0, hp.temp - damage);
    damage = Math.max(0, damage - hp.temp);
    const value = Math.max(hp.min, hp.value - damage);

    this.update({ 'system.hp.value': value, 'system.hp.temp': temp });
  }

  takeDrain(drain) {
    const { mp } = this.system;
    const temp = Math.max(0, mp.temp - drain);
    drain = Math.max(0, drain - mp.temp);
    const value = Math.max(mp.min, mp.value - drain);

    this.update({ 'system.mp.value': value, 'system.mp.temp': temp });
  }

  rollTradecraft(tradecraft) {
    const data = this.system.tradecrafts[tradecraft];
    let formula = '1d20';
    if (data.proficient) formula += ' + @p';
    if (data.extra) formula += ` + @${tradecraft}`;

    new Roll(formula, this.rollData()).evaluate({ async: true }).then(result => {
      result.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${tradecraft[0].toUpperCase() + tradecraft.slice(1)} Check`,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rollMode: game.settings.get("core", "rollMode"),
        create: true
      });
    });
  }

  rollFeatSave(attribute) {
    const bonus = this.system[`${attribute}Save`] || 0;
    new Roll(`1d20 + ${bonus}`).evaluate({ async: true }).then(result => {
      result.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${attribute.toUpperCase()} Feat Save`,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rollMode: game.settings.get("core", "rollMode"),
        create: true
      });
    });
  }

  _prepareDefenses() {
    if (this.system.sheet.primaryBlocker) {
      this.system.primaryBlocker = this.itemTypes.equipment.find(i => i._id === this.system.sheet.primaryBlocker);
      if (!this.system.primaryBlocker || !this.system.primaryBlocker.system.equipped) {
        this.system.sheet.primaryBlocker = null;
      }
    }
    this.system.bv = this.system.primaryBlocker?.system.bv || 0;
    const equipped = this.itemTypes.equipment.filter(i => i.system.equipped);
    let ac = 10;
    this.system.av = equipped.reduce((max, item) => Math.max(max, item.system.av || 0), 0);
    ac += this.system.av;
    this.system.hasArmor = equipped.some(item =>
      Array.isArray(item.system.equipmentClasses) &&
      item.system.equipmentClasses.includes("armor")
    );
    if (this.system.hasArmor) {
      ac += this.system.wornAc || 0;
    }
    this.system.ac = ac;
    this.system.cc = ac + this.system.bv;
  }

  _prepareOffenses() {
    if (this.system.sheet.primaryAttacker) {
      this.system.primaryAttacker = this.itemTypes.equipment.find(i => i._id === this.system.sheet.primaryAttacker);
      if (!this.system.primaryAttacker || !this.system.primaryAttacker.system.equipped) {
        this.system.sheet.primaryAttacker = null;
      }
    }
  }

  _prepareBonuses() {
    const lvl = this.system.lvl;
    Object.assign(this.system, {
      pres: Math.max(1, Math.floor(1 + (lvl + 1) / 5)),
      rank: Math.max(0, Math.floor((lvl - 1) / 5)),
      p: Math.max(0, Math.floor(1 + (lvl - 7) / 10)),
      f: Math.max(0, Math.floor((lvl - 2) / 5))
    });
  }

  _prepareHpMp() {
    const items = this.itemTypes.rank;
    const diceLimit = Math.floor(this.system.lvl / 5);
    let hpMax = 1, mpMax = 1;
    let hitDieBox = '', manaDieBox = '';

    items.slice(0, diceLimit).forEach(rank => {
      if (rank.system.hp) {
        hpMax += rank.system.hp;
        const spent = rank.system.hitDieSpent;
        hitDieBox += this._renderDieBox(rank, 'hit', 'hitDie', spent);
      }
      if (rank.system.mp) {
        mpMax += rank.system.mp;
        const spent = rank.system.manaDieSpent;
        manaDieBox += this._renderDieBox(rank, 'mana', 'manaDie', spent);
      }
    });

    Object.assign(this.system.hp, {
      max: hpMax,
      min: -hpMax / 2,
      value: Math.min(this.system.hp.value, hpMax)
    });
    Object.assign(this.system.mp, {
      max: mpMax,
      min: -mpMax / 2,
      value: Math.min(this.system.mp.value, mpMax)
    });

    this.system.sheet.dieBox = { hitDice: hitDieBox, manaDice: manaDieBox };
  }

  _renderDieBox(rank, type, dieProp, spent) {
    const iconClass = spent ? "fa-light" : "fa-solid";
    const rollClass = spent ? "rolled" : "unrolled";
    const action = spent ? "" : `data-action='roll${type === 'hit' ? "Hit" : "Mana"}Die'`;
    return `<div class="die-box ${rollClass}" data-die="${type}" data-id='${rank._id}' ${action}>
      <i class="fa-fw ${iconClass} fa-dice-${rank.system[dieProp]}"></i></div>`;
  }

  _prepareAttributes() {
    const attrs = this.system.attributes;

    for (const key of Object.keys(attrs)) {
      const attr = attrs[key];
      const bonus = attr.fluent ? this.system.f : attr.proficient ? this.system.p : 0;
      this.system[`${key}Save`] = attr.value + bonus;
    }

    const mov = attrs.mov.value;
    const str = attrs.str.value;
    const size = this.system.size;

    this.system.movementSpeed = 30 + 10 * mov;

    const strFactor = size < 5 ? str : str + Math.pow(size - 5, 2);
    const base = 65 + 20 * strFactor;

    this.system.carryingCapacity = {
      light: base,
      heavy: base * 2,
      max: base * 3
    };
  }

  _prepareWeightCarried() {
    const weight = this.itemTypes.equipment
      .filter(i => i.system.equipped)
      .reduce((sum, i) => sum + (i.system.weight || 0), 0);
    this.system.weightCarried = weight;
  }

  _prepareTradecrafts() {
    for (const key of Object.keys(this.system.tradecrafts)) {
      this._prepareTradecraft(key);
    }
  }

  _prepareTradecraft(key) {
    const tc = this.system.tradecrafts[key];
    tc.bonus = (tc.proficient ? this.system.p : 0) + tc.extra;
  }

  _prepareClassRanksData(data) {
    const rankKeys = [
      "fla", "lif", "nat", "nec", "sto", "arc", "ass", "cor", "ran", "thi",
      "ber", "due", "kni", "pal", "vet", "mag", "sem", "war"
    ];
    for (const key of rankKeys) data[key] = 0;

    for (const rank of this.itemTypes.rank) {
      const classKey = rank.system.className?.slice(0, 3).toLowerCase();
      const archetypeKey = rank.system.archetype?.slice(0, 3).toLowerCase();

      if (classKey in data) data[classKey]++;
      if (archetypeKey in data) data[archetypeKey]++;
    }

    return data;
  }

  _prepareTradecraftsData(data) {
    for (const [key, val] of Object.entries(this.system.tradecrafts)) {
      data[key] = val.extra;
    }
    return data;
  }
}
