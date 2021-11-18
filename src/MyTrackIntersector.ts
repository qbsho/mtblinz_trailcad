import * as L from 'leaflet';
import * as GPX from 'leaflet-gpx'
import * as toGeoJSON from '@tmcw/togeojson'
import * as turf from '@turf/turf'


export class MyTrackInterSector  {

    geoTrack:GeoJSON.FeatureCollection;
    geoShapes:GeoJSON.FeatureCollection;
    shapedTrack:GeoJSON.FeatureCollection;

    constructor(shapes:GeoJSON.FeatureCollection,track:L.GPX){
        this.geoTrack = this.transform(track);
        this.geoShapes = shapes;
        this.shapedTrack = turf.featureCollection([]);

    }


    analyse(){

        this.geoShapes.features.forEach((p, i) => {
            let line:any =this.geoTrack.features[0].geometry;

            let intersectionPoints = turf.lineIntersect(line, p.geometry);

            if (intersectionPoints.features.length > 0) {

                let intersectionPointsArray = intersectionPoints.features.map(d => {
                    return d.geometry.coordinates
                });

               // L.geoJSON(intersectionPointsArray).addTo(map);
               // L.geoJSON(p).addTo(map);

                // console.log(intersectionPointsArray)

                //let isIn = turf.booleanPointInPolygon(turf.point(line[0]), p)

                // if (isIn) {
                //    L.geoJSON(p).addTo(map);
                // }

                let segmentSum = 0;

                if (intersectionPointsArray.length >= 2) {
                    //  let intersection = turf.lineSlice(turf.point(intersectionPointsArray[0]), turf.point(intersectionPointsArray[1]), line);
                    var myStyle2 = {
                        "color": "#FF0000",
                        "weight": 5,
                        "opacity": 0.65
                    };

                    intersectionPointsArray.forEach(function(ft, ind) {

                        if (ind % 2 === 0 && (ind + 1) < intersectionPointsArray.length) {
                            let segment = turf.lineSlice(turf.point(intersectionPointsArray[ind]), turf.point(intersectionPointsArray[ind + 1]), line);

                            segmentSum = segmentSum + turf.length(segment, {
                                units: 'kilometers'
                            });
                            let tmpfeature = turf.feature(segment,{
                                style:myStyle2
                            });
                            this.shapedTrack['Features'].push(tmpfeature);


                            //this.shapedTrack.features.add(segment);
                       /*     L.geoJSON(segment, {
                                style: myStyle2
                            }).addTo(map);
                            */
                        }
                    });
                }
                console.log(p.properties)
                console.log(segmentSum);
            }


        });

    }

    transform(myTrack:any):GeoJSON.FeatureCollection{
        return toGeoJSON.gpx(myTrack);  
    }

} 