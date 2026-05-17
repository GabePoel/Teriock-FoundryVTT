import { icons } from "../../../../constants/display/icons.mjs";
import { makeIcon } from "../../../../helpers/utils.mjs";
import { HpPoolModel, MpPoolModel } from "../../../models/stat-pool-models/_module.mjs";

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
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.StatGiver"];

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

      /** @returns {Teriock.Messages.MessageBar} */
      get _statBar() {
        return {
          icon: icons.ui.dice,
          label: _loc("TERIOCK.SYSTEMS.StatGiver.PANELS.statDice"),
          wrappers: [
            _loc("TERIOCK.SYSTEMS.StatGiver.PANELS.hp", {
              value: this.statDice.hp.formula,
            }),
            _loc("TERIOCK.SYSTEMS.StatGiver.PANELS.mp", {
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
            group: "control",
            icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.StatGiver.MENU.enableHpDice"),
            onClick: async () => {
              await this.parent.update({
                "system.statDice.hp.disabled": false,
              });
            },
            visible: this.statDice.hp.disabled && this._canToggleHpDice && doc !== this.parent,
          },
          {
            group: "control",
            icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.StatGiver.MENU.disableHpDice"),
            onClick: async () => {
              await this.parent.update({ "system.statDice.hp.disabled": true });
            },
            visible: !this.statDice.hp.disabled && this._canToggleHpDice && doc !== this.parent,
          },
          {
            group: "control",
            icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.StatGiver.MENU.enableMpDice"),
            onClick: async () => {
              await this.parent.update({
                "system.statDice.mp.disabled": false,
              });
            },
            visible:
              this.statDice.mp.disabled &&
              this._canToggleMpDice &&
              this.parent._checkValidEditorDocument(doc, { self: false }),
          },
          {
            group: "control",
            icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.StatGiver.MENU.disableMpDice"),
            onClick: async () => {
              await this.parent.update({ "system.statDice.mp.disabled": true });
            },
            visible:
              !this.statDice.mp.disabled &&
              this._canToggleMpDice &&
              this.parent._checkValidEditorDocument(doc, { self: false }),
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
