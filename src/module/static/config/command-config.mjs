import { validateIdentifier } from "../../data/fields/tools/validators.mjs";
import { preLocalizeObject } from "../../helpers/localization.mjs";
import {
  barClamp,
  findBestDocument,
  formatGp,
  getEnsureChildrenOperations,
  getEnsureNoChildrenOperations,
  getIcon,
  resolveDocuments,
} from "../../utils/_module.mjs";
import { icons } from "../display/_module.mjs";
import * as STATUSES from "../statuses.mjs";
import affinityConfig from "./affinity-config.mjs";
import attributeConfig from "./attribute-config.mjs";
import effectConfig from "./effect-config.mjs";
import hackConfig from "./hack-config.mjs";
import tradecraftConfig from "./tradecraft-config.mjs";

/**
 * @import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 */

/**
 * An update operation for an actor.
 * @param {TeriockActor} actor
 * @param {object} docData
 * @returns {DatabaseWriteOperation}
 */
function buildUpdateOperation(actor, docData) {
  return { action: "update", docData, uuid: actor.uuid };
}

/**
 * Operations that change a bar stat's value.
 * @param {TeriockActor} actor
 * @param {Teriock.Keys.Stat} stat
 * @param {number} amount
 * @returns {DatabaseWriteOperation[]}
 */
function buildBarOperations(actor, stat, amount) {
  return [buildUpdateOperation(actor, { [`system.${stat}.value`]: barClamp(actor.system[stat], amount ?? 0) })];
}

/**
 * Operations that harm a stat that can have a temporary and morganti value.
 *
 * Relevant wiki pages:
 * - [Morganti effects](https://wiki.teriock.com/index.php/Category:Morganti_effects)
 *
 * @param {TeriockActor} actor
 * @param {Teriock.Keys.DieStat} stat
 * @param {object} options
 * @param {number} [options.amount]
 * @param {boolean} [options.morganti]
 * @returns {DatabaseWriteOperation[]}
 */
function buildHarmOperations(actor, stat, { amount, morganti }) {
  amount = Math.max(0, amount ?? 0);
  const sp = actor.system[stat];
  const temp = Math.max(0, sp.temp - amount);
  amount = Math.max(0, amount - sp.temp);
  const docData = { [`system.${stat}.temp`]: temp, [`system.${stat}.value`]: barClamp(sp, -amount) };
  if (morganti) { docData[`system.${stat}.morganti`] = sp.morganti + amount; }
  return [buildUpdateOperation(actor, docData)];
}

/**
 * Operations that create and delete status effects. Statuses in both lists are kept.
 * @param {TeriockActor} actor
 * @param {object} options
 * @param {Teriock.Keys.Status[]} [options.create]
 * @param {Teriock.Keys.Status[]} [options.delete]
 * @param {boolean} [options.full] - Deleting also deletes consequences that provide the statuses.
 * @param {boolean} [options.overlay]
 * @returns {Promise<DatabaseWriteOperation[]>}
 */
async function buildStatusOperations(actor, { create = [], delete: del = [], full = false, overlay = false }) {
  const has = s => actor.effects.has(CONFIG.statusEffects[s]?._id);
  const deleting = new Set(del).difference(new Set(create));
  const toDelete = deleting.filter(has).map(s => CONFIG.statusEffects[s]._id);
  if (full) {
    for (const c of actor.previewedTags.applicable) {
      if (c.statuses.intersects(deleting)) { toDelete.add(c.id); }
    }
  }
  const toCreate = create.filter(s => CONFIG.statusEffects[s] && !has(s));
  const data = await Promise.all(toCreate.map(async s => {
    const effect = (await ActiveEffect.implementation.fromStatusEffect(s, { parent: actor })).toObject();
    if (overlay) { foundry.utils.setProperty(effect, "flags.core.overlay", true); }
    return effect;
  }));
  const operations = [];
  if (toDelete.size) { operations.push(actor.getDeleteChildDocumentsOperation("ActiveEffect", Array.from(toDelete))); }
  if (data.length) { operations.push(actor.getCreateChildDocumentsOperation("ActiveEffect", data, { keepId: true })); }
  return operations;
}

/**
 * Run some function for each actor.
 * @param {(actor: TeriockActor, options: object) => Promise<*>} fn
 * @returns {(actors: TeriockActor[], options: object) => Promise<void>}
 */
function each(fn) {
  return async (actors, options) => {
    await Promise.all(actors.map(a => fn(a, options)));
  };
}

