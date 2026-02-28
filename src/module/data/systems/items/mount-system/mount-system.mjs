import { icons } from "../../../../constants/display/icons.mjs";
import { toCamelCase } from "../../../../helpers/string.mjs";
import { mix } from "../../../../helpers/utils.mjs";
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
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Mount",
  ];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "mount",
      childEffectTypes: ["ability", "fluency", "resource"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      mountType: new fields.StringField({ initial: "", required: false }),
      mounted: new fields.BooleanField({ initial: false, required: false }),
    });
  }

  /** @inheritDoc */
  get displayFields() {
    return ["system.description", "system.flaws"];
  }

  /** @inheritDoc */
  get displayTags() {
    const tags = super.displayTags;
    if (this.isAttuned) {
      tags.push({
        label: "TERIOCK.SYSTEMS.Attunement.USAGE.attuned",
        tooltip: "TYPES.ActiveEffect.attunement",
      });
    }
    return tags;
  }

  /** @inheritDoc */
  get embedIcons() {
    return [
      ...super.embedIcons.filter(
        (i) => !i.action.toLowerCase().includes("disabled"),
      ),
      {
        icon: this.mounted ? icons.ui.enabled : icons.ui.disabled,
        action: "toggleMountedDoc",
        tooltip: this.mounted
          ? game.i18n.localize("TERIOCK.SYSTEMS.Mount.EMBED.mounted")
          : game.i18n.localize("TERIOCK.SYSTEMS.Mount.EMBED.unmounted"),
        condition: this.parent.isOwner,
        callback: async () => {
          if (this.mounted) await this.unmount();
          else await this.mount();
        },
      },
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, {
      subtitle: this.mountType,
      text: game.i18n.format("TERIOCK.SYSTEMS.Attunable.PANELS.tier", {
        value: this.tier.value,
      }),
    });
  }

  /** @inheritDoc */
  get makeSuppressed() {
    return super.makeSuppressed || !this.mounted;
  }

  /** @inheritDoc */
  get messageBars() {
    return [
      this._statBar,
      {
        icon: TERIOCK.display.icons.armament.load,
        label: game.i18n.localize("TERIOCK.SYSTEMS.Mount.PANELS.load"),
        wrappers: [
          game.i18n.format("TERIOCK.SYSTEMS.Attunable.PANELS.tier", {
            value: this.tier.text,
          }) || "0",
          this.mountType,
        ],
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
    if (data.cancel) return;
    await this.parent.update({ "system.mounted": true });
  }

  /**
   * Unmount this mount.
   * @returns {Promise<void>}
   */
  async unmount() {
    const data = { doc: this.parent };
    await this.parent.hookCall("mountUnmount", data);
    if (data.cancel) return;
    await this.parent.update({ "system.mounted": false });
  }
}
