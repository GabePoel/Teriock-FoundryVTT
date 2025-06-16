export async function _takeDamage(actor, amount) {
  const { hp } = actor.system;
  const temp = Math.max(0, hp.temp - amount);
  amount = Math.max(0, amount - hp.temp);
  const value = Math.max(hp.min, hp.value - amount);
  await actor.update({ 'system.hp.value': value, 'system.hp.temp': temp });
}

export async function _takeDrain(actor, amount) {
  const { mp } = actor.system;
  const temp = Math.max(0, mp.temp - amount);
  amount = Math.max(0, amount - mp.temp);
  const value = Math.max(mp.min, mp.value - amount);
  await actor.update({ 'system.mp.value': value, 'system.mp.temp': temp });
}

export async function _takeHeal(actor, amount) {
  const { hp } = actor.system;
  const value = Math.min(hp.max, hp.value + amount);
  await actor.update({ 'system.hp.value': value });
}

export async function _takeRevitalize(actor, amount) {
  const { mp } = actor.system;
  const value = Math.min(mp.max, mp.value + amount);
  await actor.update({ 'system.mp.value': value });
}

export async function _takeWither(actor, amount) {
  await actor.update({ 'system.wither.value': Math.min(Math.max(0, actor.system.wither.value + amount), 100) });
}