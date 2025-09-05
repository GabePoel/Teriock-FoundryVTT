import * as content from "./content/_module.mjs";
import * as display from "./display/_module.mjs";
import * as index from "./index/_module.mjs";
import * as options from "./options/_module.mjs";
import * as system from "./system/_module.mjs";

/**
 * Main configuration object containing all system options, constants, and content.
 *
 * This object consolidates all configuration data from various constant files and content modules,
 * providing a centralized access point for system-wide settings and options.
 */
export const TERIOCK = {
  index: index,
  content: content,
  options: options,
  system: system,
  display: display,
};
