import { default as hold } from "../../../assets/thumbnails/hold/hold-images.json" with { type: "json" };
import { default as manifest } from "../../../assets/thumbnails/manifest.json" with { type: "json" };
import { systemPath } from "../../helpers/path.mjs";

export default { common: { uncertainty: systemPath("assets/thumbnails/document/uncertainty.svg") }, hold, manifest };
