import { prefix, toCamelCase } from "../../../../helpers/string.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import { TextField } from "../../../fields/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Mount-specific item data model.
 * @extends {BaseItemSystem}
 * @implements {Teriock.Models.MountSystemInterface}
 * @mixes AttunableSystem
 * @mixes StatGiverSystem
 */
export default class MountSystem extends mix(
  BaseItemSystem,
  mixins.AttunableSystemMixin,
  mixins.StatGiverSystemMixin,
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
  get makeSuppressed() {
    return super.makeSuppressed || !this.mounted;
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
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      mounted: Number(this.mounted),
      [`type.${toCamelCase(this.mountType)}`]: 1,
    };
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
