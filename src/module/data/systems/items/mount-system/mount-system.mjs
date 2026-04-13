import { icons } from "../../../../constants/display/icons.mjs";
import { mix } from "../../../../helpers/construction.mjs";
import { dotJoin, toCamelCase } from "../../../../helpers/string.mjs";
import {
  inferNameFromIdentifier,
  makeIcon,
} from "../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";

const { fields } = foundry.data;

/**
 * Mount-specific item data model.
 * @extends {BaseItemSystem}
 * @extends {Teriock.Models.MountSystemData}
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
      childEffectTypes: ["ability", "fluency", "resource"],
      type: "mount",
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      mountType: new IdentifierField({ initial: "" }),
      mounted: new fields.BooleanField({ initial: false, required: false }),
    });
  }

  /** @inheritDoc */
  get displayTags() {
    return [...super.displayTags, ...this._attunableTags];
  }

  /** @inheritDoc */
  get embedIcons() {
    return [
      ...super.embedIcons.filter(
        (i) => !i.action.toLowerCase().includes("disabled"),
      ),
      {
        action: "toggleMountedDoc",
        icon: this.mounted ? icons.ui.enabled : icons.ui.disabled,
        onClick: async () => {
          if (this.mounted) await this.unmount();
          else await this.mount();
        },
        tooltip: this.mounted
          ? _loc("TERIOCK.SYSTEMS.Mount.EMBED.mounted")
          : _loc("TERIOCK.SYSTEMS.Mount.EMBED.unmounted"),
        visible: this.parent.isOwner,
      },
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    return Object.assign(parts, {
      subtitle: inferNameFromIdentifier(`mount:${this.mountType}`),
      text: dotJoin([...this._attunableWrappers, parts.text]),
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
        label: _loc("TERIOCK.SYSTEMS.Mount.PANELS.load"),
        wrappers: [
          _loc("TERIOCK.SYSTEMS.Attunable.PANELS.tier", {
            value: this.tier.text,
          }) || "0",
          this.mountType,
        ],
      },
    ];
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      ...super.getCardContextMenuEntries(doc),
      {
        label: _loc("TERIOCK.SYSTEMS.Mount.MENU.mount"),
        icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
        onClick: this.mount.bind(this),
        visible:
          !this.mounted &&
          this.actor &&
          this.parent._checkValidEditorDocument(doc, { self: false }),
        group: "control",
      },
      {
        label: _loc("TERIOCK.SYSTEMS.Mount.MENU.unmount"),
        icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
        onClick: this.unmount.bind(this),
        visible:
          this.mounted &&
          this.actor &&
          this.parent._checkValidEditorDocument(doc, { self: false }),
        group: "control",
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
    await this.parent.hookCall("mount", { scope: { mount: this.parent } });
    await this.parent.update({ "system.mounted": true });
  }

  /**
   * Unmount this mount.
   * @returns {Promise<void>}
   */
  async unmount() {
    await this.parent.hookCall("unmount", { scope: { mount: this.parent } });
    await this.parent.update({ "system.mounted": false });
  }
}
