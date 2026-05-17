import { formatDynamicSelectOptions, objectMap } from "../../../helpers/utils.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { migrateKey } from "../../shared/migrations/source-migrations.mjs";
import { CritAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

export default class ChildChangeAutomation extends CritAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ChildChange"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ChildChange.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "childChange";
  }

  /** @inheritDoc */
  static defineSchema() {
    const initialTarget = Object.keys(TERIOCK.config.change.child.targets)[0];
    const pathEntries = Object.entries(TERIOCK.config.change.child.paths);
    const initialPathEntry = pathEntries.find(([_k, v]) => v.targets.includes(initialTarget));
    const initialKey = initialPathEntry[0];
    const changeTypes = TERIOCK.config.change.child.paths[initialKey].types ?? ["override"];
    const initialChangeType = changeTypes[0];
    return Object.assign(super.defineSchema(), {
      changeType: new fields.StringField({
        choices: objectMap(ActiveEffect.CHANGE_TYPES, t => t.label, {
          localize: true,
        }),
        initial: initialChangeType,
        required: true,
      }),
      key: new fields.StringField({
        choices: objectMap(TERIOCK.config.change.child.paths, e => e.label, {
          localize: true,
        }),
        initial: initialKey,
        required: true,
      }),
      priority: new fields.NumberField(),
      qualifier: new FormulaField({ initial: "0" }),
      target: new fields.StringField({
        choices: objectMap(TERIOCK.config.change.child.targets, e => e.label, { localize: true }),
        initial: initialTarget,
        required: true,
      }),
      value: new FormulaField({ deterministic: false, initial: "" }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "category", "target");
    return super.migrateData(source, options, state);
  }

  /** @returns {Record<string, string>} */
  get _changeTypeChoices() {
    const types = TERIOCK.config.change.child.paths[this.key]?.types;
    if (types) {
      return Object.fromEntries(
        Object.entries(ActiveEffect.CHANGE_TYPES)
          .filter(([k, _v]) => types.includes(k))
          .map(([_k, v]) => [_k, _loc(v.label)])
          .sort((a, b) => a[1].localeCompare(b[1])),
      );
    } else {
      return objectMap(ActiveEffect.CHANGE_TYPES, t => t.label, {
        localize: true,
      });
    }
  }

  /** @returns {number} */
  get _defaultPriority() {
    return ActiveEffect.CHANGE_TYPES[this.changeType]?.defaultPriority ?? 0;
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["target", "qualifier", "key", "changeType", "value", "priority"];
  }

  /** @returns {Record<string, string>} */
  get _keyChoices() {
    return objectMap(TERIOCK.config.change.child.paths, e => e.label, {
      filter: e => e.targets.includes(this.target),
    });
  }

  /**
   * The key choices formatted into groups.
   * @returns {Record<string, FormSelectOption>}
   */
  get _processedKeyChoices() {
    const groups = {};
    const pathEntries = Object.entries(TERIOCK.config.change.child.paths).filter(([_k, v]) =>
      v.targets.includes(this.target),
    );
    for (const [k, v] of pathEntries) {
      if (!groups[v.group]) {
        groups[v.group] = {
          choices: {},
          label: TERIOCK.config.change.child.groups[v.group],
        };
      }
      groups[v.group].choices[k] = v.label;
      if (v.group === "boosts") {
        groups[v.group].choices[k] = _loc("TERIOCK.AUTOMATIONS.ChildChange.CHOICES.impact", { impact: v.label });
      }
    }
    return formatDynamicSelectOptions(groups);
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}) {
    if (path.endsWith("key")) {
      inputConfig.choices = this._processedKeyChoices;
    }
    if (path.endsWith("qualifier")) {
      inputConfig.context = this.target;
    }
    if (path.endsWith("value")) {
      inputConfig.context = "actor";
    }
    if (path.endsWith("changeType")) {
      inputConfig.choices = this._changeTypeChoices;
    }
    if (path.endsWith("priority")) {
      inputConfig.placeholder = this._defaultPriority.toString() ?? "0";
    }
    return super._makeFormGroup(path, groupConfig, inputConfig);
  }

  /** @inheritDoc */
  getChanges() {
    return [
      {
        key: this.key,
        phase: "children",
        priority: this.priority ?? this._defaultPriority,
        qualifier: this.qualifier,
        target: this.target,
        type: this.changeType,
        value: this.value,
      },
    ];
  }

  /** @inheritDoc */
  prepareData() {
    const changeTypeChoices = Object.keys(this._changeTypeChoices);
    if (!changeTypeChoices.includes(this.changeType)) {
      this.changeType = changeTypeChoices[0];
    }
    const keyChoices = Object.keys(this._keyChoices);
    if (!keyChoices.includes(this.key)) {
      this.key = keyChoices[0];
    }
  }
}
