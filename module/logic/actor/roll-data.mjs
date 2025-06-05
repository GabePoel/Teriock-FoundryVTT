export default function getRollData(actor) {
  const data = {};
  basicData(actor, data);
  attackData(actor, data);
  classRanksData(actor, data);
  tradecraftsData(actor, data);
  return data;
}

function basicData(actor, data) {
  const { system } = actor;
  const attr = system.attributes;
  Object.assign(data, {
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
    hand: system.damage.hand,
    foot: system.damage.foot,
    mouth: system.damage.mouth,
    bshield: system.damage.bucklerShield,
    lshield: system.damage.largeShield,
    tshield: system.damage.towerShield,
    standard: system.damage.standard,
  });
}

function attackData(actor, data) {
  const { system } = actor;
  Object.assign(data, {
    av0: (system.piercing === 'av0' || system.piercing === 'ub') ? 2 : 0,
    sb: system.sb ? 1 : 0,
    atkPen: system.attackPenalty,
  });
}

function classRanksData(actor, data) {
  const rankKeys = [
    "fla", "lif", "nat", "nec", "sto", "arc", "ass", "cor", "ran", "thi",
    "ber", "due", "kni", "pal", "vet", "mag", "sem", "war"
  ];
  for (const key of rankKeys) data[key] = 0;

  for (const rank of actor.itemTypes.rank) {
    const classKey = rank.system.className?.slice(0, 3).toLowerCase();
    const archetypeKey = rank.system.archetype?.slice(0, 3).toLowerCase();

    if (classKey in data) data[classKey]++;
    if (archetypeKey in data) data[archetypeKey]++;
  }
}

function tradecraftsData(actor, data) {
  for (const [key, val] of Object.entries(actor.system.tradecrafts)) {
    data[key] = val.extra;
  }
  return data;
}