import { mixClasses } from "../../helpers/construction.mjs";
import { BaseApplicationMixin } from "./mixins/_module.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @extends {ApplicationV2}
 * @mixes HandlebarsApplicationMixin
 * @mixes BaseApplication
 */
export default class TeriockApplication
  extends mixClasses(ApplicationV2, HandlebarsApplicationMixin, BaseApplicationMixin)
{}
