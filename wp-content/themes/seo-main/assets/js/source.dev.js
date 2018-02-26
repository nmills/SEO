'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/*! Magnific Popup - v1.0.0 - 2015-01-03
* http://dimsemenov.com/plugins/magnific-popup/
* Copyright (c) 2015 Dmitry Semenov; */
;(function(factory){
if(typeof define==='function'&&define.amd){
// AMD. Register as an anonymous module.
define(['jquery'],factory);
}else if((typeof exports==='undefined'?'undefined':_typeof(exports))==='object'){
// Node/CommonJS
factory(require('jquery'));
}else{
// Browser globals
factory(window.jQuery||window.Zepto);
}
})(function($){

/*>>core*/
/**
 *
 * Magnific Popup Core JS file
 *
 */


/**
 * Private static constants
 */
var CLOSE_EVENT='Close',
BEFORE_CLOSE_EVENT='BeforeClose',
AFTER_CLOSE_EVENT='AfterClose',
BEFORE_APPEND_EVENT='BeforeAppend',
MARKUP_PARSE_EVENT='MarkupParse',
OPEN_EVENT='Open',
CHANGE_EVENT='Change',
NS='mfp',
EVENT_NS='.'+NS,
READY_CLASS='mfp-ready',
REMOVING_CLASS='mfp-removing',
PREVENT_CLOSE_CLASS='mfp-prevent-close';


/**
 * Private vars
 */
/*jshint -W079 */
var mfp,// As we have only one instance of MagnificPopup object, we define it locally to not to use 'this'
MagnificPopup=function MagnificPopup(){},
_isJQ=!!window.jQuery,
_prevStatus,
_window=$(window),
_document,
_prevContentType,
_wrapClasses,
_currPopupType;


/**
 * Private functions
 */
var _mfpOn=function _mfpOn(name,f){
mfp.ev.on(NS+name+EVENT_NS,f);
},
_getEl=function _getEl(className,appendTo,html,raw){
var el=document.createElement('div');
el.className='mfp-'+className;
if(html){
el.innerHTML=html;
}
if(!raw){
el=$(el);
if(appendTo){
el.appendTo(appendTo);
}
}else if(appendTo){
appendTo.appendChild(el);
}
return el;
},
_mfpTrigger=function _mfpTrigger(e,data){
mfp.ev.triggerHandler(NS+e,data);

if(mfp.st.callbacks){
// converts "mfpEventName" to "eventName" callback and triggers it if it's present
e=e.charAt(0).toLowerCase()+e.slice(1);
if(mfp.st.callbacks[e]){
mfp.st.callbacks[e].apply(mfp,$.isArray(data)?data:[data]);
}
}
},
_getCloseBtn=function _getCloseBtn(type){
if(type!==_currPopupType||!mfp.currTemplate.closeBtn){
mfp.currTemplate.closeBtn=$(mfp.st.closeMarkup.replace('%title%',mfp.st.tClose));
_currPopupType=type;
}
return mfp.currTemplate.closeBtn;
},
// Initialize Magnific Popup only when called at least once
_checkInstance=function _checkInstance(){
if(!$.magnificPopup.instance){
/*jshint -W020 */
mfp=new MagnificPopup();
mfp.init();
$.magnificPopup.instance=mfp;
}
},
// CSS transition detection, http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
supportsTransitions=function supportsTransitions(){
var s=document.createElement('p').style,// 's' for style. better to create an element if body yet to exist
v=['ms','O','Moz','Webkit'];// 'v' for vendor

if(s['transition']!==undefined){
return true;
}

while(v.length){
if(v.pop()+'Transition'in s){
return true;
}
}

return false;
};



/**
 * Public functions
 */
MagnificPopup.prototype={

constructor:MagnificPopup,

/**
     * Initializes Magnific Popup plugin.
     * This function is triggered only once when $.fn.magnificPopup or $.magnificPopup is executed
     */
init:function init(){
var appVersion=navigator.appVersion;
mfp.isIE7=appVersion.indexOf("MSIE 7.")!==-1;
mfp.isIE8=appVersion.indexOf("MSIE 8.")!==-1;
mfp.isLowIE=mfp.isIE7||mfp.isIE8;
mfp.isAndroid=/android/gi.test(appVersion);
mfp.isIOS=/iphone|ipad|ipod/gi.test(appVersion);
mfp.supportsTransition=supportsTransitions();

// We disable fixed positioned lightbox on devices that don't handle it nicely.
// If you know a better way of detecting this - let me know.
mfp.probablyMobile=mfp.isAndroid||mfp.isIOS||/(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent);
_document=$(document);

mfp.popupsCache={};
},

/**
     * Opens popup
     * @param  data [description]
     */
open:function open(data){

var i;

if(data.isObj===false){
// convert jQuery collection to array to avoid conflicts later
mfp.items=data.items.toArray();

mfp.index=0;
var items=data.items,
item;
for(i=0;i<items.length;i++){
item=items[i];
if(item.parsed){
item=item.el[0];
}
if(item===data.el[0]){
mfp.index=i;
break;
}
}
}else{
mfp.items=$.isArray(data.items)?data.items:[data.items];
mfp.index=data.index||0;
}

// if popup is already opened - we just update the content
if(mfp.isOpen){
mfp.updateItemHTML();
return;
}

mfp.types=[];
_wrapClasses='';
if(data.mainEl&&data.mainEl.length){
mfp.ev=data.mainEl.eq(0);
}else{
mfp.ev=_document;
}

if(data.key){
if(!mfp.popupsCache[data.key]){
mfp.popupsCache[data.key]={};
}
mfp.currTemplate=mfp.popupsCache[data.key];
}else{
mfp.currTemplate={};
}



mfp.st=$.extend(true,{},$.magnificPopup.defaults,data);
mfp.fixedContentPos=mfp.st.fixedContentPos==='auto'?!mfp.probablyMobile:mfp.st.fixedContentPos;

if(mfp.st.modal){
mfp.st.closeOnContentClick=false;
mfp.st.closeOnBgClick=false;
mfp.st.showCloseBtn=false;
mfp.st.enableEscapeKey=false;
}


// Building markup
// main containers are created only once
if(!mfp.bgOverlay){

// Dark overlay
mfp.bgOverlay=_getEl('bg').on('click'+EVENT_NS,function(){
mfp.close();
});

mfp.wrap=_getEl('wrap').attr('tabindex',-1).on('click'+EVENT_NS,function(e){
if(mfp._checkIfClose(e.target)){
mfp.close();
}
});

mfp.container=_getEl('container',mfp.wrap);
}

mfp.contentContainer=_getEl('content');
if(mfp.st.preloader){
mfp.preloader=_getEl('preloader',mfp.container,mfp.st.tLoading);
}


// Initializing modules
var modules=$.magnificPopup.modules;
for(i=0;i<modules.length;i++){
var n=modules[i];
n=n.charAt(0).toUpperCase()+n.slice(1);
mfp['init'+n].call(mfp);
}
_mfpTrigger('BeforeOpen');


if(mfp.st.showCloseBtn){
// Close button
if(!mfp.st.closeBtnInside){
mfp.wrap.append(_getCloseBtn());
}else{
_mfpOn(MARKUP_PARSE_EVENT,function(e,template,values,item){
values.close_replaceWith=_getCloseBtn(item.type);
});
_wrapClasses+=' mfp-close-btn-in';
}
}

if(mfp.st.alignTop){
_wrapClasses+=' mfp-align-top';
}



if(mfp.fixedContentPos){
mfp.wrap.css({
overflow:mfp.st.overflowY,
overflowX:'hidden',
overflowY:mfp.st.overflowY});

}else{
mfp.wrap.css({
top:_window.scrollTop(),
position:'absolute'});

}
if(mfp.st.fixedBgPos===false||mfp.st.fixedBgPos==='auto'&&!mfp.fixedContentPos){
mfp.bgOverlay.css({
height:_document.height(),
position:'absolute'});

}



if(mfp.st.enableEscapeKey){
// Close on ESC key
_document.on('keyup'+EVENT_NS,function(e){
if(e.keyCode===27){
mfp.close();
}
});
}

_window.on('resize'+EVENT_NS,function(){
mfp.updateSize();
});


if(!mfp.st.closeOnContentClick){
_wrapClasses+=' mfp-auto-cursor';
}

if(_wrapClasses)
mfp.wrap.addClass(_wrapClasses);


// this triggers recalculation of layout, so we get it once to not to trigger twice
var windowHeight=mfp.wH=_window.height();


var windowStyles={};

if(mfp.fixedContentPos){
if(mfp._hasScrollBar(windowHeight)){
var s=mfp._getScrollbarSize();
if(s){
windowStyles.marginRight=s;
}
}
}

if(mfp.fixedContentPos){
if(!mfp.isIE7){
windowStyles.overflow='hidden';
}else{
// ie7 double-scroll bug
$('body, html').css('overflow','hidden');
}
}



var classesToadd=mfp.st.mainClass;
if(mfp.isIE7){
classesToadd+=' mfp-ie7';
}
if(classesToadd){
mfp._addClassToMFP(classesToadd);
}

// add content
mfp.updateItemHTML();

_mfpTrigger('BuildControls');

// remove scrollbar, add margin e.t.c
$('html').css(windowStyles);

// add everything to DOM
mfp.bgOverlay.add(mfp.wrap).prependTo(mfp.st.prependTo||$(document.body));

// Save last focused element
mfp._lastFocusedEl=document.activeElement;

// Wait for next cycle to allow CSS transition
setTimeout(function(){

if(mfp.content){
mfp._addClassToMFP(READY_CLASS);
mfp._setFocus();
}else{
// if content is not defined (not loaded e.t.c) we add class only for BG
mfp.bgOverlay.addClass(READY_CLASS);
}

// Trap the focus in popup
_document.on('focusin'+EVENT_NS,mfp._onFocusIn);

},16);

mfp.isOpen=true;
mfp.updateSize(windowHeight);
_mfpTrigger(OPEN_EVENT);

return data;
},

/**
     * Closes the popup
     */
close:function close(){
if(!mfp.isOpen)return;
_mfpTrigger(BEFORE_CLOSE_EVENT);

mfp.isOpen=false;
// for CSS3 animation
if(mfp.st.removalDelay&&!mfp.isLowIE&&mfp.supportsTransition){
mfp._addClassToMFP(REMOVING_CLASS);
setTimeout(function(){
mfp._close();
},mfp.st.removalDelay);
}else{
mfp._close();
}
},

/**
     * Helper for close() function
     */
_close:function _close(){
_mfpTrigger(CLOSE_EVENT);

var classesToRemove=REMOVING_CLASS+' '+READY_CLASS+' ';

mfp.bgOverlay.detach();
mfp.wrap.detach();
mfp.container.empty();

if(mfp.st.mainClass){
classesToRemove+=mfp.st.mainClass+' ';
}

mfp._removeClassFromMFP(classesToRemove);

if(mfp.fixedContentPos){
var windowStyles={marginRight:''};
if(mfp.isIE7){
$('body, html').css('overflow','');
}else{
windowStyles.overflow='';
}
$('html').css(windowStyles);
}

_document.off('keyup'+EVENT_NS+' focusin'+EVENT_NS);
mfp.ev.off(EVENT_NS);

// clean up DOM elements that aren't removed
mfp.wrap.attr('class','mfp-wrap').removeAttr('style');
mfp.bgOverlay.attr('class','mfp-bg');
mfp.container.attr('class','mfp-container');

// remove close button from target element
if(mfp.st.showCloseBtn&&(
!mfp.st.closeBtnInside||mfp.currTemplate[mfp.currItem.type]===true)){
if(mfp.currTemplate.closeBtn)
mfp.currTemplate.closeBtn.detach();
}


if(mfp._lastFocusedEl){
$(mfp._lastFocusedEl).focus();// put tab focus back
}
mfp.currItem=null;
mfp.content=null;
mfp.currTemplate=null;
mfp.prevHeight=0;

_mfpTrigger(AFTER_CLOSE_EVENT);
},

updateSize:function updateSize(winHeight){

if(mfp.isIOS){
// fixes iOS nav bars https://github.com/dimsemenov/Magnific-Popup/issues/2
var zoomLevel=document.documentElement.clientWidth/window.innerWidth;
var height=window.innerHeight*zoomLevel;
mfp.wrap.css('height',height);
mfp.wH=height;
}else{
mfp.wH=winHeight||_window.height();
}
// Fixes #84: popup incorrectly positioned with position:relative on body
if(!mfp.fixedContentPos){
mfp.wrap.css('height',mfp.wH);
}

_mfpTrigger('Resize');

},

/**
     * Set content of popup based on current index
     */
updateItemHTML:function updateItemHTML(){
var item=mfp.items[mfp.index];

// Detach and perform modifications
mfp.contentContainer.detach();

if(mfp.content)
mfp.content.detach();

if(!item.parsed){
item=mfp.parseEl(mfp.index);
}

var type=item.type;

_mfpTrigger('BeforeChange',[mfp.currItem?mfp.currItem.type:'',type]);
// BeforeChange event works like so:
// _mfpOn('BeforeChange', function(e, prevType, newType) { });

mfp.currItem=item;





if(!mfp.currTemplate[type]){
var markup=mfp.st[type]?mfp.st[type].markup:false;

// allows to modify markup
_mfpTrigger('FirstMarkupParse',markup);

if(markup){
mfp.currTemplate[type]=$(markup);
}else{
// if there is no markup found we just define that template is parsed
mfp.currTemplate[type]=true;
}
}

if(_prevContentType&&_prevContentType!==item.type){
mfp.container.removeClass('mfp-'+_prevContentType+'-holder');
}

var newContent=mfp['get'+type.charAt(0).toUpperCase()+type.slice(1)](item,mfp.currTemplate[type]);
mfp.appendContent(newContent,type);

item.preloaded=true;

_mfpTrigger(CHANGE_EVENT,item);
_prevContentType=item.type;

// Append container back after its content changed
mfp.container.prepend(mfp.contentContainer);

_mfpTrigger('AfterChange');
},


/**
     * Set HTML content of popup
     */
appendContent:function appendContent(newContent,type){
mfp.content=newContent;

if(newContent){
if(mfp.st.showCloseBtn&&mfp.st.closeBtnInside&&
mfp.currTemplate[type]===true){
// if there is no markup, we just append close button element inside
if(!mfp.content.find('.mfp-close').length){
mfp.content.append(_getCloseBtn());
}
}else{
mfp.content=newContent;
}
}else{
mfp.content='';
}

_mfpTrigger(BEFORE_APPEND_EVENT);
mfp.container.addClass('mfp-'+type+'-holder');

mfp.contentContainer.append(mfp.content);
},




/**
     * Creates Magnific Popup data object based on given data
     * @param  {int} index Index of item to parse
     */
parseEl:function parseEl(index){
var item=mfp.items[index],
type;

if(item.tagName){
item={el:$(item)};
}else{
type=item.type;
item={data:item,src:item.src};
}

if(item.el){
var types=mfp.types;

// check for 'mfp-TYPE' class
for(var i=0;i<types.length;i++){
if(item.el.hasClass('mfp-'+types[i])){
type=types[i];
break;
}
}

item.src=item.el.attr('data-mfp-src');
if(!item.src){
item.src=item.el.attr('href');
}
}

item.type=type||mfp.st.type||'inline';
item.index=index;
item.parsed=true;
mfp.items[index]=item;
_mfpTrigger('ElementParse',item);

return mfp.items[index];
},


/**
     * Initializes single popup or a group of popups
     */
addGroup:function addGroup(el,options){
var eHandler=function eHandler(e){
e.mfpEl=this;
mfp._openClick(e,el,options);
};

if(!options){
options={};
}

var eName='click.magnificPopup';
options.mainEl=el;

if(options.items){
options.isObj=true;
el.off(eName).on(eName,eHandler);
}else{
options.isObj=false;
if(options.delegate){
el.off(eName).on(eName,options.delegate,eHandler);
}else{
options.items=el;
el.off(eName).on(eName,eHandler);
}
}
},
_openClick:function _openClick(e,el,options){
var midClick=options.midClick!==undefined?options.midClick:$.magnificPopup.defaults.midClick;


if(!midClick&&(e.which===2||e.ctrlKey||e.metaKey)){
return;
}

var disableOn=options.disableOn!==undefined?options.disableOn:$.magnificPopup.defaults.disableOn;

if(disableOn){
if($.isFunction(disableOn)){
if(!disableOn.call(mfp)){
return true;
}
}else{// else it's number
if(_window.width()<disableOn){
return true;
}
}
}

if(e.type){
e.preventDefault();

// This will prevent popup from closing if element is inside and popup is already opened
if(mfp.isOpen){
e.stopPropagation();
}
}


options.el=$(e.mfpEl);
if(options.delegate){
options.items=el.find(options.delegate);
}
mfp.open(options);
},


/**
     * Updates text on preloader
     */
updateStatus:function updateStatus(status,text){

if(mfp.preloader){
if(_prevStatus!==status){
mfp.container.removeClass('mfp-s-'+_prevStatus);
}

if(!text&&status==='loading'){
text=mfp.st.tLoading;
}

var data={
status:status,
text:text};

// allows to modify status
_mfpTrigger('UpdateStatus',data);

status=data.status;
text=data.text;

mfp.preloader.html(text);

mfp.preloader.find('a').on('click',function(e){
e.stopImmediatePropagation();
});

mfp.container.addClass('mfp-s-'+status);
_prevStatus=status;
}
},


/*
        "Private" helpers that aren't private at all
     */
// Check to close popup or not
// "target" is an element that was clicked
_checkIfClose:function _checkIfClose(target){

if($(target).hasClass(PREVENT_CLOSE_CLASS)){
return;
}

var closeOnContent=mfp.st.closeOnContentClick;
var closeOnBg=mfp.st.closeOnBgClick;

if(closeOnContent&&closeOnBg){
return true;
}else{

// We close the popup if click is on close button or on preloader. Or if there is no content.
if(!mfp.content||$(target).hasClass('mfp-close')||mfp.preloader&&target===mfp.preloader[0]){
return true;
}

// if click is outside the content
if(target!==mfp.content[0]&&!$.contains(mfp.content[0],target)){
if(closeOnBg){
// last check, if the clicked element is in DOM, (in case it's removed onclick)
if($.contains(document,target)){
return true;
}
}
}else if(closeOnContent){
return true;
}

}
return false;
},
_addClassToMFP:function _addClassToMFP(cName){
mfp.bgOverlay.addClass(cName);
mfp.wrap.addClass(cName);
},
_removeClassFromMFP:function _removeClassFromMFP(cName){
this.bgOverlay.removeClass(cName);
mfp.wrap.removeClass(cName);
},
_hasScrollBar:function _hasScrollBar(winHeight){
return(mfp.isIE7?_document.height():document.body.scrollHeight)>(winHeight||_window.height());
},
_setFocus:function _setFocus(){
(mfp.st.focus?mfp.content.find(mfp.st.focus).eq(0):mfp.wrap).focus();
},
_onFocusIn:function _onFocusIn(e){
if(e.target!==mfp.wrap[0]&&!$.contains(mfp.wrap[0],e.target)){
mfp._setFocus();
return false;
}
},
_parseMarkup:function _parseMarkup(template,values,item){
var arr;
if(item.data){
values=$.extend(item.data,values);
}
_mfpTrigger(MARKUP_PARSE_EVENT,[template,values,item]);

$.each(values,function(key,value){
if(value===undefined||value===false){
return true;
}
arr=key.split('_');
if(arr.length>1){
var el=template.find(EVENT_NS+'-'+arr[0]);

if(el.length>0){
var attr=arr[1];
if(attr==='replaceWith'){
if(el[0]!==value[0]){
el.replaceWith(value);
}
}else if(attr==='img'){
if(el.is('img')){
el.attr('src',value);
}else{
el.replaceWith('<img src="'+value+'" class="'+el.attr('class')+'" />');
}
}else{
el.attr(arr[1],value);
}
}

}else{
template.find(EVENT_NS+'-'+key).html(value);
}
});
},

_getScrollbarSize:function _getScrollbarSize(){
// thx David
if(mfp.scrollbarSize===undefined){
var scrollDiv=document.createElement("div");
scrollDiv.style.cssText='width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
document.body.appendChild(scrollDiv);
mfp.scrollbarSize=scrollDiv.offsetWidth-scrollDiv.clientWidth;
document.body.removeChild(scrollDiv);
}
return mfp.scrollbarSize;
}};

/* MagnificPopup core prototype end */




/**
 * Public static functions
 */
$.magnificPopup={
instance:null,
proto:MagnificPopup.prototype,
modules:[],

open:function open(options,index){
_checkInstance();

if(!options){
options={};
}else{
options=$.extend(true,{},options);
}


options.isObj=true;
options.index=index||0;
return this.instance.open(options);
},

close:function close(){
return $.magnificPopup.instance&&$.magnificPopup.instance.close();
},

registerModule:function registerModule(name,module){
if(module.options){
$.magnificPopup.defaults[name]=module.options;
}
$.extend(this.proto,module.proto);
this.modules.push(name);
},

defaults:{

// Info about options is in docs:
// http://dimsemenov.com/plugins/magnific-popup/documentation.html#options

disableOn:0,

key:null,

midClick:false,

mainClass:'',

preloader:true,

focus:'',// CSS selector of input to focus after popup is opened

closeOnContentClick:false,

closeOnBgClick:true,

closeBtnInside:true,

showCloseBtn:true,

enableEscapeKey:true,

modal:false,

alignTop:false,

removalDelay:0,

prependTo:null,

fixedContentPos:'auto',

fixedBgPos:'auto',

overflowY:'auto',

closeMarkup:'<button title="%title%" type="button" class="mfp-close">&times;</button>',

tClose:'Close (Esc)',

tLoading:'Loading...'}};






$.fn.magnificPopup=function(options){
_checkInstance();

var jqEl=$(this);

// We call some API method of first param is a string
if(typeof options==="string"){

if(options==='open'){
var items,
itemOpts=_isJQ?jqEl.data('magnificPopup'):jqEl[0].magnificPopup,
index=parseInt(arguments[1],10)||0;

if(itemOpts.items){
items=itemOpts.items[index];
}else{
items=jqEl;
if(itemOpts.delegate){
items=items.find(itemOpts.delegate);
}
items=items.eq(index);
}
mfp._openClick({mfpEl:items},jqEl,itemOpts);
}else{
if(mfp.isOpen)
mfp[options].apply(mfp,Array.prototype.slice.call(arguments,1));
}

}else{
// clone options obj
options=$.extend(true,{},options);

/*
         * As Zepto doesn't support .data() method for objects
         * and it works only in normal browsers
         * we assign "options" object directly to the DOM element. FTW!
         */
if(_isJQ){
jqEl.data('magnificPopup',options);
}else{
jqEl[0].magnificPopup=options;
}

mfp.addGroup(jqEl,options);

}
return jqEl;
};


//Quick benchmark
/*
var start = performance.now(),
    i,
    rounds = 1000;

for(i = 0; i < rounds; i++) {

}
console.log('Test #1:', performance.now() - start);

start = performance.now();
for(i = 0; i < rounds; i++) {

}
console.log('Test #2:', performance.now() - start);
*/


/*>>core*/

/*>>inline*/

var INLINE_NS='inline',
_hiddenClass,
_inlinePlaceholder,
_lastInlineElement,
_putInlineElementsBack=function _putInlineElementsBack(){
if(_lastInlineElement){
_inlinePlaceholder.after(_lastInlineElement.addClass(_hiddenClass)).detach();
_lastInlineElement=null;
}
};

$.magnificPopup.registerModule(INLINE_NS,{
options:{
hiddenClass:'hide',// will be appended with `mfp-` prefix
markup:'',
tNotFound:'Content not found'},

proto:{

initInline:function initInline(){
mfp.types.push(INLINE_NS);

_mfpOn(CLOSE_EVENT+'.'+INLINE_NS,function(){
_putInlineElementsBack();
});
},

getInline:function getInline(item,template){

_putInlineElementsBack();

if(item.src){
var inlineSt=mfp.st.inline,
el=$(item.src);

if(el.length){

// If target element has parent - we replace it with placeholder and put it back after popup is closed
var parent=el[0].parentNode;
if(parent&&parent.tagName){
if(!_inlinePlaceholder){
_hiddenClass=inlineSt.hiddenClass;
_inlinePlaceholder=_getEl(_hiddenClass);
_hiddenClass='mfp-'+_hiddenClass;
}
// replace target inline element with placeholder
_lastInlineElement=el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
}

mfp.updateStatus('ready');
}else{
mfp.updateStatus('error',inlineSt.tNotFound);
el=$('<div>');
}

item.inlineElement=el;
return el;
}

mfp.updateStatus('ready');
mfp._parseMarkup(template,{},item);
return template;
}}});



/*>>inline*/

/*>>ajax*/
var AJAX_NS='ajax',
_ajaxCur,
_removeAjaxCursor=function _removeAjaxCursor(){
if(_ajaxCur){
$(document.body).removeClass(_ajaxCur);
}
},
_destroyAjaxRequest=function _destroyAjaxRequest(){
_removeAjaxCursor();
if(mfp.req){
mfp.req.abort();
}
};

$.magnificPopup.registerModule(AJAX_NS,{

options:{
settings:null,
cursor:'mfp-ajax-cur',
tError:'<a href="%url%">The content</a> could not be loaded.'},


proto:{
initAjax:function initAjax(){
mfp.types.push(AJAX_NS);
_ajaxCur=mfp.st.ajax.cursor;

_mfpOn(CLOSE_EVENT+'.'+AJAX_NS,_destroyAjaxRequest);
_mfpOn('BeforeChange.'+AJAX_NS,_destroyAjaxRequest);
},
getAjax:function getAjax(item){

if(_ajaxCur){
$(document.body).addClass(_ajaxCur);
}

mfp.updateStatus('loading');

var opts=$.extend({
url:item.src,
success:function success(data,textStatus,jqXHR){
var temp={
data:data,
xhr:jqXHR};


_mfpTrigger('ParseAjax',temp);

mfp.appendContent($(temp.data),AJAX_NS);

item.finished=true;

_removeAjaxCursor();

mfp._setFocus();

setTimeout(function(){
mfp.wrap.addClass(READY_CLASS);
},16);

mfp.updateStatus('ready');

_mfpTrigger('AjaxContentAdded');
},
error:function error(){
_removeAjaxCursor();
item.finished=item.loadError=true;
mfp.updateStatus('error',mfp.st.ajax.tError.replace('%url%',item.src));
}},
mfp.st.ajax.settings);

mfp.req=$.ajax(opts);

return'';
}}});









/*>>ajax*/

/*>>image*/
var _imgInterval,
_getTitle=function _getTitle(item){
if(item.data&&item.data.title!==undefined)
return item.data.title;

var src=mfp.st.image.titleSrc;

if(src){
if($.isFunction(src)){
return src.call(mfp,item);
}else if(item.el){
return item.el.attr(src)||'';
}
}
return'';
};

$.magnificPopup.registerModule('image',{

options:{
markup:'<div class="mfp-figure">'+
'<div class="mfp-close"></div>'+
'<figure>'+
'<div class="mfp-img"></div>'+
'<figcaption>'+
'<div class="mfp-bottom-bar">'+
'<div class="mfp-title"></div>'+
'<div class="mfp-counter"></div>'+
'</div>'+
'</figcaption>'+
'</figure>'+
'</div>',
cursor:'mfp-zoom-out-cur',
titleSrc:'title',
verticalFit:true,
tError:'<a href="%url%">The image</a> could not be loaded.'},


proto:{
initImage:function initImage(){
var imgSt=mfp.st.image,
ns='.image';

mfp.types.push('image');

_mfpOn(OPEN_EVENT+ns,function(){
if(mfp.currItem.type==='image'&&imgSt.cursor){
$(document.body).addClass(imgSt.cursor);
}
});

_mfpOn(CLOSE_EVENT+ns,function(){
if(imgSt.cursor){
$(document.body).removeClass(imgSt.cursor);
}
_window.off('resize'+EVENT_NS);
});

_mfpOn('Resize'+ns,mfp.resizeImage);
if(mfp.isLowIE){
_mfpOn('AfterChange',mfp.resizeImage);
}
},
resizeImage:function resizeImage(){
var item=mfp.currItem;
if(!item||!item.img)return;

if(mfp.st.image.verticalFit){
var decr=0;
// fix box-sizing in ie7/8
if(mfp.isLowIE){
decr=parseInt(item.img.css('padding-top'),10)+parseInt(item.img.css('padding-bottom'),10);
}
item.img.css('max-height',mfp.wH-decr);
}
},
_onImageHasSize:function _onImageHasSize(item){
if(item.img){

item.hasSize=true;

if(_imgInterval){
clearInterval(_imgInterval);
}

item.isCheckingImgSize=false;

_mfpTrigger('ImageHasSize',item);

if(item.imgHidden){
if(mfp.content)
mfp.content.removeClass('mfp-loading');

item.imgHidden=false;
}

}
},

/**
         * Function that loops until the image has size to display elements that rely on it asap
         */
findImageSize:function findImageSize(item){

var counter=0,
img=item.img[0],
mfpSetInterval=function mfpSetInterval(delay){

if(_imgInterval){
clearInterval(_imgInterval);
}
// decelerating interval that checks for size of an image
_imgInterval=setInterval(function(){
if(img.naturalWidth>0){
mfp._onImageHasSize(item);
return;
}

if(counter>200){
clearInterval(_imgInterval);
}

counter++;
if(counter===3){
mfpSetInterval(10);
}else if(counter===40){
mfpSetInterval(50);
}else if(counter===100){
mfpSetInterval(500);
}
},delay);
};

mfpSetInterval(1);
},

getImage:function getImage(item,template){

var guard=0,

// image load complete handler
onLoadComplete=function onLoadComplete(){
if(item){
if(item.img[0].complete){
item.img.off('.mfploader');

if(item===mfp.currItem){
mfp._onImageHasSize(item);

mfp.updateStatus('ready');
}

item.hasSize=true;
item.loaded=true;

_mfpTrigger('ImageLoadComplete');

}else
{
// if image complete check fails 200 times (20 sec), we assume that there was an error.
guard++;
if(guard<200){
setTimeout(onLoadComplete,100);
}else{
onLoadError();
}
}
}
},

// image error handler
onLoadError=function onLoadError(){
if(item){
item.img.off('.mfploader');
if(item===mfp.currItem){
mfp._onImageHasSize(item);
mfp.updateStatus('error',imgSt.tError.replace('%url%',item.src));
}

item.hasSize=true;
item.loaded=true;
item.loadError=true;
}
},
imgSt=mfp.st.image;


var el=template.find('.mfp-img');
if(el.length){
var img=document.createElement('img');
img.className='mfp-img';
if(item.el&&item.el.find('img').length){
img.alt=item.el.find('img').attr('alt');
}
item.img=$(img).on('load.mfploader',onLoadComplete).on('error.mfploader',onLoadError);
img.src=item.src;

// without clone() "error" event is not firing when IMG is replaced by new IMG
// TODO: find a way to avoid such cloning
if(el.is('img')){
item.img=item.img.clone();
}

img=item.img[0];
if(img.naturalWidth>0){
item.hasSize=true;
}else if(!img.width){
item.hasSize=false;
}
}

mfp._parseMarkup(template,{
title:_getTitle(item),
img_replaceWith:item.img},
item);

mfp.resizeImage();

if(item.hasSize){
if(_imgInterval)clearInterval(_imgInterval);

if(item.loadError){
template.addClass('mfp-loading');
mfp.updateStatus('error',imgSt.tError.replace('%url%',item.src));
}else{
template.removeClass('mfp-loading');
mfp.updateStatus('ready');
}
return template;
}

mfp.updateStatus('loading');
item.loading=true;

if(!item.hasSize){
item.imgHidden=true;
template.addClass('mfp-loading');
mfp.findImageSize(item);
}

return template;
}}});





/*>>image*/

/*>>zoom*/
var hasMozTransform,
getHasMozTransform=function getHasMozTransform(){
if(hasMozTransform===undefined){
hasMozTransform=document.createElement('p').style.MozTransform!==undefined;
}
return hasMozTransform;
};

$.magnificPopup.registerModule('zoom',{

options:{
enabled:false,
easing:'ease-in-out',
duration:300,
opener:function opener(element){
return element.is('img')?element:element.find('img');
}},


proto:{

initZoom:function initZoom(){
var zoomSt=mfp.st.zoom,
ns='.zoom',
image;

if(!zoomSt.enabled||!mfp.supportsTransition){
return;
}

var duration=zoomSt.duration,
getElToAnimate=function getElToAnimate(image){
var newImg=image.clone().removeAttr('style').removeAttr('class').addClass('mfp-animated-image'),
transition='all '+zoomSt.duration/1000+'s '+zoomSt.easing,
cssObj={
position:'fixed',
zIndex:9999,
left:0,
top:0,
'-webkit-backface-visibility':'hidden'},

t='transition';

cssObj['-webkit-'+t]=cssObj['-moz-'+t]=cssObj['-o-'+t]=cssObj[t]=transition;

newImg.css(cssObj);
return newImg;
},
showMainContent=function showMainContent(){
mfp.content.css('visibility','visible');
},
openTimeout,
animatedImg;

_mfpOn('BuildControls'+ns,function(){
if(mfp._allowZoom()){

clearTimeout(openTimeout);
mfp.content.css('visibility','hidden');

// Basically, all code below does is clones existing image, puts in on top of the current one and animated it

image=mfp._getItemToZoom();

if(!image){
showMainContent();
return;
}

animatedImg=getElToAnimate(image);

animatedImg.css(mfp._getOffset());

mfp.wrap.append(animatedImg);

openTimeout=setTimeout(function(){
animatedImg.css(mfp._getOffset(true));
openTimeout=setTimeout(function(){

showMainContent();

setTimeout(function(){
animatedImg.remove();
image=animatedImg=null;
_mfpTrigger('ZoomAnimationEnded');
},16);// avoid blink when switching images

},duration);// this timeout equals animation duration

},16);// by adding this timeout we avoid short glitch at the beginning of animation


// Lots of timeouts...
}
});
_mfpOn(BEFORE_CLOSE_EVENT+ns,function(){
if(mfp._allowZoom()){

clearTimeout(openTimeout);

mfp.st.removalDelay=duration;

if(!image){
image=mfp._getItemToZoom();
if(!image){
return;
}
animatedImg=getElToAnimate(image);
}


animatedImg.css(mfp._getOffset(true));
mfp.wrap.append(animatedImg);
mfp.content.css('visibility','hidden');

setTimeout(function(){
animatedImg.css(mfp._getOffset());
},16);
}

});

_mfpOn(CLOSE_EVENT+ns,function(){
if(mfp._allowZoom()){
showMainContent();
if(animatedImg){
animatedImg.remove();
}
image=null;
}
});
},

_allowZoom:function _allowZoom(){
return mfp.currItem.type==='image';
},

_getItemToZoom:function _getItemToZoom(){
if(mfp.currItem.hasSize){
return mfp.currItem.img;
}else{
return false;
}
},

// Get element postion relative to viewport
_getOffset:function _getOffset(isLarge){
var el;
if(isLarge){
el=mfp.currItem.img;
}else{
el=mfp.st.zoom.opener(mfp.currItem.el||mfp.currItem);
}

var offset=el.offset();
var paddingTop=parseInt(el.css('padding-top'),10);
var paddingBottom=parseInt(el.css('padding-bottom'),10);
offset.top-=$(window).scrollTop()-paddingTop;


/*

            Animating left + top + width/height looks glitchy in Firefox, but perfect in Chrome. And vice-versa.

             */
var obj={
width:el.width(),
// fix Zepto height+padding issue
height:(_isJQ?el.innerHeight():el[0].offsetHeight)-paddingBottom-paddingTop};


// I hate to do this, but there is no another option
if(getHasMozTransform()){
obj['-moz-transform']=obj['transform']='translate('+offset.left+'px,'+offset.top+'px)';
}else{
obj.left=offset.left;
obj.top=offset.top;
}
return obj;
}}});






/*>>zoom*/

/*>>iframe*/

var IFRAME_NS='iframe',
_emptyPage='//about:blank',

_fixIframeBugs=function _fixIframeBugs(isShowing){
if(mfp.currTemplate[IFRAME_NS]){
var el=mfp.currTemplate[IFRAME_NS].find('iframe');
if(el.length){
// reset src after the popup is closed to avoid "video keeps playing after popup is closed" bug
if(!isShowing){
el[0].src=_emptyPage;
}

// IE8 black screen bug fix
if(mfp.isIE8){
el.css('display',isShowing?'block':'none');
}
}
}
};

$.magnificPopup.registerModule(IFRAME_NS,{

options:{
markup:'<div class="mfp-iframe-scaler">'+
'<div class="mfp-close"></div>'+
'<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>'+
'</div>',

srcAction:'iframe_src',

// we don't care and support only one default type of URL by default
patterns:{
youtube:{
index:'youtube.com',
id:'v=',
src:'//www.youtube.com/embed/%id%?autoplay=1'},

vimeo:{
index:'vimeo.com/',
id:'/',
src:'//player.vimeo.com/video/%id%?autoplay=1'},

gmaps:{
index:'//maps.google.',
src:'%id%&output=embed'}}},




proto:{
initIframe:function initIframe(){
mfp.types.push(IFRAME_NS);

_mfpOn('BeforeChange',function(e,prevType,newType){
if(prevType!==newType){
if(prevType===IFRAME_NS){
_fixIframeBugs();// iframe if removed
}else if(newType===IFRAME_NS){
_fixIframeBugs(true);// iframe is showing
}
}// else {
// iframe source is switched, don't do anything
//}
});

_mfpOn(CLOSE_EVENT+'.'+IFRAME_NS,function(){
_fixIframeBugs();
});
},

getIframe:function getIframe(item,template){
var embedSrc=item.src;
var iframeSt=mfp.st.iframe;

$.each(iframeSt.patterns,function(){
if(embedSrc.indexOf(this.index)>-1){
if(this.id){
if(typeof this.id==='string'){
embedSrc=embedSrc.substr(embedSrc.lastIndexOf(this.id)+this.id.length,embedSrc.length);
}else{
embedSrc=this.id.call(this,embedSrc);
}
}
embedSrc=this.src.replace('%id%',embedSrc);
return false;// break;
}
});

var dataObj={};
if(iframeSt.srcAction){
dataObj[iframeSt.srcAction]=embedSrc;
}
mfp._parseMarkup(template,dataObj,item);

mfp.updateStatus('ready');

return template;
}}});





/*>>iframe*/

/*>>gallery*/
/**
 * Get looped index depending on number of slides
 */
var _getLoopedId=function _getLoopedId(index){
var numSlides=mfp.items.length;
if(index>numSlides-1){
return index-numSlides;
}else if(index<0){
return numSlides+index;
}
return index;
},
_replaceCurrTotal=function _replaceCurrTotal(text,curr,total){
return text.replace(/%curr%/gi,curr+1).replace(/%total%/gi,total);
};

$.magnificPopup.registerModule('gallery',{

options:{
enabled:false,
arrowMarkup:'<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
preload:[0,2],
navigateByImgClick:true,
arrows:true,

tPrev:'Previous (Left arrow key)',
tNext:'Next (Right arrow key)',
tCounter:'%curr% of %total%'},


proto:{
initGallery:function initGallery(){

var gSt=mfp.st.gallery,
ns='.mfp-gallery',
supportsFastClick=Boolean($.fn.mfpFastClick);

mfp.direction=true;// true - next, false - prev

if(!gSt||!gSt.enabled)return false;

_wrapClasses+=' mfp-gallery';

_mfpOn(OPEN_EVENT+ns,function(){

if(gSt.navigateByImgClick){
mfp.wrap.on('click'+ns,'.mfp-img',function(){
if(mfp.items.length>1){
mfp.next();
return false;
}
});
}

_document.on('keydown'+ns,function(e){
if(e.keyCode===37){
mfp.prev();
}else if(e.keyCode===39){
mfp.next();
}
});
});

_mfpOn('UpdateStatus'+ns,function(e,data){
if(data.text){
data.text=_replaceCurrTotal(data.text,mfp.currItem.index,mfp.items.length);
}
});

_mfpOn(MARKUP_PARSE_EVENT+ns,function(e,element,values,item){
var l=mfp.items.length;
values.counter=l>1?_replaceCurrTotal(gSt.tCounter,item.index,l):'';
});

_mfpOn('BuildControls'+ns,function(){
if(mfp.items.length>1&&gSt.arrows&&!mfp.arrowLeft){
var markup=gSt.arrowMarkup,
arrowLeft=mfp.arrowLeft=$(markup.replace(/%title%/gi,gSt.tPrev).replace(/%dir%/gi,'left')).addClass(PREVENT_CLOSE_CLASS),
arrowRight=mfp.arrowRight=$(markup.replace(/%title%/gi,gSt.tNext).replace(/%dir%/gi,'right')).addClass(PREVENT_CLOSE_CLASS);

var eName=supportsFastClick?'mfpFastClick':'click';
arrowLeft[eName](function(){
mfp.prev();
});
arrowRight[eName](function(){
mfp.next();
});

// Polyfill for :before and :after (adds elements with classes mfp-a and mfp-b)
if(mfp.isIE7){
_getEl('b',arrowLeft[0],false,true);
_getEl('a',arrowLeft[0],false,true);
_getEl('b',arrowRight[0],false,true);
_getEl('a',arrowRight[0],false,true);
}

mfp.container.append(arrowLeft.add(arrowRight));
}
});

_mfpOn(CHANGE_EVENT+ns,function(){
if(mfp._preloadTimeout)clearTimeout(mfp._preloadTimeout);

mfp._preloadTimeout=setTimeout(function(){
mfp.preloadNearbyImages();
mfp._preloadTimeout=null;
},16);
});


_mfpOn(CLOSE_EVENT+ns,function(){
_document.off(ns);
mfp.wrap.off('click'+ns);

if(mfp.arrowLeft&&supportsFastClick){
mfp.arrowLeft.add(mfp.arrowRight).destroyMfpFastClick();
}
mfp.arrowRight=mfp.arrowLeft=null;
});

},
next:function next(){
mfp.direction=true;
mfp.index=_getLoopedId(mfp.index+1);
mfp.updateItemHTML();
},
prev:function prev(){
mfp.direction=false;
mfp.index=_getLoopedId(mfp.index-1);
mfp.updateItemHTML();
},
goTo:function goTo(newIndex){
mfp.direction=newIndex>=mfp.index;
mfp.index=newIndex;
mfp.updateItemHTML();
},
preloadNearbyImages:function preloadNearbyImages(){
var p=mfp.st.gallery.preload,
preloadBefore=Math.min(p[0],mfp.items.length),
preloadAfter=Math.min(p[1],mfp.items.length),
i;

for(i=1;i<=(mfp.direction?preloadAfter:preloadBefore);i++){
mfp._preloadItem(mfp.index+i);
}
for(i=1;i<=(mfp.direction?preloadBefore:preloadAfter);i++){
mfp._preloadItem(mfp.index-i);
}
},
_preloadItem:function _preloadItem(index){
index=_getLoopedId(index);

if(mfp.items[index].preloaded){
return;
}

var item=mfp.items[index];
if(!item.parsed){
item=mfp.parseEl(index);
}

_mfpTrigger('LazyLoad',item);

if(item.type==='image'){
item.img=$('<img class="mfp-img" />').on('load.mfploader',function(){
item.hasSize=true;
}).on('error.mfploader',function(){
item.hasSize=true;
item.loadError=true;
_mfpTrigger('LazyLoadError',item);
}).attr('src',item.src);
}


item.preloaded=true;
}}});



/*
Touch Support that might be implemented some day

addSwipeGesture: function() {
    var startX,
        moved,
        multipleTouches;

        return;

    var namespace = '.mfp',
        addEventNames = function(pref, down, move, up, cancel) {
            mfp._tStart = pref + down + namespace;
            mfp._tMove = pref + move + namespace;
            mfp._tEnd = pref + up + namespace;
            mfp._tCancel = pref + cancel + namespace;
        };

    if(window.navigator.msPointerEnabled) {
        addEventNames('MSPointer', 'Down', 'Move', 'Up', 'Cancel');
    } else if('ontouchstart' in window) {
        addEventNames('touch', 'start', 'move', 'end', 'cancel');
    } else {
        return;
    }
    _window.on(mfp._tStart, function(e) {
        var oE = e.originalEvent;
        multipleTouches = moved = false;
        startX = oE.pageX || oE.changedTouches[0].pageX;
    }).on(mfp._tMove, function(e) {
        if(e.originalEvent.touches.length > 1) {
            multipleTouches = e.originalEvent.touches.length;
        } else {
            //e.preventDefault();
            moved = true;
        }
    }).on(mfp._tEnd + ' ' + mfp._tCancel, function(e) {
        if(moved && !multipleTouches) {
            var oE = e.originalEvent,
                diff = startX - (oE.pageX || oE.changedTouches[0].pageX);

            if(diff > 20) {
                mfp.next();
            } else if(diff < -20) {
                mfp.prev();
            }
        }
    });
},
*/


/*>>gallery*/

/*>>retina*/

var RETINA_NS='retina';

$.magnificPopup.registerModule(RETINA_NS,{
options:{
replaceSrc:function replaceSrc(item){
return item.src.replace(/\.\w+$/,function(m){return'@2x'+m;});
},
ratio:1// Function or number.  Set to 1 to disable.
},
proto:{
initRetina:function initRetina(){
if(window.devicePixelRatio>1){

var st=mfp.st.retina,
ratio=st.ratio;

ratio=!isNaN(ratio)?ratio:ratio();

if(ratio>1){
_mfpOn('ImageHasSize'+'.'+RETINA_NS,function(e,item){
item.img.css({
'max-width':item.img[0].naturalWidth/ratio,
'width':'100%'});

});
_mfpOn('ElementParse'+'.'+RETINA_NS,function(e,item){
item.src=st.replaceSrc(item,ratio);
});
}
}

}}});



/*>>retina*/

/*>>fastclick*/
/**
 * FastClick event implementation. (removes 300ms delay on touch devices)
 * Based on https://developers.google.com/mobile/articles/fast_buttons
 *
 * You may use it outside the Magnific Popup by calling just:
 *
 * $('.your-el').mfpFastClick(function() {
 *     console.log('Clicked!');
 * });
 *
 * To unbind:
 * $('.your-el').destroyMfpFastClick();
 *
 *
 * Note that it's a very basic and simple implementation, it blocks ghost click on the same element where it was bound.
 * If you need something more advanced, use plugin by FT Labs https://github.com/ftlabs/fastclick
 *
 */

(function(){
var ghostClickDelay=1000,
supportsTouch='ontouchstart'in window,
unbindTouchMove=function unbindTouchMove(){
_window.off('touchmove'+ns+' touchend'+ns);
},
eName='mfpFastClick',
ns='.'+eName;


// As Zepto.js doesn't have an easy way to add custom events (like jQuery), so we implement it in this way
$.fn.mfpFastClick=function(callback){

return $(this).each(function(){

var elem=$(this),
lock;

if(supportsTouch){

var timeout,
startX,
startY,
pointerMoved,
point,
numPointers;

elem.on('touchstart'+ns,function(e){
pointerMoved=false;
numPointers=1;

point=e.originalEvent?e.originalEvent.touches[0]:e.touches[0];
startX=point.clientX;
startY=point.clientY;

_window.on('touchmove'+ns,function(e){
point=e.originalEvent?e.originalEvent.touches:e.touches;
numPointers=point.length;
point=point[0];
if(Math.abs(point.clientX-startX)>10||
Math.abs(point.clientY-startY)>10){
pointerMoved=true;
unbindTouchMove();
}
}).on('touchend'+ns,function(e){
unbindTouchMove();
if(pointerMoved||numPointers>1){
return;
}
lock=true;
e.preventDefault();
clearTimeout(timeout);
timeout=setTimeout(function(){
lock=false;
},ghostClickDelay);
callback();
});
});

}

elem.on('click'+ns,function(){
if(!lock){
callback();
}
});
});
};

$.fn.destroyMfpFastClick=function(){
$(this).off('touchstart'+ns+' click'+ns);
if(supportsTouch)_window.off('touchmove'+ns+' touchend'+ns);
};
})();

/*>>fastclick*/
_checkInstance();});
'use strict';//
// Meerkat JS
// jquery.meerkat.1.3.js
// ==========================
jQuery.fn.extend({

meerkat:function meerkat(options){

var defaults={
background:'none',
opacity:null,
height:'auto',
width:'100%',
position:'bottom',
close:'.close',
dontShowAgain:'#dont-show',
dontShowAgainAuto:false,
animationIn:'none',
animationOut:null,
easingIn:'swing',
easingOut:'swing',
animationSpeed:'normal',
cookieExpires:0,
removeCookie:'.removeCookie',
delay:0,
onMeerkatShow:function onMeerkatShow(){},
timer:null};


var settings=jQuery.extend(defaults,options);


if(jQuery.easing.def){
settings.easingIn=settings.easingIn;
settings.easingOut=settings.easingOut;
}else{
settings.easingIn='swing';
settings.easingOut='swing';
}

if(settings.animationOut===null){
settings.animationOut=settings.animationIn;
}

settings.delay=settings.delay*1000;
if(settings.timer!=null){
settings.timer=settings.timer*1000;
}

function createCookie(name,value,days){
if(days){
var date=new Date();
date.setTime(date.getTime()+days*24*60*60*1000);
var expires="; expires="+date.toGMTString();
}else
{
var expires="";
}
document.cookie=name+"="+value+expires+"; path=/";
}

function readCookie(name){
var nameEQ=name+"=";
var ca=document.cookie.split(';');
for(var i=0;i<ca.length;i++){
var c=ca[i];
while(c.charAt(0)===' '){c=c.substring(1,c.length);}
if(c.indexOf(nameEQ)===0)return c.substring(nameEQ.length,c.length);
}
return null;
}

function eraseCookie(name){
createCookie(name,"",-1);
}
jQuery(settings.removeCookie).click(function(){eraseCookie('meerkat');});

return this.each(function(){
var element=jQuery(this);
if(readCookie('meerkat')!="dontshow"){var


animateMeerkat=function animateMeerkat(showOrHide,fadeOrSlide){
var meerkatWrap=jQuery('#meerkat-wrap');
if(fadeOrSlide==="slide"){
if(settings.position==="left"||settings.position==="right"){
var animationType='width';
}else{
var animationType='height';
}
}else{
var animationType="opacity";
}
var animationProperty={};
animationProperty[animationType]=showOrHide;

if(showOrHide==="show"){
if(fadeOrSlide!=="none"){
if(settings.delay>0){
jQuery(meerkatWrap).hide().delay(settings.delay).animate(animationProperty,settings.animationSpeed,settings.easingIn);
}else{
jQuery(meerkatWrap).hide().animate(animationProperty,settings.animationSpeed,settings.easingIn);
}
}else if(fadeOrSlide==="none"&&settings.delay>0){
jQuery(meerkatWrap).hide().delay(settings.delay).show(0);
}else{
jQuery(meerkatWrap).show();
}
jQuery(element).show(0);
}

if(showOrHide==="hide"){
if(fadeOrSlide!=="none"){
if(settings.timer!==null){
jQuery(meerkatWrap).delay(settings.timer).animate(animationProperty,settings.animationSpeed,settings.easingOut,
function(){
jQuery(this).destroyMeerkat();
if(settings.dontShowAgainAuto===true){createCookie('meerkat','dontshow',settings.cookieExpires);}
});
}
jQuery(settings.close).click(function(){
jQuery(meerkatWrap).stop().animate(animationProperty,settings.animationSpeed,settings.easingOut,function(){jQuery(this).destroyMeerkat();});
return false;
});
jQuery(settings.dontShowAgain).click(function(){
jQuery(meerkatWrap).stop().animate(animationProperty,settings.animationSpeed,settings.easingOut,function(){jQuery(this).destroyMeerkat();});
createCookie('meerkat','dontshow',settings.cookieExpires);
return false;
});
}else if(fadeOrSlide==="none"&&settings.timer!==null){
jQuery(meerkatWrap).delay(settings.timer).hide(0).queue(function(){
jQuery(this).destroyMeerkat();
});
}else{
jQuery(settings.close).click(function(){
jQuery(meerkatWrap).hide().queue(function(){
jQuery(this).destroyMeerkat();
});
return false;
});
jQuery(settings.dontShowAgain).click(function(){
jQuery(meerkatWrap).hide().queue(function(){
jQuery(this).destroyMeerkat();
});
createCookie('meerkat','dontshow',settings.cookieExpires);
return false;
});
}
}
};settings.onMeerkatShow.call(this);


jQuery('html, body').css({'margin':'0','height':'100%'});
jQuery(element).wrap('<div id="meerkat-wrap"><div id="meerkat-container"></div></div>');
jQuery('#meerkat-wrap').css({'position':'fixed','z-index':'10000','width':settings.width,'height':settings.height}).css(settings.position,"0");
jQuery('#meerkat-container').css({'background':settings.background,'height':settings.height});

if(settings.position==="left"||settings.position==="right"){jQuery('#meerkat-wrap').css("top",0);}

if(settings.opacity!=null){
jQuery("#meerkat-wrap").prepend('<div class="opacity-layer"></div>');
jQuery('#meerkat-container').css({'background':'transparent','z-index':'2','position':'relative'});
jQuery(".opacity-layer").css({
'position':'absolute',
'top':'0',
'height':'100%',
'width':'100%',
'background':settings.background,
"opacity":settings.opacity});


}
if(jQuery.browser.msie&&jQuery.browser.version<=6){
jQuery('#meerkat-wrap').css({'position':'absolute','bottom':'-1px','z-index':'0'});
if(jQuery('#ie6-content-container').length==0){
jQuery('body').children().
filter(function(index){
return jQuery(this).attr('id')!='meerkat-wrap';
}).
wrapAll('<div id="ie6-content-container"></div>');
jQuery('html, body').css({'height':'100%','width':'100%','overflow':'hidden'});
jQuery('#ie6-content-container').css({'overflow':'auto','width':'100%','height':'100%','position':'absolute'});
var bgProperties=document.body.currentStyle.backgroundColor+" ";
bgProperties+=document.body.currentStyle.backgroundImage+" ";
bgProperties+=document.body.currentStyle.backgroundRepeat+" ";
bgProperties+=document.body.currentStyle.backgroundAttachment+" ";
bgProperties+=document.body.currentStyle.backgroundPositionX+" ";
bgProperties+=document.body.currentStyle.backgroundPositionY;
jQuery("body").css({'background':'none'});
jQuery("#ie6-content-container").css({'background':bgProperties});
}
var ie6ContentContainer=document.getElementById('ie6-content-container');
if(ie6ContentContainer.clientHeight<ie6ContentContainer.scrollHeight&&settings.position!='left'){
jQuery('#meerkat-wrap').css({'right':'17px'});
}
}

switch(settings.animationIn){

case"slide":
animateMeerkat("show","slide");
break;
case"fade":
animateMeerkat("show","fade");
break;
case"none":
animateMeerkat("show","none");
break;
default:
alert('The animationIn option only accepts "slide", "fade", or "none"');}


switch(settings.animationOut){

case"slide":
animateMeerkat("hide","slide");
break;

case"fade":
animateMeerkat("hide","fade");
break;

case"none":
if(settings.timer!=null){
jQuery('#meerkat-wrap').delay(settings.timer).hide(0).queue(function(){
jQuery(this).destroyMeerkat();
});
}
jQuery(settings.close).click(function(){
jQuery('#meerkat-wrap').hide().queue(function(){
jQuery(this).destroyMeerkat();
});
});
jQuery(settings.dontShowAgain).click(function(){
jQuery('#meerkat-wrap').hide().queue(function(){
jQuery(this).destroyMeerkat();
});
createCookie('meerkat','dontshow',settings.cookieExpires);
});
break;

default:
alert('The animationOut option only accepts "slide", "fade", or "none"');}

}else{
jQuery(element).hide();
}
});
},
destroyMeerkat:function destroyMeerkat(){
jQuery('#meerkat-wrap').replaceWith(jQuery('#meerkat-container').contents().hide());
}});
"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/*! Picturefill - v2.3.1 - 2015-04-09
* http://scottjehl.github.io/picturefill
* Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT */
window.matchMedia||(window.matchMedia=function(){"use strict";var a=window.styleMedia||window.media;if(!a){var b=document.createElement("style"),c=document.getElementsByTagName("script")[0],d=null;b.type="text/css",b.id="matchmediajs-test",c.parentNode.insertBefore(b,c),d="getComputedStyle"in window&&window.getComputedStyle(b,null)||b.currentStyle,a={matchMedium:function matchMedium(a){var c="@media "+a+"{ #matchmediajs-test { width: 1px; } }";return b.styleSheet?b.styleSheet.cssText=c:b.textContent=c,"1px"===d.width;}};}return function(b){return{matches:a.matchMedium(b||"all"),media:b||"all"};};}()),function(a,b,c){"use strict";function d(b){"object"==(typeof module==="undefined"?"undefined":_typeof(module))&&"object"==_typeof(module.exports)?module.exports=b:"function"==typeof define&&define.amd&&define("picturefill",function(){return b;}),"object"==(typeof a==="undefined"?"undefined":_typeof(a))&&(a.picturefill=b);}function e(a){var b,c,d,e,f,i=a||{};b=i.elements||g.getAllElements();for(var j=0,k=b.length;k>j;j++){if(c=b[j],d=c.parentNode,e=void 0,f=void 0,"IMG"===c.nodeName.toUpperCase()&&(c[g.ns]||(c[g.ns]={}),i.reevaluate||!c[g.ns].evaluated)){if(d&&"PICTURE"===d.nodeName.toUpperCase()){if(g.removeVideoShim(d),e=g.getMatch(c,d),e===!1)continue;}else e=void 0;(d&&"PICTURE"===d.nodeName.toUpperCase()||!g.sizesSupported&&c.srcset&&h.test(c.srcset))&&g.dodgeSrcset(c),e?(f=g.processSourceSet(e),g.applyBestCandidate(f,c)):(f=g.processSourceSet(c),(void 0===c.srcset||c[g.ns].srcset)&&g.applyBestCandidate(f,c)),c[g.ns].evaluated=!0;}}}function f(){function c(){clearTimeout(d),d=setTimeout(h,60);}g.initTypeDetects(),e();var d,f=setInterval(function(){return e(),/^loaded|^i|^c/.test(b.readyState)?void clearInterval(f):void 0;},250),h=function h(){e({reevaluate:!0});};a.addEventListener?a.addEventListener("resize",c,!1):a.attachEvent&&a.attachEvent("onresize",c);}if(a.HTMLPictureElement)return void d(function(){});b.createElement("picture");var g=a.picturefill||{},h=/\s+\+?\d+(e\d+)?w/;g.ns="picturefill",function(){g.srcsetSupported="srcset"in c,g.sizesSupported="sizes"in c,g.curSrcSupported="currentSrc"in c;}(),g.trim=function(a){return a.trim?a.trim():a.replace(/^\s+|\s+$/g,"");},g.makeUrl=function(){var a=b.createElement("a");return function(b){return a.href=b,a.href;};}(),g.restrictsMixedContent=function(){return"https:"===a.location.protocol;},g.matchesMedia=function(b){return a.matchMedia&&a.matchMedia(b).matches;},g.getDpr=function(){return a.devicePixelRatio||1;},g.getWidthFromLength=function(a){var c;if(!a||a.indexOf("%")>-1!=!1||!(parseFloat(a)>0||a.indexOf("calc(")>-1))return!1;a=a.replace("vw","%"),g.lengthEl||(g.lengthEl=b.createElement("div"),g.lengthEl.style.cssText="border:0;display:block;font-size:1em;left:0;margin:0;padding:0;position:absolute;visibility:hidden",g.lengthEl.className="helper-from-picturefill-js"),g.lengthEl.style.width="0px";try{g.lengthEl.style.width=a;}catch(d){}return b.body.appendChild(g.lengthEl),c=g.lengthEl.offsetWidth,0>=c&&(c=!1),b.body.removeChild(g.lengthEl),c;},g.detectTypeSupport=function(b,c){var d=new a.Image();return d.onerror=function(){g.types[b]=!1,e();},d.onload=function(){g.types[b]=1===d.width,e();},d.src=c,"pending";},g.types=g.types||{},g.initTypeDetects=function(){g.types["image/jpeg"]=!0,g.types["image/gif"]=!0,g.types["image/png"]=!0,g.types["image/svg+xml"]=b.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image","1.1"),g.types["image/webp"]=g.detectTypeSupport("image/webp","data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=");},g.verifyTypeSupport=function(a){var b=a.getAttribute("type");if(null===b||""===b)return!0;var c=g.types[b];return"string"==typeof c&&"pending"!==c?(g.types[b]=g.detectTypeSupport(b,c),"pending"):"function"==typeof c?(c(),"pending"):c;},g.parseSize=function(a){var b=/(\([^)]+\))?\s*(.+)/g.exec(a);return{media:b&&b[1],length:b&&b[2]};},g.findWidthFromSourceSize=function(c){for(var d,e=g.trim(c).split(/\s*,\s*/),f=0,h=e.length;h>f;f++){var i=e[f],j=g.parseSize(i),k=j.length,l=j.media;if(k&&(!l||g.matchesMedia(l))&&(d=g.getWidthFromLength(k)))break;}return d||Math.max(a.innerWidth||0,b.documentElement.clientWidth);},g.parseSrcset=function(a){for(var b=[];""!==a;){a=a.replace(/^\s+/g,"");var c,d=a.search(/\s/g),e=null;if(-1!==d){c=a.slice(0,d);var f=c.slice(-1);if((","===f||""===c)&&(c=c.replace(/,+$/,""),e=""),a=a.slice(d+1),null===e){var g=a.indexOf(",");-1!==g?(e=a.slice(0,g),a=a.slice(g+1)):(e=a,a="");}}else c=a,a="";(c||e)&&b.push({url:c,descriptor:e});}return b;},g.parseDescriptor=function(a,b){var c,d=b||"100vw",e=a&&a.replace(/(^\s+|\s+$)/g,""),f=g.findWidthFromSourceSize(d);if(e)for(var h=e.split(" "),i=h.length-1;i>=0;i--){var j=h[i],k=j&&j.slice(j.length-1);if("h"!==k&&"w"!==k||g.sizesSupported){if("x"===k){var l=j&&parseFloat(j,10);c=l&&!isNaN(l)?l:1;}}else c=parseFloat(parseInt(j,10)/f);}return c||1;},g.getCandidatesFromSourceSet=function(a,b){for(var c=g.parseSrcset(a),d=[],e=0,f=c.length;f>e;e++){var h=c[e];d.push({url:h.url,resolution:g.parseDescriptor(h.descriptor,b)});}return d;},g.dodgeSrcset=function(a){a.srcset&&(a[g.ns].srcset=a.srcset,a.srcset="",a.setAttribute("data-pfsrcset",a[g.ns].srcset));},g.processSourceSet=function(a){var b=a.getAttribute("srcset"),c=a.getAttribute("sizes"),d=[];return"IMG"===a.nodeName.toUpperCase()&&a[g.ns]&&a[g.ns].srcset&&(b=a[g.ns].srcset),b&&(d=g.getCandidatesFromSourceSet(b,c)),d;},g.backfaceVisibilityFix=function(a){var b=a.style||{},c="webkitBackfaceVisibility"in b,d=b.zoom;c&&(b.zoom=".999",c=a.offsetWidth,b.zoom=d);},g.setIntrinsicSize=function(){var c={},d=function d(a,b,c){b&&a.setAttribute("width",parseInt(b/c,10));};return function(e,f){var h;e[g.ns]&&!a.pfStopIntrinsicSize&&(void 0===e[g.ns].dims&&(e[g.ns].dims=e.getAttribute("width")||e.getAttribute("height")),e[g.ns].dims||(f.url in c?d(e,c[f.url],f.resolution):(h=b.createElement("img"),h.onload=function(){if(c[f.url]=h.width,!c[f.url])try{b.body.appendChild(h),c[f.url]=h.width||h.offsetWidth,b.body.removeChild(h);}catch(a){}e.src===f.url&&d(e,c[f.url],f.resolution),e=null,h.onload=null,h=null;},h.src=f.url)));};}(),g.applyBestCandidate=function(a,b){var c,d,e;a.sort(g.ascendingSort),d=a.length,e=a[d-1];for(var f=0;d>f;f++){if(c=a[f],c.resolution>=g.getDpr()){e=c;break;}}e&&(e.url=g.makeUrl(e.url),b.src!==e.url&&(g.restrictsMixedContent()&&"http:"===e.url.substr(0,"http:".length).toLowerCase()?void 0!==window.console&&console.warn("Blocked mixed content image "+e.url):(b.src=e.url,g.curSrcSupported||(b.currentSrc=b.src),g.backfaceVisibilityFix(b))),g.setIntrinsicSize(b,e));},g.ascendingSort=function(a,b){return a.resolution-b.resolution;},g.removeVideoShim=function(a){var b=a.getElementsByTagName("video");if(b.length){for(var c=b[0],d=c.getElementsByTagName("source");d.length;){a.insertBefore(d[0],c);}c.parentNode.removeChild(c);}},g.getAllElements=function(){for(var a=[],c=b.getElementsByTagName("img"),d=0,e=c.length;e>d;d++){var f=c[d];("PICTURE"===f.parentNode.nodeName.toUpperCase()||null!==f.getAttribute("srcset")||f[g.ns]&&null!==f[g.ns].srcset)&&a.push(f);}return a;},g.getMatch=function(a,b){for(var c,d=b.childNodes,e=0,f=d.length;f>e;e++){var h=d[e];if(1===h.nodeType){if(h===a)return c;if("SOURCE"===h.nodeName.toUpperCase()){null!==h.getAttribute("src")&&void 0!==(typeof console==="undefined"?"undefined":_typeof(console))&&console.warn("The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.");var i=h.getAttribute("media");if(h.getAttribute("srcset")&&(!i||g.matchesMedia(i))){var j=g.verifyTypeSupport(h);if(j===!0){c=h;break;}if("pending"===j)return!1;}}}}return c;},f(),e._=g,d(e);}(window,window.document,new window.Image());
/*! http://mths.be/placeholder v2.0.8 by @mathias */
// !function(a,b,c){function d(a){var b={},d=/^jQuery\d+$/;return c.each(a.attributes,function(a,c){c.specified&&!d.test(c.name)&&(b[c.name]=c.value)}),b}function e(a,b){var d=this,e=c(d);if(d.value==e.attr("placeholder")&&e.hasClass("placeholder"))if(e.data("placeholder-password")){if(e=e.hide().next().show().attr("id",e.removeAttr("id").data("placeholder-id")),a===!0)return e[0].value=b;e.focus()}else d.value="",e.removeClass("placeholder"),d==g()&&d.select()}function f(){var a,b=this,f=c(b),g=this.id;if(""==b.value){if("password"==b.type){if(!f.data("placeholder-textinput")){try{a=f.clone().attr({type:"text"})}catch(h){a=c("<input>").attr(c.extend(d(this),{type:"text"}))}a.removeAttr("name").data({"placeholder-password":f,"placeholder-id":g}).bind("focus.placeholder",e),f.data({"placeholder-textinput":a,"placeholder-id":g}).before(a)}f=f.removeAttr("id").hide().prev().attr("id",g).show()}f.addClass("placeholder"),f[0].value=f.attr("placeholder")}else f.removeClass("placeholder")}function g(){try{return b.activeElement}catch(a){}}var h,i,j="[object OperaMini]"==Object.prototype.toString.call(a.operamini),k="placeholder"in b.createElement("input")&&!j,l="placeholder"in b.createElement("textarea")&&!j,m=c.fn,n=c.valHooks,o=c.propHooks;k&&l?(i=m.placeholder=function(){return this},i.input=i.textarea=!0):(i=m.placeholder=function(){var a=this;return a.filter((k?"textarea":":input")+"[placeholder]").not(".placeholder").bind({"focus.placeholder":e,"blur.placeholder":f}).data("placeholder-enabled",!0).trigger("blur.placeholder"),a},i.input=k,i.textarea=l,h={get:function(a){var b=c(a),d=b.data("placeholder-password");return d?d[0].value:b.data("placeholder-enabled")&&b.hasClass("placeholder")?"":a.value},set:function(a,b){var d=c(a),h=d.data("placeholder-password");return h?h[0].value=b:d.data("placeholder-enabled")?(""==b?(a.value=b,a!=g()&&f.call(a)):d.hasClass("placeholder")?e.call(a,!0,b)||(a.value=b):a.value=b,d):a.value=b}},k||(n.input=h,o.value=h),l||(n.textarea=h,o.value=h),c(function(){c(b).delegate("form","submit.placeholder",function(){var a=c(".placeholder",this).each(e);setTimeout(function(){a.each(f)},10)})}),c(a).bind("beforeunload.placeholder",function(){c(".placeholder").each(function(){this.value=""})}))}(this,document,jQuery);
"use strict";
"use strict";(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;})({1:[function(require,module,exports){
(function(global){
/* eslint-env browser */
'use strict';

var _jquery=typeof window!=="undefined"?window['jQuery']:typeof global!=="undefined"?global['jQuery']:null;var _jquery2=_interopRequireDefault(_jquery);




var _accordion=require('modules/accordion.js');var _accordion2=_interopRequireDefault(_accordion);

var _custom=require('modules/custom.js');var _custom2=_interopRequireDefault(_custom);
var _searchBar=require('modules/searchBar.js');var _searchBar2=_interopRequireDefault(_searchBar);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}// import galleryWidget from 'modules/galleryWidget.js';

(function($){
$(document).ready(function(){
ready();

// Styleguide event when an element is rendered
$(window).bind("styleguide:onRendered",function(e){
ready();
});
});

// Initalizing all modules
function ready(){
// Prepare form inputs
// prepInputs();
// Initialize social share functionality.
// Replace the empty string parameter with your Facebook ID
// socialShare('');

// Initialize carousels
// carousel();

// Initialize qTip
// qtip();

// Initialize accordion
(0,_accordion2.default)();

// Initialize Plugins
// $('.magnific-trigger').magnificPopup({
//   type: 'inline',
// });

// Initialize Gallery Slider
// galleryWidget();

(0,_custom2.default)();
(0,_searchBar2.default)();
}
})(_jquery2.default);// import prepInputs from 'modules/prepinputs.js';
// import socialShare from 'modules/socialShare.js';
// import carousel from 'modules/carousel.js';
// import qtip from 'modules/qtip.js';

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{"modules/accordion.js":2,"modules/custom.js":3,"modules/searchBar.js":4}],2:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){
$('.toggle span.content-grid').click(function(e){
e.preventDefault();

var $this=$(this).parent();

// Collapse
if($this.find('.answer').hasClass('show')){
$this.find('.answer').removeClass('show');
$this.removeClass('active');
$this.find('.answer').slideUp(350);
}
// Expand
else{
$this.find('.answer').removeClass('show');
$('.toggle').removeClass('active');
$this.find('.answer').slideUp(350);
$this.addClass('active');
$this.find('.answer').toggleClass('show');
$this.find('.answer').slideToggle(350);
}
});
};

},{}],3:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){
$(".c-uie__dropdown-heading").hover(
function(){
$(".c-uie__dropdown-heading .c-uie__dropdown-options").addClass("drop");
},
function(){
$(".c-uie__dropdown-heading .c-uie__dropdown-options").removeClass("drop");
});


$(".cross").hide();
// $( ".c-menu__container" ).hide();

$(".hamburger").click(function(){
$(".c-menu__container").slideToggle("slow",function(){
$(".hamburger").hide();
$(".cross").show();
});
});

$(".cross").click(function(){
$(".c-menu__container").slideToggle("slow",function(){
$(".cross").hide();
$(".hamburger").show();
});
});
};

},{}],4:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){
var searchForm=$('.c-searchform');
var searchBtn=$('.js-search-btn');
var searchBtnClose=$('.c-searchform__close-btn');


if(searchForm.length){
searchBtn.click(function(e){
e.preventDefault();
searchForm.addClass('active');
});

searchBtnClose.click(function(e){
e.preventDefault();
searchForm.removeClass('active');
});
}
};

},{}]},{},[1]);