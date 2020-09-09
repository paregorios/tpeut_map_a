/* Copyright (c) 2009 Sean Gillies, published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Strategy.js
 *
 * Derived from Fixed.js
 */

/**
 * Class: OpenLayers.Strategy.SVG
 * A simple strategy that requests SVG once and never requests new data.
 *
 * Inherits from:
 *  - <OpenLayers.Strategy>
 */
OpenLayers.Strategy.SVG = OpenLayers.Class(OpenLayers.Strategy.Fixed, {
    
    /**
     * Constructor: OpenLayers.Strategy.SVG
     * Create a new fixed SVG strategy.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     */
    initialize: function(options) {
        OpenLayers.Strategy.Fixed.prototype.initialize.apply(this, [options]);
    },

    /**
     * APIMethod: destroy
     * Clean up the strategy.
     */
    destroy: function() {
        OpenLayers.Strategy.Fixed.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: load
     * Tells protocol to load data and unhooks the visibilitychanged event
     *
     * Parameters:
     * options - {Object} options to pass to protocol read.
     */
    load: function(options) {
        this.layer.events.triggerEvent("loadstart");
        this.layer.protocol.read(OpenLayers.Util.applyDefaults({
            callback: this.merge,
            scope: this
        }, options));
        this.layer.events.un({
            "visibilitychanged": this.load,
            scope: this
        });
    },

    /**
     * Method: merge
     * Add all features to the layer.
     */
    merge: function(resp) {
        var vectorRoot = this.layer.renderer.vectorRoot;
        if (vectorRoot.lastChild) {
            vectorRoot.removeChild(vectorRoot.lastChild);
        }
        try {
          vectorRoot.appendChild(resp.doc.lastChild.lastElementChild);
        }
        catch(e) {
          vectorRoot.appendChild(resp.doc.lastChild.lastElementChild.cloneNode(true));
        }
        this.layer.events.triggerEvent("loadend");
    },

    CLASS_NAME: "OpenLayers.Strategy.SVG"
});
