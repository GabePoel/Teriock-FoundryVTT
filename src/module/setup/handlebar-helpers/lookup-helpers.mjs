import { getImage } from "../../helpers/path.mjs";

export default function registerLookupHelpers() {
  Handlebars.registerHelper(
    "className",
    (arch, name) => TERIOCK.config.rank[arch].classes[name].name,
  );

  Handlebars.registerHelper(
    "classArchetype",
    (arch) => TERIOCK.config.rank[arch].name,
  );

  Handlebars.registerHelper(
    "executionTime",
    (maneuver, execTime) =>
      TERIOCK.config.ability.executionTime[maneuver]?.[execTime] ?? execTime,
  );

  Handlebars.registerHelper(
    "tradecraft",
    (field, name) => TERIOCK.config.tradecraft[field].tradecrafts[name].name,
  );

  Handlebars.registerHelper(
    "field",
    (field) => TERIOCK.config.tradecraft[field].name,
  );

  Handlebars.registerHelper(
    "equipmentMarker",
    (item) =>
      TERIOCK.config.equipment.powerLevel[item.system.powerLevel]?.color,
  );

  Handlebars.registerHelper("abilityMarker", (effect) => {
    const type = effect.system.form || effect.system.form;
    return TERIOCK.config.effect.form[type]?.color;
  });

  Handlebars.registerHelper("path", function (obj, ...pathSegments) {
    const segments = pathSegments.slice(0, -1);
    const fullPath = segments.join(".");
    return foundry.utils.getProperty(obj, fullPath);
  });

  Handlebars.registerHelper("getIconKey", (category, key) => {
    return getImage(category, key, getImage("effectTypes", "resistance"));
  });

  Handlebars.registerHelper("getImage", (category, key, fallback) =>
    getImage(category, key, fallback),
  );
}
