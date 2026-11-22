import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { objectMap } from "../../../utils/_module.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";
import { IdentifierSetField } from "../../fields/_module.mjs";
import { qualifierField, slugSetField } from "../../fields/tools/builders.mjs";

const { fields } = foundry.data;

/**
 * Model for which children something suppresses.
 */
export default class SuppressionModel extends BaseDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.Suppression"];

  /** @inheritDoc */
  static defineSchema() {
    const { attunement, class: rank, effect, equipment, kind } = TERIOCK.CONFIG;
    const kinds = { ...kind.default, ...effect.kind, ...rank.kind, ...equipment.kind, ...attunement.kind };
    return {
      effectTypes: slugSetField(TERIOCK.CONFIG.metaphysics.effectTypes),
      elements: slugSetField(TERIOCK.CONFIG.metaphysics.elements),
      families: slugSetField(TERIOCK.CONFIG.species.families),
      identifiers: new IdentifierSetField(),
      kinds: new fields.SetField(
        new fields.StringField({ choices: objectMap(kinds, k => k.label, { localize: true }) }),
      ),
      powerSources: slugSetField(TERIOCK.CONFIG.metaphysics.powerSources),
      qualifier: qualifierField(),
      traits: slugSetField(TERIOCK.CONFIG.species.traits),
      undeadLevels: new fields.SetField(
        new fields.NumberField({ choices: TERIOCK.CONFIG.species.undeadLevels, integer: true }),
      ),
    };
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "identifiers",
      "powerSources",
      "elements",
      "effectTypes",
      "traits",
      "families",
      "undeadLevels",
      "kinds",
      "qualifier",
    ];
  }

  /**
   * Whether this suppresses a child document.
   * @param {TeriockActiveEffect|TeriockItem} child
   * @returns {boolean}
   */
  suppresses(child) {
    const system = child.system;
    return this.identifiers.has(child.identifier)
      || ["effectTypes", "elements", "families", "powerSources", "traits"].some(k =>
        system[k] instanceof Set && !this[k].isDisjointFrom(system[k])
      )
      || this.kinds.has(system.kind)
      || this.undeadLevels.has(system.undeadLevel)
      || BaseRoll.qualify(this.qualifier, () => system.getLocalRollData());
  }
}
