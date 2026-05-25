import { icons } from "../../../../constants/display/icons.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { dotJoin } from "../../../../helpers/string.mjs";
import { fromIdentifier, getIdentifierName, makeIcon } from "../../../../helpers/utils.mjs";
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
export default class MountSystem
  extends mixClasses(BaseItemSystem, mixins.AttunableSystemMixin, mixins.StatGiverSystemMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Mount"];

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
      mounted: new fields.BooleanField({ initial: false, required: false }),
      mountType: new IdentifierField({ initial: "", type: "mount" }),
    });
  }

  /** @inheritDoc */
  get _refreshPromises() {
    const promises = super._refreshPromises;
    if (this.mountType) {
      promises.push(
        this._formatRefreshPromise(
          fromIdentifier(`mount:${this.mountType}`),
          "TERIOCK.SYSTEMS.Mount.FIELDS.mountType.label",
        ),
      );
    }
    return promises;
  }

  /** @inheritDoc */
  get displayTags() {
    return [...super.displayTags, ...this._attunableTags];
  }

  /** @inheritDoc */
  get embedIcons() {
    return [...super.embedIcons.filter(i => !i.action.toLowerCase().includes("disabled")), {
      action: "toggleMountedDoc",
      icon: this.mounted ? icons.ui.enabled : icons.ui.disabled,
      tooltip: this.mounted
        ? _loc("TERIOCK.SYSTEMS.Mount.EMBED.mounted")
        : _loc("TERIOCK.SYSTEMS.Mount.EMBED.unmounted"),
      visible: this.parent.isOwner,
      onClick: async () => {
        if (this.mounted) await this.unmount();
        else await this.mount();
      },
    }];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    return Object.assign(parts, {
      subtitle: getIdentifierName(this.mountType),
      text: dotJoin([...this._attunableWrappers, parts.text]),
    });
  }

  /** @inheritDoc */
  get makeSuppressed() {
    return super.makeSuppressed || !this.mounted;
  }

  /** @inheritDoc */
  get messageBars() {
    return [this._statBar, {
      icon: TERIOCK.display.icons.armament.load,
      label: _loc("TERIOCK.SYSTEMS.Mount.PANELS.load"),
      wrappers: [
        _loc("TERIOCK.SYSTEMS.Attunable.PANELS.tier", { value: this.tier.text || "0" }),
        getIdentifierName(this.mountType),
      ],
    }];
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [...super.getCardContextMenuEntries(doc), {
      group: "control",
      icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Mount.MENU.mount"),
      onClick: this.mount.bind(this),
      visible: !this.mounted && this.actor && this.parent._checkValidEditorDocument(doc, { self: false }),
    }, {
      group: "control",
      icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Mount.MENU.unmount"),
      onClick: this.unmount.bind(this),
      visible: this.mounted && this.actor && this.parent._checkValidEditorDocument(doc, { self: false }),
    }];
  }

  /** @inheritDoc */
  getLocalRollData() {
    return { ...super.getLocalRollData(), [`type.${this._source.mountType}`]: 1, mounted: Number(this.mounted) };
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
