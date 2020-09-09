/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Renderer/Elements.js
 */

/**
 * Class: OpenLayers.Renderer.StaticSVG
 * 
 * Inherits:
 *  - <OpenLayers.Renderer.Elements>
 */
OpenLayers.Renderer.StaticSVG = OpenLayers.Class(OpenLayers.Renderer.Elements, {

    /** 
     * Property: xmlns
     * {String}
     */
    xmlns: "http://www.w3.org/2000/svg",
    
    /**
     * Property: xlinkns
     * {String}
     */
    xlinkns: "http://www.w3.org/1999/xlink",

    /**
     * Constant: MAX_PIXEL
     * {Integer} Firefox has a limitation where values larger or smaller than  
     *           about 15000 in an SVG document lock the browser up. This 
     *           works around it.
     */
    MAX_PIXEL: 15000,

    /**
     * Property: symbolSize
     * {Object} Cache for symbol sizes according to their svg coordinate space
     */
    symbolSize: {},
    
    /**
     * Property: isGecko
     * {Boolean}
     */
    isGecko: null,

    /** TODO: Don't hard code this **/
    maxExtent: new OpenLayers.Bounds(0, 0, 435.15277777778, 31.680555555556),

    /**
     * Constructor: OpenLayers.Renderer.SVG
     * 
     * Parameters:
     * containerID - {String}
     */
    initialize: function(containerID) {
        if (!this.supported()) { 
            return; 
        }
        OpenLayers.Renderer.Elements.prototype.initialize.apply(this, 
                                                                arguments);
        this.isGecko = (navigator.userAgent.toLowerCase().indexOf("gecko/") != -1);
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        OpenLayers.Renderer.Elements.prototype.destroy.apply(this, arguments);
    },
    
    /**
     * APIMethod: supported
     * 
     * Returns:
     * {Boolean} Whether or not the browser supports the SVG renderer
     */
    supported: function() {
        var svgFeature = "http://www.w3.org/TR/SVG11/feature#";
        return (document.implementation && 
           (document.implementation.hasFeature("org.w3c.svg", "1.0") || 
            document.implementation.hasFeature(svgFeature + "SVG", "1.1") || 
            document.implementation.hasFeature(svgFeature + "BasicStructure", "1.1") ));
    },    

    /**
     * Method: setExtent
     * 
     * Parameters:
     * extent - {<OpenLayers.Bounds>}
     * resolutionChanged - {Boolean}
     * 
     * Returns:
     * {Boolean} true to notify the layer that the new extent does not exceed
     *     the coordinate range, and the features will not need to be redrawn.
     *     False otherwise.
     */
    setExtent: function(extent, resolutionChanged) {
        var resolutionCached = this.resolution;
        OpenLayers.Renderer.Elements.prototype.setExtent.apply(this, 
                                                               arguments);
        var resolution = this.getResolution();
        var left = -extent.left / resolution;
        var top = extent.top / resolution;
        if (resolutionChanged) {
            this.left = left;
            this.top = top;
        }
        var box = [extent.left, this.maxExtent.top - extent.top, this.map.size.w * resolution, this.map.size.h * resolution];
        // var box = [extent.left, this.map.maxExtent.top - extent.top, mapPanel.el.getWidth() * resolution, mapPanel.el.getHeight() * resolution];
        var extentString = box.join(' ');
        this.rendererRoot.setAttributeNS(null, "viewBox", extentString);
        return true;
    },
    
    /**
     * Method: setSize
     * Sets the size of the drawing surface.
     * 
     * Parameters:
     * size - {<OpenLayers.Size>} The size of the drawing surface
     */
    setSize: function(size) {
        OpenLayers.Renderer.prototype.setSize.apply(this, arguments);
        
        this.rendererRoot.setAttributeNS(null, "width", this.size.w);
        this.rendererRoot.setAttributeNS(null, "height", this.size.h);
    },

    /** 
     * Method: createNode
     * 
     * Parameters:
     * type - {String} Kind of node to draw
     * id - {String} Id for node
     * 
     * Returns:
     * {DOMElement} A new node of the given type and id
     */
    createNode: function(type, id) {
        var node = document.createElementNS(this.xmlns, type);
        if (id) {
            node.setAttributeNS(null, "id", id);
        }
        return node;    
    },
    
    /** 
     * Method: nodeTypeCompare
     * 
     * Parameters:
     * node - {SVGDomElement} An SVG element
     * type - {String} Kind of node
     * 
     * Returns:
     * {Boolean} Whether or not the specified node is of the specified type
     */
    nodeTypeCompare: function(node, type) {
        return (type == node.nodeName);
    },
   
    /**
     * Method: createRenderRoot
     * 
     * Returns:
     * {DOMElement} The specific render engine's root element
     */
    createRenderRoot: function() {
        return this.nodeFactory(this.container.id + "_svgRoot", "svg");
    },

    /**
     * Method: createRoot
     * 
     * Parameter:
     * suffix - {String} suffix to append to the id
     * 
     * Returns:
     * {DOMElement}
     */
    createRoot: function(suffix) {
        return this.nodeFactory(this.container.id + suffix, "g");
    },

    /**
     * Method: createDefs
     *
     * Returns:
     * {DOMElement} The element to which we'll add the symbol definitions
     */
    createDefs: function() {
        var defs = this.nodeFactory(this.container.id + "_defs", "defs");
        this.rendererRoot.appendChild(defs);
        return defs;
    },

    CLASS_NAME: "OpenLayers.Renderer.StaticSVG"
});


