import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentSheetMixin } from "../api/_module.mjs";

const { CombatantConfig } = foundry.applications.sheets;

/**
 * @extends {CombatantConfig}
 * @mixes BaseDocumentSheet
 */
export default class TeriockCombatantConfig extends mixClasses(CombatantConfig, BaseDocumentSheetMixin) {
  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    const initiativeGroup = result.body?.querySelector(".form-group:has(input[name='initiative'])");
    const defaultCombatant = this.document.system.defaultCombatant;
    const isDefault = defaultCombatant === this.document;
    const actor = this.document.actor;
    const hasActor = Boolean(actor);
    if (initiativeGroup) {
      const { group, system } = this.document;
      if (group) {
        const input = initiativeGroup.querySelector("input");
        if (input) {
          input.disabled = true;
          input.value = group.initiative ?? "";
        }
      }
      const actorFields = ["initiative.competence.raw", "initiative.bonus"];
      const defaultCombatantFields = ["attackPenalty", "actions", "reactions"];
      initiativeGroup.after(...[...actorFields, ...defaultCombatantFields].map(key => {
        const isActorField = actorFields.includes(key);
        const isCombatantField = defaultCombatantFields.includes(key);
        return this.document.system.getFieldForProperty(key).toFormGroup({ rootId: this.id }, {
          disabled: isActorField ? hasActor : isCombatantField ? !isDefault : false,
          hint: "",
          name: `system.${key}`,
          rootId: this.id,
          value: isActorField && hasActor
            ? foundry.utils.getProperty(actor.system, key)
            : isDefault
            ? foundry.utils.getProperty(system._source, key)
            : foundry.utils.getProperty(defaultCombatant.system, key),
        });
      }));
    }
    super._replaceHTML(result, content, options);
  }
}
