import { preLocalizeObject } from "../../helpers/localization.mjs";
import { thumbnails } from "../display/_module.mjs";

/**
 * @enum {Teriock.Config.TerrainEntry}
 * @category Terrain
 */
// no sort
const terrainConfig = {
  aquatic: { img: thumbnails.manifest.ability.waterNative, label: "TERIOCK.TERRAIN.aquatic" },
  arctic: { img: thumbnails.manifest.ability.snowNative, label: "TERIOCK.TERRAIN.arctic" },
  coastal: { img: thumbnails.manifest.ability.seaActive, label: "TERIOCK.TERRAIN.coastal" },
  desert: { img: thumbnails.manifest.ability.desertNative, label: "TERIOCK.TERRAIN.desert" },
  forest: { img: thumbnails.manifest.ability.forestNative, label: "TERIOCK.TERRAIN.forest" },
  mountain: { img: thumbnails.manifest.ability.mountainNative, label: "TERIOCK.TERRAIN.mountain" },
  plains: { img: thumbnails.manifest.ability.plainsNative, label: "TERIOCK.TERRAIN.plains" },
  sky: { img: thumbnails.manifest.ability.skyNative, label: "TERIOCK.TERRAIN.sky" },
  swamp: { img: thumbnails.manifest.ability.swampNative, label: "TERIOCK.TERRAIN.swamp" },
  underground: { img: thumbnails.manifest.ability.earthNative, label: "TERIOCK.TERRAIN.underground" },
  volcanic: { img: thumbnails.manifest.ability.volcanoNative, label: "TERIOCK.TERRAIN.volcanic" },
};

export default terrainConfig;

preLocalizeObject("CONFIG.terrain", { keys: ["label"] });
