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
var _custom=require('modules/custom.js');var _custom2=_interopRequireDefault(_custom);
var _accordion=require('modules/accordion.js');var _accordion2=_interopRequireDefault(_accordion);
var _video=require('modules/video.js');var _video2=_interopRequireDefault(_video);
var _searchBar=require('modules/searchBar.js');var _searchBar2=_interopRequireDefault(_searchBar);
var _hamburger=require('modules/hamburger.js');var _hamburger2=_interopRequireDefault(_hamburger);
var _jqueryBxsliderMin=require('modules/jquery.bxslider.min.js');var _jqueryBxsliderMin2=_interopRequireDefault(_jqueryBxsliderMin);
var _galleryWidget=require('modules/galleryWidget.js');var _galleryWidget2=_interopRequireDefault(_galleryWidget);
var _video_player_button=require('modules/video_player_button.js');var _video_player_button2=_interopRequireDefault(_video_player_button);
var _navigation=require('modules/navigation.js');var _navigation2=_interopRequireDefault(_navigation);
var _progressCircle=require('modules/progressCircle.js');var _progressCircle2=_interopRequireDefault(_progressCircle);
var _svgAnim=require('modules/svgAnim.js');var _svgAnim2=_interopRequireDefault(_svgAnim);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

(function($){
$(document).ready(function(){
ready();

// Styleguide event when an element is rendered
$(window).bind("styleguide:onRendered",function(e){
ready();
});

$(window).resize(function(){
resize();
});
});

// Initalizing all modules
function ready(){
(0,_custom2.default)();
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
(0,_galleryWidget2.default)();

// video();
(0,_video_player_button2.default)();
(0,_searchBar2.default)();
(0,_hamburger2.default)();
(0,_progressCircle2.default)();
(0,_svgAnim2.default)();
(0,_navigation2.default)();
}

function resize(){
(0,_navigation2.default)();
}
})(_jquery2.default);

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{"modules/accordion.js":2,"modules/custom.js":3,"modules/galleryWidget.js":4,"modules/hamburger.js":5,"modules/jquery.bxslider.min.js":6,"modules/navigation.js":7,"modules/progressCircle.js":8,"modules/searchBar.js":9,"modules/svgAnim.js":10,"modules/video.js":11,"modules/video_player_button.js":12}],2:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){
$('.toggle span.content-grid').click(function(e){
e.preventDefault();

var $parent=$(this).parent();

if(!$parent.hasClass('active')){
$('.toggle').filter('.active').
removeClass('active').
find('.answer').
slideUp('medium');

$parent.
addClass('active').
find('.answer').slideDown('medium');
}else{
$parent.
removeClass('active').
find('.answer').slideUp('medium');
}



});

$('li.cat-js').on('click',function(){
$('li.cat-js').removeClass('active-selection');
$(this).addClass('active-selection');
var cat_class=$(this).attr('class').split(' ')[1];
$('li.question-js').removeClass('hide');
$('li.question-js').not("li.question-js."+cat_class).addClass('hide');
});

// FAQ filter mobile
$('span#select').click(function(){
$('#sel-option li').show();
});

$('#sel-option li').click(function(e){
$('span#select').text($(this).text());
$('#sel-option li').hide();
e.preventDefault();
});

// $('span#selected').hover(function() {
//   $('#selection-options li').show();
// });

//  $('span#selected').hover(
//     function () {
//         $("#selection-option").fadeIn();
//         $('#selection-options li').show();
//     },
//     function () {
//         $("#selection-option").fadeOut();
//         $('#selection-options li').hide();
//     }
// );

// $('#selection-options li').hover(function(e) {
//   $('#selection-options li').hide();
//   e.preventDefault();
// })
};

},{}],3:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){

var width=$(window).width();

if(width>=1024){
$(".c-gh-program__item").each(function(){
var single_height=$(this).find(".heading_desktop").height();
if(single_height>40){
$(this).find(".heading_desktop").css('bottom','-40px');
}
});
}

// Making the prog list image clickable
$('.c-gh-program__item').click(function(e){
var link=$(this).find("a").attr('href');
window.open(link,"_self");
});

// News and Events page scroll
if(window.location.href.indexOf("#filter-news")>-1){
if(width>=840){
$('html, body').animate({
scrollTop:$('.container.region_main_content').offset().top+-170},
'slow');
}else{
$('html, body').animate({
scrollTop:$('.container.region_main_content').offset().top+-100},
'slow');
}
}

// Owl Carousel Init
var owl=$('.page-template-template-global_homepage .owl-carousel');
if(owl.length){
owl.owlCarousel({
items:1,
loop:true,
margin:0,
dots:false,
autoplay:true,
autoplayTimeout:3000,
autoplayHoverPause:false,
animateOut:'fadeOut'});

}

// Owl Carousel Init
var owl=$('.page-template-template-program_homepage .owl-carousel');
$.each(owl,function(){
var slides=$(this).find('.item').length;
if(slides>4){
$(this).owlCarousel({
items:4,
loop:true,
margin:0,
dots:false,
autoplay:false,
autoplayTimeout:3000,
autoplayHoverPause:false,
animateOut:'fadeOut',
responsiveClass:true,
responsive:{
0:{
items:2},

480:{
items:3},

768:{
items:4}}});



}
});
};

},{}],4:[function(require,module,exports){
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

$(document).on('keyup',function(evt){
if(evt.keyCode==27){
$('.c-gallery__slide').removeClass('popup-active');
body.removeClass('scroll-disable');
hamMenuLink.show(300);
if(winWidth<768){
header.removeClass('width-auto');
}
}
});

var thumbCont=$('#thumb-cont');
var slideCont=$('.bxslide');
var slideright=true;
var showRestart;
var count;
var showReset=true;

$('.slider-container').each(function(){

var slider=$(this).bxSlider({
minSlides:1,
maxSlides:1,
infiniteLoop:false,
mode:'fade',
controls:false,
slideMargin:0,
pager:false,
adaptiveHeight:true,
speed:0,

onSlideBefore:function onSlideBefore(){
var count=slider.getCurrentSlide();
var slides=$(this).find(".slideshow-cont")[count];
var firstSlide=$(this).find('.cslide');
var pager=count+1;

gradient();

function gradient(){
var gcount=count+4;
$('.transparency').remove();
$('[data-rel='+gcount+']').append("<div class='transparency'></div>");
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
// adding the inactive class to the arrows
if(pager==slider.getSlideCount()){
slider.find('.arrows .right').addClass('inactive');
slider.find('.arrows .left').removeClass('inactive');
}else if(pager=='1'){
slider.find('.arrows .left').addClass('inactive');
slider.find('.arrows .right').removeClass('inactive');
}else{
slider.find('.arrows .left').removeClass('inactive');
slider.find('.arrows .right').removeClass('inactive');
}
},

onSlideAfter:function onSlideAfter(){
}});


var slideQty=slider.getSlideCount();
var endSlide=slider.getSlideCount()-1;

$(".title-head").find('li').each(function(){
var current=$(this);
});

//Get the number of the last slide
$(this).find('.eslide').html(slideQty);

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

$(this).find('.left').click(function(){
var slidecurrent=slider.getCurrentSlide()-1;
slider.goToPrevSlide();
});

$(this).find('.right').click(function(){
slider.goToNextSlide();
});
});
};

},{}],5:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){
var hamburgerBtn=$(".js-hamburger-btn");
var subMenuLink=$(".has-submenu");
var dropDownMenu=$(".main-nav-dropdown");
var mainMenu=$(".c-nav--bottom");

hamburgerBtn.click(function(){
if(!$(this).hasClass('active')){
$(this).addClass('active');
mainMenu.slideDown('medium');
}else{
$(this).removeClass('active');
mainMenu.slideUp('medium');
}
});

subMenuLink.click(function(){
if(!$(this).hasClass('active')){
subMenuLink.filter('.active').
removeClass('active').
find('.main-nav-dropdown').
slideUp('medium');

$(this).
addClass('active').
find('.main-nav-dropdown').slideDown('medium');
}else{
$(this).
removeClass('active').
find('.main-nav-dropdown').slideUp('medium');
}
});
};

},{}],6:[function(require,module,exports){
'use strict';// Avoid `console` errors in browsers that lack a console.
(function(){
var method;
var noop=function noop(){};
var methods=[
'assert','clear','count','debug','dir','dirxml','error',
'exception','group','groupCollapsed','groupEnd','info','log',
'markTimeline','profile','profileEnd','table','time','timeEnd',
'timeline','timelineEnd','timeStamp','trace','warn'];

var length=methods.length;
var console=window.console=window.console||{};

while(length--){
method=methods[length];

// Only stub undefined methods.
if(!console[method]){
console[method]=noop;
}
}
})();

/**
       * BxSlider v4.1.2 - Fully loaded, responsive content slider
       * http://bxslider.com
       *
       * Copyright 2014, Steven Wanderski - http://stevenwanderski.com - http://bxcreative.com
       * Written while drinking Belgian ales and listening to jazz
       *
       * Released under the MIT license - http://opensource.org/licenses/MIT
       */
!function(t){var e={},s={mode:"horizontal",slideSelector:"",infiniteLoop:!0,hideControlOnEnd:!1,speed:500,easing:null,slideMargin:0,startSlide:0,randomStart:!1,captions:!1,ticker:!1,tickerHover:!1,adaptiveHeight:!1,adaptiveHeightSpeed:500,video:!1,useCSS:!0,preloadImages:"visible",responsive:!0,slideZIndex:50,touchEnabled:!0,swipeThreshold:50,oneToOneTouch:!0,preventDefaultSwipeX:!0,preventDefaultSwipeY:!1,pager:!0,pagerType:"full",pagerShortSeparator:" / ",pagerSelector:null,buildPager:null,pagerCustom:null,controls:!0,nextText:"Next",prevText:"Prev",nextSelector:null,prevSelector:null,autoControls:!1,startText:"Start",stopText:"Stop",autoControlsCombine:!1,autoControlsSelector:null,auto:!1,pause:4e3,autoStart:!0,autoDirection:"next",autoHover:!1,autoDelay:0,minSlides:1,maxSlides:1,moveSlides:0,slideWidth:0,onSliderLoad:function onSliderLoad(){},onSlideBefore:function onSlideBefore(){},onSlideAfter:function onSlideAfter(){},onSlideNext:function onSlideNext(){},onSlidePrev:function onSlidePrev(){},onSliderResize:function onSliderResize(){}};t.fn.bxSlider=function(n){if(0==this.length)return this;if(this.length>1)return this.each(function(){t(this).bxSlider(n);}),this;var o={},r=this;e.el=this;var a=t(window).width(),l=t(window).height(),d=function d(){o.settings=t.extend({},s,n),o.settings.slideWidth=parseInt(o.settings.slideWidth),o.children=r.children(o.settings.slideSelector),o.children.length<o.settings.minSlides&&(o.settings.minSlides=o.children.length),o.children.length<o.settings.maxSlides&&(o.settings.maxSlides=o.children.length),o.settings.randomStart&&(o.settings.startSlide=Math.floor(Math.random()*o.children.length)),o.active={index:o.settings.startSlide},o.carousel=o.settings.minSlides>1||o.settings.maxSlides>1,o.carousel&&(o.settings.preloadImages="all"),o.minThreshold=o.settings.minSlides*o.settings.slideWidth+(o.settings.minSlides-1)*o.settings.slideMargin,o.maxThreshold=o.settings.maxSlides*o.settings.slideWidth+(o.settings.maxSlides-1)*o.settings.slideMargin,o.working=!1,o.controls={},o.interval=null,o.animProp="vertical"==o.settings.mode?"top":"left",o.usingCSS=o.settings.useCSS&&"fade"!=o.settings.mode&&function(){var t=document.createElement("div"),e=["WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var i in e){if(void 0!==t.style[e[i]])return o.cssPrefix=e[i].replace("Perspective","").toLowerCase(),o.animProp="-"+o.cssPrefix+"-transform",!0;}return!1;}(),"vertical"==o.settings.mode&&(o.settings.maxSlides=o.settings.minSlides),r.data("origStyle",r.attr("style")),r.children(o.settings.slideSelector).each(function(){t(this).data("origStyle",t(this).attr("style"));}),c();},c=function c(){r.wrap('<div class="bx-wrapper"><div class="bx-viewport"></div></div>'),o.viewport=r.parent(),o.loader=t('<div class="bx-loading" />'),o.viewport.prepend(o.loader),r.css({width:"horizontal"==o.settings.mode?100*o.children.length+215+"%":"auto",position:"relative"}),o.usingCSS&&o.settings.easing?r.css("-"+o.cssPrefix+"-transition-timing-function",o.settings.easing):o.settings.easing||(o.settings.easing="swing"),f(),o.viewport.css({width:"100%",overflow:"hidden",position:"relative"}),o.viewport.parent().css({maxWidth:p()}),o.settings.pager||o.viewport.parent().css({margin:"0 auto 0px"}),o.children.css({"float":"horizontal"==o.settings.mode?"left":"none",listStyle:"none",position:"relative"}),o.children.css("width",u()),"horizontal"==o.settings.mode&&o.settings.slideMargin>0&&o.children.css("marginRight",o.settings.slideMargin),"vertical"==o.settings.mode&&o.settings.slideMargin>0&&o.children.css("marginBottom",o.settings.slideMargin),"fade"==o.settings.mode&&(o.children.css({position:"absolute",zIndex:0,display:"none"}),o.children.eq(o.settings.startSlide).css({zIndex:o.settings.slideZIndex,display:"block"})),o.controls.el=t('<div class="bx-controls" />'),o.settings.captions&&P(),o.active.last=o.settings.startSlide==x()-1,o.settings.video&&r.fitVids();var e=o.children.eq(o.settings.startSlide);"all"==o.settings.preloadImages&&(e=o.children),o.settings.ticker?o.settings.pager=!1:(o.settings.pager&&T(),o.settings.controls&&C(),o.settings.auto&&o.settings.autoControls&&E(),(o.settings.controls||o.settings.autoControls||o.settings.pager)&&o.viewport.after(o.controls.el)),g(e,h);},g=function g(e,i){var s=e.find("img, iframe").length;if(0==s)return i(),void 0;var n=0;e.find("img, iframe").each(function(){t(this).one("load",function(){++n==s&&i();}).each(function(){this.complete&&t(this).load();});});},h=function h(){if(o.settings.infiniteLoop&&"fade"!=o.settings.mode&&!o.settings.ticker){var e="vertical"==o.settings.mode?o.settings.minSlides:o.settings.maxSlides,i=o.children.slice(0,e).clone().addClass("bx-clone"),s=o.children.slice(-e).clone().addClass("bx-clone");r.append(i).prepend(s);}o.loader.remove(),S(),"vertical"==o.settings.mode&&(o.settings.adaptiveHeight=!0),o.viewport.height(v()),r.redrawSlider(),o.settings.onSliderLoad(o.active.index),o.initialized=!0,o.settings.responsive&&t(window).bind("resize",Z),o.settings.auto&&o.settings.autoStart&&H(),o.settings.ticker&&L(),o.settings.pager&&q(o.settings.startSlide),o.settings.controls&&W(),o.settings.touchEnabled&&!o.settings.ticker&&O();},v=function v(){var e=0,s=t();if("vertical"==o.settings.mode||o.settings.adaptiveHeight){if(o.carousel){var n=1==o.settings.moveSlides?o.active.index:o.active.index*m();for(s=o.children.eq(n),i=1;i<=o.settings.maxSlides-1;i++){s=n+i>=o.children.length?s.add(o.children.eq(i-1)):s.add(o.children.eq(n+i));}}else s=o.children.eq(o.active.index);}else s=o.children;return"vertical"==o.settings.mode?(s.each(function(){e+=t(this).outerHeight();}),o.settings.slideMargin>0&&(e+=o.settings.slideMargin*(o.settings.minSlides-1))):e=Math.max.apply(Math,s.map(function(){return t(this).outerHeight(!1);}).get()),e;},p=function p(){var t="100%";return o.settings.slideWidth>0&&(t="horizontal"==o.settings.mode?o.settings.maxSlides*o.settings.slideWidth+(o.settings.maxSlides-1)*o.settings.slideMargin:o.settings.slideWidth),t;},u=function u(){var t=o.settings.slideWidth,e=o.viewport.width();return 0==o.settings.slideWidth||o.settings.slideWidth>e&&!o.carousel||"vertical"==o.settings.mode?t=e:o.settings.maxSlides>1&&"horizontal"==o.settings.mode&&(e>o.maxThreshold||e<o.minThreshold&&(t=(e-o.settings.slideMargin*(o.settings.minSlides-1))/o.settings.minSlides)),t;},f=function f(){var t=1;if("horizontal"==o.settings.mode&&o.settings.slideWidth>0){if(o.viewport.width()<o.minThreshold)t=o.settings.minSlides;else if(o.viewport.width()>o.maxThreshold)t=o.settings.maxSlides;else{var e=o.children.first().width();t=Math.floor(o.viewport.width()/e);}}else"vertical"==o.settings.mode&&(t=o.settings.minSlides);return t;},x=function x(){var t=0;if(o.settings.moveSlides>0){if(o.settings.infiniteLoop)t=o.children.length/m();else for(var e=0,i=0;e<o.children.length;){++t,e=i+f(),i+=o.settings.moveSlides<=f()?o.settings.moveSlides:f();}}else t=Math.ceil(o.children.length/f());return t;},m=function m(){return o.settings.moveSlides>0&&o.settings.moveSlides<=f()?o.settings.moveSlides:f();},S=function S(){if(o.children.length>o.settings.maxSlides&&o.active.last&&!o.settings.infiniteLoop){if("horizontal"==o.settings.mode){var t=o.children.last(),e=t.position();b(-(e.left-(o.viewport.width()-t.width())),"reset",0);}else if("vertical"==o.settings.mode){var i=o.children.length-o.settings.minSlides,e=o.children.eq(i).position();b(-e.top,"reset",0);}}else{var e=o.children.eq(o.active.index*m()).position();o.active.index==x()-1&&(o.active.last=!0),void 0!=e&&("horizontal"==o.settings.mode?b(-e.left,"reset",0):"vertical"==o.settings.mode&&b(-e.top,"reset",0));}},b=function b(t,e,i,s){if(o.usingCSS){var n="vertical"==o.settings.mode?"translate3d(0, "+t+"px, 0)":"translate3d("+t+"px, 0, 0)";r.css("-"+o.cssPrefix+"-transition-duration",i/1e3+"s"),"slide"==e?(r.css(o.animProp,n),r.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(){r.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"),D();})):"reset"==e?r.css(o.animProp,n):"ticker"==e&&(r.css("-"+o.cssPrefix+"-transition-timing-function","linear"),r.css(o.animProp,n),r.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(){r.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"),b(s.resetValue,"reset",0),N();}));}else{var a={};a[o.animProp]=t,"slide"==e?r.animate(a,i,o.settings.easing,function(){D();}):"reset"==e?r.css(o.animProp,t):"ticker"==e&&r.animate(a,speed,"linear",function(){b(s.resetValue,"reset",0),N();});}},w=function w(){for(var e="",i=x(),s=0;i>s;s++){var n="";o.settings.buildPager&&t.isFunction(o.settings.buildPager)?(n=o.settings.buildPager(s),o.pagerEl.addClass("bx-custom-pager")):(n=s+1,o.pagerEl.addClass("bx-default-pager")),e+='<div class="bx-pager-item"><a href="" data-slide-index="'+s+'" class="bx-pager-link">'+n+"</a></div>";}o.pagerEl.html(e);},T=function T(){o.settings.pagerCustom?o.pagerEl=t(o.settings.pagerCustom):(o.pagerEl=t('<div class="bx-pager" />'),o.settings.pagerSelector?t(o.settings.pagerSelector).html(o.pagerEl):o.controls.el.addClass("bx-has-pager").append(o.pagerEl),w()),o.pagerEl.on("click","a",I);},C=function C(){o.controls.next=t('<a class="bx-next" href="">'+o.settings.nextText+"</a>"),o.controls.prev=t('<a class="bx-prev" href="">'+o.settings.prevText+"</a>"),o.controls.next.bind("click",y),o.controls.prev.bind("click",z),o.settings.nextSelector&&t(o.settings.nextSelector).append(o.controls.next),o.settings.prevSelector&&t(o.settings.prevSelector).append(o.controls.prev),o.settings.nextSelector||o.settings.prevSelector||(o.controls.directionEl=t('<div class="bx-controls-direction" />'),o.controls.directionEl.append(o.controls.prev).append(o.controls.next),o.controls.el.addClass("bx-has-controls-direction").append(o.controls.directionEl));},E=function E(){o.controls.start=t('<div class="bx-controls-auto-item"><a class="bx-start" href="">'+o.settings.startText+"</a></div>"),o.controls.stop=t('<div class="bx-controls-auto-item"><a class="bx-stop" href="">'+o.settings.stopText+"</a></div>"),o.controls.autoEl=t('<div class="bx-controls-auto" />'),o.controls.autoEl.on("click",".bx-start",k),o.controls.autoEl.on("click",".bx-stop",M),o.settings.autoControlsCombine?o.controls.autoEl.append(o.controls.start):o.controls.autoEl.append(o.controls.start).append(o.controls.stop),o.settings.autoControlsSelector?t(o.settings.autoControlsSelector).html(o.controls.autoEl):o.controls.el.addClass("bx-has-controls-auto").append(o.controls.autoEl),A(o.settings.autoStart?"stop":"start");},P=function P(){o.children.each(function(){var e=t(this).find("img:first").attr("title");void 0!=e&&(""+e).length&&t(this).append('<div class="bx-caption"><span>'+e+"</span></div>");});},y=function y(t){o.settings.auto&&r.stopAuto(),r.goToNextSlide(),t.preventDefault();},z=function z(t){o.settings.auto&&r.stopAuto(),r.goToPrevSlide(),t.preventDefault();},k=function k(t){r.startAuto(),t.preventDefault();},M=function M(t){r.stopAuto(),t.preventDefault();},I=function I(e){o.settings.auto&&r.stopAuto();var i=t(e.currentTarget),s=parseInt(i.attr("data-slide-index"));s!=o.active.index&&r.goToSlide(s),e.preventDefault();},q=function q(e){var i=o.children.length;return"short"==o.settings.pagerType?(o.settings.maxSlides>1&&(i=Math.ceil(o.children.length/o.settings.maxSlides)),o.pagerEl.html(e+1+o.settings.pagerShortSeparator+i),void 0):(o.pagerEl.find("a").removeClass("active"),o.pagerEl.each(function(i,s){t(s).find("a").eq(e).addClass("active");}),void 0);},D=function D(){if(o.settings.infiniteLoop){var t="";0==o.active.index?t=o.children.eq(0).position():o.active.index==x()-1&&o.carousel?t=o.children.eq((x()-1)*m()).position():o.active.index==o.children.length-1&&(t=o.children.eq(o.children.length-1).position()),t&&("horizontal"==o.settings.mode?b(-t.left,"reset",0):"vertical"==o.settings.mode&&b(-t.top,"reset",0));}o.working=!1,o.settings.onSlideAfter(o.children.eq(o.active.index),o.oldIndex,o.active.index);},A=function A(t){o.settings.autoControlsCombine?o.controls.autoEl.html(o.controls[t]):(o.controls.autoEl.find("a").removeClass("active"),o.controls.autoEl.find("a:not(.bx-"+t+")").addClass("active"));},W=function W(){1==x()?(o.controls.prev.addClass("disabled"),o.controls.next.addClass("disabled")):!o.settings.infiniteLoop&&o.settings.hideControlOnEnd&&(0==o.active.index?(o.controls.prev.addClass("disabled"),o.controls.next.removeClass("disabled")):o.active.index==x()-1?(o.controls.next.addClass("disabled"),o.controls.prev.removeClass("disabled")):(o.controls.prev.removeClass("disabled"),o.controls.next.removeClass("disabled")));},H=function H(){o.settings.autoDelay>0?setTimeout(r.startAuto,o.settings.autoDelay):r.startAuto(),o.settings.autoHover&&r.hover(function(){o.interval&&(r.stopAuto(!0),o.autoPaused=!0);},function(){o.autoPaused&&(r.startAuto(!0),o.autoPaused=null);});},L=function L(){var e=0;if("next"==o.settings.autoDirection)r.append(o.children.clone().addClass("bx-clone"));else{r.prepend(o.children.clone().addClass("bx-clone"));var i=o.children.first().position();e="horizontal"==o.settings.mode?-i.left:-i.top;}b(e,"reset",0),o.settings.pager=!1,o.settings.controls=!1,o.settings.autoControls=!1,o.settings.tickerHover&&!o.usingCSS&&o.viewport.hover(function(){r.stop();},function(){var e=0;o.children.each(function(){e+="horizontal"==o.settings.mode?t(this).outerWidth(!0):t(this).outerHeight(!0);});var i=o.settings.speed/e,s="horizontal"==o.settings.mode?"left":"top",n=i*(e-Math.abs(parseInt(r.css(s))));N(n);}),N();},N=function N(t){speed=t?t:o.settings.speed;var e={left:0,top:0},i={left:0,top:0};"next"==o.settings.autoDirection?e=r.find(".bx-clone").first().position():i=o.children.first().position();var s="horizontal"==o.settings.mode?-e.left:-e.top,n="horizontal"==o.settings.mode?-i.left:-i.top,a={resetValue:n};b(s,"ticker",speed,a);},O=function O(){o.touch={start:{x:0,y:0},end:{x:0,y:0}},o.viewport.bind("touchstart",X);},X=function X(t){if(o.working)t.preventDefault();else{o.touch.originalPos=r.position();var e=t.originalEvent;o.touch.start.x=e.changedTouches[0].pageX,o.touch.start.y=e.changedTouches[0].pageY,o.viewport.bind("touchmove",Y),o.viewport.bind("touchend",V);}},Y=function Y(t){var e=t.originalEvent,i=Math.abs(e.changedTouches[0].pageX-o.touch.start.x),s=Math.abs(e.changedTouches[0].pageY-o.touch.start.y);if(3*i>s&&o.settings.preventDefaultSwipeX?t.preventDefault():3*s>i&&o.settings.preventDefaultSwipeY&&t.preventDefault(),"fade"!=o.settings.mode&&o.settings.oneToOneTouch){var n=0;if("horizontal"==o.settings.mode){var r=e.changedTouches[0].pageX-o.touch.start.x;n=o.touch.originalPos.left+r;}else{var r=e.changedTouches[0].pageY-o.touch.start.y;n=o.touch.originalPos.top+r;}b(n,"reset",0);}},V=function V(t){o.viewport.unbind("touchmove",Y);var e=t.originalEvent,i=0;if(o.touch.end.x=e.changedTouches[0].pageX,o.touch.end.y=e.changedTouches[0].pageY,"fade"==o.settings.mode){var s=Math.abs(o.touch.start.x-o.touch.end.x);s>=o.settings.swipeThreshold&&(o.touch.start.x>o.touch.end.x?r.goToNextSlide():r.goToPrevSlide(),r.stopAuto());}else{var s=0;"horizontal"==o.settings.mode?(s=o.touch.end.x-o.touch.start.x,i=o.touch.originalPos.left):(s=o.touch.end.y-o.touch.start.y,i=o.touch.originalPos.top),!o.settings.infiniteLoop&&(0==o.active.index&&s>0||o.active.last&&0>s)?b(i,"reset",200):Math.abs(s)>=o.settings.swipeThreshold?(0>s?r.goToNextSlide():r.goToPrevSlide(),r.stopAuto()):b(i,"reset",200);}o.viewport.unbind("touchend",V);},Z=function Z(){var e=t(window).width(),i=t(window).height();(a!=e||l!=i)&&(a=e,l=i,r.redrawSlider(),o.settings.onSliderResize.call(r,o.active.index));};return r.goToSlide=function(e,i){if(!o.working&&o.active.index!=e)if(o.working=!0,o.oldIndex=o.active.index,o.active.index=0>e?x()-1:e>=x()?0:e,o.settings.onSlideBefore(o.children.eq(o.active.index),o.oldIndex,o.active.index),"next"==i?o.settings.onSlideNext(o.children.eq(o.active.index),o.oldIndex,o.active.index):"prev"==i&&o.settings.onSlidePrev(o.children.eq(o.active.index),o.oldIndex,o.active.index),o.active.last=o.active.index>=x()-1,o.settings.pager&&q(o.active.index),o.settings.controls&&W(),"fade"==o.settings.mode)o.settings.adaptiveHeight&&o.viewport.height()!=v()&&o.viewport.animate({height:v()},o.settings.adaptiveHeightSpeed),o.children.filter(":visible").fadeOut(o.settings.speed).css({zIndex:0}),o.children.eq(o.active.index).css("zIndex",o.settings.slideZIndex+1).fadeIn(o.settings.speed,function(){t(this).css("zIndex",o.settings.slideZIndex),D();});else{o.settings.adaptiveHeight&&o.viewport.height()!=v()&&o.viewport.animate({height:v()},o.settings.adaptiveHeightSpeed);var s=0,n={left:0,top:0};if(!o.settings.infiniteLoop&&o.carousel&&o.active.last){if("horizontal"==o.settings.mode){var a=o.children.eq(o.children.length-1);n=a.position(),s=o.viewport.width()-a.outerWidth();}else{var l=o.children.length-o.settings.minSlides;n=o.children.eq(l).position();}}else if(o.carousel&&o.active.last&&"prev"==i){var d=1==o.settings.moveSlides?o.settings.maxSlides-m():(x()-1)*m()-(o.children.length-o.settings.maxSlides),a=r.children(".bx-clone").eq(d);n=a.position();}else if("next"==i&&0==o.active.index)n=r.find("> .bx-clone").eq(o.settings.maxSlides).position(),o.active.last=!1;else if(e>=0){var c=e*m();n=o.children.eq(c).position();}if("undefined"!=typeof n){var g="horizontal"==o.settings.mode?-(n.left-s):-n.top;b(g,"slide",o.settings.speed);}}},r.goToNextSlide=function(){if(o.settings.infiniteLoop||!o.active.last){var t=parseInt(o.active.index)+1;r.goToSlide(t,"next");}},r.goToPrevSlide=function(){if(o.settings.infiniteLoop||0!=o.active.index){var t=parseInt(o.active.index)-1;r.goToSlide(t,"prev");}},r.startAuto=function(t){o.interval||(o.interval=setInterval(function(){"next"==o.settings.autoDirection?r.goToNextSlide():r.goToPrevSlide();},o.settings.pause),o.settings.autoControls&&1!=t&&A("stop"));},r.stopAuto=function(t){o.interval&&(clearInterval(o.interval),o.interval=null,o.settings.autoControls&&1!=t&&A("start"));},r.getCurrentSlide=function(){return o.active.index;},r.getCurrentSlideElement=function(){return o.children.eq(o.active.index);},r.getSlideCount=function(){return o.children.length;},r.redrawSlider=function(){o.children.add(r.find(".bx-clone")).outerWidth(u()),o.viewport.css("height",v()),o.settings.ticker||S(),o.active.last&&(o.active.index=x()-1),o.active.index>=x()&&(o.active.last=!0),o.settings.pager&&!o.settings.pagerCustom&&(w(),q(o.active.index));},r.destroySlider=function(){o.initialized&&(o.initialized=!1,t(".bx-clone",this).remove(),o.children.each(function(){void 0!=t(this).data("origStyle")?t(this).attr("style",t(this).data("origStyle")):t(this).removeAttr("style");}),void 0!=t(this).data("origStyle")?this.attr("style",t(this).data("origStyle")):t(this).removeAttr("style"),t(this).unwrap().unwrap(),o.controls.el&&o.controls.el.remove(),o.controls.next&&o.controls.next.remove(),o.controls.prev&&o.controls.prev.remove(),o.pagerEl&&o.settings.controls&&o.pagerEl.remove(),t(".bx-caption",this).remove(),o.controls.autoEl&&o.controls.autoEl.remove(),clearInterval(o.interval),o.settings.responsive&&t(window).unbind("resize",Z));},r.reloadSlider=function(t){void 0!=t&&(n=t),r.destroySlider(),d();},d(),this;};}(jQuery);

},{}],7:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=




function(){
// Adding position to submenu items to align with parent

var width=$(window).width();

setTimeout(function(){
if(width>=1024){
if($('.main-nav-dropdown').length){
var active_parent=$('a.active-parent').position().left;
$(".child-menu").css({
'left':active_parent+'px',
'opacity':'1'});

}
}
},10);
};

},{}],8:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){
if($('.c-ratiometer_container').length){
var triggerAtY=$('.c-ratiometer_container').offset().top-$(window).outerHeight();
$(window).scroll(function(event){

// #target not yet in view
if(triggerAtY>$(window).scrollTop()){
return;
}

$('.c-ratiometer .js-progress-bar').easyPieChart({
size:255,
lineWidth:10,
trackColor:'#FFFFFF',
barColor:'#7CB4F6',
scaleColor:false,
animate:2000,
rotate:130,
lineCap:'square',
onStep:function onStep(from,to,percent){
$(this.el).siblings('.c-rationmeter-text').find('.percent').text(Math.round(percent)+'%');
}});


//remove this event handler
$(this).off(event);
});
}
};

},{}],9:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){
var searchForm=$('.c-searchform--header');
var searchFormResults=$('.c-searchform--results');
var searchBtn=$('.js-search-btn');
var searchBtnResults=$('.js-search-filter__btn');
var searchBtnClose=$('.c-searchform--header .c-searchform__close-btn');
var searchBtnCloseResults=$('.c-searchform--results .c-searchform__close-btn');

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

if(searchFormResults.length){
searchBtnResults.click(function(e){
e.preventDefault();
searchFormResults.addClass('active');
});

searchBtnCloseResults.click(function(e){
e.preventDefault();
searchFormResults.removeClass('active');
});
}

// Focus
$('a.c-nav__search-btn.js-search-btn').click(function(){
$(".c-searchform.c-searchform--header.active input.header__search").focus();
});
$('a.c-search-filter__btn.js-search-filter__btn').click(function(){
$(".c-searchform.c-searchform--results.active input.result__search").focus();
});
};

},{}],10:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){
if($('.c-ph-stats__container').length){
var triggerAtY=$('.c-ph-stats__container').offset().top-$(window).outerHeight();
$(window).scroll(function(event){

// #target not yet in view
if(triggerAtY>$(window).scrollTop()){
return;
}

// SVG animation
var svg=jQuery(".curve").drawsvg({
duration:2000,
easing:"linear",
reverse:"true"});

svg.drawsvg("animate");

// remove this event handler
$(this).off(event);
});
}
};

},{}],11:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=



