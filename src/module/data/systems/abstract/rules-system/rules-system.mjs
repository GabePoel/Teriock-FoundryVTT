import { isKebabCase } from "../../../../helpers/string.mjs";
import BaseSystem from "../base-system.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Teriock.Models.RulesSystemInterface}
 */
export default class RulesSystem extends BaseSystem {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Rules",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      identifier: new fields.StringField({
        validate: (identifier) => isKebabCase(identifier),
        validationError: game.i18n.localize(
          "TERIOCK.SYSTEMS.Rules.FIELDS.identifier.validationError",
        ),
      }),
    });
  }
}
