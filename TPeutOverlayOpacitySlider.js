/* Copyright (C) 2008-2009 The Open Source Geospatial Foundation
 * Published under the BSD license.
 * See http://geoext.org/svn/geoext/core/trunk/license.txt for the full text
 * of the license.
 */

/**
 * @include GeoExt/widgets/tips/LayerOpacitySliderTip.js
 */

/** api: (define)
 *  module = GeoExt
 *  class = LayerOpacitySlider
 *  base_link = `Ext.Slider <http://extjs.com/deploy/dev/docs/?class=Ext.Slider>`_
 */
Ext.namespace("GeoExt");

/** api: example
 *  Sample code to render a slider outside the map viewport:
 *
 *  .. code-block:: javascript
 *
 *      var slider = new GeoExt.LayerOpacitySlider({
 *          renderTo: document.body,
 *          width: 200,
 *          layer: layer
 *      });
 *
 *  Sample code to add a slider to a map panel:
 *
 *  .. code-block:: javascript
 *
 *      var layer = new OpenLayers.Layer.WMS(
 *          "Global Imagery",
 *          "http://maps.opengeo.org/geowebcache/service/wms",
 *          {layers: "bluemarble"}
 *      );
 *      var panel = new GeoExt.MapPanel({
 *          renderTo: document.body,
 *          height: 300,
 *          width: 400,
 *          map: {
 *              controls: [new OpenLayers.Control.Navigation()]
 *          },
 *          layers: [layer],
 *          extent: [-5, 35, 15, 55],
 *          items: [{
 *              xtype: "gx_opacityslider",
 *              layer: layer,
 *              aggressive: true,
 *              vertical: true,
 *              height: 100,
 *              x: 10,
 *              y: 20
 *          }]
 *      });
 */

/** api: constructor
 *  .. class:: LayerOpacitySlider(config)
 *
 *      Create a slider for controlling a layer's opacity.
 */
GeoExt.TPeutOverlayOpacitySlider = Ext.extend(GeoExt.LayerOpacitySlider, {

    /** api: config[layer]
     *  ``OpenLayers.Layer`` or :class:`GeoExt.data.LayerRecord`
     *  The layer this slider changes the opacity of. (required)
     */
    /** private: property[layer]
     *  ``OpenLayers.Layer``
     */
    layers: null,

    /** api: config[delay]
     *  ``Number`` Time in milliseconds before setting the opacity value to the
     *  layer. If the value change again within that time, the original value
     *  is not set. Only applicable if aggressive is true.
     */
    delay: 5,

    /** api: config[changeVisibilityDelay]
     *  ``Number`` Time in milliseconds before changing the layer's visibility.
     *  If the value changes again within that time, the layer's visibility
     *  change does not occur. Only applicable if changeVisibility is true.
     *  Defaults to 5.
     */
    changeVisibilityDelay: 5,

    /** api: config[aggressive]
     *  ``Boolean``
     *  If set to true, the opacity is changed as soon as the thumb is moved.
     *  Otherwise when the thumb is released (default).
     */
    aggressive: false,

    /** api: config[value]
     *  ``Number``
     *  The value to initialize the slider with. This value is
     *  taken into account only if the layer's opacity is null.
     *  If the layer's opacity is null and this value is not
     *  defined in the config object then the slider initializes
     *  it to the max value.
     */
    value: null,

    /** private: method[constructor]
     *  Construct the component.
     */
    constructor: function(config) {
        if (config.layers) {
            this.layers = config.layers;
            delete config.layers;
        }
        GeoExt.LayerOpacitySlider.superclass.constructor.call(this, config);
    },

    /** private: method[initComponent]
     *  Initialize the component.
     */
    initComponent: function() {
        // set the slider initial value
        /*if (this.layer && this.layer.opacity !== null) {
            this.value = parseInt(
                this.layer.opacity * (this.maxValue - this.minValue)
            );
        } else if (this.value == null) {
            this.value = this.maxValue;
        }*/
        this.value = 100;
        GeoExt.LayerOpacitySlider.superclass.initComponent.call(this);
        if (this.aggressive === true) {
            this.on('change', this.changeLayerOpacity, this, {
                buffer: this.delay
            });
        } else {
            this.on('changecomplete', this.changeLayerOpacity, this);
        }
    },

    /** private: method[changeLayerOpacity]
     *  :param slider: :class:`GeoExt.LayerOpacitySlider`
     *  :param value: ``Number`` The slider value
     *
     *  Updates the ``OpenLayers.Layer`` opacity value.
     */
    changeLayerOpacity: function(slider, value) {
        if (this.layers) {
            for (var i=0, n=this.layers.length; i<n; i++) {
               this.layers[i].setOpacity(value / 100.0);
            }
        }
    },
});

