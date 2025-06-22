const { fields } = foundry.data;
import { consequenceOptions } from "../../../../../helpers/constants/consequence-options.mjs";

export class TeriockArrayField extends fields.ArrayField {
  /** @override */
  _toInput(config) {
    const out = document.createElement("button");
    out.innerHTML = `<i class="fa-solid fa-plus"></i> Add Item`;
    out.className = "teriock-array-field-add";
    if (config.name) out.setAttribute("name", config.name);
    return out;
  }
}

export class TypedStringField extends fields.TypedObjectField {
  /** @override */
  _toInput(config) {
    const out = document.createElement("div");
    out.className = "teriock-typed-string-field-wrapper";
    out.style.flexDirection = "column";
    for (const key of Object.keys(config.value ?? {})) {
      if (config.choices && Object.keys(config.choices).includes(key)) {
        out.appendChild(this.element.toFormGroup({ label: config.choices[key] }, config.value[key]));
      }
    }
    const addButton = document.createElement("button");
    addButton.className = "teriock-typed-string-field-add";
    addButton.textContent = "Add Value";
    out.appendChild(addButton);
    return out;
  }
}

export class TeriockChangesField extends fields.SchemaField {
  /** @override */
  _toInput(config) {
    console.log("TERIOCK CHANGES FIELD", config, this);
    const out = document.createElement("ul");
    out.className = "teriock-changes-field-wrapper";
    out.style.flexDirection = "column";
    out.style.width = "100%";
    out.style.display = "flex";
    out.style.gap = "0.5rem";
    for (const change of config.value ?? []) {
      const changeBox = document.createElement("li");
      changeBox.className = "teriock-change-box";
      changeBox.style.display = "flex";
      changeBox.style.flexDirection = "row";
      changeBox.style.gap = "0.5rem";
      changeBox.style.width = "100%";
      const keyField = this.fields.key.toFormGroup({ value: change.key });
      const modeField = this.fields.mode.toFormGroup({ value: change.mode });
      const valueField = this.fields.value.toFormGroup({ value: change.value });
      const priorityField = this.fields.priority.toFormGroup({ value: change.priority });
      changeBox.appendChild(keyField);
      changeBox.appendChild(modeField);
      changeBox.appendChild(valueField);
      changeBox.appendChild(priorityField);
      out.appendChild(changeBox);
    }
    return out;
  }
}

export class TeriockRecordField extends fields.TypedObjectField {
  /** @override */
  _toInput(config) {
    console.log("TERIOCK RECORD FIELD", config, this);
    console.log(config);
    config.value = Object.keys(config.value ?? {});
    config.classes = "teriock-record-field";
    const override = config.override;
    fields.StringField._prepareChoiceConfig(config);
    if (override) {
      config.name = override;
      config.dataset = {
        path: this.fieldPath,
      };
    }
    console.log("Config for multi-select input:", config);
    return foundry.applications.fields.createMultiSelectInput(config);
  }

  /** @override */
  toFormGroup(...args) {
    const out = super.toFormGroup(...args);
    out.style.width = "100%";
    return out;
  }
}

