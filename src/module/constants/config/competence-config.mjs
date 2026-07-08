import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export default {
  levels: {
    0: {
      icon: icons.competence.none,
      identifier: "core:competency-bonus",
      label: "TERIOCK.SCHEMA.Competence.choices.0",
    },
    1: {
      icon: icons.competence.proficient,
      identifier: "core:proficiency-bonus",
      label: "TERIOCK.SCHEMA.Competence.choices.1",
    },
    2: {
      icon: icons.competence.fluent,
      identifier: "core:fluency-bonus",
      label: "TERIOCK.SCHEMA.Competence.choices.2",
    },
  },
};

preLocalize("config.competence.levels", { keys: ["label"], sort: false });
