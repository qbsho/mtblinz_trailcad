import './style.css'
import * as L from 'leaflet';
import 'leaflet-gpx';
import 'leaflet.markercluster'
import { MyWMSLayer } from './MyWMSLayer'




//just for testing
//import gpxUrl from './gpx/P4_Gravelrunde.gpx'
//import geoJson from './kat/pfenning_kat.json'
import municipal from './assets/kat/Oberoesterreich_BEV_VGD_50_LAM.json'




/*

async function fetchUrl(url:string) {
  const response = await fetch(url);
  const gpx = await response.json();
  return gpx;
}
*/



let map = new L.Map('map', {
  center: new L.LatLng(48.3072, 14.2857),
  zoom: 12
});

const panControl = L.control.scale({position: 'bottomright'});
map.addControl(panControl);



//set up map base map
const geolandbasemap = L.tileLayer('https://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png', {
  subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"],
  attribution: "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"
});


const geolandbasegelaende = L.tileLayer('https://{s}.wien.gv.at/basemap/bmapgelaende/grau/google3857/{z}/{y}/{x}.jpeg', {
  subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"],
  attribution: "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"
});


const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
  subdomains : ["a", "b", "c"], 
  attribution : "Datenquelle: <a href='https://www.openstreetmap.org'>© OpenStreetMap-Mitwirkende</a>"
});

