import { iconStyles } from "../constants/display/icon-styles.mjs";

declare global {
  namespace Teriock.UI {
    /** Notification-style messages that appear in application forms. */
    export type FormMessage = { icon?: string, level?: "error" | "info" | "success" | "warning", text?: string };

    /** Tips that appear on document sheets and tooltips. */
    export type Tip = { icon?: string, level?: "error" | "info" | "success" | "warning", text?: string };

    /** Icon style */
    export type IconStyle = keyof typeof iconStyles;

    /** Icon category */
    export type IconCategory = keyof typeof TERIOCK.display.iconManifest;
  }
}
