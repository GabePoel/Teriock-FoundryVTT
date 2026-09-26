import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { TriggerMechanicMixin } from "../../mixins/_module.mjs";

/**
 * Automation that hooks this into triggers.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, TriggerAutomation>}
 */
export default function TriggerAutomationMixin(Base) {
  /**
   * @mixes TriggerMechanic
   * @mixin
   */
  class TriggerAutomation extends mixClasses(Base, TriggerMechanicMixin) {
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, { tags: { triggered: true } });

    /** @inheritDoc */
    get _formPaths() {
      return [...super._formPaths, ...this._triggerDisplayPaths];
    }

    /** @inheritDoc */
    get _triggerPaths() {
      const paths = super._triggerPaths;
      if (
        this.makesChatData && this.metadata.tags.interactInExecution
        && this.getNearestDocument()?.metadata?.tags?.usable
      ) {
        paths.push("interactInExecution");
      }
      return paths;
    }

    /** @inheritDoc */
    get isCopiedToEffect() {
      return this.activeTriggers.size > 0 && super.isCopiedToEffect;
    }

    /** @inheritDoc */
    get makesChatData() {
      return !this.activeTriggers.size;
    }

    /** @inheritDoc */
    async _onFire(scope) {
      const document = this.getNearestDocument();
      const actor = scope.actor ?? this.actor;
      if (!document || !actor?.prepareTriggeredChatData) { return; }
      const activations = this._applyDisplayToActivations(
        await this._getActivations({
          actor: scope.actor,
          execution: scope.execution ?? null,
          rollData: this._getFireRollData(scope),
          trigger: scope.trigger,
        }),
      );
      if (!activations.length) { return; }
      scope.chatDataBySource ??= {};
      const key = document.uuid;
      scope.chatDataBySource[key] ??= actor.prepareTriggeredChatData(scope.trigger, document);
      scope.chatDataBySource[key].system.activations.push(...activations);
    }
  }

  return TriggerAutomation;
}
