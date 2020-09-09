/* Copyright (c) NYU Institute for the Study of the Ancient World
 * Copyright (c) UNC Chapel Hill University Library
 * Authors: Hugh A. Cayless, J. Clifford Dyer, Sean Gillies, Ryan Horne
 */

/**
 * @requires OpenLayers/Layer/Grid.js
 * @requires OpenLayers/Tile/Image.js
 */

/**
 * Class: OpenLayers.Layer.OpenURL
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Grid>
 */
OpenLayers.Layer.OpenURL = OpenLayers.Class(OpenLayers.Layer.Grid, {

    /**
     * APIProperty: isBaseLayer
     * {Boolean}
     */
    isBaseLayer: true,

    /**
     * Property: extent
     * {<OpenLayers.Bounds>} The image bounds in map units.  This extent will
     *     also be used as the default maxExtent for the layer.  If you wish
     *     to have a maxExtent that is different than the image extent, set the
     *     maxExtent property of the options argument (as with any other layer).
     */
    extent: null,

    /**
     * Property: size
     * {<OpenLayers.Size>} The image size in pixels
     */
    size: null,

    /** Djatoka Parameters **/
    url_ver: 'Z39.88-2004',
    rft_id: null,
    svc_id: "info:lanl-repo/svc/getRegion",
    svc_val_fmt: "info:ofi/fmt:kev:mtx:jpeg2000",
    format: null,

    /**
     * Constructor: OpenLayers.Layer.OpenURL
     * 
     * Parameters:
     * name - {String}
     * url - {String}
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, url, rft_id, extent, size, options) {
        this.url = url;
        this.rft_id = rft_id;
        this.extent = extent;
        this.maxExtent = extent;
        this.size = size;
        this.format = 'image/jpeg';

        var newArguments = [];
        newArguments.push(name, url, {}, options);
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
        
        this.format = options.format;

        // Width and height in "world" units
        this.mw = this.extent.right - this.extent.left;
        this.mh = this.extent.top - this.extent.bottom;

        // Image resolution (world units per pixel)
        // We're constraining ourselves to square pixels here
        this.imageResolution = this.mw/this.size.w;
      
        this.requestBase = OpenLayers.Layer.OpenURL.djatokaURL 
          + "?url_ver=" + this.url_ver 
          + "&rft_id=" + this.rft_id 
          + "&svc_id=" + this.svc_id 
          + "&svc_val_fmt=" + this.svc_val_fmt 
          + "&svc.format=" + this.format
          + "&svc.rotate=0";
    },    

    /**
     * APIMethod: clone
     * 
     * Parameters:
     * obj - {Object}
     * 
     * Returns:
     * {<OpenLayers.Layer.OpenURL>} An exact clone of this <OpenLayers.Layer.OpenURL>
     */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new OpenLayers.Layer.OpenURL(
                    this.name, this.url, this.rft_id, this.extent, this.size, 
                    this.options);
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here
        return obj;
    },    
    
    /**
     * Method: getURL
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * 
     * Returns:
     * {String} A string with the layer's url and parameters and also the 
     *          passed-in bounds and appropriate tile size specified as 
     *          parameters
     * 
     * Djatoka has no geo-referencing, so the conversion from map to image
     * coordinates must be done here.
     */
    getURL: function (bounds) {  
        var xoff = (bounds.left - this.extent.left)/this.mw;
        var yoff = (this.extent.top - bounds.top)/this.mh;
        if (xoff < 0){
        xoff = 0;
        yoff = 0;
        }
        var r = this.resolutions[this.map.zoom];
        var h = Math.round(this.tileSize.h*r/this.imageResolution);
        var w = Math.round(this.tileSize.w*r/this.imageResolution);
       return this.url + this.requestBase
          + "&svc.region=" + Math.abs(yoff.toFixed(7)) + "," + xoff.toFixed(7) 
          + "," +  h + "," + w
          + "&svc.scale=" + this.tileSize.h + ',' + this.tileSize.w;
    
    },

    /**
     * Method: addTile
     * addTile creates a tile, initializes it, and adds it to the layer div. 
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     * position - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {<OpenLayers.Tile.Image>} The added OpenLayers.Tile.Image
     */ 
    addTile:function(bounds, position) {
        var url = this.getURL(bounds);
        return new OpenLayers.Tile.Image(this, position, bounds, 
                                             url, this.tileSize);
    },

    CLASS_NAME: "OpenLayers.Layer.OpenURL"
});

OpenLayers.Layer.OpenURL.djatokaURL = 'adore-djatoka/resolver';
