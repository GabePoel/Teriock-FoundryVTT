declare global {
  namespace Teriock.Models {
    export type ChildSystemData = {
      /** <schema> Description */
      description: string;
      /** <derived> Whether this is forcibly suppressed by something else */
      forceSuppressed: boolean;
      /** <schema> Setup and usage instructions */
      instructions: string;
      /** <derived> Localized UI messages, such as suppression reasons */
      messages: Set<string>;
      /** <schema> Per-document behavior and display settings */
      settings: Teriock.Models.CommonSettingsModel;

      /** Notification-style messages that appear on document sheets */
      get formMessages(): Teriock.UI.FormMessage[];

      get parent(): AnyChildDocument;
    };
  }
}

export {};
