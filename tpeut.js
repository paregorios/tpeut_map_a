Ext.BLANK_IMAGE_URL = 'ext-2.3.0/resources/images/default/s.gif';

var layers, map, base, mosaic, panel1, slider;
var mapwin, mapPanel, tree;
var stores = {};
var tree_kids = [];

/* Mapping of SVG files to layers */
var overlayDefs = {
  'Coastline (blue)': "data/shoreline.svg",
  	'Grid framework': "data/gridlines.svg",
    'Grid labels': "data/gridnumbers.svg",
  'Island numbers': "data/islandnumbers.svg",
  'Lakes, area (blue fill)': "data/lakesoutline.svg",
  'Lake and marsh numbers (blue)': "data/lakenumbers.svg",
   'Mountains, brown outline (no fill)': "data/mountainsnofill.svg",
   'Mountains, brown fill': "data/mountainsbrown.svg",
    'Mountains, pink fill': "data/mountainspink.svg",
    'Mountains, red fill': "data/mountainsred.svg",
    'Mountain numbers (pink)': "data/mountainnumbers.svg",
    'Names of mountains, peoples, regions, display capitals (black and red)': "data/names.svg",
  'Open water, lettering (violet)': "data/namesislandswater.svg",
    'River courses (blue)': "data/riversoutline.svg",
        'River courses: numbers and flow direction arrows (both green)': "data/riverflow.svg",
    'River courses: restoration of partial erasures (blue dots)': "data/riverspartiallyerased.svg",
    'River courses: supplementary linework (red dots)': "data/riversdecorative.svg",
     'Route linework (red)': "data/routesoutline.svg",
    'Routes: conjectural restoration of missing linework (bright red)': "data/routesrestoration.svg",
   'Route stretches with no distance figure (orange)': "data/routesnodistance.svg",
    'Route stretches with no start marked (yellow)': "data/routesnostart.svg",
    'Routes: one stretch drawn as two or more (black)': "data/routestwoasone.svg",
      'Symbols': "data/symbols.svg",
        'Symbols: numbers for isolated unnamed symbols (light blue)': "data/isolatedsymbols.svg",
    'Unnamed route stretches (purple)': "data/unnamedroutesoutline.svg",
    'Unnamed route stretch numbers (purple)': "data/unnamedroutenumbers.svg",
};

var sectionExtents = [
 [ 1.29861, 3.03472, 37.79861, 25.64583 ],
 [ 38.40972, 4.64583, 76.24306, 27.20139 ],
 [ 77.24306, 6.25694, 118.10417, 28.06250 ],
 [ 118.54861, 6.84028, 156.43750, 27.50694 ],
 [ 156.99306, 6.78472, 194.38194, 27.06250 ],
 [ 194.15972, 5.78472, 231.99306, 26.39583 ],
 [ 231.82639, 5.61806, 271.49306, 25.72917 ],
 [ 271.32639, 5.06250, 307.90972, 25.70139 ],
 [ 307.79861, 4.25694, 348.02083, 24.42361 ],
 [ 347.57639, 2.97917, 392.18750, 23.75694 ],
 [ 390.24306, 2.09028, 435.02083, 23.25694 ]
];

var sectionCenters = [
  [21.0, 15.4],
  [57.5, 16.8],
  [98.4, 18.7],
  [154.0, 16.2], //center on Rome
  [175.9, 17.2],
  [214.9, 16.5],
  [253.3, 16.0],
  [291.7, 15.6],
  [328.0, 14.1],
  [370.2, 13.6],
  [414.2, 12.3]
];
//RES set for inkscape defaults.
var DPC = 72.0/2.54;
var RES = 1.0/72;

function makeOverlayLayer(title, url) {
  return new OpenLayers.Layer.SVG(
                title, { 
                visibility: false,
                alwaysInRange: true,
                displayInLayerSwitcher: true,
                strategies: [new OpenLayers.Strategy.SVG()],                
                protocol: new OpenLayers.Protocol.SVG({
                    url: url,
                }),
            });
}


function moveToSection(map, n) {
  e = sectionCenters[parseInt(n)-1];
  center = new OpenLayers.LonLat(e[0], e[1]);
  z = 1;
  map.setCenter(center, z, false, false);
  // map.zoomToExtent(new OpenLayers.Bounds(e[0], e[1], e[2], e[3]));
}

function initView(map) {
  var xy, center, z;
  var params = {};
  try {
    var items = document.baseURI.split('?')[1].split('&');
    for (var j=0, len = items.length; j<len; j++) {
      var item = items[j].split('=');
      params[item[0]] = item[1];
    }
  }
  catch(e) {
    // pass
  }
  if (params.l) {
    // layers
    if (params.l.length == map.layers.length) { 
      for(var i=0, len=params.l.length; i<len; i++) {
        var layer = map.layers[i];
        var c = params.l.charAt(i);
        if (c == "B") {
          map.setBaseLayer(layer);
        } else if ( (c == "T") || (c == "F") ) {
          layer.setVisibility(c == "T");
        }
      }
    }
  }
  if (params.z && params.xy) {
    if (typeof params.xy == 'object' && params.xy.constructor == Array) {
      xy = params.xy;
    }
    else {
      xy = params.xy.split('%2C');
    }
    center = new OpenLayers.LonLat(parseFloat(xy[0]), parseFloat(xy[1]));
    z = parseInt(params.z);
  }
  else {
    var e = sectionCenters[3];
    center = new OpenLayers.LonLat(e[0], e[1]);
    z = 1;
  }
  
  map.setCenter(center, z, false, false);
}

