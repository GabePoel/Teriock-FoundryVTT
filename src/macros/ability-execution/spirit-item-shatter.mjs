const hp = actor.system.hp.max + actor.system.hp.temp;
const equipment = scope.args[0];
if (equipment.name === "Spirit Item") await actor.takeKill(hp);
