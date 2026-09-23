import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import { BaseExpiration } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * A condition chosen from the condition statuses.
 * @returns {IdentifierField}
 */
function conditionField() {
  return new IdentifierField({
    blank: false,
    nullable: false,
    choices: () => objectMap(TERIOCK.statuses.conditions, c => c.name),
  });
}

export default class StatusExpiration extends BaseExpiration {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXPIRATIONS.Status"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "status" });

  /** @inheritDoc */
  static defineSchema() {
    const schema = Object.assign(super.defineSchema(), {
      statuses: new fields.SchemaField({
        absent: new fields.SetField(conditionField()),
        present: new fields.SetField(conditionField()),
      }),
    });
    delete schema.method;
    return schema;
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["statuses.absent", "statuses.present"];
  }

  /**
   * Whether this has statuses that will cause expiration.
   * @returns {boolean}
   */
  get shouldExpire() {
    if (this.actor) {
      for (const c of this.statuses.present) { if (this.actor.statuses.has(c)) { return true; } }
      for (const c of this.statuses.absent) { if (!this.actor.statuses.has(c)) { return true; } }
    }
    return false;
  }

  /**
   * Whether a set of changed statuses includes any that this cares about.
   * @param {Set<Teriock.Keys.Condition>} [changedStatuses]
   * @returns {boolean}
   */
  _isRelevantChange(changedStatuses) {
    if (!changedStatuses) { return true; }
    for (const c of this.statuses.present) { if (changedStatuses.has(c)) { return true; } }
    for (const c of this.statuses.absent) { if (changedStatuses.has(c)) { return true; } }
    return false;
  }

  /** @inheritDoc */
  _validateExpirationAttempt(type, context) {
    return super._validateExpirationAttempt(type, context)
      && this._isRelevantChange(context.changedStatuses)
      && this.shouldExpire;
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    this.method = "automatic";
  }
}