/**
 * Select some of an actor's items and call a method on each.
 * @param {string} method
 * @param {(item: *) => boolean} filter
 * @param {string} title
 * @param {string[]} [types]
 * @returns {(actors: TeriockActor[], options: object) => Promise<void>}
 */
function select(method, filter, title, types = ["equipment"]) {
  return each(async actor => {
    const chosen = await teriock.applications.dialogs.DocumentSelector.selectMulti(
      types.flatMap(t => actor.previewedTypes[t]).filter(filter),
      {
        hint: _loc(`TERIOCK.COMMANDS.${method.capitalize()}.hint`),
        noDocumentsMessage: _loc("TERIOCK.DIALOGS.Common.ERRORS.noRelevantItems"),
        title: _loc(title),
      },
    );
    if (!chosen) { return; }
    await Promise.all(chosen.map(d => d.system[method]()));
  });
}

/**
 * Take a rest. The first actor sees the dialog and the others take the same rest.
 * @param {"LongRest"|"ShortRest"} name
 * @returns {(actors: TeriockActor[]) => Promise<false|void>}
 */
function rest(name) {
  return async ([first, ...others]) => {
    const Execution = teriock.executions.actor[`${name}Execution`];
    const execution = new Execution({}, { actor: first, source: first });
    if ((await execution.execute()) === false) { return false; }
    await Promise.all(
      others.map(a =>
        Execution.create({ ...execution.toObject(), useAbilities: false }, { actor: a, showDialog: false, source: a })
      ),
    );
  };
}

