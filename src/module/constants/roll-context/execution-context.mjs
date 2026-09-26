import { preLocalizeConfig } from "../../helpers/localization.mjs";

/** Filled in with actor data and execution namespaces once identifiers are initialized. */
const executionContext = {
  "angle.dragon": "TERIOCK.ROLL_CONTEXT.Execution.angleDragon",
  "angle.normal": "TERIOCK.ROLL_CONTEXT.Execution.angleNormal",
  c: "TERIOCK.ROLL_CONTEXT.Common.c",
  h: "TERIOCK.ROLL_CONTEXT.Execution.h",
};

export default executionContext;

preLocalizeConfig("rollContext.execution");