export class ConsequenceField extends fields.SchemaField {
  /** @override */
  _toInput(config) {
    console.log("CONSEQUENCE FIELD", config, this);
    const name = config.name;
    const rollsName = `${name}.instant.rolls`;
    const hacksName = `${name}.instant.hacks`;
    console.log("Rolls name:", rollsName);
    console.log("Hacks name:", hacksName);
    const out = document.createElement("div");
    out.className = "teriock-consequence-field-wrapper form-group";
    out.style.flexDirection = "column";
    out.style.width = "100%";
    const rollsBox = this.fields.instant.fields.rolls.toFormGroup(
      {},
      {
        value: config.value.instant.rolls,
        choices: consequenceOptions.rolls,
        override: rollsName,
      },
    );
    out.appendChild(rollsBox);
    const rollsList = document.createElement("ul");
    rollsList.style.margin = "0";
    rollsList.className = "teriock-rolls-list";
    rollsBox.appendChild(rollsList);
    for (const rollKey of Object.keys(config.value.instant.rolls ?? {})) {
      const rollItem = document.createElement("li");
      rollItem.className = "teriock-roll-item";
      rollItem.appendChild(
        this.fields.instant.fields.rolls.element.toFormGroup(
          {
            label: consequenceOptions.rolls[rollKey] || "Roll",
          },
          {
            value: config.value.instant.rolls[rollKey],
            name: `${name}.instant.rolls.${rollKey}`,
            classes: "teriock-update-input",
          },
        ),
      );
      rollsList.appendChild(rollItem);
    }
    const hacksBox = this.fields.instant.fields.hacks.toFormGroup(
      {},
      {
        value: config.value.instant.hacks,
        choices: consequenceOptions.hacks,
        override: hacksName,
      },
    );
    out.appendChild(hacksBox);
    const hacksList = document.createElement("ul");
    hacksList.className = "teriock-hacks-list";
    hacksList.style.margin = "0";
    hacksBox.appendChild(hacksList);
    for (const hackKey of Object.keys(config.value.instant.hacks ?? {})) {
      const hackItem = document.createElement("li");
      hackItem.className = "teriock-hack-item";
      hackItem.appendChild(
        this.fields.instant.fields.hacks.element.toFormGroup(
          {
            label: consequenceOptions.hacks[hackKey] || "Hack",
          },
          {
            value: config.value.instant.hacks[hackKey],
            name: `${name}.instant.hacks.${hackKey}`,
            classes: "teriock-update-input",
          },
        ),
      );
      hacksList.appendChild(hackItem);
    }
    const statusesBox = this.fields.ongoing.fields.statuses.toFormGroup({
      value: config.value.ongoing.statuses,
    });
    statusesBox.style.width = "100%";
    out.appendChild(statusesBox);
    const statusesList = document.createElement("ul");
    statusesList.className = "teriock-statuses-list";
    statusesList.style.margin = "0";
    statusesBox.appendChild(statusesList);
    for (const statusKey of Object.keys(config.value.ongoing.statuses ?? {})) {
      const statusItem = document.createElement("li");
      statusItem.className = "teriock-status-item";
      statusItem.appendChild(
        this.fields.ongoing.fields.statuses.element.toFormGroup(
          {
            label: consequenceOptions.statuses[statusKey] || "Status",
          },
          {
            value: config.value.ongoing.statuses[statusKey],
            name: `${name}.ongoing.statuses.${statusKey}`,
            classes: "teriock-update-input",
          },
        ),
      );
      statusesList.appendChild(statusItem);
    }
    const changesBox = this.fields.ongoing.fields.changes.toFormGroup({ value: config.value.ongoing.changes });
    changesBox.style.width = "100%";
    changesBox.classList.add("teriock-changes-box");
    out.appendChild(changesBox);
    const durationBox = this.fields.ongoing.fields.duration.toFormGroup(
      {},
      {
        value: config.value.ongoing.duration,
        name: `${name}.ongoing.duration`,
        classes: "teriock-update-input",
      },
    );
    durationBox.style.width = "100%";
    out.appendChild(durationBox);
    const movementExpirationBox = this.fields.ongoing.fields.expirations.fields.movement.toFormGroup(
      {},
      {
        value: config.value.ongoing.expirations.movement,
        name: `${name}.ongoing.expirations.movement`,
        classes: "teriock-update-checkbox",
      },
    );
    movementExpirationBox.style.width = "100%";
    out.appendChild(movementExpirationBox);
    // const dawnExpirationBox = this.fields.ongoing.fields.expirations.fields.dawn.toFormGroup(
    //   {},
    //   {
    //     value: config.value.ongoing.expirations.dawn,
    //     name: `${name}.ongoing.expirations.dawn`,
    //     classes: "teriock-update-checkbox",
    //   },
    // );
    // dawnExpirationBox.style.width = "100%";
    // out.appendChild(dawnExpirationBox);
    // const sustainedExpirationBox = this.fields.ongoing.fields.expirations.fields.sustained.toFormGroup(
    //   {},
    //   {
    //     value: config.value.ongoing.expirations.sustained,
    //     name: `${name}.ongoing.expirations.sustained`,
    //     classes: "teriock-update-checkbox",
    //   },
    // );
    // sustainedExpirationBox.style.width = "100%";
    // out.appendChild(sustainedExpirationBox);
    const expirationsTurnEnabledBox = this.fields.ongoing.fields.expirations.fields.turn.fields.enabled.toFormGroup(
      {},
      {
        value: config.value.ongoing.expirations.turn.enabled,
        name: `${name}.ongoing.expirations.turn.enabled`,
        classes: "teriock-update-checkbox",
      },
    );
    expirationsTurnEnabledBox.style.width = "100%";
    out.appendChild(expirationsTurnEnabledBox);
    if (config.value.ongoing.expirations.turn.enabled) {
      const turnExpirationsBox = document.createElement("fieldset");
      out.appendChild(turnExpirationsBox);
      turnExpirationsBox.className = "form-group";
      turnExpirationsBox.style.flexDirection = "column";
      turnExpirationsBox.style.width = "100%";
      turnExpirationsBox.style.marginTop = "0.5rem";
      const expirationsLegend = document.createElement("legend");
      expirationsLegend.textContent = "Turn Expirations";
      turnExpirationsBox.appendChild(expirationsLegend);
      const turnWhoBox = this.fields.ongoing.fields.expirations.fields.turn.fields.who.toFormGroup(
        {},
        {
          value: config.value.ongoing.expirations.turn.who,
          name: `${name}.ongoing.expirations.turn.who`,
          classes: "teriock-update-select",
        },
      );
      turnWhoBox.style.width = "100%";
      turnExpirationsBox.appendChild(turnWhoBox);
      const turnWhenBox = this.fields.ongoing.fields.expirations.fields.turn.fields.when.toFormGroup(
        {},
        {
          value: config.value.ongoing.expirations.turn.when,
          name: `${name}.ongoing.expirations.turn.when`,
          classes: "teriock-update-select",
        },
      );
      turnWhenBox.style.width = "100%";
      turnExpirationsBox.appendChild(turnWhenBox);
      const turnHowBox = this.fields.ongoing.fields.expirations.fields.turn.fields.how.toFormGroup(
        {},
        {
          value: config.value.ongoing.expirations.turn.how,
          name: `${name}.ongoing.expirations.turn.how`,
          classes: "teriock-update-select",
        },
      );
      turnHowBox.style.width = "100%";
      turnExpirationsBox.appendChild(turnHowBox);
    }
    return out;
  }
}

