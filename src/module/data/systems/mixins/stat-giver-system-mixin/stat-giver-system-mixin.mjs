import { icons } from "../../../../constants/display/icons.mjs";
import { makeIcon } from "../../../../helpers/utils.mjs";
import { StatDieModel } from "../../../models/_module.mjs";
import {
  HpPoolModel,
  MpPoolModel,
} from "../../../models/stat-pool-models/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseItemSystem} Base
 */
export default function StatGiverSystemMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseItemSystem}
     * @implements {Teriock.Models.StatGiverSystemInterface}
     * @mixin
     */
    class StatGiverSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.StatGiver",
      ];

      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          stats: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          statDice: new fields.SchemaField({
            hp: new fields.EmbeddedDataField(HpPoolModel, {
              nullable: false,
            }),
            mp: new fields.EmbeddedDataField(MpPoolModel, {
              nullable: false,
            }),
          }),
        });
      }

      /**
       * Whether the HP dice can be disabled.
       * @returns {boolean}
       */
      get _canDisableHpDice() {
        return !this.statDice.hp.disabled;
      }

      /**
       * Whether the MP dice can be disabled.
       * @returns {boolean}
       */
      get _canDisableMpDice() {
        return !this.statDice.mp.disabled;
      }

      /**
       * Whether the HP dice can be enabled.
       * @returns {boolean}
       */
      get _canEnableHpDice() {
        return this.statDice.hp.disabled;
      }

      /**
       * Whether the MP dice can be enabled.
       * @returns {boolean}
       */
      get _canEnableMpDice() {
        return this.statDice.mp.disabled;
      }

      /** @returns {Teriock.MessageData.MessageBar} */
      get _statBar() {
        return {
          icon: icons.ui.dice,
          label: game.i18n.localize(
            "TERIOCK.SYSTEMS.StatGiver.PANELS.statDice",
          ),
          wrappers: [
            game.i18n.format("TERIOCK.SYSTEMS.StatGiver.PANELS.hp", {
              value: this.statDice.hp.formula,
            }),
            game.i18n.format("TERIOCK.SYSTEMS.StatGiver.PANELS.mp", {
              value: this.statDice.mp.formula,
            }),
          ],
        };
      }

      /**
       * Context menu entries to enable/disable HP and mana dice.
       * @param {TeriockDocument} doc
       * @returns {Teriock.Foundry.ContextMenuEntry[]}
       */
      getCardContextMenuEntries(doc) {
        const entries = super.getCardContextMenuEntries(doc);
        if (!doc?.isOwner) return entries;
        entries.push(
          {
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.StatGiver.MENU.enableHpDice",
            ),
            icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
            callback: async () => {
              await this.parent.update({
                "system.statDice.hp.disabled": false,
              });
            },
            condition: this._canEnableHpDice,
            group: "control",
          },
          {
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.StatGiver.MENU.disableHpDice",
            ),
            icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
            callback: async () => {
              await this.parent.update({ "system.statDice.hp.disabled": true });
            },
            condition: this._canDisableHpDice,
            group: "control",
          },
          {
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.StatGiver.MENU.enableMpDice",
            ),
            icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
            callback: async () => {
              await this.parent.update({
                "system.statDice.mp.disabled": false,
              });
            },
            condition: this._canEnableMpDice,
            group: "control",
          },
          {
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.StatGiver.MENU.disableMpDice",
            ),
            icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
            callback: async () => {
              await this.parent.update({ "system.statDice.mp.disabled": true });
            },
            condition: this._canDisableMpDice,
            group: "control",
          },
        );
        return entries;
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          "hp.faces": this.statDice.hp.faces,
          "mp.faces": this.statDice.mp.faces,
          "hp.number": this.statDice.hp.number.value,
          "mp.number": this.statDice.mp.number.value,
          "hp.disabled": Number(this.statDice.hp.disabled),
          "mp.disabled": Number(this.statDice.mp.disabled),
          hp: this.statDice.hp.formula,
          mp: this.statDice.mp.formula,
        };
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        for (const pool of Object.values(this.statDice)) {
          pool.number.evaluate();
        }
      }

      /** @inheritDoc */
      prepareSpecialData() {
        for (const pool of Object.values(this.statDice)) {
          pool.number.evaluate();
          if (pool.dice.length < pool.number.value || 0) {
            for (let i = pool.dice.length; i < pool.number.value; i++) {
              pool.dice.push(new StatDieModel({}, { parent: pool }));
            }
          }
          for (const [i, die] of Object.entries(pool.dice)) {
            die.index = Number(i);
            if (!die.rolled || die.value > die.faces) {
              die.value = Math.ceil(die.faces / 2) + 1;
            }
            if (die.index >= (pool.number?.value || 0) || pool.disabled) {
              die.disabled = true;
            }
          }
        }
      }
    }
  );
}
