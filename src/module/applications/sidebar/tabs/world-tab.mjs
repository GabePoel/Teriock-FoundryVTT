import { UnitField } from "../../../data/fields/_module.mjs";
import { TimeUnitModel } from "../../../data/models/unit-models/_module.mjs";
import { makeIconClass } from "../../../utils/_module.mjs";
import { TeriockDialog } from "../../api/_module.mjs";
import { DocumentSelector } from "../../dialogs/_module.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";

const { fields } = foundry.data;
const { FormDataExtended } = foundry.applications.ux;
const { AbstractSidebarTab } = foundry.applications.sidebar;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @typedef SidebarTriggerEntry
 * @property {"characters"|"relevant"} actors - Actors that can be selected.
 * @property {"characters"|"relevant"} checked - Actors that are selected by default.
 * @property {Teriock.System.TimeTrigger[]} [optionalTriggers] - Triggers that can optionally fire first.
 * @property {boolean} [passesTime] - Whether this can also cause time to pass.
 * @property {Teriock.System.TimeTrigger} trigger - The trigger this fires.
 */

/**
 * Gives the GM buttons to fire triggers for various actors.
 * @extends {AbstractSidebarTab}
 * @mixes HandlebarsApplication
 */
export default class TeriockWorldTab extends HandlebarsApplicationMixin(AbstractSidebarTab) {
  /**
   * Select actors to run a command on their user's clients.
   * @param {PointerEvent} _event
   * @param {HTMLElement} target
   */
  static async #onFire(_event, target) {
    const { group, trigger } = target.dataset;
    const { actors, checked, optionalTriggers = [], passesTime } = this.constructor.GROUPS[group].find(e =>
      e.trigger === trigger
    );
    const triggerLabel = TERIOCK.CONFIG.trigger.time.choices[trigger];
    const prefix = "TERIOCK.TRIGGERS.SIDEBAR.FIELDS";
    const rootId = foundry.utils.randomID();
    const container = document.createElement("div");
    container.className = "teriock-form-container";
    if (optionalTriggers.length) {
      const choices = Object.fromEntries(optionalTriggers.map(t => [t, TERIOCK.CONFIG.trigger.time.choices[t]]));
      container.append(
        new fields.SetField(new fields.StringField({ choices })).toFormGroup({
          hint: _loc(`${prefix}.triggers.hint`, { trigger: triggerLabel }),
          label: `${prefix}.triggers.label`,
          localize: true,
          rootId,
        }, { name: "triggers", type: "checkboxes", value: [] }),
      );
    }
    if (passesTime) {
      const key = `${trigger}Time`;
      container.append(
        new fields.BooleanField().toFormGroup({
          hint: `${prefix}.passTime.hint`,
          label: `${prefix}.passTime.label`,
          localize: true,
          rootId,
        }, { name: "passTime", value: true }),
        game.settings.settings.get(`teriock.${key}`).type.toFormGroup({
          hint: `${prefix}.time.hint`,
          label: `${prefix}.time.label`,
          localize: true,
          rootId,
        }, { name: "time", value: game.settings.get("teriock", key) }),
      );
    }
    const content = document.createElement("div");
    if (container.childElementCount) { content.append(container); }
    let data = {};
    const selected = await DocumentSelector.selectMulti(game.actors[actors], {
      checked: game.actors[checked].map(a => a.uuid),
      content,
      icon: makeIconClass(TERIOCK.CONFIG.command[trigger].icon, "title"),
      title: triggerLabel,
      onConfirm: (_event, button) => {
        data = foundry.utils.expandObject(new FormDataExtended(button.form).object);
      },
      render: (_event, dialog) => {
        const passTime = dialog.form.elements.namedItem("passTime");
        if (!passTime) { return; }
        const timeGroup = dialog.form.elements.namedItem("time").closest(".form-group");
        const toggle = () => {
          timeGroup.hidden = !passTime.checked;
        };
        passTime.addEventListener("change", toggle);
        toggle();
      },
    });
    if (!selected) { return; }
    if (data.passTime) {
      const time = new TimeUnitModel(data.time);
      if (time.value > 0) {
        await game.time.advance(time.value);
        ui.notifications.info("TERIOCK.TRIGGERS.SIDEBAR.NOTIFICATIONS.forwards", {
          format: { time: time.label.toLocaleLowerCase() },
          localize: true,
        });
      }
    }
    const keys = [...optionalTriggers.filter(t => data.triggers?.includes(t)), trigger];
    for (const [user, userActors] of Map.groupBy(selected, a => a.triggerUser)) {
      user.query("teriock.runCommand", { keys, uuids: userActors.map(a => a.uuid) }).catch(err =>
        console.error(`Failed to run ${keys.join(", ")} for ${user.name}.`, err)
      );
    }
  }

  /**
   * Advance world time forwards or backwards.
   * @param {PointerEvent} _event
   * @param {HTMLElement} target
   */
  static async #onPassTime(_event, target) {
    const { direction } = target.dataset;
    const container = document.createElement("div");
    container.className = "teriock-form-container";
    container.append(
      new UnitField(TimeUnitModel).toFormGroup({
        label: "TERIOCK.TRIGGERS.SIDEBAR.FIELDS.time.label",
        localize: true,
        rootId: foundry.utils.randomID(),
      }, { name: "time", value: { raw: 10, unit: "minute" } }),
    );
    const content = document.createElement("div");
    content.append(container);
    const time = await TeriockDialog.prompt({
      content,
      ok: { callback: (_event, button) => foundry.utils.expandObject(new FormDataExtended(button.form).object).time },
      window: {
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.time[direction], "title"),
        title: `TERIOCK.TRIGGERS.SIDEBAR.${direction}`,
      },
    });
    if (!time) { return; }
    const model = new TimeUnitModel(time);
    if (model.value <= 0) { return; }
    await game.time.advance(direction === "backwards" ? -model.value : model.value);
    ui.notifications.info(`TERIOCK.TRIGGERS.SIDEBAR.NOTIFICATIONS.${direction}`, {
      format: { time: model.label.toLocaleLowerCase() },
      localize: true,
    });
  }

  /**
   * Update world settings.
   * @param {SubmitEvent} _event
   * @param {HTMLFormElement} _form
   * @param {FormDataExtended} formData
   */
  static async #onSubmit(_event, _form, formData) {
    for (const [key, value] of Object.entries(foundry.utils.expandObject(formData.object))) {
      await game.settings.set("teriock", key, value);
    }
  }

  /**
   * Apply or remove world effects.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onWorldEffects(event, target) {
    const actors = game.actors.selected;
    if (!game.teriock.checkActors(actors)) { return; }
    const setting = game.settings.get("teriock", "worldEffects", { document: true });
    const prefix = "TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS";
    if ((target.dataset.action === "removeWorldEffects") !== (event.button === 2)) {
      const operations = [];
      for (const actor of actors) {
        const applied = (await actor.children.getContents()).filter(c =>
          c.getFlag("teriock", "createdBy") === setting.uuid
        );
        for (const [documentName, docs] of Map.groupBy(applied, c => c.documentName)) {
          operations.push(actor.getDeleteChildDocumentsOperation(documentName, docs.map(c => c.id)));
        }
      }
      if (!operations.length) {
        ui.notifications.warn(`${prefix}.notRemoved`, { localize: true });
        return;
      }
      await foundry.documents.modifyBatch(operations);
      ui.notifications.success(`${prefix}.removed`, { localize: true });
      return;
    }
    const sources = await DocumentSelector.getFromConfig({
      ...setting.value,
      filter: d => ["ActiveEffect", "Item"].includes(d.documentName),
    });
    const selected = await DocumentSelector.selectMulti(sources, {
      checked: sources.map(d => d.uuid),
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.apply, "title"),
      title: _loc("TERIOCK.TRIGGERS.SIDEBAR.applyWorldEffects"),
    });
    if (!selected?.length) { return; }
    const operations = [];
    for (const [documentName, docs] of Map.groupBy(selected, d => d.documentName)) {
      const data = docs.map(d => {
        const obj = d.toObject(true);
        foundry.utils.setProperty(obj, "system._sup", null);
        foundry.utils.setProperty(obj, "flags.teriock.createdBy", setting.uuid);
        return obj;
      });
      for (const actor of actors) {
        operations.push(actor.getCreateChildDocumentsOperation(documentName, foundry.utils.deepClone(data)));
      }
    }
    await foundry.documents.modifyBatch(operations);
    ui.notifications.success(`${prefix}.added`, { localize: true });
  }

  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: {
      applyWorldEffects: { buttons: [0, 2], handler: this.#onWorldEffects },
      fire: this.#onFire,
      passTime: this.#onPassTime,
      removeWorldEffects: { buttons: [0, 2], handler: this.#onWorldEffects },
    },
    classes: ["settings-sidebar"],
    form: { closeOnSubmit: false, handler: this.#onSubmit, submitOnChange: true },
    tag: "form",
    window: { title: "TERIOCK.TRIGGERS.SIDEBAR.label" },
  };

  /** @type {Record<string, SidebarTriggerEntry[]>} */
  static GROUPS = {
    session: [{ actors: "characters", checked: "characters", trigger: "sessionStart" }, {
      actors: "characters",
      checked: "characters",
      trigger: "sessionEnd",
    }],

    resting: [{ actors: "relevant", checked: "characters", passesTime: true, trigger: "shortRest" }, {
      actors: "relevant",
      checked: "characters",
      optionalTriggers: ["dusk", "dawn"],
      passesTime: true,
      trigger: "longRest",
    }],

    time: [{ actors: "relevant", checked: "relevant", trigger: "dawn" }, {
      actors: "relevant",
      checked: "relevant",
      trigger: "dusk",
    }],
  };

  /** @inheritDoc */
  static PARTS = {
    header: { template: "teriock/sidebar/world/header" },
    settings: { template: "teriock/sidebar/world/settings" },
    ...Object.fromEntries(
      Object.keys(this.GROUPS).map(group => [group, { template: "teriock/sidebar/world/buttons" }]),
    ),
    description: { template: "teriock/sidebar/world/description" },
  };

  /** @inheritDoc */
  static tabName = "world";

  /** @inheritDoc */
  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    if (!game.user.isGM) {
      for (const group of Object.keys(this.constructor.GROUPS)) { delete parts[group]; }
    }
    if (!game.world.description) { delete parts.description; }
    return parts;
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), {
      disabled: !game.user.isGM,
      settings: Object.fromEntries(["terrains", "worldEffects"].map(key => {
        const { name, type } = game.settings.settings.get(`teriock.${key}`);
        return [key, { field: type, label: name, value: type.toObject(game.settings.get("teriock", key)) }];
      })),
      worldTime: game.time.calendar.format(),
      worldTitle: game.world.title,
    });
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "description") { context.description = await TeriockTextEditor.enrichHTML(game.world.description); }
    if (partId === "settings") {
      context.buttons = [{
        action: "applyWorldEffects",
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.apply, "button"),
        label: "TERIOCK.ACTIVATIONS.AddDocuments.BUTTON.generic",
        type: "button",
      }, {
        action: "removeWorldEffects",
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.undo, "button"),
        label: "TERIOCK.COMMON.Remove",
        type: "button",
      }];
    }
    const triggers = this.constructor.GROUPS[partId];
    if (triggers) {
      context.label = `TERIOCK.TRIGGERS.SIDEBAR.${partId}`;
      context.buttons = triggers.map(({ trigger }) => ({
        action: "fire",
        data: { group: partId, trigger },
        icon: makeIconClass(TERIOCK.CONFIG.command[trigger].icon, "button"),
        label: TERIOCK.CONFIG.trigger.time.choices[trigger],
        type: "button",
      }));
    }
    if (partId === "time") {
      context.buttons.push(
        ...["backwards", "forwards"].map(direction => ({
          action: "passTime",
          data: { direction },
          icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.time[direction], "button"),
          label: `TERIOCK.TRIGGERS.SIDEBAR.${direction}`,
          type: "button",
        })),
      );
    }
    return context;
  }
}
