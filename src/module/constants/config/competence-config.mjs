import { makeIconClass } from "../../helpers/icon.mjs";
import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export default {
  levels: {
    0: {
      icon: icons.competence.none,
      identifier: "core:competency-bonus",
      label: "TERIOCK.SCHEMA.Competence.choices.0",
      simpleIconClass: makeIconClass(icons.ui.filled0, "light"),
    },
    1: {
      icon: icons.competence.proficient,
      identifier: "core:proficiency-bonus",
      label: "TERIOCK.SCHEMA.Competence.choices.1",
      simpleIconClass: makeIconClass(icons.ui.filled1, "light"),
    },
    2: {
      icon: icons.competence.fluent,
      identifier: "core:fluency-bonus",
      label: "TERIOCK.SCHEMA.Competence.choices.2",
      simpleIconClass: makeIconClass(icons.ui.filled2, "solid"),
    },
  },
};

preLocalizeConfig("config.competence.levels", { keys: ["label"], sort: false });
