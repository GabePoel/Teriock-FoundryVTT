import TeriockEffect from "../../documents/effect.mjs";

export default async function generateEffect(ability, actor) {
  let changes = ability.system.applies.base.changes || [];
  let statuses = ability.system.applies.base.statuses || [];
  let description = ability.system.overview.base || '';
  if (ability.system.isProficient) {
    if (ability.system.applies.proficient.changes.length > 0) {
      changes = ability.system.applies.proficient.changes;
    }
    if (ability.system.applies.proficient.statuses.length > 0) {
      statuses = ability.system.applies.proficient.statuses;
    }
    description += ability.system.overview.proficient || '';
  }
  if (ability.system.isFluent) {
    if (ability.system.applies.fluent.changes.length > 0) {
      changes = ability.system.applies.fluent.changes;
    }
    if (ability.system.applies.fluent.statuses.length > 0) {
      statuses = ability.system.applies.fluent.statuses;
    }
    description += ability.system.overview.fluent || '';
  }
  const effect = {
    name: ability.name,
    type: 'effect',
    img: ability.img,
    changes: changes,
    statuses: statuses,
    description: description,
    system: {
      source: ability._id,
    },
  }
  const existingEffect = actor.effectTypes.effect.find(e => e.name === effect.name);
  if (existingEffect) {
    await existingEffect.delete();
  }
  return await TeriockEffect.create(effect, { parent: actor });
}