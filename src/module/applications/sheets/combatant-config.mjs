const { CombatantConfig } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockCombatantConfig extends CombatantConfig {
  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    const initiativeGroup = result.body?.querySelector(".form-group:has(input[name='initiative'])");
    if (initiativeGroup) {
      const { system } = this.document;
      initiativeGroup.after(
        ...["attackPenalty", "actions", "reactions"].map(key =>
          system.schema.fields[key].toFormGroup({ rootId: this.id }, {
            name: `system.${key}`,
            rootId: this.id,
            value: system._source[key],
          })
        ),
      );
    }
    super._replaceHTML(result, content, options);
  }
}
