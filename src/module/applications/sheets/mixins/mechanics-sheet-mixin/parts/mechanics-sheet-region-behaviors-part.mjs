const { FormDataExtended } = foundry.applications.ux;
const { RegionBehavior, RegionDocument } = foundry.documents;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { RegionAutomation } from "../../../../../data/pseudo-documents/automations/_module.mjs";
 * @import { RegionConfig } from "@client/applications/sheets/_module.mjs";
 * @import { TemporaryBehaviorConfig } from "../../../_module.mjs";
 */

/**
 * Makes it possible to edit behaviors of region automations as though they were on actual regions. This assumes that
 * the automation uses Foundry's default region behaviors tab and intercepts all its actions.
 * @see {RegionAutomation}
 * @see {RegionConfig}
 * @see {TemporaryBehaviorConfig}
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function MechanicsSheetRegionBehaviorsPart(Base) {
  /** @mixin */
  class MechanicsSheetRegionBehaviorsPart extends Base {
    /**
     * Create a new region behavior.
     * @param {PointerEvent} event
     * @this {MechanicsSheetRegionBehaviorsPart}
     */
    static async #onBehaviorAdd(event) {
      const { behaviors, uuid } = await this.#getControlBehavior(event);
      const parent = new RegionDocument.implementation({ behaviors, name: "Region" });
      await RegionBehavior.implementation.createDialog({}, { parent }, {
        ok: {
          callback: async (_event, button) => {
            const data = new FormDataExtended(button.form).object;
            if (!data.name?.trim()) {
              data.name = RegionBehavior.implementation.defaultName({ parent, type: data.type });
            }
            const behavior = new RegionBehavior.implementation(data);
            await this.#updateBehaviors(uuid, b => [...b, behavior.toObject()]);
            await this.#renderBehaviorSheet(behavior, uuid, behaviors.length);
          },
        },
      });
    }

    /**
     * Handle button clicks to delete a behavior.
     * @param {PointerEvent} event
     * @this {MechanicsSheetRegionBehaviorsPart}
     */
    static async #onBehaviorDelete(event) {
      const { behavior, index, uuid } = await this.#getControlBehavior(event);
      await behavior.deleteDialog({ yes: { callback: () => this.#updateBehaviors(uuid, b => b.toSpliced(index, 1)) } });
    }

    /**
     * Handle button clicks to edit a behavior.
     * @param {PointerEvent} event
     * @this {MechanicsSheetRegionBehaviorsPart}
     */
    static async #onBehaviorEdit(event) {
      const target = event.target;
      if (target.closest(".region-element-name") && (event.detail !== 2)) { return; }
      const { behavior, index, uuid } = await this.#getControlBehavior(event);
      await this.#renderBehaviorSheet(behavior, uuid, index);
    }

    /**
     * Handle button clicks to toggle a behavior.
     * @param {PointerEvent} event
     * @this {MechanicsSheetRegionBehaviorsPart}
     */
    static async #onBehaviorToggle(event) {
      const { behavior, index, uuid } = await this.#getControlBehavior(event);
      await this.#updateBehaviors(uuid, b => b.with(index, { ...b[index], disabled: !behavior.disabled }));
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        behaviorCreate: this.#onBehaviorAdd,
        behaviorDelete: this.#onBehaviorDelete,
        behaviorEdit: this.#onBehaviorEdit,
        behaviorToggle: this.#onBehaviorToggle,
      },
    };

    /**
     * Get the RegionBehavior document from a control button click and also where it's stored.
     * @param {PointerEvent} event - The button-click event.
     * @returns {Promise<{ behavior: RegionBehavior, behaviors: object[], index: number, uuid: UUID<RegionAutomation> }>}
     */
    async #getControlBehavior(event) {
      const button = event.target;
      const li = button.closest(".region-behavior");
      const uuid = button.closest(".teriock-mechanic-container").dataset.uuid;
      const behaviors = (await fromUuid(uuid)).toObject().behaviors;
      const index = Number(li.dataset.behaviorId);
      return {
        behavior: behaviors[index] && new RegionBehavior.implementation(behaviors[index]),
        behaviors,
        index,
        uuid,
      };
    }

    /**
     * Render the sheet of a behavior that's stored in a region automation.
     * @param {RegionBehavior} behavior
     * @param {UUID<RegionAutomation>} uuid
     * @param {number} index
     */
    async #renderBehaviorSheet(behavior, uuid, index) {
      await new teriock.applications.sheets.TemporaryBehaviorConfig({
        document: behavior,
        editable: this.isEditable,
        onChange: source => this.#updateBehaviors(uuid, b => b.with(index, source)),
      }).render(true);
    }

    /**
     * Change the behaviors stored in a region automation.
     * @param {UUID<RegionAutomation>} uuid
     * @param {(behaviors: object[]) => object[]} change
     */
    async #updateBehaviors(uuid, change) {
      const automation = await fromUuid(uuid);
      await automation.getNearestDocument().update({
        [`${automation.localPath}.behaviors`]: change(automation.toObject().behaviors),
      });
    }
  }

  return MechanicsSheetRegionBehaviorsPart;
}
