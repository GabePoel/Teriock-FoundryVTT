declare global {
  namespace Teriock.Foundry {
    /**
     * Describes the origin of a {@link TeriockChatMessage}.
     */
    export type ChatSpeakerData = {
      /** The `_id` of the {@link TeriockActor
       * } who generated this message */
      actor?: string;
      /** An overridden alias name used instead of the {@link TeriockActor} or {@link TeriockTokenDocument} name */
      alias?: string;
      /** The `_id` of the {@link TeriockScene} where this message was created */
      scene?: string;
      /** The `_id` of the {@link TeriockTokenDocument} who generated this message */
      token?: string;
    };

    export type ContextMenuCallback = (target: HTMLElement) => unknown;

    export type ContextMenuCondition = (html: HTMLElement) => boolean;

    export type ContextMenuEntry = {
      callback: ContextMenuCallback;
      classes?: string;
      condition?: boolean | ContextMenuCondition;
      group?: string;
      icon?: string;
      name: string;
    };

    export type EffectChangeData = {
      /** <schema> The attribute path in the {@link TeriockActor} or {@link TeriockItem} data which the change modifies */
      key: string;
      /** <schema> The value of the change effect */
      value: string;
      /** <schema> The modification mode with which the change is applied */
      mode: number;
      /** <schema> The priority level with which this change is applied */
      priority: number;
    };
  }
}

export {};
