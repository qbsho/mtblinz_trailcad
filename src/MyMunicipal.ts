import * as L from 'leaflet';

interface GKZColor {
    gkz:string,
    color:string
  }


export class MyGeoJSONOverlay extends L.GeoJSON{



    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
      }

}
  
  
  
  
   //@ts-ignore
  const uniqueGKZ = Array.from(new Set(municipal.features.map((item: any) => item.properties.GKZ)))
  const uniqueGKZColors = uniqueGKZ.map((x)=>  {
    const uniqueGKZColor = {
      gkz: x,
      color: getRandomColor()
    };
    return uniqueGKZColor;
  });
  
  const FALinz:FeatureCollection =  municipal.features.filter(x => {
    return x.properties.VA === "Linz";
  });
  console.log(FALinz);
  
   //@ts-ignore
    L.geoJSON(FALinz, {
      style: function(feature) { //@ts-ignore
        return {color: uniqueGKZColors.find(x=>x.gkz === feature.properties.GKZ)?.color};   
      }
  });