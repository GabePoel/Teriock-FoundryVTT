import { objectMap } from "../../../helpers/utils.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

export default class ChildChangeAutomation extends BaseAutomation {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.ChildChange",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ChildChange.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "childChange";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { changes: true });
  }

  /** @inheritDoc */
  static defineSchema() {
    const initialCategory = Object.keys(
      TERIOCK.config.childChanges.categories,
    )[0];
    const pathEntries = Object.entries(TERIOCK.config.childChanges.paths);
    const initialPathEntry = pathEntries.find(([_k, v]) =>
      v.categories.includes(initialCategory),
    );
    const initialKey = initialPathEntry[0];
    const changeTypes = TERIOCK.config.childChanges.paths[initialKey].types ?? [
      "override",
    ];
    const initialChangeType = changeTypes[0];
    return Object.assign(super.defineSchema(), {
      category: new fields.StringField({
        choices: objectMap(
          TERIOCK.config.childChanges.categories,
          (e) => e.label,
          { localize: true },
        ),
        initial: initialCategory,
        required: true,
      }),
      changeType: new fields.StringField({
        choices: objectMap(ActiveEffect.CHANGE_TYPES, (t) => t.label, {
          localize: true,
        }),
        initial: initialChangeType,
        required: true,
      }),
      key: new fields.StringField({
        choices: objectMap(TERIOCK.config.childChanges.paths, (e) => e.label, {
          localize: true,
        }),
        initial: initialKey,
        required: true,
      }),
      priority: new fields.NumberField(),
      qualifier: new FormulaField({ initial: "0" }),
      value: new FormulaField({ deterministic: false, initial: "" }),
    });
  }

  /** @returns {Record<string, string>} */
  get _choicesChangeType() {
    const types = TERIOCK.config.childChanges.paths[this.key]?.types;
    if (types) {
      return Object.fromEntries(
        Object.entries(ActiveEffect.CHANGE_TYPES)
          .filter(([k, _v]) => types.includes(k))
          .map(([_k, v]) => [_k, _loc(v.label)])
          .sort((a, b) => a[1].localeCompare(b[1])),
      );
    } else {
      return objectMap(ActiveEffect.CHANGE_TYPES, (t) => t.label, {
        localize: true,
      });
    }
  }

  /** @returns {Record<string, string>} */
  get _choicesKey() {
    return objectMap(TERIOCK.config.childChanges.paths, (e) => e.label, {
      filter: (e) => e.categories.includes(this.category),
    });
  }

  /** @returns {number} */
  get _defaultPriority() {
    return ActiveEffect.CHANGE_TYPES[this.changeType]?.defaultPriority ?? 0;
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["category", "qualifier", "key", "changeType", "value", "priority"];
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}) {
    if (path.endsWith("key")) inputConfig.choices = this._choicesKey;
    if (path.endsWith("qualifier")) inputConfig.context = this.category;
    if (path.endsWith("value")) inputConfig.context = "actor";
    if (path.endsWith("changeType")) {
      inputConfig.choices = this._choicesChangeType;
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
        phase: "normal",
        priority: this.priority ?? this._defaultPriority,
        qualifier: this.qualifier,
        target: this.category,
        type: this.changeType,
        value: this.value,
      },
    ];
  }

  /** @inheritDoc */
  prepareData() {
    const changeTypeChoices = Object.keys(this._choicesChangeType);
    if (!changeTypeChoices.includes(this.changeType)) {
      this.changeType = changeTypeChoices[0];
    }
    const keyChoices = Object.keys(this._choicesKey);
    if (!keyChoices.includes(this.key)) this.key = keyChoices[0];
  }
}