/** @satisfies {Record<string, Teriock.Config.CommandEntry>} */
const commandConfig = {
  damage: {
    aliases: ["dmg"],
    icon: icons.manifest.effect.damage,
    label: "TERIOCK.COMMANDS.Damage.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.Damage.deal",
      integer: true,
      min: 0,
      morganti: true,
      take: "TERIOCK.COMMANDS.Damage.take",
      tooltip: "TERIOCK.COMMANDS.Damage.tooltip",
    },
    reverse: "healing",
    slug: "damage",
    trigger: true,
    operations: (actor, options) => buildHarmOperations(actor, "hp", options),
  },
  drain: {
    aliases: ["drn"],
    icon: icons.manifest.effect.drain,
    label: "TERIOCK.COMMANDS.Drain.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.Drain.deal",
      integer: true,
      min: 0,
      morganti: true,
      take: "TERIOCK.COMMANDS.Drain.take",
      tooltip: "TERIOCK.COMMANDS.Drain.tooltip",
    },
    reverse: "revitalizing",
    slug: "drain",
    trigger: true,
    operations: (actor, options) => buildHarmOperations(actor, "mp", options),
  },
  wither: {
    icon: icons.manifest.effect.wither,
    label: "TERIOCK.COMMANDS.Wither.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.Wither.deal",
      integer: true,
      take: "TERIOCK.COMMANDS.Wither.take",
      tooltip: "TERIOCK.COMMANDS.Wither.tooltip",
    },
    slug: "wither",
    trigger: true,
    operations: (actor, { amount }) => buildBarOperations(actor, "lp", amount),
    reverse: (actor, { amount }) => buildBarOperations(actor, "lp", -amount),
  },

  healing: {
    icon: icons.manifest.effect.heal,
    label: "TERIOCK.COMMANDS.Healing.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.Healing.deal",
      integer: true,
      min: 0,
      take: "TERIOCK.COMMANDS.Healing.take",
      tooltip: "TERIOCK.COMMANDS.Healing.tooltip",
    },
    reverse: "damage",
    slug: "healing",
    trigger: true,
    operations: (actor, { amount }) => buildBarOperations(actor, "hp", Math.max(0, amount ?? 0)),
  },
  revitalizing: {
    icon: icons.manifest.effect.revitalize,
    label: "TERIOCK.COMMANDS.Revitalizing.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.Revitalizing.deal",
      integer: true,
      min: 0,
      take: "TERIOCK.COMMANDS.Revitalizing.take",
      tooltip: "TERIOCK.COMMANDS.Revitalizing.tooltip",
    },
    reverse: "drain",
    slug: "revitalizing",
    trigger: true,
    operations: (actor, { amount }) => buildBarOperations(actor, "mp", Math.max(0, amount ?? 0)),
  },

  gainTempHp: {
    aliases: ["gth"],
    icon: icons.manifest.command.tempHp,
    label: "TERIOCK.COMMANDS.GainTempHp.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.GainTempHp.deal",
      integer: true,
      take: "TERIOCK.COMMANDS.GainTempHp.take",
      tooltip: "TERIOCK.COMMANDS.GainTempHp.tooltip",
    },
    slug: "gain-temp-hp",
    trigger: true,
    operations: (
      actor,
      { amount = 0 },
    ) => [buildUpdateOperation(actor, { "system.hp.temp": Math.max(actor.system.hp.temp + amount, 0) })],
    reverse: (
      actor,
      { amount = 0 },
    ) => [buildUpdateOperation(actor, { "system.hp.temp": Math.max(actor.system.hp.temp - amount, 0) })],
  },
  gainTempMp: {
    aliases: ["gtm"],
    icon: icons.manifest.command.tempMp,
    label: "TERIOCK.COMMANDS.GainTempMp.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.GainTempMp.deal",
      integer: true,
      take: "TERIOCK.COMMANDS.GainTempMp.take",
      tooltip: "TERIOCK.COMMANDS.GainTempMp.tooltip",
    },
    slug: "gain-temp-mp",
    trigger: true,
    operations: (
      actor,
      { amount = 0 },
    ) => [buildUpdateOperation(actor, { "system.mp.temp": Math.max(actor.system.mp.temp + amount, 0) })],
    reverse: (
      actor,
      { amount = 0 },
    ) => [buildUpdateOperation(actor, { "system.mp.temp": Math.max(actor.system.mp.temp - amount, 0) })],
  },
  setTempHp: {
    aliases: ["sth"],
    icon: icons.manifest.command.tempHp,
    label: "TERIOCK.COMMANDS.SetTempHp.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.SetTempHp.deal",
      integer: true,
      min: 0,
      take: "TERIOCK.COMMANDS.SetTempHp.take",
      tooltip: "TERIOCK.COMMANDS.SetTempHp.tooltip",
    },
    slug: "set-temp-hp",
    trigger: true,
    operations: (actor, { amount }) => [buildUpdateOperation(actor, { "system.hp.temp": amount })],
    reverse: actor => [buildUpdateOperation(actor, { "system.hp.temp": 0 })],
  },
  setTempMp: {
    aliases: ["stm"],
    icon: icons.manifest.command.tempMp,
    label: "TERIOCK.COMMANDS.SetTempMp.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.SetTempMp.deal",
      integer: true,
      min: 0,
      take: "TERIOCK.COMMANDS.SetTempMp.take",
      tooltip: "TERIOCK.COMMANDS.SetTempMp.tooltip",
    },
    slug: "set-temp-mp",
    trigger: true,
    operations: (actor, { amount }) => [buildUpdateOperation(actor, { "system.mp.temp": amount })],
    reverse: actor => [buildUpdateOperation(actor, { "system.mp.temp": 0 })],
  },

  hide: {
    icon: icons.manifest.ui.hide,
    label: "TERIOCK.COMMANDS.Hide.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.Hide.deal",
      integer: true,
      nullable: true,
      take: "TERIOCK.COMMANDS.Hide.take",
      tooltip: "TERIOCK.COMMANDS.Hide.tooltip",
    },
    slug: "hide",
    trigger: true,
    operations: (actor, { amount }) => [buildUpdateOperation(actor, { "system.detection.hiding": amount })],
    reverse: actor => [buildUpdateOperation(actor, { "system.detection.hiding": null })],
  },
  perceive: {
    icon: icons.manifest.ui.show,
    label: "TERIOCK.COMMANDS.Perceive.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.Perceive.deal",
      integer: true,
      nullable: true,
      take: "TERIOCK.COMMANDS.Perceive.take",
      tooltip: "TERIOCK.COMMANDS.Perceive.tooltip",
    },
    slug: "perceive",
    trigger: true,
    operations: (actor, { amount }) => [buildUpdateOperation(actor, { "system.detection.perceiving": amount })],
    reverse: actor => [buildUpdateOperation(actor, { "system.detection.perceiving": null })],
  },

  earn: {
    icon: icons.manifest.stat.gp,
    label: "TERIOCK.COMMANDS.Earn.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.Earn.deal",
      options: ["currencies", "debt", "equipmentTypes", "mode"],
      take: "TERIOCK.COMMANDS.Earn.take",
      tooltip: ({ amount }) => _loc("TERIOCK.COMMANDS.Earn.tooltip", { amount: formatGp(amount) }),
    },
    reverse: "pay",
    slug: "earn",
    trigger: true,
    operations: (
      actor,
      { amount = 0, currencies, debt, equipmentTypes, mode },
    ) => [
      buildUpdateOperation(
        actor,
        actor.system.getMoneyExchangeUpdate(-amount, { currencies, debt, equipmentTypes, mode }),
      ),
    ],
  },
  kill: {
    icon: icons.manifest.effect.kill,
    label: "TERIOCK.COMMANDS.Kill.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.Kill.deal",
      integer: true,
      take: "TERIOCK.COMMANDS.Kill.take",
      tooltip: "TERIOCK.COMMANDS.Kill.tooltip",
    },
    slug: "kill",
    trigger: true,
    operations: async (actor, { amount }) =>
      actor.system.hp.value <= amount ? buildStatusOperations(actor, { create: ["dead"], overlay: true }) : [],
    reverse: actor => buildStatusOperations(actor, { delete: ["dead"] }),
  },
  pay: {
    icon: icons.manifest.stat.gp,
    label: "TERIOCK.COMMANDS.Pay.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.Pay.deal",
      options: ["currencies", "debt", "equipmentTypes", "mode"],
      take: "TERIOCK.COMMANDS.Pay.take",
      tooltip: ({ amount }) => _loc("TERIOCK.COMMANDS.Pay.tooltip", { amount: formatGp(amount) }),
    },
    reverse: "earn",
    slug: "pay",
    trigger: true,
    operations: (
      actor,
      { amount = 0, currencies, debt, equipmentTypes, mode },
    ) => [
      buildUpdateOperation(
        actor,
        actor.system.getMoneyExchangeUpdate(amount, { currencies, debt, equipmentTypes, mode }),
      ),
    ],
  },
  sleep: {
    icon: icons.manifest.effect.sleep,
    label: "TERIOCK.COMMANDS.Sleep.label",
    numeric: {
      deal: "TERIOCK.COMMANDS.Sleep.deal",
      integer: true,
      take: "TERIOCK.COMMANDS.Sleep.take",
      tooltip: "TERIOCK.COMMANDS.Sleep.tooltip",
    },
    slug: "sleep",
    trigger: true,
    operations: async (actor, { amount }) =>
      actor.system.hp.value <= amount ? buildStatusOperations(actor, { create: ["asleep"], overlay: true }) : [],
    reverse: actor => buildStatusOperations(actor, { delete: ["asleep"] }),
  },

  apply: {
    args: ["status"],
    icon: icons.manifest.ui.apply,
    reverse: "remove",
    slug: "apply",
    label: options => options?.status
      ? _loc("TERIOCK.COMMANDS.Status.applyNamed", { name: CONFIG.statusEffects[options.status]?.name })
      : _loc("TERIOCK.COMMANDS.Status.applyUnnamed"),
    operations: (actor, { status }) => {
      if (!status) { return []; }
      return validateIdentifier(status, { strict: true })
        ? getEnsureChildrenOperations(actor, [status])
        : buildStatusOperations(actor, { create: [status] });
    },
  },
  attack: {
    execute: each((a, { armamentId, ...o }) => a.system.rollAttack({ ...o, armament: a.items.get(armamentId) })),
    icon: icons.manifest.interaction.attack,
    label: "TERIOCK.COMMANDS.Attack.label",
    reverse: "attack",
    shared: true,
    slug: "attack",
  },
  attune: {
    common: true,
    execute: select("attune", d => !d.system.isAttuned, "TERIOCK.SYSTEMS.Attunable.MENU.attune", [
      "equipment",
      "mount",
    ]),
    icon: icons.manifest.attunable.attune,
    label: "TERIOCK.SYSTEMS.Attunable.MENU.attune",
    reverse: "deattune",
    slug: "attune",
  },
  awaken: {
    common: true,
    icon: icons.manifest.effect.awaken,
    label: "TERIOCK.EFFECTS.Common.awaken",
    slug: "awaken",
    trigger: true,
    operations: async actor => {
      if (!actor.statuses.has("unconscious") || actor.statuses.has("dead")) { return []; }
      const operations = await buildStatusOperations(actor, { delete: ["asleep", "unconscious"] });
      if (actor.system.hp.value <= 0) { operations.push(buildUpdateOperation(actor, { "system.hp.value": 1 })); }
      return operations;
    },
  },
  bag: {
    common: true,
    execute: each(async a => {
      await teriock.executions.actor.DeathBagExecution.create({}, { source: a });
    }),
    icon: icons.manifest.execution.deathBag,
    label: "TERIOCK.EFFECTS.Common.bag",
    slug: "bag",
  },
  cover: {
    args: ["amount"],
    icon: icons.manifest.cover.full,
    label: "TERIOCK.COMMANDS.Cover.label",
    reverse: "uncover",
    slug: "cover",
    operations: (actor, { amount = 1 }) => {
      const level = Math.min(3, actor.system.cover + amount);
      return buildStatusOperations(actor, { create: [effectConfig.cover[level - 1]], delete: effectConfig.cover });
    },
  },
  dampen: {
    common: true,
    execute: select("dampen", e => !e.system.dampened, "TERIOCK.SYSTEMS.Equipment.MENU.dampen"),
    icon: icons.manifest.equipment.dampen,
    label: "TERIOCK.SYSTEMS.Equipment.MENU.dampen",
    reverse: "undampen",
    slug: "dampen",
  },
  dawn: { icon: icons.manifest.time.dawn, label: "TERIOCK.TRIGGERS.Time.choices.dawn", slug: "dawn", trigger: true },
  deattune: {
    common: true,
    execute: select("deattune", d => d.system.isAttuned, "TERIOCK.SYSTEMS.Attunable.MENU.deattune", [
      "equipment",
      "mount",
    ]),
    icon: icons.manifest.attunable.deattune,
    label: "TERIOCK.SYSTEMS.Attunable.MENU.deattune",
    reverse: "attune",
    slug: "deattune",
  },
  destroy: {
    common: true,
    execute: select("destroy", e => !e.system.destroyed, "TERIOCK.SYSTEMS.Equipment.MENU.destroy"),
    icon: icons.manifest.break.destroy,
    label: "TERIOCK.SYSTEMS.Equipment.MENU.destroy",
    reverse: "reforge",
    slug: "destroy",
  },
  dusk: { icon: icons.manifest.time.dusk, label: "TERIOCK.TRIGGERS.Time.choices.dusk", slug: "dusk", trigger: true },
  elderSorcery: {
    aliases: ["es"],
    common: true,
    execute: each(async a => {
      await teriock.executions.actor.ElderSorceryExecution.create({}, { actor: a, source: a });
    }),
    icon: icons.manifest.execution.elderSorcery,
    label: "TERIOCK.EFFECTS.Common.elderSorcery",
    slug: "elder-sorcery",
  },
  fall: {
    args: ["distance"],
    common: true,
    icon: icons.manifest.execution.fall,
    label: "TERIOCK.EFFECTS.Common.fall",
    noActor: true,
    slug: "fall",
    execute: (actors, { distance, water }) =>
      teriock.executions.activity.FallExecution.create({ distance, water }, { actor: actors[0] ?? null }),
  },
  feat: {
    args: ["attribute"],
    execute: each(async (a, o) => {
      await a.system.attributes[o.attribute ?? "mov"].use({ ...o });
    }),
    reverse: "feat",
    shared: true,
    slug: "feat",
    icon: options => attributeConfig[options?.attribute]?.icon || "star",
    label: options => attributeConfig[options?.attribute]?.abbreviation
      ? _loc("TERIOCK.ROLLS.Feat.name", { value: attributeConfig[options?.attribute]?.abbreviation })
      : _loc("TERIOCK.ROLLS.Feat.label"),
  },
  glue: {
    common: true,
    execute: select("glue", e => !e.system.glued, "TERIOCK.SYSTEMS.Equipment.MENU.glue"),
    icon: icons.manifest.equipment.glue,
    label: "TERIOCK.SYSTEMS.Equipment.MENU.glue",
    reverse: "unglue",
    slug: "glue",
  },
  hack: {
    args: ["part", "amount"],
    reverse: "unhack",
    slug: "hack",
    trigger: true,
    icon: options => hackConfig[options?.part || "arm"].icon,
    label: options => hackConfig[options?.part || "arm"].label,
    operations: (actor, { amount = 1, part }) => {
      const config = hackConfig[part];
      if (!config) { return []; }
      const { min, value } = actor.system.hacks[part];
      const level = Math.min(value + amount, config.max);
      return buildStatusOperations(actor, {
        create: level > min ? [config.statuses[level - 1]] : [],
        delete: config.statuses,
      });
    },
  },
  heal: {
    execute: each((a, o) => teriock.applications.dialogs.HealManager.create(a, o)),
    icon: icons.manifest.effect.heal,
    label: "TERIOCK.EFFECTS.Common.heal",
    slug: "heal",
    trigger: true,
  },
  help: {
    icon: icons.manifest.ui.info,
    label: "TERIOCK.COMMANDS.Help.name",
    noActor: true,
    reverse: "help",
    slug: "help",
    execute: async () => {
      /** @type {Partial<Teriock.Config.CommandEntry>[]} */
      const entries = [...Object.values(commandConfig), { aliases: ["r"], args: ["formula"], slug: "roll" }];
      let code = `<h6>${_loc("TERIOCK.COMMANDS.Help.name")}</h6><p>${_loc("TERIOCK.COMMANDS.Help.format")}</p>`;
      for (const entry of entries.sort((a, b) => a.slug.localeCompare(b.slug))) {
        const args = entry.numeric ? ["formula"] : entry.args;
        const aliases = (entry.aliases ?? []).filter(a => a !== entry.slug);
        code += `<p>[[code /${entry.slug}`;
        if (args?.length) { code += ` [${args.join(", ")}]`; }
        code += "]]";
        if (aliases.length) { code += ` (${aliases.map(a => `[[code /${a}]]`).join(", ")})`; }
        code += "</p>";
      }
      const chatData = { content: code };
      ChatMessage.implementation.applyMode(chatData, "self");
      await ChatMessage.implementation.create(chatData);
    },
  },
  identify: {
    common: true,
    execute: select("identify", e => !e.system.identification.identified, "TERIOCK.SYSTEMS.Equipment.MENU.identify"),
    icon: icons.manifest.equipment.identify,
    label: "TERIOCK.SYSTEMS.Equipment.MENU.identify",
    slug: "identify",
  },
  longRest: {
    aliases: ["lr"],
    common: true,
    execute: rest("LongRest"),
    icon: icons.manifest.execution.longRest,
    label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.label",
    slug: "long-rest",
  },
  readMagic: {
    common: true,
    execute: select("readMagic", e => !e.system.identification.read, "TERIOCK.SYSTEMS.Equipment.MENU.readMagic"),
    icon: icons.manifest.equipment.readMagic,
    label: "TERIOCK.SYSTEMS.Equipment.MENU.readMagic",
    slug: "read-magic",
  },
  reforge: {
    common: true,
    execute: select("reforge", e => e.system.destroyed, "TERIOCK.SYSTEMS.Equipment.MENU.reforge"),
    icon: icons.manifest.break.reforge,
    label: "TERIOCK.SYSTEMS.Equipment.MENU.reforge",
    reverse: "destroy",
    slug: "reforge",
  },
  remove: {
    args: ["status"],
    icon: icons.manifest.ui.undo,
    reverse: "apply",
    slug: "remove",
    label: options => options?.status
      ? _loc("TERIOCK.COMMANDS.Status.removeNamed", { name: CONFIG.statusEffects[options.status]?.name })
      : _loc("TERIOCK.COMMANDS.Status.removeUnnamed"),
    operations: (actor, { status }) => {
      if (!status) { return []; }
      return validateIdentifier(status, { strict: true })
        ? getEnsureNoChildrenOperations(actor, [status])
        : buildStatusOperations(actor, { delete: [status], full: true });
    },
  },
  repair: {
    common: true,
    execute: select("repair", e => e.system.shattered, "TERIOCK.SYSTEMS.Equipment.MENU.repair"),
    icon: icons.manifest.break.repair,
    label: "TERIOCK.SYSTEMS.Equipment.MENU.repair",
    reverse: "shatter",
    slug: "repair",
  },
  reset: {
    icon: icons.manifest.ui.reset,
    label: "TERIOCK.COMMANDS.Reset.label",
    slug: "reset",
    operations: async (actor, options) => {
      const docData = {};
      if (options.hp) { docData["system.hp.value"] = actor.system.hp.max; }
      if (options.mp) { docData["system.mp.value"] = actor.system.mp.max; }
      const operations = foundry.utils.isEmpty(docData) ? [] : [buildUpdateOperation(actor, docData)];
      if (options.hpDice || options.mpDice) {
        const updates = actor.items.filter(i => i.metadata.tags.statted).map(i => {
          const itemUpdate = { _id: i.id };
          if (options.hpDice) { itemUpdate["system.statDice.hp.spent"] = []; }
          if (options.mpDice) { itemUpdate["system.statDice.mp.spent"] = []; }
          return itemUpdate;
        });
        if (updates.length) { operations.push(actor.getUpdateChildDocumentsOperation("Item", updates)); }
      }
      const statuses = ["conditions", "hacks", "cover"].filter(k => options[k]).flatMap(k =>
        Object.values(STATUSES[k]).map(s => s.id)
      );
      operations.push(...(await buildStatusOperations(actor, { delete: statuses })));
      return operations;
    },
  },
  resist: {
    args: ["type"],
    execute: each(async (a, o) => {
      const type = o.type ?? "resistance";
      const config = affinityConfig.types[type];
      if (!config) { return; }
      const options = { ...o, actor: a, type };
      const data = { circumstance: o.circumstance, edge: o.edge };
      if (o.event) {
        const parsed = teriock.dice.rolls.ThresholdRoll.parseEvent(o.event);
        Object.assign(data, parsed.data);
        Object.assign(options, parsed.options);
      }
      if (config.hook) { await a.fireTrigger(config.hook); }
      const { AffinityExecution, ResistanceExecution } = teriock.executions.activity;
      await (config.threshold ? ResistanceExecution : AffinityExecution).create(data, options);
    }),
    icon: icons.manifest.effect.resist,
    reverse: "resist",
    shared: true,
    slug: "resist",
    label: options => _loc(affinityConfig.types[options?.type ?? "resistance"].button),
  },
  revitalize: {
    execute: each((a, o) => teriock.applications.dialogs.RevitalizeManager.create(a, o)),
    icon: icons.manifest.effect.revitalize,
    label: "TERIOCK.EFFECTS.Common.revitalize",
    slug: "revitalize",
    trigger: true,
  },
  revive: {
    common: true,
    icon: icons.manifest.effect.revive,
    label: "TERIOCK.EFFECTS.Common.revive",
    slug: "revive",
    trigger: true,
    operations: async actor => {
      if (!actor.statuses.has("dead")) { return []; }
      const { hp, mp } = actor.system;
      return [
        ...(hp.value <= 0 ? buildBarOperations(actor, "hp", 1 - hp.value) : []),
        ...(mp.value <= 0 ? buildBarOperations(actor, "mp", 1 - mp.value) : []),
        ...(await buildStatusOperations(actor, { delete: ["dead"], full: true })),
      ];
    },
  },
  sessionEnd: {
    icon: icons.manifest.time.sessionEnd,
    label: "TERIOCK.TRIGGERS.Time.choices.sessionEnd",
    slug: "session-end",
    trigger: true,
  },
  sessionStart: {
    icon: icons.manifest.time.sessionStart,
    label: "TERIOCK.TRIGGERS.Time.choices.sessionStart",
    slug: "session-start",
    trigger: true,
  },
  shatter: {
    common: true,
    execute: select("shatter", e => !e.system.shattered, "TERIOCK.SYSTEMS.Equipment.MENU.shatter"),
    icon: icons.manifest.break.shatter,
    label: "TERIOCK.SYSTEMS.Equipment.MENU.shatter",
    reverse: "repair",
    slug: "shatter",
  },
  shortRest: {
    aliases: ["sr"],
    common: true,
    execute: rest("ShortRest"),
    icon: icons.manifest.execution.shortRest,
    label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeShortRest.label",
    slug: "short-rest",
  },
  standardDamage: {
    aliases: ["sd", "standard"],
    common: true,
    execute: each(async (actor, o) => {
      const options = { ...o };
      if (options.event?.shiftKey) { options.select = true; }
      let attacker = actor.system.wielding.attacker;
      if (options.armament) {
        const newAttacker = await foundry.utils.fromUuid(options.armament, { relative: actor });
        if (newAttacker) { attacker = newAttacker; }
      }
      if (typeof options.ammunition === "string") {
        options.ammunition = await foundry.utils.fromUuid(options.ammunition, { relative: actor });
      }
      if (options.select) {
        const selOpts = { noDocumentsMessage: _loc("TERIOCK.DIALOGS.Common.ERRORS.noRelevantItems") };
        if (attacker?.uuid) { selOpts.checked = attacker.uuid; }
        attacker = await teriock.applications.dialogs.DocumentSelector.selectSingle(
          actor.previewedTags.armament.filter(a => a.active),
          selOpts,
        );
        if (attacker === false) { return; }
      }
      if (!attacker) {
        ui.notifications.error("TERIOCK.COMMANDS.StandardDamage.noDefaultWeapon", {
          format: { name: actor.name },
          localize: true,
        });
        return;
      }
      await attacker.use(options);
    }),
    icon: icons.manifest.effect.dealDamage,
    label: "TERIOCK.EFFECTS.Common.standardDamage",
    reverse: "standardDamage",
    slug: "standard-damage",
  },
  toggle: {
    args: ["status"],
    icon: icons.manifest.ui.toggle,
    slug: "toggle",
    label: options => options?.status
      ? _loc("TERIOCK.COMMANDS.Status.toggleNamed", { name: CONFIG.statusEffects[options.status]?.name })
      : _loc("TERIOCK.COMMANDS.Status.toggleUnnamed"),
    operations: (actor, { status }) => {
      if (!status) { return []; }
      if (!validateIdentifier(status, { strict: true })) {
        const key = actor.effects.has(CONFIG.statusEffects[status]?._id) ? "delete" : "create";
        return buildStatusOperations(actor, { [key]: [status] });
      }
      return actor.children.identifiers.has(status)
        ? getEnsureNoChildrenOperations(actor, [status])
        : getEnsureChildrenOperations(actor, [status]);
    },
  },
  tradecraft: {
    aliases: ["tc"],
    args: ["tradecraft"],
    execute: each(async (a, o) => {
      await a.system.tradecrafts[o.tradecraft ?? "artist"].use({ ...o });
    }),
    reverse: "tradecraft",
    shared: true,
    slug: "tradecraft",
    icon: options => tradecraftConfig.tradecrafts[options?.tradecraft || "artist"].icon,
    label: options => tradecraftConfig.tradecrafts[options?.tradecraft]?.label
      ? _loc("TERIOCK.ROLLS.Tradecraft.name", { value: tradecraftConfig.tradecrafts[options?.tradecraft].label })
      : _loc("TERIOCK.ROLLS.Tradecraft.label"),
  },
  uncover: {
    args: ["amount"],
    icon: icons.manifest.cover.half,
    label: "TERIOCK.COMMANDS.Uncover.label",
    reverse: "cover",
    slug: "uncover",
    operations: (actor, { amount = 1 }) => {
      const level = Math.max(0, actor.system.cover - amount);
      return buildStatusOperations(actor, { create: [effectConfig.cover[level - 1]], delete: effectConfig.cover });
    },
  },
  undampen: {
    common: true,
    execute: select("undampen", e => e.system.dampened, "TERIOCK.SYSTEMS.Equipment.MENU.undampen"),
    icon: icons.manifest.equipment.undampen,
    label: "TERIOCK.SYSTEMS.Equipment.MENU.undampen",
    reverse: "dampen",
    slug: "undampen",
  },
  unglue: {
    common: true,
    execute: select("unglue", e => e.system.glued, "TERIOCK.SYSTEMS.Equipment.MENU.unglue"),
    icon: icons.manifest.equipment.unglue,
    label: "TERIOCK.SYSTEMS.Equipment.MENU.unglue",
    reverse: "glue",
    slug: "unglue",
  },
  unhack: {
    args: ["part", "amount"],
    reverse: "hack",
    slug: "unhack",
    trigger: true,
    icon: options => hackConfig[options?.part || "arm"].icon,
    label: options => hackConfig[options?.part || "arm"].remove,
    operations: (actor, { amount = 1, part }) => {
      const config = hackConfig[part];
      if (!config) { return []; }
      const { min, value } = actor.system.hacks[part];
      const level = Math.max(0, value - amount);
      return buildStatusOperations(actor, {
        create: level > min ? [config.statuses[level - 1]] : [],
        delete: config.statuses,
      });
    },
  },
  use: {
    args: ["key"],
    reverse: "use",
    shared: true,
    slug: "use",
    execute: async (actors, options) => {
      if (!options.key) {
        ui.notifications.error("TERIOCK.COMMANDS.Use.noKey", { localize: true });
        return;
      }
      if (["number", "string"].includes(typeof options.competence)) {
        options.proficient = Number(options.competence) >= 1;
        options.fluent = Number(options.competence) >= 2;
      }
      await Promise.all(actors.map(async actor => {
        const local = await findBestDocument(options.key, actor);
        const documents = local ? [local] : await resolveDocuments([options.key], { ...options, expandFolders: true });
        if (!documents.length) {
          ui.notifications.warn("TERIOCK.SYSTEMS.Macro.EXECUTION.noDocument", {
            format: { actor: actor.name, lookup: options.key },
            localize: true,
          });
          return;
        }
        const chosen = documents.length > 1
          ? await teriock.applications.dialogs.DocumentSelector.selectMulti(documents)
          : documents;
        if (!chosen) { return; }
        await Promise.all(chosen.map(d => d.use({ ...options, actor })));
      }));
    },
    icon: options => options?.icon || getIcon(options?.key),
    label: options => {
      if (options?.label) { return options.label; }
      const name = options?.key && !options.key.includes(".")
        ? game.teriock.identifiers.getName(options.key, { forced: true })
        : "";
      return name
        ? _loc("TERIOCK.COMMANDS.UseDocument.useNamed", { name })
        : _loc("TERIOCK.COMMANDS.UseDocument.useUnnamed");
    },
  },
};

// Multi-word commands can also be typed as slugs.
for (const [key, entry] of Object.entries(commandConfig)) {
  if (entry.slug !== key) { entry.aliases = [entry.slug, ...(entry.aliases ?? [])]; }
}

preLocalizeObject("CONFIG.command", { keys: ["label", "numeric.deal", "numeric.take"] });

export default commandConfig;
