const { fields } = foundry.data;
import { consequenceOptions } from "../../../../../helpers/constants/consequence-options.mjs";

// Utility functions for common DOM operations
const createElement = (tag, className, styles = {}, content = "") => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  Object.assign(el.style, styles);
  if (content) el.innerHTML = content;
  return el;
};

const createFullWidthElement = (tag, className, additionalStyles = {}) =>
  createElement(tag, className, { width: "100%", ...additionalStyles });

const createFormGroup = (className, additionalStyles = {}) =>
  createFullWidthElement("div", `${className} form-group`, { flexDirection: "column", ...additionalStyles });

const createButton = (className, content, dataset = {}) => {
  const btn = createElement("button", className, {}, content);
  Object.assign(btn.dataset, dataset);
  return btn;
};

const createFieldset = (legendText, className = "form-group") => {
  const fieldset = createFullWidthElement("fieldset", className, { flexDirection: "column", marginTop: "0.5rem" });
  const legend = createElement("legend", "", {}, legendText);
  fieldset.appendChild(legend);
  return fieldset;
};

export class TeriockArrayField extends fields.ArrayField {
  _toInput(config) {
    const btn = createButton("teriock-array-field-add", '<i class="fa-solid fa-plus"></i> Add Item', {
      path: this.fieldPath,
    });
    if (config.name) btn.setAttribute("name", config.name);
    return btn;
  }
}

export class TeriockRecordField extends fields.TypedObjectField {
  _toInput(config) {
    config.value = Object.keys(config.value ?? {});
    config.classes = "teriock-record-field";
    fields.StringField._prepareChoiceConfig(config);

    if (config.override) {
      config.name = config.override;
      config.dataset = { path: this.fieldPath };
    }

    return foundry.applications.fields.createMultiSelectInput(config);
  }

  toFormGroup(...args) {
    const out = super.toFormGroup(...args);
    out.style.width = "100%";
    return out;
  }
}

export class ConsequenceField extends fields.SchemaField {
  _createRollsList(config, name, fieldType) {
    const list = createElement("ul", `teriock-${fieldType}-list form-group`, {
      margin: "0",
      flexDirection: "column",
      width: "100%",
      listStyleType: "none",
      padding: "0",
    });

    Object.keys(config.value.instant[fieldType] ?? {}).forEach((key) => {
      const item = createElement("li", `teriock-${fieldType.slice(0, -1)}-item`, {
        width: "100%",
        marginBottom: "0",
      });

      const formGroup = this.fields.instant.fields[fieldType].element.toFormGroup(
        { label: consequenceOptions[fieldType][key] || fieldType.slice(0, -1) },
        {
          value: config.value.instant[fieldType][key],
          name: `${name}.instant.${fieldType}.${key}`,
          classes: "teriock-update-input",
          dataset: { tooltip: "Roll Formula" },
        },
      );

      const label = formGroup.querySelector("label");
      if (label) label.style.fontWeight = "unset";

      item.appendChild(formGroup);
      list.appendChild(item);
    });

    return list;
  }

  _createChangesList(config, name) {
    const list = createElement("ol", "teriock-changes-list form-group", {
      flexDirection: "column",
      width: "100%",
      margin: "0",
      padding: "0",
    });

    (config.value.ongoing.changes ?? []).forEach((change, i) => {
      const item = createElement("li", "teriock-change-item", {
        display: "flex",
        flexDirection: "row",
        gap: "0.5rem",
        marginBottom: "0",
      });

      ["key", "mode", "value", "priority"].forEach((part) => {
        item.appendChild(
          this.fields.ongoing.fields.changes.element.fields[part].toInput({
            value: change[part],
            name: `${name}.ongoing.changes`,
            classes: "teriock-change-input",
            dataset: { index: i, part, tooltip: `Change ${part}` },
          }),
        );
      });

      const removeBtn = createButton("teriock-remove-change-button", '<i class="fa-solid fa-trash"></i>', {
        index: i,
        tooltip: "Remove Change",
      });
      removeBtn.setAttribute("name", `${name}.ongoing.changes`);
      item.appendChild(removeBtn);
      list.appendChild(item);
    });

    return list;
  }

