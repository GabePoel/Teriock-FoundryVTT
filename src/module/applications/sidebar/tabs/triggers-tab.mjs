import { TimeUnitModel } from "../../../data/models/unit-models/_module.mjs";
import { makeIconClass } from "../../../utils/_module.mjs";
import { DocumentSelector } from "../../dialogs/_module.mjs";

const { fields } = foundry.data;
const { FormDataExtended } = foundry.applications.ux;
const { AbstractSidebarTab } = foundry.applications.sidebar;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @typedef SidebarTriggerEntry
 * @property {"pcs"|"relevant"} actors - Actors that can be selected.
 * @property {"pcs"|"relevant"} checked - Actors that are selected by default.
 * @property {Teriock.System.TimeTrigger[]} [optionalTriggers] - Triggers that can optionally fire first.
 * @property {boolean} [passesTime] - Whether this can also cause time to pass.
 * @property {Teriock.System.TimeTrigger} trigger - The trigger this fires.
 */

/**
 * Gives the GM buttons to fire triggers for various actors.
 * @extends {AbstractSidebarTab}
 * @mixes HandlebarsApplication
 */
export default class TeriockTriggersTab extends HandlebarsApplicationMixin(AbstractSidebarTab) {
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
    const content = document.createElement("div");
    if (container.childElementCount) { content.append(container); }
    let data = {};
    const selected = await DocumentSelector.selectMulti(game.actors[actors], {
      checked: game.actors[checked].map(a => a.uuid),
      content,
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
      const seconds = new TimeUnitModel(data.time).value;
      if (seconds > 0) { await game.time.advance(seconds); }
    }
    const keys = [...optionalTriggers.filter(t => data.triggers?.includes(t)), trigger];
    for (const [user, userActors] of Map.groupBy(selected, a => a.triggerUser)) {
      user.query("teriock.runCommand", { keys, uuids: userActors.map(a => a.uuid) }).catch(err =>
        console.error(`Failed to run ${keys.join(", ")} for ${user.name}.`, err)
      );
    }
  }

  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { fire: this.#onFire },
    classes: ["settings-sidebar"],
    window: { title: "TERIOCK.TRIGGERS.SIDEBAR.label" },
  };

  /** @type {Record<string, SidebarTriggerEntry[]>} */
  static GROUPS = {
    session: [{ actors: "pcs", checked: "pcs", trigger: "sessionStart" }, {
      actors: "pcs",
      checked: "pcs",
      trigger: "sessionEnd",
    }],

    resting: [{ actors: "relevant", checked: "pcs", passesTime: true, trigger: "shortRest" }, {
      actors: "relevant",
      checked: "pcs",
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
  static PARTS = { triggers: { root: true, template: "teriock/sidebar/triggers" } };

  /** @inheritDoc */
  static tabName = "triggers";

  /** @inheritDoc */
  _canRender(options) {
    if (!game.user.isGM) { return false; }
    return super._canRender(options);
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), {
      groups: Object.entries(this.constructor.GROUPS).map(([group, triggers]) => ({
        group,
        label: `TERIOCK.TRIGGERS.SIDEBAR.${group}`,
        triggers: triggers.map(({ trigger }) => ({
          icon: makeIconClass(TERIOCK.CONFIG.command[trigger].icon, "button"),
          label: TERIOCK.CONFIG.trigger.time.choices[trigger],
          trigger,
        })),
      })),
    });
  }
}