export class MutationsField extends fields.SchemaField {
  /** @override */
  _toInput(config) {
    console.log("MUTATIONS FIELD", config, this);
    const out = document.createElement("div");
    out.className = "teriock-mutations-field-wrapper form-group";
    out.style.flexDirection = "column";
    out.style.width = "100%";
    const doubleFormGroup = this.fields.double.toFormGroup(
      {},
      {
        value: config.value.double,
        name: config.name + ".double",
        classes: "teriock-update-checkbox",
      },
    );
    doubleFormGroup.style.width = "100%";
    out.appendChild(doubleFormGroup);
    return out;
  }
}

export class HeightenedField extends fields.SchemaField {
  /** @override */
  _toInput(config) {
    console.log("HEIGHTENED FIELD", config, this);
    const out = document.createElement("div");
    out.className = "teriock-heightened-field-wrapper form-group";
    out.style.flexDirection = "column";
    out.style.width = "100%";
    const scalingBox = document.createElement("fieldset");
    scalingBox.className = "form-group";
    scalingBox.style.flexDirection = "column";
    scalingBox.style.width = "100%";
    const scalingLegend = document.createElement("legend");
    scalingLegend.textContent = "Heightened Scaling";
    scalingBox.appendChild(scalingLegend);
    out.appendChild(scalingBox);
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
    scalingBox.appendChild(rollsBox);
    const rollsList = document.createElement("ul");
    rollsList.style.margin = "0";
    rollsList.className = "teriock-rolls-list";
    rollsBox.appendChild(rollsList);
    for (const rollKey of Object.keys(config.value.scaling.rolls ?? {})) {
      const rollItem = document.createElement("li");
      rollItem.className = "teriock-roll-item";
      rollItem.appendChild(
        this.fields.scaling.fields.rolls.element.toFormGroup(
          {
            label: consequenceOptions.rolls[rollKey] || "Roll",
          },
          {
            value: config.value.scaling.rolls[rollKey],
            name: `${config.name}.scaling.rolls.${rollKey}`,
            classes: "teriock-update-input",
          },
        ),
      );
      rollsList.appendChild(rollItem);
    }
    const scalingDurationValueBox = this.fields.scaling.fields.duration.fields.value.toFormGroup(
      {},
      {
        value: config.value.scaling.duration.value,
        name: `${config.name}.scaling.duration.value`,
        classes: "teriock-update-input",
      },
    );
    scalingDurationValueBox.style.width = "100%";
    scalingBox.appendChild(scalingDurationValueBox);
    const scalingDurationRoundingBox = this.fields.scaling.fields.duration.fields.rounding.toFormGroup(
      {},
      {
        value: config.value.scaling.duration.rounding,
        name: `${config.name}.scaling.duration.rounding`,
        classes: "teriock-update-input",
      },
    );
    scalingDurationRoundingBox.style.width = "100%";
    scalingBox.appendChild(scalingDurationValueBox);
    const enabledFormGroup = this.fields.enabled.toFormGroup(
      {},
      {
        value: config.value.enabled,
        name: config.name + ".enabled",
        classes: "teriock-update-checkbox",
      },
    );
    enabledFormGroup.style.width = "100%";
    out.appendChild(enabledFormGroup);
    if (config.value.enabled) {
      const overridesBox = document.createElement("fieldset");
      overridesBox.className = "form-group";
      overridesBox.style.flexDirection = "column";
      overridesBox.style.width = "100%";
      overridesBox.style.marginTop = "0.5rem";
      const legend = document.createElement("legend");
      legend.textContent = "Heightened Overrides";
      overridesBox.appendChild(legend);
      out.appendChild(overridesBox);
      overridesBox.appendChild(
        this.fields.overrides.toInput({
          value: config.value.overrides,
          name: `${config.name}.overrides`,
          classes: "teriock-update-input",
          label: config.label || "Overrides",
        }),
      );
    }
    return out;
  }
}

