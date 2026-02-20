import { transformationField } from "../../fields/helpers/builders.mjs";
import CritAutomation from "./crit-automation.mjs";

/**
 * @property {TransformationConfigurationField} transformation
 */
export default class TransformationAutomation extends CritAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.TransformationAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "transformation";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      transformation: transformationField({
        alwaysEnabled: true,
        configuration: true,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["transformation.level", "transformation.useFolder"];
    if (this.transformation.useFolder) paths.push("transformation.uuid");
    else paths.push("transformation.uuids");
    paths.push("transformation.select");
    if (this.transformation.select) paths.push("transformation.multiple");
    paths.push(
      ...[
        "transformation.image",
        "transformation.resetHp",
        "transformation.resetMp",
        "transformation.suppression.bodyParts",
        "transformation.suppression.equipment",
        "transformation.suppression.fluencies",
        "transformation.suppression.ranks",
      ],
    );
    return paths;
  }
}
