import { makeIconClass } from "../../../utils/_module.mjs";
import { DocumentSelector } from "../../dialogs/_module.mjs";

const { AbstractSidebarTab } = foundry.applications.sidebar;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
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
    const { actors, checked } = this.constructor.GROUPS[group];
    const selected = await DocumentSelector.selectMulti(game.actors[actors], {
      checked: game.actors[checked].map(a => a.uuid),
      title: TERIOCK.CONFIG.trigger.time.choices[trigger],
    });
    if (!selected?.length) { return; }
    for (const [user, userActors] of Map.groupBy(selected, a => a.triggerUser)) {
      user.query("teriock.takeCommand", { key: trigger, uuids: userActors.map(a => a.uuid) }).catch(err =>
        console.error(`Failed to take ${trigger} for ${user.name}.`, err)
      );
    }
  }

  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { fire: this.#onFire },
    classes: ["settings-sidebar"],
    window: { title: "TERIOCK.TRIGGERS.SIDEBAR.label" },
  };

  /**
   * Trigger groups.
   * @type {Record<string, { actors: "pcs"|"relevant", checked: "pcs"|"relevant", triggers: Teriock.System.TimeTrigger[] }>}
   */
  static GROUPS = {
    session: { actors: "pcs", checked: "pcs", triggers: ["sessionStart", "sessionEnd"] },

    resting: { actors: "relevant", checked: "pcs", triggers: ["shortRest", "longRest"] },
    time: { actors: "relevant", checked: "relevant", triggers: ["dawn", "dusk"] },
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
      groups: Object.entries(this.constructor.GROUPS).map(([group, { triggers }]) => ({
        group,
        label: `TERIOCK.TRIGGERS.SIDEBAR.${group}`,
        triggers: triggers.map(trigger => ({
          icon: makeIconClass(TERIOCK.CONFIG.command[trigger].icon, "button"),
          label: TERIOCK.CONFIG.trigger.time.choices[trigger],
          trigger,
        })),
      })),
    });
  }
}
