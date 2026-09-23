import { mixClasses } from "../../../../helpers/construction.mjs";
import { WikiSystemMixin } from "../../mixins/_module.mjs";
import BasePageSystem from "../base-page-system/base-page-system.mjs";

/**
 * Rules text for a weapon fighting style.
 * @mixes WikiSystem
 */
export default class StyleSystem extends mixClasses(BasePageSystem, WikiSystemMixin) {}