  _toInput(config) {
    const { name } = config;
    const wrapper = createFormGroup("teriock-consequence-field-wrapper");

    // Rolls section
    const rollsBox = this.fields.instant.fields.rolls.toFormGroup(
      {},
      {
        value: config.value.instant.rolls,
        choices: consequenceOptions.rolls,
        override: `${name}.instant.rolls`,
      },
    );
    rollsBox.appendChild(this._createRollsList(config, name, "rolls"));
    wrapper.appendChild(rollsBox);

    // Hacks section
    const hacksBox = this.fields.instant.fields.hacks.toFormGroup(
      {},
      {
        value: config.value.instant.hacks,
        choices: consequenceOptions.hacks,
        override: `${name}.instant.hacks`,
      },
    );
    hacksBox.appendChild(this._createRollsList(config, name, "hacks"));
    wrapper.appendChild(hacksBox);

    // Statuses
    const statusesBox = this.fields.ongoing.fields.statuses.toFormGroup(
      {},
      {
        value: config.value.ongoing.statuses,
        name: `${name}.ongoing.statuses`,
        classes: "teriock-update-set",
      },
    );
    statusesBox.style.width = "100%";
    wrapper.appendChild(statusesBox);

    // Changes
    const changesBox = this.fields.ongoing.fields.changes.toFormGroup(
      {},
      {
        value: config.value.ongoing.changes,
        name: `${name}.ongoing.changes`,
      },
    );
    changesBox.style.width = "100%";
    changesBox.classList.add("teriock-changes-box");
    changesBox.appendChild(this._createChangesList(config, name));
    wrapper.appendChild(changesBox);

    // Duration and expirations
    ["duration", "expirations.movement", "expirations.turn.enabled"].forEach((path) => {
      const field = path.split(".").reduce((f, p) => f.fields[p], this.fields.ongoing);
      const box = field.toFormGroup(
        {},
        {
          value: path.split(".").reduce((v, p) => v?.[p], config.value.ongoing),
          name: `${name}.ongoing.${path}`,
          classes: path.includes("enabled") ? "teriock-update-checkbox" : "teriock-update-input",
        },
      );
      box.style.width = "100%";
      wrapper.appendChild(box);
    });

    // Turn expirations (conditional)
    if (config.value.ongoing.expirations.turn.enabled) {
      const turnBox = createFieldset("Turn Expirations");
      ["who", "when", "how"].forEach((field) => {
        const fieldBox = this.fields.ongoing.fields.expirations.fields.turn.fields[field].toFormGroup(
          {},
          {
            value: config.value.ongoing.expirations.turn[field],
            name: `${name}.ongoing.expirations.turn.${field}`,
            classes: "teriock-update-select",
          },
        );
        fieldBox.style.width = "100%";
        turnBox.appendChild(fieldBox);
      });
      wrapper.appendChild(turnBox);
    }

    return wrapper;
  }
}

export class MutationsField extends fields.SchemaField {
  _toInput(config) {
    const wrapper = createFormGroup("teriock-mutations-field-wrapper");
    const doubleBox = this.fields.double.toFormGroup(
      {},
      {
        value: config.value.double,
        name: `${config.name}.double`,
        classes: "teriock-update-checkbox",
      },
    );
    doubleBox.style.width = "100%";
    wrapper.appendChild(doubleBox);
    return wrapper;
  }
}

export class HeightenedField extends fields.SchemaField {
  _createScalingSection(config) {
    const scalingBox = createFieldset("Heightened Scaling");

    const rollsBox = this.fields.scaling.fields.rolls.toFormGroup(
      {},
      {
        value: config.value.scaling.rolls,
        name: `${config.name}.scaling.rolls`,
        choices: consequenceOptions.rolls,
        classes: "teriock-update-select",
      },
    );
    rollsBox.style.width = "100%";

    const rollsList = createElement("ul", "teriock-rolls-list", {
      margin: "0",
      listStyleType: "none",
      padding: "0",
    });

    Object.keys(config.value.scaling.rolls ?? {}).forEach((rollKey) => {
      const item = createElement("li", "teriock-roll-item", {
        width: "100%",
        marginBottom: "0",
      });

      const formGroup = this.fields.scaling.fields.rolls.element.toFormGroup(
        { label: consequenceOptions.rolls[rollKey] || "Roll" },
        {
          value: config.value.scaling.rolls[rollKey],
          name: `${config.name}.scaling.rolls.${rollKey}`,
          classes: "teriock-update-input",
          dataset: { tooltip: "Roll Formula" },
        },
      );

      const label = formGroup.querySelector("label");
      if (label) label.style.fontWeight = "unset";

      item.appendChild(formGroup);
      rollsList.appendChild(item);
    });

    rollsBox.appendChild(rollsList);
    scalingBox.appendChild(rollsBox);

    // Duration fields
    ["value", "rounding"].forEach((field) => {
      const durationBox = this.fields.scaling.fields.duration.fields[field].toFormGroup(
        {},
        {
          value: config.value.scaling.duration[field],
          name: `${config.name}.scaling.duration.${field}`,
          classes: "teriock-update-input",
        },
      );
      durationBox.style.width = "100%";
      scalingBox.appendChild(durationBox);
    });

    return scalingBox;
  }