const bmapoverlay = L.tileLayer
("https://{s}.wien.gv.at/basemap/bmapoverlay/normal/google3857/{z}/{y}/{x}.png", {subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"], attribution: "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"});
    
const bmapgrau = L.tileLayer
("https://{s}.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png", {subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"], attribution: "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"});
    
const bmaphidpi = L.tileLayer
("https://{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg", {subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"], attribution: "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"});
    
const bmapothofoto30cm = L.tileLayer
("https://{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg", {subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"], attribution: "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"});
  
const bmapoberflaeche = L.tileLayer("https://{s}.wien.gv.at/basemap/bmapgelaende/grau/google3857/{z}/{y}/{x}.jpeg", {
  subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"],
  attribution: `Datenquelle: <a href="www.basemap.at">basemap.at</a>`
});

const stamen_terrain = L.tileLayer("http://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png", {
  subdomains: ["a", "b", "c"],
  attribution: `Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.`
})
/*
let stravaCookies = new Map<string,string>([
  ["CloudFront-Signature", "crMlJZqZxDbfo0wihnESQc5jbCUOOqcpvrdsQriRcMQRFbK9bULgJDSpVchsUnHDClQG16Chmd~tQ6SqdAQNUTmzPLIfRmseORDJcHKhGulBAX0wkmLWBz0id76v6W0UHbAk3tjrR89jaE2wZk5lOImH90hd5hs~JV-63cXl8Bvib9XJrCY5Va7EUSz00wv1TPw9guRNs6wmBbiWN0uqrQbycejL3e-44~b18S6Hbp61LaeTxsCEZgmXVzSXioIcY6Edj7VoVngxh2jx~IRxt9GC0fDE0h2hTSardcnOwptAm~0jV4KuYMRt1PfglftDqJ4YbcFK3wgSjt2j-IowEA__~tQ6SqdAQNUTmzPLIfRmseORDJcHKhGulBAX0wkmLWBz0id76v6W0UHbAk3tjrR89jaE2wZk5lOImH90hd5hs~JV-63cXl8Bvib9XJrCY5Va7EUSz00wv1TPw9guRNs6wmBbiWN0uqrQbycejL3e-44~b18S6Hbp61LaeTxsCEZgmXVzSXioIcY6Edj7VoVngxh2jx~IRxt9GC0fDE0h2hTSardcnOwptAm~0jV4KuYMRt1PfglftDqJ4YbcFK3wgSjt2j-IowEA__"],
  ["CloudFront-Key-Pair-Id", "APKAIDPUN4QMG7VUQPSA"],
  ["CloudFront-Policy", "eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vaGVhdG1hcC1leHRlcm5hbC0qLnN0cmF2YS5jb20vKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTYzNzMzNTM2Nn0sIkRhdGVHcmVhdGVyVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNjM2MTExMzY2fX19XX0_"],
]);


//let url:string = `https://heatmap-external-{s}.strava.com/tiles-auth/ride/bluered/{z}/{x}/{y}@2x.png?Signature=${stravaCookies.get("CloudFront-Signature")}&Key-Pair-Id=${stravaCookies.get("CloudFront-Key-Pair-Id")}&Policy=${stravaCookies.get("CloudFront-Policy")}`;

let url:string ="https://heatmap-external-{s}.strava.com/tiles-auth/ride/hot/{z}/{x}/{y}@2x.png?Key-Pair-Id=APKAIDPUN4QMG7VUQPSA&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vaGVhdG1hcC1leHRlcm5hbC0qLnN0cmF2YS5jb20vKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTYzNzMzNTM2Nn0sIkRhdGVHcmVhdGVyVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNjM2MTExMzY2fX19XX0_&Signature=crMlJZqZxDbfo0wihnESQc5jbCUOOqcpvrdsQriRcMQRFbK9bULgJDSpVchsUnHDClQG16Chmd~tQ6SqdAQNUTmzPLIfRmseORDJcHKhGulBAX0wkmLWBz0id76v6W0UHbAk3tjrR89jaE2wZk5lOImH90hd5hs~JV-63cXl8Bvib9XJrCY5Va7EUSz00wv1TPw9guRNs6wmBbiWN0uqrQbycejL3e-44~b18S6Hbp61LaeTxsCEZgmXVzSXioIcY6Edj7VoVngxh2jx~IRxt9GC0fDE0h2hTSardcnOwptAm~0jV4KuYMRt1PfglftDqJ4YbcFK3wgSjt2j-IowEA__";
const strava_heatmap = L.tileLayer(url, {

});
*/


const strava_heatmap = L.tileLayer("https://strava-heatmap-proxy.mtblinz.workers.dev/global/orange/{z}/{x}/{y}@2x.png", {
  attribution: `Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.`
});




const bmaDKM = new MyWMSLayer("https://data.bev.gv.at/geoserver/BEVdataKAT/ows",
  {
    layers: 'KAT_DKM_GST-NFL',
    transparent: true,
    format: 'image/png'
  });


  map.addLayer(bmapgrau);//http://leafletjs.com/reference-1.3.0.html#map-addlayer



  let nbLinz = new Map<string,string>([
    ["Steyregg","#cb4335"],
    ["Linz","#DAF7A6"],
    ["Leonding", "#b2d8d8"],
    ["Lichtenberg","#004c4c"],
    ["Altenberg bei Linz","#008080"],
    ["Luftenberg an der Donau","#FF5733"],
    ["Puchenau","#C70039"],
    ["Wilhering","#b6ccfe"],
    ["Engerwitzdorf","#FFD448"],
    ["Gramastetten","#FFC300"],
    ["Kirchschlag bei Linz","#FF9272"],
    ]);


     //@ts-ignore
  const filteredMunicipal:FeatureCollection =  municipal.features.filter(x => Array.from( nbLinz.keys()).includes(x.properties.PG));

  console.log(filteredMunicipal.features);

  /*
   //@ts-ignore
  const uniqueGKZ = Array.from(new Set(filteredMunicipal.map((item: any) => item.properties.GKZ)))
  const uniqueGKZColors = uniqueGKZ.map((x)=>  {
    const uniqueGKZColor = {
      gkz: x,
      color: 'hsla(' + (Math.random() * 360) + ', 80%, 50%, 1)',
      weight: 0,
      opacity: 1,
      dashArray: '0',
      fillOpacity: 0.7,
    };
    return uniqueGKZColor;
  });
*/
  
   //@ts-ignore
   const municalLayer = L.geoJSON(filteredMunicipal, {
      style: function(feature) { //@ts-ignore
        return {
             //@ts-ignore
          color: nbLinz.get(feature.properties.PG),
          fillOpacity: 0.6,
          stroke:false
        };   
      },
      onEachFeature(feature, layer) {
        layer.on('mouseover',  ()=> {
          this.style = ()=>{
              return {color:"red"};
          }
         console.log(feature);
        });
        layer.on('mouseout', () =>{
          console.log("mouseout");
        });
        layer.on('click', () => {
    
        });
    }
  }).bindPopup(function (layer) {
       //@ts-ignore
    return layer.feature.properties.PG;
  }); 


  //@ts-ignore
  let legend = L.control({position: 'bottomleft'});
         //@ts-ignore
  legend.onAdd=(map:L.Map)=>{
      var div=L.DomUtil.create('div','legend');
    
      div.innerHTML='<div><b>Legend</b></div';

      nbLinz.forEach((value: string, key: string) => {
        div.innerHTML+='<i style="background:'+value+'">&nbsp;</i>&nbsp;&nbsp;'
        +key+'<br/>';
    });

  
      return div;
  }
 
  legend.addTo(map);

  /* start presentation part */

  let gpx_granitland:string[] = [
    "./gpx/official/granitland/10_Neufeldenrunde.gpx",
    "./gpx/official/granitland/1_GrosseGranitlandrunde_20210524.gpx",
    "./gpx/official/granitland/2_Donau_Ameisbergrunde.gpx",
    "./gpx/official/granitland/3_Grenzlandrunde_20210524.gpx",
    "./gpx/official/granitland/4_HansberglandNord.gpx",
    "./gpx/official/granitland/5_HansberglandSuedrunde.gpx",
    "./gpx/official/granitland/6_Muehltalrunde.gpx",
    "./gpx/official/granitland/8_Kirchbergrunde.gpx",
    "./gpx/official/granitland/9_Altenfeldenrunde.gpx",
    "./gpx/official/granitland/11_St.Martinrunde.gpx",
    "./gpx/official/granitland/12__Weberlandrunde.gpx",
    "./gpx/official/granitland/A_Granitland_Sued.gpx",
    "./gpx/official/granitland/B_Linzer_Runde.gpx",
    "./gpx/official/granitland/C_EidenbergerAlm_Runde.gpx",
    "./gpx/official/granitland/D_Donau_GIS_Runde.gpx",
    "./gpx/official/granitland/E_Rodltalrunde.gpx"
    ]

    let gpx_sterngartl:string[] =[
    "./gpx/official/sterngartl/sterngartl-gusental-mtb--region-gusental-sued.gpx",
    "./gpx/official/sterngartl/sterngartl-gusental-mtb--region-gusental-mitte.gpx",
    "./gpx/official/sterngartl/sterngartl-gusental-mtb--region-gusental-nord.gpx",
    "./gpx/official/sterngartl/sterngartl-gusental-mtb--region-gusental-runde.gpx",
    "./gpx/official/sterngartl/sterngartl-gusental-mtb--region-sterngartl-gusental.gpx",
    "./gpx/official/sterngartl/sterngartl-gusental-mtb--region-sterngartl-mitte.gpx",
    "./gpx/official/sterngartl/sterngartl-gusental-mtb--region-sterngartl-nord.gpx",
    "./gpx/official/sterngartl/sterngartl-gusental-mtb--region-sterngartl-runde.gpx",
    "./gpx/official/sterngartl/sterngartl-gusental-mtb--region-sterngartl-sued.gpx"
    ]

    let gpx_linz:string[] =[
    "./gpx/official/linz/L1b-S1.gpx",
    "./gpx/official/linz/L1a-S2.gpx",
    "./gpx/official/linz/L1a-S1.gpx",
    "./gpx/official/linz/L1-S3.gpx",
    "./gpx/official/linz/L1-S4.gpx",
    "./gpx/official/linz/L1-S2.gpx",
    "./gpx/official/linz/L1-S1.gpx"
    ]

    let gpx_steyregg:string[] =[
    "./gpx/old/P3.gpx",
    "./gpx/old/P2.gpx",
    "./gpx/old/P1.gpx"
    ]
    
    
    let gpx_established:string[]=[
      "./gpx/established/strava.segments.17528197.KBW-Wurzeloarsch-länger.gpx",
      "./gpx/established/oberbairing-bikepark.gpx",
      "./gpx/established/oberbairing-magda.gpx",
      "./gpx/established/oberbairing-riverbank.gpx",
      "./gpx/established/oberbairing-uphill.gpx",
      "./gpx/established/strava.segments.11858013.Final-Climb-KBW.gpx",
      "./gpx/established/strava.segments.11869706.Oberbairing-Zaun.gpx",
      "./gpx/established/strava.segments.17510659.Vertikal-zur-PEB.gpx",
      "./gpx/established/strava.segments.23625916.Baumslalom-Trail.gpx",
      "./gpx/established/strava.segments.24403041.nach-Wurzeloarsch-bis-Aichberg-owi.gpx",
      "./gpx/established/k1.gpx",
      "./gpx/established/k2.gpx",
      "./gpx/established/k3.gpx",
      "./gpx/established/pipi.gpx",
      "./gpx/established/Koglerau_D_rnberg.gpx",
      "./gpx/established/Koglerau_Hausrunde.gpx",
      "./gpx/established/Koglerau_mit_K_glerhof.gpx",
      "./gpx/established/Koglerau_Oheim.gpx",
      "./gpx/established/Koglerau_Puchenau.gpx"
    ];

    let gpx_mtblinz:string[] =[
      "./gpx/official/steyregg/mtb_linz_pfenning.gpx"
    ]
    
   let granitlandOverlay:L.LayerGroup = new L.LayerGroup();
   let sterngartlOverlay:L.LayerGroup = new L.LayerGroup();
   let linzOverlay:L.LayerGroup = new L.LayerGroup();
   let steyreggOverlay:L.LayerGroup = new L.LayerGroup();
   let mtbLinzOverlay:L.LayerGroup = new L.LayerGroup();
   let unofficialOverlay:L.LayerGroup = new L.LayerGroup();





   let addGPXLayer = function (urls: string[], colorCode: string, overlay:L.LayerGroup): number {

    let totalDistance:number=0;
    urls.forEach(x=>{
      const tmpGpx:L.GPX= new L.GPX(x, {
        async: true,
        polyline_options: {
          color: colorCode,
          opacity: 0.85,
          weight: 2,
          lineCap: 'round'
        },
        marker_options: {
          startIconUrl: "",
          endIconUrl: "",
          shadowUrl: ""
        }
      } 
        ).on('loaded', function(e) {
          totalDistance+=e.target.get_distance();
          e.target.bindPopup(e.target.get_name()).openPopup();

      });
      tmpGpx.addTo(overlay);
    });
    return totalDistance;
  };

let distances = new Map<string,number>();
distances.set("Granitland",addGPXLayer(gpx_granitland,"#219ebc",granitlandOverlay));
distances.set("Sterngartl",addGPXLayer(gpx_sterngartl,"#045174",sterngartlOverlay));
distances.set("Linz",addGPXLayer(gpx_linz,"#fb8500",linzOverlay));
distances.set("Steyregg",addGPXLayer(gpx_steyregg,"#ffb703",steyreggOverlay));
distances.set("Linz gewachsen",addGPXLayer(gpx_established,"#039be5",unofficialOverlay));
distances.set("Steyregg (neu)",addGPXLayer(gpx_mtblinz,"#026899",mtbLinzOverlay));

 // let mtbLinz = addGPXLayer(gpx_mtblinz,"#7EB5D6",mtbLinzOverlay);
addGPXLayer(gpx_established,"#ad1457",unofficialOverlay);
  

  /* end presentation part */

/*
  let markers = L.markerClusterGroup({
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: false
  });
  markers.addLayer(L.marker(new L.LatLng(48.3072, 14.2857)));
  markers.addLayer(L.marker(new L.LatLng(48.3022, 14.2857)));
  map.addLayer(markers);
*/

  let myMapControl= L.control.layers({//http://leafletjs.com/reference-1.3.0.html#control-layers-l-control-layers
      "Openstreetmap":osm, 
      "Geoland Basemap":geolandbasemap, 
      "BM Schummerung": geolandbasegelaende,
      "BM Fläche":bmapoberflaeche,
      "Terrain": stamen_terrain,
      "Grau":bmapgrau, 
      "HIDDPI": bmaphidpi, 
      "Orthophoto": bmapothofoto30cm,
      "DKM": bmaDKM},
                                    {
      "Granitland":granitlandOverlay,
      "Linz":linzOverlay,
      "Sterngartl":sterngartlOverlay,
      "Steyregg":steyreggOverlay,
      "Gewachsene":unofficialOverlay,
      "MTB Linz": mtbLinzOverlay,
      "Gemeinde Overlay" :municalLayer,
      "basemap.at Overlay": bmapoverlay,
      "Strava Heatmap":strava_heatmap
    
  },
  {
      collapsed:true//http:leafletjs.com/reference-1.3.0.html#control-layers-collapsed
  }
  )




  /*
Promise.all([fetchUrl('./kat/pfenning_kat.geojson'),fetchUrl('./gpx/P4_Gravelrunde.gpx')]).then( (cat:GeoJSON, gpx:L.GPX)=>{
  new MyTrackInterSector(cat,gpx);
  new L.GPX('./gpx/P4_Gravelrunde.gpx', {async: true}).on('loaded', function(e) {
    map.fitBounds(e.target.getBounds());
  }).addTo(map);
});
*/

  map.addControl(myMapControl);



/*
  randomColor({
    count: 10,
    hue: 'green'
 });
*/


