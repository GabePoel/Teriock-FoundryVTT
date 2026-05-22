import { preLocalize } from "../../helpers/localization.mjs";
import { currencyConfig } from "./currency-config.mjs";

export const transformationConfig = {
  // no sort
  level: {
    minor: "TERIOCK.EFFECTS.TransformationLevel.minor",
    full: "TERIOCK.EFFECTS.TransformationLevel.full",
    greater: "TERIOCK.EFFECTS.TransformationLevel.greater",
  },
  override: {
    art: { initial: true, label: "TERIOCK.SCHEMA.Transformation.override.choices.art" },
    size: { initial: true, label: "TERIOCK.SCHEMA.Transformation.override.choices.size" },
  },
  reset: {
    gp: { initial: true, update: Object.fromEntries(Object.keys(currencyConfig).map(k => [`system.money.${k}`, 0])) },
    hp: { initial: true, update: { "system.hp.value": 99999999 } },
    lp: { initial: false, update: { "system.lp.value": 20 } },
    mp: { initial: false, update: { "system.mp.value": 99999999 } },
  },
  suppress: {
    attunement: { initial: false, path: "disabled" },
    body: { initial: true, path: "system.disabled" },
    consequence: { initial: false, path: "disabled" },
    equipment: { initial: true, path: "system.stashed" },
    fluency: { initial: true, path: "system.disabled" },
    mount: { initial: false, path: "system.disabled" },
    rank: { initial: true, path: "system.disabled" },
    resource: { initial: false, path: "system.disabled" },
    species: { initial: true, path: "system.disabled" },
  },
};

preLocalize("config.transformation.level");
preLocalize("config.transformation.override", { key: "label" });
