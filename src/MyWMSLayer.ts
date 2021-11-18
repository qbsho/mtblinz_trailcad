import * as L from 'leaflet';


interface catWmsProperties {
    GNR:String, // "24/1"
    KG:String,// "43105"
    MST:Number //1
    RSTATUS:String// "E"
}

export class MyWMSLayer extends L.TileLayer.WMS {


    url:string;
    constructor(urlTemplate: string, options: L.WMSOptions) {
        super(urlTemplate, options);
        this.url = urlTemplate;
        console.log('MyWMSLayer init', urlTemplate, options);
    }


    onAdd(map: L.Map): this {
        console.log("onAdd "+map.getCenter())
        // Triggered when the layer is added to a map.
        //   Register a click listener, then do all the upstream WMS things
        map.on('click',this.getFeatureInfo,this);
        return super.onAdd(map);
    }
    onRemove(map:L.Map):this{
        console.log("onRemove")
        map.off('click',this.getFeatureInfo,this);
        return super.onRemove(map);
    }


    async getFeatureInfo(evt:any) {
        
        var latlng = this._map.mouseEventToLatLng(evt.originalEvent);
        console.log(latlng.lat + ', ' + latlng.lng);

        console.log(latlng);

        const url = this.getFeatureInfoUrl(latlng);
        console.log(url);

        const response = await fetch(url).
        then(response => response.json())
        .then(data => data)
        .catch(err => {console.log(err)});

        console.log(response);

        this.showGetFeatureInfo(latlng,response);
            
    }
        
   // 21 GET https://data.bev.gv.at/geoserver/BEVdataKAT/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&BBOX=48.29584789989338844,14.33720762052877085,48.32033561488110252,14.36820762052876965&CRS=EPSG:4326&WIDTH=814&HEIGHT=643&LAYERS=DKM_GST&STYLES=&FORMAT=image/png&QUERY_LAYERS=DKM_GST&INFO_FORMAT=application/json&I=477&J=302
  //  https://data.bev.gv.at/geoserver/BEVdataKAT/ows?REQUEST=GetFeatureInfo&SERVICE=WMS&SRS=EPSG%3A4326&STYLES=undefined&TRANSPARENT=true&VERSION=1.1.1&FORMAT=image%2Fpng&BBOX=14.403183460235597%2C48.26912615010425%2C14.408837556838991%2C48.27238969442473&HEIGHT=914&WIDTH=1054&LAYERS=KAT_DKM_GST-NFL&QUERY_LAYERS=KAT_DKM_GST-NFL&INFO_FORMAT=text%2Fhtml&X=854&Y=312
    getFeatureInfoUrl(latlng:L.LatLngExpression):string {
        console.log("getFeatureInfoUrl");
        // Construct a GetFeatureInfo request URL given a point
        let point = this._map.latLngToContainerPoint(latlng); //TODO: how to handle zoom?
        const size = this._map.getSize();

        const params = {
                request: 'GetFeatureInfo',
                service: 'WMS',
                srs: 'EPSG:4326',
                transparent: this.wmsParams.transparent,
                version: this.wmsParams.version,
                format: this.wmsParams.format,
                bbox: this._map.getBounds().toBBoxString(),
                height: size.y,
                width: size.x,
                layers: this.wmsParams.layers,
                query_layers: this.wmsParams.layers,
                info_format: 'application/json'
            };
        //LAYERS=KAT_DKM_GST-NFL&STYLES=&FORMAT=geojson&DPI=72&MAP_RESOLUTION=72&FORMAT_OPTIONS=dpi:72&TRANSPARENT=TRUE
        //@ts-ignore
        params[params.version === '1.3.0' ? 'i' : 'x'] = Math.floor(point.x);
        //@ts-ignore
        params[params.version === '1.3.0' ? 'j' : 'y'] = Math.floor(point.y);

        return this.url + L.Util.getParamString(params, this.url, true);
    }

    showGetFeatureInfo( latlng:any, content: GeoJSON.FeatureCollection):void {
       
        let rows = content.features.map(feature => {
            if(!feature.properties){
                return;
            }
            //@ts-ignore
            const props:catWmsProperties =  feature.properties ;
            let row:String = `<tr><td>id: ${feature.id}</td></tr>`;
            row+=`<tr><td>GNR: ${props.GNR}</td></tr>`;
            row+= `<tr><td>KG: ${props.KG}</td></tr>`;
            row+=`<tr><td>MST: ${props.MST}</td></tr>`;
            row+= `<tr><td>RSTATUS: ${props.RSTATUS}</td></tr>`;
            return row;
        });

        // Otherwise show the content in a popup, or something.
        L.popup({ maxWidth: 800 })
            .setLatLng(latlng)
            .setContent(`<table>${rows}</table>`)
            .openOn(this._map);
            console.log(content);
        
    }
}


/*
 onAdd: function(map) {
        // Triggered when the layer is added to a map.
        //   Register a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onAdd.call(this, map);
        map.on('click', this.getFeatureInfo, this);
    },

    onRemove: function(map) {
        // Triggered when the layer is removed from a map.
        //   Unregister a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onRemove.call(this, map);
        map.off('click', this.getFeatureInfo, this);
    },

    getFeatureInfo: function(evt) {
        // Make an AJAX request to the server and hope for the best
        var url = this.getFeatureInfoUrl(evt.latlng),
            showResults = L.Util.bind(this.showGetFeatureInfo, this);
        $.ajax({
            url: url,
            success: function(data, status, xhr) {
                var err = typeof data === 'string' ? null : data;
                showResults(err, evt.latlng, data);
            },
            error: function(xhr, status, error) {
                showResults(error);
            }
        });
    },

    getFeatureInfoUrl: function(latlng) {
        // Construct a GetFeatureInfo request URL given a point
        var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
            size = this._map.getSize(),

            params = {
                request: 'GetFeatureInfo',
                service: 'WMS',
                srs: 'EPSG:4326',
                styles: this.wmsParams.styles,
                transparent: this.wmsParams.transparent,
                version: this.wmsParams.version,
                format: this.wmsParams.format,
                bbox: this._map.getBounds().toBBoxString(),
                height: size.y,
                width: size.x,
                layers: this.wmsParams.layers,
                query_layers: this.wmsParams.layers,
                info_format: 'text/html'
            };
        //LAYERS=KAT_DKM_GST-NFL&STYLES=&FORMAT=geojson&DPI=72&MAP_RESOLUTION=72&FORMAT_OPTIONS=dpi:72&TRANSPARENT=TRUE

        params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

        return this._url + L.Util.getParamString(params, this._url, true);
    },

    showGetFeatureInfo: function(err, latlng, content) {
        if (err) { console.log(err); return; } // do nothing if there's an error

        // Otherwise show the content in a popup, or something.
        L.popup({ maxWidth: 800 })
            .setLatLng(latlng)
            .setContent(content)
            .openOn(this._map);
    }
});

L.tileLayer.betterWms = function(url, options) {
    return new L.TileLayer.BetterWMS(url, options);
};
*/