function(){
$('.c-hero_playbutton').click(function(){
if($(this).siblings(".video-player").get(0).paused){
$(this).siblings(".video-player").get(0).play();
$(this).fadeOut();
}
});

$('.video-player').click(function(){
if(!$(this).get(0).paused){
$(this).get(0).pause();
$(this).siblings(".c-hero_playbutton").fadeIn();
}
});
};

},{}],12:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=


function(){
// Inject YouTube API script
var tag=document.createElement('script');
tag.src="//www.youtube.com/player_api";
var firstScriptTag=document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag,firstScriptTag);


var playButton=$('#play-button');

// Get youtube video ID function
function getId(url){
var regExp=/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
var match=url.match(regExp);

if(match&&match[2].length==11){
return match[2];
}else{
return'error';
}
}

// The first argument of YT.Player is an HTML element ID. YouTube API will replace my <div id="triptych__video"> tag with an iframe containing the youtube video.
window.onYouTubeIframeAPIReady=function(){
$('.fullwidth__video').each(function(){
var VideoURL=$(this).attr('video-url');
var playButton=$(this).siblings('#play-button');
// Get youtube video ID from the URL
var videoId=getId(VideoURL);
var fullWidthplayer=new YT.Player($(this)[0],{
height:320,
width:400,
playerVars:{
controls:0,
rel:0},

videoId:videoId,
events:{
'onReady':onPlayerReady,
'onStateChange':onPlayerStateChange}});



function onPlayerStateChange(event){
console.log(YT.PlayerState.PAUSED);
if(event.data==YT.PlayerState.PAUSED){
playButton.show();
}
}

function onPlayerReady(event){
playButton.on("click",function(e){
// Playing video from start
fullWidthplayer.playVideo();
playButton.hide();
});
}


});
};


};

},{}]},{},[1]);