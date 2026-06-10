import BaseActorSystem from "../base-actor-system/base-actor-system.mjs";

/**
 * @implements {Teriock.Models.CreatureSystemData}
 */
export default class InventorySystem extends BaseActorSystem {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { type: "inventory", visibleTypes: ["equipment"] });
  }

  /**
   * A string describing what this inventory contains.
   * @returns {string}
   */
  get containing() {
    const equipmentAmount = this.parent.equipment.length;
    if (equipmentAmount === 1) { return _loc("TERIOCK.SYSTEMS.Inventory.PANEL.contents.single"); }
    return _loc("TERIOCK.SYSTEMS.Inventory.PANEL.contents.plural", { number: equipmentAmount });
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { subtitle: this.containing });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    const STATUS_IMMUNITY = { category: "statuses", relation: "immunities", type: "protection" };
    const LIGHT_CHANGE = {
      priority: 150,
      qualifier: "1",
      target: "Actor",
      time: TERIOCK.config.change.defaultPhase,
      type: "override",
      value: "0",
    };
    const BAR = { attribute: null, type: null, value: null };

    this.parent.updateSource(
      foundry.utils.mergeObject({
        effects: [{
          name: _loc("TERIOCK.SYSTEMS.Inventory.EFFECTS.disableDown"),
          system: { automations: { invImmunity00002: { _id: "invImmunity00002", value: "down", ...STATUS_IMMUNITY } } },
          type: "consequence",
        }, {
          name: _loc("TERIOCK.SYSTEMS.Inventory.EFFECTS.disableEncumbered"),
          system: {
            automations: { invImmunity00001: { _id: "invImmunity00001", value: "encumbered", ...STATUS_IMMUNITY } },
          },
          type: "consequence",
        }, {
          name: _loc("TERIOCK.SYSTEMS.Inventory.EFFECTS.disableLighting"),
          system: {
            automations: {
              invChanges000001: {
                _id: "invChanges000001",
                changes: [{ key: "token.light.dim", ...LIGHT_CHANGE }, { key: "token.light.bright", ...LIGHT_CHANGE }],
                type: "changes",
              },
            },
          },
          type: "consequence",
        }],
        prototypeToken: {
          actorLink: true,
          bar1: BAR,
          bar2: BAR,
          displayBars: CONST.TOKEN_DISPLAY_MODES.NONE,
          displayName: CONST.TOKEN_DISPLAY_MODES.NONE,
          disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
        },
        system: { settings: { automation: { nonHierarchicalChanges: false, payAbilityCosts: false, wound: false } } },
      }, data),
    );
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    parts.bars = [{
      icon: TERIOCK.display.icons.ui.info,
      label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.info"),
      wrappers: [this.containing],
    }];
    return parts;
  }
}
