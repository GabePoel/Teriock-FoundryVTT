import { icons } from "../../../../constants/display/icons.mjs";
import { makeIcon } from "../../../../helpers/utils.mjs";
import {
  HpPoolModel,
  MpPoolModel,
} from "../../../models/stat-pool-models/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseItemSystem} Base
 */
export default function StatGiverSystemMixin(Base) {
  return (
    /**
     * @extends {BaseItemSystem}
     * @extends {Teriock.Models.StatGiverSystemData}
     * @implements {Teriock.Functionality.StatProvider}
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
            hp: new fields.EmbeddedDataField(HpPoolModel),
            mp: new fields.EmbeddedDataField(MpPoolModel),
          }),
        });
      }

      /**
       * Whether the HP dice can be toggled disabled/enabled.
       * @returns {boolean}
       */
      get _canToggleHpDice() {
        return true;
      }

      /**
       * Whether the MP dice can be toggled disabled/enabled.
       * @returns {boolean}
       */
      get _canToggleMpDice() {
        return true;
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
       * @returns {ContextMenuEntry[]}
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
            condition:
              this.statDice.hp.disabled &&
              this._canToggleHpDice &&
              doc !== this.parent,
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
            condition:
              !this.statDice.hp.disabled &&
              this._canToggleHpDice &&
              doc !== this.parent,
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
            condition:
              this.statDice.mp.disabled &&
              this._canToggleMpDice &&
              this.parent._checkValidEditorDocument(doc, { self: false }),
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
            condition:
              !this.statDice.mp.disabled &&
              this._canToggleMpDice &&
              this.parent._checkValidEditorDocument(doc, { self: false }),
            group: "control",
          },
        );
        return entries;
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          hp: this.statDice.hp.formula,
          "hp.disabled": Number(this.statDice.hp.disabled),
          "hp.value": Number(this.statDice.hp.value),
          mp: this.statDice.mp.formula,
          "mp.disabled": Number(this.statDice.mp.disabled),
          "mp.value": Number(this.statDice.mp.value),
        };
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        if (!this.actor) this.prepareStatDice();
      }

      /** @inheritDoc */
      prepareStatDice() {
        this.statDice.hp.prepareStatDice();
        this.statDice.mp.prepareStatDice();
      }
    }
  );
}
