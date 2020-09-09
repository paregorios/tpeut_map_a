/**
 * @requires OpenLayers/Control/Permalink.js
 */

function getParameters(url) {
    // if no url specified, take it from the location bar
    url = url || window.location.href;

    //parse out parameters portion of url string
    var paramsString = "";
    if (OpenLayers.String.contains(url, '?')) {
        var start = url.indexOf('?') + 1;
        //var end = OpenLayers.String.contains(url, "#") ?
        //            url.indexOf('#') : url.length;
        var end = url.length;
        paramsString = url.substring(start, end);
    }
        
    var parameters = {};
    var pairs = paramsString.split(/[&;]/);
    for(var i=0, len=pairs.length; i<len; ++i) {
        var keyValue = pairs[i].split('=');
        if (keyValue[0]) {
            var key = decodeURIComponent(keyValue[0]);
            var value = keyValue[1] || ''; //empty string if no value

            //decode individual values
            value = value.split(",");
            for(var j=0, jlen=value.length; j<jlen; j++) {
                value[j] = decodeURIComponent(value[j]);
            }

            //if there's only one value, do not return as array                    
            if (value.length == 1) {
                value = value[0];
            }                
            
            parameters[key] = value;
         }
     }
    return parameters;
};

/**
 * Class: OpenLayers.Control.TPeutPermalink
 * The Permalink control is hyperlink that will return the user to the 
 * current map view. By default it is drawn in the lower right corner of the
 * map. The href is updated as the map is zoomed, panned and whilst layers
 * are switched.
 * `
 * Inherits from:
 *  - <OpenLayers.Control.Permalink>
 */
OpenLayers.Control.TPeutPermalink = OpenLayers.Class(OpenLayers.Control.Permalink, {

    /**
     * Method: updateLink 
     */
    updateLink: function() {
        var href = this.base;
        if (href.indexOf('#?') > 0) {
            href = href.substring( 0, href.indexOf('#?') );
        }

        href += '#?' + OpenLayers.Util.getParameterString(this.createParams());
        this.element.href = href;
    }, 

    /**
     * APIMethod: createParams
     * Creates the parameters that need to be encoded into the permalink url.
     * 
     * Parameters:
     * center - {<OpenLayers.LonLat>} center to encode in the permalink.
     *     Defaults to the current map center.
     * zoom - {Integer} zoom level to encode in the permalink. Defaults to the
     *     current map zoom level.
     * layers - {Array(<OpenLayers.Layer>)} layers to encode in the permalink.
     *     Defaults to the current map layers.
     * 
     * Returns:
     * {Object} Hash of parameters that will be url-encoded into the
     * permalink.
     */
    createParams: function(center, zoom, layers) {
        center = center || this.map.getCenter();
          
        var params = getParameters(this.base);
        
        // If there's still no center, map is not initialized yet. 
        // Break out of this function, and simply return the params from the
        // base link.
        if (center) { 

            //zoom
            params.z = zoom || this.map.getZoom(); 

            //lon,lat
            var lat = center.lat;
            var lon = center.lon;
                
            params.xy = Math.round(lon*100000)/100000 + ',' + Math.round(lat*100000)/100000;
            //layers        
            layers = layers || this.map.layers;  
            params.l = '';
            for (var i=0, len=layers.length; i<len; i++) {
                var layer = layers[i];
    
                if (layer.isBaseLayer) {
                    params.l += (layer == this.map.baseLayer) ? "B" : "0";
                } else {
                    params.l += (layer.getVisibility()) ? "T" : "F";           
                }
            }
        }

        return {z: params.z, xy: params.xy, l: params.l};
    }, 

    CLASS_NAME: "OpenLayers.Control.TPeutPermalink"
});

