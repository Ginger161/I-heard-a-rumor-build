// Explicit mapping between simulation state IDs (nigeriaData.ts) and the
// location IDs used by the @svg-maps/nigeria package. Only the mismatches are listed.
const DATA_TO_SVG: Record<string, string> = {
  akwa_ibom: 'akwa-ibom',
  cross_river: 'cross-river',
  nasarawa: 'nassarawa'
};

const SVG_TO_DATA: Record<string, string> = Object.fromEntries(
  Object.entries(DATA_TO_SVG).map(([data, svg]) => [svg, data])
);

export const toSvgId = (dataId: string): string => DATA_TO_SVG[dataId] ?? dataId;
export const toDataId = (svgId: string): string => SVG_TO_DATA[svgId] ?? svgId;
