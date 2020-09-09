/*

GeoExt License
==============

Copyright (c) 2008-2010, The Open Source Geospatial Foundation
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the Open Source Geospatial Foundation nor the names
      of its contributors may be used to endorse or promote products derived
      from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

Notice about ExtJS
==================

The GeoExt library is for use with the ExtJS library.  ExtJS is distributed
under the terms of the GPL v3.  See http://extjs.com/products/license.php for
details on ExtJS licensing.

*/

Ext.namespace("GeoExt");GeoExt.MapPanel=Ext.extend(Ext.Panel,{map:null,layers:null,center:null,zoom:null,extent:null,initComponent:function(){if(!(this.map instanceof OpenLayers.Map)){this.map=new OpenLayers.Map(Ext.applyIf(this.map||{},{allOverlays:true}));}
var layers=this.layers;if(!layers||layers instanceof Array){this.layers=new GeoExt.data.LayerStore({layers:layers,map:this.map});}
if(typeof this.center=="string"){this.center=OpenLayers.LonLat.fromString(this.center);}else if(this.center instanceof Array){this.center=new OpenLayers.LonLat(this.center[0],this.center[1]);}
if(typeof this.extent=="string"){this.extent=OpenLayers.Bounds.fromString(this.extent);}else if(this.extent instanceof Array){this.extent=OpenLayers.Bounds.fromArray(this.extent);}
GeoExt.MapPanel.superclass.initComponent.call(this);},updateMapSize:function(){if(this.map){this.map.updateSize();}},renderMap:function(){var map=this.map;map.render(this.body.dom);if(map.layers.length>0){if(this.center||this.zoom!=null){map.setCenter(this.center,this.zoom);}else if(this.extent){map.zoomToExtent(this.extent);}else{map.zoomToMaxExtent();}}},afterRender:function(){GeoExt.MapPanel.superclass.afterRender.apply(this,arguments);if(!this.ownerCt){this.renderMap();}else{this.ownerCt.on("move",this.updateMapSize,this);this.ownerCt.on({"afterlayout":{fn:this.renderMap,scope:this,single:true}});}},onResize:function(){GeoExt.MapPanel.superclass.onResize.apply(this,arguments);this.updateMapSize();},onBeforeAdd:function(item){if(typeof item.addToMapPanel==="function"){item.addToMapPanel(this);}
GeoExt.MapPanel.superclass.onBeforeAdd.apply(this,arguments);},remove:function(item,autoDestroy){if(typeof item.removeFromMapPanel==="function"){item.removeFromMapPanel(this);}
GeoExt.MapPanel.superclass.remove.apply(this,arguments);},beforeDestroy:function(){if(this.ownerCt){this.ownerCt.un("move",this.updateMapSize,this);}
if(!this.initialConfig.map||!(this.initialConfig.map instanceof OpenLayers.Map)){if(this.map&&this.map.destroy){this.map.destroy();}}
delete this.map;GeoExt.MapPanel.superclass.beforeDestroy.apply(this,arguments);}});GeoExt.MapPanel.guess=function(){return Ext.ComponentMgr.all.find(function(o){return o instanceof GeoExt.MapPanel;});};Ext.reg('gx_mappanel',GeoExt.MapPanel);
Ext.namespace("GeoExt");GeoExt.LayerOpacitySlider=Ext.extend(Ext.Slider,{layer:null,complementaryLayer:null,delay:5,changeVisibilityDelay:5,aggressive:false,changeVisibility:false,value:null,constructor:function(config){if(config.layer){if(config.layer instanceof OpenLayers.Layer){this.layer=config.layer;}else if(config.layer instanceof GeoExt.data.LayerRecord){this.layer=config.layer.get('layer');}
if(config.complementaryLayer instanceof OpenLayers.Layer){this.complementaryLayer=config.complementaryLayer;}else if(config.complementaryLayer instanceof
GeoExt.data.LayerRecord){this.complementaryLayer=config.complementaryLayer.get('layer');}
delete config.layer;delete config.complementaryLayer;}
GeoExt.LayerOpacitySlider.superclass.constructor.call(this,config);},initComponent:function(){if(this.layer&&this.layer.opacity!==null){this.value=parseInt(this.layer.opacity*(this.maxValue-this.minValue));}else if(this.value==null){this.value=this.maxValue;}
GeoExt.LayerOpacitySlider.superclass.initComponent.call(this);if(this.changeVisibility&&this.layer&&(this.layer.opacity==0||this.value==this.minValue)){this.layer.setVisibility(false);}
if(this.complementaryLayer&&((this.layer&&this.layer.opacity==1)||(this.value==this.maxValue))){this.complementaryLayer.setVisibility(false);}
if(this.aggressive===true){this.on('change',this.changeLayerOpacity,this,{buffer:this.delay});}else{this.on('changecomplete',this.changeLayerOpacity,this);}
if(this.changeVisibility===true){this.on('change',this.changeLayerVisibility,this,{buffer:this.changeVisibilityDelay});}
if(this.complementaryLayer){this.on('change',this.changeComplementaryLayerVisibility,this,{buffer:this.changeVisibilityDelay});}},changeLayerOpacity:function(slider,value){if(this.layer){this.layer.setOpacity(value/100.0);}},changeLayerVisibility:function(slider,value){var currentVisibility=this.layer.getVisibility();if(value==this.minValue&&currentVisibility===true){this.layer.setVisibility(false);}else if(value>this.minValue&&currentVisibility==false){this.layer.setVisibility(true);}},changeComplementaryLayerVisibility:function(slider,value){var currentVisibility=this.complementaryLayer.getVisibility();if(value==this.maxValue&&currentVisibility===true){this.complementaryLayer.setVisibility(false);}else if(value<this.maxValue&&currentVisibility==false){this.complementaryLayer.setVisibility(true);}},addToMapPanel:function(panel){this.on({render:function(){var el=this.getEl();el.setStyle({position:"absolute",zIndex:panel.map.Z_INDEX_BASE.Control});el.on({mousedown:this.stopMouseEvents,click:this.stopMouseEvents});},scope:this});},removeFromMapPanel:function(panel){var el=this.getEl();el.un({mousedown:this.stopMouseEvents,click:this.stopMouseEvents,scope:this});},stopMouseEvents:function(e){e.stopEvent();}});Ext.reg('gx_opacityslider',GeoExt.LayerOpacitySlider);
Ext.namespace("GeoExt");GeoExt.SliderTip=Ext.extend(Ext.Tip,{hover:true,minWidth:10,minWidth:10,offsets:[0,-10],dragging:false,init:function(slider){slider.on({dragstart:this.onSlide,drag:this.onSlide,dragend:this.hide,destroy:this.destroy,scope:this});if(this.hover){slider.on("render",this.registerThumbListeners,this);}
this.slider=slider;},registerThumbListeners:function(){this.slider.thumb.on({"mouseover":function(){this.onSlide(this.slider);this.dragging=false;},"mouseout":function(){if(!this.dragging){this.hide.apply(this,arguments);}},scope:this});},onSlide:function(slider){this.dragging=true;this.show();this.body.update(this.getText(slider));this.doAutoWidth();this.el.alignTo(slider.thumb,'b-t?',this.offsets);},getText:function(slider){return slider.getValue();}});
Ext.namespace("GeoExt");GeoExt.LayerOpacitySliderTip=Ext.extend(GeoExt.SliderTip,{template:'<div>{opacity}%</div>',compiledTemplate:null,init:function(slider){this.compiledTemplate=new Ext.Template(this.template);GeoExt.LayerOpacitySliderTip.superclass.init.call(this,slider);},getText:function(slider){var data={opacity:slider.getValue()};return this.compiledTemplate.apply(data);}});
Ext.namespace("GeoExt.tree");GeoExt.tree.LayerNodeUI=Ext.extend(Ext.tree.TreeNodeUI,{radio:null,constructor:function(config){GeoExt.tree.LayerNodeUI.superclass.constructor.apply(this,arguments);},render:function(bulkRender){var a=this.node.attributes;if(a.checked===undefined){a.checked=this.node.layer.getVisibility();}
GeoExt.tree.LayerNodeUI.superclass.render.apply(this,arguments);var cb=this.checkbox;if(a.radioGroup&&this.radio===null){this.radio=Ext.DomHelper.insertAfter(cb,['<input type="radio" class="gx-tree-layer-radio" name="',a.radioGroup,'_radio"></input>'].join(""));}
if(a.checkedGroup){var radio=Ext.DomHelper.insertAfter(cb,['<input type="radio" name="',a.checkedGroup,'_checkbox" class="',cb.className,cb.checked?'" checked="checked"':'','"></input>'].join(""));radio.defaultChecked=cb.defaultChecked;Ext.get(cb).remove();this.checkbox=radio;}
this.enforceOneVisible();},onClick:function(e){if(e.getTarget('.gx-tree-layer-radio',1)){this.radio.defaultChecked=this.radio.checked;this.fireEvent("radiochange",this.node);}else if(e.getTarget('.x-tree-node-cb',1)){this.onCheckChange();}else{GeoExt.tree.LayerNodeUI.superclass.onClick.apply(this,arguments);}},toggleCheck:function(value){if(!this._visibilityChanging){this._visibilityChanging=true;value=(value===undefined?!this.isChecked():value)||(this.isChecked()&&!!this.node.attributes.checkedGroup);GeoExt.tree.LayerNodeUI.superclass.toggleCheck.call(this,value);this.enforceOneVisible();delete this._visibilityChanging;}},enforceOneVisible:function(){var attributes=this.node.attributes;var group=attributes.checkedGroup;if(group){var layer=this.node.layer;var checkedNodes=this.node.getOwnerTree().getChecked();var checkedCount=0;Ext.each(checkedNodes,function(n){var ui=n.getUI();var l=n.layer
if(!n.hidden&&n.attributes.checkedGroup===group){checkedCount++;if(l!=layer&&attributes.checked){ui.checkbox.defaultChecked=false;ui.checkbox.checked=false;l.setVisibility(false);}}});if(checkedCount===0&&attributes.checked==false){var ui=this.node.getUI();ui.checkbox.defaultChecked=true;ui.checkbox.checked=true;layer.setVisibility(true);}}},appendDDGhost:function(ghostNode){var n=this.elNode.cloneNode(true);var radio=Ext.DomQuery.select("input[type='radio']",n);Ext.each(radio,function(r){r.name=r.name+"_clone";});ghostNode.appendChild(n);},destroy:function(){delete this.radio;GeoExt.tree.LayerNodeUI.superclass.destroy.apply(this,arguments);}});GeoExt.tree.LayerNode=Ext.extend(Ext.tree.AsyncTreeNode,{layer:null,layerStore:null,constructor:function(config){config.leaf=config.leaf||!(config.children||config.loader);if(!config.iconCls&&!config.children){config.iconCls="gx-tree-layer-icon";}
if(config.loader&&!(config.loader instanceof Ext.tree.TreeLoader)){config.loader=new GeoExt.tree.LayerParamLoader(config.loader);}
this.defaultUI=this.defaultUI||GeoExt.tree.LayerNodeUI;this.addEvents("radiochange");Ext.apply(this,{layer:config.layer,layerStore:config.layerStore});if(config.text){this.fixedText=true;}
GeoExt.tree.LayerNode.superclass.constructor.apply(this,arguments);},render:function(bulkRender){var layer=this.layer instanceof OpenLayers.Layer&&this.layer;if(!layer){if(!this.layerStore||this.layerStore=="auto"){this.layerStore=GeoExt.MapPanel.guess().layers;}
var i=this.layerStore.findBy(function(o){return o.get("title")==this.layer;},this);if(i!=-1){layer=this.layerStore.getAt(i).get("layer");}}
if(!this.rendered||!layer){var ui=this.getUI();if(layer){this.layer=layer;if(layer.isBaseLayer){this.draggable=false;Ext.applyIf(this.attributes,{checkedGroup:"gx_baselayer"});}
if(!this.text){this.text=layer.name;}
ui.show();this.addVisibilityEventHandlers();}else{ui.hide();}
if(this.layerStore instanceof GeoExt.data.LayerStore){this.addStoreEventHandlers(layer);}}
GeoExt.tree.LayerNode.superclass.render.apply(this,arguments);},addVisibilityEventHandlers:function(){this.layer.events.on({"visibilitychanged":this.onLayerVisibilityChanged,scope:this});this.on({"checkchange":this.onCheckChange,scope:this});},onLayerVisibilityChanged:function(){this.getUI().toggleCheck(this.layer.getVisibility());},onCheckChange:function(node,checked){if(checked!=this.layer.getVisibility()){var layer=this.layer;if(checked&&layer.isBaseLayer&&layer.map){layer.map.setBaseLayer(layer);}else{layer.setVisibility(checked);}}},addStoreEventHandlers:function(){this.layerStore.on({"add":this.onStoreAdd,"remove":this.onStoreRemove,"update":this.onStoreUpdate,scope:this});},onStoreAdd:function(store,records,index){var l;for(var i=0;i<records.length;++i){l=records[i].get("layer");if(this.layer==l){this.getUI().show();break;}else if(this.layer==l.name){this.render();break;}}},onStoreRemove:function(store,record,index){if(this.layer==record.get("layer")){this.getUI().hide();}},onStoreUpdate:function(store,record,operation){var layer=record.get("layer");if(!this.fixedText&&(this.layer==layer&&this.text!==layer.name)){this.setText(layer.name);}},destroy:function(){var layer=this.layer;if(layer instanceof OpenLayers.Layer){layer.events.un({"visibilitychanged":this.onLayerVisibilityChanged,scope:this});}
delete this.layer;var layerStore=this.layerStore;if(layerStore){layerStore.un("add",this.onStoreAdd,this);layerStore.un("remove",this.onStoreRemove,this);layerStore.un("update",this.onStoreUpdate,this);}
delete this.layerStore;this.un("checkchange",this.onCheckChange,this);GeoExt.tree.LayerNode.superclass.destroy.apply(this,arguments);}});Ext.tree.TreePanel.nodeTypes.gx_layer=GeoExt.tree.LayerNode;
Ext.namespace("GeoExt.tree");GeoExt.tree.LayerContainer=Ext.extend(Ext.tree.AsyncTreeNode,{constructor:function(config){config=Ext.applyIf(config||{},{text:"Layers"});this.loader=config.loader instanceof GeoExt.tree.LayerLoader?config.loader:new GeoExt.tree.LayerLoader(Ext.applyIf(config.loader||{},{store:config.layerStore}));GeoExt.tree.LayerContainer.superclass.constructor.call(this,config);},recordIndexToNodeIndex:function(index){var store=this.loader.store;var count=store.getCount();var nodeCount=this.childNodes.length;var nodeIndex=-1;for(var i=count-1;i>=0;--i){if(this.loader.filter(store.getAt(i))===true){++nodeIndex;if(index===i||nodeIndex>nodeCount-1){break;}}}
return nodeIndex;},destroy:function(){delete this.layerStore;GeoExt.tree.LayerContainer.superclass.destroy.apply(this,arguments);}});Ext.tree.TreePanel.nodeTypes.gx_layercontainer=GeoExt.tree.LayerContainer;
Ext.namespace("GeoExt.tree");GeoExt.tree.LayerLoader=function(config){Ext.apply(this,config);this.addEvents("beforeload","load");GeoExt.tree.LayerLoader.superclass.constructor.call(this);};Ext.extend(GeoExt.tree.LayerLoader,Ext.util.Observable,{store:null,filter:function(record){return record.get("layer").displayInLayerSwitcher==true;},uiProviders:null,load:function(node,callback){if(this.fireEvent("beforeload",this,node)){this.removeStoreHandlers();while(node.firstChild){node.removeChild(node.firstChild);}
if(!this.uiProviders){this.uiProviders=node.getOwnerTree().getLoader().uiProviders;}
if(!this.store){this.store=GeoExt.MapPanel.guess().layers;}
this.store.each(function(record){this.addLayerNode(node,record);},this);this.addStoreHandlers(node);if(typeof callback=="function"){callback();}
this.fireEvent("load",this,node);}},onStoreAdd:function(store,records,index,node){if(!this._reordering){var nodeIndex=node.recordIndexToNodeIndex(index+records.length-1);for(var i=0;i<records.length;++i){this.addLayerNode(node,records[i],nodeIndex);}}},onStoreRemove:function(store,record,index,node){if(!this._reordering){this.removeLayerNode(node,record);}},addLayerNode:function(node,layerRecord,index){index=index||0;if(this.filter(layerRecord)===true){var child=this.createNode({nodeType:'gx_layer',layer:layerRecord.get("layer"),layerStore:this.store});var sibling=node.item(index);if(sibling){node.insertBefore(child,sibling);}else{node.appendChild(child);}
child.on("move",this.onChildMove,this);}},removeLayerNode:function(node,layerRecord){if(this.filter(layerRecord)===true){var child=node.findChildBy(function(node){return node.layer==layerRecord.get("layer");});if(child){child.un("move",this.onChildMove,this);child.remove();node.reload();}}},onChildMove:function(tree,node,oldParent,newParent,index){this._reordering=true;var oldRecordIndex=this.store.findBy(function(record){return record.get("layer")===node.layer;});var record=this.store.getAt(oldRecordIndex);if(newParent instanceof GeoExt.tree.LayerContainer&&this.store===newParent.loader.store){newParent.loader._reordering=true;this.store.remove(record);var newRecordIndex;if(newParent.childNodes.length>1){var searchIndex=(index===0)?index+1:index-1;newRecordIndex=this.store.findBy(function(r){return newParent.childNodes[searchIndex].layer===r.get("layer");});index===0&&newRecordIndex++;}else if(oldParent.parentNode===newParent.parentNode){var prev=newParent;do{prev=prev.previousSibling;}while(prev&&!(prev instanceof GeoExt.tree.LayerContainer&&prev.lastChild));if(prev){newRecordIndex=this.store.findBy(function(r){return prev.lastChild.layer===r.get("layer");});}else{var next=newParent;do{next=next.nextSibling;}while(next&&!(next instanceof GeoExt.tree.LayerContainer&&next.firstChild));if(next){newRecordIndex=this.store.findBy(function(r){return next.firstChild.layer===r.get("layer");});}
newRecordIndex++;}}
if(newRecordIndex!==undefined){this.store.insert(newRecordIndex,[record]);window.setTimeout(function(){newParent.reload();oldParent.reload();});}else{this.store.insert(oldRecordIndex,[record]);}
delete newParent.loader._reordering;}
delete this._reordering;},addStoreHandlers:function(node){if(!this._storeHandlers){this._storeHandlers={"add":this.onStoreAdd.createDelegate(this,[node],true),"remove":this.onStoreRemove.createDelegate(this,[node],true)};for(var evt in this._storeHandlers){this.store.on(evt,this._storeHandlers[evt],this);}}},removeStoreHandlers:function(){if(this._storeHandlers){for(var evt in this._storeHandlers){this.store.un(evt,this._storeHandlers[evt],this);}
delete this._storeHandlers;}},createNode:function(attr){if(this.baseAttrs){Ext.apply(attr,this.baseAttrs);}
if(typeof attr.uiProvider=='string'){attr.uiProvider=this.uiProviders[attr.uiProvider]||eval(attr.uiProvider);}
attr.nodeType=attr.nodeType||"gx_layer";return new Ext.tree.TreePanel.nodeTypes[attr.nodeType](attr);},destroy:function(){this.removeStoreHandlers();}});
Ext.namespace("GeoExt.data");GeoExt.data.LayerStoreMixin={map:null,reader:null,constructor:function(config){config=config||{};config.reader=config.reader||new GeoExt.data.LayerReader({},config.fields);delete config.fields;var map=config.map instanceof GeoExt.MapPanel?config.map.map:config.map;delete config.map;if(config.layers){config.data=config.layers;}
delete config.layers;var options={initDir:config.initDir};delete config.initDir;arguments.callee.superclass.constructor.call(this,config);if(map){this.bind(map,options);}},bind:function(map,options){if(this.map){return;}
this.map=map;options=options||{};var initDir=options.initDir;if(options.initDir==undefined){initDir=GeoExt.data.LayerStore.MAP_TO_STORE|GeoExt.data.LayerStore.STORE_TO_MAP;}
var layers=map.layers.slice(0);if(initDir&GeoExt.data.LayerStore.STORE_TO_MAP){this.each(function(record){this.map.addLayer(record.get("layer"));},this);}
if(initDir&GeoExt.data.LayerStore.MAP_TO_STORE){this.loadData(layers,true);}
map.events.on({"changelayer":this.onChangeLayer,"addlayer":this.onAddLayer,"removelayer":this.onRemoveLayer,scope:this});this.on({"load":this.onLoad,"clear":this.onClear,"add":this.onAdd,"remove":this.onRemove,"update":this.onUpdate,scope:this});this.data.on({"replace":this.onReplace,scope:this});},unbind:function(){if(this.map){this.map.events.un({"changelayer":this.onChangeLayer,"addlayer":this.onAddLayer,"removelayer":this.onRemoveLayer,scope:this});this.un("load",this.onLoad,this);this.un("clear",this.onClear,this);this.un("add",this.onAdd,this);this.un("remove",this.onRemove,this);this.data.un("replace",this.onReplace,this);this.map=null;}},onChangeLayer:function(evt){var layer=evt.layer;var recordIndex=this.findBy(function(rec,id){return rec.get("layer")===layer;});if(recordIndex>-1){var record=this.getAt(recordIndex);if(evt.property==="order"){if(!this._adding&&!this._removing){var layerIndex=this.map.getLayerIndex(layer);if(layerIndex!==recordIndex){this._removing=true;this.remove(record);delete this._removing;this._adding=true;this.insert(layerIndex,[record]);delete this._adding;}}}else if(evt.property==="name"){record.set("title",layer.name);}else{this.fireEvent("update",this,record,Ext.data.Record.EDIT);}}},onAddLayer:function(evt){if(!this._adding){var layer=evt.layer;this._adding=true;this.loadData([layer],true);delete this._adding;}},onRemoveLayer:function(evt){if(this.map.unloadDestroy){if(!this._removing){var layer=evt.layer;this._removing=true;this.remove(this.getById(layer.id));delete this._removing;}}else{this.unbind();}},onLoad:function(store,records,options){if(!Ext.isArray(records)){records=[records];}
if(options&&!options.add){this._removing=true;for(var i=this.map.layers.length-1;i>=0;i--){this.map.removeLayer(this.map.layers[i]);}
delete this._removing;var len=records.length;if(len>0){var layers=new Array(len);for(var j=0;j<len;j++){layers[j]=records[j].get("layer");}
this._adding=true;this.map.addLayers(layers);delete this._adding;}}},onClear:function(store){this._removing=true;for(var i=this.map.layers.length-1;i>=0;i--){this.map.removeLayer(this.map.layers[i]);}
delete this._removing;},onAdd:function(store,records,index){if(!this._adding){this._adding=true;var layer;for(var i=records.length-1;i>=0;--i){layer=records[i].get("layer");this.map.addLayer(layer);if(index!==this.map.layers.length-1){this.map.setLayerIndex(layer,index);}}
delete this._adding;}},onRemove:function(store,record,index){if(!this._removing){var layer=record.get("layer");if(this.map.getLayer(layer.id)!=null){this._removing=true;this.removeMapLayer(record);delete this._removing;}}},onUpdate:function(store,record,operation){if(operation===Ext.data.Record.EDIT){var layer=record.get("layer");var title=record.get("title");if(title!==layer.name){layer.setName(title);}}},removeMapLayer:function(record){this.map.removeLayer(record.get("layer"));},onReplace:function(key,oldRecord,newRecord){this.removeMapLayer(oldRecord);},destroy:function(){this.unbind();GeoExt.data.LayerStore.superclass.destroy.call(this);}};GeoExt.data.LayerStore=Ext.extend(Ext.data.Store,GeoExt.data.LayerStoreMixin);GeoExt.data.LayerStore.MAP_TO_STORE=1;GeoExt.data.LayerStore.STORE_TO_MAP=2;
Ext.namespace("GeoExt.data");GeoExt.data.LayerRecord=Ext.data.Record.create([{name:"layer"},{name:"title",type:"string",mapping:"name"}]);GeoExt.data.LayerRecord.prototype.clone=function(id){var layer=this.get("layer")&&this.get("layer").clone();return new this.constructor(Ext.applyIf({layer:layer},this.data),id||layer.id);};GeoExt.data.LayerRecord.create=function(o){var f=Ext.extend(GeoExt.data.LayerRecord,{});var p=f.prototype;p.fields=new Ext.util.MixedCollection(false,function(field){return field.name;});GeoExt.data.LayerRecord.prototype.fields.each(function(f){p.fields.add(f);});if(o){for(var i=0,len=o.length;i<len;i++){p.fields.add(new Ext.data.Field(o[i]));}}
f.getField=function(name){return p.fields.get(name);};return f;};
Ext.namespace("GeoExt","GeoExt.data");GeoExt.data.LayerReader=function(meta,recordType){meta=meta||{};if(!(recordType instanceof Function)){recordType=GeoExt.data.LayerRecord.create(recordType||meta.fields||{});}
GeoExt.data.LayerReader.superclass.constructor.call(this,meta,recordType);};Ext.extend(GeoExt.data.LayerReader,Ext.data.DataReader,{totalRecords:null,readRecords:function(layers){var records=[];if(layers){var recordType=this.recordType,fields=recordType.prototype.fields;var i,lenI,j,lenJ,layer,values,field,v;for(i=0,lenI=layers.length;i<lenI;i++){layer=layers[i];values={};for(j=0,lenJ=fields.length;j<lenJ;j++){field=fields.items[j];v=layer[field.mapping||field.name]||field.defaultValue;v=field.convert(v);values[field.name]=v;}
values.layer=layer;records[records.length]=new recordType(values,layer.id);}}
return{records:records,totalRecords:this.totalRecords!=null?this.totalRecords:records.length};}});