import BaseActorSystem from "../base-actor-system/base-actor-system.mjs";

/**
 * @implements {Teriock.Models.CreatureSystemData}
 */
export default class InventorySystem extends BaseActorSystem {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "inventory",
      visibleTypes: ["equipment"],
    });
  }

  /**
   * A string describing what this inventory contains.
   * @returns {string}
   */
  get containing() {
    const equipmentAmount = this.parent.equipment.length;
    if (equipmentAmount === 1) {
      return _loc("TERIOCK.SYSTEMS.Inventory.PANEL.contents.single");
    }
    return _loc("TERIOCK.SYSTEMS.Inventory.PANEL.contents.plural", {
      number: equipmentAmount,
    });
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { subtitle: this.containing });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    this.parent.updateSource(
      foundry.utils.mergeObject(
        {
          effects: [
            {
              name: _loc("TERIOCK.SYSTEMS.Inventory.EFFECTS.disableDown"),
              type: "consequence",
              system: {
                automations: {
                  invImmunity00002: {
                    _id: "invImmunity00002",
                    type: "protection",
                    relation: "immunities",
                    category: "statuses",
                    value: "down",
                  },
                },
              },
            },
            {
              name: _loc("TERIOCK.SYSTEMS.Inventory.EFFECTS.disableEncumbered"),
              type: "consequence",
              system: {
                automations: {
                  invImmunity00001: {
                    _id: "invImmunity00001",
                    type: "protection",
                    relation: "immunities",
                    category: "statuses",
                    value: "encumbered",
                  },
                },
              },
            },
            {
              name: _loc("TERIOCK.SYSTEMS.Inventory.EFFECTS.disableLighting"),
              type: "consequence",
              system: {
                automations: {
                  invChanges000001: {
                    _id: "invChanges000001",
                    type: "changes",
                    changes: [
                      {
                        key: "token.light.dim",
                        mode: 5,
                        priority: 150,
                        qualifier: "1",
                        target: "Actor",
                        time: "normal",
                        value: "0",
                      },
                      {
                        key: "token.light.bright",
                        mode: 5,
                        priority: 150,
                        qualifier: "1",
                        target: "Actor",
                        time: "normal",
                        value: "0",
                      },
                    ],
                  },
                },
              },
            },
          ],
          flags: {
            teriockDocumentSettings: {
              nonHierarchicalChanges: false,
              payAbilityCosts: false,
            },
          },
          prototypeToken: { actorLink: true, displayBars: 0 },
        },
        data,
      ),
    );
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    parts.bars = [
      {
        icon: TERIOCK.display.icons.ui.info,
        label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.info"),
        wrappers: [this.containing],
      },
    ];
    return parts;
  }
}
