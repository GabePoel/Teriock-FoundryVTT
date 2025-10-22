import { getRank } from "../../../helpers/fetch.mjs";
import { makeIcon } from "../../../helpers/utils.mjs";
import { RecordField } from "../../shared/fields/_module.mjs";
import {
  arrayTypeValidator,
  typeValidator,
} from "../../shared/fields/helpers/field-validators.mjs";

const { fields } = foundry.data;

export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {ImporterDataMixinInterface}
     * @extends {ChildTypeModel}
     */
    class ImporterDataMixin extends Base {
      static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
          imports: new fields.SchemaField({
            items: new fields.SetField(
              new fields.DocumentUUIDField({
                type: "Item",
                validate: (uuid) =>
                  typeValidator(uuid, this.metadata.childItemTypes),
              }),
              {
                label: "Items to Import",
                hint:
                  "These items will be imported automatically when this is added to an actor. They can be" +
                  " reimported as well. Once imported, these items will appear as though they are embedded documents.",
                validate: (uuids) =>
                  arrayTypeValidator(uuids, this.metadata.childItemTypes),
              },
            ),
            ranks: new fields.SchemaField({
              archetypes: new RecordField(
                new fields.NumberField({
                  initial: 0,
                }),
                {
                  label: "Ranks by Archetype",
                  hint: "Ranks of a specific archetype to import.",
                },
              ),
              classes: new RecordField(
                new fields.NumberField({
                  initial: 0,
                }),
                {
                  label: "Ranks by Class",
                  hint: "Ranks of a specific class to import.",
                },
              ),
              general: new fields.NumberField({
                initial: 0,
                label: "Arbitrary Ranks",
                hint: "Additional ranks of any class.",
              }),
            }),
          }),
        });
      }

      /** @inheritDoc */
      get cardContextMenuEntries() {
        return [
          ...super.cardContextMenuEntries,
          {
            name: "Import Related Items",
            icon: makeIcon("down-to-line", "contextMenu"),
            callback: this.importDeterministic.bind(this),
            group: "control",
          },
          {
            name: "Delete Imported Items",
            icon: makeIcon("trash-list", "contextMenu"),
            callback: this.deleteImported.bind(this),
            group: "control",
          },
        ];
      }

      /**
       * @returns {Promise<TeriockRank[]>}
       * @private
       */
      async _fetchDeterministicRankData() {
        const ranksToCreate = [];
        for (const [classKey, classNumber] of Object.entries(
          this.imports.ranks.classes,
        )) {
          let number = 0;
          while (number < classNumber) {
            number++;
            const importNumber = number;
            const rank = await getRank(classKey, importNumber);
            const matchedRanks = this.actor.ranks.filter(
              (r) =>
                r.system.classRank === importNumber &&
                r.system.className === classKey &&
                r.getFlag("teriock", "importedBy") === this.parent.id,
            );
            if (matchedRanks.length === 0) {
              if (importNumber >= 3) {
                const existingAbilities = [];
                ranksToCreate.forEach((r) => {
                  existingAbilities.push(
                    ...r.effects.filter((e) => e.type === "ability"),
                  );
                });
                const existingAbilityNames = new Set(
                  existingAbilities
                    .filter((a) =>
                      ["combat", "support"].includes(
                        a.flags?.teriock?.category,
                      ),
                    )
                    .map((a) => a.name),
                );
                const combatAbilityNames = new Set(
                  rank.abilities
                    .filter(
                      (a) => a.getFlag("teriock", "category") === "combat",
                    )
                    .map((a) => a.name)
                    .filter((n) => !existingAbilityNames.has(n)),
                );
                const supportAbilityNames = new Set(
                  rank.abilities
                    .filter(
                      (a) => a.getFlag("teriock", "category") === "support",
                    )
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
                const out = rank.toObject();
                const abilitiesToDelete = rank.abilities
                  .filter((a) => !a.sup)
                  .filter((a) => !chosenAbilityNames.includes(a.name));
                let abilityIdsToDelete = abilitiesToDelete.map((a) => a.id);
                for (const a of abilitiesToDelete) {
                  abilityIdsToDelete.push(...a.allSubs.map((s) => s.id));
                }
                abilityIdsToDelete = Array.from(new Set(abilityIdsToDelete));
                out.effects = out.effects.filter(
                  (e) =>
                    !e.type === "ability" ||
                    !abilityIdsToDelete.includes(e._id),
                );
                out.flags = foundry.utils.mergeObject(out.flags || {}, {
                  teriock: {
                    importReference: rank.uuid,
                    importedBy: this.parent.id,
                  },
                });
                ranksToCreate.push(out);
              } else {
                const out = rank.toObject();
                out.flags = foundry.utils.mergeObject(out.flags || {}, {
                  teriock: {
                    importReference: rank.uuid,
                    importedBy: this.parent.id,
                  },
                });
                ranksToCreate.push(out);
              }
            }
          }
        }
        ranksToCreate.forEach((r) => (r.system.innate = true));
        return ranksToCreate;
      }

      /**
       * @returns {Promise<TeriockItem[]>}
       * @private
       */
      async _fetchDeterministicItemData() {
        const items = /** @type {TeriockItem[]} */ await Promise.all(
          Array.from(this.imports.items).map((i) => foundry.utils.fromUuid(i)),
        );
        return items.map((i) => {
          const obj = i.toObject();
          obj.flags = foundry.utils.mergeObject(obj.flags || {}, {
            teriock: {
              importReference: i.uuid,
              importedBy: this.parent.id,
            },
          });
          return obj;
        });
      }

      /**
       * Import all items that can be done deterministically.
       * @returns {Promise<void>}
       */
      async importDeterministic() {
        let toCreate = [];
        toCreate.push(...(await this._fetchDeterministicItemData()));
        toCreate.push(...(await this._fetchDeterministicRankData()));
        const existing = this.actor.items
          .filter((i) => i.getFlag("teriock", "importedBy") === this.parent.id)
          .map((i) => i.getFlag("teriock", "importReference"));
        toCreate = toCreate.filter(
          (i) => !existing.includes(i.flags.teriock.importReference),
        );
        const created = await this.actor.createEmbeddedDocuments(
          "Item",
          toCreate,
        );
        await this.parent.addSubs(created);
      }

      /**
       * Items this has imported.
       * @returns {TeriockItem[]}
       */
      get imported() {
        return /** @type {TeriockItem[]} */ this.actor.items.filter(
          (i) => i.getFlag("teriock", "importedBy") === this.parent.id,
        );
      }

      /**
       * Delete the items this has imported.
       * @returns {Promise<void>}
       */
      async deleteImported() {
        await this.actor.deleteEmbeddedDocuments(
          "Item",
          this.imported
            .filter((i) => i.documentName === "Item")
            .map((i) => i.id),
        );
      }
    }
  );
};
