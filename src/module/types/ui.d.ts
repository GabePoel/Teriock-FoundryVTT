import type { iconStyles } from "../constants/display/icon-styles.mjs";

declare global {
  namespace Teriock.UI {
    /** Three-way toggle */
    export type ThreeToggle = -1 | 0 | 1;

    /** Icon style */
    export type IconStyle = keyof typeof iconStyles;

    /** Parameters to construct an HTML button. */
    export type HTMLButtonConfig = {
      label?: string;
      dataset?: Record<string, string>;
      classes?: string[];
      icon?: string;
      type?: "button";
      disabled?: boolean;
    };
  }
}
