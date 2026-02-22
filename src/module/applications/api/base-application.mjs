import { mix } from "../../helpers/utils.mjs";
import { BaseApplicationMixin } from "../shared/mixins/_module.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

//noinspection JSClosureCompilerSyntax
/**
 * @extends {ApplicationV2}
 * @mixes HandlebarsApplicationMixin
 * @mixes BaseApplication
 */
export default class TeriockBaseApplication extends mix(
  ApplicationV2,
  HandlebarsApplicationMixin,
  BaseApplicationMixin,
) {}