  _toInput(config) {
    const wrapper = createFormGroup("teriock-heightened-field-wrapper");

    wrapper.appendChild(this._createScalingSection(config));

    const enabledBox = this.fields.enabled.toFormGroup(
      {},
      {
        value: config.value.enabled,
        name: `${config.name}.enabled`,
        classes: "teriock-update-checkbox",
      },
    );
    enabledBox.style.width = "100%";
    wrapper.appendChild(enabledBox);

    if (config.value.enabled) {
      const overridesBox = createFieldset("Heightened Overrides");
      overridesBox.appendChild(
        this.fields.overrides.toInput({
          value: config.value.overrides,
          name: `${config.name}.overrides`,
          classes: "teriock-update-input",
          label: config.label || "Overrides",
        }),
      );
      wrapper.appendChild(overridesBox);
    }

    return wrapper;
  }
}

// Base class for consequence fields with common override pattern
class BaseConsequenceField extends fields.SchemaField {
  _createOverridesSection(config, legendText) {
    const overridesBox = createFieldset(legendText);
    overridesBox.appendChild(
      this.fields.overrides.toInput({
        value: config.value.overrides,
        name: `${config.name}.overrides`,
        classes: "teriock-update-input",
        label: config.label || "Overrides",
        ...(config.noField && { noField: true }),
      }),
    );
    return overridesBox;
  }

  _createEnabledCheckbox(config) {
    const enabledBox = this.fields.enabled.toFormGroup(
      {},
      {
        value: config.value.enabled,
        name: `${config.name}.enabled`,
        classes: "teriock-update-checkbox",
      },
    );
    enabledBox.style.width = "100%";
    return enabledBox;
  }
}

export class CriticalConsequenceField extends BaseConsequenceField {
  _toInput(config) {
    const wrapper = createFormGroup("teriock-critical-consequence-field-wrapper");

    const mutationsBox = this.fields.mutations.toInput({
      value: config.value.mutations,
      name: `${config.name}.mutations`,
      classes: "teriock-update-input",
      label: config.label || "Mutations",
    });
    mutationsBox.style.width = "100%";
    wrapper.appendChild(mutationsBox);

    wrapper.appendChild(this._createEnabledCheckbox(config));

    if (config.value.enabled) {
      wrapper.appendChild(this._createOverridesSection(config, "Critical Overrides"));
    }

    return wrapper;
  }
}

export class SimpleConsequenceField extends fields.SchemaField {
  _toInput(config) {
    const name = config.name.string;
    const wrapper = config.noField
      ? createFormGroup("teriock-simple-consequence-field-wrapper")
      : createFieldset(config.label ?? "Simple Consequence");

    if (!config.noField) {
      wrapper.className += " teriock-simple-consequence-field-wrapper form-group";
      wrapper.style.flexDirection = "column";
      wrapper.style.width = "100%";
    }

    ["default", "crit"].forEach((type) => {
      const box = createFormGroup(`teriock-${type}-consequence-box`);
      box.appendChild(
        this.fields[type].toInput({
          value: config.value[type],
          name: `${name}.${type}`,
        }),
      );
      wrapper.appendChild(box);
    });

    return wrapper;
  }
}

export class ModifiedConsequenceField extends BaseConsequenceField {
  _toInput(config) {
    const wrapper = createFormGroup("teriock-modified-consequence-field-wrapper");

    const heightenedBox = this.fields.heightened.toInput({
      value: config.value.heightened,
      name: `${config.name}.heightened`,
      classes: "teriock-update-input",
      label: config.label || "Heightened",
    });
    heightenedBox.style.width = "100%";
    wrapper.appendChild(heightenedBox);

    wrapper.appendChild(this._createEnabledCheckbox(config));

    if (config.value.enabled) {
      wrapper.appendChild(this._createOverridesSection({ ...config, noField: true }, "Static Overrides"));
    }

    return wrapper;
  }
}
