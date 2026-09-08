import { mixClasses } from "../../../../helpers/construction.mjs";
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
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { tags: { triggered: true } });
    }

    /** @inheritDoc */
    get _formPaths() {
      return [...super._formPaths, ...this._triggerDisplayPaths];
    }

    /** @inheritDoc */
    get _triggerPaths() {
      const paths = super._triggerPaths;
      if (
        !this.triggers.size && this.metadata.tags.interactInExecution && this.document?.system?.metadata?.tags?.usable
      ) {
        paths.push("interactInExecution");
      }
      return paths;
    }

    /** @inheritDoc */
    get canAddToEffect() {
      return this.triggers.size > 0 && super.canAddToEffect;
    }

    /** @inheritDoc */
    get canGetActivations() {
      return super.canGetActivations && !this.triggers.size;
    }

    /**
     * What happens when this automation is triggered.
     * @param {Teriock.System.TriggerScope} scope
     * @returns {Promise<void>}
     */
    async _onFire(scope) {
      const document = this.document;
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
      teriock.data.systems.messages.TriggeredSystem.addActivations(scope.chatDataBySource[key], activations);
    }

    /** @inheritDoc */
    async _onFireTrigger(trigger, scope) {
      await super._onFireTrigger(trigger, scope);
      if (this.validateTrigger(trigger, scope)) { await this._onFire(scope); }
    }
  }

  return TriggerAutomation;
}
