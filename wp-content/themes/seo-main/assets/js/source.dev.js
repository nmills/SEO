'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};function _toConsumableArray(arr){if(Array.isArray(arr)){for(var i=0,arr2=Array(arr.length);i<arr.length;i++){arr2[i]=arr[i];}return arr2;}else{return Array.from(arr);}}/* ! Magnific Popup - v1.0.0 - 2015-01-03
* http://dimsemenov.com/plugins/magnific-popup/
* Copyright (c) 2015 Dmitry Semenov; */
(function(factory){
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
/* >>core*/
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
/* jshint -W079 */
var mfp=void 0,// As we have only one instance of MagnificPopup object, we define it locally to not to use 'this'
MagnificPopup=function MagnificPopup(){},
_isJQ=!!window.jQuery,
_prevStatus=void 0,
_window=$(window),
_document=void 0,
_prevContentType=void 0,
_wrapClasses=void 0,
_currPopupType=void 0;


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
/* jshint -W020 */
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
mfp.isIE7=appVersion.indexOf('MSIE 7.')!==-1;
mfp.isIE8=appVersion.indexOf('MSIE 8.')!==-1;
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
var i=void 0;

if(data.isObj===false){
// convert jQuery collection to array to avoid conflicts later
mfp.items=data.items.toArray();

mfp.index=0;
var items=data.items,
item=void 0;
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
type=void 0;

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
var arr=void 0;
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
var scrollDiv=document.createElement('div');
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
if(typeof options==='string'){
if(options==='open'){
var items=void 0,
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
}else{var _mfp;
if(mfp.isOpen)
(_mfp=mfp)[options].apply(_mfp,_toConsumableArray(Array.prototype.slice.call(arguments,1)));
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


// Quick benchmark
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


/* >>core*/

/* >>inline*/

var INLINE_NS='inline',
_hiddenClass=void 0,
_inlinePlaceholder=void 0,
_lastInlineElement=void 0,
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



/* >>inline*/

/* >>ajax*/
var AJAX_NS='ajax',
_ajaxCur=void 0,
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




/* >>ajax*/

/* >>image*/
var _imgInterval=void 0,
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
}else{
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




/* >>image*/

/* >>zoom*/
var hasMozTransform=void 0,
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
image=void 0;

if(!zoomSt.enabled||!mfp.supportsTransition){
return;
}

var duration=zoomSt.duration,
getElToAnimate=function getElToAnimate(image){
var newImg=image.clone().removeAttr('style').removeAttr('class').addClass('mfp-animated-image'),
transition='all '+zoomSt.duration/1000+'s '+zoomSt.easing,
cssObj={
'position':'fixed',
'zIndex':9999,
'left':0,
'top':0,
'-webkit-backface-visibility':'hidden'},

t='transition';

cssObj['-webkit-'+t]=cssObj['-moz-'+t]=cssObj['-o-'+t]=cssObj[t]=transition;

newImg.css(cssObj);
return newImg;
},
showMainContent=function showMainContent(){
mfp.content.css('visibility','visible');
},
openTimeout=void 0,
animatedImg=void 0;

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
var el=void 0;
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





/* >>zoom*/

/* >>iframe*/

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
// }
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




/* >>iframe*/

/* >>gallery*/
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
i=void 0;

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


/* >>gallery*/

/* >>retina*/

var RETINA_NS='retina';

$.magnificPopup.registerModule(RETINA_NS,{
options:{
replaceSrc:function replaceSrc(item){
return item.src.replace(/\.\w+$/,function(m){
return'@2x'+m;
});
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



/* >>retina*/

/* >>fastclick*/
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
lock=void 0;

if(supportsTouch){
var timeout=void 0,
startX=void 0,
startY=void 0,
pointerMoved=void 0,
point=void 0,
numPointers=void 0;

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

/* >>fastclick*/
_checkInstance();
});
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
var expires='; expires='+date.toGMTString();
}else{
var expires='';
}
document.cookie=name+'='+value+expires+'; path=/';
}

function readCookie(name){
var nameEQ=name+'=';
var ca=document.cookie.split(';');
for(var i=0;i<ca.length;i++){
var c=ca[i];
while(c.charAt(0)===' '){c=c.substring(1,c.length);}
if(c.indexOf(nameEQ)===0)return c.substring(nameEQ.length,c.length);
}
return null;
}

function eraseCookie(name){
createCookie(name,'',-1);
}
jQuery(settings.removeCookie).click(function(){
eraseCookie('meerkat');
});

return this.each(function(){
var element=jQuery(this);
if(readCookie('meerkat')!='dontshow'){var


animateMeerkat=function animateMeerkat(showOrHide,fadeOrSlide){
var meerkatWrap=jQuery('#meerkat-wrap');
if(fadeOrSlide==='slide'){
if(settings.position==='left'||settings.position==='right'){
var animationType='width';
}else{
var animationType='height';
}
}else{
var animationType='opacity';
}
var animationProperty={};
animationProperty[animationType]=showOrHide;

if(showOrHide==='show'){
if(fadeOrSlide!=='none'){
if(settings.delay>0){
jQuery(meerkatWrap).hide().delay(settings.delay).animate(animationProperty,settings.animationSpeed,settings.easingIn);
}else{
jQuery(meerkatWrap).hide().animate(animationProperty,settings.animationSpeed,settings.easingIn);
}
}else if(fadeOrSlide==='none'&&settings.delay>0){
jQuery(meerkatWrap).hide().delay(settings.delay).show(0);
}else{
jQuery(meerkatWrap).show();
}
jQuery(element).show(0);
}

if(showOrHide==='hide'){
if(fadeOrSlide!=='none'){
if(settings.timer!==null){
jQuery(meerkatWrap).delay(settings.timer).animate(animationProperty,settings.animationSpeed,settings.easingOut,
function(){
jQuery(this).destroyMeerkat();
if(settings.dontShowAgainAuto===true){
createCookie('meerkat','dontshow',settings.cookieExpires);
}
});
}
jQuery(settings.close).click(function(){
jQuery(meerkatWrap).stop().animate(animationProperty,settings.animationSpeed,settings.easingOut,function(){
jQuery(this).destroyMeerkat();
});
return false;
});
jQuery(settings.dontShowAgain).click(function(){
jQuery(meerkatWrap).stop().animate(animationProperty,settings.animationSpeed,settings.easingOut,function(){
jQuery(this).destroyMeerkat();
});
createCookie('meerkat','dontshow',settings.cookieExpires);
return false;
});
}else if(fadeOrSlide==='none'&&settings.timer!==null){
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
jQuery('#meerkat-wrap').css({'position':'fixed','z-index':'10000','width':settings.width,'height':settings.height}).css(settings.position,'0');
jQuery('#meerkat-container').css({'background':settings.background,'height':settings.height});

if(settings.position==='left'||settings.position==='right'){
jQuery('#meerkat-wrap').css('top',0);
}

if(settings.opacity!=null){
jQuery('#meerkat-wrap').prepend('<div class="opacity-layer"></div>');
jQuery('#meerkat-container').css({'background':'transparent','z-index':'2','position':'relative'});
jQuery('.opacity-layer').css({
'position':'absolute',
'top':'0',
'height':'100%',
'width':'100%',
'background':settings.background,
'opacity':settings.opacity});

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
var bgProperties=document.body.currentStyle.backgroundColor+' ';
bgProperties+=document.body.currentStyle.backgroundImage+' ';
bgProperties+=document.body.currentStyle.backgroundRepeat+' ';
bgProperties+=document.body.currentStyle.backgroundAttachment+' ';
bgProperties+=document.body.currentStyle.backgroundPositionX+' ';
bgProperties+=document.body.currentStyle.backgroundPositionY;
jQuery('body').css({'background':'none'});
jQuery('#ie6-content-container').css({'background':bgProperties});
}
var ie6ContentContainer=document.getElementById('ie6-content-container');
if(ie6ContentContainer.clientHeight<ie6ContentContainer.scrollHeight&&settings.position!='left'){
jQuery('#meerkat-wrap').css({'right':'17px'});
}
}

switch(settings.animationIn){
case'slide':
animateMeerkat('show','slide');
break;
case'fade':
animateMeerkat('show','fade');
break;
case'none':
animateMeerkat('show','none');
break;
default:
alert('The animationIn option only accepts "slide", "fade", or "none"');}


switch(settings.animationOut){
case'slide':
animateMeerkat('hide','slide');
break;

case'fade':
animateMeerkat('hide','fade');
break;

case'none':
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
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/* ! Picturefill - v2.3.1 - 2015-04-09
* http://scottjehl.github.io/picturefill
* Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT */
window.matchMedia||(window.matchMedia=function(){
'use strict';var a=window.styleMedia||window.media;if(!a){
var b=document.createElement('style'),c=document.getElementsByTagName('script')[0],d=null;b.type='text/css',b.id='matchmediajs-test',c.parentNode.insertBefore(b,c),d='getComputedStyle'in window&&window.getComputedStyle(b,null)||b.currentStyle,a={matchMedium:function matchMedium(a){
var c='@media '+a+'{ #matchmediajs-test { width: 1px; } }';return b.styleSheet?b.styleSheet.cssText=c:b.textContent=c,'1px'===d.width;
}};
}return function(b){
return{matches:a.matchMedium(b||'all'),media:b||'all'};
};
}()),function(a,b,c){
'use strict';function d(b){
'object'==(typeof module==='undefined'?'undefined':_typeof(module))&&'object'==_typeof(module.exports)?module.exports=b:'function'==typeof define&&define.amd&&define('picturefill',function(){
return b;
}),'object'==(typeof a==='undefined'?'undefined':_typeof(a))&&(a.picturefill=b);
}function e(a){
var b=void 0,c=void 0,d=void 0,e=void 0,f=void 0,i=a||{};b=i.elements||g.getAllElements();for(var j=0,k=b.length;k>j;j++){if(c=b[j],d=c.parentNode,e=void 0,f=void 0,'IMG'===c.nodeName.toUpperCase()&&(c[g.ns]||(c[g.ns]={}),i.reevaluate||!c[g.ns].evaluated)){
if(d&&'PICTURE'===d.nodeName.toUpperCase()){
if(g.removeVideoShim(d),e=g.getMatch(c,d),e===!1)continue;
}else e=void 0;(d&&'PICTURE'===d.nodeName.toUpperCase()||!g.sizesSupported&&c.srcset&&h.test(c.srcset))&&g.dodgeSrcset(c),e?(f=g.processSourceSet(e),g.applyBestCandidate(f,c)):(f=g.processSourceSet(c),(void 0===c.srcset||c[g.ns].srcset)&&g.applyBestCandidate(f,c)),c[g.ns].evaluated=!0;
}}
}function f(){
function c(){
clearTimeout(d),d=setTimeout(h,60);
}g.initTypeDetects(),e();var d,f=setInterval(function(){
return e(),/^loaded|^i|^c/.test(b.readyState)?void clearInterval(f):void 0;
},250),h=function h(){
e({reevaluate:!0});
};a.addEventListener?a.addEventListener('resize',c,!1):a.attachEvent&&a.attachEvent('onresize',c);
}if(a.HTMLPictureElement)return void d(function(){});b.createElement('picture');var g=a.picturefill||{},h=/\s+\+?\d+(e\d+)?w/;g.ns='picturefill',function(){
g.srcsetSupported='srcset'in c,g.sizesSupported='sizes'in c,g.curSrcSupported='currentSrc'in c;
}(),g.trim=function(a){
return a.trim?a.trim():a.replace(/^\s+|\s+$/g,'');
},g.makeUrl=function(){
var a=b.createElement('a');return function(b){
return a.href=b,a.href;
};
}(),g.restrictsMixedContent=function(){
return'https:'===a.location.protocol;
},g.matchesMedia=function(b){
return a.matchMedia&&a.matchMedia(b).matches;
},g.getDpr=function(){
return a.devicePixelRatio||1;
},g.getWidthFromLength=function(a){
var c=void 0;if(!a||a.indexOf('%')>-1!=!1||!(parseFloat(a)>0||a.indexOf('calc(')>-1))return!1;a=a.replace('vw','%'),g.lengthEl||(g.lengthEl=b.createElement('div'),g.lengthEl.style.cssText='border:0;display:block;font-size:1em;left:0;margin:0;padding:0;position:absolute;visibility:hidden',g.lengthEl.className='helper-from-picturefill-js'),g.lengthEl.style.width='0px';try{
g.lengthEl.style.width=a;
}catch(d){}return b.body.appendChild(g.lengthEl),c=g.lengthEl.offsetWidth,0>=c&&(c=!1),b.body.removeChild(g.lengthEl),c;
},g.detectTypeSupport=function(b,c){
var d=new a.Image();return d.onerror=function(){
g.types[b]=!1,e();
},d.onload=function(){
g.types[b]=1===d.width,e();
},d.src=c,'pending';
},g.types=g.types||{},g.initTypeDetects=function(){
g.types['image/jpeg']=!0,g.types['image/gif']=!0,g.types['image/png']=!0,g.types['image/svg+xml']=b.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Image','1.1'),g.types['image/webp']=g.detectTypeSupport('image/webp','data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=');
},g.verifyTypeSupport=function(a){
var b=a.getAttribute('type');if(null===b||''===b)return!0;var c=g.types[b];return'string'==typeof c&&'pending'!==c?(g.types[b]=g.detectTypeSupport(b,c),'pending'):'function'==typeof c?(c(),'pending'):c;
},g.parseSize=function(a){
var b=/(\([^)]+\))?\s*(.+)/g.exec(a);return{media:b&&b[1],length:b&&b[2]};
},g.findWidthFromSourceSize=function(c){
for(var d,e=g.trim(c).split(/\s*,\s*/),f=0,h=e.length;h>f;f++){
var i=e[f],j=g.parseSize(i),k=j.length,l=j.media;if(k&&(!l||g.matchesMedia(l))&&(d=g.getWidthFromLength(k)))break;
}return d||Math.max(a.innerWidth||0,b.documentElement.clientWidth);
},g.parseSrcset=function(a){
for(var b=[];''!==a;){
a=a.replace(/^\s+/g,'');var c,d=a.search(/\s/g),e=null;if(-1!==d){
c=a.slice(0,d);var _f=c.slice(-1);if((','===_f||''===c)&&(c=c.replace(/,+$/,''),e=''),a=a.slice(d+1),null===e){
var _g=a.indexOf(',');-1!==_g?(e=a.slice(0,_g),a=a.slice(_g+1)):(e=a,a='');
}
}else c=a,a='';(c||e)&&b.push({url:c,descriptor:e});
}return b;
},g.parseDescriptor=function(a,b){
var c=void 0,d=b||'100vw',e=a&&a.replace(/(^\s+|\s+$)/g,''),f=g.findWidthFromSourceSize(d);if(e)for(var _h=e.split(' '),i=_h.length-1;i>=0;i--){
var j=_h[i],k=j&&j.slice(j.length-1);if('h'!==k&&'w'!==k||g.sizesSupported){
if('x'===k){
var l=j&&parseFloat(j,10);c=l&&!isNaN(l)?l:1;
}
}else c=parseFloat(parseInt(j,10)/f);
}return c||1;
},g.getCandidatesFromSourceSet=function(a,b){
for(var c=g.parseSrcset(a),d=[],e=0,f=c.length;f>e;e++){
var _h2=c[e];d.push({url:_h2.url,resolution:g.parseDescriptor(_h2.descriptor,b)});
}return d;
},g.dodgeSrcset=function(a){
a.srcset&&(a[g.ns].srcset=a.srcset,a.srcset='',a.setAttribute('data-pfsrcset',a[g.ns].srcset));
},g.processSourceSet=function(a){
var b=a.getAttribute('srcset'),c=a.getAttribute('sizes'),d=[];return'IMG'===a.nodeName.toUpperCase()&&a[g.ns]&&a[g.ns].srcset&&(b=a[g.ns].srcset),b&&(d=g.getCandidatesFromSourceSet(b,c)),d;
},g.backfaceVisibilityFix=function(a){
var b=a.style||{},c='webkitBackfaceVisibility'in b,d=b.zoom;c&&(b.zoom='.999',c=a.offsetWidth,b.zoom=d);
},g.setIntrinsicSize=function(){
var c={},d=function d(a,b,c){
b&&a.setAttribute('width',parseInt(b/c,10));
};return function(e,f){
var h=void 0;e[g.ns]&&!a.pfStopIntrinsicSize&&(void 0===e[g.ns].dims&&(e[g.ns].dims=e.getAttribute('width')||e.getAttribute('height')),e[g.ns].dims||(f.url in c?d(e,c[f.url],f.resolution):(h=b.createElement('img'),h.onload=function(){
if(c[f.url]=h.width,!c[f.url])try{
b.body.appendChild(h),c[f.url]=h.width||h.offsetWidth,b.body.removeChild(h);
}catch(a){}e.src===f.url&&d(e,c[f.url],f.resolution),e=null,h.onload=null,h=null;
},h.src=f.url)));
};
}(),g.applyBestCandidate=function(a,b){
var c=void 0,d=void 0,e=void 0;a.sort(g.ascendingSort),d=a.length,e=a[d-1];for(var _f2=0;d>_f2;_f2++){if(c=a[_f2],c.resolution>=g.getDpr()){
e=c;break;
}}e&&(e.url=g.makeUrl(e.url),b.src!==e.url&&(g.restrictsMixedContent()&&'http:'===e.url.substr(0,'http:'.length).toLowerCase()?void 0!==window.console&&console.warn('Blocked mixed content image '+e.url):(b.src=e.url,g.curSrcSupported||(b.currentSrc=b.src),g.backfaceVisibilityFix(b))),g.setIntrinsicSize(b,e));
},g.ascendingSort=function(a,b){
return a.resolution-b.resolution;
},g.removeVideoShim=function(a){
var b=a.getElementsByTagName('video');if(b.length){
for(var c=b[0],d=c.getElementsByTagName('source');d.length;){a.insertBefore(d[0],c);}c.parentNode.removeChild(c);
}
},g.getAllElements=function(){
for(var a=[],c=b.getElementsByTagName('img'),d=0,e=c.length;e>d;d++){
var _f3=c[d];('PICTURE'===_f3.parentNode.nodeName.toUpperCase()||null!==_f3.getAttribute('srcset')||_f3[g.ns]&&null!==_f3[g.ns].srcset)&&a.push(_f3);
}return a;
},g.getMatch=function(a,b){
for(var c,d=b.childNodes,e=0,f=d.length;f>e;e++){
var _h3=d[e];if(1===_h3.nodeType){
if(_h3===a)return c;if('SOURCE'===_h3.nodeName.toUpperCase()){
null!==_h3.getAttribute('src')&&void 0!==(typeof console==='undefined'?'undefined':_typeof(console))&&console.warn('The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.');var i=_h3.getAttribute('media');if(_h3.getAttribute('srcset')&&(!i||g.matchesMedia(i))){
var j=g.verifyTypeSupport(_h3);if(j===!0){
c=_h3;break;
}if('pending'===j)return!1;
}
}
}
}return c;
},f(),e._=g,d(e);
}(window,window.document,new window.Image());
/* ! http://mths.be/placeholder v2.0.8 by @mathias */
// !function(a,b,c){function d(a){var b={},d=/^jQuery\d+$/;return c.each(a.attributes,function(a,c){c.specified&&!d.test(c.name)&&(b[c.name]=c.value)}),b}function e(a,b){var d=this,e=c(d);if(d.value==e.attr("placeholder")&&e.hasClass("placeholder"))if(e.data("placeholder-password")){if(e=e.hide().next().show().attr("id",e.removeAttr("id").data("placeholder-id")),a===!0)return e[0].value=b;e.focus()}else d.value="",e.removeClass("placeholder"),d==g()&&d.select()}function f(){var a,b=this,f=c(b),g=this.id;if(""==b.value){if("password"==b.type){if(!f.data("placeholder-textinput")){try{a=f.clone().attr({type:"text"})}catch(h){a=c("<input>").attr(c.extend(d(this),{type:"text"}))}a.removeAttr("name").data({"placeholder-password":f,"placeholder-id":g}).bind("focus.placeholder",e),f.data({"placeholder-textinput":a,"placeholder-id":g}).before(a)}f=f.removeAttr("id").hide().prev().attr("id",g).show()}f.addClass("placeholder"),f[0].value=f.attr("placeholder")}else f.removeClass("placeholder")}function g(){try{return b.activeElement}catch(a){}}var h,i,j="[object OperaMini]"==Object.prototype.toString.call(a.operamini),k="placeholder"in b.createElement("input")&&!j,l="placeholder"in b.createElement("textarea")&&!j,m=c.fn,n=c.valHooks,o=c.propHooks;k&&l?(i=m.placeholder=function(){return this},i.input=i.textarea=!0):(i=m.placeholder=function(){var a=this;return a.filter((k?"textarea":":input")+"[placeholder]").not(".placeholder").bind({"focus.placeholder":e,"blur.placeholder":f}).data("placeholder-enabled",!0).trigger("blur.placeholder"),a},i.input=k,i.textarea=l,h={get:function(a){var b=c(a),d=b.data("placeholder-password");return d?d[0].value:b.data("placeholder-enabled")&&b.hasClass("placeholder")?"":a.value},set:function(a,b){var d=c(a),h=d.data("placeholder-password");return h?h[0].value=b:d.data("placeholder-enabled")?(""==b?(a.value=b,a!=g()&&f.call(a)):d.hasClass("placeholder")?e.call(a,!0,b)||(a.value=b):a.value=b,d):a.value=b}},k||(n.input=h,o.value=h),l||(n.textarea=h,o.value=h),c(function(){c(b).delegate("form","submit.placeholder",function(){var a=c(".placeholder",this).each(e);setTimeout(function(){a.each(f)},10)})}),c(a).bind("beforeunload.placeholder",function(){c(".placeholder").each(function(){this.value=""})}))}(this,document,jQuery);
"use strict";
"use strict";var _typeof2=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;})({1:[function(require,module,exports){
(function(global){
/* eslint-env browser */
'use strict';

var _jquery=typeof window!=="undefined"?window['jQuery']:typeof global!=="undefined"?global['jQuery']:null;var _jquery2=_interopRequireDefault(_jquery);
var _prepinputs=require('modules/prepinputs.js');var _prepinputs2=_interopRequireDefault(_prepinputs);
var _socialShare=require('modules/socialShare.js');var _socialShare2=_interopRequireDefault(_socialShare);
var _carousel=require('modules/carousel.js');var _carousel2=_interopRequireDefault(_carousel);
var _qtip=require('modules/qtip.js');var _qtip2=_interopRequireDefault(_qtip);
var _accordion=require('modules/accordion.js');var _accordion2=_interopRequireDefault(_accordion);
var _galleryWidget=require('modules/galleryWidget.js');var _galleryWidget2=_interopRequireDefault(_galleryWidget);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

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
(0,_socialShare2.default)('');

// Initialize carousels
(0,_carousel2.default)();

// Initialize qTip
(0,_qtip2.default)();

// Initialize accordion
(0,_accordion2.default)();

// Initialize Plugins
$('.magnific-trigger').magnificPopup({
type:'inline'});


// Initialize Gallery Slider
(0,_galleryWidget2.default)();
}
})(_jquery2.default);

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{"modules/accordion.js":2,"modules/carousel.js":3,"modules/galleryWidget.js":4,"modules/prepinputs.js":5,"modules/qtip.js":6,"modules/socialShare.js":7}],2:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){
$('.toggle').click(function(e){
e.preventDefault();

var $this=$(this);

// Collapse
if($this.next().hasClass('show')){
$this.next().removeClass('show');
$this.removeClass('active');
$this.next().slideUp(350);
}
// Expand
else{
$this.parent().parent().find('li .inner').removeClass('show');
$('.toggle').removeClass('active');
$this.parent().parent().find('li .inner').slideUp(350);
$this.addClass('active');
$this.next().toggleClass('show');
$this.next().slideToggle(350);
}
});
};

},{}],3:[function(require,module,exports){
(function(global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports,"__esModule",{value:true});

var _jquery=typeof window!=="undefined"?window['jQuery']:typeof global!=="undefined"?global['jQuery']:null;var _jquery2=_interopRequireDefault(_jquery);
require('vendor/jquery.slick.js');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var carousel=function carousel(){
(0,_jquery2.default)('.js-carousel').slick({
adaptiveHeight:true,
dots:false,
centerMode:true,
slidesToShow:1,
arrows:true,
centerPadding:'0px',
infinite:false,
prevArrow:'<button type="button" class="tiny">'+
'<i class="fa fa-chevron-left"></i></button>',
nextArrow:'<button type="button" class="tiny">'+
'<i class="fa fa-chevron-right"></i></button>'});

};exports.default=

carousel;

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{"vendor/jquery.slick.js":8}],4:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=


function(){
// Exit if not line chart is found
if(!$('.c-gallery').length)
return false;

var popupLink=$('.js-popup-link','.c-gallery');
var closeButton=$('.po__close','.c-gallery');
var sliderContainer=$('.c-gallery__slide','.c-gallery');
var body=$('body');
var hamMenuLink=$('.js-nav-toggle');
var header=$('.js-header');
var winWidth=$(window).width();

popupLink.on("click",function(e){
e.preventDefault();
sliderContainer.addClass('popup-active');
body.addClass('scroll-disable');
hamMenuLink.hide();
if(winWidth<768){
header.addClass('width-auto');
}
});

closeButton.on("click",function(e){
e.preventDefault();
$('.c-gallery__slide').removeClass('popup-active');
body.removeClass('scroll-disable');
hamMenuLink.show(300);
if(winWidth<768){
header.removeClass('width-auto');
}
});

var thumbCont=$('#thumb-cont');
var slideCont=$('.bxslide');
var slideright=true;
var showRestart;
var count;
var showReset=true;

var slider=$('#slider-container').bxSlider({
minSlides:1,
maxSlides:1,
infiniteLoop:false,
mode:'fade',
controls:false,
slideMargin:0,
pager:false,
adaptiveHeight:true,
speed:500,

onSlideBefore:function onSlideBefore(){
var count=slider.getCurrentSlide();
var slides=$(".slideshow-cont")[count];
var firstSlide=$('.cslide');
var pager=count+1;

gradient();

function gradient(){
var gcount=count+4;
$('.transparency').remove();
$('[data-rel='+gcount+']').append("<div class='transparency'></div>");
// console.log(gcount)
}

thumbCont.find('.thumbslide:gt('+count+')').show();
thumbCont.find('.thumbslide:lt('+(count+1)+')').hide();
$("li.active.current div.year").text($(slideCont[count]).data("year"));
$("li.active.current div.year-title").text($(slideCont[count]).data("title"));
if(count===endSlide){
$("#restart").show();
}else{
$("#restart").hide();
}

firstSlide.html(pager);
},

onSlideAfter:function onSlideAfter(){

}});


var slideQty=slider.getSlideCount();
var endSlide=slider.getSlideCount()-1;

$(".title-head").find('li').each(function(){
var current=$(this);
});

//Get the number of the last slide
$('.eslide').html(slideQty);

slideCont.each(function(i,slide){
thumbCont.append('<li class="row col1 thumbslide"id=thumb-'+i+' data-rel="'+i+'"><div class=year>'+$(this).data("year")+'</div><div class=year-title>'+$(this).data("title")+'</div></li>');
thumbCont.find('.thumbslide:first').hide();
$('[data-rel="4"]').append("<div class='transparency'></div>");
});
thumbCont.append("<li class='row col1 thumbnail' id='restart'><h1>Restart Slideshow ></h1></li>");

$('#restart').click(function(){
slider.goToSlide(0);
});

$("li.active.current div.year").text($(slideCont[0]).data("year"));
$("li.active.current div.year-title").text($(slideCont[0]).data("title"));

thumbCont.find("li.thumbslide").click(function(e){
slider.goToSlide($(this).data("rel"));
e.stopPropagation();
});

$('.left').click(function(){
var slidecurrent=slider.getCurrentSlide()-1;
slider.goToPrevSlide();
});

$('.right').click(function(){
slider.goToNextSlide();
});
};

},{}],5:[function(require,module,exports){
(function(global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports,"__esModule",{value:true});

var _jquery=typeof window!=="undefined"?window['jQuery']:typeof global!=="undefined"?global['jQuery']:null;var _jquery2=_interopRequireDefault(_jquery);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var prepinputs=function prepinputs(){
(0,_jquery2.default)('input, textarea').placeholder().
filter('[type="text"], [type="email"], [type="tel"], [type="password"]').
addClass('text').end().
filter('[type="checkbox"]').addClass('checkbox').end().
filter('[type="radio"]').addClass('radiobutton').end().
filter('[type="submit"]').addClass('submit').end().
filter('[type="image"]').addClass('buttonImage');
};exports.default=

prepinputs;

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{}],6:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){var _tip;
if($(window).width()>768){
var pointerPosition='center left';
var tooltipPosition='bottom right';
var pointerOffset=-35;
}else{
var pointerPosition='top center';
var tooltipPosition='bottom center';
var pointerOffset=0;
}

$('[data-tooltip]').qtip({
content:{
attr:'data-tooltip',
button:'x'},

position:{
my:pointerPosition,
at:tooltipPosition,
// target: $('.tooltip'),
viewport:$(window),
adjust:{
resize:true,
method:'shift shift',
x:0,
y:-10}},


style:{
classes:'tooltip-viewer',
tip:(_tip={
corner:true},_defineProperty(_tip,'corner',
pointerPosition),_defineProperty(_tip,'mimic',
'center top'),_defineProperty(_tip,'border',
1),_defineProperty(_tip,'width',
40),_defineProperty(_tip,'height',
40),_defineProperty(_tip,'offset',
pointerOffset),_tip)},


show:{
event:'click',
effect:function effect(){
$(this).fadeTo(500,1);
}},

hide:{
event:false,
effect:function effect(){
$(this).fadeTo(500,0);
}}});



// $('[class*="tooltip"]').click(function (){
//   $(this).removeClass('active');
//   $(this).addClass('active');
// });
};function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}/**
                                                                                                                                                                                                             * qTip
                                                                                                                                                                                                             */

},{}],7:[function(require,module,exports){
(function(global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports,"__esModule",{value:true});

var _jquery=typeof window!=="undefined"?window['jQuery']:typeof global!=="undefined"?global['jQuery']:null;var _jquery2=_interopRequireDefault(_jquery);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var socialShare=function socialShare(fbId){
var $body=(0,_jquery2.default)('body');

// Facebook sharing with the SDK
_jquery2.default.getScript('//connect.facebook.net/en_US/sdk.js').done(function(){
$body.on('click.sharer-fb','.sharer-fb',function(e){
var $link=(0,_jquery2.default)(e.currentTarget);
var options={
method:'feed',
display:'popup'};

var newUrl=$link.data('redirect-to')?
$link.data('redirect-to'):null;

e.preventDefault();

window.FB.init({
appId:fbId,
xfbml:false,
version:'v2.0',
status:false,
cookie:true});


if($link.data('title')){
options.name=$link.data('title');
}

if($link.data('url')){
options.link=$link.data('url');
}

if($link.data('picture')){
options.picture=$link.data('picture');
}

if($link.data('description')){
options.description=$link.data('description');
}

window.FB.ui(options,function(response){
if(newUrl){
window.location.href=newUrl;
}
});
});
});

// Twitter sharing
$body.on('click.sharer-tw','.sharer-tw',function(e){
var $link=(0,_jquery2.default)(e.currentTarget);
var url=$link.data('url');
var text=$link.data('description');
var via=$link.data('source');
var twitterURL='https://twitter.com/share?url='+encodeURIComponent(url);

e.preventDefault();

if(text){
twitterURL+='&text='+encodeURIComponent(text);
}
if(via){
twitterURL+='&via='+encodeURIComponent(via);
}
window.open(twitterURL,'tweet',
'width=500,height=384,menubar=no,status=no,toolbar=no');
});

// LinkedIn sharing
$body.on('click.sharer-li','.sharer-li',function(e){
var $link=(0,_jquery2.default)(e.target);
var url=$link.data('url');
var title=$link.data('title');
var summary=$link.data('description');
var source=$link.data('source');
var linkedinURL='https://www.linkedin.com/shareArticle?mini=true&url='+
encodeURIComponent(url);

e.preventDefault();

if(title){
linkedinURL+='&title='+encodeURIComponent(title);
}else{
linkedinURL+='&title=';
}

if(summary){
linkedinURL+='&summary='+
encodeURIComponent(summary.substring(0,256));
}

if(source){
linkedinURL+='&source='+encodeURIComponent(source);
}

window.open(linkedinURL,'linkedin',
'width=520,height=570,menubar=no,status=no,toolbar=no');
});
};exports.default=

socialShare;

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{}],8:[function(require,module,exports){
(function(global){
'use strict';var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};/*
                                                                                                                                                                                                                                                                                            _ _      _       _
                                                                                                                                                                                                                                                                                        ___| (_) ___| | __  (_)___
                                                                                                                                                                                                                                                                                       / __| | |/ __| |/ /  | / __|
                                                                                                                                                                                                                                                                                       \__ \ | | (__|   < _ | \__ \
                                                                                                                                                                                                                                                                                       |___/_|_|\___|_|\_(_)/ |___/
                                                                                                                                                                                                                                                                                                          |__/
                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                        Version: 1.5.0
                                                                                                                                                                                                                                                                                         Author: Ken Wheeler
                                                                                                                                                                                                                                                                                        Website: http://kenwheeler.github.io
                                                                                                                                                                                                                                                                                           Docs: http://kenwheeler.github.io/slick
                                                                                                                                                                                                                                                                                           Repo: http://github.com/kenwheeler/slick
                                                                                                                                                                                                                                                                                         Issues: http://github.com/kenwheeler/slick/issues
                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                        */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function(factory){
'use strict';
if(typeof define==='function'&&define.amd){
define(['jquery'],factory);
}else if(typeof exports!=='undefined'){
module.exports=factory(typeof window!=="undefined"?window['jQuery']:typeof global!=="undefined"?global['jQuery']:null);
}else{
factory(jQuery);
}
})(function($){
'use strict';
var Slick=window.Slick||{};

Slick=function(){
var instanceUid=0;

function Slick(element,settings){
var _=this,
dataSettings=void 0,responsiveSettings=void 0,breakpoint=void 0;

_.defaults={
accessibility:true,
adaptiveHeight:false,
appendArrows:$(element),
appendDots:$(element),
arrows:true,
asNavFor:null,
prevArrow:'<button type="button" data-role="none" class="slick-prev" aria-label="previous">Previous</button>',
nextArrow:'<button type="button" data-role="none" class="slick-next" aria-label="next">Next</button>',
autoplay:false,
autoplaySpeed:3000,
centerMode:false,
centerPadding:'50px',
cssEase:'ease',
customPaging:function customPaging(slider,i){
return'<button type="button" data-role="none">'+(i+1)+'</button>';
},
dots:false,
dotsClass:'slick-dots',
draggable:true,
easing:'linear',
edgeFriction:0.35,
fade:false,
focusOnSelect:false,
infinite:true,
initialSlide:0,
lazyLoad:'ondemand',
mobileFirst:false,
pauseOnHover:true,
pauseOnDotsHover:false,
respondTo:'window',
responsive:null,
rows:1,
rtl:false,
slide:'',
slidesPerRow:1,
slidesToShow:1,
slidesToScroll:1,
speed:500,
swipe:true,
swipeToSlide:false,
touchMove:true,
touchThreshold:5,
useCSS:true,
variableWidth:false,
vertical:false,
verticalSwiping:false,
waitForAnimate:true};


_.initials={
animating:false,
dragging:false,
autoPlayTimer:null,
currentDirection:0,
currentLeft:null,
currentSlide:0,
direction:1,
$dots:null,
listWidth:null,
listHeight:null,
loadIndex:0,
$nextArrow:null,
$prevArrow:null,
slideCount:null,
slideWidth:null,
$slideTrack:null,
$slides:null,
sliding:false,
slideOffset:0,
swipeLeft:null,
$list:null,
touchObject:{},
transformsEnabled:false};


$.extend(_,_.initials);

_.activeBreakpoint=null;
_.animType=null;
_.animProp=null;
_.breakpoints=[];
_.breakpointSettings=[];
_.cssTransitions=false;
_.hidden='hidden';
_.paused=false;
_.positionProp=null;
_.respondTo=null;
_.rowCount=1;
_.shouldClick=true;
_.$slider=$(element);
_.$slidesCache=null;
_.transformType=null;
_.transitionType=null;
_.visibilityChange='visibilitychange';
_.windowWidth=0;
_.windowTimer=null;

dataSettings=$(element).data('slick')||{};

_.options=$.extend({},_.defaults,dataSettings,settings);

_.currentSlide=_.options.initialSlide;

_.originalSettings=_.options;
responsiveSettings=_.options.responsive||null;

if(responsiveSettings&&responsiveSettings.length>-1){
_.respondTo=_.options.respondTo||'window';
for(breakpoint in responsiveSettings){
if(responsiveSettings.hasOwnProperty(breakpoint)){
_.breakpoints.push(responsiveSettings[
breakpoint].breakpoint);
_.breakpointSettings[responsiveSettings[
breakpoint].breakpoint]=
responsiveSettings[breakpoint].settings;
}
}
_.breakpoints.sort(function(a,b){
if(_.options.mobileFirst===true){
return a-b;
}else{
return b-a;
}
});
}

if(typeof document.mozHidden!=='undefined'){
_.hidden='mozHidden';
_.visibilityChange='mozvisibilitychange';
}else if(typeof document.msHidden!=='undefined'){
_.hidden='msHidden';
_.visibilityChange='msvisibilitychange';
}else if(typeof document.webkitHidden!=='undefined'){
_.hidden='webkitHidden';
_.visibilityChange='webkitvisibilitychange';
}

_.autoPlay=$.proxy(_.autoPlay,_);
_.autoPlayClear=$.proxy(_.autoPlayClear,_);
_.changeSlide=$.proxy(_.changeSlide,_);
_.clickHandler=$.proxy(_.clickHandler,_);
_.selectHandler=$.proxy(_.selectHandler,_);
_.setPosition=$.proxy(_.setPosition,_);
_.swipeHandler=$.proxy(_.swipeHandler,_);
_.dragHandler=$.proxy(_.dragHandler,_);
_.keyHandler=$.proxy(_.keyHandler,_);
_.autoPlayIterator=$.proxy(_.autoPlayIterator,_);

_.instanceUid=instanceUid++;

// A simple way to check for HTML strings
// Strict HTML recognition (must start with <)
// Extracted from jQuery v1.11 source
_.htmlExpr=/^(?:\s*(<[\w\W]+>)[^>]*)$/;

_.init();

_.checkResponsive(true);
}

return Slick;
}();

Slick.prototype.addSlide=Slick.prototype.slickAdd=function(markup,index,addBefore){
var _=this;

if(typeof index==='boolean'){
addBefore=index;
index=null;
}else if(index<0||index>=_.slideCount){
return false;
}

_.unload();

if(typeof index==='number'){
if(index===0&&_.$slides.length===0){
$(markup).appendTo(_.$slideTrack);
}else if(addBefore){
$(markup).insertBefore(_.$slides.eq(index));
}else{
$(markup).insertAfter(_.$slides.eq(index));
}
}else{
if(addBefore===true){
$(markup).prependTo(_.$slideTrack);
}else{
$(markup).appendTo(_.$slideTrack);
}
}

_.$slides=_.$slideTrack.children(this.options.slide);

_.$slideTrack.children(this.options.slide).detach();

_.$slideTrack.append(_.$slides);

_.$slides.each(function(index,element){
$(element).attr('data-slick-index',index);
});

_.$slidesCache=_.$slides;

_.reinit();
};

Slick.prototype.animateHeight=function(){
var _=this;
if(_.options.slidesToShow===1&&_.options.adaptiveHeight===true&&_.options.vertical===false){
var targetHeight=_.$slides.eq(_.currentSlide).outerHeight(true);
_.$list.animate({
height:targetHeight},
_.options.speed);
}
};

Slick.prototype.animateSlide=function(targetLeft,callback){
var animProps={},
_=this;

_.animateHeight();

if(_.options.rtl===true&&_.options.vertical===false){
targetLeft=-targetLeft;
}
if(_.transformsEnabled===false){
if(_.options.vertical===false){
_.$slideTrack.animate({
left:targetLeft},
_.options.speed,_.options.easing,callback);
}else{
_.$slideTrack.animate({
top:targetLeft},
_.options.speed,_.options.easing,callback);
}
}else{
if(_.cssTransitions===false){
if(_.options.rtl===true){
_.currentLeft=-_.currentLeft;
}
$({
animStart:_.currentLeft}).
animate({
animStart:targetLeft},
{
duration:_.options.speed,
easing:_.options.easing,
step:function step(now){
now=Math.ceil(now);
if(_.options.vertical===false){
animProps[_.animType]='translate('+
now+'px, 0px)';
_.$slideTrack.css(animProps);
}else{
animProps[_.animType]='translate(0px,'+
now+'px)';
_.$slideTrack.css(animProps);
}
},
complete:function complete(){
if(callback){
callback.call();
}
}});

}else{
_.applyTransition();
targetLeft=Math.ceil(targetLeft);

if(_.options.vertical===false){
animProps[_.animType]='translate3d('+targetLeft+'px, 0px, 0px)';
}else{
animProps[_.animType]='translate3d(0px,'+targetLeft+'px, 0px)';
}
_.$slideTrack.css(animProps);

if(callback){
setTimeout(function(){
_.disableTransition();

callback.call();
},_.options.speed);
}
}
}
};

Slick.prototype.asNavFor=function(index){
var _=this,
asNavFor=_.options.asNavFor!==null?$(_.options.asNavFor).slick('getSlick'):null;
if(asNavFor!==null)asNavFor.slideHandler(index,true);
};

Slick.prototype.applyTransition=function(slide){
var _=this,
transition={};

if(_.options.fade===false){
transition[_.transitionType]=_.transformType+' '+_.options.speed+'ms '+_.options.cssEase;
}else{
transition[_.transitionType]='opacity '+_.options.speed+'ms '+_.options.cssEase;
}

if(_.options.fade===false){
_.$slideTrack.css(transition);
}else{
_.$slides.eq(slide).css(transition);
}
};

Slick.prototype.autoPlay=function(){
var _=this;

if(_.autoPlayTimer){
clearInterval(_.autoPlayTimer);
}

if(_.slideCount>_.options.slidesToShow&&_.paused!==true){
_.autoPlayTimer=setInterval(_.autoPlayIterator,
_.options.autoplaySpeed);
}
};

Slick.prototype.autoPlayClear=function(){
var _=this;
if(_.autoPlayTimer){
clearInterval(_.autoPlayTimer);
}
};

Slick.prototype.autoPlayIterator=function(){
var _=this;

if(_.options.infinite===false){
if(_.direction===1){
if(_.currentSlide+1===_.slideCount-
1){
_.direction=0;
}

_.slideHandler(_.currentSlide+_.options.slidesToScroll);
}else{
if(_.currentSlide-1===0){
_.direction=1;
}

_.slideHandler(_.currentSlide-_.options.slidesToScroll);
}
}else{
_.slideHandler(_.currentSlide+_.options.slidesToScroll);
}
};

Slick.prototype.buildArrows=function(){
var _=this;

if(_.options.arrows===true&&_.slideCount>_.options.slidesToShow){
_.$prevArrow=$(_.options.prevArrow);
_.$nextArrow=$(_.options.nextArrow);

if(_.htmlExpr.test(_.options.prevArrow)){
_.$prevArrow.appendTo(_.options.appendArrows);
}

if(_.htmlExpr.test(_.options.nextArrow)){
_.$nextArrow.appendTo(_.options.appendArrows);
}

if(_.options.infinite!==true){
_.$prevArrow.addClass('slick-disabled');
}
}
};

Slick.prototype.buildDots=function(){
var _=this,
i=void 0,dotString=void 0;

if(_.options.dots===true&&_.slideCount>_.options.slidesToShow){
dotString='<ul class="'+_.options.dotsClass+'">';

for(i=0;i<=_.getDotCount();i+=1){
dotString+='<li>'+_.options.customPaging.call(this,_,i)+'</li>';
}

dotString+='</ul>';

_.$dots=$(dotString).appendTo(
_.options.appendDots);

_.$dots.find('li').first().addClass('slick-active').attr('aria-hidden','false');
}
};

Slick.prototype.buildOut=function(){
var _=this;

_.$slides=_.$slider.children(
':not(.slick-cloned)').addClass(
'slick-slide');
_.slideCount=_.$slides.length;

_.$slides.each(function(index,element){
$(element).attr('data-slick-index',index);
});

_.$slidesCache=_.$slides;

_.$slider.addClass('slick-slider');

_.$slideTrack=_.slideCount===0?
$('<div class="slick-track"/>').appendTo(_.$slider):
_.$slides.wrapAll('<div class="slick-track"/>').parent();

_.$list=_.$slideTrack.wrap(
'<div aria-live="polite" class="slick-list"/>').parent();
_.$slideTrack.css('opacity',0);

if(_.options.centerMode===true||_.options.swipeToSlide===true){
_.options.slidesToScroll=1;
}

$('img[data-lazy]',_.$slider).not('[src]').addClass('slick-loading');

_.setupInfinite();

_.buildArrows();

_.buildDots();

_.updateDots();

if(_.options.accessibility===true){
_.$list.prop('tabIndex',0);
}

_.setSlideClasses(typeof this.currentSlide==='number'?this.currentSlide:0);

if(_.options.draggable===true){
_.$list.addClass('draggable');
}
};

Slick.prototype.buildRows=function(){
var _=this,a=void 0,b=void 0,c=void 0,newSlides=void 0,numOfSlides=void 0,originalSlides=void 0,slidesPerSection=void 0;

newSlides=document.createDocumentFragment();
originalSlides=_.$slider.children();

if(_.options.rows>1){
slidesPerSection=_.options.slidesPerRow*_.options.rows;
numOfSlides=Math.ceil(
originalSlides.length/slidesPerSection);


for(a=0;a<numOfSlides;a++){
var slide=document.createElement('div');
for(b=0;b<_.options.rows;b++){
var row=document.createElement('div');
for(c=0;c<_.options.slidesPerRow;c++){
var target=a*slidesPerSection+(b*_.options.slidesPerRow+c);
if(originalSlides.get(target)){
row.appendChild(originalSlides.get(target));
}
}
slide.appendChild(row);
}
newSlides.appendChild(slide);
}
_.$slider.html(newSlides);
_.$slider.children().children().children().
width(100/_.options.slidesPerRow+'%').
css({'display':'inline-block'});
}
};

Slick.prototype.checkResponsive=function(initial){
var _=this,
breakpoint=void 0,targetBreakpoint=void 0,respondToWidth=void 0;
var sliderWidth=_.$slider.width();
var windowWidth=window.innerWidth||$(window).width();
if(_.respondTo==='window'){
respondToWidth=windowWidth;
}else if(_.respondTo==='slider'){
respondToWidth=sliderWidth;
}else if(_.respondTo==='min'){
respondToWidth=Math.min(windowWidth,sliderWidth);
}

if(_.originalSettings.responsive&&_.originalSettings.
responsive.length>-1&&_.originalSettings.responsive!==null){
targetBreakpoint=null;

for(breakpoint in _.breakpoints){
if(_.breakpoints.hasOwnProperty(breakpoint)){
if(_.originalSettings.mobileFirst===false){
if(respondToWidth<_.breakpoints[breakpoint]){
targetBreakpoint=_.breakpoints[breakpoint];
}
}else{
if(respondToWidth>_.breakpoints[breakpoint]){
targetBreakpoint=_.breakpoints[breakpoint];
}
}
}
}

if(targetBreakpoint!==null){
if(_.activeBreakpoint!==null){
if(targetBreakpoint!==_.activeBreakpoint){
_.activeBreakpoint=
targetBreakpoint;
if(_.breakpointSettings[targetBreakpoint]==='unslick'){
_.unslick();
}else{
_.options=$.extend({},_.originalSettings,
_.breakpointSettings[
targetBreakpoint]);
if(initial===true)
_.currentSlide=_.options.initialSlide;
_.refresh();
}
}
}else{
_.activeBreakpoint=targetBreakpoint;
if(_.breakpointSettings[targetBreakpoint]==='unslick'){
_.unslick();
}else{
_.options=$.extend({},_.originalSettings,
_.breakpointSettings[
targetBreakpoint]);
if(initial===true)
_.currentSlide=_.options.initialSlide;
_.refresh();
}
}
}else{
if(_.activeBreakpoint!==null){
_.activeBreakpoint=null;
_.options=_.originalSettings;
if(initial===true)
_.currentSlide=_.options.initialSlide;
_.refresh();
}
}
}
};

Slick.prototype.changeSlide=function(event,dontAnimate){
var _=this,
$target=$(event.target),
indexOffset=void 0,slideOffset=void 0,unevenOffset=void 0;

// If target is a link, prevent default action.
$target.is('a')&&event.preventDefault();

unevenOffset=_.slideCount%_.options.slidesToScroll!==0;
indexOffset=unevenOffset?0:(_.slideCount-_.currentSlide)%_.options.slidesToScroll;

switch(event.data.message){

case'previous':
slideOffset=indexOffset===0?_.options.slidesToScroll:_.options.slidesToShow-indexOffset;
if(_.slideCount>_.options.slidesToShow){
_.slideHandler(_.currentSlide-slideOffset,false,dontAnimate);
}
break;

case'next':
slideOffset=indexOffset===0?_.options.slidesToScroll:indexOffset;
if(_.slideCount>_.options.slidesToShow){
_.slideHandler(_.currentSlide+slideOffset,false,dontAnimate);
}
break;

case'index':
var index=event.data.index===0?0:
event.data.index||$(event.target).parent().index()*_.options.slidesToScroll;

_.slideHandler(_.checkNavigable(index),false,dontAnimate);
break;

default:
return;}

};

Slick.prototype.checkNavigable=function(index){
var _=this,
navigables=void 0,prevNavigable=void 0;

navigables=_.getNavigableIndexes();
prevNavigable=0;
if(index>navigables[navigables.length-1]){
index=navigables[navigables.length-1];
}else{
for(var n in navigables){
if(index<navigables[n]){
index=prevNavigable;
break;
}
prevNavigable=navigables[n];
}
}

return index;
};

Slick.prototype.cleanUpEvents=function(){
var _=this;

if(_.options.dots===true&&_.slideCount>_.options.slidesToShow){
$('li',_.$dots).off('click.slick',_.changeSlide);
}

if(_.options.dots===true&&_.options.pauseOnDotsHover===true&&_.options.autoplay===true){
$('li',_.$dots).
off('mouseenter.slick',_.setPaused.bind(_,true)).
off('mouseleave.slick',_.setPaused.bind(_,false));
}

if(_.options.arrows===true&&_.slideCount>_.options.slidesToShow){
_.$prevArrow&&_.$prevArrow.off('click.slick',_.changeSlide);
_.$nextArrow&&_.$nextArrow.off('click.slick',_.changeSlide);
}

_.$list.off('touchstart.slick mousedown.slick',_.swipeHandler);
_.$list.off('touchmove.slick mousemove.slick',_.swipeHandler);
_.$list.off('touchend.slick mouseup.slick',_.swipeHandler);
_.$list.off('touchcancel.slick mouseleave.slick',_.swipeHandler);

_.$list.off('click.slick',_.clickHandler);

if(_.options.autoplay===true){
$(document).off(_.visibilityChange,_.visibility);
}

_.$list.off('mouseenter.slick',_.setPaused.bind(_,true));
_.$list.off('mouseleave.slick',_.setPaused.bind(_,false));

if(_.options.accessibility===true){
_.$list.off('keydown.slick',_.keyHandler);
}

if(_.options.focusOnSelect===true){
$(_.$slideTrack).children().off('click.slick',_.selectHandler);
}

$(window).off('orientationchange.slick.slick-'+_.instanceUid,_.orientationChange);

$(window).off('resize.slick.slick-'+_.instanceUid,_.resize);

$('[draggable!=true]',_.$slideTrack).off('dragstart',_.preventDefault);

$(window).off('load.slick.slick-'+_.instanceUid,_.setPosition);
$(document).off('ready.slick.slick-'+_.instanceUid,_.setPosition);
};

Slick.prototype.cleanUpRows=function(){
var _=this,originalSlides=void 0;

if(_.options.rows>1){
originalSlides=_.$slides.children().children();
originalSlides.removeAttr('style');
_.$slider.html(originalSlides);
}
};

Slick.prototype.clickHandler=function(event){
var _=this;

if(_.shouldClick===false){
event.stopImmediatePropagation();
event.stopPropagation();
event.preventDefault();
}
};

Slick.prototype.destroy=function(){
var _=this;

_.autoPlayClear();

_.touchObject={};

_.cleanUpEvents();

$('.slick-cloned',_.$slider).remove();

if(_.$dots){
_.$dots.remove();
}
if(_.$prevArrow&&_typeof(_.options.prevArrow)!=='object'){
_.$prevArrow.remove();
}
if(_.$nextArrow&&_typeof(_.options.nextArrow)!=='object'){
_.$nextArrow.remove();
}

if(_.$slides){
_.$slides.removeClass('slick-slide slick-active slick-center slick-visible').
attr('aria-hidden','true').
removeAttr('data-slick-index').
css({
position:'',
left:'',
top:'',
zIndex:'',
opacity:'',
width:''});


_.$slider.html(_.$slides);
}

_.cleanUpRows();

_.$slider.removeClass('slick-slider');
_.$slider.removeClass('slick-initialized');
};

Slick.prototype.disableTransition=function(slide){
var _=this,
transition={};

transition[_.transitionType]='';

if(_.options.fade===false){
_.$slideTrack.css(transition);
}else{
_.$slides.eq(slide).css(transition);
}
};

Slick.prototype.fadeSlide=function(slideIndex,callback){
var _=this;

if(_.cssTransitions===false){
_.$slides.eq(slideIndex).css({
zIndex:1000});


_.$slides.eq(slideIndex).animate({
opacity:1},
_.options.speed,_.options.easing,callback);
}else{
_.applyTransition(slideIndex);

_.$slides.eq(slideIndex).css({
opacity:1,
zIndex:1000});


if(callback){
setTimeout(function(){
_.disableTransition(slideIndex);

callback.call();
},_.options.speed);
}
}
};

Slick.prototype.filterSlides=Slick.prototype.slickFilter=function(filter){
var _=this;

if(filter!==null){
_.unload();

_.$slideTrack.children(this.options.slide).detach();

_.$slidesCache.filter(filter).appendTo(_.$slideTrack);

_.reinit();
}
};

Slick.prototype.getCurrent=Slick.prototype.slickCurrentSlide=function(){
var _=this;
return _.currentSlide;
};

Slick.prototype.getDotCount=function(){
var _=this;

var breakPoint=0;
var counter=0;
var pagerQty=0;

if(_.options.infinite===true){
pagerQty=Math.ceil(_.slideCount/_.options.slidesToScroll);
}else if(_.options.centerMode===true){
pagerQty=_.slideCount;
}else{
while(breakPoint<_.slideCount){
++pagerQty;
breakPoint=counter+_.options.slidesToShow;
counter+=_.options.slidesToScroll<=_.options.slidesToShow?_.options.slidesToScroll:_.options.slidesToShow;
}
}

return pagerQty-1;
};

Slick.prototype.getLeft=function(slideIndex){
var _=this,
targetLeft=void 0,
verticalHeight=void 0,
verticalOffset=0,
targetSlide=void 0;

_.slideOffset=0;
verticalHeight=_.$slides.first().outerHeight();

if(_.options.infinite===true){
if(_.slideCount>_.options.slidesToShow){
_.slideOffset=_.slideWidth*_.options.slidesToShow*-1;
verticalOffset=verticalHeight*_.options.slidesToShow*-1;
}
if(_.slideCount%_.options.slidesToScroll!==0){
if(slideIndex+_.options.slidesToScroll>_.slideCount&&_.slideCount>_.options.slidesToShow){
if(slideIndex>_.slideCount){
_.slideOffset=(_.options.slidesToShow-(slideIndex-_.slideCount))*_.slideWidth*-1;
verticalOffset=(_.options.slidesToShow-(slideIndex-_.slideCount))*verticalHeight*-1;
}else{
_.slideOffset=_.slideCount%_.options.slidesToScroll*_.slideWidth*-1;
verticalOffset=_.slideCount%_.options.slidesToScroll*verticalHeight*-1;
}
}
}
}else{
if(slideIndex+_.options.slidesToShow>_.slideCount){
_.slideOffset=(slideIndex+_.options.slidesToShow-_.slideCount)*_.slideWidth;
verticalOffset=(slideIndex+_.options.slidesToShow-_.slideCount)*verticalHeight;
}
}

if(_.slideCount<=_.options.slidesToShow){
_.slideOffset=0;
verticalOffset=0;
}

if(_.options.centerMode===true&&_.options.infinite===true){
_.slideOffset+=_.slideWidth*Math.floor(_.options.slidesToShow/2)-_.slideWidth;
}else if(_.options.centerMode===true){
_.slideOffset=0;
_.slideOffset+=_.slideWidth*Math.floor(_.options.slidesToShow/2);
}

if(_.options.vertical===false){
targetLeft=slideIndex*_.slideWidth*-1+_.slideOffset;
}else{
targetLeft=slideIndex*verticalHeight*-1+verticalOffset;
}

if(_.options.variableWidth===true){
if(_.slideCount<=_.options.slidesToShow||_.options.infinite===false){
targetSlide=_.$slideTrack.children('.slick-slide').eq(slideIndex);
}else{
targetSlide=_.$slideTrack.children('.slick-slide').eq(slideIndex+_.options.slidesToShow);
}

targetLeft=targetSlide[0]?targetSlide[0].offsetLeft*-1:0;

if(_.options.centerMode===true){
if(_.options.infinite===false){
targetSlide=_.$slideTrack.children('.slick-slide').eq(slideIndex);
}else{
targetSlide=_.$slideTrack.children('.slick-slide').eq(slideIndex+_.options.slidesToShow+1);
}
targetLeft=targetSlide[0]?targetSlide[0].offsetLeft*-1:0;
targetLeft+=(_.$list.width()-targetSlide.outerWidth())/2;
}
}

return targetLeft;
};

Slick.prototype.getOption=Slick.prototype.slickGetOption=function(option){
var _=this;

return _.options[option];
};

Slick.prototype.getNavigableIndexes=function(){
var _=this,
breakPoint=0,
counter=0,
indexes=[],
max=void 0;

if(_.options.infinite===false){
max=_.slideCount-_.options.slidesToShow+1;
if(_.options.centerMode===true)max=_.slideCount;
}else{
breakPoint=_.options.slidesToScroll*-1;
counter=_.options.slidesToScroll*-1;
max=_.slideCount*2;
}

while(breakPoint<max){
indexes.push(breakPoint);
breakPoint=counter+_.options.slidesToScroll;
counter+=_.options.slidesToScroll<=_.options.slidesToShow?_.options.slidesToScroll:_.options.slidesToShow;
}

return indexes;
};

Slick.prototype.getSlick=function(){
return this;
};

Slick.prototype.getSlideCount=function(){
var _=this,
slidesTraversed=void 0,swipedSlide=void 0,centerOffset=void 0;

centerOffset=_.options.centerMode===true?_.slideWidth*Math.floor(_.options.slidesToShow/2):0;

if(_.options.swipeToSlide===true){
_.$slideTrack.find('.slick-slide').each(function(index,slide){
if(slide.offsetLeft-centerOffset+$(slide).outerWidth()/2>_.swipeLeft*-1){
swipedSlide=slide;
return false;
}
});

slidesTraversed=Math.abs($(swipedSlide).attr('data-slick-index')-_.currentSlide)||1;

return slidesTraversed;
}else{
return _.options.slidesToScroll;
}
};

Slick.prototype.goTo=Slick.prototype.slickGoTo=function(slide,dontAnimate){
var _=this;

_.changeSlide({
data:{
message:'index',
index:parseInt(slide)}},

dontAnimate);
};

Slick.prototype.init=function(){
var _=this;

if(!$(_.$slider).hasClass('slick-initialized')){
$(_.$slider).addClass('slick-initialized');
_.buildRows();
_.buildOut();
_.setProps();
_.startLoad();
_.loadSlider();
_.initializeEvents();
_.updateArrows();
_.updateDots();
}

_.$slider.trigger('init',[_]);
};

Slick.prototype.initArrowEvents=function(){
var _=this;

if(_.options.arrows===true&&_.slideCount>_.options.slidesToShow){
_.$prevArrow.on('click.slick',{
message:'previous'},
_.changeSlide);
_.$nextArrow.on('click.slick',{
message:'next'},
_.changeSlide);
}
};

Slick.prototype.initDotEvents=function(){
var _=this;

if(_.options.dots===true&&_.slideCount>_.options.slidesToShow){
$('li',_.$dots).on('click.slick',{
message:'index'},
_.changeSlide);
}

if(_.options.dots===true&&_.options.pauseOnDotsHover===true&&_.options.autoplay===true){
$('li',_.$dots).
on('mouseenter.slick',_.setPaused.bind(_,true)).
on('mouseleave.slick',_.setPaused.bind(_,false));
}
};

Slick.prototype.initializeEvents=function(){
var _=this;

_.initArrowEvents();

_.initDotEvents();

_.$list.on('touchstart.slick mousedown.slick',{
action:'start'},
_.swipeHandler);
_.$list.on('touchmove.slick mousemove.slick',{
action:'move'},
_.swipeHandler);
_.$list.on('touchend.slick mouseup.slick',{
action:'end'},
_.swipeHandler);
_.$list.on('touchcancel.slick mouseleave.slick',{
action:'end'},
_.swipeHandler);

_.$list.on('click.slick',_.clickHandler);

if(_.options.autoplay===true){
$(document).on(_.visibilityChange,_.visibility.bind(_));
}

_.$list.on('mouseenter.slick',_.setPaused.bind(_,true));
_.$list.on('mouseleave.slick',_.setPaused.bind(_,false));

if(_.options.accessibility===true){
_.$list.on('keydown.slick',_.keyHandler);
}

if(_.options.focusOnSelect===true){
$(_.$slideTrack).children().on('click.slick',_.selectHandler);
}

$(window).on('orientationchange.slick.slick-'+_.instanceUid,_.orientationChange.bind(_));

$(window).on('resize.slick.slick-'+_.instanceUid,_.resize.bind(_));

$('[draggable!=true]',_.$slideTrack).on('dragstart',_.preventDefault);

$(window).on('load.slick.slick-'+_.instanceUid,_.setPosition);
$(document).on('ready.slick.slick-'+_.instanceUid,_.setPosition);
};

Slick.prototype.initUI=function(){
var _=this;

if(_.options.arrows===true&&_.slideCount>_.options.slidesToShow){
_.$prevArrow.show();
_.$nextArrow.show();
}

if(_.options.dots===true&&_.slideCount>_.options.slidesToShow){
_.$dots.show();
}

if(_.options.autoplay===true){
_.autoPlay();
}
};

Slick.prototype.keyHandler=function(event){
var _=this;

if(event.keyCode===37&&_.options.accessibility===true){
_.changeSlide({
data:{
message:'previous'}});


}else if(event.keyCode===39&&_.options.accessibility===true){
_.changeSlide({
data:{
message:'next'}});


}
};

Slick.prototype.lazyLoad=function(){
var _=this,
loadRange=void 0,cloneRange=void 0,rangeStart=void 0,rangeEnd=void 0;

function loadImages(imagesScope){
$('img[data-lazy]',imagesScope).each(function(){
var image=$(this),
imageSource=$(this).attr('data-lazy'),
imageToLoad=document.createElement('img');

imageToLoad.onload=function(){
image.animate({
opacity:1},
200);
};
imageToLoad.src=imageSource;

image.
css({
opacity:0}).

attr('src',imageSource).
removeAttr('data-lazy').
removeClass('slick-loading');
});
}

if(_.options.centerMode===true){
if(_.options.infinite===true){
rangeStart=_.currentSlide+(_.options.slidesToShow/2+1);
rangeEnd=rangeStart+_.options.slidesToShow+2;
}else{
rangeStart=Math.max(0,_.currentSlide-(_.options.slidesToShow/2+1));
rangeEnd=2+(_.options.slidesToShow/2+1)+_.currentSlide;
}
}else{
rangeStart=_.options.infinite?_.options.slidesToShow+_.currentSlide:_.currentSlide;
rangeEnd=rangeStart+_.options.slidesToShow;
if(_.options.fade===true){
if(rangeStart>0)rangeStart--;
if(rangeEnd<=_.slideCount)rangeEnd++;
}
}

loadRange=_.$slider.find('.slick-slide').slice(rangeStart,rangeEnd);
loadImages(loadRange);

if(_.slideCount<=_.options.slidesToShow){
cloneRange=_.$slider.find('.slick-slide');
loadImages(cloneRange);
}else
if(_.currentSlide>=_.slideCount-_.options.slidesToShow){
cloneRange=_.$slider.find('.slick-cloned').slice(0,_.options.slidesToShow);
loadImages(cloneRange);
}else if(_.currentSlide===0){
cloneRange=_.$slider.find('.slick-cloned').slice(_.options.slidesToShow*-1);
loadImages(cloneRange);
}
};

Slick.prototype.loadSlider=function(){
var _=this;

_.setPosition();

_.$slideTrack.css({
opacity:1});


_.$slider.removeClass('slick-loading');

_.initUI();

if(_.options.lazyLoad==='progressive'){
_.progressiveLazyLoad();
}
};

Slick.prototype.next=Slick.prototype.slickNext=function(){
var _=this;

_.changeSlide({
data:{
message:'next'}});


};

Slick.prototype.orientationChange=function(){
var _=this;

_.checkResponsive();
_.setPosition();
};

Slick.prototype.pause=Slick.prototype.slickPause=function(){
var _=this;

_.autoPlayClear();
_.paused=true;
};

Slick.prototype.play=Slick.prototype.slickPlay=function(){
var _=this;

_.paused=false;
_.autoPlay();
};

Slick.prototype.postSlide=function(index){
var _=this;

_.$slider.trigger('afterChange',[_,index]);

_.animating=false;

_.setPosition();

_.swipeLeft=null;

if(_.options.autoplay===true&&_.paused===false){
_.autoPlay();
}
};

Slick.prototype.prev=Slick.prototype.slickPrev=function(){
var _=this;

_.changeSlide({
data:{
message:'previous'}});


};

Slick.prototype.preventDefault=function(e){
e.preventDefault();
};

Slick.prototype.progressiveLazyLoad=function(){
var _=this,
imgCount=void 0,targetImage=void 0;

imgCount=$('img[data-lazy]',_.$slider).length;

if(imgCount>0){
targetImage=$('img[data-lazy]',_.$slider).first();
targetImage.attr('src',targetImage.attr('data-lazy')).removeClass('slick-loading').load(function(){
targetImage.removeAttr('data-lazy');
_.progressiveLazyLoad();

if(_.options.adaptiveHeight===true){
_.setPosition();
}
}).
error(function(){
targetImage.removeAttr('data-lazy');
_.progressiveLazyLoad();
});
}
};

Slick.prototype.refresh=function(){
var _=this,
currentSlide=_.currentSlide;

_.destroy();

$.extend(_,_.initials);

_.init();

_.changeSlide({
data:{
message:'index',
index:currentSlide}},

false);
};

Slick.prototype.reinit=function(){
var _=this;

_.$slides=_.$slideTrack.children(_.options.slide).addClass(
'slick-slide');

_.slideCount=_.$slides.length;

if(_.currentSlide>=_.slideCount&&_.currentSlide!==0){
_.currentSlide=_.currentSlide-_.options.slidesToScroll;
}

if(_.slideCount<=_.options.slidesToShow){
_.currentSlide=0;
}

_.setProps();

_.setupInfinite();

_.buildArrows();

_.updateArrows();

_.initArrowEvents();

_.buildDots();

_.updateDots();

_.initDotEvents();

if(_.options.focusOnSelect===true){
$(_.$slideTrack).children().on('click.slick',_.selectHandler);
}

_.setSlideClasses(0);

_.setPosition();

_.$slider.trigger('reInit',[_]);
};

Slick.prototype.resize=function(){
var _=this;

if($(window).width()!==_.windowWidth){
clearTimeout(_.windowDelay);
_.windowDelay=window.setTimeout(function(){
_.windowWidth=$(window).width();
_.checkResponsive();
_.setPosition();
},50);
}
};

Slick.prototype.removeSlide=Slick.prototype.slickRemove=function(index,removeBefore,removeAll){
var _=this;

if(typeof index==='boolean'){
removeBefore=index;
index=removeBefore===true?0:_.slideCount-1;
}else{
index=removeBefore===true?--index:index;
}

if(_.slideCount<1||index<0||index>_.slideCount-1){
return false;
}

_.unload();

if(removeAll===true){
_.$slideTrack.children().remove();
}else{
_.$slideTrack.children(this.options.slide).eq(index).remove();
}

_.$slides=_.$slideTrack.children(this.options.slide);

_.$slideTrack.children(this.options.slide).detach();

_.$slideTrack.append(_.$slides);

_.$slidesCache=_.$slides;

_.reinit();
};

Slick.prototype.setCSS=function(position){
var _=this,
positionProps={},
x=void 0,y=void 0;

if(_.options.rtl===true){
position=-position;
}
x=_.positionProp=='left'?Math.ceil(position)+'px':'0px';
y=_.positionProp=='top'?Math.ceil(position)+'px':'0px';

positionProps[_.positionProp]=position;

if(_.transformsEnabled===false){
_.$slideTrack.css(positionProps);
}else{
positionProps={};
if(_.cssTransitions===false){
positionProps[_.animType]='translate('+x+', '+y+')';
_.$slideTrack.css(positionProps);
}else{
positionProps[_.animType]='translate3d('+x+', '+y+', 0px)';
_.$slideTrack.css(positionProps);
}
}
};

Slick.prototype.setDimensions=function(){
var _=this;

if(_.options.vertical===false){
if(_.options.centerMode===true){
_.$list.css({
padding:'0px '+_.options.centerPadding});

}
}else{
_.$list.height(_.$slides.first().outerHeight(true)*_.options.slidesToShow);
if(_.options.centerMode===true){
_.$list.css({
padding:_.options.centerPadding+' 0px'});

}
}

_.listWidth=_.$list.width();
_.listHeight=_.$list.height();


if(_.options.vertical===false&&_.options.variableWidth===false){
_.slideWidth=Math.ceil(_.listWidth/_.options.slidesToShow);
_.$slideTrack.width(Math.ceil(_.slideWidth*_.$slideTrack.children('.slick-slide').length));
}else if(_.options.variableWidth===true){
_.$slideTrack.width(5000*_.slideCount);
}else{
_.slideWidth=Math.ceil(_.listWidth);
_.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true)*_.$slideTrack.children('.slick-slide').length));
}

var offset=_.$slides.first().outerWidth(true)-_.$slides.first().width();
if(_.options.variableWidth===false)_.$slideTrack.children('.slick-slide').width(_.slideWidth-offset);
};

Slick.prototype.setFade=function(){
var _=this,
targetLeft=void 0;

_.$slides.each(function(index,element){
targetLeft=_.slideWidth*index*-1;
if(_.options.rtl===true){
$(element).css({
position:'relative',
right:targetLeft,
top:0,
zIndex:800,
opacity:0});

}else{
$(element).css({
position:'relative',
left:targetLeft,
top:0,
zIndex:800,
opacity:0});

}
});

_.$slides.eq(_.currentSlide).css({
zIndex:900,
opacity:1});

};

Slick.prototype.setHeight=function(){
var _=this;

if(_.options.slidesToShow===1&&_.options.adaptiveHeight===true&&_.options.vertical===false){
var targetHeight=_.$slides.eq(_.currentSlide).outerHeight(true);
_.$list.css('height',targetHeight);
}
};

Slick.prototype.setOption=Slick.prototype.slickSetOption=function(option,value,refresh){
var _=this;
_.options[option]=value;

if(refresh===true){
_.unload();
_.reinit();
}
};

Slick.prototype.setPosition=function(){
var _=this;

_.setDimensions();

_.setHeight();

if(_.options.fade===false){
_.setCSS(_.getLeft(_.currentSlide));
}else{
_.setFade();
}

_.$slider.trigger('setPosition',[_]);
};

Slick.prototype.setProps=function(){
var _=this,
bodyStyle=document.body.style;

_.positionProp=_.options.vertical===true?'top':'left';

if(_.positionProp==='top'){
_.$slider.addClass('slick-vertical');
}else{
_.$slider.removeClass('slick-vertical');
}

if(bodyStyle.WebkitTransition!==undefined||
bodyStyle.MozTransition!==undefined||
bodyStyle.msTransition!==undefined){
if(_.options.useCSS===true){
_.cssTransitions=true;
}
}

if(bodyStyle.OTransform!==undefined){
_.animType='OTransform';
_.transformType='-o-transform';
_.transitionType='OTransition';
if(bodyStyle.perspectiveProperty===undefined&&bodyStyle.webkitPerspective===undefined)_.animType=false;
}
if(bodyStyle.MozTransform!==undefined){
_.animType='MozTransform';
_.transformType='-moz-transform';
_.transitionType='MozTransition';
if(bodyStyle.perspectiveProperty===undefined&&bodyStyle.MozPerspective===undefined)_.animType=false;
}
if(bodyStyle.webkitTransform!==undefined){
_.animType='webkitTransform';
_.transformType='-webkit-transform';
_.transitionType='webkitTransition';
if(bodyStyle.perspectiveProperty===undefined&&bodyStyle.webkitPerspective===undefined)_.animType=false;
}
if(bodyStyle.msTransform!==undefined){
_.animType='msTransform';
_.transformType='-ms-transform';
_.transitionType='msTransition';
if(bodyStyle.msTransform===undefined)_.animType=false;
}
if(bodyStyle.transform!==undefined&&_.animType!==false){
_.animType='transform';
_.transformType='transform';
_.transitionType='transition';
}
_.transformsEnabled=_.animType!==null&&_.animType!==false;
};


Slick.prototype.setSlideClasses=function(index){
var _=this,
centerOffset=void 0,allSlides=void 0,indexOffset=void 0,remainder=void 0;

_.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden','true').removeClass('slick-center');
allSlides=_.$slider.find('.slick-slide');

if(_.options.centerMode===true){
centerOffset=Math.floor(_.options.slidesToShow/2);

if(_.options.infinite===true){
if(index>=centerOffset&&index<=_.slideCount-1-centerOffset){
_.$slides.slice(index-centerOffset,index+centerOffset+1).addClass('slick-active').attr('aria-hidden','false');
}else{
indexOffset=_.options.slidesToShow+index;
allSlides.slice(indexOffset-centerOffset+1,indexOffset+centerOffset+2).addClass('slick-active').attr('aria-hidden','false');
}

if(index===0){
allSlides.eq(allSlides.length-1-_.options.slidesToShow).addClass('slick-center');
}else if(index===_.slideCount-1){
allSlides.eq(_.options.slidesToShow).addClass('slick-center');
}
}

_.$slides.eq(index).addClass('slick-center');
}else{
if(index>=0&&index<=_.slideCount-_.options.slidesToShow){
_.$slides.slice(index,index+_.options.slidesToShow).addClass('slick-active').attr('aria-hidden','false');
}else if(allSlides.length<=_.options.slidesToShow){
allSlides.addClass('slick-active').attr('aria-hidden','false');
}else{
remainder=_.slideCount%_.options.slidesToShow;
indexOffset=_.options.infinite===true?_.options.slidesToShow+index:index;
if(_.options.slidesToShow==_.options.slidesToScroll&&_.slideCount-index<_.options.slidesToShow){
allSlides.slice(indexOffset-(_.options.slidesToShow-remainder),indexOffset+remainder).addClass('slick-active').attr('aria-hidden','false');
}else{
allSlides.slice(indexOffset,indexOffset+_.options.slidesToShow).addClass('slick-active').attr('aria-hidden','false');
}
}
}

if(_.options.lazyLoad==='ondemand'){
_.lazyLoad();
}
};

Slick.prototype.setupInfinite=function(){
var _=this,
i=void 0,slideIndex=void 0,infiniteCount=void 0;

if(_.options.fade===true){
_.options.centerMode=false;
}

if(_.options.infinite===true&&_.options.fade===false){
slideIndex=null;

if(_.slideCount>_.options.slidesToShow){
if(_.options.centerMode===true){
infiniteCount=_.options.slidesToShow+1;
}else{
infiniteCount=_.options.slidesToShow;
}

for(i=_.slideCount;i>_.slideCount-
infiniteCount;i-=1){
slideIndex=i-1;
$(_.$slides[slideIndex]).clone(true).attr('id','').
attr('data-slick-index',slideIndex-_.slideCount).
prependTo(_.$slideTrack).addClass('slick-cloned');
}
for(i=0;i<infiniteCount;i+=1){
slideIndex=i;
$(_.$slides[slideIndex]).clone(true).attr('id','').
attr('data-slick-index',slideIndex+_.slideCount).
appendTo(_.$slideTrack).addClass('slick-cloned');
}
_.$slideTrack.find('.slick-cloned').find('[id]').each(function(){
$(this).attr('id','');
});
}
}
};

Slick.prototype.setPaused=function(paused){
var _=this;

if(_.options.autoplay===true&&_.options.pauseOnHover===true){
_.paused=paused;
_.autoPlayClear();
}
};

Slick.prototype.selectHandler=function(event){
var _=this;

var targetElement=$(event.target).is('.slick-slide')?
$(event.target):
$(event.target).parents('.slick-slide');

var index=parseInt(targetElement.attr('data-slick-index'));

if(!index)index=0;

if(_.slideCount<=_.options.slidesToShow){
_.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden','true');
_.$slides.eq(index).addClass('slick-active').attr('aria-hidden','false');
if(_.options.centerMode===true){
_.$slider.find('.slick-slide').removeClass('slick-center');
_.$slides.eq(index).addClass('slick-center');
}
_.asNavFor(index);
return;
}
_.slideHandler(index);
};

Slick.prototype.slideHandler=function(index,sync,dontAnimate){
var targetSlide=void 0,animSlide=void 0,oldSlide=void 0,slideLeft=void 0,targetLeft=null,
_=this;

sync=sync||false;

if(_.animating===true&&_.options.waitForAnimate===true){
return;
}

if(_.options.fade===true&&_.currentSlide===index){
return;
}

if(_.slideCount<=_.options.slidesToShow){
return;
}

if(sync===false){
_.asNavFor(index);
}

targetSlide=index;
targetLeft=_.getLeft(targetSlide);
slideLeft=_.getLeft(_.currentSlide);

_.currentLeft=_.swipeLeft===null?slideLeft:_.swipeLeft;

if(_.options.infinite===false&&_.options.centerMode===false&&(index<0||index>_.getDotCount()*_.options.slidesToScroll)){
if(_.options.fade===false){
targetSlide=_.currentSlide;
if(dontAnimate!==true){
_.animateSlide(slideLeft,function(){
_.postSlide(targetSlide);
});
}else{
_.postSlide(targetSlide);
}
}
return;
}else if(_.options.infinite===false&&_.options.centerMode===true&&(index<0||index>_.slideCount-_.options.slidesToScroll)){
if(_.options.fade===false){
targetSlide=_.currentSlide;
if(dontAnimate!==true){
_.animateSlide(slideLeft,function(){
_.postSlide(targetSlide);
});
}else{
_.postSlide(targetSlide);
}
}
return;
}

if(_.options.autoplay===true){
clearInterval(_.autoPlayTimer);
}

if(targetSlide<0){
if(_.slideCount%_.options.slidesToScroll!==0){
animSlide=_.slideCount-_.slideCount%_.options.slidesToScroll;
}else{
animSlide=_.slideCount+targetSlide;
}
}else if(targetSlide>=_.slideCount){
if(_.slideCount%_.options.slidesToScroll!==0){
animSlide=0;
}else{
animSlide=targetSlide-_.slideCount;
}
}else{
animSlide=targetSlide;
}

_.animating=true;

_.$slider.trigger('beforeChange',[_,_.currentSlide,animSlide]);

oldSlide=_.currentSlide;
_.currentSlide=animSlide;

_.setSlideClasses(_.currentSlide);

_.updateDots();
_.updateArrows();

if(_.options.fade===true){
if(dontAnimate!==true){
_.fadeSlide(animSlide,function(){
_.postSlide(animSlide);
});
}else{
_.postSlide(animSlide);
}
_.animateHeight();
return;
}

if(dontAnimate!==true){
_.animateSlide(targetLeft,function(){
_.postSlide(animSlide);
});
}else{
_.postSlide(animSlide);
}
};

Slick.prototype.startLoad=function(){
var _=this;

if(_.options.arrows===true&&_.slideCount>_.options.slidesToShow){
_.$prevArrow.hide();
_.$nextArrow.hide();
}

if(_.options.dots===true&&_.slideCount>_.options.slidesToShow){
_.$dots.hide();
}

_.$slider.addClass('slick-loading');
};

Slick.prototype.swipeDirection=function(){
var xDist=void 0,yDist=void 0,r=void 0,swipeAngle=void 0,_=this;

xDist=_.touchObject.startX-_.touchObject.curX;
yDist=_.touchObject.startY-_.touchObject.curY;
r=Math.atan2(yDist,xDist);

swipeAngle=Math.round(r*180/Math.PI);
if(swipeAngle<0){
swipeAngle=360-Math.abs(swipeAngle);
}

if(swipeAngle<=45&&swipeAngle>=0){
return _.options.rtl===false?'left':'right';
}
if(swipeAngle<=360&&swipeAngle>=315){
return _.options.rtl===false?'left':'right';
}
if(swipeAngle>=135&&swipeAngle<=225){
return _.options.rtl===false?'right':'left';
}
if(_.options.verticalSwiping===true){
if(swipeAngle>=35&&swipeAngle<=135){
return'left';
}else{
return'right';
}
}

return'vertical';
};

Slick.prototype.swipeEnd=function(event){
var _=this,
slideCount=void 0;

_.dragging=false;

_.shouldClick=_.touchObject.swipeLength>10?false:true;

if(_.touchObject.curX===undefined){
return false;
}

if(_.touchObject.edgeHit===true){
_.$slider.trigger('edge',[_,_.swipeDirection()]);
}

if(_.touchObject.swipeLength>=_.touchObject.minSwipe){
switch(_.swipeDirection()){
case'left':
slideCount=_.options.swipeToSlide?_.checkNavigable(_.currentSlide+_.getSlideCount()):_.currentSlide+_.getSlideCount();
_.slideHandler(slideCount);
_.currentDirection=0;
_.touchObject={};
_.$slider.trigger('swipe',[_,'left']);
break;

case'right':
slideCount=_.options.swipeToSlide?_.checkNavigable(_.currentSlide-_.getSlideCount()):_.currentSlide-_.getSlideCount();
_.slideHandler(slideCount);
_.currentDirection=1;
_.touchObject={};
_.$slider.trigger('swipe',[_,'right']);
break;}

}else{
if(_.touchObject.startX!==_.touchObject.curX){
_.slideHandler(_.currentSlide);
_.touchObject={};
}
}
};

Slick.prototype.swipeHandler=function(event){
var _=this;

if(_.options.swipe===false||'ontouchend'in document&&_.options.swipe===false){
return;
}else if(_.options.draggable===false&&event.type.indexOf('mouse')!==-1){
return;
}

_.touchObject.fingerCount=event.originalEvent&&event.originalEvent.touches!==undefined?
event.originalEvent.touches.length:1;

_.touchObject.minSwipe=_.listWidth/_.options.
touchThreshold;

if(_.options.verticalSwiping===true){
_.touchObject.minSwipe=_.listHeight/_.options.
touchThreshold;
}

switch(event.data.action){

case'start':
_.swipeStart(event);
break;

case'move':
_.swipeMove(event);
break;

case'end':
_.swipeEnd(event);
break;}


};

Slick.prototype.swipeMove=function(event){
var _=this,
edgeWasHit=false,
curLeft=void 0,swipeDirection=void 0,swipeLength=void 0,positionOffset=void 0,touches=void 0;

touches=event.originalEvent!==undefined?event.originalEvent.touches:null;

if(!_.dragging||touches&&touches.length!==1){
return false;
}

curLeft=_.getLeft(_.currentSlide);

_.touchObject.curX=touches!==undefined?touches[0].pageX:event.clientX;
_.touchObject.curY=touches!==undefined?touches[0].pageY:event.clientY;

_.touchObject.swipeLength=Math.round(Math.sqrt(
Math.pow(_.touchObject.curX-_.touchObject.startX,2)));

if(_.options.verticalSwiping===true){
_.touchObject.swipeLength=Math.round(Math.sqrt(
Math.pow(_.touchObject.curY-_.touchObject.startY,2)));
}

swipeDirection=_.swipeDirection();

if(swipeDirection==='vertical'){
return;
}

if(event.originalEvent!==undefined&&_.touchObject.swipeLength>4){
event.preventDefault();
}

positionOffset=(_.options.rtl===false?1:-1)*(_.touchObject.curX>_.touchObject.startX?1:-1);
if(_.options.verticalSwiping===true){
positionOffset=_.touchObject.curY>_.touchObject.startY?1:-1;
}


swipeLength=_.touchObject.swipeLength;

_.touchObject.edgeHit=false;

if(_.options.infinite===false){
if(_.currentSlide===0&&swipeDirection==='right'||_.currentSlide>=_.getDotCount()&&swipeDirection==='left'){
swipeLength=_.touchObject.swipeLength*_.options.edgeFriction;
_.touchObject.edgeHit=true;
}
}

if(_.options.vertical===false){
_.swipeLeft=curLeft+swipeLength*positionOffset;
}else{
_.swipeLeft=curLeft+swipeLength*(_.$list.height()/_.listWidth)*positionOffset;
}
if(_.options.verticalSwiping===true){
_.swipeLeft=curLeft+swipeLength*positionOffset;
}

if(_.options.fade===true||_.options.touchMove===false){
return false;
}

if(_.animating===true){
_.swipeLeft=null;
return false;
}

_.setCSS(_.swipeLeft);
};

Slick.prototype.swipeStart=function(event){
var _=this,
touches=void 0;

if(_.touchObject.fingerCount!==1||_.slideCount<=_.options.slidesToShow){
_.touchObject={};
return false;
}

if(event.originalEvent!==undefined&&event.originalEvent.touches!==undefined){
touches=event.originalEvent.touches[0];
}

_.touchObject.startX=_.touchObject.curX=touches!==undefined?touches.pageX:event.clientX;
_.touchObject.startY=_.touchObject.curY=touches!==undefined?touches.pageY:event.clientY;

_.dragging=true;
};

Slick.prototype.unfilterSlides=Slick.prototype.slickUnfilter=function(){
var _=this;

if(_.$slidesCache!==null){
_.unload();

_.$slideTrack.children(this.options.slide).detach();

_.$slidesCache.appendTo(_.$slideTrack);

_.reinit();
}
};

Slick.prototype.unload=function(){
var _=this;

$('.slick-cloned',_.$slider).remove();
if(_.$dots){
_.$dots.remove();
}
if(_.$prevArrow&&_typeof(_.options.prevArrow)!=='object'){
_.$prevArrow.remove();
}
if(_.$nextArrow&&_typeof(_.options.nextArrow)!=='object'){
_.$nextArrow.remove();
}
_.$slides.removeClass('slick-slide slick-active slick-visible').attr('aria-hidden','true').css('width','');
};

Slick.prototype.unslick=function(){
var _=this;
_.destroy();
};

Slick.prototype.updateArrows=function(){
var _=this,
centerOffset=void 0;

centerOffset=Math.floor(_.options.slidesToShow/2);

if(_.options.arrows===true&&_.options.infinite!==
true&&_.slideCount>_.options.slidesToShow){
_.$prevArrow.removeClass('slick-disabled');
_.$nextArrow.removeClass('slick-disabled');
if(_.currentSlide===0){
_.$prevArrow.addClass('slick-disabled');
_.$nextArrow.removeClass('slick-disabled');
}else if(_.currentSlide>=_.slideCount-_.options.slidesToShow&&_.options.centerMode===false){
_.$nextArrow.addClass('slick-disabled');
_.$prevArrow.removeClass('slick-disabled');
}else if(_.currentSlide>=_.slideCount-1&&_.options.centerMode===true){
_.$nextArrow.addClass('slick-disabled');
_.$prevArrow.removeClass('slick-disabled');
}
}
};

Slick.prototype.updateDots=function(){
var _=this;

if(_.$dots!==null){
_.$dots.find('li').removeClass('slick-active').attr('aria-hidden','true');
_.$dots.find('li').eq(Math.floor(_.currentSlide/_.options.slidesToScroll)).addClass('slick-active').attr('aria-hidden','false');
}
};

Slick.prototype.visibility=function(){
var _=this;

if(document[_.hidden]){
_.paused=true;
_.autoPlayClear();
}else{
_.paused=false;
_.autoPlay();
}
};

$.fn.slick=function(){
var _=this,
opt=arguments[0],
args=Array.prototype.slice.call(arguments,1),
l=_.length,
i=0,
ret=void 0;
for(i;i<l;i++){
if((typeof opt==='undefined'?'undefined':_typeof(opt))=='object'||typeof opt=='undefined')
_[i].slick=new Slick(_[i],opt);else

ret=_[i].slick[opt].apply(_[i].slick,args);
if(typeof ret!='undefined')return ret;
}
return _;
};
});

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{}]},{},[1]);