export class CriticalConsequenceField extends fields.SchemaField {
  /** @override */
  _toInput(config) {
    console.log("CRITICAL CONSEQUENCE FIELD", config, this);
    const out = document.createElement("div");
    out.className = "teriock-critical-consequence-field-wrapper form-group";
    out.style.flexDirection = "column";
    out.style.width = "100%";
    const mutationsBox = this.fields.mutations.toInput({
      value: config.value.mutations,
      name: config.name + ".mutations",
      classes: "teriock-update-input",
      label: config.label || "Mutations",
    });
    mutationsBox.style.width = "100%";
    out.appendChild(mutationsBox);
    const enabledFormGroup = this.fields.enabled.toFormGroup(
      {},
      {
        value: config.value.enabled,
        name: config.name + ".enabled",
        classes: "teriock-update-checkbox",
      },
    );
    enabledFormGroup.style.width = "100%";
    out.appendChild(enabledFormGroup);
    if (config.value.enabled) {
      const overridesBox = document.createElement("fieldset");
      overridesBox.className = "form-group";
      overridesBox.style.flexDirection = "column";
      overridesBox.style.width = "100%";
      overridesBox.style.marginTop = "0.5rem";
      const legend = document.createElement("legend");
      legend.textContent = "Critical Overrides";
      overridesBox.appendChild(legend);
      out.appendChild(overridesBox);
      overridesBox.appendChild(
        this.fields.overrides.toInput({
          value: config.value.overrides,
          name: `${config.name}.overrides`,
          classes: "teriock-update-input",
          label: config.label || "Overrides",
        }),
      );
    }
    return out;
  }
}

export class SimpleConsequenceField extends fields.SchemaField {
  /** @override */
  _toInput(config) {
    console.log("SIMPLE CONSEQUENCE FIELD", config, this);
    const name = config.name.string;
    console.log(name);
    let out;
    if (!config.noField) {
      out = document.createElement("fieldset");
      const legend = document.createElement("legend");
      legend.textContent = config.label ?? "Simple Consequence";
      out.appendChild(legend);
    } else {
      out = document.createElement("div");
    }
    out.className = "teriock-simple-consequence-field-wrapper form-group";
    out.style.flexDirection = "column";
    out.style.width = "100%";
    const defaultConsequenceBox = document.createElement("div");
    defaultConsequenceBox.appendChild(
      this.fields.default.toInput({
        value: config.value.default,
        name: `${name}.default`,
      }),
    );
    defaultConsequenceBox.className = "teriock-default-consequence-box form-group";
    defaultConsequenceBox.style.width = "100%";
    out.appendChild(defaultConsequenceBox);
    const critConsequenceBox = document.createElement("div");
    critConsequenceBox.appendChild(
      this.fields.crit.toInput({
        value: config.value.crit,
        name: `${name}.crit`,
      }),
    );
    critConsequenceBox.className = "teriock-crit-consequence-box form-group";
    critConsequenceBox.style.width = "100%";
    out.appendChild(critConsequenceBox);
    return out;
  }
}

export class ModifiedConsequenceField extends fields.SchemaField {
  /** @override */
  _toInput(config) {
    console.log("MODIFIED CONSEQUENCE FIELD", config, this);
    const out = document.createElement("div");
    out.className = "teriock-modified-consequence-field-wrapper form-group";
    out.style.flexDirection = "column";
    out.style.width = "100%";
    const heightenedBox = this.fields.heightened.toInput({
      value: config.value.heightened,
      name: `${config.name}.heightened`,
      classes: "teriock-update-input",
      label: config.label || "Heightened",
    });
    heightenedBox.style.width = "100%";
    const enabledFormGroup = this.fields.enabled.toFormGroup(
      {},
      {
        value: config.value.enabled,
        name: config.name + ".enabled",
        classes: "teriock-update-checkbox",
      },
    );
    out.appendChild(heightenedBox);
    enabledFormGroup.style.width = "100%";
    out.appendChild(enabledFormGroup);
    if (config.value.enabled) {
      const overridesBox = document.createElement("fieldset");
      overridesBox.className = "form-group";
      overridesBox.style.flexDirection = "column";
      overridesBox.style.width = "100%";
      overridesBox.style.marginTop = "0.5rem";
      const legend = document.createElement("legend");
      legend.textContent = "Static Overrides";
      overridesBox.appendChild(legend);
      out.appendChild(overridesBox);
      overridesBox.appendChild(
        this.fields.overrides.toInput({
          value: config.value.overrides,
          name: `${config.name}.overrides`,
          classes: "teriock-update-input",
          label: config.label || "Overrides",
          noField: true,
        }),
      );
    }
    return out;
  }
}
