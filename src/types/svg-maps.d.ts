declare module '@svg-maps/nigeria' {
  export interface SVGLocation {
    id: string;
    name: string;
    path: string;
  }

  export interface SVGMap {
    label: string;
    viewBox: string;
    locations: SVGLocation[];
  }

  const Nigeria: SVGMap;
  export default Nigeria;
}