function launchViewer(w, h) {

  var resolutions = [4.0*RES, 2.0*RES, 1.0*RES, 0.5*RES, 0.25*RES];

  var mosaic = new OpenLayers.Layer.OpenURL(
    'All sections',
    'https://dl-img.home.nyu.edu/',
    'https://peutinger.atlantides.org/map-a/base.tif',
    new OpenLayers.Bounds(
      0, 0, 31331*RES, 2281*RES),
    new OpenLayers.Size(31331, 2281),
    { format: 'image/jpeg', 
      units: 'cm',
      tileSize: new OpenLayers.Size(490, 36),
      isBaseLayer: false,
      resolutions: resolutions }
    );
        
  var maxExtent = new OpenLayers.Bounds(0, 0, 435.15277777778, 31.680555555556);
  var options = {
    resolutions: resolutions,
    units: 'cm'
    };

  map = new OpenLayers.Map('map', options);
  map.tileSize = mosaic.tileSize;

  base = new OpenLayers.Layer.Image(
  	                  'None',
  	                  'data/base-transparent.png',
  	                  new OpenLayers.Bounds(0, 0, 435.15277777778, 31.680555555556),
  	                  new OpenLayers.Size(8, 8),
  	                  { isBaseLayer: true,
                        resolutions: resolutions,
                        units: 'cm' }
                      );

  layers = [base, mosaic];

  /* Build various GeoExt objects from the layer definitions at the top of
     this file
  */
  tree_kids = [];
  stores = {};

  for (var name in overlayDefs) {
    if (overlayDefs.hasOwnProperty(name)) {
      entry = overlayDefs[name];
      if (typeof(entry) == "string") {
        var layer = makeOverlayLayer(name, entry);
        layers.push(layer);
        stores[name] = new GeoExt.data.LayerStore({layers: [layer]});
        tree_kids.push({text: name, nodeType: 'gx_layer', layer: layer});
      }
      else {
        var group = [];
        for (i=0; i<entry.length; i++) {
          var layer = makeOverlayLayer(entry[i][0], entry[i][1]);
          layers.push(layer);
          group.push(layer);
        }
        stores[name] = new GeoExt.data.LayerStore({layers: group});
        tree_kids.push({text: name, nodeType: 'gx_layercontainer', layerStore: stores[name]});
      }
    }
  }

  /* Now GeoExt objects for the non-overlay layers */
  var n = 'Map'
  stores[n] = new GeoExt.data.LayerStore({layers: layers.slice(1, 2)});
  tree_kids.push({text: n, nodeType: 'gx_layercontainer', layerStore: stores[n]});

  map.addLayers(layers);
  map.addControl(new OpenLayers.Control.ArgParser());
  map.addControl(new OpenLayers.Control.TPeutPermalink('permalink'));
  map.addControl(new OpenLayers.Control.MousePosition());
  map.addControl(new OpenLayers.Control.Scale());

  // Empty rendered-to elements
  $('#tree-div').empty();
  $('#imagery-slider').empty();
  $('#overlay-slider').empty();

  // create Ext window including a map panel
  mapwin = new Ext.Window({
        layout: "border",
        resizable: true,
        maximizable: true,
        constrain: true,
        closeAction: 'hide',
        title: "Map Viewer",
        width: w,
        height: h,
        x: (document.width-w)/2,
        y: $('#bd').offset().top,
        items: [
            { collapsible: true,
              // collapsed: true,
              title: 'Options',
              region:'west',
              contentEl: 'map-contents',
              width: 320,
              }, 
            {
              xtype: "gx_mappanel",
              region: "center",
              map: map
            }
        ]
    });
    mapwin.show();

  mapPanel = mapwin.items.get(1);

  backgroundSlider = new GeoExt.TPeutOverlayOpacitySlider({
      layers: map.layers.slice(1, 2),
      aggressive: true, 
      width: 280,
      minValue: 0,
      maxValue: 100,
      increment: 10,
      value: 100,
      fieldLabel: "imagery-opacity",
      renderTo: "imagery-slider"
  });

  // create a separate slider bound to the map but displayed elsewhere
  overlaySlider = new GeoExt.TPeutOverlayOpacitySlider({
      layers: map.layers.slice(2),
      aggressive: true, 
      width: 280,
      minValue: 0,
      maxValue: 100,
      increment: 10,
      value: 100,
      fieldLabel: "overlay-opacity",
      renderTo: "overlay-slider"
  });

  tree = new Ext.tree.TreePanel({
    width: 320,
    height: 530,
    renderTo: "tree-div",
    autoScroll:true,
    animate:true,
    enableDD:true,
    containerScroll: true,
    rootVisible: true,
    frame: false,
    loader: new Ext.tree.TreeLoader({
      applyLoader: false,
      }),
    root: new GeoExt.tree.LayerNode({
            expanded: true,
            children: tree_kids, 
            }),
    listeners: {
      "radiochange": function(node){
        alert(node.layer.name + " is now the the active layer.");
        }
      },
    rootVisible: false,
    lines: false
    });

  // initialize map view
  initView(map);

};

function loaded() {
    if (document.baseURI.indexOf('/#') > 0) {
        launchViewer(1400, 750);
    }
};
