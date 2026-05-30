import { preLocalize } from "../../helpers/localization.mjs";

export const competenceConfig = {
  levels: {
    0: { identifier: "core:competency-bonus", label: "TERIOCK.SCHEMA.Competence.choices.0" },
    1: { identifier: "core:proficiency-bonus", label: "TERIOCK.SCHEMA.Competence.choices.1" },
    2: { identifier: "core:fluency-bonus", label: "TERIOCK.SCHEMA.Competence.choices.2" },
  },
};

preLocalize("config.competence.levels", { keys: ["label"], sort: false });
