import { makeIconClass } from "../../helpers/icon.mjs";
import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons } from "../display/_module.mjs";

export default {
  levels: {
    0: {
      icon: icons.manifest.competence.none,
      identifier: "core:competency-bonus",
      label: "TERIOCK.SCHEMA.Competence.choices.0",
      simpleIconClass: makeIconClass(icons.manifest.ui.filled0, "light"),
    },
    1: {
      icon: icons.manifest.competence.proficient,
      identifier: "core:proficiency-bonus",
      label: "TERIOCK.SCHEMA.Competence.choices.1",
      simpleIconClass: makeIconClass(icons.manifest.ui.filled1, "light"),
    },
    2: {
      icon: icons.manifest.competence.fluent,
      identifier: "core:fluency-bonus",
      label: "TERIOCK.SCHEMA.Competence.choices.2",
      simpleIconClass: makeIconClass(icons.manifest.ui.filled2, "solid"),
    },
  },
};

preLocalizeConfig("config.competence.levels", { keys: ["label"], sort: false });
