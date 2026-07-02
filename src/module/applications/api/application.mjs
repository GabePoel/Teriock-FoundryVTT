import { mixClasses } from "../../helpers/construction.mjs";
import BaseApplicationMixin from "./base-application-mixin.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @extends {ApplicationV2}
 * @mixes HandlebarsApplicationMixin
 * @mixes BaseApplication
 */
export default class TeriockApplication
  extends mixClasses(ApplicationV2, HandlebarsApplicationMixin, BaseApplicationMixin)
{}
