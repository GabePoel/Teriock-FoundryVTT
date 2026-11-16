import { preLocalizeObject } from "../../helpers/localization.mjs";

const usableContext = {
  c: "TERIOCK.ROLL_CONTEXT.Common.c",
  fluent: "TERIOCK.SCHEMA.Competence.choices.2",
  proficient: "TERIOCK.SCHEMA.Competence.choices.1",
};

export default usableContext;

preLocalizeObject("ROLL_CONTEXT.usable");
