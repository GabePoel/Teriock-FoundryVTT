import { default as hold } from "../../../icons/hold/hold-images.json" with { type: "json" };
import { default as manifest } from "../../../icons/icon-manifest.json" with { type: "json" };
import { systemPath } from "../../helpers/path.mjs";

export default { common: { uncertainty: systemPath("icons/documents/uncertainty.svg") }, hold, manifest };
