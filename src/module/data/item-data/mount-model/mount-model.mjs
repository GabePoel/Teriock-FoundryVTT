import { prefix } from "../../../helpers/string.mjs";
import {
  AttunableDataMixin,
  StatGiverDataMixin,
} from "../../mixins/_module.mjs";
import { TextField } from "../../shared/fields/_module.mjs";
import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";

const { fields } = foundry.data;

/**
 * Mount-specific item data model.
 * @extends {TeriockBaseItemModel}
 * @mixes AttunableData
 * @mixes StatGiverData
 */
export default class TeriockMountModel extends StatGiverDataMixin(
  AttunableDataMixin(TeriockBaseItemModel),
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "mount",
      childEffectTypes: ["ability", "fluency", "resource"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      mountType: new fields.StringField({
        initial: "Mount Type",
        required: false,
      }),
      mounted: new fields.BooleanField({
        initial: false,
        required: false,
      }),
      flaws: new TextField({
        initial: "",
        label: "Flaws",
      }),
    });
    return schema;
  }

  /** @inheritDoc */
  get displayFields() {
    return ["system.description", "system.flaws"];
  }

  get embedIcons() {
    return [
      ...super.embedIcons.filter(
        (i) => !i.action.toLowerCase().includes("disabled"),
      ),
      {
        icon: this.mounted ? "circle-check" : "circle",
        action: "toggleMountedDoc",
        tooltip: this.mounted ? "Mounted" : "Unmounted",
        condition: this.parent.isOwner,
        callback: async () => {
          if (this.mounted) {
            await this.unmount();
          } else {
            await this.mount();
          }
        },
      },
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = this.mountType;
    parts.text = prefix(this.tier.value, "Tier");
    return parts;
  }

  /** @inheritDoc */
  get messageBars() {
    return [
      {
        icon: "fa-dice",
        label: "Stat Dice",
        wrappers: [
          this.statDice.hp.formula + " Hit Dice",
          this.statDice.mp.formula + " Mana Dice",
        ],
      },
      {
        icon: "fa-trophy",
        label: "Load",
        wrappers: ["Tier " + this.tier.raw || "0", this.mountType],
      },
    ];
  }

  /** @inheritDoc */
  get suppressed() {
    return super.suppressed || !this.mounted;
  }

  /**
   * Mount this mount.
   * @returns {Promise<void>}
   */
  async mount() {
    const data = { doc: this.parent };
    await this.parent.hookCall("mountMount", data);
    if (!data.cancel) {
      await this.parent.update({ "system.mounted": true });
    }
  }

  /**
   * Unmount this mount.
   * @returns {Promise<void>}
   */
  async unmount() {
    const data = { doc: this.parent };
    await this.parent.hookCall("mountUnmount", data);
    if (!data.cancel) {
      await this.parent.update({ "system.mounted": false });
    }
  }
}
