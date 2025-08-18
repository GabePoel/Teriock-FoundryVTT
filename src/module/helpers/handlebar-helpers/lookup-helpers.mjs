export default function registerLookupHelpers() {
  Handlebars.registerHelper(
    "className",
    (arch, name) => CONFIG.TERIOCK.rankOptions[arch].classes[name].name,
  );

  Handlebars.registerHelper(
    "classArchetype",
    (arch) => CONFIG.TERIOCK.rankOptions[arch].name,
  );

  Handlebars.registerHelper(
    "executionTime",
    (maneuver, execTime) =>
      CONFIG.TERIOCK.abilityOptions.executionTime[maneuver]?.[execTime] ??
      execTime,
  );

  Handlebars.registerHelper(
    "tradecraft",
    (field, name) =>
      CONFIG.TERIOCK.tradecraftOptions[field].tradecrafts[name].name,
  );

  Handlebars.registerHelper(
    "field",
    (field) => CONFIG.TERIOCK.tradecraftOptions[field].name,
  );

  Handlebars.registerHelper(
    "equipmentMarker",
    (item) =>
      CONFIG.TERIOCK.equipmentOptions.powerLevel[item.system.powerLevel]?.color,
  );

  Handlebars.registerHelper("abilityMarker", (effect) => {
    const type = effect.system.form || effect.system.form;
    return CONFIG.TERIOCK.abilityOptions.form[type]?.color;
  });

  Handlebars.registerHelper("path", function (obj, ...pathSegments) {
    const segments = pathSegments.slice(0, -1);
    const fullPath = segments.join(".");
    return foundry.utils.getProperty(obj, fullPath);
  });
}
