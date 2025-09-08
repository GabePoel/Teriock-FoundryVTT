import { getIcon } from "../path.mjs";
import { toCamelCase } from "../string.mjs";

export default function registerLookupHelpers() {
  Handlebars.registerHelper(
    "className",
    (arch, name) => TERIOCK.options.rank[arch].classes[name].name,
  );

  Handlebars.registerHelper(
    "classArchetype",
    (arch) => TERIOCK.options.rank[arch].name,
  );

  Handlebars.registerHelper(
    "executionTime",
    (maneuver, execTime) =>
      TERIOCK.options.ability.executionTime[maneuver]?.[execTime] ??
      execTime,
  );

  Handlebars.registerHelper(
    "tradecraft",
    (field, name) =>
      TERIOCK.options.tradecraft[field].tradecrafts[name].name,
  );

  Handlebars.registerHelper(
    "field",
    (field) => TERIOCK.options.tradecraft[field].name,
  );

  Handlebars.registerHelper(
    "equipmentMarker",
    (item) =>
      TERIOCK.options.equipment.powerLevel[item.system.powerLevel]
        ?.color,
  );

  Handlebars.registerHelper("abilityMarker", (effect) => {
    const type = effect.system.form || effect.system.form;
    return TERIOCK.options.ability.form[type]?.color;
  });

  Handlebars.registerHelper("path", function (obj, ...pathSegments) {
    const segments = pathSegments.slice(0, -1);
    const fullPath = segments.join(".");
    return foundry.utils.getProperty(obj, fullPath);
  });

  Handlebars.registerHelper("getIconKey", (category, key) => {
    if (
      TERIOCK.index[toCamelCase(category)] &&
      TERIOCK.index[toCamelCase(category)][key]
    ) {
      return getIcon(
        category,
        TERIOCK.index[toCamelCase(category)][key],
      );
    } else {
      return getIcon("effect-types", "Resistance");
    }
  });
}
