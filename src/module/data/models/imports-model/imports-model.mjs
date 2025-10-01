import { copyItem, copyRank } from "../../../helpers/fetch.mjs";
import { toCamelCase } from "../../../helpers/string.mjs";

const { fields } = foundry.data;
const { DataModel } = foundry.abstract;

export default class ImportsModel extends DataModel {
  static defineSchema() {
    return {
      ranks: new fields.SchemaField({
        archetypes: new fields.TypedObjectField(
          new fields.NumberField({
            initial: 0,
          }),
        ),
        classes: new fields.TypedObjectField(
          new fields.NumberField({
            initial: 0,
          }),
        ),
        general: new fields.NumberField({
          initial: 0,
        }),
        bodyParts: new fields.SetField(new fields.StringField()),
      }),
    };
  }

  /**
   * Imports that can be done without making any decisions.
   * @returns {Promise<void>}
   */
  async importDeterministic() {
    await this.importDeterministicBodyParts();
    await this.importDeterministicRanks();
  }

  /**
   * Imports the body parts.
   * @returns {Promise<void>}
   */
  async importDeterministicBodyParts() {
    const parent = /** @type {TeriockCommon} */ this.parent;
    /** @type {TeriockActor} */
    const actor = parent.actor;
    const existingBodyPartKeys = new Set(
      actor.bodyParts.map((b) => toCamelCase(b.name)),
    );
    const toImport = [];
    for (const key of this.bodyParts) {
      if (!existingBodyPartKeys.has(key)) {
        const name = TERIOCK.index.bodyParts[key];
        toImport.push((await copyItem(name, "bodyParts")).toObject());
      }
    }
    if (toImport.length > 0) {
      await actor.createEmbeddedDocuments("Item", toImport);
    }
  }

  /**
   * Import the ranks that can be done without making any decisions.
   * @returns {Promise<void>}
   */
  async importDeterministicRanks() {
    const parent = /** @type {TeriockCommon} */ this.parent;
    /** @type {TeriockActor} */
    const actor = parent.actor;
    for (const [classKey, classNumber] of Object.entries(this.ranks.classes)) {
      let number = 0;
      while (number < classNumber) {
        number++;
        const importNumber = number;
        const rank = await copyRank(classKey, importNumber);
        const matchedRanks = actor.ranks.filter(
          (r) =>
            r.system.classRank === importNumber &&
            r.system.className === classKey,
        );
        if (matchedRanks.length === 0) {
          if (importNumber >= 3) {
            const existingRanks = actor.ranks.filter(
              (r) => r.system.className === classKey,
            );
            const existingAbilities = [];
            existingRanks.forEach((r) => {
              existingAbilities.push(...r.abilities);
            });
            const existingAbilityNames = new Set(
              existingAbilities
                .filter((a) =>
                  ["combat", "support"].includes(
                    a.getFlag("teriock", "category"),
                  ),
                )
                .map((a) => a.name),
            );
            const combatAbilityNames = new Set(
              rank.abilities
                .filter((a) => a.getFlag("teriock", "category") === "combat")
                .map((a) => a.name)
                .filter((n) => !existingAbilityNames.has(n)),
            );
            const supportAbilityNames = new Set(
              rank.abilities
                .filter((a) => a.getFlag("teriock", "category") === "support")
                .map((a) => a.name)
                .filter((n) => !existingAbilityNames.has(n)),
            );
            const chosenAbilityNames = [];
            if (combatAbilityNames.size > 0) {
              chosenAbilityNames.push(Array.from(combatAbilityNames)[0]);
            }
            if (supportAbilityNames.size > 0) {
              chosenAbilityNames.push(Array.from(supportAbilityNames)[0]);
            }
            const out = await actor.createEmbeddedDocuments("Item", [rank]);
            const finalRank = out[0];
            if (finalRank) {
              const toDelete = finalRank.abilities
                .filter((a) => !a.sup)
                .filter((a) => !chosenAbilityNames.includes(a.name))
                .map((a) => a.id);
              await finalRank.deleteEmbeddedDocuments("ActiveEffect", toDelete);
            }
          } else {
            await actor.createEmbeddedDocuments("Item", [rank]);
          }
        }
      }
    }
  }
}
