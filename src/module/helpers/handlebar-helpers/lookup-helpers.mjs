import { tradecraftMessage } from "../html.mjs";

export default function registerLookupHelpers() {
  Handlebars.registerHelper(
    "className",
    (arch, name) => CONFIG.TERIOCK.options.rank[arch].classes[name].name,
  );

  Handlebars.registerHelper(
    "classArchetype",
    (arch) => CONFIG.TERIOCK.options.rank[arch].name,
  );

  Handlebars.registerHelper(
    "executionTime",
    (maneuver, execTime) =>
      CONFIG.TERIOCK.options.ability.executionTime[maneuver]?.[execTime] ??
      execTime,
  );

  Handlebars.registerHelper(
    "tradecraft",
    (field, name) =>
      CONFIG.TERIOCK.options.tradecraft[field].tradecrafts[name].name,
  );

  Handlebars.registerHelper(
    "field",
    (field) => CONFIG.TERIOCK.options.tradecraft[field].name,
  );

  Handlebars.registerHelper(
    "equipmentMarker",
    (item) =>
      CONFIG.TERIOCK.options.equipment.powerLevel[item.system.powerLevel]
        ?.color,
  );

  Handlebars.registerHelper("abilityMarker", (effect) => {
    const type = effect.system.form || effect.system.form;
    return CONFIG.TERIOCK.options.ability.form[type]?.color;
  });

  Handlebars.registerHelper("path", function (obj, ...pathSegments) {
    const segments = pathSegments.slice(0, -1);
    const fullPath = segments.join(".");
    return foundry.utils.getProperty(obj, fullPath);
  });

  Handlebars.registerHelper("tradecraftMessage", function (tradecraft) {
    return new Handlebars.SafeString(tradecraftMessage(tradecraft));
  });
}
