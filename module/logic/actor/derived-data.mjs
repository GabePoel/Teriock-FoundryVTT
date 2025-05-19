export default function prepareDerivedData(actor) {
    prepareBonuses(actor);
    prepareHpMp(actor);
    preparePresence(actor);
    prepareAttributes(actor);
    prepareTradecrafts(actor);
    prepareWeightCarried(actor);
    prepareDefenses(actor);
    prepareOffenses(actor);
    console.log('Derived data prepared for actor:', actor.name);
    console.log('Derived data:', actor.system);
}

function prepareBonuses(actor) {
    const lvl = actor.system.lvl;
    Object.assign(actor.system, {
        pres: Math.max(1, Math.floor(1 + (lvl + 1) / 5)),
        rank: Math.max(0, Math.floor((lvl - 1) / 5)),
        p: Math.max(0, Math.floor(1 + (lvl - 7) / 10)),
        f: Math.max(0, Math.floor((lvl - 2) / 5))
    });
}

function prepareHpMp(actor) {
    const items = actor.itemTypes.rank;
    const diceLimit = Math.floor(actor.system.lvl / 5);
    let hpMax = 1, mpMax = 1;
    let hitDieBox = '', manaDieBox = '';

    items.slice(0, diceLimit).forEach(rank => {
        if (rank.system.hp) {
            hpMax += rank.system.hp;
            const spent = rank.system.hitDieSpent;
            hitDieBox += actor._renderDieBox(rank, 'hit', 'hitDie', spent);
        }
        if (rank.system.mp) {
            mpMax += rank.system.mp;
            const spent = rank.system.manaDieSpent;
            manaDieBox += actor._renderDieBox(rank, 'mana', 'manaDie', spent);
        }
    });

    Object.assign(actor.system.hp, {
        max: hpMax,
        min: -hpMax / 2,
        value: Math.ceil(Math.min(actor.system.hp.value, hpMax)),
    });
    Object.assign(actor.system.mp, {
        max: mpMax,
        min: -mpMax / 2,
        value: Math.ceil(Math.min(actor.system.mp.value, mpMax)),
    });

    actor.system.sheet.dieBox = { hitDice: hitDieBox, manaDice: manaDieBox };
}

function preparePresence(actor) {
    const equipped = actor.itemTypes.equipment.filter(i => i.system.equipped);
    let usp = equipped.reduce((sum, item) => sum + (item.system.tier || 0), 0);
    usp = Math.min(usp, actor.system.pres);

    const unp = actor.system.pres - usp;
    Object.assign(actor.system, {
        unp,
        usp,
        attributes: {
            ...actor.system.attributes,
            unp: { ...actor.system.attributes.unp, value: unp }
        },
        presence: {
            max: actor.system.pres,
            min: 0,
            value: usp
        }
    });
}

function prepareAttributes(actor) {
    const attrs = actor.system.attributes;

    for (const key of Object.keys(attrs)) {
        const attr = attrs[key];
        const bonus = attr.fluent ? actor.system.f : attr.proficient ? actor.system.p : 0;
        actor.system[`${key}Save`] = attr.value + bonus;
    }

    const mov = attrs.mov.value;
    const str = attrs.str.value;
    const size = actor.system.size;

    actor.system.movementSpeed = 30 + 10 * mov;

    const strFactor = size < 5 ? str : str + Math.pow(size - 5, 2);
    const base = 65 + 20 * strFactor;

    actor.system.carryingCapacity = {
        light: base,
        heavy: base * 2,
        max: base * 3
    };
}

function _prepareTradecraft(actor, key) {
    const tc = actor.system.tradecrafts[key];
    tc.bonus = (tc.proficient ? actor.system.p : 0) + tc.extra;
}

function prepareTradecrafts(actor) {
    for (const key of Object.keys(actor.system.tradecrafts)) {
        _prepareTradecraft(actor, key);
    }
}

function prepareWeightCarried(actor) {
    const weight = actor.itemTypes.equipment
        .filter(i => i.system.equipped)
        .reduce((sum, i) => sum + (i.system.weight || 0), 0);
    actor.system.weightCarried = weight;
}

function prepareDefenses(actor) {
    if (actor.system.sheet.primaryBlocker) {
        actor.system.primaryBlocker = actor.itemTypes.equipment.find(i => i._id === actor.system.sheet.primaryBlocker);
        if (!actor.system.primaryBlocker || !actor.system.primaryBlocker.system.equipped) {
            actor.system.sheet.primaryBlocker = null;
        }
    }
    actor.system.bv = actor.system.primaryBlocker?.system.bv || 0;
    const equipped = actor.itemTypes.equipment.filter(i => i.system.equipped);
    let ac = 10;
    actor.system.av = equipped.reduce((max, item) => Math.max(max, item.system.av || 0), 0);
    ac += actor.system.av;
    actor.system.hasArmor = equipped.some(item =>
        Array.isArray(item.system.equipmentClasses) &&
        item.system.equipmentClasses.includes("armor")
    );
    if (actor.system.hasArmor) {
        ac += actor.system.wornAc || 0;
    }
    actor.system.ac = ac;
    actor.system.cc = ac + actor.system.bv;
}

function prepareOffenses(actor) {
    if (actor.system.sheet.primaryAttacker) {
        actor.system.primaryAttacker = actor.itemTypes.equipment.find(i => i._id === actor.system.sheet.primaryAttacker);
        if (!actor.system.primaryAttacker || !actor.system.primaryAttacker.system.equipped) {
            actor.system.sheet.primaryAttacker = null;
        }
    }
}