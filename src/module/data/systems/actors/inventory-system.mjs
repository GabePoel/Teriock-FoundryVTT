import { icons, thumbnails } from "../../../static/display/_module.mjs";
import { mergeMetadata } from "../../../utils/_module.mjs";
import BaseActorSystem from "./base-actor-system/base-actor-system.mjs";

export default class InventorySystem extends BaseActorSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    childTypes: ["base", "consequence", "equipment"],
    icon: icons.manifest.document.inventory,
    img: thumbnails.manifest.document.inventory,
    type: "inventory",
    visibleTypes: ["equipment"],
  });

  /**
   * A string describing what this inventory contains.
   * @returns {string}
   */
  get containing() {
    const equipmentAmount = this.parent.previewedTypes.equipment.map(e =>
      (e.system?.consumable ? (e.system?.quantity?.value ?? 1) : 1) || 1
    ).reduce((a, b) => a + b, 0);
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

    const CONDITION_IMMUNITY = { category: "condition", type: "immunity" };
    const LIGHT_CHANGE = {
      phase: TERIOCK.CONFIG.change.defaultPhase,
      priority: 150,
      target: "Actor",
      type: "override",
      value: "0",
    };
    const BAR = { attribute: null, type: null, value: null };

    this.parent.updateSource(
      foundry.utils.mergeObject({
        effects: [{
          name: _loc("TERIOCK.SYSTEMS.Inventory.EFFECTS.disableDown"),
          system: {
            affinities: { invImmunity00002: { _id: "invImmunity00002", identifier: "down", ...CONDITION_IMMUNITY } },
          },
          type: "consequence",
        }, {
          name: _loc("TERIOCK.SYSTEMS.Inventory.EFFECTS.disableEncumbered"),
          system: {
            affinities: {
              invImmunity00001: { _id: "invImmunity00001", identifier: "encumbered", ...CONDITION_IMMUNITY },
            },
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
        system: {
          settings: Object.fromEntries(
            Object.keys(TERIOCK.CONFIG.documentBehavior.categories.actor.settings).map(k => [k, false]),
          ),
        },
      }, data),
    );
  }

  /** @inheritDoc */
  async getPanelParts() {
    return Object.assign(await super.getPanelParts(), {
      bars: [{
        icon: TERIOCK.DISPLAY.icons.manifest.ui.info,
        label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.info"),
        wrappers: [this.containing],
      }],
    });
  }
}
