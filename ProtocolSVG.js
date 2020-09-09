/* Copyright (c) 2009 Sean Gillies, published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Protocol.js
 */

/**
 * Class: OpenLayers.Protocol.SVG
 * A read-only HTTP protocol for SVG layers.
 *
 * Inherits from:
 *  - <OpenLayers.Protocol>
 */
OpenLayers.Protocol.SVG = OpenLayers.Class(OpenLayers.Protocol.HTTP, {

    /**
     * APIMethod: read
     * Construct a request for reading new features.
     *
     * Parameters:
     * options - {Object} Optional object for configuring the request.
     *     This object is modified and should not be reused.
     *
     * Valid options:
     * url - {String} Url for the request.
     * params - {Object} Parameters to get serialized as a query string.
     * headers - {Object} Headers to be set on the request.
     * filter - {<OpenLayers.Filter.BBOX>} If a bbox filter is sent, it will be
     *     serialized according to the OpenSearch Geo extension
     *     (bbox=minx,miny,maxx,maxy).  Note that a BBOX filter as the child
     *     of a logical filter will not be serialized.
     * readWithPOST - {Boolean} If the request should be done with POST.
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} A response object, whose "priv" property
     *     references the HTTP request, this object is also passed to the
     *     callback function when the request completes, its "features" property
     *     is then populated with the the features received from the server.
     */
    read: function(options) {
        options = OpenLayers.Util.applyDefaults(options, this.options);
        var resp = new OpenLayers.Protocol.Response({requestType: "read"});
        resp.priv = OpenLayers.Request.GET({
            url: options.url,
            callback: this.createCallback(this.handleRead, resp, options),
            params: options.params,
            headers: options.headers
        });
        return resp;
    },

    /**
     * Method: handleResponse
     * Called by CRUD specific handlers.
     *
     * Parameters:
     * resp - {<OpenLayers.Protocol.Response>} The response object to pass to
     *     any user callback.
     * options - {Object} The user options passed to the create, read, update,
     *     or delete call.
     */
    handleResponse: function(resp, options) {
        var request = resp.priv;
        if (options.callback) {
            if (request.status >= 200 && request.status < 300) {
                resp.doc = request.responseXML;
                resp.code = OpenLayers.Protocol.Response.SUCCESS;
            } else {
                // failure
                resp.code = OpenLayers.Protocol.Response.FAILURE;
            }
            options.callback.call(options.scope, resp);
        }
    },

    CLASS_NAME: "OpenLayers.Protocol.SVG" 
});
