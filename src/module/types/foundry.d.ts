declare global {
  namespace Teriock.Foundry {
    /**
     * Describes the origin of a {@link TeriockChatMessage}.
     */
    export type ChatSpeakerData = {
      /** The `_id` of the {@link TeriockActor} who generated this message */
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
  }
}

export {};
