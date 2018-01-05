(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.3.1';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
                                  * Stores initialized plugins.
                                  */
    _plugins: {},

    /**
                   * Stores generated unique ids for plugin instances
                   */
    _uuids: [],

    /**
                 * Returns a boolean for RTL support
                 */
    rtl: function rtl() {
      return $('html').attr('dir') === 'rtl';
    },
    /**
        * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
        * @param {Object} plugin - The constructor of the plugin.
        */
    plugin: function plugin(_plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(_plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = _plugin;
    },
    /**
        * @function
        * Populates the _uuids array with pointers to each individual plugin instance.
        * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
        * Also fires the initialization event for each plugin, consolidating repetitive code.
        * @param {Object} plugin - an instance of a plugin, usually `this` in context.
        * @param {String} name - the name of the plugin, passed as a camelCased string.
        * @fires Plugin#init
        */
    registerPlugin: function registerPlugin(plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {plugin.$element.attr('data-' + pluginName, plugin.uuid);}
      if (!plugin.$element.data('zfPlugin')) {plugin.$element.data('zfPlugin', plugin);}
      /**
                                                                                          * Fires when the plugin has initialized.
                                                                                          * @event Plugin#init
                                                                                          */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
        * @function
        * Removes the plugins uuid from the _uuids array.
        * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
        * Also fires the destroyed event for the plugin, consolidating repetitive code.
        * @param {Object} plugin - an instance of a plugin, usually `this` in context.
        * @fires Plugin#destroyed
        */
    unregisterPlugin: function unregisterPlugin(plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
                                                                               * Fires when the plugin has been destroyed.
                                                                               * @event Plugin#destroyed
                                                                               */.
      trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
        * @function
        * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
        * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
        * @default If no argument is passed, reflow all currently active plugins.
        */
    reInit: function reInit(plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins === 'undefined' ? 'undefined' : _typeof(plugins),
          _this = this,
          fns = {
            'object': function object(plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function string() {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function undefined() {
              this['object'](Object.keys(_this._plugins));
            } };

          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
        * returns a random base-36 uid with namespacing
        * @function
        * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
        * @param {String} namespace - name of plugin to be incorporated in uid, optional.
        * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
        * @returns {String} - unique id
        */
    GetYoDigits: function GetYoDigits(length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
        * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
        * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
        * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
        */
    reflow: function reflow(elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
          opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {return el.trim();});
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function transitionend($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend' };

      var elem = document.createElement('div'),
      end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    } };


  Foundation.util = {
    /**
                       * Function for applying a debounce effect to a function call.
                       * @function
                       * @param {Function} func - Function to be called at end of timeout.
                       * @param {Number} delay - Time in ms to delay the call of `func`.
                       * @returns function
                       */
    throttle: function throttle(func, delay) {
      var timer = null;

      return function () {
        var context = this,args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    } };


  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function foundation(method) {
    var type = typeof method === 'undefined' ? 'undefined' : _typeof(method),
    $meta = $('meta.foundation-mq'),
    $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {//needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {//an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {//make sure both the class and method exist
        if (this.length === 1) {//if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {//otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {//error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {//error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now)
    window.Date.now = Date.now = function () {return new Date().getTime();};

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] ||
      window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) ||
    !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {callback(lastTime = nextTime);},
        nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
       * Polyfill for performance.now, required by rAF
       */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function now() {return Date.now() - this.start;} };

    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function fNOP() {},
      fBound = function fBound() {
        return fToBind.apply(this instanceof fNOP ?
        this :
        oThis,
        aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else
    if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else
    {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else
    if ('false' === str) return false;else
    if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

}(jQuery);

},{}],2:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * Drilldown module.
                * @module foundation.drilldown
                * @requires foundation.util.keyboard
                * @requires foundation.util.motion
                * @requires foundation.util.nest
                */var

  Drilldown = function () {
    /**
                            * Creates a new instance of a drilldown menu.
                            * @class
                            * @param {jQuery} element - jQuery object to make into an accordion menu.
                            * @param {Object} options - Overrides to the default plugin settings.
                            */
    function Drilldown(element, options) {_classCallCheck(this, Drilldown);
      this.$element = element;
      this.options = $.extend({}, Drilldown.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'drilldown');

      this._init();

      Foundation.registerPlugin(this, 'Drilldown');
      Foundation.Keyboard.register('Drilldown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close',
        'TAB': 'down',
        'SHIFT_TAB': 'up' });

    }

    /**
       * Initializes the drilldown by creating jQuery collections of elements
       * @private
       */_createClass(Drilldown, [{ key: '_init', value: function _init()
      {
        this.$submenuAnchors = this.$element.find('li.is-drilldown-submenu-parent').children('a');
        this.$submenus = this.$submenuAnchors.parent('li').children('[data-submenu]');
        this.$menuItems = this.$element.find('li').not('.js-drilldown-back').attr('role', 'menuitem').find('a');
        this.$element.attr('data-mutate', this.$element.attr('data-drilldown') || Foundation.GetYoDigits(6, 'drilldown'));

        this._prepareMenu();
        this._registerEvents();

        this._keyboardEvents();
      }

      /**
         * prepares drilldown menu by setting attributes to links and elements
         * sets a min height to prevent content jumping
         * wraps the element if not already wrapped
         * @private
         * @function
         */ }, { key: '_prepareMenu', value: function _prepareMenu()
      {
        var _this = this;
        // if(!this.options.holdOpen){
        //   this._menuLinkEvents();
        // }
        this.$submenuAnchors.each(function () {
          var $link = $(this);
          var $sub = $link.parent();
          if (_this.options.parentLink) {
            $link.clone().prependTo($sub.children('[data-submenu]')).wrap('<li class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="menu-item"></li>');
          }
          $link.data('savedHref', $link.attr('href')).removeAttr('href').attr('tabindex', 0);
          $link.children('[data-submenu]').
          attr({
            'aria-hidden': true,
            'tabindex': 0,
            'role': 'menu' });

          _this._events($link);
        });
        this.$submenus.each(function () {
          var $menu = $(this),
          $back = $menu.find('.js-drilldown-back');
          if (!$back.length) {
            switch (_this.options.backButtonPosition) {
              case "bottom":
                $menu.append(_this.options.backButton);
                break;
              case "top":
                $menu.prepend(_this.options.backButton);
                break;
              default:
                console.error("Unsupported backButtonPosition value '" + _this.options.backButtonPosition + "'");}

          }
          _this._back($menu);
        });

        this.$submenus.addClass('invisible');
        if (!this.options.autoHeight) {
          this.$submenus.addClass('drilldown-submenu-cover-previous');
        }

        // create a wrapper on element if it doesn't exist.
        if (!this.$element.parent().hasClass('is-drilldown')) {
          this.$wrapper = $(this.options.wrapper).addClass('is-drilldown');
          if (this.options.animateHeight) this.$wrapper.addClass('animate-height');
          this.$element.wrap(this.$wrapper);
        }
        // set wrapper
        this.$wrapper = this.$element.parent();
        this.$wrapper.css(this._getMaxDims());
      } }, { key: '_resize', value: function _resize()

      {
        this.$wrapper.css({ 'max-width': 'none', 'min-height': 'none' });
        // _getMaxDims has side effects (boo) but calling it should update all other necessary heights & widths
        this.$wrapper.css(this._getMaxDims());
      }

      /**
         * Adds event handlers to elements in the menu.
         * @function
         * @private
         * @param {jQuery} $elem - the current menu item to add handlers to.
         */ }, { key: '_events', value: function _events(
      $elem) {
        var _this = this;

        $elem.off('click.zf.drilldown').
        on('click.zf.drilldown', function (e) {
          if ($(e.target).parentsUntil('ul', 'li').hasClass('is-drilldown-submenu-parent')) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }

          // if(e.target !== e.currentTarget.firstElementChild){
          //   return false;
          // }
          _this._show($elem.parent('li'));

          if (_this.options.closeOnClick) {
            var $body = $('body');
            $body.off('.zf.drilldown').on('click.zf.drilldown', function (e) {
              if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {return;}
              e.preventDefault();
              _this._hideAll();
              $body.off('.zf.drilldown');
            });
          }
        });
        this.$element.on('mutateme.zf.trigger', this._resize.bind(this));
      }

      /**
         * Adds event handlers to the menu element.
         * @function
         * @private
         */ }, { key: '_registerEvents', value: function _registerEvents()
      {
        if (this.options.scrollTop) {
          this._bindHandler = this._scrollTop.bind(this);
          this.$element.on('open.zf.drilldown hide.zf.drilldown closed.zf.drilldown', this._bindHandler);
        }
      }

      /**
         * Scroll to Top of Element or data-scroll-top-element
         * @function
         * @fires Drilldown#scrollme
         */ }, { key: '_scrollTop', value: function _scrollTop()
      {
        var _this = this;
        var $scrollTopElement = _this.options.scrollTopElement != '' ? $(_this.options.scrollTopElement) : _this.$element,
        scrollPos = parseInt($scrollTopElement.offset().top + _this.options.scrollTopOffset);
        $('html, body').stop(true).animate({ scrollTop: scrollPos }, _this.options.animationDuration, _this.options.animationEasing, function () {
          /**
                                                                                                                                                    * Fires after the menu has scrolled
                                                                                                                                                    * @event Drilldown#scrollme
                                                                                                                                                    */
          if (this === $('html')[0]) _this.$element.trigger('scrollme.zf.drilldown');
        });
      }

      /**
         * Adds keydown event listener to `li`'s in the menu.
         * @private
         */ }, { key: '_keyboardEvents', value: function _keyboardEvents()
      {
        var _this = this;

        this.$menuItems.add(this.$element.find('.js-drilldown-back > a, .is-submenu-parent-item > a')).on('keydown.zf.drilldown', function (e) {
          var $element = $(this),
          $elements = $element.parent('li').parent('ul').children('li').children('a'),
          $prevElement,
          $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(Math.max(0, i - 1));
              $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              return;
            }
          });

          Foundation.Keyboard.handleKey(e, 'Drilldown', {
            next: function next() {
              if ($element.is(_this.$submenuAnchors)) {
                _this._show($element.parent('li'));
                $element.parent('li').one(Foundation.transitionend($element), function () {
                  $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
                });
                return true;
              }
            },
            previous: function previous() {
              _this._hide($element.parent('li').parent('ul'));
              $element.parent('li').parent('ul').one(Foundation.transitionend($element), function () {
                setTimeout(function () {
                  $element.parent('li').parent('ul').parent('li').children('a').first().focus();
                }, 1);
              });
              return true;
            },
            up: function up() {
              $prevElement.focus();
              // Don't tap focus on first element in root ul
              return !$element.is(_this.$element.find('> li:first-child > a'));
            },
            down: function down() {
              $nextElement.focus();
              // Don't tap focus on last element in root ul
              return !$element.is(_this.$element.find('> li:last-child > a'));
            },
            close: function close() {
              // Don't close on element in root ul
              if (!$element.is(_this.$element.find('> li > a'))) {
                _this._hide($element.parent().parent());
                $element.parent().parent().siblings('a').focus();
              }
            },
            open: function open() {
              if (!$element.is(_this.$menuItems)) {// not menu item means back button
                _this._hide($element.parent('li').parent('ul'));
                $element.parent('li').parent('ul').one(Foundation.transitionend($element), function () {
                  setTimeout(function () {
                    $element.parent('li').parent('ul').parent('li').children('a').first().focus();
                  }, 1);
                });
                return true;
              } else if ($element.is(_this.$submenuAnchors)) {
                _this._show($element.parent('li'));
                $element.parent('li').one(Foundation.transitionend($element), function () {
                  $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
                });
                return true;
              }
            },
            handled: function handled(preventDefault) {
              if (preventDefault) {
                e.preventDefault();
              }
              e.stopImmediatePropagation();
            } });

        }); // end keyboardAccess
      }

      /**
         * Closes all open elements, and returns to root menu.
         * @function
         * @fires Drilldown#closed
         */ }, { key: '_hideAll', value: function _hideAll()
      {
        var $elem = this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') });
        $elem.one(Foundation.transitionend($elem), function (e) {
          $elem.removeClass('is-active is-closing');
        });
        /**
             * Fires when the menu is fully closed.
             * @event Drilldown#closed
             */
        this.$element.trigger('closed.zf.drilldown');
      }

      /**
         * Adds event listener for each `back` button, and closes open menus.
         * @function
         * @fires Drilldown#back
         * @param {jQuery} $elem - the current sub-menu to add `back` event.
         */ }, { key: '_back', value: function _back(
      $elem) {
        var _this = this;
        $elem.off('click.zf.drilldown');
        $elem.children('.js-drilldown-back').
        on('click.zf.drilldown', function (e) {
          e.stopImmediatePropagation();
          // console.log('mouseup on back');
          _this._hide($elem);

          // If there is a parent submenu, call show
          var parentSubMenu = $elem.parent('li').parent('ul').parent('li');
          if (parentSubMenu.length) {
            _this._show(parentSubMenu);
          }
        });
      }

      /**
         * Adds event listener to menu items w/o submenus to close open menus on click.
         * @function
         * @private
         */ }, { key: '_menuLinkEvents', value: function _menuLinkEvents()
      {
        var _this = this;
        this.$menuItems.not('.is-drilldown-submenu-parent').
        off('click.zf.drilldown').
        on('click.zf.drilldown', function (e) {
          // e.stopImmediatePropagation();
          setTimeout(function () {
            _this._hideAll();
          }, 0);
        });
      }

      /**
         * Opens a submenu.
         * @function
         * @fires Drilldown#open
         * @param {jQuery} $elem - the current element with a submenu to open, i.e. the `li` tag.
         */ }, { key: '_show', value: function _show(
      $elem) {
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.children('[data-submenu]').data('calcHeight') });
        $elem.attr('aria-expanded', true);
        $elem.children('[data-submenu]').addClass('is-active').removeClass('invisible').attr('aria-hidden', false);
        /**
                                                                                                                     * Fires when the submenu has opened.
                                                                                                                     * @event Drilldown#open
                                                                                                                     */
        this.$element.trigger('open.zf.drilldown', [$elem]);
      } }, { key: '_hide',

      /**
                            * Hides a submenu
                            * @function
                            * @fires Drilldown#hide
                            * @param {jQuery} $elem - the current sub-menu to hide, i.e. the `ul` tag.
                            */value: function _hide(
      $elem) {
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') });
        var _this = this;
        $elem.parent('li').attr('aria-expanded', false);
        $elem.attr('aria-hidden', true).addClass('is-closing');
        $elem.addClass('is-closing').
        one(Foundation.transitionend($elem), function () {
          $elem.removeClass('is-active is-closing');
          $elem.blur().addClass('invisible');
        });
        /**
             * Fires when the submenu has closed.
             * @event Drilldown#hide
             */
        $elem.trigger('hide.zf.drilldown', [$elem]);
      }

      /**
         * Iterates through the nested menus to calculate the min-height, and max-width for the menu.
         * Prevents content jumping.
         * @function
         * @private
         */ }, { key: '_getMaxDims', value: function _getMaxDims()
      {
        var maxHeight = 0,result = {},_this = this;
        this.$submenus.add(this.$element).each(function () {
          var numOfElems = $(this).children('li').length;
          var height = Foundation.Box.GetDimensions(this).height;
          maxHeight = height > maxHeight ? height : maxHeight;
          if (_this.options.autoHeight) {
            $(this).data('calcHeight', height);
            if (!$(this).hasClass('is-drilldown-submenu')) result['height'] = height;
          }
        });

        if (!this.options.autoHeight) result['min-height'] = maxHeight + 'px';

        result['max-width'] = this.$element[0].getBoundingClientRect().width + 'px';

        return result;
      }

      /**
         * Destroys the Drilldown Menu
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        if (this.options.scrollTop) this.$element.off('.zf.drilldown', this._bindHandler);
        this._hideAll();
        this.$element.off('mutateme.zf.trigger');
        Foundation.Nest.Burn(this.$element, 'drilldown');
        this.$element.unwrap().
        find('.js-drilldown-back, .is-submenu-parent-item').remove().
        end().find('.is-active, .is-closing, .is-drilldown-submenu').removeClass('is-active is-closing is-drilldown-submenu').
        end().find('[data-submenu]').removeAttr('aria-hidden tabindex role');
        this.$submenuAnchors.each(function () {
          $(this).off('.zf.drilldown');
        });

        this.$submenus.removeClass('drilldown-submenu-cover-previous');

        this.$element.find('a').each(function () {
          var $link = $(this);
          $link.removeAttr('tabindex');
          if ($link.data('savedHref')) {
            $link.attr('href', $link.data('savedHref')).removeData('savedHref');
          } else {return;}
        });
        Foundation.unregisterPlugin(this);
      } }]);return Drilldown;}();


  Drilldown.defaults = {
    /**
                          * Markup used for JS generated back button. Prepended  or appended (see backButtonPosition) to submenu lists and deleted on `destroy` method, 'js-drilldown-back' class required. Remove the backslash (`\`) if copy and pasting.
                          * @option
                          * @type {string}
                          * @default '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>'
                          */
    backButton: '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>',
    /**
                                                                                * Position the back button either at the top or bottom of drilldown submenus. Can be `'left'` or `'bottom'`.
                                                                                * @option
                                                                                * @type {string}
                                                                                * @default top
                                                                                */
    backButtonPosition: 'top',
    /**
                                * Markup used to wrap drilldown menu. Use a class name for independent styling; the JS applied class: `is-drilldown` is required. Remove the backslash (`\`) if copy and pasting.
                                * @option
                                * @type {string}
                                * @default '<div></div>'
                                */
    wrapper: '<div></div>',
    /**
                             * Adds the parent link to the submenu.
                             * @option
                             * @type {boolean}
                             * @default false
                             */
    parentLink: false,
    /**
                        * Allow the menu to return to root list on body click.
                        * @option
                        * @type {boolean}
                        * @default false
                        */
    closeOnClick: false,
    /**
                          * Allow the menu to auto adjust height.
                          * @option
                          * @type {boolean}
                          * @default false
                          */
    autoHeight: false,
    /**
                        * Animate the auto adjust height.
                        * @option
                        * @type {boolean}
                        * @default false
                        */
    animateHeight: false,
    /**
                           * Scroll to the top of the menu after opening a submenu or navigating back using the menu back button
                           * @option
                           * @type {boolean}
                           * @default false
                           */
    scrollTop: false,
    /**
                       * String jquery selector (for example 'body') of element to take offset().top from, if empty string the drilldown menu offset().top is taken
                       * @option
                       * @type {string}
                       * @default ''
                       */
    scrollTopElement: '',
    /**
                           * ScrollTop offset
                           * @option
                           * @type {number}
                           * @default 0
                           */
    scrollTopOffset: 0,
    /**
                         * Scroll animation duration
                         * @option
                         * @type {number}
                         * @default 500
                         */
    animationDuration: 500,
    /**
                             * Scroll animation easing. Can be `'swing'` or `'linear'`.
                             * @option
                             * @type {string}
                             * @see {@link https://api.jquery.com/animate|JQuery animate}
                             * @default 'swing'
                             */
    animationEasing: 'swing'
    // holdOpen: false
  };

  // Window exports
  Foundation.plugin(Drilldown, 'Drilldown');

}(jQuery);

},{}],3:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * DropdownMenu module.
                * @module foundation.dropdown-menu
                * @requires foundation.util.keyboard
                * @requires foundation.util.box
                * @requires foundation.util.nest
                */var

  DropdownMenu = function () {
    /**
                               * Creates a new instance of DropdownMenu.
                               * @class
                               * @fires DropdownMenu#init
                               * @param {jQuery} element - jQuery object to make into a dropdown menu.
                               * @param {Object} options - Overrides to the default plugin settings.
                               */
    function DropdownMenu(element, options) {_classCallCheck(this, DropdownMenu);
      this.$element = element;
      this.options = $.extend({}, DropdownMenu.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'dropdown');
      this._init();

      Foundation.registerPlugin(this, 'DropdownMenu');
      Foundation.Keyboard.register('DropdownMenu', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close' });

    }

    /**
       * Initializes the plugin, and calls _prepareMenu
       * @private
       * @function
       */_createClass(DropdownMenu, [{ key: '_init', value: function _init()
      {
        var subs = this.$element.find('li.is-dropdown-submenu-parent');
        this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

        this.$menuItems = this.$element.find('[role="menuitem"]');
        this.$tabs = this.$element.children('[role="menuitem"]');
        this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

        if (this.$element.hasClass(this.options.rightClass) || this.options.alignment === 'right' || Foundation.rtl() || this.$element.parents('.top-bar-right').is('*')) {
          this.options.alignment = 'right';
          subs.addClass('opens-left');
        } else {
          subs.addClass('opens-right');
        }
        this.changed = false;
        this._events();
      } }, { key: '_isVertical', value: function _isVertical()

      {
        return this.$tabs.css('display') === 'block';
      }

      /**
         * Adds event listeners to elements within the menu
         * @private
         * @function
         */ }, { key: '_events', value: function _events()
      {
        var _this = this,
        hasTouch = 'ontouchstart' in window || typeof window.ontouchstart !== 'undefined',
        parClass = 'is-dropdown-submenu-parent';

        // used for onClick and in the keyboard handlers
        var handleClickFn = function handleClickFn(e) {
          var $elem = $(e.target).parentsUntil('ul', '.' + parClass),
          hasSub = $elem.hasClass(parClass),
          hasClicked = $elem.attr('data-is-click') === 'true',
          $sub = $elem.children('.is-dropdown-submenu');

          if (hasSub) {
            if (hasClicked) {
              if (!_this.options.closeOnClick || !_this.options.clickOpen && !hasTouch || _this.options.forceFollow && hasTouch) {return;} else
              {
                e.stopImmediatePropagation();
                e.preventDefault();
                _this._hide($elem);
              }
            } else {
              e.preventDefault();
              e.stopImmediatePropagation();
              _this._show($sub);
              $elem.add($elem.parentsUntil(_this.$element, '.' + parClass)).attr('data-is-click', true);
            }
          }
        };

        if (this.options.clickOpen || hasTouch) {
          this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', handleClickFn);
        }

        // Handle Leaf element Clicks
        if (_this.options.closeOnClickInside) {
          this.$menuItems.on('click.zf.dropdownmenu', function (e) {
            var $elem = $(this),
            hasSub = $elem.hasClass(parClass);
            if (!hasSub) {
              _this._hide();
            }
          });
        }

        if (!this.options.disableHover) {
          this.$menuItems.on('mouseenter.zf.dropdownmenu', function (e) {
            var $elem = $(this),
            hasSub = $elem.hasClass(parClass);

            if (hasSub) {
              clearTimeout($elem.data('_delay'));
              $elem.data('_delay', setTimeout(function () {
                _this._show($elem.children('.is-dropdown-submenu'));
              }, _this.options.hoverDelay));
            }
          }).on('mouseleave.zf.dropdownmenu', function (e) {
            var $elem = $(this),
            hasSub = $elem.hasClass(parClass);
            if (hasSub && _this.options.autoclose) {
              if ($elem.attr('data-is-click') === 'true' && _this.options.clickOpen) {return false;}

              clearTimeout($elem.data('_delay'));
              $elem.data('_delay', setTimeout(function () {
                _this._hide($elem);
              }, _this.options.closingTime));
            }
          });
        }
        this.$menuItems.on('keydown.zf.dropdownmenu', function (e) {
          var $element = $(e.target).parentsUntil('ul', '[role="menuitem"]'),
          isTab = _this.$tabs.index($element) > -1,
          $elements = isTab ? _this.$tabs : $element.siblings('li').add($element),
          $prevElement,
          $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(i - 1);
              $nextElement = $elements.eq(i + 1);
              return;
            }
          });

          var nextSibling = function nextSibling() {
            if (!$element.is(':last-child')) {
              $nextElement.children('a:first').focus();
              e.preventDefault();
            }
          },prevSibling = function prevSibling() {
            $prevElement.children('a:first').focus();
            e.preventDefault();
          },openSub = function openSub() {
            var $sub = $element.children('ul.is-dropdown-submenu');
            if ($sub.length) {
              _this._show($sub);
              $element.find('li > a:first').focus();
              e.preventDefault();
            } else {return;}
          },closeSub = function closeSub() {
            //if ($element.is(':first-child')) {
            var close = $element.parent('ul').parent('li');
            close.children('a:first').focus();
            _this._hide(close);
            e.preventDefault();
            //}
          };
          var functions = {
            open: openSub,
            close: function close() {
              _this._hide(_this.$element);
              _this.$menuItems.find('a:first').focus(); // focus to first element
              e.preventDefault();
            },
            handled: function handled() {
              e.stopImmediatePropagation();
            } };


          if (isTab) {
            if (_this._isVertical()) {// vertical menu
              if (Foundation.rtl()) {// right aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: closeSub,
                  previous: openSub });

              } else {// left aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: openSub,
                  previous: closeSub });

              }
            } else {// horizontal menu
              if (Foundation.rtl()) {// right aligned
                $.extend(functions, {
                  next: prevSibling,
                  previous: nextSibling,
                  down: openSub,
                  up: closeSub });

              } else {// left aligned
                $.extend(functions, {
                  next: nextSibling,
                  previous: prevSibling,
                  down: openSub,
                  up: closeSub });

              }
            }
          } else {// not tabs -> one sub
            if (Foundation.rtl()) {// right aligned
              $.extend(functions, {
                next: closeSub,
                previous: openSub,
                down: nextSibling,
                up: prevSibling });

            } else {// left aligned
              $.extend(functions, {
                next: openSub,
                previous: closeSub,
                down: nextSibling,
                up: prevSibling });

            }
          }
          Foundation.Keyboard.handleKey(e, 'DropdownMenu', functions);

        });
      }

      /**
         * Adds an event handler to the body to close any dropdowns on a click.
         * @function
         * @private
         */ }, { key: '_addBodyHandler', value: function _addBodyHandler()
      {
        var $body = $(document.body),
        _this = this;
        $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu').
        on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function (e) {
          var $link = _this.$element.find(e.target);
          if ($link.length) {return;}

          _this._hide();
          $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
        });
      }

      /**
         * Opens a dropdown pane, and checks for collisions first.
         * @param {jQuery} $sub - ul element that is a submenu to show
         * @function
         * @private
         * @fires DropdownMenu#show
         */ }, { key: '_show', value: function _show(
      $sub) {
        var idx = this.$tabs.index(this.$tabs.filter(function (i, el) {
          return $(el).find($sub).length > 0;
        }));
        var $sibs = $sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
        this._hide($sibs, idx);
        $sub.css('visibility', 'hidden').addClass('js-dropdown-active').
        parent('li.is-dropdown-submenu-parent').addClass('is-active');
        var clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
        if (!clear) {
          var oldClass = this.options.alignment === 'left' ? '-right' : '-left',
          $parentLi = $sub.parent('.is-dropdown-submenu-parent');
          $parentLi.removeClass('opens' + oldClass).addClass('opens-' + this.options.alignment);
          clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
          if (!clear) {
            $parentLi.removeClass('opens-' + this.options.alignment).addClass('opens-inner');
          }
          this.changed = true;
        }
        $sub.css('visibility', '');
        if (this.options.closeOnClick) {this._addBodyHandler();}
        /**
                                                                  * Fires when the new dropdown pane is visible.
                                                                  * @event DropdownMenu#show
                                                                  */
        this.$element.trigger('show.zf.dropdownmenu', [$sub]);
      }

      /**
         * Hides a single, currently open dropdown pane, if passed a parameter, otherwise, hides everything.
         * @function
         * @param {jQuery} $elem - element with a submenu to hide
         * @param {Number} idx - index of the $tabs collection to hide
         * @private
         */ }, { key: '_hide', value: function _hide(
      $elem, idx) {
        var $toClose;
        if ($elem && $elem.length) {
          $toClose = $elem;
        } else if (idx !== undefined) {
          $toClose = this.$tabs.not(function (i, el) {
            return i === idx;
          });
        } else
        {
          $toClose = this.$element;
        }
        var somethingToClose = $toClose.hasClass('is-active') || $toClose.find('.is-active').length > 0;

        if (somethingToClose) {
          $toClose.find('li.is-active').add($toClose).attr({
            'data-is-click': false }).
          removeClass('is-active');

          $toClose.find('ul.js-dropdown-active').removeClass('js-dropdown-active');

          if (this.changed || $toClose.find('opens-inner').length) {
            var oldClass = this.options.alignment === 'left' ? 'right' : 'left';
            $toClose.find('li.is-dropdown-submenu-parent').add($toClose).
            removeClass('opens-inner opens-' + this.options.alignment).
            addClass('opens-' + oldClass);
            this.changed = false;
          }
          /**
             * Fires when the open menus are closed.
             * @event DropdownMenu#hide
             */
          this.$element.trigger('hide.zf.dropdownmenu', [$toClose]);
        }
      }

      /**
         * Destroys the plugin.
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click').
        removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
        $(document.body).off('.zf.dropdownmenu');
        Foundation.Nest.Burn(this.$element, 'dropdown');
        Foundation.unregisterPlugin(this);
      } }]);return DropdownMenu;}();


  /**
                                      * Default settings for plugin
                                      */
  DropdownMenu.defaults = {
    /**
                             * Disallows hover events from opening submenus
                             * @option
                             * @type {boolean}
                             * @default false
                             */
    disableHover: false,
    /**
                          * Allow a submenu to automatically close on a mouseleave event, if not clicked open.
                          * @option
                          * @type {boolean}
                          * @default true
                          */
    autoclose: true,
    /**
                      * Amount of time to delay opening a submenu on hover event.
                      * @option
                      * @type {number}
                      * @default 50
                      */
    hoverDelay: 50,
    /**
                     * Allow a submenu to open/remain open on parent click event. Allows cursor to move away from menu.
                     * @option
                     * @type {boolean}
                     * @default false
                     */
    clickOpen: false,
    /**
                       * Amount of time to delay closing a submenu on a mouseleave event.
                       * @option
                       * @type {number}
                       * @default 500
                       */

    closingTime: 500,
    /**
                       * Position of the menu relative to what direction the submenus should open. Handled by JS. Can be `'left'` or `'right'`.
                       * @option
                       * @type {string}
                       * @default 'left'
                       */
    alignment: 'left',
    /**
                        * Allow clicks on the body to close any open submenus.
                        * @option
                        * @type {boolean}
                        * @default true
                        */
    closeOnClick: true,
    /**
                         * Allow clicks on leaf anchor links to close any open submenus.
                         * @option
                         * @type {boolean}
                         * @default true
                         */
    closeOnClickInside: true,
    /**
                               * Class applied to vertical oriented menus, Foundation default is `vertical`. Update this if using your own class.
                               * @option
                               * @type {string}
                               * @default 'vertical'
                               */
    verticalClass: 'vertical',
    /**
                                * Class applied to right-side oriented menus, Foundation default is `align-right`. Update this if using your own class.
                                * @option
                                * @type {string}
                                * @default 'align-right'
                                */
    rightClass: 'align-right',
    /**
                                * Boolean to force overide the clicking of links to perform default action, on second touch event for mobile.
                                * @option
                                * @type {boolean}
                                * @default true
                                */
    forceFollow: true };


  // Window exports
  Foundation.plugin(DropdownMenu, 'DropdownMenu');

}(jQuery);

},{}],4:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * OffCanvas module.
                * @module foundation.offcanvas
                * @requires foundation.util.keyboard
                * @requires foundation.util.mediaQuery
                * @requires foundation.util.triggers
                * @requires foundation.util.motion
                */var

  OffCanvas = function () {
    /**
                            * Creates a new instance of an off-canvas wrapper.
                            * @class
                            * @fires OffCanvas#init
                            * @param {Object} element - jQuery object to initialize.
                            * @param {Object} options - Overrides to the default plugin settings.
                            */
    function OffCanvas(element, options) {_classCallCheck(this, OffCanvas);
      this.$element = element;
      this.options = $.extend({}, OffCanvas.defaults, this.$element.data(), options);
      this.$lastTrigger = $();
      this.$triggers = $();

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'OffCanvas');
      Foundation.Keyboard.register('OffCanvas', {
        'ESCAPE': 'close' });


    }

    /**
       * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
       * @function
       * @private
       */_createClass(OffCanvas, [{ key: '_init', value: function _init()
      {
        var id = this.$element.attr('id');

        this.$element.attr('aria-hidden', 'true');

        this.$element.addClass('is-transition-' + this.options.transition);

        // Find triggers that affect this element and add aria-expanded to them
        this.$triggers = $(document).
        find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').
        attr('aria-expanded', 'false').
        attr('aria-controls', id);

        // Add an overlay over the content if necessary
        if (this.options.contentOverlay === true) {
          var overlay = document.createElement('div');
          var overlayPosition = $(this.$element).css("position") === 'fixed' ? 'is-overlay-fixed' : 'is-overlay-absolute';
          overlay.setAttribute('class', 'js-off-canvas-overlay ' + overlayPosition);
          this.$overlay = $(overlay);
          if (overlayPosition === 'is-overlay-fixed') {
            $('body').append(this.$overlay);
          } else {
            this.$element.siblings('[data-off-canvas-content]').append(this.$overlay);
          }
        }

        this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

        if (this.options.isRevealed === true) {
          this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
          this._setMQChecker();
        }
        if (!this.options.transitionTime === true) {
          this.options.transitionTime = parseFloat(window.getComputedStyle($('[data-off-canvas]')[0]).transitionDuration) * 1000;
        }
      }

      /**
         * Adds event handlers to the off-canvas wrapper and the exit overlay.
         * @function
         * @private
         */ }, { key: '_events', value: function _events()
      {
        this.$element.off('.zf.trigger .zf.offcanvas').on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'keydown.zf.offcanvas': this._handleKeyboard.bind(this) });


        if (this.options.closeOnClick === true) {
          var $target = this.options.contentOverlay ? this.$overlay : $('[data-off-canvas-content]');
          $target.on({ 'click.zf.offcanvas': this.close.bind(this) });
        }
      }

      /**
         * Applies event listener for elements that will reveal at certain breakpoints.
         * @private
         */ }, { key: '_setMQChecker', value: function _setMQChecker()
      {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          } else {
            _this.reveal(false);
          }
        }).one('load.zf.offcanvas', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          }
        });
      }

      /**
         * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
         * @param {Boolean} isRevealed - true if element should be revealed.
         * @function
         */ }, { key: 'reveal', value: function reveal(
      isRevealed) {
        var $closer = this.$element.find('[data-close]');
        if (isRevealed) {
          this.close();
          this.isRevealed = true;
          this.$element.attr('aria-hidden', 'false');
          this.$element.off('open.zf.trigger toggle.zf.trigger');
          if ($closer.length) {$closer.hide();}
        } else {
          this.isRevealed = false;
          this.$element.attr('aria-hidden', 'true');
          this.$element.on({
            'open.zf.trigger': this.open.bind(this),
            'toggle.zf.trigger': this.toggle.bind(this) });

          if ($closer.length) {
            $closer.show();
          }
        }
      }

      /**
         * Stops scrolling of the body when offcanvas is open on mobile Safari and other troublesome browsers.
         * @private
         */ }, { key: '_stopScrolling', value: function _stopScrolling(
      event) {
        return false;
      }

      // Taken and adapted from http://stackoverflow.com/questions/16889447/prevent-full-page-scrolling-ios
      // Only really works for y, not sure how to extend to x or if we need to.
    }, { key: '_recordScrollable', value: function _recordScrollable(event) {
        var elem = this; // called from event handler context with this as elem

        // If the element is scrollable (content overflows), then...
        if (elem.scrollHeight !== elem.clientHeight) {
          // If we're at the top, scroll down one pixel to allow scrolling up
          if (elem.scrollTop === 0) {
            elem.scrollTop = 1;
          }
          // If we're at the bottom, scroll up one pixel to allow scrolling down
          if (elem.scrollTop === elem.scrollHeight - elem.clientHeight) {
            elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1;
          }
        }
        elem.allowUp = elem.scrollTop > 0;
        elem.allowDown = elem.scrollTop < elem.scrollHeight - elem.clientHeight;
        elem.lastY = event.originalEvent.pageY;
      } }, { key: '_stopScrollPropagation', value: function _stopScrollPropagation(

      event) {
        var elem = this; // called from event handler context with this as elem
        var up = event.pageY < elem.lastY;
        var down = !up;
        elem.lastY = event.pageY;

        if (up && elem.allowUp || down && elem.allowDown) {
          event.stopPropagation();
        } else {
          event.preventDefault();
        }
      }

      /**
         * Opens the off-canvas menu.
         * @function
         * @param {Object} event - Event object passed from listener.
         * @param {jQuery} trigger - element that triggered the off-canvas to open.
         * @fires OffCanvas#opened
         */ }, { key: 'open', value: function open(
      event, trigger) {
        if (this.$element.hasClass('is-open') || this.isRevealed) {return;}
        var _this = this;

        if (trigger) {
          this.$lastTrigger = trigger;
        }

        if (this.options.forceTo === 'top') {
          window.scrollTo(0, 0);
        } else if (this.options.forceTo === 'bottom') {
          window.scrollTo(0, document.body.scrollHeight);
        }

        /**
           * Fires when the off-canvas menu opens.
           * @event OffCanvas#opened
           */
        _this.$element.addClass('is-open');

        this.$triggers.attr('aria-expanded', 'true');
        this.$element.attr('aria-hidden', 'false').
        trigger('opened.zf.offcanvas');

        // If `contentScroll` is set to false, add class and disable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').addClass('is-off-canvas-open').on('touchmove', this._stopScrolling);
          this.$element.on('touchstart', this._recordScrollable);
          this.$element.on('touchmove', this._stopScrollPropagation);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.addClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.addClass('is-closable');
        }

        if (this.options.autoFocus === true) {
          this.$element.one(Foundation.transitionend(this.$element), function () {
            _this.$element.find('a, button').eq(0).focus();
          });
        }

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').attr('tabindex', '-1');
          Foundation.Keyboard.trapFocus(this.$element);
        }
      }

      /**
         * Closes the off-canvas menu.
         * @function
         * @param {Function} cb - optional cb to fire after closure.
         * @fires OffCanvas#closed
         */ }, { key: 'close', value: function close(
      cb) {
        if (!this.$element.hasClass('is-open') || this.isRevealed) {return;}

        var _this = this;

        _this.$element.removeClass('is-open');

        this.$element.attr('aria-hidden', 'true')
        /**
                                                   * Fires when the off-canvas menu opens.
                                                   * @event OffCanvas#closed
                                                   */.
        trigger('closed.zf.offcanvas');

        // If `contentScroll` is set to false, remove class and re-enable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').removeClass('is-off-canvas-open').off('touchmove', this._stopScrolling);
          this.$element.off('touchstart', this._recordScrollable);
          this.$element.off('touchmove', this._stopScrollPropagation);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-closable');
        }

        this.$triggers.attr('aria-expanded', 'false');

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').removeAttr('tabindex');
          Foundation.Keyboard.releaseFocus(this.$element);
        }
      }

      /**
         * Toggles the off-canvas menu open or closed.
         * @function
         * @param {Object} event - Event object passed from listener.
         * @param {jQuery} trigger - element that triggered the off-canvas to open.
         */ }, { key: 'toggle', value: function toggle(
      event, trigger) {
        if (this.$element.hasClass('is-open')) {
          this.close(event, trigger);
        } else
        {
          this.open(event, trigger);
        }
      }

      /**
         * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
         * @function
         * @private
         */ }, { key: '_handleKeyboard', value: function _handleKeyboard(
      e) {var _this2 = this;
        Foundation.Keyboard.handleKey(e, 'OffCanvas', {
          close: function close() {
            _this2.close();
            _this2.$lastTrigger.focus();
            return true;
          },
          handled: function handled() {
            e.stopPropagation();
            e.preventDefault();
          } });

      }

      /**
         * Destroys the offcanvas plugin.
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        this.close();
        this.$element.off('.zf.trigger .zf.offcanvas');
        this.$overlay.off('.zf.offcanvas');

        Foundation.unregisterPlugin(this);
      } }]);return OffCanvas;}();


  OffCanvas.defaults = {
    /**
                          * Allow the user to click outside of the menu to close it.
                          * @option
                          * @type {boolean}
                          * @default true
                          */
    closeOnClick: true,

    /**
                         * Adds an overlay on top of `[data-off-canvas-content]`.
                         * @option
                         * @type {boolean}
                         * @default true
                         */
    contentOverlay: true,

    /**
                           * Enable/disable scrolling of the main content when an off canvas panel is open.
                           * @option
                           * @type {boolean}
                           * @default true
                           */
    contentScroll: true,

    /**
                          * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
                          * @option
                          * @type {number}
                          * @default 0
                          */
    transitionTime: 0,

    /**
                        * Type of transition for the offcanvas menu. Options are 'push', 'detached' or 'slide'.
                        * @option
                        * @type {string}
                        * @default push
                        */
    transition: 'push',

    /**
                         * Force the page to scroll to top or bottom on open.
                         * @option
                         * @type {?string}
                         * @default null
                         */
    forceTo: null,

    /**
                    * Allow the offcanvas to remain open for certain breakpoints.
                    * @option
                    * @type {boolean}
                    * @default false
                    */
    isRevealed: false,

    /**
                        * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
                        * @option
                        * @type {?string}
                        * @default null
                        */
    revealOn: null,

    /**
                     * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
                     * @option
                     * @type {boolean}
                     * @default true
                     */
    autoFocus: true,

    /**
                      * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
                      * @option
                      * @type {string}
                      * @default reveal-for-
                      * @todo improve the regex testing for this.
                      */
    revealClass: 'reveal-for-',

    /**
                                 * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
                                 * @option
                                 * @type {boolean}
                                 * @default false
                                 */
    trapFocus: false


    // Window exports
  };Foundation.plugin(OffCanvas, 'OffCanvas');

}(jQuery);

},{}],5:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * ResponsiveMenu module.
                * @module foundation.responsiveMenu
                * @requires foundation.util.triggers
                * @requires foundation.util.mediaQuery
                */var

  ResponsiveMenu = function () {
    /**
                                 * Creates a new instance of a responsive menu.
                                 * @class
                                 * @fires ResponsiveMenu#init
                                 * @param {jQuery} element - jQuery object to make into a dropdown menu.
                                 * @param {Object} options - Overrides to the default plugin settings.
                                 */
    function ResponsiveMenu(element, options) {_classCallCheck(this, ResponsiveMenu);
      this.$element = $(element);
      this.rules = this.$element.data('responsive-menu');
      this.currentMq = null;
      this.currentPlugin = null;

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveMenu');
    }

    /**
       * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
       * @function
       * @private
       */_createClass(ResponsiveMenu, [{ key: '_init', value: function _init()
      {
        // The first time an Interchange plugin is initialized, this.rules is converted from a string of "classes" to an object of rules
        if (typeof this.rules === 'string') {
          var rulesTree = {};

          // Parse rules from "classes" pulled from data attribute
          var rules = this.rules.split(' ');

          // Iterate through every rule found
          for (var i = 0; i < rules.length; i++) {
            var rule = rules[i].split('-');
            var ruleSize = rule.length > 1 ? rule[0] : 'small';
            var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

            if (MenuPlugins[rulePlugin] !== null) {
              rulesTree[ruleSize] = MenuPlugins[rulePlugin];
            }
          }

          this.rules = rulesTree;
        }

        if (!$.isEmptyObject(this.rules)) {
          this._checkMediaQueries();
        }
        // Add data-mutate since children may need it.
        this.$element.attr('data-mutate', this.$element.attr('data-mutate') || Foundation.GetYoDigits(6, 'responsive-menu'));
      }

      /**
         * Initializes events for the Menu.
         * @function
         * @private
         */ }, { key: '_events', value: function _events()
      {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          _this._checkMediaQueries();
        });
        // $(window).on('resize.zf.ResponsiveMenu', function() {
        //   _this._checkMediaQueries();
        // });
      }

      /**
         * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
         * @function
         * @private
         */ }, { key: '_checkMediaQueries', value: function _checkMediaQueries()
      {
        var matchedMq,_this = this;
        // Iterate through each rule and find the last matching rule
        $.each(this.rules, function (key) {
          if (Foundation.MediaQuery.atLeast(key)) {
            matchedMq = key;
          }
        });

        // No match? No dice
        if (!matchedMq) return;

        // Plugin already initialized? We good
        if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

        // Remove existing plugin-specific CSS classes
        $.each(MenuPlugins, function (key, value) {
          _this.$element.removeClass(value.cssClass);
        });

        // Add the CSS class for the new plugin
        this.$element.addClass(this.rules[matchedMq].cssClass);

        // Create an instance of the new plugin
        if (this.currentPlugin) this.currentPlugin.destroy();
        this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {});
      }

      /**
         * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        this.currentPlugin.destroy();
        $(window).off('.zf.ResponsiveMenu');
        Foundation.unregisterPlugin(this);
      } }]);return ResponsiveMenu;}();


  ResponsiveMenu.defaults = {};

  // The plugin matches the plugin classes with these plugin instances.
  var MenuPlugins = {
    dropdown: {
      cssClass: 'dropdown',
      plugin: Foundation._plugins['dropdown-menu'] || null },

    drilldown: {
      cssClass: 'drilldown',
      plugin: Foundation._plugins['drilldown'] || null },

    accordion: {
      cssClass: 'accordion-menu',
      plugin: Foundation._plugins['accordion-menu'] || null } };



  // Window exports
  Foundation.plugin(ResponsiveMenu, 'ResponsiveMenu');

}(jQuery);

},{}],6:[function(require,module,exports){
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets


    /**
                            * Compares the dimensions of an element to a container and determines collision events with container.
                            * @function
                            * @param {jQuery} element - jQuery object to test for collisions.
                            * @param {jQuery} parent - jQuery object to use as bounding container.
                            * @param {Boolean} lrOnly - set to true to check left and right values only.
                            * @param {Boolean} tbOnly - set to true to check top and bottom values only.
                            * @default if no parent object passed, detects collisions with `window`.
                            * @returns {Boolean} - true if collision free, false if a collision in any direction.
                            */ };
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
    top,bottom,left,right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else
    {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
      * Uses native methods to return an object of dimension values.
      * @function
      * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
      * @returns {Object} - nested object of integer pixel values
      * TODO - if element is window, return only those values.
      */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
    parRect = elem.parentNode.getBoundingClientRect(),
    winRect = document.body.getBoundingClientRect(),
    winY = window.pageYOffset,
    winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX },

      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX } },


      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX } } };



  }

  /**
     * Returns an object of top and left integer pixel values for dynamically rendered elements,
     * such as: Tooltip, Reveal, and Dropdown
     * @function
     * @param {jQuery} element - jQuery object for the element being positioned.
     * @param {jQuery} anchor - jQuery object for the element's anchor point.
     * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
     * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
     * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
     * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
     * TODO alter/rewrite to work with `em` values as well/instead of pixels
     */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
    $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset) };

        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top };

        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top };

        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset) };

        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };

        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2 };

        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2 };

        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2 };

        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset };

      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top };

        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };

        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };

        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };}


  }

}(jQuery);

},{}],7:[function(require,module,exports){
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN' };


  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
                                  * Parses the (keyboard) event and returns a String that represents its key
                                  * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
                                  * @param {Event} event - the event generated by the event handler
                                  * @return String key - String that represents the key pressed
                                  */
    parseKey: function parseKey(event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;

      // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
      key = key.replace(/_$/, '');

      return key;
    },

    /**
        * Handles the given (keyboard) event
        * @param {Event} event - the event generated by the event handler
        * @param {String} component - Foundation component's name, e.g. Slider or Reveal
        * @param {Objects} functions - collection of functions that are to be executed
        */
    handleKey: function handleKey(event, component, functions) {
      var commandList = commands[component],
      keyCode = this.parseKey(event),
      cmds,
      command,
      fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {// this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {// merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else

        cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {// execute function  if exists
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {// execute function when event was handled
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {// execute function when event was not handled
          functions.unhandled();
        }
      }
    },

    /**
        * Finds all focusable elements within the given `$element`
        * @param {jQuery} $element - jQuery object to search within
        * @return {jQuery} $focusable - all focusable elements within `$element`
        */
    findFocusable: function findFocusable($element) {
      if (!$element) {return false;}
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {return false;} //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },

    /**
        * Returns the component name name
        * @param {Object} component - Foundation component, e.g. Slider or Reveal
        * @return String componentName
        */

    register: function register(componentName, cmds) {
      commands[componentName] = cmds;
    },

    /**
        * Traps the focus in the given element.
        * @param  {jQuery} $element  jQuery object to trap the foucs into.
        */
    trapFocus: function trapFocus($element) {
      var $focusable = Foundation.Keyboard.findFocusable($element),
      $firstFocusable = $focusable.eq(0),
      $lastFocusable = $focusable.eq(-1);

      $element.on('keydown.zf.trapfocus', function (event) {
        if (event.target === $lastFocusable[0] && Foundation.Keyboard.parseKey(event) === 'TAB') {
          event.preventDefault();
          $firstFocusable.focus();
        } else
        if (event.target === $firstFocusable[0] && Foundation.Keyboard.parseKey(event) === 'SHIFT_TAB') {
          event.preventDefault();
          $lastFocusable.focus();
        }
      });
    },
    /**
        * Releases the trapped focus from the given element.
        * @param  {jQuery} $element  jQuery object to release the focus for.
        */
    releaseFocus: function releaseFocus($element) {
      $element.off('keydown.zf.trapfocus');
    } };


  /*
          * Constants for easier comparing.
          * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
          */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {k[kcs[kc]] = kcs[kc];}
    return k;
  }

  Foundation.Keyboard = Keyboard;

}(jQuery);

},{}],8:[function(require,module,exports){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' +
    'only screen and (min--moz-device-pixel-ratio: 2),' +
    'only screen and (-o-min-device-pixel-ratio: 2/1),' +
    'only screen and (min-device-pixel-ratio: 2),' +
    'only screen and (min-resolution: 192dpi),' +
    'only screen and (min-resolution: 2dppx)' };


  var MediaQuery = {
    queries: [],

    current: '',

    /**
                  * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
                  * @function
                  * @private
                  */
    _init: function _init() {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')' });

        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },

    /**
        * Checks if the screen is at least as wide as a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to check.
        * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
        */
    atLeast: function atLeast(size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },

    /**
        * Checks if the screen matches to a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
        * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
        */
    is: function is(size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },

    /**
        * Gets the media query of a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to get.
        * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
        */
    get: function get(size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },

    /**
        * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
        * @function
        * @private
        * @returns {String} Name of the current breakpoint.
        */
    _getCurrentSize: function _getCurrentSize() {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },

    /**
        * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
        * @function
        * @private
        */
    _watcher: function _watcher() {var _this = this;
      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    } };


  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
      script = document.getElementsByTagName('script')[0],
      info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function matchMedium(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        } };

    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all' };

    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;

}(jQuery);

},{}],9:[function(require,module,exports){
'use strict';

!function ($) {

  /**
                * Motion module.
                * @module foundation.motion
                */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function animateIn(element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function animateOut(element, animation, cb) {
      animate(false, element, animation, cb);
    } };


  function Move(duration, elem, fn) {
    var anim,prog,start = null;
    // console.log('called');

    if (duration === 0) {
      fn.apply(elem);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      return;
    }

    function move(ts) {
      if (!start) start = ts;
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {anim = window.requestAnimationFrame(move, elem);} else
      {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
     * Animates an element in or out using a CSS transition class.
     * @function
     * @private
     * @param {Boolean} isIn - Defines if the animation is in or out.
     * @param {Object} element - jQuery or HTML object to animate.
     * @param {String} animation - CSS class to use.
     * @param {Function} cb - Callback to run when animation is finished.
     */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.
    addClass(animation).
    css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.
      css('transition', '').
      addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;

}(jQuery);

},{}],10:[function(require,module,exports){
'use strict';

!function ($) {

  var Nest = {
    Feather: function Feather(menu) {var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';
      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
      subMenuClass = 'is-' + type + '-submenu',
      subItemClass = subMenuClass + '-item',
      hasSubClass = 'is-' + type + '-submenu-parent';

      items.each(function () {
        var $item = $(this),
        $sub = $item.children('ul');

        if ($sub.length) {
          $item.
          addClass(hasSubClass).
          attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text() });

          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false });
          }

          $sub.
          addClass('submenu ' + subMenuClass).
          attr({
            'data-submenu': '',
            'role': 'menu' });

          if (type === 'drilldown') {
            $sub.attr({ 'aria-hidden': true });
          }
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },

    Burn: function Burn(menu, type) {
      var //items = menu.find('li'),
      subMenuClass = 'is-' + type + '-submenu',
      subItemClass = subMenuClass + '-item',
      hasSubClass = 'is-' + type + '-submenu-parent';

      menu.
      find('>li, .menu, .menu > li').
      removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').
      removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    } };


  Foundation.Nest = Nest;

}(jQuery);

},{}],11:[function(require,module,exports){
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
    duration = options.duration, //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
    remain = -1,
    start,
    timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {cb();}
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
     * Runs a callback function when images are fully loaded.
     * @param {Object} images - Image(s) to check if loaded.
     * @param {Func} callback - Function to execute when image is fully loaded.
     */
  function onImagesLoaded(images, callback) {
    var self = this,
    unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      // Check if image is loaded
      if (this.complete || this.readyState === 4 || this.readyState === 'complete') {
        singleImageLoaded();
      }
      // Force load the image
      else {
          // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
          var src = $(this).attr('src');
          $(this).attr('src', src + (src.indexOf('?') >= 0 ? '&' : '?') + new Date().getTime());
          $(this).one('load', function () {
            singleImageLoaded();
          });
        }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;

}(jQuery);

},{}],12:[function(require,module,exports){
'use strict'; //**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200 };


	var startPosX,
	startPosY,
	startTime,
	elapsedTime,
	isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {e.preventDefault();}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function setup() {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
             * Method for adding psuedo drag events to elements *
             ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function handleTouch(event) {
			var touches = event.changedTouches,
			first = touches[0],
			eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup' },

			type = eventTypes[event.type],
			simulatedEvent;


			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = new window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY });

			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);


//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/

},{}],13:[function(require,module,exports){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function triggers(el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else
    {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    var id = $(this).data('toggle');
    if (id) {
      triggers($(this), 'toggle');
    } else {
      $(this).trigger('toggle.zf.trigger');
    }
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
      * Fires once after all other scripts have loaded
      * @function
      * @private
      */
  $(window).on('load', function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    mutateListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
    plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if ((typeof pluginName === 'undefined' ? 'undefined' : _typeof(pluginName)) === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
    $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').
      on('resize.zf.trigger', function (e) {
        if (timer) {clearTimeout(timer);}

        timer = setTimeout(function () {

          if (!MutationObserver) {//fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
    $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').
      on('scroll.zf.trigger', function (e) {
        if (timer) {clearTimeout(timer);}

        timer = setTimeout(function () {

          if (!MutationObserver) {//fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function mutateListener(debounce) {
    var $nodes = $('[data-mutate]');
    if ($nodes.length && MutationObserver) {
      //trigger all listening elements and signal a mutate event
      //no IE 9 or 10
      $nodes.each(function () {
        $(this).triggerHandler('mutateme.zf.trigger');
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {return false;}
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function listeningElementsMutation(mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

      //trigger the event handler for the element depending on type
      switch (mutationRecordsList[0].type) {

        case "attributes":
          if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          }
          if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('resizeme.zf.trigger', [$target]);
          }
          if (mutationRecordsList[0].attributeName === "style") {
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          }
          break;

        case "childList":
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;

}(jQuery);

// function domMutationObserver(debounce) {
//   // !!! This is coming soon and needs more work; not active  !!! //
//   var timer,
//   nodes = document.querySelectorAll('[data-mutate]');
//   //
//   if (nodes.length) {
//     // var MutationObserver = (function () {
//     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
//     //   for (var i=0; i < prefixes.length; i++) {
//     //     if (prefixes[i] + 'MutationObserver' in window) {
//     //       return window[prefixes[i] + 'MutationObserver'];
//     //     }
//     //   }
//     //   return false;
//     // }());
//
//
//     //for the body, we need to listen for all changes effecting the style and class attributes
//     var bodyObserver = new MutationObserver(bodyMutation);
//     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
//
//
//     //body callback
//     function bodyMutation(mutate) {
//       //trigger all listening elements and signal a mutation event
//       if (timer) { clearTimeout(timer); }
//
//       timer = setTimeout(function() {
//         bodyObserver.disconnect();
//         $('[data-mutate]').attr('data-events',"mutate");
//       }, debounce || 150);
//     }
//   }
// }

},{}],14:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';

// Foundation Core
require('foundation-sites/js/foundation.core.js');

require('foundation-sites/js/foundation.util.box.js');
require('foundation-sites/js/foundation.util.keyboard.js');
require('foundation-sites/js/foundation.util.mediaQuery.js');
require('foundation-sites/js/foundation.util.motion.js');
require('foundation-sites/js/foundation.util.nest.js');
require('foundation-sites/js/foundation.util.timerAndImageLoader.js');
require('foundation-sites/js/foundation.util.touch.js');
require('foundation-sites/js/foundation.util.triggers.js');

require('foundation-sites/js/foundation.drilldown.js');
require('foundation-sites/js/foundation.dropdownMenu.js');
require('foundation-sites/js/foundation.responsiveMenu.js');
require('foundation-sites/js/foundation.offcanvas.js');

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);
var _prepinputs = require('modules/prepinputs.js');var _prepinputs2 = _interopRequireDefault(_prepinputs);
var _socialShare = require('modules/socialShare.js');var _socialShare2 = _interopRequireDefault(_socialShare);
var _carousel = require('modules/carousel.js');var _carousel2 = _interopRequireDefault(_carousel);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // Foundation Plugins. Add or remove as needed for your site
// Foundation Utilities
(function ($) {
  // Initialize Foundation
  $(document).foundation();

  // Prepare form inputs
  (0, _prepinputs2.default)();
  // Initialize social share functionality
  // Replace the empty string parameter with your Facebook ID
  (0, _socialShare2.default)('');

  // Initialize carousels
  (0, _carousel2.default)();

  // Initialize Plugins
  $('.magnific-trigger').magnificPopup({
    type: 'inline' });


  $('.meerkat-cta').meerkat({
    background: 'rgb(21, 76, 102) repeat-x left top',
    height: '120px',
    width: '100%',
    position: 'bottom',
    close: '.close-meerkat',
    dontShowAgain: '.dont-show',
    animationIn: 'fade',
    animationSpeed: 500,
    opacity: 0.9 });

})(_jquery2.default);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"foundation-sites/js/foundation.core.js":1,"foundation-sites/js/foundation.drilldown.js":2,"foundation-sites/js/foundation.dropdownMenu.js":3,"foundation-sites/js/foundation.offcanvas.js":4,"foundation-sites/js/foundation.responsiveMenu.js":5,"foundation-sites/js/foundation.util.box.js":6,"foundation-sites/js/foundation.util.keyboard.js":7,"foundation-sites/js/foundation.util.mediaQuery.js":8,"foundation-sites/js/foundation.util.motion.js":9,"foundation-sites/js/foundation.util.nest.js":10,"foundation-sites/js/foundation.util.timerAndImageLoader.js":11,"foundation-sites/js/foundation.util.touch.js":12,"foundation-sites/js/foundation.util.triggers.js":13,"modules/carousel.js":15,"modules/prepinputs.js":16,"modules/socialShare.js":17}],15:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);
require('vendor/jquery.slick.js');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var carousel = function carousel() {
  (0, _jquery2.default)('.js-carousel').slick({
    adaptiveHeight: true,
    dots: false,
    centerMode: true,
    slidesToShow: 1,
    arrows: true,
    centerPadding: '0px',
    infinite: false,
    prevArrow: '<button type="button" class="tiny">' +
    '<i class="fa fa-chevron-left"></i></button>',
    nextArrow: '<button type="button" class="tiny">' +
    '<i class="fa fa-chevron-right"></i></button>' });

};exports.default =

carousel;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"vendor/jquery.slick.js":18}],16:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var prepinputs = function prepinputs() {
  (0, _jquery2.default)('input, textarea').placeholder().
  filter('[type="text"], [type="email"], [type="tel"], [type="password"]').
  addClass('text').end().
  filter('[type="checkbox"]').addClass('checkbox').end().
  filter('[type="radio"]').addClass('radiobutton').end().
  filter('[type="submit"]').addClass('submit').end().
  filter('[type="image"]').addClass('buttonImage');
};exports.default =

prepinputs;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],17:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var socialShare = function socialShare(fbId) {
  var $body = (0, _jquery2.default)('body');

  // Facebook sharing with the SDK
  _jquery2.default.getScript('//connect.facebook.net/en_US/sdk.js').done(function () {
    $body.on('click.sharer-fb', '.sharer-fb', function (e) {
      var $link = (0, _jquery2.default)(e.currentTarget);
      var options = {
        method: 'feed',
        display: 'popup' };

      var newUrl = $link.data('redirect-to') ?
      $link.data('redirect-to') : null;

      e.preventDefault();

      window.FB.init({
        appId: fbId,
        xfbml: false,
        version: 'v2.0',
        status: false,
        cookie: true });


      if ($link.data('title')) {
        options.name = $link.data('title');
      }

      if ($link.data('url')) {
        options.link = $link.data('url');
      }

      if ($link.data('picture')) {
        options.picture = $link.data('picture');
      }

      if ($link.data('description')) {
        options.description = $link.data('description');
      }

      window.FB.ui(options, function (response) {
        if (newUrl) {
          window.location.href = newUrl;
        }
      });
    });
  });

  // Twitter sharing
  $body.on('click.sharer-tw', '.sharer-tw', function (e) {
    var $link = (0, _jquery2.default)(e.currentTarget);
    var url = $link.data('url');
    var text = $link.data('description');
    var via = $link.data('source');
    var twitterURL = 'https://twitter.com/share?url=' + encodeURIComponent(url);

    e.preventDefault();

    if (text) {
      twitterURL += '&text=' + encodeURIComponent(text);
    }
    if (via) {
      twitterURL += '&via=' + encodeURIComponent(via);
    }
    window.open(twitterURL, 'tweet',
    'width=500,height=384,menubar=no,status=no,toolbar=no');
  });

  // LinkedIn sharing
  $body.on('click.sharer-li', '.sharer-li', function (e) {
    var $link = (0, _jquery2.default)(e.target);
    var url = $link.data('url');
    var title = $link.data('title');
    var summary = $link.data('description');
    var source = $link.data('source');
    var linkedinURL = 'https://www.linkedin.com/shareArticle?mini=true&url=' +
    encodeURIComponent(url);

    e.preventDefault();

    if (title) {
      linkedinURL += '&title=' + encodeURIComponent(title);
    } else {
      linkedinURL += '&title=';
    }

    if (summary) {
      linkedinURL += '&summary=' +
      encodeURIComponent(summary.substring(0, 256));
    }

    if (source) {
      linkedinURL += '&source=' + encodeURIComponent(source);
    }

    window.open(linkedinURL, 'linkedin',
    'width=520,height=570,menubar=no,status=no,toolbar=no');
  });
};exports.default =

socialShare;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],18:[function(require,module,exports){
(function (global){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;}; /*
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
(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory((typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null));
  } else {
    factory(jQuery);
  }
})(function ($) {
  'use strict';
  var Slick = window.Slick || {};

  Slick = function () {
    var instanceUid = 0;

    function Slick(element, settings) {
      var _ = this,
      dataSettings = void 0,responsiveSettings = void 0,breakpoint = void 0;

      _.defaults = {
        accessibility: true,
        adaptiveHeight: false,
        appendArrows: $(element),
        appendDots: $(element),
        arrows: true,
        asNavFor: null,
        prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="previous">Previous</button>',
        nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="next">Next</button>',
        autoplay: false,
        autoplaySpeed: 3000,
        centerMode: false,
        centerPadding: '50px',
        cssEase: 'ease',
        customPaging: function customPaging(slider, i) {
          return '<button type="button" data-role="none">' + (i + 1) + '</button>';
        },
        dots: false,
        dotsClass: 'slick-dots',
        draggable: true,
        easing: 'linear',
        edgeFriction: 0.35,
        fade: false,
        focusOnSelect: false,
        infinite: true,
        initialSlide: 0,
        lazyLoad: 'ondemand',
        mobileFirst: false,
        pauseOnHover: true,
        pauseOnDotsHover: false,
        respondTo: 'window',
        responsive: null,
        rows: 1,
        rtl: false,
        slide: '',
        slidesPerRow: 1,
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 500,
        swipe: true,
        swipeToSlide: false,
        touchMove: true,
        touchThreshold: 5,
        useCSS: true,
        variableWidth: false,
        vertical: false,
        verticalSwiping: false,
        waitForAnimate: true };


      _.initials = {
        animating: false,
        dragging: false,
        autoPlayTimer: null,
        currentDirection: 0,
        currentLeft: null,
        currentSlide: 0,
        direction: 1,
        $dots: null,
        listWidth: null,
        listHeight: null,
        loadIndex: 0,
        $nextArrow: null,
        $prevArrow: null,
        slideCount: null,
        slideWidth: null,
        $slideTrack: null,
        $slides: null,
        sliding: false,
        slideOffset: 0,
        swipeLeft: null,
        $list: null,
        touchObject: {},
        transformsEnabled: false };


      $.extend(_, _.initials);

      _.activeBreakpoint = null;
      _.animType = null;
      _.animProp = null;
      _.breakpoints = [];
      _.breakpointSettings = [];
      _.cssTransitions = false;
      _.hidden = 'hidden';
      _.paused = false;
      _.positionProp = null;
      _.respondTo = null;
      _.rowCount = 1;
      _.shouldClick = true;
      _.$slider = $(element);
      _.$slidesCache = null;
      _.transformType = null;
      _.transitionType = null;
      _.visibilityChange = 'visibilitychange';
      _.windowWidth = 0;
      _.windowTimer = null;

      dataSettings = $(element).data('slick') || {};

      _.options = $.extend({}, _.defaults, dataSettings, settings);

      _.currentSlide = _.options.initialSlide;

      _.originalSettings = _.options;
      responsiveSettings = _.options.responsive || null;

      if (responsiveSettings && responsiveSettings.length > -1) {
        _.respondTo = _.options.respondTo || 'window';
        for (breakpoint in responsiveSettings) {
          if (responsiveSettings.hasOwnProperty(breakpoint)) {
            _.breakpoints.push(responsiveSettings[
            breakpoint].breakpoint);
            _.breakpointSettings[responsiveSettings[
            breakpoint].breakpoint] =
            responsiveSettings[breakpoint].settings;
          }
        }
        _.breakpoints.sort(function (a, b) {
          if (_.options.mobileFirst === true) {
            return a - b;
          } else {
            return b - a;
          }
        });
      }

      if (typeof document.mozHidden !== 'undefined') {
        _.hidden = 'mozHidden';
        _.visibilityChange = 'mozvisibilitychange';
      } else if (typeof document.msHidden !== 'undefined') {
        _.hidden = 'msHidden';
        _.visibilityChange = 'msvisibilitychange';
      } else if (typeof document.webkitHidden !== 'undefined') {
        _.hidden = 'webkitHidden';
        _.visibilityChange = 'webkitvisibilitychange';
      }

      _.autoPlay = $.proxy(_.autoPlay, _);
      _.autoPlayClear = $.proxy(_.autoPlayClear, _);
      _.changeSlide = $.proxy(_.changeSlide, _);
      _.clickHandler = $.proxy(_.clickHandler, _);
      _.selectHandler = $.proxy(_.selectHandler, _);
      _.setPosition = $.proxy(_.setPosition, _);
      _.swipeHandler = $.proxy(_.swipeHandler, _);
      _.dragHandler = $.proxy(_.dragHandler, _);
      _.keyHandler = $.proxy(_.keyHandler, _);
      _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);

      _.instanceUid = instanceUid++;

      // A simple way to check for HTML strings
      // Strict HTML recognition (must start with <)
      // Extracted from jQuery v1.11 source
      _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

      _.init();

      _.checkResponsive(true);
    }

    return Slick;
  }();

  Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {
    var _ = this;

    if (typeof index === 'boolean') {
      addBefore = index;
      index = null;
    } else if (index < 0 || index >= _.slideCount) {
      return false;
    }

    _.unload();

    if (typeof index === 'number') {
      if (index === 0 && _.$slides.length === 0) {
        $(markup).appendTo(_.$slideTrack);
      } else if (addBefore) {
        $(markup).insertBefore(_.$slides.eq(index));
      } else {
        $(markup).insertAfter(_.$slides.eq(index));
      }
    } else {
      if (addBefore === true) {
        $(markup).prependTo(_.$slideTrack);
      } else {
        $(markup).appendTo(_.$slideTrack);
      }
    }

    _.$slides = _.$slideTrack.children(this.options.slide);

    _.$slideTrack.children(this.options.slide).detach();

    _.$slideTrack.append(_.$slides);

    _.$slides.each(function (index, element) {
      $(element).attr('data-slick-index', index);
    });

    _.$slidesCache = _.$slides;

    _.reinit();
  };

  Slick.prototype.animateHeight = function () {
    var _ = this;
    if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
      var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
      _.$list.animate({
        height: targetHeight },
      _.options.speed);
    }
  };

  Slick.prototype.animateSlide = function (targetLeft, callback) {
    var animProps = {},
    _ = this;

    _.animateHeight();

    if (_.options.rtl === true && _.options.vertical === false) {
      targetLeft = -targetLeft;
    }
    if (_.transformsEnabled === false) {
      if (_.options.vertical === false) {
        _.$slideTrack.animate({
          left: targetLeft },
        _.options.speed, _.options.easing, callback);
      } else {
        _.$slideTrack.animate({
          top: targetLeft },
        _.options.speed, _.options.easing, callback);
      }
    } else {
      if (_.cssTransitions === false) {
        if (_.options.rtl === true) {
          _.currentLeft = -_.currentLeft;
        }
        $({
          animStart: _.currentLeft }).
        animate({
          animStart: targetLeft },
        {
          duration: _.options.speed,
          easing: _.options.easing,
          step: function step(now) {
            now = Math.ceil(now);
            if (_.options.vertical === false) {
              animProps[_.animType] = 'translate(' +
              now + 'px, 0px)';
              _.$slideTrack.css(animProps);
            } else {
              animProps[_.animType] = 'translate(0px,' +
              now + 'px)';
              _.$slideTrack.css(animProps);
            }
          },
          complete: function complete() {
            if (callback) {
              callback.call();
            }
          } });

      } else {
        _.applyTransition();
        targetLeft = Math.ceil(targetLeft);

        if (_.options.vertical === false) {
          animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
        } else {
          animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
        }
        _.$slideTrack.css(animProps);

        if (callback) {
          setTimeout(function () {
            _.disableTransition();

            callback.call();
          }, _.options.speed);
        }
      }
    }
  };

  Slick.prototype.asNavFor = function (index) {
    var _ = this,
    asNavFor = _.options.asNavFor !== null ? $(_.options.asNavFor).slick('getSlick') : null;
    if (asNavFor !== null) asNavFor.slideHandler(index, true);
  };

  Slick.prototype.applyTransition = function (slide) {
    var _ = this,
    transition = {};

    if (_.options.fade === false) {
      transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
    } else {
      transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
    }

    if (_.options.fade === false) {
      _.$slideTrack.css(transition);
    } else {
      _.$slides.eq(slide).css(transition);
    }
  };

  Slick.prototype.autoPlay = function () {
    var _ = this;

    if (_.autoPlayTimer) {
      clearInterval(_.autoPlayTimer);
    }

    if (_.slideCount > _.options.slidesToShow && _.paused !== true) {
      _.autoPlayTimer = setInterval(_.autoPlayIterator,
      _.options.autoplaySpeed);
    }
  };

  Slick.prototype.autoPlayClear = function () {
    var _ = this;
    if (_.autoPlayTimer) {
      clearInterval(_.autoPlayTimer);
    }
  };

  Slick.prototype.autoPlayIterator = function () {
    var _ = this;

    if (_.options.infinite === false) {
      if (_.direction === 1) {
        if (_.currentSlide + 1 === _.slideCount -
        1) {
          _.direction = 0;
        }

        _.slideHandler(_.currentSlide + _.options.slidesToScroll);
      } else {
        if (_.currentSlide - 1 === 0) {
          _.direction = 1;
        }

        _.slideHandler(_.currentSlide - _.options.slidesToScroll);
      }
    } else {
      _.slideHandler(_.currentSlide + _.options.slidesToScroll);
    }
  };

  Slick.prototype.buildArrows = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow = $(_.options.prevArrow);
      _.$nextArrow = $(_.options.nextArrow);

      if (_.htmlExpr.test(_.options.prevArrow)) {
        _.$prevArrow.appendTo(_.options.appendArrows);
      }

      if (_.htmlExpr.test(_.options.nextArrow)) {
        _.$nextArrow.appendTo(_.options.appendArrows);
      }

      if (_.options.infinite !== true) {
        _.$prevArrow.addClass('slick-disabled');
      }
    }
  };

  Slick.prototype.buildDots = function () {
    var _ = this,
    i = void 0,dotString = void 0;

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      dotString = '<ul class="' + _.options.dotsClass + '">';

      for (i = 0; i <= _.getDotCount(); i += 1) {
        dotString += '<li>' + _.options.customPaging.call(this, _, i) + '</li>';
      }

      dotString += '</ul>';

      _.$dots = $(dotString).appendTo(
      _.options.appendDots);

      _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');
    }
  };

  Slick.prototype.buildOut = function () {
    var _ = this;

    _.$slides = _.$slider.children(
    ':not(.slick-cloned)').addClass(
    'slick-slide');
    _.slideCount = _.$slides.length;

    _.$slides.each(function (index, element) {
      $(element).attr('data-slick-index', index);
    });

    _.$slidesCache = _.$slides;

    _.$slider.addClass('slick-slider');

    _.$slideTrack = _.slideCount === 0 ?
    $('<div class="slick-track"/>').appendTo(_.$slider) :
    _.$slides.wrapAll('<div class="slick-track"/>').parent();

    _.$list = _.$slideTrack.wrap(
    '<div aria-live="polite" class="slick-list"/>').parent();
    _.$slideTrack.css('opacity', 0);

    if (_.options.centerMode === true || _.options.swipeToSlide === true) {
      _.options.slidesToScroll = 1;
    }

    $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

    _.setupInfinite();

    _.buildArrows();

    _.buildDots();

    _.updateDots();

    if (_.options.accessibility === true) {
      _.$list.prop('tabIndex', 0);
    }

    _.setSlideClasses(typeof this.currentSlide === 'number' ? this.currentSlide : 0);

    if (_.options.draggable === true) {
      _.$list.addClass('draggable');
    }
  };

  Slick.prototype.buildRows = function () {
    var _ = this,a = void 0,b = void 0,c = void 0,newSlides = void 0,numOfSlides = void 0,originalSlides = void 0,slidesPerSection = void 0;

    newSlides = document.createDocumentFragment();
    originalSlides = _.$slider.children();

    if (_.options.rows > 1) {
      slidesPerSection = _.options.slidesPerRow * _.options.rows;
      numOfSlides = Math.ceil(
      originalSlides.length / slidesPerSection);


      for (a = 0; a < numOfSlides; a++) {
        var slide = document.createElement('div');
        for (b = 0; b < _.options.rows; b++) {
          var row = document.createElement('div');
          for (c = 0; c < _.options.slidesPerRow; c++) {
            var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);
            if (originalSlides.get(target)) {
              row.appendChild(originalSlides.get(target));
            }
          }
          slide.appendChild(row);
        }
        newSlides.appendChild(slide);
      }
      _.$slider.html(newSlides);
      _.$slider.children().children().children().
      width(100 / _.options.slidesPerRow + '%').
      css({ 'display': 'inline-block' });
    }
  };

  Slick.prototype.checkResponsive = function (initial) {
    var _ = this,
    breakpoint = void 0,targetBreakpoint = void 0,respondToWidth = void 0;
    var sliderWidth = _.$slider.width();
    var windowWidth = window.innerWidth || $(window).width();
    if (_.respondTo === 'window') {
      respondToWidth = windowWidth;
    } else if (_.respondTo === 'slider') {
      respondToWidth = sliderWidth;
    } else if (_.respondTo === 'min') {
      respondToWidth = Math.min(windowWidth, sliderWidth);
    }

    if (_.originalSettings.responsive && _.originalSettings.
    responsive.length > -1 && _.originalSettings.responsive !== null) {
      targetBreakpoint = null;

      for (breakpoint in _.breakpoints) {
        if (_.breakpoints.hasOwnProperty(breakpoint)) {
          if (_.originalSettings.mobileFirst === false) {
            if (respondToWidth < _.breakpoints[breakpoint]) {
              targetBreakpoint = _.breakpoints[breakpoint];
            }
          } else {
            if (respondToWidth > _.breakpoints[breakpoint]) {
              targetBreakpoint = _.breakpoints[breakpoint];
            }
          }
        }
      }

      if (targetBreakpoint !== null) {
        if (_.activeBreakpoint !== null) {
          if (targetBreakpoint !== _.activeBreakpoint) {
            _.activeBreakpoint =
            targetBreakpoint;
            if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
              _.unslick();
            } else {
              _.options = $.extend({}, _.originalSettings,
              _.breakpointSettings[
              targetBreakpoint]);
              if (initial === true)
              _.currentSlide = _.options.initialSlide;
              _.refresh();
            }
          }
        } else {
          _.activeBreakpoint = targetBreakpoint;
          if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
            _.unslick();
          } else {
            _.options = $.extend({}, _.originalSettings,
            _.breakpointSettings[
            targetBreakpoint]);
            if (initial === true)
            _.currentSlide = _.options.initialSlide;
            _.refresh();
          }
        }
      } else {
        if (_.activeBreakpoint !== null) {
          _.activeBreakpoint = null;
          _.options = _.originalSettings;
          if (initial === true)
          _.currentSlide = _.options.initialSlide;
          _.refresh();
        }
      }
    }
  };

  Slick.prototype.changeSlide = function (event, dontAnimate) {
    var _ = this,
    $target = $(event.target),
    indexOffset = void 0,slideOffset = void 0,unevenOffset = void 0;

    // If target is a link, prevent default action.
    $target.is('a') && event.preventDefault();

    unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
    indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

    switch (event.data.message) {

      case 'previous':
        slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
        if (_.slideCount > _.options.slidesToShow) {
          _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
        }
        break;

      case 'next':
        slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
        if (_.slideCount > _.options.slidesToShow) {
          _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
        }
        break;

      case 'index':
        var index = event.data.index === 0 ? 0 :
        event.data.index || $(event.target).parent().index() * _.options.slidesToScroll;

        _.slideHandler(_.checkNavigable(index), false, dontAnimate);
        break;

      default:
        return;}

  };

  Slick.prototype.checkNavigable = function (index) {
    var _ = this,
    navigables = void 0,prevNavigable = void 0;

    navigables = _.getNavigableIndexes();
    prevNavigable = 0;
    if (index > navigables[navigables.length - 1]) {
      index = navigables[navigables.length - 1];
    } else {
      for (var n in navigables) {
        if (index < navigables[n]) {
          index = prevNavigable;
          break;
        }
        prevNavigable = navigables[n];
      }
    }

    return index;
  };

  Slick.prototype.cleanUpEvents = function () {
    var _ = this;

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      $('li', _.$dots).off('click.slick', _.changeSlide);
    }

    if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
      $('li', _.$dots).
      off('mouseenter.slick', _.setPaused.bind(_, true)).
      off('mouseleave.slick', _.setPaused.bind(_, false));
    }

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
      _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
    }

    _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
    _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
    _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
    _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

    _.$list.off('click.slick', _.clickHandler);

    if (_.options.autoplay === true) {
      $(document).off(_.visibilityChange, _.visibility);
    }

    _.$list.off('mouseenter.slick', _.setPaused.bind(_, true));
    _.$list.off('mouseleave.slick', _.setPaused.bind(_, false));

    if (_.options.accessibility === true) {
      _.$list.off('keydown.slick', _.keyHandler);
    }

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().off('click.slick', _.selectHandler);
    }

    $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

    $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

    $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

    $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
    $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);
  };

  Slick.prototype.cleanUpRows = function () {
    var _ = this,originalSlides = void 0;

    if (_.options.rows > 1) {
      originalSlides = _.$slides.children().children();
      originalSlides.removeAttr('style');
      _.$slider.html(originalSlides);
    }
  };

  Slick.prototype.clickHandler = function (event) {
    var _ = this;

    if (_.shouldClick === false) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
    }
  };

  Slick.prototype.destroy = function () {
    var _ = this;

    _.autoPlayClear();

    _.touchObject = {};

    _.cleanUpEvents();

    $('.slick-cloned', _.$slider).remove();

    if (_.$dots) {
      _.$dots.remove();
    }
    if (_.$prevArrow && _typeof(_.options.prevArrow) !== 'object') {
      _.$prevArrow.remove();
    }
    if (_.$nextArrow && _typeof(_.options.nextArrow) !== 'object') {
      _.$nextArrow.remove();
    }

    if (_.$slides) {
      _.$slides.removeClass('slick-slide slick-active slick-center slick-visible').
      attr('aria-hidden', 'true').
      removeAttr('data-slick-index').
      css({
        position: '',
        left: '',
        top: '',
        zIndex: '',
        opacity: '',
        width: '' });


      _.$slider.html(_.$slides);
    }

    _.cleanUpRows();

    _.$slider.removeClass('slick-slider');
    _.$slider.removeClass('slick-initialized');
  };

  Slick.prototype.disableTransition = function (slide) {
    var _ = this,
    transition = {};

    transition[_.transitionType] = '';

    if (_.options.fade === false) {
      _.$slideTrack.css(transition);
    } else {
      _.$slides.eq(slide).css(transition);
    }
  };

  Slick.prototype.fadeSlide = function (slideIndex, callback) {
    var _ = this;

    if (_.cssTransitions === false) {
      _.$slides.eq(slideIndex).css({
        zIndex: 1000 });


      _.$slides.eq(slideIndex).animate({
        opacity: 1 },
      _.options.speed, _.options.easing, callback);
    } else {
      _.applyTransition(slideIndex);

      _.$slides.eq(slideIndex).css({
        opacity: 1,
        zIndex: 1000 });


      if (callback) {
        setTimeout(function () {
          _.disableTransition(slideIndex);

          callback.call();
        }, _.options.speed);
      }
    }
  };

  Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {
    var _ = this;

    if (filter !== null) {
      _.unload();

      _.$slideTrack.children(this.options.slide).detach();

      _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

      _.reinit();
    }
  };

  Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {
    var _ = this;
    return _.currentSlide;
  };

  Slick.prototype.getDotCount = function () {
    var _ = this;

    var breakPoint = 0;
    var counter = 0;
    var pagerQty = 0;

    if (_.options.infinite === true) {
      pagerQty = Math.ceil(_.slideCount / _.options.slidesToScroll);
    } else if (_.options.centerMode === true) {
      pagerQty = _.slideCount;
    } else {
      while (breakPoint < _.slideCount) {
        ++pagerQty;
        breakPoint = counter + _.options.slidesToShow;
        counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
      }
    }

    return pagerQty - 1;
  };

  Slick.prototype.getLeft = function (slideIndex) {
    var _ = this,
    targetLeft = void 0,
    verticalHeight = void 0,
    verticalOffset = 0,
    targetSlide = void 0;

    _.slideOffset = 0;
    verticalHeight = _.$slides.first().outerHeight();

    if (_.options.infinite === true) {
      if (_.slideCount > _.options.slidesToShow) {
        _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
        verticalOffset = verticalHeight * _.options.slidesToShow * -1;
      }
      if (_.slideCount % _.options.slidesToScroll !== 0) {
        if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
          if (slideIndex > _.slideCount) {
            _.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1;
            verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1;
          } else {
            _.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1;
            verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1;
          }
        }
      }
    } else {
      if (slideIndex + _.options.slidesToShow > _.slideCount) {
        _.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
        verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
      }
    }

    if (_.slideCount <= _.options.slidesToShow) {
      _.slideOffset = 0;
      verticalOffset = 0;
    }

    if (_.options.centerMode === true && _.options.infinite === true) {
      _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
    } else if (_.options.centerMode === true) {
      _.slideOffset = 0;
      _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
    }

    if (_.options.vertical === false) {
      targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
    } else {
      targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
    }

    if (_.options.variableWidth === true) {
      if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
        targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
      } else {
        targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
      }

      targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;

      if (_.options.centerMode === true) {
        if (_.options.infinite === false) {
          targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
        } else {
          targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
        }
        targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
        targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
      }
    }

    return targetLeft;
  };

  Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {
    var _ = this;

    return _.options[option];
  };

  Slick.prototype.getNavigableIndexes = function () {
    var _ = this,
    breakPoint = 0,
    counter = 0,
    indexes = [],
    max = void 0;

    if (_.options.infinite === false) {
      max = _.slideCount - _.options.slidesToShow + 1;
      if (_.options.centerMode === true) max = _.slideCount;
    } else {
      breakPoint = _.options.slidesToScroll * -1;
      counter = _.options.slidesToScroll * -1;
      max = _.slideCount * 2;
    }

    while (breakPoint < max) {
      indexes.push(breakPoint);
      breakPoint = counter + _.options.slidesToScroll;
      counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
    }

    return indexes;
  };

  Slick.prototype.getSlick = function () {
    return this;
  };

  Slick.prototype.getSlideCount = function () {
    var _ = this,
    slidesTraversed = void 0,swipedSlide = void 0,centerOffset = void 0;

    centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

    if (_.options.swipeToSlide === true) {
      _.$slideTrack.find('.slick-slide').each(function (index, slide) {
        if (slide.offsetLeft - centerOffset + $(slide).outerWidth() / 2 > _.swipeLeft * -1) {
          swipedSlide = slide;
          return false;
        }
      });

      slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

      return slidesTraversed;
    } else {
      return _.options.slidesToScroll;
    }
  };

  Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {
    var _ = this;

    _.changeSlide({
      data: {
        message: 'index',
        index: parseInt(slide) } },

    dontAnimate);
  };

  Slick.prototype.init = function () {
    var _ = this;

    if (!$(_.$slider).hasClass('slick-initialized')) {
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

    _.$slider.trigger('init', [_]);
  };

  Slick.prototype.initArrowEvents = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.on('click.slick', {
        message: 'previous' },
      _.changeSlide);
      _.$nextArrow.on('click.slick', {
        message: 'next' },
      _.changeSlide);
    }
  };

  Slick.prototype.initDotEvents = function () {
    var _ = this;

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      $('li', _.$dots).on('click.slick', {
        message: 'index' },
      _.changeSlide);
    }

    if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
      $('li', _.$dots).
      on('mouseenter.slick', _.setPaused.bind(_, true)).
      on('mouseleave.slick', _.setPaused.bind(_, false));
    }
  };

  Slick.prototype.initializeEvents = function () {
    var _ = this;

    _.initArrowEvents();

    _.initDotEvents();

    _.$list.on('touchstart.slick mousedown.slick', {
      action: 'start' },
    _.swipeHandler);
    _.$list.on('touchmove.slick mousemove.slick', {
      action: 'move' },
    _.swipeHandler);
    _.$list.on('touchend.slick mouseup.slick', {
      action: 'end' },
    _.swipeHandler);
    _.$list.on('touchcancel.slick mouseleave.slick', {
      action: 'end' },
    _.swipeHandler);

    _.$list.on('click.slick', _.clickHandler);

    if (_.options.autoplay === true) {
      $(document).on(_.visibilityChange, _.visibility.bind(_));
    }

    _.$list.on('mouseenter.slick', _.setPaused.bind(_, true));
    _.$list.on('mouseleave.slick', _.setPaused.bind(_, false));

    if (_.options.accessibility === true) {
      _.$list.on('keydown.slick', _.keyHandler);
    }

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().on('click.slick', _.selectHandler);
    }

    $(window).on('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange.bind(_));

    $(window).on('resize.slick.slick-' + _.instanceUid, _.resize.bind(_));

    $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

    $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
    $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);
  };

  Slick.prototype.initUI = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.show();
      _.$nextArrow.show();
    }

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      _.$dots.show();
    }

    if (_.options.autoplay === true) {
      _.autoPlay();
    }
  };

  Slick.prototype.keyHandler = function (event) {
    var _ = this;

    if (event.keyCode === 37 && _.options.accessibility === true) {
      _.changeSlide({
        data: {
          message: 'previous' } });


    } else if (event.keyCode === 39 && _.options.accessibility === true) {
      _.changeSlide({
        data: {
          message: 'next' } });


    }
  };

  Slick.prototype.lazyLoad = function () {
    var _ = this,
    loadRange = void 0,cloneRange = void 0,rangeStart = void 0,rangeEnd = void 0;

    function loadImages(imagesScope) {
      $('img[data-lazy]', imagesScope).each(function () {
        var image = $(this),
        imageSource = $(this).attr('data-lazy'),
        imageToLoad = document.createElement('img');

        imageToLoad.onload = function () {
          image.animate({
            opacity: 1 },
          200);
        };
        imageToLoad.src = imageSource;

        image.
        css({
          opacity: 0 }).

        attr('src', imageSource).
        removeAttr('data-lazy').
        removeClass('slick-loading');
      });
    }

    if (_.options.centerMode === true) {
      if (_.options.infinite === true) {
        rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
        rangeEnd = rangeStart + _.options.slidesToShow + 2;
      } else {
        rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
        rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
      }
    } else {
      rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
      rangeEnd = rangeStart + _.options.slidesToShow;
      if (_.options.fade === true) {
        if (rangeStart > 0) rangeStart--;
        if (rangeEnd <= _.slideCount) rangeEnd++;
      }
    }

    loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
    loadImages(loadRange);

    if (_.slideCount <= _.options.slidesToShow) {
      cloneRange = _.$slider.find('.slick-slide');
      loadImages(cloneRange);
    } else
    if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
      cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
      loadImages(cloneRange);
    } else if (_.currentSlide === 0) {
      cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
      loadImages(cloneRange);
    }
  };

  Slick.prototype.loadSlider = function () {
    var _ = this;

    _.setPosition();

    _.$slideTrack.css({
      opacity: 1 });


    _.$slider.removeClass('slick-loading');

    _.initUI();

    if (_.options.lazyLoad === 'progressive') {
      _.progressiveLazyLoad();
    }
  };

  Slick.prototype.next = Slick.prototype.slickNext = function () {
    var _ = this;

    _.changeSlide({
      data: {
        message: 'next' } });


  };

  Slick.prototype.orientationChange = function () {
    var _ = this;

    _.checkResponsive();
    _.setPosition();
  };

  Slick.prototype.pause = Slick.prototype.slickPause = function () {
    var _ = this;

    _.autoPlayClear();
    _.paused = true;
  };

  Slick.prototype.play = Slick.prototype.slickPlay = function () {
    var _ = this;

    _.paused = false;
    _.autoPlay();
  };

  Slick.prototype.postSlide = function (index) {
    var _ = this;

    _.$slider.trigger('afterChange', [_, index]);

    _.animating = false;

    _.setPosition();

    _.swipeLeft = null;

    if (_.options.autoplay === true && _.paused === false) {
      _.autoPlay();
    }
  };

  Slick.prototype.prev = Slick.prototype.slickPrev = function () {
    var _ = this;

    _.changeSlide({
      data: {
        message: 'previous' } });


  };

  Slick.prototype.preventDefault = function (e) {
    e.preventDefault();
  };

  Slick.prototype.progressiveLazyLoad = function () {
    var _ = this,
    imgCount = void 0,targetImage = void 0;

    imgCount = $('img[data-lazy]', _.$slider).length;

    if (imgCount > 0) {
      targetImage = $('img[data-lazy]', _.$slider).first();
      targetImage.attr('src', targetImage.attr('data-lazy')).removeClass('slick-loading').load(function () {
        targetImage.removeAttr('data-lazy');
        _.progressiveLazyLoad();

        if (_.options.adaptiveHeight === true) {
          _.setPosition();
        }
      }).
      error(function () {
        targetImage.removeAttr('data-lazy');
        _.progressiveLazyLoad();
      });
    }
  };

  Slick.prototype.refresh = function () {
    var _ = this,
    currentSlide = _.currentSlide;

    _.destroy();

    $.extend(_, _.initials);

    _.init();

    _.changeSlide({
      data: {
        message: 'index',
        index: currentSlide } },

    false);
  };

  Slick.prototype.reinit = function () {
    var _ = this;

    _.$slides = _.$slideTrack.children(_.options.slide).addClass(
    'slick-slide');

    _.slideCount = _.$slides.length;

    if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
      _.currentSlide = _.currentSlide - _.options.slidesToScroll;
    }

    if (_.slideCount <= _.options.slidesToShow) {
      _.currentSlide = 0;
    }

    _.setProps();

    _.setupInfinite();

    _.buildArrows();

    _.updateArrows();

    _.initArrowEvents();

    _.buildDots();

    _.updateDots();

    _.initDotEvents();

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().on('click.slick', _.selectHandler);
    }

    _.setSlideClasses(0);

    _.setPosition();

    _.$slider.trigger('reInit', [_]);
  };

  Slick.prototype.resize = function () {
    var _ = this;

    if ($(window).width() !== _.windowWidth) {
      clearTimeout(_.windowDelay);
      _.windowDelay = window.setTimeout(function () {
        _.windowWidth = $(window).width();
        _.checkResponsive();
        _.setPosition();
      }, 50);
    }
  };

  Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {
    var _ = this;

    if (typeof index === 'boolean') {
      removeBefore = index;
      index = removeBefore === true ? 0 : _.slideCount - 1;
    } else {
      index = removeBefore === true ? --index : index;
    }

    if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
      return false;
    }

    _.unload();

    if (removeAll === true) {
      _.$slideTrack.children().remove();
    } else {
      _.$slideTrack.children(this.options.slide).eq(index).remove();
    }

    _.$slides = _.$slideTrack.children(this.options.slide);

    _.$slideTrack.children(this.options.slide).detach();

    _.$slideTrack.append(_.$slides);

    _.$slidesCache = _.$slides;

    _.reinit();
  };

  Slick.prototype.setCSS = function (position) {
    var _ = this,
    positionProps = {},
    x = void 0,y = void 0;

    if (_.options.rtl === true) {
      position = -position;
    }
    x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
    y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

    positionProps[_.positionProp] = position;

    if (_.transformsEnabled === false) {
      _.$slideTrack.css(positionProps);
    } else {
      positionProps = {};
      if (_.cssTransitions === false) {
        positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
        _.$slideTrack.css(positionProps);
      } else {
        positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
        _.$slideTrack.css(positionProps);
      }
    }
  };

  Slick.prototype.setDimensions = function () {
    var _ = this;

    if (_.options.vertical === false) {
      if (_.options.centerMode === true) {
        _.$list.css({
          padding: '0px ' + _.options.centerPadding });

      }
    } else {
      _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
      if (_.options.centerMode === true) {
        _.$list.css({
          padding: _.options.centerPadding + ' 0px' });

      }
    }

    _.listWidth = _.$list.width();
    _.listHeight = _.$list.height();


    if (_.options.vertical === false && _.options.variableWidth === false) {
      _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
      _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children('.slick-slide').length));
    } else if (_.options.variableWidth === true) {
      _.$slideTrack.width(5000 * _.slideCount);
    } else {
      _.slideWidth = Math.ceil(_.listWidth);
      _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length));
    }

    var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
    if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);
  };

  Slick.prototype.setFade = function () {
    var _ = this,
    targetLeft = void 0;

    _.$slides.each(function (index, element) {
      targetLeft = _.slideWidth * index * -1;
      if (_.options.rtl === true) {
        $(element).css({
          position: 'relative',
          right: targetLeft,
          top: 0,
          zIndex: 800,
          opacity: 0 });

      } else {
        $(element).css({
          position: 'relative',
          left: targetLeft,
          top: 0,
          zIndex: 800,
          opacity: 0 });

      }
    });

    _.$slides.eq(_.currentSlide).css({
      zIndex: 900,
      opacity: 1 });

  };

  Slick.prototype.setHeight = function () {
    var _ = this;

    if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
      var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
      _.$list.css('height', targetHeight);
    }
  };

  Slick.prototype.setOption = Slick.prototype.slickSetOption = function (option, value, refresh) {
    var _ = this;
    _.options[option] = value;

    if (refresh === true) {
      _.unload();
      _.reinit();
    }
  };

  Slick.prototype.setPosition = function () {
    var _ = this;

    _.setDimensions();

    _.setHeight();

    if (_.options.fade === false) {
      _.setCSS(_.getLeft(_.currentSlide));
    } else {
      _.setFade();
    }

    _.$slider.trigger('setPosition', [_]);
  };

  Slick.prototype.setProps = function () {
    var _ = this,
    bodyStyle = document.body.style;

    _.positionProp = _.options.vertical === true ? 'top' : 'left';

    if (_.positionProp === 'top') {
      _.$slider.addClass('slick-vertical');
    } else {
      _.$slider.removeClass('slick-vertical');
    }

    if (bodyStyle.WebkitTransition !== undefined ||
    bodyStyle.MozTransition !== undefined ||
    bodyStyle.msTransition !== undefined) {
      if (_.options.useCSS === true) {
        _.cssTransitions = true;
      }
    }

    if (bodyStyle.OTransform !== undefined) {
      _.animType = 'OTransform';
      _.transformType = '-o-transform';
      _.transitionType = 'OTransition';
      if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
    }
    if (bodyStyle.MozTransform !== undefined) {
      _.animType = 'MozTransform';
      _.transformType = '-moz-transform';
      _.transitionType = 'MozTransition';
      if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
    }
    if (bodyStyle.webkitTransform !== undefined) {
      _.animType = 'webkitTransform';
      _.transformType = '-webkit-transform';
      _.transitionType = 'webkitTransition';
      if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
    }
    if (bodyStyle.msTransform !== undefined) {
      _.animType = 'msTransform';
      _.transformType = '-ms-transform';
      _.transitionType = 'msTransition';
      if (bodyStyle.msTransform === undefined) _.animType = false;
    }
    if (bodyStyle.transform !== undefined && _.animType !== false) {
      _.animType = 'transform';
      _.transformType = 'transform';
      _.transitionType = 'transition';
    }
    _.transformsEnabled = _.animType !== null && _.animType !== false;
  };


  Slick.prototype.setSlideClasses = function (index) {
    var _ = this,
    centerOffset = void 0,allSlides = void 0,indexOffset = void 0,remainder = void 0;

    _.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden', 'true').removeClass('slick-center');
    allSlides = _.$slider.find('.slick-slide');

    if (_.options.centerMode === true) {
      centerOffset = Math.floor(_.options.slidesToShow / 2);

      if (_.options.infinite === true) {
        if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
          _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass('slick-active').attr('aria-hidden', 'false');
        } else {
          indexOffset = _.options.slidesToShow + index;
          allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass('slick-active').attr('aria-hidden', 'false');
        }

        if (index === 0) {
          allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
        } else if (index === _.slideCount - 1) {
          allSlides.eq(_.options.slidesToShow).addClass('slick-center');
        }
      }

      _.$slides.eq(index).addClass('slick-center');
    } else {
      if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {
        _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
      } else if (allSlides.length <= _.options.slidesToShow) {
        allSlides.addClass('slick-active').attr('aria-hidden', 'false');
      } else {
        remainder = _.slideCount % _.options.slidesToShow;
        indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;
        if (_.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow) {
          allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass('slick-active').attr('aria-hidden', 'false');
        } else {
          allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
        }
      }
    }

    if (_.options.lazyLoad === 'ondemand') {
      _.lazyLoad();
    }
  };

  Slick.prototype.setupInfinite = function () {
    var _ = this,
    i = void 0,slideIndex = void 0,infiniteCount = void 0;

    if (_.options.fade === true) {
      _.options.centerMode = false;
    }

    if (_.options.infinite === true && _.options.fade === false) {
      slideIndex = null;

      if (_.slideCount > _.options.slidesToShow) {
        if (_.options.centerMode === true) {
          infiniteCount = _.options.slidesToShow + 1;
        } else {
          infiniteCount = _.options.slidesToShow;
        }

        for (i = _.slideCount; i > _.slideCount -
        infiniteCount; i -= 1) {
          slideIndex = i - 1;
          $(_.$slides[slideIndex]).clone(true).attr('id', '').
          attr('data-slick-index', slideIndex - _.slideCount).
          prependTo(_.$slideTrack).addClass('slick-cloned');
        }
        for (i = 0; i < infiniteCount; i += 1) {
          slideIndex = i;
          $(_.$slides[slideIndex]).clone(true).attr('id', '').
          attr('data-slick-index', slideIndex + _.slideCount).
          appendTo(_.$slideTrack).addClass('slick-cloned');
        }
        _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
          $(this).attr('id', '');
        });
      }
    }
  };

  Slick.prototype.setPaused = function (paused) {
    var _ = this;

    if (_.options.autoplay === true && _.options.pauseOnHover === true) {
      _.paused = paused;
      _.autoPlayClear();
    }
  };

  Slick.prototype.selectHandler = function (event) {
    var _ = this;

    var targetElement = $(event.target).is('.slick-slide') ?
    $(event.target) :
    $(event.target).parents('.slick-slide');

    var index = parseInt(targetElement.attr('data-slick-index'));

    if (!index) index = 0;

    if (_.slideCount <= _.options.slidesToShow) {
      _.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden', 'true');
      _.$slides.eq(index).addClass('slick-active').attr('aria-hidden', 'false');
      if (_.options.centerMode === true) {
        _.$slider.find('.slick-slide').removeClass('slick-center');
        _.$slides.eq(index).addClass('slick-center');
      }
      _.asNavFor(index);
      return;
    }
    _.slideHandler(index);
  };

  Slick.prototype.slideHandler = function (index, sync, dontAnimate) {
    var targetSlide = void 0,animSlide = void 0,oldSlide = void 0,slideLeft = void 0,targetLeft = null,
    _ = this;

    sync = sync || false;

    if (_.animating === true && _.options.waitForAnimate === true) {
      return;
    }

    if (_.options.fade === true && _.currentSlide === index) {
      return;
    }

    if (_.slideCount <= _.options.slidesToShow) {
      return;
    }

    if (sync === false) {
      _.asNavFor(index);
    }

    targetSlide = index;
    targetLeft = _.getLeft(targetSlide);
    slideLeft = _.getLeft(_.currentSlide);

    _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

    if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
      if (_.options.fade === false) {
        targetSlide = _.currentSlide;
        if (dontAnimate !== true) {
          _.animateSlide(slideLeft, function () {
            _.postSlide(targetSlide);
          });
        } else {
          _.postSlide(targetSlide);
        }
      }
      return;
    } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > _.slideCount - _.options.slidesToScroll)) {
      if (_.options.fade === false) {
        targetSlide = _.currentSlide;
        if (dontAnimate !== true) {
          _.animateSlide(slideLeft, function () {
            _.postSlide(targetSlide);
          });
        } else {
          _.postSlide(targetSlide);
        }
      }
      return;
    }

    if (_.options.autoplay === true) {
      clearInterval(_.autoPlayTimer);
    }

    if (targetSlide < 0) {
      if (_.slideCount % _.options.slidesToScroll !== 0) {
        animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
      } else {
        animSlide = _.slideCount + targetSlide;
      }
    } else if (targetSlide >= _.slideCount) {
      if (_.slideCount % _.options.slidesToScroll !== 0) {
        animSlide = 0;
      } else {
        animSlide = targetSlide - _.slideCount;
      }
    } else {
      animSlide = targetSlide;
    }

    _.animating = true;

    _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

    oldSlide = _.currentSlide;
    _.currentSlide = animSlide;

    _.setSlideClasses(_.currentSlide);

    _.updateDots();
    _.updateArrows();

    if (_.options.fade === true) {
      if (dontAnimate !== true) {
        _.fadeSlide(animSlide, function () {
          _.postSlide(animSlide);
        });
      } else {
        _.postSlide(animSlide);
      }
      _.animateHeight();
      return;
    }

    if (dontAnimate !== true) {
      _.animateSlide(targetLeft, function () {
        _.postSlide(animSlide);
      });
    } else {
      _.postSlide(animSlide);
    }
  };

  Slick.prototype.startLoad = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.hide();
      _.$nextArrow.hide();
    }

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      _.$dots.hide();
    }

    _.$slider.addClass('slick-loading');
  };

  Slick.prototype.swipeDirection = function () {
    var xDist = void 0,yDist = void 0,r = void 0,swipeAngle = void 0,_ = this;

    xDist = _.touchObject.startX - _.touchObject.curX;
    yDist = _.touchObject.startY - _.touchObject.curY;
    r = Math.atan2(yDist, xDist);

    swipeAngle = Math.round(r * 180 / Math.PI);
    if (swipeAngle < 0) {
      swipeAngle = 360 - Math.abs(swipeAngle);
    }

    if (swipeAngle <= 45 && swipeAngle >= 0) {
      return _.options.rtl === false ? 'left' : 'right';
    }
    if (swipeAngle <= 360 && swipeAngle >= 315) {
      return _.options.rtl === false ? 'left' : 'right';
    }
    if (swipeAngle >= 135 && swipeAngle <= 225) {
      return _.options.rtl === false ? 'right' : 'left';
    }
    if (_.options.verticalSwiping === true) {
      if (swipeAngle >= 35 && swipeAngle <= 135) {
        return 'left';
      } else {
        return 'right';
      }
    }

    return 'vertical';
  };

  Slick.prototype.swipeEnd = function (event) {
    var _ = this,
    slideCount = void 0;

    _.dragging = false;

    _.shouldClick = _.touchObject.swipeLength > 10 ? false : true;

    if (_.touchObject.curX === undefined) {
      return false;
    }

    if (_.touchObject.edgeHit === true) {
      _.$slider.trigger('edge', [_, _.swipeDirection()]);
    }

    if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {
      switch (_.swipeDirection()) {
        case 'left':
          slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();
          _.slideHandler(slideCount);
          _.currentDirection = 0;
          _.touchObject = {};
          _.$slider.trigger('swipe', [_, 'left']);
          break;

        case 'right':
          slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();
          _.slideHandler(slideCount);
          _.currentDirection = 1;
          _.touchObject = {};
          _.$slider.trigger('swipe', [_, 'right']);
          break;}

    } else {
      if (_.touchObject.startX !== _.touchObject.curX) {
        _.slideHandler(_.currentSlide);
        _.touchObject = {};
      }
    }
  };

  Slick.prototype.swipeHandler = function (event) {
    var _ = this;

    if (_.options.swipe === false || 'ontouchend' in document && _.options.swipe === false) {
      return;
    } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
      return;
    }

    _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
    event.originalEvent.touches.length : 1;

    _.touchObject.minSwipe = _.listWidth / _.options.
    touchThreshold;

    if (_.options.verticalSwiping === true) {
      _.touchObject.minSwipe = _.listHeight / _.options.
      touchThreshold;
    }

    switch (event.data.action) {

      case 'start':
        _.swipeStart(event);
        break;

      case 'move':
        _.swipeMove(event);
        break;

      case 'end':
        _.swipeEnd(event);
        break;}


  };

  Slick.prototype.swipeMove = function (event) {
    var _ = this,
    edgeWasHit = false,
    curLeft = void 0,swipeDirection = void 0,swipeLength = void 0,positionOffset = void 0,touches = void 0;

    touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

    if (!_.dragging || touches && touches.length !== 1) {
      return false;
    }

    curLeft = _.getLeft(_.currentSlide);

    _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
    _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

    _.touchObject.swipeLength = Math.round(Math.sqrt(
    Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

    if (_.options.verticalSwiping === true) {
      _.touchObject.swipeLength = Math.round(Math.sqrt(
      Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
    }

    swipeDirection = _.swipeDirection();

    if (swipeDirection === 'vertical') {
      return;
    }

    if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
      event.preventDefault();
    }

    positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
    if (_.options.verticalSwiping === true) {
      positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
    }


    swipeLength = _.touchObject.swipeLength;

    _.touchObject.edgeHit = false;

    if (_.options.infinite === false) {
      if (_.currentSlide === 0 && swipeDirection === 'right' || _.currentSlide >= _.getDotCount() && swipeDirection === 'left') {
        swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
        _.touchObject.edgeHit = true;
      }
    }

    if (_.options.vertical === false) {
      _.swipeLeft = curLeft + swipeLength * positionOffset;
    } else {
      _.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
    }
    if (_.options.verticalSwiping === true) {
      _.swipeLeft = curLeft + swipeLength * positionOffset;
    }

    if (_.options.fade === true || _.options.touchMove === false) {
      return false;
    }

    if (_.animating === true) {
      _.swipeLeft = null;
      return false;
    }

    _.setCSS(_.swipeLeft);
  };

  Slick.prototype.swipeStart = function (event) {
    var _ = this,
    touches = void 0;

    if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
      _.touchObject = {};
      return false;
    }

    if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
      touches = event.originalEvent.touches[0];
    }

    _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
    _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

    _.dragging = true;
  };

  Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {
    var _ = this;

    if (_.$slidesCache !== null) {
      _.unload();

      _.$slideTrack.children(this.options.slide).detach();

      _.$slidesCache.appendTo(_.$slideTrack);

      _.reinit();
    }
  };

  Slick.prototype.unload = function () {
    var _ = this;

    $('.slick-cloned', _.$slider).remove();
    if (_.$dots) {
      _.$dots.remove();
    }
    if (_.$prevArrow && _typeof(_.options.prevArrow) !== 'object') {
      _.$prevArrow.remove();
    }
    if (_.$nextArrow && _typeof(_.options.nextArrow) !== 'object') {
      _.$nextArrow.remove();
    }
    _.$slides.removeClass('slick-slide slick-active slick-visible').attr('aria-hidden', 'true').css('width', '');
  };

  Slick.prototype.unslick = function () {
    var _ = this;
    _.destroy();
  };

  Slick.prototype.updateArrows = function () {
    var _ = this,
    centerOffset = void 0;

    centerOffset = Math.floor(_.options.slidesToShow / 2);

    if (_.options.arrows === true && _.options.infinite !==
    true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.removeClass('slick-disabled');
      _.$nextArrow.removeClass('slick-disabled');
      if (_.currentSlide === 0) {
        _.$prevArrow.addClass('slick-disabled');
        _.$nextArrow.removeClass('slick-disabled');
      } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {
        _.$nextArrow.addClass('slick-disabled');
        _.$prevArrow.removeClass('slick-disabled');
      } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {
        _.$nextArrow.addClass('slick-disabled');
        _.$prevArrow.removeClass('slick-disabled');
      }
    }
  };

  Slick.prototype.updateDots = function () {
    var _ = this;

    if (_.$dots !== null) {
      _.$dots.find('li').removeClass('slick-active').attr('aria-hidden', 'true');
      _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active').attr('aria-hidden', 'false');
    }
  };

  Slick.prototype.visibility = function () {
    var _ = this;

    if (document[_.hidden]) {
      _.paused = true;
      _.autoPlayClear();
    } else {
      _.paused = false;
      _.autoPlay();
    }
  };

  $.fn.slick = function () {
    var _ = this,
    opt = arguments[0],
    args = Array.prototype.slice.call(arguments, 1),
    l = _.length,
    i = 0,
    ret = void 0;
    for (i; i < l; i++) {
      if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) == 'object' || typeof opt == 'undefined')
      _[i].slick = new Slick(_[i], opt);else

      ret = _[i].slick[opt].apply(_[i].slick, args);
      if (typeof ret != 'undefined') return ret;
    }
    return _;
  };
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[14])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLmNvcmUuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLmRyaWxsZG93bi5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24uZHJvcGRvd25NZW51LmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi5vZmZjYW52YXMuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnJlc3BvbnNpdmVNZW51LmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLmJveC5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC5rZXlib2FyZC5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5LmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLm1vdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC5uZXN0LmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwudG91Y2guanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnMuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2Nhcm91c2VsLmpzIiwic3JjL2pzL21vZHVsZXMvcHJlcGlucHV0cy5qcyIsInNyYy9qcy9tb2R1bGVzL3NvY2lhbFNoYXJlLmpzIiwic3JjL2pzL3ZlbmRvci9qcXVlcnkuc2xpY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7c1JDQUEsQ0FBQyxVQUFTLENBQVQsRUFBWTs7QUFFYjs7QUFFQSxNQUFJLHFCQUFxQixPQUF6Qjs7QUFFQTtBQUNBO0FBQ0EsTUFBSSxhQUFhO0FBQ2YsYUFBUyxrQkFETTs7QUFHZjs7O0FBR0EsY0FBVSxFQU5LOztBQVFmOzs7QUFHQSxZQUFRLEVBWE87O0FBYWY7OztBQUdBLFNBQUssZUFBVTtBQUNiLGFBQU8sRUFBRSxNQUFGLEVBQVUsSUFBVixDQUFlLEtBQWYsTUFBMEIsS0FBakM7QUFDRCxLQWxCYztBQW1CZjs7OztBQUlBLFlBQVEsZ0JBQVMsT0FBVCxFQUFpQixJQUFqQixFQUF1QjtBQUM3QjtBQUNBO0FBQ0EsVUFBSSxZQUFhLFFBQVEsYUFBYSxPQUFiLENBQXpCO0FBQ0E7QUFDQTtBQUNBLFVBQUksV0FBWSxVQUFVLFNBQVYsQ0FBaEI7O0FBRUE7QUFDQSxXQUFLLFFBQUwsQ0FBYyxRQUFkLElBQTBCLEtBQUssU0FBTCxJQUFrQixPQUE1QztBQUNELEtBakNjO0FBa0NmOzs7Ozs7Ozs7QUFTQSxvQkFBZ0Isd0JBQVMsTUFBVCxFQUFpQixJQUFqQixFQUFzQjtBQUNwQyxVQUFJLGFBQWEsT0FBTyxVQUFVLElBQVYsQ0FBUCxHQUF5QixhQUFhLE9BQU8sV0FBcEIsRUFBaUMsV0FBakMsRUFBMUM7QUFDQSxhQUFPLElBQVAsR0FBYyxLQUFLLFdBQUwsQ0FBaUIsQ0FBakIsRUFBb0IsVUFBcEIsQ0FBZDs7QUFFQSxVQUFHLENBQUMsT0FBTyxRQUFQLENBQWdCLElBQWhCLFdBQTZCLFVBQTdCLENBQUosRUFBK0MsQ0FBRSxPQUFPLFFBQVAsQ0FBZ0IsSUFBaEIsV0FBNkIsVUFBN0IsRUFBMkMsT0FBTyxJQUFsRCxFQUEwRDtBQUMzRyxVQUFHLENBQUMs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S0FBaEIsQ0FBc0IsRUFBRSxDQUFGLEVBQUssS0FBM0IsRUFBa0MsSUFBbEMsQ0FBTjtBQUNWLFVBQUksT0FBTyxHQUFQLElBQWMsV0FBbEIsRUFBK0IsT0FBTyxHQUFQO0FBQ2hDO0FBQ0QsV0FBTyxDQUFQO0FBQ0QsR0FmRDtBQWdCRCxDQXBpRUEsQ0FBRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIhZnVuY3Rpb24oJCkge1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIEZPVU5EQVRJT05fVkVSU0lPTiA9ICc2LjMuMSc7XG5cbi8vIEdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxuLy8gVGhpcyBpcyBhdHRhY2hlZCB0byB0aGUgd2luZG93LCBvciB1c2VkIGFzIGEgbW9kdWxlIGZvciBBTUQvQnJvd3NlcmlmeVxudmFyIEZvdW5kYXRpb24gPSB7XG4gIHZlcnNpb246IEZPVU5EQVRJT05fVkVSU0lPTixcblxuICAvKipcbiAgICogU3RvcmVzIGluaXRpYWxpemVkIHBsdWdpbnMuXG4gICAqL1xuICBfcGx1Z2luczoge30sXG5cbiAgLyoqXG4gICAqIFN0b3JlcyBnZW5lcmF0ZWQgdW5pcXVlIGlkcyBmb3IgcGx1Z2luIGluc3RhbmNlc1xuICAgKi9cbiAgX3V1aWRzOiBbXSxcblxuICAvKipcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIFJUTCBzdXBwb3J0XG4gICAqL1xuICBydGw6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PT0gJ3J0bCc7XG4gIH0sXG4gIC8qKlxuICAgKiBEZWZpbmVzIGEgRm91bmRhdGlvbiBwbHVnaW4sIGFkZGluZyBpdCB0byB0aGUgYEZvdW5kYXRpb25gIG5hbWVzcGFjZSBhbmQgdGhlIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplIHdoZW4gcmVmbG93aW5nLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBwbHVnaW4uXG4gICAqL1xuICBwbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSkge1xuICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gYWRkaW5nIHRvIGdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxuICAgIC8vIEV4YW1wbGVzOiBGb3VuZGF0aW9uLlJldmVhbCwgRm91bmRhdGlvbi5PZmZDYW52YXNcbiAgICB2YXIgY2xhc3NOYW1lID0gKG5hbWUgfHwgZnVuY3Rpb25OYW1lKHBsdWdpbikpO1xuICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gc3RvcmluZyB0aGUgcGx1Z2luLCBhbHNvIHVzZWQgdG8gY3JlYXRlIHRoZSBpZGVudGlmeWluZyBkYXRhIGF0dHJpYnV0ZSBmb3IgdGhlIHBsdWdpblxuICAgIC8vIEV4YW1wbGVzOiBkYXRhLXJldmVhbCwgZGF0YS1vZmYtY2FudmFzXG4gICAgdmFyIGF0dHJOYW1lICA9IGh5cGhlbmF0ZShjbGFzc05hbWUpO1xuXG4gICAgLy8gQWRkIHRvIHRoZSBGb3VuZGF0aW9uIG9iamVjdCBhbmQgdGhlIHBsdWdpbnMgbGlzdCAoZm9yIHJlZmxvd2luZylcbiAgICB0aGlzLl9wbHVnaW5zW2F0dHJOYW1lXSA9IHRoaXNbY2xhc3NOYW1lXSA9IHBsdWdpbjtcbiAgfSxcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBQb3B1bGF0ZXMgdGhlIF91dWlkcyBhcnJheSB3aXRoIHBvaW50ZXJzIHRvIGVhY2ggaW5kaXZpZHVhbCBwbHVnaW4gaW5zdGFuY2UuXG4gICAqIEFkZHMgdGhlIGB6ZlBsdWdpbmAgZGF0YS1hdHRyaWJ1dGUgdG8gcHJvZ3JhbW1hdGljYWxseSBjcmVhdGVkIHBsdWdpbnMgdG8gYWxsb3cgdXNlIG9mICQoc2VsZWN0b3IpLmZvdW5kYXRpb24obWV0aG9kKSBjYWxscy5cbiAgICogQWxzbyBmaXJlcyB0aGUgaW5pdGlhbGl6YXRpb24gZXZlbnQgZm9yIGVhY2ggcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIHRoZSBuYW1lIG9mIHRoZSBwbHVnaW4sIHBhc3NlZCBhcyBhIGNhbWVsQ2FzZWQgc3RyaW5nLlxuICAgKiBAZmlyZXMgUGx1Z2luI2luaXRcbiAgICovXG4gIHJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpe1xuICAgIHZhciBwbHVnaW5OYW1lID0gbmFtZSA/IGh5cGhlbmF0ZShuYW1lKSA6IGZ1bmN0aW9uTmFtZShwbHVnaW4uY29uc3RydWN0b3IpLnRvTG93ZXJDYXNlKCk7XG4gICAgcGx1Z2luLnV1aWQgPSB0aGlzLkdldFlvRGlnaXRzKDYsIHBsdWdpbk5hbWUpO1xuXG4gICAgaWYoIXBsdWdpbi4kZWxlbWVudC5hdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gKSl7IHBsdWdpbi4kZWxlbWVudC5hdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gLCBwbHVnaW4udXVpZCk7IH1cbiAgICBpZighcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykpeyBwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nLCBwbHVnaW4pOyB9XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBpbml0aWFsaXplZC5cbiAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2luaXRcbiAgICAgICAgICAgKi9cbiAgICBwbHVnaW4uJGVsZW1lbnQudHJpZ2dlcihgaW5pdC56Zi4ke3BsdWdpbk5hbWV9YCk7XG5cbiAgICB0aGlzLl91dWlkcy5wdXNoKHBsdWdpbi51dWlkKTtcblxuICAgIHJldHVybjtcbiAgfSxcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBSZW1vdmVzIHRoZSBwbHVnaW5zIHV1aWQgZnJvbSB0aGUgX3V1aWRzIGFycmF5LlxuICAgKiBSZW1vdmVzIHRoZSB6ZlBsdWdpbiBkYXRhIGF0dHJpYnV0ZSwgYXMgd2VsbCBhcyB0aGUgZGF0YS1wbHVnaW4tbmFtZSBhdHRyaWJ1dGUuXG4gICAqIEFsc28gZmlyZXMgdGhlIGRlc3Ryb3llZCBldmVudCBmb3IgdGhlIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQGZpcmVzIFBsdWdpbiNkZXN0cm95ZWRcbiAgICovXG4gIHVucmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbil7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSBoeXBoZW5hdGUoZnVuY3Rpb25OYW1lKHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpLmNvbnN0cnVjdG9yKSk7XG5cbiAgICB0aGlzLl91dWlkcy5zcGxpY2UodGhpcy5fdXVpZHMuaW5kZXhPZihwbHVnaW4udXVpZCksIDEpO1xuICAgIHBsdWdpbi4kZWxlbWVudC5yZW1vdmVBdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gKS5yZW1vdmVEYXRhKCd6ZlBsdWdpbicpXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAgICAgICAqL1xuICAgICAgICAgIC50cmlnZ2VyKGBkZXN0cm95ZWQuemYuJHtwbHVnaW5OYW1lfWApO1xuICAgIGZvcih2YXIgcHJvcCBpbiBwbHVnaW4pe1xuICAgICAgcGx1Z2luW3Byb3BdID0gbnVsbDsvL2NsZWFuIHVwIHNjcmlwdCB0byBwcmVwIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAgfVxuICAgIHJldHVybjtcbiAgfSxcblxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIENhdXNlcyBvbmUgb3IgbW9yZSBhY3RpdmUgcGx1Z2lucyB0byByZS1pbml0aWFsaXplLCByZXNldHRpbmcgZXZlbnQgbGlzdGVuZXJzLCByZWNhbGN1bGF0aW5nIHBvc2l0aW9ucywgZXRjLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGx1Z2lucyAtIG9wdGlvbmFsIHN0cmluZyBvZiBhbiBpbmRpdmlkdWFsIHBsdWdpbiBrZXksIGF0dGFpbmVkIGJ5IGNhbGxpbmcgYCQoZWxlbWVudCkuZGF0YSgncGx1Z2luTmFtZScpYCwgb3Igc3RyaW5nIG9mIGEgcGx1Z2luIGNsYXNzIGkuZS4gYCdkcm9wZG93bidgXG4gICAqIEBkZWZhdWx0IElmIG5vIGFyZ3VtZW50IGlzIHBhc3NlZCwgcmVmbG93IGFsbCBjdXJyZW50bHkgYWN0aXZlIHBsdWdpbnMuXG4gICAqL1xuICAgcmVJbml0OiBmdW5jdGlvbihwbHVnaW5zKXtcbiAgICAgdmFyIGlzSlEgPSBwbHVnaW5zIGluc3RhbmNlb2YgJDtcbiAgICAgdHJ5e1xuICAgICAgIGlmKGlzSlEpe1xuICAgICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICQodGhpcykuZGF0YSgnemZQbHVnaW4nKS5faW5pdCgpO1xuICAgICAgICAgfSk7XG4gICAgICAgfWVsc2V7XG4gICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBwbHVnaW5zLFxuICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgZm5zID0ge1xuICAgICAgICAgICAnb2JqZWN0JzogZnVuY3Rpb24ocGxncyl7XG4gICAgICAgICAgICAgcGxncy5mb3JFYWNoKGZ1bmN0aW9uKHApe1xuICAgICAgICAgICAgICAgcCA9IGh5cGhlbmF0ZShwKTtcbiAgICAgICAgICAgICAgICQoJ1tkYXRhLScrIHAgKyddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgfSxcbiAgICAgICAgICAgJ3N0cmluZyc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgcGx1Z2lucyA9IGh5cGhlbmF0ZShwbHVnaW5zKTtcbiAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwbHVnaW5zICsnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgICd1bmRlZmluZWQnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgIHRoaXNbJ29iamVjdCddKE9iamVjdC5rZXlzKF90aGlzLl9wbHVnaW5zKSk7XG4gICAgICAgICAgIH1cbiAgICAgICAgIH07XG4gICAgICAgICBmbnNbdHlwZV0ocGx1Z2lucyk7XG4gICAgICAgfVxuICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgIH1maW5hbGx5e1xuICAgICAgIHJldHVybiBwbHVnaW5zO1xuICAgICB9XG4gICB9LFxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmFuZG9tIGJhc2UtMzYgdWlkIHdpdGggbmFtZXNwYWNpbmdcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggLSBudW1iZXIgb2YgcmFuZG9tIGJhc2UtMzYgZGlnaXRzIGRlc2lyZWQuIEluY3JlYXNlIGZvciBtb3JlIHJhbmRvbSBzdHJpbmdzLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIC0gbmFtZSBvZiBwbHVnaW4gdG8gYmUgaW5jb3Jwb3JhdGVkIGluIHVpZCwgb3B0aW9uYWwuXG4gICAqIEBkZWZhdWx0IHtTdHJpbmd9ICcnIC0gaWYgbm8gcGx1Z2luIG5hbWUgaXMgcHJvdmlkZWQsIG5vdGhpbmcgaXMgYXBwZW5kZWQgdG8gdGhlIHVpZC5cbiAgICogQHJldHVybnMge1N0cmluZ30gLSB1bmlxdWUgaWRcbiAgICovXG4gIEdldFlvRGlnaXRzOiBmdW5jdGlvbihsZW5ndGgsIG5hbWVzcGFjZSl7XG4gICAgbGVuZ3RoID0gbGVuZ3RoIHx8IDY7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoKE1hdGgucG93KDM2LCBsZW5ndGggKyAxKSAtIE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygzNiwgbGVuZ3RoKSkpLnRvU3RyaW5nKDM2KS5zbGljZSgxKSArIChuYW1lc3BhY2UgPyBgLSR7bmFtZXNwYWNlfWAgOiAnJyk7XG4gIH0sXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHBsdWdpbnMgb24gYW55IGVsZW1lbnRzIHdpdGhpbiBgZWxlbWAgKGFuZCBgZWxlbWAgaXRzZWxmKSB0aGF0IGFyZW4ndCBhbHJlYWR5IGluaXRpYWxpemVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSAtIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgZWxlbWVudCB0byBjaGVjayBpbnNpZGUuIEFsc28gY2hlY2tzIHRoZSBlbGVtZW50IGl0c2VsZiwgdW5sZXNzIGl0J3MgdGhlIGBkb2N1bWVudGAgb2JqZWN0LlxuICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gcGx1Z2lucyAtIEEgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUuIExlYXZlIHRoaXMgb3V0IHRvIGluaXRpYWxpemUgZXZlcnl0aGluZy5cbiAgICovXG4gIHJlZmxvdzogZnVuY3Rpb24oZWxlbSwgcGx1Z2lucykge1xuXG4gICAgLy8gSWYgcGx1Z2lucyBpcyB1bmRlZmluZWQsIGp1c3QgZ3JhYiBldmVyeXRoaW5nXG4gICAgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcGx1Z2lucyA9IE9iamVjdC5rZXlzKHRoaXMuX3BsdWdpbnMpO1xuICAgIH1cbiAgICAvLyBJZiBwbHVnaW5zIGlzIGEgc3RyaW5nLCBjb252ZXJ0IGl0IHRvIGFuIGFycmF5IHdpdGggb25lIGl0ZW1cbiAgICBlbHNlIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBsdWdpbnMgPSBbcGx1Z2luc107XG4gICAgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHBsdWdpblxuICAgICQuZWFjaChwbHVnaW5zLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgcGx1Z2luXG4gICAgICB2YXIgcGx1Z2luID0gX3RoaXMuX3BsdWdpbnNbbmFtZV07XG5cbiAgICAgIC8vIExvY2FsaXplIHRoZSBzZWFyY2ggdG8gYWxsIGVsZW1lbnRzIGluc2lkZSBlbGVtLCBhcyB3ZWxsIGFzIGVsZW0gaXRzZWxmLCB1bmxlc3MgZWxlbSA9PT0gZG9jdW1lbnRcbiAgICAgIHZhciAkZWxlbSA9ICQoZWxlbSkuZmluZCgnW2RhdGEtJytuYW1lKyddJykuYWRkQmFjaygnW2RhdGEtJytuYW1lKyddJyk7XG5cbiAgICAgIC8vIEZvciBlYWNoIHBsdWdpbiBmb3VuZCwgaW5pdGlhbGl6ZSBpdFxuICAgICAgJGVsZW0uZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRlbCA9ICQodGhpcyksXG4gICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgIC8vIERvbid0IGRvdWJsZS1kaXAgb24gcGx1Z2luc1xuICAgICAgICBpZiAoJGVsLmRhdGEoJ3pmUGx1Z2luJykpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJUcmllZCB0byBpbml0aWFsaXplIFwiK25hbWUrXCIgb24gYW4gZWxlbWVudCB0aGF0IGFscmVhZHkgaGFzIGEgRm91bmRhdGlvbiBwbHVnaW4uXCIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKSl7XG4gICAgICAgICAgdmFyIHRoaW5nID0gJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpLnNwbGl0KCc7JykuZm9yRWFjaChmdW5jdGlvbihlLCBpKXtcbiAgICAgICAgICAgIHZhciBvcHQgPSBlLnNwbGl0KCc6JykubWFwKGZ1bmN0aW9uKGVsKXsgcmV0dXJuIGVsLnRyaW0oKTsgfSk7XG4gICAgICAgICAgICBpZihvcHRbMF0pIG9wdHNbb3B0WzBdXSA9IHBhcnNlVmFsdWUob3B0WzFdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0cnl7XG4gICAgICAgICAgJGVsLmRhdGEoJ3pmUGx1Z2luJywgbmV3IHBsdWdpbigkKHRoaXMpLCBvcHRzKSk7XG4gICAgICAgIH1jYXRjaChlcil7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcik7XG4gICAgICAgIH1maW5hbGx5e1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG4gIGdldEZuTmFtZTogZnVuY3Rpb25OYW1lLFxuICB0cmFuc2l0aW9uZW5kOiBmdW5jdGlvbigkZWxlbSl7XG4gICAgdmFyIHRyYW5zaXRpb25zID0ge1xuICAgICAgJ3RyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICdNb3pUcmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgJ09UcmFuc2l0aW9uJzogJ290cmFuc2l0aW9uZW5kJ1xuICAgIH07XG4gICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgZW5kO1xuXG4gICAgZm9yICh2YXIgdCBpbiB0cmFuc2l0aW9ucyl7XG4gICAgICBpZiAodHlwZW9mIGVsZW0uc3R5bGVbdF0gIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgZW5kID0gdHJhbnNpdGlvbnNbdF07XG4gICAgICB9XG4gICAgfVxuICAgIGlmKGVuZCl7XG4gICAgICByZXR1cm4gZW5kO1xuICAgIH1lbHNle1xuICAgICAgZW5kID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAkZWxlbS50cmlnZ2VySGFuZGxlcigndHJhbnNpdGlvbmVuZCcsIFskZWxlbV0pO1xuICAgICAgfSwgMSk7XG4gICAgICByZXR1cm4gJ3RyYW5zaXRpb25lbmQnO1xuICAgIH1cbiAgfVxufTtcblxuRm91bmRhdGlvbi51dGlsID0ge1xuICAvKipcbiAgICogRnVuY3Rpb24gZm9yIGFwcGx5aW5nIGEgZGVib3VuY2UgZWZmZWN0IHRvIGEgZnVuY3Rpb24gY2FsbC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgLSBGdW5jdGlvbiB0byBiZSBjYWxsZWQgYXQgZW5kIG9mIHRpbWVvdXQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZWxheSAtIFRpbWUgaW4gbXMgdG8gZGVsYXkgdGhlIGNhbGwgb2YgYGZ1bmNgLlxuICAgKiBAcmV0dXJucyBmdW5jdGlvblxuICAgKi9cbiAgdGhyb3R0bGU6IGZ1bmN0aW9uIChmdW5jLCBkZWxheSkge1xuICAgIHZhciB0aW1lciA9IG51bGw7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICBpZiAodGltZXIgPT09IG51bGwpIHtcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIHRpbWVyID0gbnVsbDtcbiAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn07XG5cbi8vIFRPRE86IGNvbnNpZGVyIG5vdCBtYWtpbmcgdGhpcyBhIGpRdWVyeSBmdW5jdGlvblxuLy8gVE9ETzogbmVlZCB3YXkgdG8gcmVmbG93IHZzLiByZS1pbml0aWFsaXplXG4vKipcbiAqIFRoZSBGb3VuZGF0aW9uIGpRdWVyeSBtZXRob2QuXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gbWV0aG9kIC0gQW4gYWN0aW9uIHRvIHBlcmZvcm0gb24gdGhlIGN1cnJlbnQgalF1ZXJ5IG9iamVjdC5cbiAqL1xudmFyIGZvdW5kYXRpb24gPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgbWV0aG9kLFxuICAgICAgJG1ldGEgPSAkKCdtZXRhLmZvdW5kYXRpb24tbXEnKSxcbiAgICAgICRub0pTID0gJCgnLm5vLWpzJyk7XG5cbiAgaWYoISRtZXRhLmxlbmd0aCl7XG4gICAgJCgnPG1ldGEgY2xhc3M9XCJmb3VuZGF0aW9uLW1xXCI+JykuYXBwZW5kVG8oZG9jdW1lbnQuaGVhZCk7XG4gIH1cbiAgaWYoJG5vSlMubGVuZ3RoKXtcbiAgICAkbm9KUy5yZW1vdmVDbGFzcygnbm8tanMnKTtcbiAgfVxuXG4gIGlmKHR5cGUgPT09ICd1bmRlZmluZWQnKXsvL25lZWRzIHRvIGluaXRpYWxpemUgdGhlIEZvdW5kYXRpb24gb2JqZWN0LCBvciBhbiBpbmRpdmlkdWFsIHBsdWdpbi5cbiAgICBGb3VuZGF0aW9uLk1lZGlhUXVlcnkuX2luaXQoKTtcbiAgICBGb3VuZGF0aW9uLnJlZmxvdyh0aGlzKTtcbiAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpey8vYW4gaW5kaXZpZHVhbCBtZXRob2QgdG8gaW52b2tlIG9uIGEgcGx1Z2luIG9yIGdyb3VwIG9mIHBsdWdpbnNcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7Ly9jb2xsZWN0IGFsbCB0aGUgYXJndW1lbnRzLCBpZiBuZWNlc3NhcnlcbiAgICB2YXIgcGx1Z0NsYXNzID0gdGhpcy5kYXRhKCd6ZlBsdWdpbicpOy8vZGV0ZXJtaW5lIHRoZSBjbGFzcyBvZiBwbHVnaW5cblxuICAgIGlmKHBsdWdDbGFzcyAhPT0gdW5kZWZpbmVkICYmIHBsdWdDbGFzc1ttZXRob2RdICE9PSB1bmRlZmluZWQpey8vbWFrZSBzdXJlIGJvdGggdGhlIGNsYXNzIGFuZCBtZXRob2QgZXhpc3RcbiAgICAgIGlmKHRoaXMubGVuZ3RoID09PSAxKXsvL2lmIHRoZXJlJ3Mgb25seSBvbmUsIGNhbGwgaXQgZGlyZWN0bHkuXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkocGx1Z0NsYXNzLCBhcmdzKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgZWwpey8vb3RoZXJ3aXNlIGxvb3AgdGhyb3VnaCB0aGUgalF1ZXJ5IGNvbGxlY3Rpb24gYW5kIGludm9rZSB0aGUgbWV0aG9kIG9uIGVhY2hcbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseSgkKGVsKS5kYXRhKCd6ZlBsdWdpbicpLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfWVsc2V7Ly9lcnJvciBmb3Igbm8gY2xhc3Mgb3Igbm8gbWV0aG9kXG4gICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJXZSdyZSBzb3JyeSwgJ1wiICsgbWV0aG9kICsgXCInIGlzIG5vdCBhbiBhdmFpbGFibGUgbWV0aG9kIGZvciBcIiArIChwbHVnQ2xhc3MgPyBmdW5jdGlvbk5hbWUocGx1Z0NsYXNzKSA6ICd0aGlzIGVsZW1lbnQnKSArICcuJyk7XG4gICAgfVxuICB9ZWxzZXsvL2Vycm9yIGZvciBpbnZhbGlkIGFyZ3VtZW50IHR5cGVcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBXZSdyZSBzb3JyeSwgJHt0eXBlfSBpcyBub3QgYSB2YWxpZCBwYXJhbWV0ZXIuIFlvdSBtdXN0IHVzZSBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG1ldGhvZCB5b3Ugd2lzaCB0byBpbnZva2UuYCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG53aW5kb3cuRm91bmRhdGlvbiA9IEZvdW5kYXRpb247XG4kLmZuLmZvdW5kYXRpb24gPSBmb3VuZGF0aW9uO1xuXG4vLyBQb2x5ZmlsbCBmb3IgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4oZnVuY3Rpb24oKSB7XG4gIGlmICghRGF0ZS5ub3cgfHwgIXdpbmRvdy5EYXRlLm5vdylcbiAgICB3aW5kb3cuRGF0ZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG5cbiAgdmFyIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKytpKSB7XG4gICAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAod2luZG93W3ZwKydDYW5jZWxBbmltYXRpb25GcmFtZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3dbdnArJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddKTtcbiAgfVxuICBpZiAoL2lQKGFkfGhvbmV8b2QpLipPUyA2Ly50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuICAgIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdmFyIG5leHRUaW1lID0gTWF0aC5tYXgobGFzdFRpbWUgKyAxNiwgbm93KTtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGxhc3RUaW1lID0gbmV4dFRpbWUpOyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0VGltZSAtIG5vdyk7XG4gICAgfTtcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XG4gIH1cbiAgLyoqXG4gICAqIFBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3csIHJlcXVpcmVkIGJ5IHJBRlxuICAgKi9cbiAgaWYoIXdpbmRvdy5wZXJmb3JtYW5jZSB8fCAhd2luZG93LnBlcmZvcm1hbmNlLm5vdyl7XG4gICAgd2luZG93LnBlcmZvcm1hbmNlID0ge1xuICAgICAgc3RhcnQ6IERhdGUubm93KCksXG4gICAgICBub3c6IGZ1bmN0aW9uKCl7IHJldHVybiBEYXRlLm5vdygpIC0gdGhpcy5zdGFydDsgfVxuICAgIH07XG4gIH1cbn0pKCk7XG5pZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24ob1RoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIGNsb3Nlc3QgdGhpbmcgcG9zc2libGUgdG8gdGhlIEVDTUFTY3JpcHQgNVxuICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSBib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcbiAgICB9XG5cbiAgICB2YXIgYUFyZ3MgICA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgIGZUb0JpbmQgPSB0aGlzLFxuICAgICAgICBmTk9QICAgID0gZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgZkJvdW5kICA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QXG4gICAgICAgICAgICAgICAgID8gdGhpc1xuICAgICAgICAgICAgICAgICA6IG9UaGlzLFxuICAgICAgICAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICB9O1xuXG4gICAgaWYgKHRoaXMucHJvdG90eXBlKSB7XG4gICAgICAvLyBuYXRpdmUgZnVuY3Rpb25zIGRvbid0IGhhdmUgYSBwcm90b3R5cGVcbiAgICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XG4gICAgfVxuICAgIGZCb3VuZC5wcm90b3R5cGUgPSBuZXcgZk5PUCgpO1xuXG4gICAgcmV0dXJuIGZCb3VuZDtcbiAgfTtcbn1cbi8vIFBvbHlmaWxsIHRvIGdldCB0aGUgbmFtZSBvZiBhIGZ1bmN0aW9uIGluIElFOVxuZnVuY3Rpb24gZnVuY3Rpb25OYW1lKGZuKSB7XG4gIGlmIChGdW5jdGlvbi5wcm90b3R5cGUubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMoW14oXXsxLH0pXFwoLztcbiAgICB2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG4gICAgcmV0dXJuIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSkgPyByZXN1bHRzWzFdLnRyaW0oKSA6IFwiXCI7XG4gIH1cbiAgZWxzZSBpZiAoZm4ucHJvdG90eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZm4uY29uc3RydWN0b3IubmFtZTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gZm4ucHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbn1cbmZ1bmN0aW9uIHBhcnNlVmFsdWUoc3RyKXtcbiAgaWYgKCd0cnVlJyA9PT0gc3RyKSByZXR1cm4gdHJ1ZTtcbiAgZWxzZSBpZiAoJ2ZhbHNlJyA9PT0gc3RyKSByZXR1cm4gZmFsc2U7XG4gIGVsc2UgaWYgKCFpc05hTihzdHIgKiAxKSkgcmV0dXJuIHBhcnNlRmxvYXQoc3RyKTtcbiAgcmV0dXJuIHN0cjtcbn1cbi8vIENvbnZlcnQgUGFzY2FsQ2FzZSB0byBrZWJhYi1jYXNlXG4vLyBUaGFuayB5b3U6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzg5NTU1ODBcbmZ1bmN0aW9uIGh5cGhlbmF0ZShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xufVxuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogRHJpbGxkb3duIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5kcmlsbGRvd25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm5lc3RcbiAqL1xuXG5jbGFzcyBEcmlsbGRvd24ge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIGRyaWxsZG93biBtZW51LlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhbiBhY2NvcmRpb24gbWVudS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBEcmlsbGRvd24uZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIEZvdW5kYXRpb24uTmVzdC5GZWF0aGVyKHRoaXMuJGVsZW1lbnQsICdkcmlsbGRvd24nKTtcblxuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0RyaWxsZG93bicpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ0RyaWxsZG93bicsIHtcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcbiAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICdBUlJPV19VUCc6ICd1cCcsXG4gICAgICAnQVJST1dfRE9XTic6ICdkb3duJyxcbiAgICAgICdBUlJPV19MRUZUJzogJ3ByZXZpb3VzJyxcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnLFxuICAgICAgJ1RBQic6ICdkb3duJyxcbiAgICAgICdTSElGVF9UQUInOiAndXAnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGRyaWxsZG93biBieSBjcmVhdGluZyBqUXVlcnkgY29sbGVjdGlvbnMgb2YgZWxlbWVudHNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuJHN1Ym1lbnVBbmNob3JzID0gdGhpcy4kZWxlbWVudC5maW5kKCdsaS5pcy1kcmlsbGRvd24tc3VibWVudS1wYXJlbnQnKS5jaGlsZHJlbignYScpO1xuICAgIHRoaXMuJHN1Ym1lbnVzID0gdGhpcy4kc3VibWVudUFuY2hvcnMucGFyZW50KCdsaScpLmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpO1xuICAgIHRoaXMuJG1lbnVJdGVtcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGknKS5ub3QoJy5qcy1kcmlsbGRvd24tYmFjaycpLmF0dHIoJ3JvbGUnLCAnbWVudWl0ZW0nKS5maW5kKCdhJyk7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLW11dGF0ZScsICh0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtZHJpbGxkb3duJykgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnZHJpbGxkb3duJykpKTtcblxuICAgIHRoaXMuX3ByZXBhcmVNZW51KCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJFdmVudHMoKTtcblxuICAgIHRoaXMuX2tleWJvYXJkRXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogcHJlcGFyZXMgZHJpbGxkb3duIG1lbnUgYnkgc2V0dGluZyBhdHRyaWJ1dGVzIHRvIGxpbmtzIGFuZCBlbGVtZW50c1xuICAgKiBzZXRzIGEgbWluIGhlaWdodCB0byBwcmV2ZW50IGNvbnRlbnQganVtcGluZ1xuICAgKiB3cmFwcyB0aGUgZWxlbWVudCBpZiBub3QgYWxyZWFkeSB3cmFwcGVkXG4gICAqIEBwcml2YXRlXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgX3ByZXBhcmVNZW51KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgLy8gaWYoIXRoaXMub3B0aW9ucy5ob2xkT3Blbil7XG4gICAgLy8gICB0aGlzLl9tZW51TGlua0V2ZW50cygpO1xuICAgIC8vIH1cbiAgICB0aGlzLiRzdWJtZW51QW5jaG9ycy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJGxpbmsgPSAkKHRoaXMpO1xuICAgICAgdmFyICRzdWIgPSAkbGluay5wYXJlbnQoKTtcbiAgICAgIGlmKF90aGlzLm9wdGlvbnMucGFyZW50TGluayl7XG4gICAgICAgICRsaW5rLmNsb25lKCkucHJlcGVuZFRvKCRzdWIuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJykpLndyYXAoJzxsaSBjbGFzcz1cImlzLXN1Ym1lbnUtcGFyZW50LWl0ZW0gaXMtc3VibWVudS1pdGVtIGlzLWRyaWxsZG93bi1zdWJtZW51LWl0ZW1cIiByb2xlPVwibWVudS1pdGVtXCI+PC9saT4nKTtcbiAgICAgIH1cbiAgICAgICRsaW5rLmRhdGEoJ3NhdmVkSHJlZicsICRsaW5rLmF0dHIoJ2hyZWYnKSkucmVtb3ZlQXR0cignaHJlZicpLmF0dHIoJ3RhYmluZGV4JywgMCk7XG4gICAgICAkbGluay5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKVxuICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6IHRydWUsXG4gICAgICAgICAgICAndGFiaW5kZXgnOiAwLFxuICAgICAgICAgICAgJ3JvbGUnOiAnbWVudSdcbiAgICAgICAgICB9KTtcbiAgICAgIF90aGlzLl9ldmVudHMoJGxpbmspO1xuICAgIH0pO1xuICAgIHRoaXMuJHN1Ym1lbnVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkbWVudSA9ICQodGhpcyksXG4gICAgICAgICAgJGJhY2sgPSAkbWVudS5maW5kKCcuanMtZHJpbGxkb3duLWJhY2snKTtcbiAgICAgIGlmKCEkYmFjay5sZW5ndGgpe1xuICAgICAgICBzd2l0Y2ggKF90aGlzLm9wdGlvbnMuYmFja0J1dHRvblBvc2l0aW9uKSB7XG4gICAgICAgICAgY2FzZSBcImJvdHRvbVwiOlxuICAgICAgICAgICAgJG1lbnUuYXBwZW5kKF90aGlzLm9wdGlvbnMuYmFja0J1dHRvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwidG9wXCI6XG4gICAgICAgICAgICAkbWVudS5wcmVwZW5kKF90aGlzLm9wdGlvbnMuYmFja0J1dHRvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVuc3VwcG9ydGVkIGJhY2tCdXR0b25Qb3NpdGlvbiB2YWx1ZSAnXCIgKyBfdGhpcy5vcHRpb25zLmJhY2tCdXR0b25Qb3NpdGlvbiArIFwiJ1wiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgX3RoaXMuX2JhY2soJG1lbnUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kc3VibWVudXMuYWRkQ2xhc3MoJ2ludmlzaWJsZScpO1xuICAgIGlmKCF0aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkge1xuICAgICAgdGhpcy4kc3VibWVudXMuYWRkQ2xhc3MoJ2RyaWxsZG93bi1zdWJtZW51LWNvdmVyLXByZXZpb3VzJyk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIGEgd3JhcHBlciBvbiBlbGVtZW50IGlmIGl0IGRvZXNuJ3QgZXhpc3QuXG4gICAgaWYoIXRoaXMuJGVsZW1lbnQucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWRyaWxsZG93bicpKXtcbiAgICAgIHRoaXMuJHdyYXBwZXIgPSAkKHRoaXMub3B0aW9ucy53cmFwcGVyKS5hZGRDbGFzcygnaXMtZHJpbGxkb3duJyk7XG4gICAgICBpZih0aGlzLm9wdGlvbnMuYW5pbWF0ZUhlaWdodCkgdGhpcy4kd3JhcHBlci5hZGRDbGFzcygnYW5pbWF0ZS1oZWlnaHQnKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQud3JhcCh0aGlzLiR3cmFwcGVyKTtcbiAgICB9XG4gICAgLy8gc2V0IHdyYXBwZXJcbiAgICB0aGlzLiR3cmFwcGVyID0gdGhpcy4kZWxlbWVudC5wYXJlbnQoKTtcbiAgICB0aGlzLiR3cmFwcGVyLmNzcyh0aGlzLl9nZXRNYXhEaW1zKCkpO1xuICB9XG5cbiAgX3Jlc2l6ZSgpIHtcbiAgICB0aGlzLiR3cmFwcGVyLmNzcyh7J21heC13aWR0aCc6ICdub25lJywgJ21pbi1oZWlnaHQnOiAnbm9uZSd9KTtcbiAgICAvLyBfZ2V0TWF4RGltcyBoYXMgc2lkZSBlZmZlY3RzIChib28pIGJ1dCBjYWxsaW5nIGl0IHNob3VsZCB1cGRhdGUgYWxsIG90aGVyIG5lY2Vzc2FyeSBoZWlnaHRzICYgd2lkdGhzXG4gICAgdGhpcy4kd3JhcHBlci5jc3ModGhpcy5fZ2V0TWF4RGltcygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIHRvIGVsZW1lbnRzIGluIHRoZSBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtIC0gdGhlIGN1cnJlbnQgbWVudSBpdGVtIHRvIGFkZCBoYW5kbGVycyB0by5cbiAgICovXG4gIF9ldmVudHMoJGVsZW0pIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgJGVsZW0ub2ZmKCdjbGljay56Zi5kcmlsbGRvd24nKVxuICAgIC5vbignY2xpY2suemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZigkKGUudGFyZ2V0KS5wYXJlbnRzVW50aWwoJ3VsJywgJ2xpJykuaGFzQ2xhc3MoJ2lzLWRyaWxsZG93bi1zdWJtZW51LXBhcmVudCcpKXtcbiAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBpZihlLnRhcmdldCAhPT0gZS5jdXJyZW50VGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkKXtcbiAgICAgIC8vICAgcmV0dXJuIGZhbHNlO1xuICAgICAgLy8gfVxuICAgICAgX3RoaXMuX3Nob3coJGVsZW0ucGFyZW50KCdsaScpKTtcblxuICAgICAgaWYoX3RoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2spe1xuICAgICAgICB2YXIgJGJvZHkgPSAkKCdib2R5Jyk7XG4gICAgICAgICRib2R5Lm9mZignLnpmLmRyaWxsZG93bicpLm9uKCdjbGljay56Zi5kcmlsbGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICBpZiAoZS50YXJnZXQgPT09IF90aGlzLiRlbGVtZW50WzBdIHx8ICQuY29udGFpbnMoX3RoaXMuJGVsZW1lbnRbMF0sIGUudGFyZ2V0KSkgeyByZXR1cm47IH1cbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgX3RoaXMuX2hpZGVBbGwoKTtcbiAgICAgICAgICAkYm9keS5vZmYoJy56Zi5kcmlsbGRvd24nKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cdCAgdGhpcy4kZWxlbWVudC5vbignbXV0YXRlbWUuemYudHJpZ2dlcicsIHRoaXMuX3Jlc2l6ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBtZW51IGVsZW1lbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlZ2lzdGVyRXZlbnRzKCkge1xuICAgIGlmKHRoaXMub3B0aW9ucy5zY3JvbGxUb3Ape1xuICAgICAgdGhpcy5fYmluZEhhbmRsZXIgPSB0aGlzLl9zY3JvbGxUb3AuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ29wZW4uemYuZHJpbGxkb3duIGhpZGUuemYuZHJpbGxkb3duIGNsb3NlZC56Zi5kcmlsbGRvd24nLHRoaXMuX2JpbmRIYW5kbGVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xsIHRvIFRvcCBvZiBFbGVtZW50IG9yIGRhdGEtc2Nyb2xsLXRvcC1lbGVtZW50XG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJpbGxkb3duI3Njcm9sbG1lXG4gICAqL1xuICBfc2Nyb2xsVG9wKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyICRzY3JvbGxUb3BFbGVtZW50ID0gX3RoaXMub3B0aW9ucy5zY3JvbGxUb3BFbGVtZW50IT0nJz8kKF90aGlzLm9wdGlvbnMuc2Nyb2xsVG9wRWxlbWVudCk6X3RoaXMuJGVsZW1lbnQsXG4gICAgICAgIHNjcm9sbFBvcyA9IHBhcnNlSW50KCRzY3JvbGxUb3BFbGVtZW50Lm9mZnNldCgpLnRvcCtfdGhpcy5vcHRpb25zLnNjcm9sbFRvcE9mZnNldCk7XG4gICAgJCgnaHRtbCwgYm9keScpLnN0b3AodHJ1ZSkuYW5pbWF0ZSh7IHNjcm9sbFRvcDogc2Nyb2xsUG9zIH0sIF90aGlzLm9wdGlvbnMuYW5pbWF0aW9uRHVyYXRpb24sIF90aGlzLm9wdGlvbnMuYW5pbWF0aW9uRWFzaW5nLGZ1bmN0aW9uKCl7XG4gICAgICAvKipcbiAgICAgICAgKiBGaXJlcyBhZnRlciB0aGUgbWVudSBoYXMgc2Nyb2xsZWRcbiAgICAgICAgKiBAZXZlbnQgRHJpbGxkb3duI3Njcm9sbG1lXG4gICAgICAgICovXG4gICAgICBpZih0aGlzPT09JCgnaHRtbCcpWzBdKV90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Njcm9sbG1lLnpmLmRyaWxsZG93bicpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMga2V5ZG93biBldmVudCBsaXN0ZW5lciB0byBgbGlgJ3MgaW4gdGhlIG1lbnUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfa2V5Ym9hcmRFdmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJG1lbnVJdGVtcy5hZGQodGhpcy4kZWxlbWVudC5maW5kKCcuanMtZHJpbGxkb3duLWJhY2sgPiBhLCAuaXMtc3VibWVudS1wYXJlbnQtaXRlbSA+IGEnKSkub24oJ2tleWRvd24uemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgICRlbGVtZW50cyA9ICRlbGVtZW50LnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykuY2hpbGRyZW4oJ2xpJykuY2hpbGRyZW4oJ2EnKSxcbiAgICAgICAgICAkcHJldkVsZW1lbnQsXG4gICAgICAgICAgJG5leHRFbGVtZW50O1xuXG4gICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgIGlmICgkKHRoaXMpLmlzKCRlbGVtZW50KSkge1xuICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1heCgwLCBpLTEpKTtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5taW4oaSsxLCAkZWxlbWVudHMubGVuZ3RoLTEpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnRHJpbGxkb3duJywge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoJGVsZW1lbnQuaXMoX3RoaXMuJHN1Ym1lbnVBbmNob3JzKSkge1xuICAgICAgICAgICAgX3RoaXMuX3Nob3coJGVsZW1lbnQucGFyZW50KCdsaScpKTtcbiAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtZW50KSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLmZpbmQoJ3VsIGxpIGEnKS5maWx0ZXIoX3RoaXMuJG1lbnVJdGVtcykuZmlyc3QoKS5mb2N1cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHByZXZpb3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbWVudC5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpKTtcbiAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpLm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoJGVsZW1lbnQpLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5wYXJlbnQoJ2xpJykuY2hpbGRyZW4oJ2EnKS5maXJzdCgpLmZvY3VzKCk7XG4gICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRwcmV2RWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgIC8vIERvbid0IHRhcCBmb2N1cyBvbiBmaXJzdCBlbGVtZW50IGluIHJvb3QgdWxcbiAgICAgICAgICByZXR1cm4gISRlbGVtZW50LmlzKF90aGlzLiRlbGVtZW50LmZpbmQoJz4gbGk6Zmlyc3QtY2hpbGQgPiBhJykpO1xuICAgICAgICB9LFxuICAgICAgICBkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAvLyBEb24ndCB0YXAgZm9jdXMgb24gbGFzdCBlbGVtZW50IGluIHJvb3QgdWxcbiAgICAgICAgICByZXR1cm4gISRlbGVtZW50LmlzKF90aGlzLiRlbGVtZW50LmZpbmQoJz4gbGk6bGFzdC1jaGlsZCA+IGEnKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBEb24ndCBjbG9zZSBvbiBlbGVtZW50IGluIHJvb3QgdWxcbiAgICAgICAgICBpZiAoISRlbGVtZW50LmlzKF90aGlzLiRlbGVtZW50LmZpbmQoJz4gbGkgPiBhJykpKSB7XG4gICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbWVudC5wYXJlbnQoKS5wYXJlbnQoKSk7XG4gICAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoKS5wYXJlbnQoKS5zaWJsaW5ncygnYScpLmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBvcGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoISRlbGVtZW50LmlzKF90aGlzLiRtZW51SXRlbXMpKSB7IC8vIG5vdCBtZW51IGl0ZW0gbWVhbnMgYmFjayBidXR0b25cbiAgICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtZW50LnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykpO1xuICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtZW50KSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpLnBhcmVudCgnbGknKS5jaGlsZHJlbignYScpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoJGVsZW1lbnQuaXMoX3RoaXMuJHN1Ym1lbnVBbmNob3JzKSkge1xuICAgICAgICAgICAgX3RoaXMuX3Nob3coJGVsZW1lbnQucGFyZW50KCdsaScpKTtcbiAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtZW50KSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLmZpbmQoJ3VsIGxpIGEnKS5maWx0ZXIoX3RoaXMuJG1lbnVJdGVtcykuZmlyc3QoKS5mb2N1cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKHByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgaWYgKHByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pOyAvLyBlbmQga2V5Ym9hcmRBY2Nlc3NcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgYWxsIG9wZW4gZWxlbWVudHMsIGFuZCByZXR1cm5zIHRvIHJvb3QgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBmaXJlcyBEcmlsbGRvd24jY2xvc2VkXG4gICAqL1xuICBfaGlkZUFsbCgpIHtcbiAgICB2YXIgJGVsZW0gPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pcy1kcmlsbGRvd24tc3VibWVudS5pcy1hY3RpdmUnKS5hZGRDbGFzcygnaXMtY2xvc2luZycpO1xuICAgIGlmKHRoaXMub3B0aW9ucy5hdXRvSGVpZ2h0KSB0aGlzLiR3cmFwcGVyLmNzcyh7aGVpZ2h0OiRlbGVtLnBhcmVudCgpLmNsb3Nlc3QoJ3VsJykuZGF0YSgnY2FsY0hlaWdodCcpfSk7XG4gICAgJGVsZW0ub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbSksIGZ1bmN0aW9uKGUpe1xuICAgICAgJGVsZW0ucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1jbG9zaW5nJyk7XG4gICAgfSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBtZW51IGlzIGZ1bGx5IGNsb3NlZC5cbiAgICAgICAgICogQGV2ZW50IERyaWxsZG93biNjbG9zZWRcbiAgICAgICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjbG9zZWQuemYuZHJpbGxkb3duJyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBsaXN0ZW5lciBmb3IgZWFjaCBgYmFja2AgYnV0dG9uLCBhbmQgY2xvc2VzIG9wZW4gbWVudXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJpbGxkb3duI2JhY2tcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtIC0gdGhlIGN1cnJlbnQgc3ViLW1lbnUgdG8gYWRkIGBiYWNrYCBldmVudC5cbiAgICovXG4gIF9iYWNrKCRlbGVtKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAkZWxlbS5vZmYoJ2NsaWNrLnpmLmRyaWxsZG93bicpO1xuICAgICRlbGVtLmNoaWxkcmVuKCcuanMtZHJpbGxkb3duLWJhY2snKVxuICAgICAgLm9uKCdjbGljay56Zi5kcmlsbGRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ21vdXNldXAgb24gYmFjaycpO1xuICAgICAgICBfdGhpcy5faGlkZSgkZWxlbSk7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBwYXJlbnQgc3VibWVudSwgY2FsbCBzaG93XG4gICAgICAgIGxldCBwYXJlbnRTdWJNZW51ID0gJGVsZW0ucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5wYXJlbnQoJ2xpJyk7XG4gICAgICAgIGlmIChwYXJlbnRTdWJNZW51Lmxlbmd0aCkge1xuICAgICAgICAgIF90aGlzLl9zaG93KHBhcmVudFN1Yk1lbnUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVyIHRvIG1lbnUgaXRlbXMgdy9vIHN1Ym1lbnVzIHRvIGNsb3NlIG9wZW4gbWVudXMgb24gY2xpY2suXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX21lbnVMaW5rRXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy4kbWVudUl0ZW1zLm5vdCgnLmlzLWRyaWxsZG93bi1zdWJtZW51LXBhcmVudCcpXG4gICAgICAgIC5vZmYoJ2NsaWNrLnpmLmRyaWxsZG93bicpXG4gICAgICAgIC5vbignY2xpY2suemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgLy8gZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBfdGhpcy5faGlkZUFsbCgpO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgYSBzdWJtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIERyaWxsZG93biNvcGVuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIHRoZSBjdXJyZW50IGVsZW1lbnQgd2l0aCBhIHN1Ym1lbnUgdG8gb3BlbiwgaS5lLiB0aGUgYGxpYCB0YWcuXG4gICAqL1xuICBfc2hvdygkZWxlbSkge1xuICAgIGlmKHRoaXMub3B0aW9ucy5hdXRvSGVpZ2h0KSB0aGlzLiR3cmFwcGVyLmNzcyh7aGVpZ2h0OiRlbGVtLmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpLmRhdGEoJ2NhbGNIZWlnaHQnKX0pO1xuICAgICRlbGVtLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKTtcbiAgICAkZWxlbS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKS5hZGRDbGFzcygnaXMtYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2ludmlzaWJsZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgZmFsc2UpO1xuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHN1Ym1lbnUgaGFzIG9wZW5lZC5cbiAgICAgKiBAZXZlbnQgRHJpbGxkb3duI29wZW5cbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ29wZW4uemYuZHJpbGxkb3duJywgWyRlbGVtXSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhpZGVzIGEgc3VibWVudVxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIERyaWxsZG93biNoaWRlXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIHRoZSBjdXJyZW50IHN1Yi1tZW51IHRvIGhpZGUsIGkuZS4gdGhlIGB1bGAgdGFnLlxuICAgKi9cbiAgX2hpZGUoJGVsZW0pIHtcbiAgICBpZih0aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkgdGhpcy4kd3JhcHBlci5jc3Moe2hlaWdodDokZWxlbS5wYXJlbnQoKS5jbG9zZXN0KCd1bCcpLmRhdGEoJ2NhbGNIZWlnaHQnKX0pO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgJGVsZW0ucGFyZW50KCdsaScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSk7XG4gICAgJGVsZW0uYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKS5hZGRDbGFzcygnaXMtY2xvc2luZycpXG4gICAgJGVsZW0uYWRkQ2xhc3MoJ2lzLWNsb3NpbmcnKVxuICAgICAgICAgLm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoJGVsZW0pLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAkZWxlbS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlIGlzLWNsb3NpbmcnKTtcbiAgICAgICAgICAgJGVsZW0uYmx1cigpLmFkZENsYXNzKCdpbnZpc2libGUnKTtcbiAgICAgICAgIH0pO1xuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHN1Ym1lbnUgaGFzIGNsb3NlZC5cbiAgICAgKiBAZXZlbnQgRHJpbGxkb3duI2hpZGVcbiAgICAgKi9cbiAgICAkZWxlbS50cmlnZ2VyKCdoaWRlLnpmLmRyaWxsZG93bicsIFskZWxlbV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGVzIHRocm91Z2ggdGhlIG5lc3RlZCBtZW51cyB0byBjYWxjdWxhdGUgdGhlIG1pbi1oZWlnaHQsIGFuZCBtYXgtd2lkdGggZm9yIHRoZSBtZW51LlxuICAgKiBQcmV2ZW50cyBjb250ZW50IGp1bXBpbmcuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2dldE1heERpbXMoKSB7XG4gICAgdmFyICBtYXhIZWlnaHQgPSAwLCByZXN1bHQgPSB7fSwgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuJHN1Ym1lbnVzLmFkZCh0aGlzLiRlbGVtZW50KS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbnVtT2ZFbGVtcyA9ICQodGhpcykuY2hpbGRyZW4oJ2xpJykubGVuZ3RoO1xuICAgICAgdmFyIGhlaWdodCA9IEZvdW5kYXRpb24uQm94LkdldERpbWVuc2lvbnModGhpcykuaGVpZ2h0O1xuICAgICAgbWF4SGVpZ2h0ID0gaGVpZ2h0ID4gbWF4SGVpZ2h0ID8gaGVpZ2h0IDogbWF4SGVpZ2h0O1xuICAgICAgaWYoX3RoaXMub3B0aW9ucy5hdXRvSGVpZ2h0KSB7XG4gICAgICAgICQodGhpcykuZGF0YSgnY2FsY0hlaWdodCcsaGVpZ2h0KTtcbiAgICAgICAgaWYgKCEkKHRoaXMpLmhhc0NsYXNzKCdpcy1kcmlsbGRvd24tc3VibWVudScpKSByZXN1bHRbJ2hlaWdodCddID0gaGVpZ2h0O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYoIXRoaXMub3B0aW9ucy5hdXRvSGVpZ2h0KSByZXN1bHRbJ21pbi1oZWlnaHQnXSA9IGAke21heEhlaWdodH1weGA7XG5cbiAgICByZXN1bHRbJ21heC13aWR0aCddID0gYCR7dGhpcy4kZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aH1weGA7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBEcmlsbGRvd24gTWVudVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYodGhpcy5vcHRpb25zLnNjcm9sbFRvcCkgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi5kcmlsbGRvd24nLHRoaXMuX2JpbmRIYW5kbGVyKTtcbiAgICB0aGlzLl9oaWRlQWxsKCk7XG5cdCAgdGhpcy4kZWxlbWVudC5vZmYoJ211dGF0ZW1lLnpmLnRyaWdnZXInKTtcbiAgICBGb3VuZGF0aW9uLk5lc3QuQnVybih0aGlzLiRlbGVtZW50LCAnZHJpbGxkb3duJyk7XG4gICAgdGhpcy4kZWxlbWVudC51bndyYXAoKVxuICAgICAgICAgICAgICAgICAuZmluZCgnLmpzLWRyaWxsZG93bi1iYWNrLCAuaXMtc3VibWVudS1wYXJlbnQtaXRlbScpLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgIC5lbmQoKS5maW5kKCcuaXMtYWN0aXZlLCAuaXMtY2xvc2luZywgLmlzLWRyaWxsZG93bi1zdWJtZW51JykucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1jbG9zaW5nIGlzLWRyaWxsZG93bi1zdWJtZW51JylcbiAgICAgICAgICAgICAgICAgLmVuZCgpLmZpbmQoJ1tkYXRhLXN1Ym1lbnVdJykucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4gdGFiaW5kZXggcm9sZScpO1xuICAgIHRoaXMuJHN1Ym1lbnVBbmNob3JzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLm9mZignLnpmLmRyaWxsZG93bicpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kc3VibWVudXMucmVtb3ZlQ2xhc3MoJ2RyaWxsZG93bi1zdWJtZW51LWNvdmVyLXByZXZpb3VzJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ2EnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJGxpbmsgPSAkKHRoaXMpO1xuICAgICAgJGxpbmsucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcbiAgICAgIGlmKCRsaW5rLmRhdGEoJ3NhdmVkSHJlZicpKXtcbiAgICAgICAgJGxpbmsuYXR0cignaHJlZicsICRsaW5rLmRhdGEoJ3NhdmVkSHJlZicpKS5yZW1vdmVEYXRhKCdzYXZlZEhyZWYnKTtcbiAgICAgIH1lbHNleyByZXR1cm47IH1cbiAgICB9KTtcbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH07XG59XG5cbkRyaWxsZG93bi5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIE1hcmt1cCB1c2VkIGZvciBKUyBnZW5lcmF0ZWQgYmFjayBidXR0b24uIFByZXBlbmRlZCAgb3IgYXBwZW5kZWQgKHNlZSBiYWNrQnV0dG9uUG9zaXRpb24pIHRvIHN1Ym1lbnUgbGlzdHMgYW5kIGRlbGV0ZWQgb24gYGRlc3Ryb3lgIG1ldGhvZCwgJ2pzLWRyaWxsZG93bi1iYWNrJyBjbGFzcyByZXF1aXJlZC4gUmVtb3ZlIHRoZSBiYWNrc2xhc2ggKGBcXGApIGlmIGNvcHkgYW5kIHBhc3RpbmcuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJzxsaSBjbGFzcz1cImpzLWRyaWxsZG93bi1iYWNrXCI+PGEgdGFiaW5kZXg9XCIwXCI+QmFjazwvYT48L2xpPidcbiAgICovXG4gIGJhY2tCdXR0b246ICc8bGkgY2xhc3M9XCJqcy1kcmlsbGRvd24tYmFja1wiPjxhIHRhYmluZGV4PVwiMFwiPkJhY2s8L2E+PC9saT4nLFxuICAvKipcbiAgICogUG9zaXRpb24gdGhlIGJhY2sgYnV0dG9uIGVpdGhlciBhdCB0aGUgdG9wIG9yIGJvdHRvbSBvZiBkcmlsbGRvd24gc3VibWVudXMuIENhbiBiZSBgJ2xlZnQnYCBvciBgJ2JvdHRvbSdgLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0IHRvcFxuICAgKi9cbiAgYmFja0J1dHRvblBvc2l0aW9uOiAndG9wJyxcbiAgLyoqXG4gICAqIE1hcmt1cCB1c2VkIHRvIHdyYXAgZHJpbGxkb3duIG1lbnUuIFVzZSBhIGNsYXNzIG5hbWUgZm9yIGluZGVwZW5kZW50IHN0eWxpbmc7IHRoZSBKUyBhcHBsaWVkIGNsYXNzOiBgaXMtZHJpbGxkb3duYCBpcyByZXF1aXJlZC4gUmVtb3ZlIHRoZSBiYWNrc2xhc2ggKGBcXGApIGlmIGNvcHkgYW5kIHBhc3RpbmcuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJzxkaXY+PC9kaXY+J1xuICAgKi9cbiAgd3JhcHBlcjogJzxkaXY+PC9kaXY+JyxcbiAgLyoqXG4gICAqIEFkZHMgdGhlIHBhcmVudCBsaW5rIHRvIHRoZSBzdWJtZW51LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgcGFyZW50TGluazogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgbWVudSB0byByZXR1cm4gdG8gcm9vdCBsaXN0IG9uIGJvZHkgY2xpY2suXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIG1lbnUgdG8gYXV0byBhZGp1c3QgaGVpZ2h0LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYXV0b0hlaWdodDogZmFsc2UsXG4gIC8qKlxuICAgKiBBbmltYXRlIHRoZSBhdXRvIGFkanVzdCBoZWlnaHQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhbmltYXRlSGVpZ2h0OiBmYWxzZSxcbiAgLyoqXG4gICAqIFNjcm9sbCB0byB0aGUgdG9wIG9mIHRoZSBtZW51IGFmdGVyIG9wZW5pbmcgYSBzdWJtZW51IG9yIG5hdmlnYXRpbmcgYmFjayB1c2luZyB0aGUgbWVudSBiYWNrIGJ1dHRvblxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgc2Nyb2xsVG9wOiBmYWxzZSxcbiAgLyoqXG4gICAqIFN0cmluZyBqcXVlcnkgc2VsZWN0b3IgKGZvciBleGFtcGxlICdib2R5Jykgb2YgZWxlbWVudCB0byB0YWtlIG9mZnNldCgpLnRvcCBmcm9tLCBpZiBlbXB0eSBzdHJpbmcgdGhlIGRyaWxsZG93biBtZW51IG9mZnNldCgpLnRvcCBpcyB0YWtlblxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICcnXG4gICAqL1xuICBzY3JvbGxUb3BFbGVtZW50OiAnJyxcbiAgLyoqXG4gICAqIFNjcm9sbFRvcCBvZmZzZXRcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAwXG4gICAqL1xuICBzY3JvbGxUb3BPZmZzZXQ6IDAsXG4gIC8qKlxuICAgKiBTY3JvbGwgYW5pbWF0aW9uIGR1cmF0aW9uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgNTAwXG4gICAqL1xuICBhbmltYXRpb25EdXJhdGlvbjogNTAwLFxuICAvKipcbiAgICogU2Nyb2xsIGFuaW1hdGlvbiBlYXNpbmcuIENhbiBiZSBgJ3N3aW5nJ2Agb3IgYCdsaW5lYXInYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAc2VlIHtAbGluayBodHRwczovL2FwaS5qcXVlcnkuY29tL2FuaW1hdGV8SlF1ZXJ5IGFuaW1hdGV9XG4gICAqIEBkZWZhdWx0ICdzd2luZydcbiAgICovXG4gIGFuaW1hdGlvbkVhc2luZzogJ3N3aW5nJ1xuICAvLyBob2xkT3BlbjogZmFsc2Vcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihEcmlsbGRvd24sICdEcmlsbGRvd24nKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIERyb3Bkb3duTWVudSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uZHJvcGRvd24tbWVudVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5ib3hcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubmVzdFxuICovXG5cbmNsYXNzIERyb3Bkb3duTWVudSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIERyb3Bkb3duTWVudS5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBEcm9wZG93bk1lbnUjaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgZHJvcGRvd24gbWVudS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBEcm9wZG93bk1lbnUuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIEZvdW5kYXRpb24uTmVzdC5GZWF0aGVyKHRoaXMuJGVsZW1lbnQsICdkcm9wZG93bicpO1xuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0Ryb3Bkb3duTWVudScpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ0Ryb3Bkb3duTWVudScsIHtcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcbiAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICdBUlJPV19VUCc6ICd1cCcsXG4gICAgICAnQVJST1dfRE9XTic6ICdkb3duJyxcbiAgICAgICdBUlJPV19MRUZUJzogJ3ByZXZpb3VzJyxcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHBsdWdpbiwgYW5kIGNhbGxzIF9wcmVwYXJlTWVudVxuICAgKiBAcHJpdmF0ZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBzdWJzID0gdGhpcy4kZWxlbWVudC5maW5kKCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpO1xuICAgIHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpLmFkZENsYXNzKCdmaXJzdC1zdWInKTtcblxuICAgIHRoaXMuJG1lbnVJdGVtcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW3JvbGU9XCJtZW51aXRlbVwiXScpO1xuICAgIHRoaXMuJHRhYnMgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCdbcm9sZT1cIm1lbnVpdGVtXCJdJyk7XG4gICAgdGhpcy4kdGFicy5maW5kKCd1bC5pcy1kcm9wZG93bi1zdWJtZW51JykuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnZlcnRpY2FsQ2xhc3MpO1xuXG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3ModGhpcy5vcHRpb25zLnJpZ2h0Q2xhc3MpIHx8IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdyaWdodCcgfHwgRm91bmRhdGlvbi5ydGwoKSB8fCB0aGlzLiRlbGVtZW50LnBhcmVudHMoJy50b3AtYmFyLXJpZ2h0JykuaXMoJyonKSkge1xuICAgICAgdGhpcy5vcHRpb25zLmFsaWdubWVudCA9ICdyaWdodCc7XG4gICAgICBzdWJzLmFkZENsYXNzKCdvcGVucy1sZWZ0Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1YnMuYWRkQ2xhc3MoJ29wZW5zLXJpZ2h0Jyk7XG4gICAgfVxuICAgIHRoaXMuY2hhbmdlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuICB9O1xuXG4gIF9pc1ZlcnRpY2FsKCkge1xuICAgIHJldHVybiB0aGlzLiR0YWJzLmNzcygnZGlzcGxheScpID09PSAnYmxvY2snO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIGVsZW1lbnRzIHdpdGhpbiB0aGUgbWVudVxuICAgKiBAcHJpdmF0ZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgaGFzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgfHwgKHR5cGVvZiB3aW5kb3cub250b3VjaHN0YXJ0ICE9PSAndW5kZWZpbmVkJyksXG4gICAgICAgIHBhckNsYXNzID0gJ2lzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JztcblxuICAgIC8vIHVzZWQgZm9yIG9uQ2xpY2sgYW5kIGluIHRoZSBrZXlib2FyZCBoYW5kbGVyc1xuICAgIHZhciBoYW5kbGVDbGlja0ZuID0gZnVuY3Rpb24oZSkge1xuICAgICAgdmFyICRlbGVtID0gJChlLnRhcmdldCkucGFyZW50c1VudGlsKCd1bCcsIGAuJHtwYXJDbGFzc31gKSxcbiAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyksXG4gICAgICAgICAgaGFzQ2xpY2tlZCA9ICRlbGVtLmF0dHIoJ2RhdGEtaXMtY2xpY2snKSA9PT0gJ3RydWUnLFxuICAgICAgICAgICRzdWIgPSAkZWxlbS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKTtcblxuICAgICAgaWYgKGhhc1N1Yikge1xuICAgICAgICBpZiAoaGFzQ2xpY2tlZCkge1xuICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgfHwgKCFfdGhpcy5vcHRpb25zLmNsaWNrT3BlbiAmJiAhaGFzVG91Y2gpIHx8IChfdGhpcy5vcHRpb25zLmZvcmNlRm9sbG93ICYmIGhhc1RvdWNoKSkgeyByZXR1cm47IH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIF90aGlzLl9zaG93KCRzdWIpO1xuICAgICAgICAgICRlbGVtLmFkZCgkZWxlbS5wYXJlbnRzVW50aWwoX3RoaXMuJGVsZW1lbnQsIGAuJHtwYXJDbGFzc31gKSkuYXR0cignZGF0YS1pcy1jbGljaycsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xpY2tPcGVuIHx8IGhhc1RvdWNoKSB7XG4gICAgICB0aGlzLiRtZW51SXRlbXMub24oJ2NsaWNrLnpmLmRyb3Bkb3dubWVudSB0b3VjaHN0YXJ0LnpmLmRyb3Bkb3dubWVudScsIGhhbmRsZUNsaWNrRm4pO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBMZWFmIGVsZW1lbnQgQ2xpY2tzXG4gICAgaWYoX3RoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2tJbnNpZGUpe1xuICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdjbGljay56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XG4gICAgICAgIGlmKCFoYXNTdWIpe1xuICAgICAgICAgIF90aGlzLl9oaWRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5vcHRpb25zLmRpc2FibGVIb3Zlcikge1xuICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdtb3VzZWVudGVyLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKTtcblxuICAgICAgICBpZiAoaGFzU3ViKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KCRlbGVtLmRhdGEoJ19kZWxheScpKTtcbiAgICAgICAgICAkZWxlbS5kYXRhKCdfZGVsYXknLCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMuX3Nob3coJGVsZW0uY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51JykpO1xuICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuaG92ZXJEZWxheSkpO1xuICAgICAgICB9XG4gICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XG4gICAgICAgIGlmIChoYXNTdWIgJiYgX3RoaXMub3B0aW9ucy5hdXRvY2xvc2UpIHtcbiAgICAgICAgICBpZiAoJGVsZW0uYXR0cignZGF0YS1pcy1jbGljaycpID09PSAndHJ1ZScgJiYgX3RoaXMub3B0aW9ucy5jbGlja09wZW4pIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgICBjbGVhclRpbWVvdXQoJGVsZW0uZGF0YSgnX2RlbGF5JykpO1xuICAgICAgICAgICRlbGVtLmRhdGEoJ19kZWxheScsIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbSk7XG4gICAgICAgICAgfSwgX3RoaXMub3B0aW9ucy5jbG9zaW5nVGltZSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdrZXlkb3duLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciAkZWxlbWVudCA9ICQoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCAnW3JvbGU9XCJtZW51aXRlbVwiXScpLFxuICAgICAgICAgIGlzVGFiID0gX3RoaXMuJHRhYnMuaW5kZXgoJGVsZW1lbnQpID4gLTEsXG4gICAgICAgICAgJGVsZW1lbnRzID0gaXNUYWIgPyBfdGhpcy4kdGFicyA6ICRlbGVtZW50LnNpYmxpbmdzKCdsaScpLmFkZCgkZWxlbWVudCksXG4gICAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAgICRuZXh0RWxlbWVudDtcblxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoaS0xKTtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoaSsxKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbmV4dFNpYmxpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCEkZWxlbWVudC5pcygnOmxhc3QtY2hpbGQnKSkge1xuICAgICAgICAgICRuZXh0RWxlbWVudC5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9LCBwcmV2U2libGluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkcHJldkVsZW1lbnQuY2hpbGRyZW4oJ2E6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9LCBvcGVuU3ViID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkc3ViID0gJGVsZW1lbnQuY2hpbGRyZW4oJ3VsLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKTtcbiAgICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICAgX3RoaXMuX3Nob3coJHN1Yik7XG4gICAgICAgICAgJGVsZW1lbnQuZmluZCgnbGkgPiBhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0gZWxzZSB7IHJldHVybjsgfVxuICAgICAgfSwgY2xvc2VTdWIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy9pZiAoJGVsZW1lbnQuaXMoJzpmaXJzdC1jaGlsZCcpKSB7XG4gICAgICAgIHZhciBjbG9zZSA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5wYXJlbnQoJ2xpJyk7XG4gICAgICAgIGNsb3NlLmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgX3RoaXMuX2hpZGUoY2xvc2UpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIC8vfVxuICAgICAgfTtcbiAgICAgIHZhciBmdW5jdGlvbnMgPSB7XG4gICAgICAgIG9wZW46IG9wZW5TdWIsXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfdGhpcy5faGlkZShfdGhpcy4kZWxlbWVudCk7XG4gICAgICAgICAgX3RoaXMuJG1lbnVJdGVtcy5maW5kKCdhOmZpcnN0JykuZm9jdXMoKTsgLy8gZm9jdXMgdG8gZmlyc3QgZWxlbWVudFxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgaWYgKGlzVGFiKSB7XG4gICAgICAgIGlmIChfdGhpcy5faXNWZXJ0aWNhbCgpKSB7IC8vIHZlcnRpY2FsIG1lbnVcbiAgICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgeyAvLyByaWdodCBhbGlnbmVkXG4gICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgIHVwOiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgbmV4dDogY2xvc2VTdWIsXG4gICAgICAgICAgICAgIHByZXZpb3VzOiBvcGVuU3ViXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgeyAvLyBsZWZ0IGFsaWduZWRcbiAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICBuZXh0OiBvcGVuU3ViLFxuICAgICAgICAgICAgICBwcmV2aW91czogY2xvc2VTdWJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgLy8gaG9yaXpvbnRhbCBtZW51XG4gICAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIHsgLy8gcmlnaHQgYWxpZ25lZFxuICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgIG5leHQ6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICBwcmV2aW91czogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgIGRvd246IG9wZW5TdWIsXG4gICAgICAgICAgICAgIHVwOiBjbG9zZVN1YlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHsgLy8gbGVmdCBhbGlnbmVkXG4gICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgbmV4dDogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgIHByZXZpb3VzOiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgZG93bjogb3BlblN1YixcbiAgICAgICAgICAgICAgdXA6IGNsb3NlU3ViXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIG5vdCB0YWJzIC0+IG9uZSBzdWJcbiAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIHsgLy8gcmlnaHQgYWxpZ25lZFxuICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgbmV4dDogY2xvc2VTdWIsXG4gICAgICAgICAgICBwcmV2aW91czogb3BlblN1YixcbiAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7IC8vIGxlZnQgYWxpZ25lZFxuICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgbmV4dDogb3BlblN1YixcbiAgICAgICAgICAgIHByZXZpb3VzOiBjbG9zZVN1YixcbiAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdEcm9wZG93bk1lbnUnLCBmdW5jdGlvbnMpO1xuXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBldmVudCBoYW5kbGVyIHRvIHRoZSBib2R5IHRvIGNsb3NlIGFueSBkcm9wZG93bnMgb24gYSBjbGljay5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkQm9keUhhbmRsZXIoKSB7XG4gICAgdmFyICRib2R5ID0gJChkb2N1bWVudC5ib2R5KSxcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuICAgICRib2R5Lm9mZignbW91c2V1cC56Zi5kcm9wZG93bm1lbnUgdG91Y2hlbmQuemYuZHJvcGRvd25tZW51JylcbiAgICAgICAgIC5vbignbW91c2V1cC56Zi5kcm9wZG93bm1lbnUgdG91Y2hlbmQuemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICB2YXIgJGxpbmsgPSBfdGhpcy4kZWxlbWVudC5maW5kKGUudGFyZ2V0KTtcbiAgICAgICAgICAgaWYgKCRsaW5rLmxlbmd0aCkgeyByZXR1cm47IH1cblxuICAgICAgICAgICBfdGhpcy5faGlkZSgpO1xuICAgICAgICAgICAkYm9keS5vZmYoJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScpO1xuICAgICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgYSBkcm9wZG93biBwYW5lLCBhbmQgY2hlY2tzIGZvciBjb2xsaXNpb25zIGZpcnN0LlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHN1YiAtIHVsIGVsZW1lbnQgdGhhdCBpcyBhIHN1Ym1lbnUgdG8gc2hvd1xuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQGZpcmVzIERyb3Bkb3duTWVudSNzaG93XG4gICAqL1xuICBfc2hvdygkc3ViKSB7XG4gICAgdmFyIGlkeCA9IHRoaXMuJHRhYnMuaW5kZXgodGhpcy4kdGFicy5maWx0ZXIoZnVuY3Rpb24oaSwgZWwpIHtcbiAgICAgIHJldHVybiAkKGVsKS5maW5kKCRzdWIpLmxlbmd0aCA+IDA7XG4gICAgfSkpO1xuICAgIHZhciAkc2licyA9ICRzdWIucGFyZW50KCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLnNpYmxpbmdzKCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpO1xuICAgIHRoaXMuX2hpZGUoJHNpYnMsIGlkeCk7XG4gICAgJHN1Yi5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJykuYWRkQ2xhc3MoJ2pzLWRyb3Bkb3duLWFjdGl2ZScpXG4gICAgICAgIC5wYXJlbnQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JykuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgIHZhciBjbGVhciA9IEZvdW5kYXRpb24uQm94LkltTm90VG91Y2hpbmdZb3UoJHN1YiwgbnVsbCwgdHJ1ZSk7XG4gICAgaWYgKCFjbGVhcikge1xuICAgICAgdmFyIG9sZENsYXNzID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ2xlZnQnID8gJy1yaWdodCcgOiAnLWxlZnQnLFxuICAgICAgICAgICRwYXJlbnRMaSA9ICRzdWIucGFyZW50KCcuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICAgICRwYXJlbnRMaS5yZW1vdmVDbGFzcyhgb3BlbnMke29sZENsYXNzfWApLmFkZENsYXNzKGBvcGVucy0ke3RoaXMub3B0aW9ucy5hbGlnbm1lbnR9YCk7XG4gICAgICBjbGVhciA9IEZvdW5kYXRpb24uQm94LkltTm90VG91Y2hpbmdZb3UoJHN1YiwgbnVsbCwgdHJ1ZSk7XG4gICAgICBpZiAoIWNsZWFyKSB7XG4gICAgICAgICRwYXJlbnRMaS5yZW1vdmVDbGFzcyhgb3BlbnMtJHt0aGlzLm9wdGlvbnMuYWxpZ25tZW50fWApLmFkZENsYXNzKCdvcGVucy1pbm5lcicpO1xuICAgICAgfVxuICAgICAgdGhpcy5jaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgJHN1Yi5jc3MoJ3Zpc2liaWxpdHknLCAnJyk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2spIHsgdGhpcy5fYWRkQm9keUhhbmRsZXIoKTsgfVxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIG5ldyBkcm9wZG93biBwYW5lIGlzIHZpc2libGUuXG4gICAgICogQGV2ZW50IERyb3Bkb3duTWVudSNzaG93XG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzaG93LnpmLmRyb3Bkb3dubWVudScsIFskc3ViXSk7XG4gIH1cblxuICAvKipcbiAgICogSGlkZXMgYSBzaW5nbGUsIGN1cnJlbnRseSBvcGVuIGRyb3Bkb3duIHBhbmUsIGlmIHBhc3NlZCBhIHBhcmFtZXRlciwgb3RoZXJ3aXNlLCBoaWRlcyBldmVyeXRoaW5nLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtIC0gZWxlbWVudCB3aXRoIGEgc3VibWVudSB0byBoaWRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSBpbmRleCBvZiB0aGUgJHRhYnMgY29sbGVjdGlvbiB0byBoaWRlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaGlkZSgkZWxlbSwgaWR4KSB7XG4gICAgdmFyICR0b0Nsb3NlO1xuICAgIGlmICgkZWxlbSAmJiAkZWxlbS5sZW5ndGgpIHtcbiAgICAgICR0b0Nsb3NlID0gJGVsZW07XG4gICAgfSBlbHNlIGlmIChpZHggIT09IHVuZGVmaW5lZCkge1xuICAgICAgJHRvQ2xvc2UgPSB0aGlzLiR0YWJzLm5vdChmdW5jdGlvbihpLCBlbCkge1xuICAgICAgICByZXR1cm4gaSA9PT0gaWR4O1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgJHRvQ2xvc2UgPSB0aGlzLiRlbGVtZW50O1xuICAgIH1cbiAgICB2YXIgc29tZXRoaW5nVG9DbG9zZSA9ICR0b0Nsb3NlLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSB8fCAkdG9DbG9zZS5maW5kKCcuaXMtYWN0aXZlJykubGVuZ3RoID4gMDtcblxuICAgIGlmIChzb21ldGhpbmdUb0Nsb3NlKSB7XG4gICAgICAkdG9DbG9zZS5maW5kKCdsaS5pcy1hY3RpdmUnKS5hZGQoJHRvQ2xvc2UpLmF0dHIoe1xuICAgICAgICAnZGF0YS1pcy1jbGljayc6IGZhbHNlXG4gICAgICB9KS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAgICR0b0Nsb3NlLmZpbmQoJ3VsLmpzLWRyb3Bkb3duLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdqcy1kcm9wZG93bi1hY3RpdmUnKTtcblxuICAgICAgaWYgKHRoaXMuY2hhbmdlZCB8fCAkdG9DbG9zZS5maW5kKCdvcGVucy1pbm5lcicpLmxlbmd0aCkge1xuICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnO1xuICAgICAgICAkdG9DbG9zZS5maW5kKCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLmFkZCgkdG9DbG9zZSlcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoYG9wZW5zLWlubmVyIG9wZW5zLSR7dGhpcy5vcHRpb25zLmFsaWdubWVudH1gKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhgb3BlbnMtJHtvbGRDbGFzc31gKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9wZW4gbWVudXMgYXJlIGNsb3NlZC5cbiAgICAgICAqIEBldmVudCBEcm9wZG93bk1lbnUjaGlkZVxuICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2hpZGUuemYuZHJvcGRvd25tZW51JywgWyR0b0Nsb3NlXSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBwbHVnaW4uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRtZW51SXRlbXMub2ZmKCcuemYuZHJvcGRvd25tZW51JykucmVtb3ZlQXR0cignZGF0YS1pcy1jbGljaycpXG4gICAgICAgIC5yZW1vdmVDbGFzcygnaXMtcmlnaHQtYXJyb3cgaXMtbGVmdC1hcnJvdyBpcy1kb3duLWFycm93IG9wZW5zLXJpZ2h0IG9wZW5zLWxlZnQgb3BlbnMtaW5uZXInKTtcbiAgICAkKGRvY3VtZW50LmJvZHkpLm9mZignLnpmLmRyb3Bkb3dubWVudScpO1xuICAgIEZvdW5kYXRpb24uTmVzdC5CdXJuKHRoaXMuJGVsZW1lbnQsICdkcm9wZG93bicpO1xuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgc2V0dGluZ3MgZm9yIHBsdWdpblxuICovXG5Ecm9wZG93bk1lbnUuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBEaXNhbGxvd3MgaG92ZXIgZXZlbnRzIGZyb20gb3BlbmluZyBzdWJtZW51c1xuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGlzYWJsZUhvdmVyOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93IGEgc3VibWVudSB0byBhdXRvbWF0aWNhbGx5IGNsb3NlIG9uIGEgbW91c2VsZWF2ZSBldmVudCwgaWYgbm90IGNsaWNrZWQgb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgYXV0b2Nsb3NlOiB0cnVlLFxuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgdG8gZGVsYXkgb3BlbmluZyBhIHN1Ym1lbnUgb24gaG92ZXIgZXZlbnQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgNTBcbiAgICovXG4gIGhvdmVyRGVsYXk6IDUwLFxuICAvKipcbiAgICogQWxsb3cgYSBzdWJtZW51IHRvIG9wZW4vcmVtYWluIG9wZW4gb24gcGFyZW50IGNsaWNrIGV2ZW50LiBBbGxvd3MgY3Vyc29yIHRvIG1vdmUgYXdheSBmcm9tIG1lbnUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBjbGlja09wZW46IGZhbHNlLFxuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgdG8gZGVsYXkgY2xvc2luZyBhIHN1Ym1lbnUgb24gYSBtb3VzZWxlYXZlIGV2ZW50LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDUwMFxuICAgKi9cblxuICBjbG9zaW5nVGltZTogNTAwLFxuICAvKipcbiAgICogUG9zaXRpb24gb2YgdGhlIG1lbnUgcmVsYXRpdmUgdG8gd2hhdCBkaXJlY3Rpb24gdGhlIHN1Ym1lbnVzIHNob3VsZCBvcGVuLiBIYW5kbGVkIGJ5IEpTLiBDYW4gYmUgYCdsZWZ0J2Agb3IgYCdyaWdodCdgLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICdsZWZ0J1xuICAgKi9cbiAgYWxpZ25tZW50OiAnbGVmdCcsXG4gIC8qKlxuICAgKiBBbGxvdyBjbGlja3Mgb24gdGhlIGJvZHkgdG8gY2xvc2UgYW55IG9wZW4gc3VibWVudXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNsb3NlT25DbGljazogdHJ1ZSxcbiAgLyoqXG4gICAqIEFsbG93IGNsaWNrcyBvbiBsZWFmIGFuY2hvciBsaW5rcyB0byBjbG9zZSBhbnkgb3BlbiBzdWJtZW51cy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY2xvc2VPbkNsaWNrSW5zaWRlOiB0cnVlLFxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB2ZXJ0aWNhbCBvcmllbnRlZCBtZW51cywgRm91bmRhdGlvbiBkZWZhdWx0IGlzIGB2ZXJ0aWNhbGAuIFVwZGF0ZSB0aGlzIGlmIHVzaW5nIHlvdXIgb3duIGNsYXNzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICd2ZXJ0aWNhbCdcbiAgICovXG4gIHZlcnRpY2FsQ2xhc3M6ICd2ZXJ0aWNhbCcsXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHJpZ2h0LXNpZGUgb3JpZW50ZWQgbWVudXMsIEZvdW5kYXRpb24gZGVmYXVsdCBpcyBgYWxpZ24tcmlnaHRgLiBVcGRhdGUgdGhpcyBpZiB1c2luZyB5b3VyIG93biBjbGFzcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnYWxpZ24tcmlnaHQnXG4gICAqL1xuICByaWdodENsYXNzOiAnYWxpZ24tcmlnaHQnLFxuICAvKipcbiAgICogQm9vbGVhbiB0byBmb3JjZSBvdmVyaWRlIHRoZSBjbGlja2luZyBvZiBsaW5rcyB0byBwZXJmb3JtIGRlZmF1bHQgYWN0aW9uLCBvbiBzZWNvbmQgdG91Y2ggZXZlbnQgZm9yIG1vYmlsZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgZm9yY2VGb2xsb3c6IHRydWVcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihEcm9wZG93bk1lbnUsICdEcm9wZG93bk1lbnUnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIE9mZkNhbnZhcyBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ub2ZmY2FudmFzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKi9cblxuY2xhc3MgT2ZmQ2FudmFzIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb2ZmLWNhbnZhcyB3cmFwcGVyLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIE9mZkNhbnZhcyNpbml0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBpbml0aWFsaXplLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIE9mZkNhbnZhcy5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gJCgpO1xuICAgIHRoaXMuJHRyaWdnZXJzID0gJCgpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnT2ZmQ2FudmFzJylcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdPZmZDYW52YXMnLCB7XG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJ1xuICAgIH0pO1xuXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG9mZi1jYW52YXMgd3JhcHBlciBieSBhZGRpbmcgdGhlIGV4aXQgb3ZlcmxheSAoaWYgbmVlZGVkKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgaWQgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoYGlzLXRyYW5zaXRpb24tJHt0aGlzLm9wdGlvbnMudHJhbnNpdGlvbn1gKTtcblxuICAgIC8vIEZpbmQgdHJpZ2dlcnMgdGhhdCBhZmZlY3QgdGhpcyBlbGVtZW50IGFuZCBhZGQgYXJpYS1leHBhbmRlZCB0byB0aGVtXG4gICAgdGhpcy4kdHJpZ2dlcnMgPSAkKGRvY3VtZW50KVxuICAgICAgLmZpbmQoJ1tkYXRhLW9wZW49XCInK2lkKydcIl0sIFtkYXRhLWNsb3NlPVwiJytpZCsnXCJdLCBbZGF0YS10b2dnbGU9XCInK2lkKydcIl0nKVxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKVxuICAgICAgLmF0dHIoJ2FyaWEtY29udHJvbHMnLCBpZCk7XG5cbiAgICAvLyBBZGQgYW4gb3ZlcmxheSBvdmVyIHRoZSBjb250ZW50IGlmIG5lY2Vzc2FyeVxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB2YXIgb3ZlcmxheVBvc2l0aW9uID0gJCh0aGlzLiRlbGVtZW50KS5jc3MoXCJwb3NpdGlvblwiKSA9PT0gJ2ZpeGVkJyA/ICdpcy1vdmVybGF5LWZpeGVkJyA6ICdpcy1vdmVybGF5LWFic29sdXRlJztcbiAgICAgIG92ZXJsYXkuc2V0QXR0cmlidXRlKCdjbGFzcycsICdqcy1vZmYtY2FudmFzLW92ZXJsYXkgJyArIG92ZXJsYXlQb3NpdGlvbik7XG4gICAgICB0aGlzLiRvdmVybGF5ID0gJChvdmVybGF5KTtcbiAgICAgIGlmKG92ZXJsYXlQb3NpdGlvbiA9PT0gJ2lzLW92ZXJsYXktZml4ZWQnKSB7XG4gICAgICAgICQoJ2JvZHknKS5hcHBlbmQodGhpcy4kb3ZlcmxheSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuYXBwZW5kKHRoaXMuJG92ZXJsYXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucy5pc1JldmVhbGVkID0gdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgfHwgbmV3IFJlZ0V4cCh0aGlzLm9wdGlvbnMucmV2ZWFsQ2xhc3MsICdnJykudGVzdCh0aGlzLiRlbGVtZW50WzBdLmNsYXNzTmFtZSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPT09IHRydWUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5yZXZlYWxPbiA9IHRoaXMub3B0aW9ucy5yZXZlYWxPbiB8fCB0aGlzLiRlbGVtZW50WzBdLmNsYXNzTmFtZS5tYXRjaCgvKHJldmVhbC1mb3ItbWVkaXVtfHJldmVhbC1mb3ItbGFyZ2UpL2cpWzBdLnNwbGl0KCctJylbMl07XG4gICAgICB0aGlzLl9zZXRNUUNoZWNrZXIoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgPT09IHRydWUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy50cmFuc2l0aW9uVGltZSA9IHBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUoJCgnW2RhdGEtb2ZmLWNhbnZhc10nKVswXSkudHJhbnNpdGlvbkR1cmF0aW9uKSAqIDEwMDA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIG9mZi1jYW52YXMgd3JhcHBlciBhbmQgdGhlIGV4aXQgb3ZlcmxheS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlciAuemYub2ZmY2FudmFzJykub24oe1xuICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgJ2Nsb3NlLnpmLnRyaWdnZXInOiB0aGlzLmNsb3NlLmJpbmQodGhpcyksXG4gICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpLFxuICAgICAgJ2tleWRvd24uemYub2ZmY2FudmFzJzogdGhpcy5faGFuZGxlS2V5Ym9hcmQuYmluZCh0aGlzKVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID8gdGhpcy4kb3ZlcmxheSA6ICQoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKTtcbiAgICAgICR0YXJnZXQub24oeydjbGljay56Zi5vZmZjYW52YXMnOiB0aGlzLmNsb3NlLmJpbmQodGhpcyl9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBldmVudCBsaXN0ZW5lciBmb3IgZWxlbWVudHMgdGhhdCB3aWxsIHJldmVhbCBhdCBjZXJ0YWluIGJyZWFrcG9pbnRzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3NldE1RQ2hlY2tlcigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChfdGhpcy5vcHRpb25zLnJldmVhbE9uKSkge1xuICAgICAgICBfdGhpcy5yZXZlYWwodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpcy5yZXZlYWwoZmFsc2UpO1xuICAgICAgfVxuICAgIH0pLm9uZSgnbG9hZC56Zi5vZmZjYW52YXMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChfdGhpcy5vcHRpb25zLnJldmVhbE9uKSkge1xuICAgICAgICBfdGhpcy5yZXZlYWwodHJ1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgcmV2ZWFsaW5nL2hpZGluZyB0aGUgb2ZmLWNhbnZhcyBhdCBicmVha3BvaW50cywgbm90IHRoZSBzYW1lIGFzIG9wZW4uXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNSZXZlYWxlZCAtIHRydWUgaWYgZWxlbWVudCBzaG91bGQgYmUgcmV2ZWFsZWQuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgcmV2ZWFsKGlzUmV2ZWFsZWQpIHtcbiAgICB2YXIgJGNsb3NlciA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtY2xvc2VdJyk7XG4gICAgaWYgKGlzUmV2ZWFsZWQpIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHRoaXMuaXNSZXZlYWxlZCA9IHRydWU7XG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZignb3Blbi56Zi50cmlnZ2VyIHRvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gICAgICBpZiAoJGNsb3Nlci5sZW5ndGgpIHsgJGNsb3Nlci5oaWRlKCk7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pc1JldmVhbGVkID0gZmFsc2U7XG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oe1xuICAgICAgICAnb3Blbi56Zi50cmlnZ2VyJzogdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcylcbiAgICAgIH0pO1xuICAgICAgaWYgKCRjbG9zZXIubGVuZ3RoKSB7XG4gICAgICAgICRjbG9zZXIuc2hvdygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyBzY3JvbGxpbmcgb2YgdGhlIGJvZHkgd2hlbiBvZmZjYW52YXMgaXMgb3BlbiBvbiBtb2JpbGUgU2FmYXJpIGFuZCBvdGhlciB0cm91Ymxlc29tZSBicm93c2Vycy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zdG9wU2Nyb2xsaW5nKGV2ZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVGFrZW4gYW5kIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE2ODg5NDQ3L3ByZXZlbnQtZnVsbC1wYWdlLXNjcm9sbGluZy1pb3NcbiAgLy8gT25seSByZWFsbHkgd29ya3MgZm9yIHksIG5vdCBzdXJlIGhvdyB0byBleHRlbmQgdG8geCBvciBpZiB3ZSBuZWVkIHRvLlxuICBfcmVjb3JkU2Nyb2xsYWJsZShldmVudCkge1xuICAgIGxldCBlbGVtID0gdGhpczsgLy8gY2FsbGVkIGZyb20gZXZlbnQgaGFuZGxlciBjb250ZXh0IHdpdGggdGhpcyBhcyBlbGVtXG5cbiAgICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgc2Nyb2xsYWJsZSAoY29udGVudCBvdmVyZmxvd3MpLCB0aGVuLi4uXG4gICAgaWYgKGVsZW0uc2Nyb2xsSGVpZ2h0ICE9PSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgLy8gSWYgd2UncmUgYXQgdGhlIHRvcCwgc2Nyb2xsIGRvd24gb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyB1cFxuICAgICAgaWYgKGVsZW0uc2Nyb2xsVG9wID09PSAwKSB7XG4gICAgICAgIGVsZW0uc2Nyb2xsVG9wID0gMTtcbiAgICAgIH1cbiAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSBib3R0b20sIHNjcm9sbCB1cCBvbmUgcGl4ZWwgdG8gYWxsb3cgc2Nyb2xsaW5nIGRvd25cbiAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgICBlbGVtLnNjcm9sbFRvcCA9IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQgLSAxO1xuICAgICAgfVxuICAgIH1cbiAgICBlbGVtLmFsbG93VXAgPSBlbGVtLnNjcm9sbFRvcCA+IDA7XG4gICAgZWxlbS5hbGxvd0Rvd24gPSBlbGVtLnNjcm9sbFRvcCA8IChlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0KTtcbiAgICBlbGVtLmxhc3RZID0gZXZlbnQub3JpZ2luYWxFdmVudC5wYWdlWTtcbiAgfVxuXG4gIF9zdG9wU2Nyb2xsUHJvcGFnYXRpb24oZXZlbnQpIHtcbiAgICBsZXQgZWxlbSA9IHRoaXM7IC8vIGNhbGxlZCBmcm9tIGV2ZW50IGhhbmRsZXIgY29udGV4dCB3aXRoIHRoaXMgYXMgZWxlbVxuICAgIGxldCB1cCA9IGV2ZW50LnBhZ2VZIDwgZWxlbS5sYXN0WTtcbiAgICBsZXQgZG93biA9ICF1cDtcbiAgICBlbGVtLmxhc3RZID0gZXZlbnQucGFnZVk7XG5cbiAgICBpZigodXAgJiYgZWxlbS5hbGxvd1VwKSB8fCAoZG93biAmJiBlbGVtLmFsbG93RG93bikpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgb2ZmLWNhbnZhcyBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gdHJpZ2dlciAtIGVsZW1lbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG9mZi1jYW52YXMgdG8gb3Blbi5cbiAgICogQGZpcmVzIE9mZkNhbnZhcyNvcGVuZWRcbiAgICovXG4gIG9wZW4oZXZlbnQsIHRyaWdnZXIpIHtcbiAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaXMtb3BlbicpIHx8IHRoaXMuaXNSZXZlYWxlZCkgeyByZXR1cm47IH1cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHRyaWdnZXIpIHtcbiAgICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gdHJpZ2dlcjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICd0b3AnKSB7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VUbyA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHdpbmRvdy5zY3JvbGxUbygwLGRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbnMuXG4gICAgICogQGV2ZW50IE9mZkNhbnZhcyNvcGVuZWRcbiAgICAgKi9cbiAgICBfdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnaXMtb3BlbicpXG5cbiAgICB0aGlzLiR0cmlnZ2Vycy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJylcbiAgICAgICAgLnRyaWdnZXIoJ29wZW5lZC56Zi5vZmZjYW52YXMnKTtcblxuICAgIC8vIElmIGBjb250ZW50U2Nyb2xsYCBpcyBzZXQgdG8gZmFsc2UsIGFkZCBjbGFzcyBhbmQgZGlzYWJsZSBzY3JvbGxpbmcgb24gdG91Y2ggZGV2aWNlcy5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRTY3JvbGwgPT09IGZhbHNlKSB7XG4gICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbicpLm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ3RvdWNoc3RhcnQnLCB0aGlzLl9yZWNvcmRTY3JvbGxhYmxlKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxQcm9wYWdhdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlICYmIHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5hZGRDbGFzcygnaXMtY2xvc2FibGUnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9Gb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKHRoaXMuJGVsZW1lbnQpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuJGVsZW1lbnQuZmluZCgnYSwgYnV0dG9uJykuZXEoMCkuZm9jdXMoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQudHJhcEZvY3VzKHRoaXMuJGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gb3B0aW9uYWwgY2IgdG8gZmlyZSBhZnRlciBjbG9zdXJlLlxuICAgKiBAZmlyZXMgT2ZmQ2FudmFzI2Nsb3NlZFxuICAgKi9cbiAgY2xvc2UoY2IpIHtcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHsgcmV0dXJuOyB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLW9wZW4nKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpXG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9mZi1jYW52YXMgbWVudSBvcGVucy5cbiAgICAgICAqIEBldmVudCBPZmZDYW52YXMjY2xvc2VkXG4gICAgICAgKi9cbiAgICAgICAgLnRyaWdnZXIoJ2Nsb3NlZC56Zi5vZmZjYW52YXMnKTtcblxuICAgIC8vIElmIGBjb250ZW50U2Nyb2xsYCBpcyBzZXQgdG8gZmFsc2UsIHJlbW92ZSBjbGFzcyBhbmQgcmUtZW5hYmxlIHNjcm9sbGluZyBvbiB0b3VjaCBkZXZpY2VzLlxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudFNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnaXMtb2ZmLWNhbnZhcy1vcGVuJykub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCd0b3VjaHN0YXJ0JywgdGhpcy5fcmVjb3JkU2Nyb2xsYWJsZSk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbFByb3BhZ2F0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy12aXNpYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUgJiYgdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy1jbG9zYWJsZScpO1xuICAgIH1cblxuICAgIHRoaXMuJHRyaWdnZXJzLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVsZWFzZUZvY3VzKHRoaXMuJGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbiBvciBjbG9zZWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gbGlzdGVuZXIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxuICAgKi9cbiAgdG9nZ2xlKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSkge1xuICAgICAgdGhpcy5jbG9zZShldmVudCwgdHJpZ2dlcik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5vcGVuKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBrZXlib2FyZCBpbnB1dCB3aGVuIGRldGVjdGVkLiBXaGVuIHRoZSBlc2NhcGUga2V5IGlzIHByZXNzZWQsIHRoZSBvZmYtY2FudmFzIG1lbnUgY2xvc2VzLCBhbmQgZm9jdXMgaXMgcmVzdG9yZWQgdG8gdGhlIGVsZW1lbnQgdGhhdCBvcGVuZWQgdGhlIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2hhbmRsZUtleWJvYXJkKGUpIHtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnT2ZmQ2FudmFzJywge1xuICAgICAgY2xvc2U6ICgpID0+IHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB0aGlzLiRsYXN0VHJpZ2dlci5mb2N1cygpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICBoYW5kbGVkOiAoKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgb2ZmY2FudmFzIHBsdWdpbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpO1xuICAgIHRoaXMuJG92ZXJsYXkub2ZmKCcuemYub2ZmY2FudmFzJyk7XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuT2ZmQ2FudmFzLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQWxsb3cgdGhlIHVzZXIgdG8gY2xpY2sgb3V0c2lkZSBvZiB0aGUgbWVudSB0byBjbG9zZSBpdC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY2xvc2VPbkNsaWNrOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIG92ZXJsYXkgb24gdG9wIG9mIGBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY29udGVudE92ZXJsYXk6IHRydWUsXG5cbiAgLyoqXG4gICAqIEVuYWJsZS9kaXNhYmxlIHNjcm9sbGluZyBvZiB0aGUgbWFpbiBjb250ZW50IHdoZW4gYW4gb2ZmIGNhbnZhcyBwYW5lbCBpcyBvcGVuLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBjb250ZW50U2Nyb2xsOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSBpbiBtcyB0aGUgb3BlbiBhbmQgY2xvc2UgdHJhbnNpdGlvbiByZXF1aXJlcy4gSWYgbm9uZSBzZWxlY3RlZCwgcHVsbHMgZnJvbSBib2R5IHN0eWxlLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDBcbiAgICovXG4gIHRyYW5zaXRpb25UaW1lOiAwLFxuXG4gIC8qKlxuICAgKiBUeXBlIG9mIHRyYW5zaXRpb24gZm9yIHRoZSBvZmZjYW52YXMgbWVudS4gT3B0aW9ucyBhcmUgJ3B1c2gnLCAnZGV0YWNoZWQnIG9yICdzbGlkZScuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgcHVzaFxuICAgKi9cbiAgdHJhbnNpdGlvbjogJ3B1c2gnLFxuXG4gIC8qKlxuICAgKiBGb3JjZSB0aGUgcGFnZSB0byBzY3JvbGwgdG8gdG9wIG9yIGJvdHRvbSBvbiBvcGVuLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHs/c3RyaW5nfVxuICAgKiBAZGVmYXVsdCBudWxsXG4gICAqL1xuICBmb3JjZVRvOiBudWxsLFxuXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgb2ZmY2FudmFzIHRvIHJlbWFpbiBvcGVuIGZvciBjZXJ0YWluIGJyZWFrcG9pbnRzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgaXNSZXZlYWxlZDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEJyZWFrcG9pbnQgYXQgd2hpY2ggdG8gcmV2ZWFsLiBKUyB3aWxsIHVzZSBhIFJlZ0V4cCB0byB0YXJnZXQgc3RhbmRhcmQgY2xhc3NlcywgaWYgY2hhbmdpbmcgY2xhc3NuYW1lcywgcGFzcyB5b3VyIGNsYXNzIHdpdGggdGhlIGByZXZlYWxDbGFzc2Agb3B0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHs/c3RyaW5nfVxuICAgKiBAZGVmYXVsdCBudWxsXG4gICAqL1xuICByZXZlYWxPbjogbnVsbCxcblxuICAvKipcbiAgICogRm9yY2UgZm9jdXMgdG8gdGhlIG9mZmNhbnZhcyBvbiBvcGVuLiBJZiB0cnVlLCB3aWxsIGZvY3VzIHRoZSBvcGVuaW5nIHRyaWdnZXIgb24gY2xvc2UuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGF1dG9Gb2N1czogdHJ1ZSxcblxuICAvKipcbiAgICogQ2xhc3MgdXNlZCB0byBmb3JjZSBhbiBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4uIEZvdW5kYXRpb24gZGVmYXVsdHMgZm9yIHRoaXMgYXJlIGByZXZlYWwtZm9yLWxhcmdlYCAmIGByZXZlYWwtZm9yLW1lZGl1bWAuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgcmV2ZWFsLWZvci1cbiAgICogQHRvZG8gaW1wcm92ZSB0aGUgcmVnZXggdGVzdGluZyBmb3IgdGhpcy5cbiAgICovXG4gIHJldmVhbENsYXNzOiAncmV2ZWFsLWZvci0nLFxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBvcHRpb25hbCBmb2N1cyB0cmFwcGluZyB3aGVuIG9wZW5pbmcgYW4gb2ZmY2FudmFzLiBTZXRzIHRhYmluZGV4IG9mIFtkYXRhLW9mZi1jYW52YXMtY29udGVudF0gdG8gLTEgZm9yIGFjY2Vzc2liaWxpdHkgcHVycG9zZXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICB0cmFwRm9jdXM6IGZhbHNlXG59XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihPZmZDYW52YXMsICdPZmZDYW52YXMnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFJlc3BvbnNpdmVNZW51IG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5yZXNwb25zaXZlTWVudVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKi9cblxuY2xhc3MgUmVzcG9uc2l2ZU1lbnUge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhIHJlc3BvbnNpdmUgbWVudS5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBSZXNwb25zaXZlTWVudSNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYSBkcm9wZG93biBtZW51LlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgdGhpcy5ydWxlcyA9IHRoaXMuJGVsZW1lbnQuZGF0YSgncmVzcG9uc2l2ZS1tZW51Jyk7XG4gICAgdGhpcy5jdXJyZW50TXEgPSBudWxsO1xuICAgIHRoaXMuY3VycmVudFBsdWdpbiA9IG51bGw7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdSZXNwb25zaXZlTWVudScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBNZW51IGJ5IHBhcnNpbmcgdGhlIGNsYXNzZXMgZnJvbSB0aGUgJ2RhdGEtUmVzcG9uc2l2ZU1lbnUnIGF0dHJpYnV0ZSBvbiB0aGUgZWxlbWVudC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICAvLyBUaGUgZmlyc3QgdGltZSBhbiBJbnRlcmNoYW5nZSBwbHVnaW4gaXMgaW5pdGlhbGl6ZWQsIHRoaXMucnVsZXMgaXMgY29udmVydGVkIGZyb20gYSBzdHJpbmcgb2YgXCJjbGFzc2VzXCIgdG8gYW4gb2JqZWN0IG9mIHJ1bGVzXG4gICAgaWYgKHR5cGVvZiB0aGlzLnJ1bGVzID09PSAnc3RyaW5nJykge1xuICAgICAgbGV0IHJ1bGVzVHJlZSA9IHt9O1xuXG4gICAgICAvLyBQYXJzZSBydWxlcyBmcm9tIFwiY2xhc3Nlc1wiIHB1bGxlZCBmcm9tIGRhdGEgYXR0cmlidXRlXG4gICAgICBsZXQgcnVsZXMgPSB0aGlzLnJ1bGVzLnNwbGl0KCcgJyk7XG5cbiAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBldmVyeSBydWxlIGZvdW5kXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBydWxlID0gcnVsZXNbaV0uc3BsaXQoJy0nKTtcbiAgICAgICAgbGV0IHJ1bGVTaXplID0gcnVsZS5sZW5ndGggPiAxID8gcnVsZVswXSA6ICdzbWFsbCc7XG4gICAgICAgIGxldCBydWxlUGx1Z2luID0gcnVsZS5sZW5ndGggPiAxID8gcnVsZVsxXSA6IHJ1bGVbMF07XG5cbiAgICAgICAgaWYgKE1lbnVQbHVnaW5zW3J1bGVQbHVnaW5dICE9PSBudWxsKSB7XG4gICAgICAgICAgcnVsZXNUcmVlW3J1bGVTaXplXSA9IE1lbnVQbHVnaW5zW3J1bGVQbHVnaW5dO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMucnVsZXMgPSBydWxlc1RyZWU7XG4gICAgfVxuXG4gICAgaWYgKCEkLmlzRW1wdHlPYmplY3QodGhpcy5ydWxlcykpIHtcbiAgICAgIHRoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgfVxuICAgIC8vIEFkZCBkYXRhLW11dGF0ZSBzaW5jZSBjaGlsZHJlbiBtYXkgbmVlZCBpdC5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtbXV0YXRlJywgKHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1tdXRhdGUnKSB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdyZXNwb25zaXZlLW1lbnUnKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgdGhlIE1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbigpIHtcbiAgICAgIF90aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgIH0pO1xuICAgIC8vICQod2luZG93KS5vbigncmVzaXplLnpmLlJlc3BvbnNpdmVNZW51JywgZnVuY3Rpb24oKSB7XG4gICAgLy8gICBfdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICAvLyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIGN1cnJlbnQgc2NyZWVuIHdpZHRoIGFnYWluc3QgYXZhaWxhYmxlIG1lZGlhIHF1ZXJpZXMuIElmIHRoZSBtZWRpYSBxdWVyeSBoYXMgY2hhbmdlZCwgYW5kIHRoZSBwbHVnaW4gbmVlZGVkIGhhcyBjaGFuZ2VkLCB0aGUgcGx1Z2lucyB3aWxsIHN3YXAgb3V0LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jaGVja01lZGlhUXVlcmllcygpIHtcbiAgICB2YXIgbWF0Y2hlZE1xLCBfdGhpcyA9IHRoaXM7XG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcnVsZSBhbmQgZmluZCB0aGUgbGFzdCBtYXRjaGluZyBydWxlXG4gICAgJC5lYWNoKHRoaXMucnVsZXMsIGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5hdExlYXN0KGtleSkpIHtcbiAgICAgICAgbWF0Y2hlZE1xID0ga2V5O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gTm8gbWF0Y2g/IE5vIGRpY2VcbiAgICBpZiAoIW1hdGNoZWRNcSkgcmV0dXJuO1xuXG4gICAgLy8gUGx1Z2luIGFscmVhZHkgaW5pdGlhbGl6ZWQ/IFdlIGdvb2RcbiAgICBpZiAodGhpcy5jdXJyZW50UGx1Z2luIGluc3RhbmNlb2YgdGhpcy5ydWxlc1ttYXRjaGVkTXFdLnBsdWdpbikgcmV0dXJuO1xuXG4gICAgLy8gUmVtb3ZlIGV4aXN0aW5nIHBsdWdpbi1zcGVjaWZpYyBDU1MgY2xhc3Nlc1xuICAgICQuZWFjaChNZW51UGx1Z2lucywgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3ModmFsdWUuY3NzQ2xhc3MpO1xuICAgIH0pO1xuXG4gICAgLy8gQWRkIHRoZSBDU1MgY2xhc3MgZm9yIHRoZSBuZXcgcGx1Z2luXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLnJ1bGVzW21hdGNoZWRNcV0uY3NzQ2xhc3MpO1xuXG4gICAgLy8gQ3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBuZXcgcGx1Z2luXG4gICAgaWYgKHRoaXMuY3VycmVudFBsdWdpbikgdGhpcy5jdXJyZW50UGx1Z2luLmRlc3Ryb3koKTtcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4gPSBuZXcgdGhpcy5ydWxlc1ttYXRjaGVkTXFdLnBsdWdpbih0aGlzLiRlbGVtZW50LCB7fSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGluc3RhbmNlIG9mIHRoZSBjdXJyZW50IHBsdWdpbiBvbiB0aGlzIGVsZW1lbnQsIGFzIHdlbGwgYXMgdGhlIHdpbmRvdyByZXNpemUgaGFuZGxlciB0aGF0IHN3aXRjaGVzIHRoZSBwbHVnaW5zIG91dC5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY3VycmVudFBsdWdpbi5kZXN0cm95KCk7XG4gICAgJCh3aW5kb3cpLm9mZignLnpmLlJlc3BvbnNpdmVNZW51Jyk7XG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblJlc3BvbnNpdmVNZW51LmRlZmF1bHRzID0ge307XG5cbi8vIFRoZSBwbHVnaW4gbWF0Y2hlcyB0aGUgcGx1Z2luIGNsYXNzZXMgd2l0aCB0aGVzZSBwbHVnaW4gaW5zdGFuY2VzLlxudmFyIE1lbnVQbHVnaW5zID0ge1xuICBkcm9wZG93bjoge1xuICAgIGNzc0NsYXNzOiAnZHJvcGRvd24nLFxuICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snZHJvcGRvd24tbWVudSddIHx8IG51bGxcbiAgfSxcbiBkcmlsbGRvd246IHtcbiAgICBjc3NDbGFzczogJ2RyaWxsZG93bicsXG4gICAgcGx1Z2luOiBGb3VuZGF0aW9uLl9wbHVnaW5zWydkcmlsbGRvd24nXSB8fCBudWxsXG4gIH0sXG4gIGFjY29yZGlvbjoge1xuICAgIGNzc0NsYXNzOiAnYWNjb3JkaW9uLW1lbnUnLFxuICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snYWNjb3JkaW9uLW1lbnUnXSB8fCBudWxsXG4gIH1cbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihSZXNwb25zaXZlTWVudSwgJ1Jlc3BvbnNpdmVNZW51Jyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuRm91bmRhdGlvbi5Cb3ggPSB7XG4gIEltTm90VG91Y2hpbmdZb3U6IEltTm90VG91Y2hpbmdZb3UsXG4gIEdldERpbWVuc2lvbnM6IEdldERpbWVuc2lvbnMsXG4gIEdldE9mZnNldHM6IEdldE9mZnNldHNcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgZGltZW5zaW9ucyBvZiBhbiBlbGVtZW50IHRvIGEgY29udGFpbmVyIGFuZCBkZXRlcm1pbmVzIGNvbGxpc2lvbiBldmVudHMgd2l0aCBjb250YWluZXIuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB0ZXN0IGZvciBjb2xsaXNpb25zLlxuICogQHBhcmFtIHtqUXVlcnl9IHBhcmVudCAtIGpRdWVyeSBvYmplY3QgdG8gdXNlIGFzIGJvdW5kaW5nIGNvbnRhaW5lci5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbHJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgbGVmdCBhbmQgcmlnaHQgdmFsdWVzIG9ubHkuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRiT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIHRvcCBhbmQgYm90dG9tIHZhbHVlcyBvbmx5LlxuICogQGRlZmF1bHQgaWYgbm8gcGFyZW50IG9iamVjdCBwYXNzZWQsIGRldGVjdHMgY29sbGlzaW9ucyB3aXRoIGB3aW5kb3dgLlxuICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiBjb2xsaXNpb24gZnJlZSwgZmFsc2UgaWYgYSBjb2xsaXNpb24gaW4gYW55IGRpcmVjdGlvbi5cbiAqL1xuZnVuY3Rpb24gSW1Ob3RUb3VjaGluZ1lvdShlbGVtZW50LCBwYXJlbnQsIGxyT25seSwgdGJPbmx5KSB7XG4gIHZhciBlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodDtcblxuICBpZiAocGFyZW50KSB7XG4gICAgdmFyIHBhckRpbXMgPSBHZXREaW1lbnNpb25zKHBhcmVudCk7XG5cbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gcGFyRGltcy5oZWlnaHQgKyBwYXJEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gcGFyRGltcy53aWR0aCArIHBhckRpbXMub2Zmc2V0LmxlZnQpO1xuICB9XG4gIGVsc2Uge1xuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0ICsgZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IGVsZURpbXMud2luZG93RGltcy53aWR0aCk7XG4gIH1cblxuICB2YXIgYWxsRGlycyA9IFtib3R0b20sIHRvcCwgbGVmdCwgcmlnaHRdO1xuXG4gIGlmIChsck9ubHkpIHtcbiAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQgPT09IHRydWU7XG4gIH1cblxuICBpZiAodGJPbmx5KSB7XG4gICAgcmV0dXJuIHRvcCA9PT0gYm90dG9tID09PSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGFsbERpcnMuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xufTtcblxuLyoqXG4gKiBVc2VzIG5hdGl2ZSBtZXRob2RzIHRvIHJldHVybiBhbiBvYmplY3Qgb2YgZGltZW5zaW9uIHZhbHVlcy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnkgfHwgSFRNTH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3Qgb3IgRE9NIGVsZW1lbnQgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGltZW5zaW9ucy4gQ2FuIGJlIGFueSBlbGVtZW50IG90aGVyIHRoYXQgZG9jdW1lbnQgb3Igd2luZG93LlxuICogQHJldHVybnMge09iamVjdH0gLSBuZXN0ZWQgb2JqZWN0IG9mIGludGVnZXIgcGl4ZWwgdmFsdWVzXG4gKiBUT0RPIC0gaWYgZWxlbWVudCBpcyB3aW5kb3csIHJldHVybiBvbmx5IHRob3NlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gR2V0RGltZW5zaW9ucyhlbGVtLCB0ZXN0KXtcbiAgZWxlbSA9IGVsZW0ubGVuZ3RoID8gZWxlbVswXSA6IGVsZW07XG5cbiAgaWYgKGVsZW0gPT09IHdpbmRvdyB8fCBlbGVtID09PSBkb2N1bWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO1xuICB9XG5cbiAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgcGFyUmVjdCA9IGVsZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgIHdpblggPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgIG9mZnNldDoge1xuICAgICAgdG9wOiByZWN0LnRvcCArIHdpblksXG4gICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5YXG4gICAgfSxcbiAgICBwYXJlbnREaW1zOiB7XG4gICAgICB3aWR0aDogcGFyUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogcGFyUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiBwYXJSZWN0LnRvcCArIHdpblksXG4gICAgICAgIGxlZnQ6IHBhclJlY3QubGVmdCArIHdpblhcbiAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd0RpbXM6IHtcbiAgICAgIHdpZHRoOiB3aW5SZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB3aW5SZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHdpblksXG4gICAgICAgIGxlZnQ6IHdpblhcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBvZiB0b3AgYW5kIGxlZnQgaW50ZWdlciBwaXhlbCB2YWx1ZXMgZm9yIGR5bmFtaWNhbGx5IHJlbmRlcmVkIGVsZW1lbnRzLFxuICogc3VjaCBhczogVG9vbHRpcCwgUmV2ZWFsLCBhbmQgRHJvcGRvd25cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCBiZWluZyBwb3NpdGlvbmVkLlxuICogQHBhcmFtIHtqUXVlcnl9IGFuY2hvciAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50J3MgYW5jaG9yIHBvaW50LlxuICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gYSBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGRlc2lyZWQgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIHJlbGF0aXZlIHRvIGl0J3MgYW5jaG9yXG4gKiBAcGFyYW0ge051bWJlcn0gdk9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCB2ZXJ0aWNhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IGhPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgaG9yaXpvbnRhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtCb29sZWFufSBpc092ZXJmbG93IC0gaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQsIHNldHMgdG8gdHJ1ZSB0byBkZWZhdWx0IHRoZSBlbGVtZW50IHRvIGZ1bGwgd2lkdGggLSBhbnkgZGVzaXJlZCBvZmZzZXQuXG4gKiBUT0RPIGFsdGVyL3Jld3JpdGUgdG8gd29yayB3aXRoIGBlbWAgdmFsdWVzIGFzIHdlbGwvaW5zdGVhZCBvZiBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gR2V0T2Zmc2V0cyhlbGVtZW50LCBhbmNob3IsIHBvc2l0aW9uLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KSB7XG4gIHZhciAkZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICAkYW5jaG9yRGltcyA9IGFuY2hvciA/IEdldERpbWVuc2lvbnMoYW5jaG9yKSA6IG51bGw7XG5cbiAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgIGNhc2UgJ3RvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIHRvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IGlzT3ZlcmZsb3cgPyBoT2Zmc2V0IDogKCgkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICgkYW5jaG9yRGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGxlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciByaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCArIDEsXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXInOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQgKyAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpLFxuICAgICAgICB0b3A6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyAoJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JldmVhbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICRlbGVEaW1zLndpZHRoKSAvIDIsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgdk9mZnNldFxuICAgICAgfVxuICAgIGNhc2UgJ3JldmVhbCBmdWxsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCAtICRlbGVEaW1zLndpZHRoLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IChGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICB9XG59XG5cbn0oalF1ZXJ5KTtcbiIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICogVGhpcyB1dGlsIHdhcyBjcmVhdGVkIGJ5IE1hcml1cyBPbGJlcnR6ICpcbiAqIFBsZWFzZSB0aGFuayBNYXJpdXMgb24gR2l0SHViIC9vd2xiZXJ0eiAqXG4gKiBvciB0aGUgd2ViIGh0dHA6Ly93d3cubWFyaXVzb2xiZXJ0ei5kZS8gKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3Qga2V5Q29kZXMgPSB7XG4gIDk6ICdUQUInLFxuICAxMzogJ0VOVEVSJyxcbiAgMjc6ICdFU0NBUEUnLFxuICAzMjogJ1NQQUNFJyxcbiAgMzc6ICdBUlJPV19MRUZUJyxcbiAgMzg6ICdBUlJPV19VUCcsXG4gIDM5OiAnQVJST1dfUklHSFQnLFxuICA0MDogJ0FSUk9XX0RPV04nXG59XG5cbnZhciBjb21tYW5kcyA9IHt9XG5cbnZhciBLZXlib2FyZCA9IHtcbiAga2V5czogZ2V0S2V5Q29kZXMoa2V5Q29kZXMpLFxuXG4gIC8qKlxuICAgKiBQYXJzZXMgdGhlIChrZXlib2FyZCkgZXZlbnQgYW5kIHJldHVybnMgYSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIGl0cyBrZXlcbiAgICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcmV0dXJuIFN0cmluZyBrZXkgLSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIHRoZSBrZXkgcHJlc3NlZFxuICAgKi9cbiAgcGFyc2VLZXkoZXZlbnQpIHtcbiAgICB2YXIga2V5ID0ga2V5Q29kZXNbZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZV0gfHwgU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC53aGljaCkudG9VcHBlckNhc2UoKTtcblxuICAgIC8vIFJlbW92ZSB1bi1wcmludGFibGUgY2hhcmFjdGVycywgZS5nLiBmb3IgYGZyb21DaGFyQ29kZWAgY2FsbHMgZm9yIENUUkwgb25seSBldmVudHNcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXFxXKy8sICcnKTtcblxuICAgIGlmIChldmVudC5zaGlmdEtleSkga2V5ID0gYFNISUZUXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkpIGtleSA9IGBDVFJMXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmFsdEtleSkga2V5ID0gYEFMVF8ke2tleX1gO1xuXG4gICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHVuZGVyc2NvcmUsIGluIGNhc2Ugb25seSBtb2RpZmllcnMgd2VyZSB1c2VkIChlLmcuIG9ubHkgYENUUkxfQUxUYClcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXyQvLCAnJyk7XG5cbiAgICByZXR1cm4ga2V5O1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBnaXZlbiAoa2V5Ym9hcmQpIGV2ZW50XG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQncyBuYW1lLCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHBhcmFtIHtPYmplY3RzfSBmdW5jdGlvbnMgLSBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyB0aGF0IGFyZSB0byBiZSBleGVjdXRlZFxuICAgKi9cbiAgaGFuZGxlS2V5KGV2ZW50LCBjb21wb25lbnQsIGZ1bmN0aW9ucykge1xuICAgIHZhciBjb21tYW5kTGlzdCA9IGNvbW1hbmRzW2NvbXBvbmVudF0sXG4gICAgICBrZXlDb2RlID0gdGhpcy5wYXJzZUtleShldmVudCksXG4gICAgICBjbWRzLFxuICAgICAgY29tbWFuZCxcbiAgICAgIGZuO1xuXG4gICAgaWYgKCFjb21tYW5kTGlzdCkgcmV0dXJuIGNvbnNvbGUud2FybignQ29tcG9uZW50IG5vdCBkZWZpbmVkIScpO1xuXG4gICAgaWYgKHR5cGVvZiBjb21tYW5kTGlzdC5sdHIgPT09ICd1bmRlZmluZWQnKSB7IC8vIHRoaXMgY29tcG9uZW50IGRvZXMgbm90IGRpZmZlcmVudGlhdGUgYmV0d2VlbiBsdHIgYW5kIHJ0bFxuICAgICAgICBjbWRzID0gY29tbWFuZExpc3Q7IC8vIHVzZSBwbGFpbiBsaXN0XG4gICAgfSBlbHNlIHsgLy8gbWVyZ2UgbHRyIGFuZCBydGw6IGlmIGRvY3VtZW50IGlzIHJ0bCwgcnRsIG92ZXJ3cml0ZXMgbHRyIGFuZCB2aWNlIHZlcnNhXG4gICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0Lmx0ciwgY29tbWFuZExpc3QucnRsKTtcblxuICAgICAgICBlbHNlIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QucnRsLCBjb21tYW5kTGlzdC5sdHIpO1xuICAgIH1cbiAgICBjb21tYW5kID0gY21kc1trZXlDb2RlXTtcblxuICAgIGZuID0gZnVuY3Rpb25zW2NvbW1hbmRdO1xuICAgIGlmIChmbiAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiAgaWYgZXhpc3RzXG4gICAgICB2YXIgcmV0dXJuVmFsdWUgPSBmbi5hcHBseSgpO1xuICAgICAgaWYgKGZ1bmN0aW9ucy5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMuaGFuZGxlZChyZXR1cm5WYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChmdW5jdGlvbnMudW5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMudW5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgbm90IGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMudW5oYW5kbGVkKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgZ2l2ZW4gYCRlbGVtZW50YFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHNlYXJjaCB3aXRoaW5cbiAgICogQHJldHVybiB7alF1ZXJ5fSAkZm9jdXNhYmxlIC0gYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gYCRlbGVtZW50YFxuICAgKi9cbiAgZmluZEZvY3VzYWJsZSgkZWxlbWVudCkge1xuICAgIGlmKCEkZWxlbWVudCkge3JldHVybiBmYWxzZTsgfVxuICAgIHJldHVybiAkZWxlbWVudC5maW5kKCdhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSwgYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XSwgKltjb250ZW50ZWRpdGFibGVdJykuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEkKHRoaXMpLmlzKCc6dmlzaWJsZScpIHx8ICQodGhpcykuYXR0cigndGFiaW5kZXgnKSA8IDApIHsgcmV0dXJuIGZhbHNlOyB9IC8vb25seSBoYXZlIHZpc2libGUgZWxlbWVudHMgYW5kIHRob3NlIHRoYXQgaGF2ZSBhIHRhYmluZGV4IGdyZWF0ZXIgb3IgZXF1YWwgMFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbXBvbmVudCBuYW1lIG5hbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50LCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHJldHVybiBTdHJpbmcgY29tcG9uZW50TmFtZVxuICAgKi9cblxuICByZWdpc3Rlcihjb21wb25lbnROYW1lLCBjbWRzKSB7XG4gICAgY29tbWFuZHNbY29tcG9uZW50TmFtZV0gPSBjbWRzO1xuICB9LCAgXG5cbiAgLyoqXG4gICAqIFRyYXBzIHRoZSBmb2N1cyBpbiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byB0cmFwIHRoZSBmb3VjcyBpbnRvLlxuICAgKi9cbiAgdHJhcEZvY3VzKCRlbGVtZW50KSB7XG4gICAgdmFyICRmb2N1c2FibGUgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUoJGVsZW1lbnQpLFxuICAgICAgICAkZmlyc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKDApLFxuICAgICAgICAkbGFzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoLTEpO1xuXG4gICAgJGVsZW1lbnQub24oJ2tleWRvd24uemYudHJhcGZvY3VzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgPT09ICRsYXN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkZmlyc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGZpcnN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnU0hJRlRfVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkbGFzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICAvKipcbiAgICogUmVsZWFzZXMgdGhlIHRyYXBwZWQgZm9jdXMgZnJvbSB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byByZWxlYXNlIHRoZSBmb2N1cyBmb3IuXG4gICAqL1xuICByZWxlYXNlRm9jdXMoJGVsZW1lbnQpIHtcbiAgICAkZWxlbWVudC5vZmYoJ2tleWRvd24uemYudHJhcGZvY3VzJyk7XG4gIH1cbn1cblxuLypcbiAqIENvbnN0YW50cyBmb3IgZWFzaWVyIGNvbXBhcmluZy5cbiAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICovXG5mdW5jdGlvbiBnZXRLZXlDb2RlcyhrY3MpIHtcbiAgdmFyIGsgPSB7fTtcbiAgZm9yICh2YXIga2MgaW4ga2NzKSBrW2tjc1trY11dID0ga2NzW2tjXTtcbiAgcmV0dXJuIGs7XG59XG5cbkZvdW5kYXRpb24uS2V5Ym9hcmQgPSBLZXlib2FyZDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXG5jb25zdCBkZWZhdWx0UXVlcmllcyA9IHtcbiAgJ2RlZmF1bHQnIDogJ29ubHkgc2NyZWVuJyxcbiAgbGFuZHNjYXBlIDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxuICBwb3J0cmFpdCA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICByZXRpbmEgOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xufTtcblxudmFyIE1lZGlhUXVlcnkgPSB7XG4gIHF1ZXJpZXM6IFtdLFxuXG4gIGN1cnJlbnQ6ICcnLFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbWVkaWEgcXVlcnkgaGVscGVyLCBieSBleHRyYWN0aW5nIHRoZSBicmVha3BvaW50IGxpc3QgZnJvbSB0aGUgQ1NTIGFuZCBhY3RpdmF0aW5nIHRoZSBicmVha3BvaW50IHdhdGNoZXIuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBleHRyYWN0ZWRTdHlsZXMgPSAkKCcuZm91bmRhdGlvbi1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcbiAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZWRRdWVyaWVzKSB7XG4gICAgICBpZihuYW1lZFF1ZXJpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgIHZhbHVlOiBgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICR7bmFtZWRRdWVyaWVzW2tleV19KWBcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKTtcblxuICAgIHRoaXMuX3dhdGNoZXIoKTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCdzIHNtYWxsZXIuXG4gICAqL1xuICBhdExlYXN0KHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gbWF0Y2hlcyB0byBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2ssIGVpdGhlciAnc21hbGwgb25seScgb3IgJ3NtYWxsJy4gT21pdHRpbmcgJ29ubHknIGZhbGxzIGJhY2sgdG8gdXNpbmcgYXRMZWFzdCgpIG1ldGhvZC5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0IGRvZXMgbm90LlxuICAgKi9cbiAgaXMoc2l6ZSkge1xuICAgIHNpemUgPSBzaXplLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgIGlmKHNpemUubGVuZ3RoID4gMSAmJiBzaXplWzFdID09PSAnb25seScpIHtcbiAgICAgIGlmKHNpemVbMF0gPT09IHRoaXMuX2dldEN1cnJlbnRTaXplKCkpIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hdExlYXN0KHNpemVbMF0pO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1lZGlhIHF1ZXJ5IG9mIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBnZXQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gLSBUaGUgbWVkaWEgcXVlcnkgb2YgdGhlIGJyZWFrcG9pbnQsIG9yIGBudWxsYCBpZiB0aGUgYnJlYWtwb2ludCBkb2Vzbid0IGV4aXN0LlxuICAgKi9cbiAgZ2V0KHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgaWYodGhpcy5xdWVyaWVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgKi9cbiAgX2dldEN1cnJlbnRTaXplKCkge1xuICAgIHZhciBtYXRjaGVkO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5LnZhbHVlKS5tYXRjaGVzKSB7XG4gICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1hdGNoZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZC5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlcyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLCB3aGljaCBmaXJlcyBhbiBldmVudCBvbiB0aGUgd2luZG93IHdoZW5ldmVyIHRoZSBicmVha3BvaW50IGNoYW5nZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3dhdGNoZXIoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYubWVkaWFxdWVyeScsICgpID0+IHtcbiAgICAgIHZhciBuZXdTaXplID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSwgY3VycmVudFNpemUgPSB0aGlzLmN1cnJlbnQ7XG5cbiAgICAgIGlmIChuZXdTaXplICE9PSBjdXJyZW50U2l6ZSkge1xuICAgICAgICAvLyBDaGFuZ2UgdGhlIGN1cnJlbnQgbWVkaWEgcXVlcnlcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV3U2l6ZTtcblxuICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgICQod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgY3VycmVudFNpemVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuLy8gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2VcbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gIGlmICghc3R5bGVNZWRpYSkge1xuICAgIHZhciBzdHlsZSAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICBzY3JpcHQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgc2NyaXB0ICYmIHNjcmlwdC5wYXJlbnROb2RlICYmIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuICAgIC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgaW5mbyA9ICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG4gICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgIG1hdGNoTWVkaXVtKG1lZGlhKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gYEBtZWRpYSAke21lZGlhfXsgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9YDtcblxuICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgfTtcbiAgfVxufSgpKTtcblxuLy8gVGhhbmsgeW91OiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZ1xuZnVuY3Rpb24gcGFyc2VTdHlsZVRvT2JqZWN0KHN0cikge1xuICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcblxuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xuXG4gIGlmICghc3RyKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24ocmV0LCBwYXJhbSkge1xuICAgIHZhciBwYXJ0cyA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG4gICAgdmFyIGtleSA9IHBhcnRzWzBdO1xuICAgIHZhciB2YWwgPSBwYXJ0c1sxXTtcbiAgICBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5KTtcblxuICAgIC8vIG1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG4gICAgLy8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuICAgIHZhbCA9IHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZVVSSUNvbXBvbmVudCh2YWwpO1xuXG4gICAgaWYgKCFyZXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgcmV0W2tleV0gPSB2YWw7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJldFtrZXldKSkge1xuICAgICAgcmV0W2tleV0ucHVzaCh2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXRba2V5XSA9IFtyZXRba2V5XSwgdmFsXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSwge30pO1xuXG4gIHJldHVybiBzdHlsZU9iamVjdDtcbn1cblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIE1vdGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ubW90aW9uXG4gKi9cblxuY29uc3QgaW5pdENsYXNzZXMgICA9IFsnbXVpLWVudGVyJywgJ211aS1sZWF2ZSddO1xuY29uc3QgYWN0aXZlQ2xhc3NlcyA9IFsnbXVpLWVudGVyLWFjdGl2ZScsICdtdWktbGVhdmUtYWN0aXZlJ107XG5cbmNvbnN0IE1vdGlvbiA9IHtcbiAgYW5pbWF0ZUluOiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZSh0cnVlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfSxcblxuICBhbmltYXRlT3V0OiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZShmYWxzZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH1cbn1cblxuZnVuY3Rpb24gTW92ZShkdXJhdGlvbiwgZWxlbSwgZm4pe1xuICB2YXIgYW5pbSwgcHJvZywgc3RhcnQgPSBudWxsO1xuICAvLyBjb25zb2xlLmxvZygnY2FsbGVkJyk7XG5cbiAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG4gICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZSh0cyl7XG4gICAgaWYoIXN0YXJ0KSBzdGFydCA9IHRzO1xuICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0LCB0cyk7XG4gICAgcHJvZyA9IHRzIC0gc3RhcnQ7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG5cbiAgICBpZihwcm9nIDwgZHVyYXRpb24peyBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlLCBlbGVtKTsgfVxuICAgIGVsc2V7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbSk7XG4gICAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICB9XG4gIH1cbiAgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSk7XG59XG5cbi8qKlxuICogQW5pbWF0ZXMgYW4gZWxlbWVudCBpbiBvciBvdXQgdXNpbmcgYSBDU1MgdHJhbnNpdGlvbiBjbGFzcy5cbiAqIEBmdW5jdGlvblxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbiAtIERlZmluZXMgaWYgdGhlIGFuaW1hdGlvbiBpcyBpbiBvciBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvciBIVE1MIG9iamVjdCB0byBhbmltYXRlLlxuICogQHBhcmFtIHtTdHJpbmd9IGFuaW1hdGlvbiAtIENTUyBjbGFzcyB0byB1c2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIENhbGxiYWNrIHRvIHJ1biB3aGVuIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cbiAqL1xuZnVuY3Rpb24gYW5pbWF0ZShpc0luLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gIGVsZW1lbnQgPSAkKGVsZW1lbnQpLmVxKDApO1xuXG4gIGlmICghZWxlbWVudC5sZW5ndGgpIHJldHVybjtcblxuICB2YXIgaW5pdENsYXNzID0gaXNJbiA/IGluaXRDbGFzc2VzWzBdIDogaW5pdENsYXNzZXNbMV07XG4gIHZhciBhY3RpdmVDbGFzcyA9IGlzSW4gPyBhY3RpdmVDbGFzc2VzWzBdIDogYWN0aXZlQ2xhc3Nlc1sxXTtcblxuICAvLyBTZXQgdXAgdGhlIGFuaW1hdGlvblxuICByZXNldCgpO1xuXG4gIGVsZW1lbnRcbiAgICAuYWRkQ2xhc3MoYW5pbWF0aW9uKVxuICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgZWxlbWVudC5hZGRDbGFzcyhpbml0Q2xhc3MpO1xuICAgIGlmIChpc0luKSBlbGVtZW50LnNob3coKTtcbiAgfSk7XG5cbiAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGg7XG4gICAgZWxlbWVudFxuICAgICAgLmNzcygndHJhbnNpdGlvbicsICcnKVxuICAgICAgLmFkZENsYXNzKGFjdGl2ZUNsYXNzKTtcbiAgfSk7XG5cbiAgLy8gQ2xlYW4gdXAgdGhlIGFuaW1hdGlvbiB3aGVuIGl0IGZpbmlzaGVzXG4gIGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlbGVtZW50KSwgZmluaXNoKTtcblxuICAvLyBIaWRlcyB0aGUgZWxlbWVudCAoZm9yIG91dCBhbmltYXRpb25zKSwgcmVzZXRzIHRoZSBlbGVtZW50LCBhbmQgcnVucyBhIGNhbGxiYWNrXG4gIGZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICBpZiAoIWlzSW4pIGVsZW1lbnQuaGlkZSgpO1xuICAgIHJlc2V0KCk7XG4gICAgaWYgKGNiKSBjYi5hcHBseShlbGVtZW50KTtcbiAgfVxuXG4gIC8vIFJlc2V0cyB0cmFuc2l0aW9ucyBhbmQgcmVtb3ZlcyBtb3Rpb24tc3BlY2lmaWMgY2xhc3Nlc1xuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBlbGVtZW50WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IDA7XG4gICAgZWxlbWVudC5yZW1vdmVDbGFzcyhgJHtpbml0Q2xhc3N9ICR7YWN0aXZlQ2xhc3N9ICR7YW5pbWF0aW9ufWApO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTW92ZSA9IE1vdmU7XG5Gb3VuZGF0aW9uLk1vdGlvbiA9IE1vdGlvbjtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBOZXN0ID0ge1xuICBGZWF0aGVyKG1lbnUsIHR5cGUgPSAnemYnKSB7XG4gICAgbWVudS5hdHRyKCdyb2xlJywgJ21lbnViYXInKTtcblxuICAgIHZhciBpdGVtcyA9IG1lbnUuZmluZCgnbGknKS5hdHRyKHsncm9sZSc6ICdtZW51aXRlbSd9KSxcbiAgICAgICAgc3ViTWVudUNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudWAsXG4gICAgICAgIHN1Ykl0ZW1DbGFzcyA9IGAke3N1Yk1lbnVDbGFzc30taXRlbWAsXG4gICAgICAgIGhhc1N1YkNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudS1wYXJlbnRgO1xuXG4gICAgaXRlbXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuXG4gICAgICBpZiAoJHN1Yi5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW1cbiAgICAgICAgICAuYWRkQ2xhc3MoaGFzU3ViQ2xhc3MpXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGFzcG9wdXAnOiB0cnVlLFxuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiAkaXRlbS5jaGlsZHJlbignYTpmaXJzdCcpLnRleHQoKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIE5vdGU6ICBEcmlsbGRvd25zIGJlaGF2ZSBkaWZmZXJlbnRseSBpbiBob3cgdGhleSBoaWRlLCBhbmQgc28gbmVlZFxuICAgICAgICAgIC8vIGFkZGl0aW9uYWwgYXR0cmlidXRlcy4gIFdlIHNob3VsZCBsb29rIGlmIHRoaXMgcG9zc2libHkgb3Zlci1nZW5lcmFsaXplZFxuICAgICAgICAgIC8vIHV0aWxpdHkgKE5lc3QpIGlzIGFwcHJvcHJpYXRlIHdoZW4gd2UgcmV3b3JrIG1lbnVzIGluIDYuNFxuICAgICAgICAgIGlmKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgICAkaXRlbS5hdHRyKHsnYXJpYS1leHBhbmRlZCc6IGZhbHNlfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICRzdWJcbiAgICAgICAgICAuYWRkQ2xhc3MoYHN1Ym1lbnUgJHtzdWJNZW51Q2xhc3N9YClcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnZGF0YS1zdWJtZW51JzogJycsXG4gICAgICAgICAgICAncm9sZSc6ICdtZW51J1xuICAgICAgICAgIH0pO1xuICAgICAgICBpZih0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICRzdWIuYXR0cih7J2FyaWEtaGlkZGVuJzogdHJ1ZX0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICgkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtLmFkZENsYXNzKGBpcy1zdWJtZW51LWl0ZW0gJHtzdWJJdGVtQ2xhc3N9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgQnVybihtZW51LCB0eXBlKSB7XG4gICAgdmFyIC8vaXRlbXMgPSBtZW51LmZpbmQoJ2xpJyksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIG1lbnVcbiAgICAgIC5maW5kKCc+bGksIC5tZW51LCAubWVudSA+IGxpJylcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHtzdWJNZW51Q2xhc3N9ICR7c3ViSXRlbUNsYXNzfSAke2hhc1N1YkNsYXNzfSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmVgKVxuICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpLmNzcygnZGlzcGxheScsICcnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCAgICAgIG1lbnUuZmluZCgnLicgKyBzdWJNZW51Q2xhc3MgKyAnLCAuJyArIHN1Ykl0ZW1DbGFzcyArICcsIC5oYXMtc3VibWVudSwgLmlzLXN1Ym1lbnUtaXRlbSwgLnN1Ym1lbnUsIFtkYXRhLXN1Ym1lbnVdJylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUNsYXNzKHN1Yk1lbnVDbGFzcyArICcgJyArIHN1Ykl0ZW1DbGFzcyArICcgaGFzLXN1Ym1lbnUgaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUnKVxuICAgIC8vICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykpO1xuICAgIC8vIGl0ZW1zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAvLyAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgLy8gICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuICAgIC8vICAgaWYoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdpcy1zdWJtZW51LWl0ZW0gJyArIHN1Ykl0ZW1DbGFzcyk7XG4gICAgLy8gICB9XG4gICAgLy8gICBpZigkc3ViLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdoYXMtc3VibWVudScpO1xuICAgIC8vICAgICAkc3ViLnJlbW92ZUNsYXNzKCdzdWJtZW51ICcgKyBzdWJNZW51Q2xhc3MpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpO1xuICAgIC8vICAgfVxuICAgIC8vIH0pO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTmVzdCA9IE5lc3Q7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuZnVuY3Rpb24gVGltZXIoZWxlbSwgb3B0aW9ucywgY2IpIHtcbiAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgIGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiwvL29wdGlvbnMgaXMgYW4gb2JqZWN0IGZvciBlYXNpbHkgYWRkaW5nIGZlYXR1cmVzIGxhdGVyLlxuICAgICAgbmFtZVNwYWNlID0gT2JqZWN0LmtleXMoZWxlbS5kYXRhKCkpWzBdIHx8ICd0aW1lcicsXG4gICAgICByZW1haW4gPSAtMSxcbiAgICAgIHN0YXJ0LFxuICAgICAgdGltZXI7XG5cbiAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuXG4gIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHJlbWFpbiA9IC0xO1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGhpcy5zdGFydCgpO1xuICB9XG5cbiAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAvLyBpZighZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiA8PSAwID8gZHVyYXRpb24gOiByZW1haW47XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCBmYWxzZSk7XG4gICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgaWYob3B0aW9ucy5pbmZpbml0ZSl7XG4gICAgICAgIF90aGlzLnJlc3RhcnQoKTsvL3JlcnVuIHRoZSB0aW1lci5cbiAgICAgIH1cbiAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICAgIH0sIHJlbWFpbik7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnN0YXJ0LnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG5cbiAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xuICAgIC8vaWYoZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgdHJ1ZSk7XG4gICAgdmFyIGVuZCA9IERhdGUubm93KCk7XG4gICAgcmVtYWluID0gcmVtYWluIC0gKGVuZCAtIHN0YXJ0KTtcbiAgICBlbGVtLnRyaWdnZXIoYHRpbWVycGF1c2VkLnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogUnVucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuXG4gKiBAcGFyYW0ge09iamVjdH0gaW1hZ2VzIC0gSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gKi9cbmZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKGltYWdlcywgY2FsbGJhY2spe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIGltYWdlcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIC8vIENoZWNrIGlmIGltYWdlIGlzIGxvYWRlZFxuICAgIGlmICh0aGlzLmNvbXBsZXRlIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09IDQpIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpKSB7XG4gICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgIH1cbiAgICAvLyBGb3JjZSBsb2FkIHRoZSBpbWFnZVxuICAgIGVsc2Uge1xuICAgICAgLy8gZml4IGZvciBJRS4gU2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vc25pcHBldHMvanF1ZXJ5L2ZpeGluZy1sb2FkLWluLWllLWZvci1jYWNoZWQtaW1hZ2VzL1xuICAgICAgdmFyIHNyYyA9ICQodGhpcykuYXR0cignc3JjJyk7XG4gICAgICAkKHRoaXMpLmF0dHIoJ3NyYycsIHNyYyArIChzcmMuaW5kZXhPZignPycpID49IDAgPyAnJicgOiAnPycpICsgKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSk7XG4gICAgICAkKHRoaXMpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBzaW5nbGVJbWFnZUxvYWRlZCgpIHtcbiAgICB1bmxvYWRlZC0tO1xuICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cbn1cblxuRm91bmRhdGlvbi5UaW1lciA9IFRpbWVyO1xuRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCA9IG9uSW1hZ2VzTG9hZGVkO1xuXG59KGpRdWVyeSk7XG4iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqV29yayBpbnNwaXJlZCBieSBtdWx0aXBsZSBqcXVlcnkgc3dpcGUgcGx1Z2lucyoqXG4vLyoqRG9uZSBieSBZb2hhaSBBcmFyYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4oZnVuY3Rpb24oJCkge1xuXG4gICQuc3BvdFN3aXBlID0ge1xuICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgZW5hYmxlZDogJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZSxcbiAgICBtb3ZlVGhyZXNob2xkOiA3NSxcbiAgICB0aW1lVGhyZXNob2xkOiAyMDBcbiAgfTtcblxuICB2YXIgICBzdGFydFBvc1gsXG4gICAgICAgIHN0YXJ0UG9zWSxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbGFwc2VkVGltZSxcbiAgICAgICAgaXNNb3ZpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xuICAgIC8vICBhbGVydCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgaXNNb3ZpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGUpIHtcbiAgICBpZiAoJC5zcG90U3dpcGUucHJldmVudERlZmF1bHQpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9XG4gICAgaWYoaXNNb3ZpbmcpIHtcbiAgICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgdmFyIHkgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICB2YXIgZHggPSBzdGFydFBvc1ggLSB4O1xuICAgICAgdmFyIGR5ID0gc3RhcnRQb3NZIC0geTtcbiAgICAgIHZhciBkaXI7XG4gICAgICBlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lO1xuICAgICAgaWYoTWF0aC5hYnMoZHgpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgICBkaXIgPSBkeCA+IDAgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBpZihNYXRoLmFicyhkeSkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG4gICAgICAvLyAgIGRpciA9IGR5ID4gMCA/ICdkb3duJyA6ICd1cCc7XG4gICAgICAvLyB9XG4gICAgICBpZihkaXIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvblRvdWNoRW5kLmNhbGwodGhpcyk7XG4gICAgICAgICQodGhpcykudHJpZ2dlcignc3dpcGUnLCBkaXIpLnRyaWdnZXIoYHN3aXBlJHtkaXJ9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBzdGFydFBvc1ggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICBzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICBpc01vdmluZyA9IHRydWU7XG4gICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG4gIH1cblxuICBmdW5jdGlvbiB0ZWFyZG93bigpIHtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuICB9XG5cbiAgJC5ldmVudC5zcGVjaWFsLnN3aXBlID0geyBzZXR1cDogaW5pdCB9O1xuXG4gICQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XG4gICAgJC5ldmVudC5zcGVjaWFsW2Bzd2lwZSR7dGhpc31gXSA9IHsgc2V0dXA6IGZ1bmN0aW9uKCl7XG4gICAgICAkKHRoaXMpLm9uKCdzd2lwZScsICQubm9vcCk7XG4gICAgfSB9O1xuICB9KTtcbn0pKGpRdWVyeSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWV0aG9kIGZvciBhZGRpbmcgcHN1ZWRvIGRyYWcgZXZlbnRzIHRvIGVsZW1lbnRzICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4hZnVuY3Rpb24oJCl7XG4gICQuZm4uYWRkVG91Y2ggPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLGVsKXtcbiAgICAgICQoZWwpLmJpbmQoJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJyxmdW5jdGlvbigpe1xuICAgICAgICAvL3dlIHBhc3MgdGhlIG9yaWdpbmFsIGV2ZW50IG9iamVjdCBiZWNhdXNlIHRoZSBqUXVlcnkgZXZlbnRcbiAgICAgICAgLy9vYmplY3QgaXMgbm9ybWFsaXplZCB0byB3M2Mgc3BlY3MgYW5kIGRvZXMgbm90IHByb3ZpZGUgdGhlIFRvdWNoTGlzdFxuICAgICAgICBoYW5kbGVUb3VjaChldmVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBoYW5kbGVUb3VjaCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgICAgZmlyc3QgPSB0b3VjaGVzWzBdLFxuICAgICAgICAgIGV2ZW50VHlwZXMgPSB7XG4gICAgICAgICAgICB0b3VjaHN0YXJ0OiAnbW91c2Vkb3duJyxcbiAgICAgICAgICAgIHRvdWNobW92ZTogJ21vdXNlbW92ZScsXG4gICAgICAgICAgICB0b3VjaGVuZDogJ21vdXNldXAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcbiAgICAgICAgICBzaW11bGF0ZWRFdmVudFxuICAgICAgICA7XG5cbiAgICAgIGlmKCdNb3VzZUV2ZW50JyBpbiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gbmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHR5cGUsIHtcbiAgICAgICAgICAnYnViYmxlcyc6IHRydWUsXG4gICAgICAgICAgJ2NhbmNlbGFibGUnOiB0cnVlLFxuICAgICAgICAgICdzY3JlZW5YJzogZmlyc3Quc2NyZWVuWCxcbiAgICAgICAgICAnc2NyZWVuWSc6IGZpcnN0LnNjcmVlblksXG4gICAgICAgICAgJ2NsaWVudFgnOiBmaXJzdC5jbGllbnRYLFxuICAgICAgICAgICdjbGllbnRZJzogZmlyc3QuY2xpZW50WVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCBmaXJzdC5zY3JlZW5YLCBmaXJzdC5zY3JlZW5ZLCBmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMC8qbGVmdCovLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGZpcnN0LnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcbiAgICB9O1xuICB9O1xufShqUXVlcnkpO1xuXG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKkZyb20gdGhlIGpRdWVyeSBNb2JpbGUgTGlicmFyeSoqXG4vLyoqbmVlZCB0byByZWNyZWF0ZSBmdW5jdGlvbmFsaXR5Kipcbi8vKiphbmQgdHJ5IHRvIGltcHJvdmUgaWYgcG9zc2libGUqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbi8qIFJlbW92aW5nIHRoZSBqUXVlcnkgZnVuY3Rpb24gKioqKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbihmdW5jdGlvbiggJCwgd2luZG93LCB1bmRlZmluZWQgKSB7XG5cblx0dmFyICRkb2N1bWVudCA9ICQoIGRvY3VtZW50ICksXG5cdFx0Ly8gc3VwcG9ydFRvdWNoID0gJC5tb2JpbGUuc3VwcG9ydC50b3VjaCxcblx0XHR0b3VjaFN0YXJ0RXZlbnQgPSAndG91Y2hzdGFydCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hzdGFydFwiIDogXCJtb3VzZWRvd25cIixcblx0XHR0b3VjaFN0b3BFdmVudCA9ICd0b3VjaGVuZCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hlbmRcIiA6IFwibW91c2V1cFwiLFxuXHRcdHRvdWNoTW92ZUV2ZW50ID0gJ3RvdWNobW92ZScvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2htb3ZlXCIgOiBcIm1vdXNlbW92ZVwiO1xuXG5cdC8vIHNldHVwIG5ldyBldmVudCBzaG9ydGN1dHNcblx0JC5lYWNoKCAoIFwidG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgXCIgK1xuXHRcdFwic3dpcGUgc3dpcGVsZWZ0IHN3aXBlcmlnaHRcIiApLnNwbGl0KCBcIiBcIiApLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcblxuXHRcdCQuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBmbiApIHtcblx0XHRcdHJldHVybiBmbiA/IHRoaXMuYmluZCggbmFtZSwgZm4gKSA6IHRoaXMudHJpZ2dlciggbmFtZSApO1xuXHRcdH07XG5cblx0XHQvLyBqUXVlcnkgPCAxLjhcblx0XHRpZiAoICQuYXR0ckZuICkge1xuXHRcdFx0JC5hdHRyRm5bIG5hbWUgXSA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblxuXHRmdW5jdGlvbiB0cmlnZ2VyQ3VzdG9tRXZlbnQoIG9iaiwgZXZlbnRUeXBlLCBldmVudCwgYnViYmxlICkge1xuXHRcdHZhciBvcmlnaW5hbFR5cGUgPSBldmVudC50eXBlO1xuXHRcdGV2ZW50LnR5cGUgPSBldmVudFR5cGU7XG5cdFx0aWYgKCBidWJibGUgKSB7XG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIGV2ZW50LCB1bmRlZmluZWQsIG9iaiApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkLmV2ZW50LmRpc3BhdGNoLmNhbGwoIG9iaiwgZXZlbnQgKTtcblx0XHR9XG5cdFx0ZXZlbnQudHlwZSA9IG9yaWdpbmFsVHlwZTtcblx0fVxuXG5cdC8vIGFsc28gaGFuZGxlcyB0YXBob2xkXG5cblx0Ly8gQWxzbyBoYW5kbGVzIHN3aXBlbGVmdCwgc3dpcGVyaWdodFxuXHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7XG5cblx0XHQvLyBNb3JlIHRoYW4gdGhpcyBob3Jpem9udGFsIGRpc3BsYWNlbWVudCwgYW5kIHdlIHdpbGwgc3VwcHJlc3Mgc2Nyb2xsaW5nLlxuXHRcdHNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQ6IDMwLFxuXG5cdFx0Ly8gTW9yZSB0aW1lIHRoYW4gdGhpcywgYW5kIGl0IGlzbid0IGEgc3dpcGUuXG5cdFx0ZHVyYXRpb25UaHJlc2hvbGQ6IDEwMDAsXG5cblx0XHQvLyBTd2lwZSBob3Jpem9udGFsIGRpc3BsYWNlbWVudCBtdXN0IGJlIG1vcmUgdGhhbiB0aGlzLlxuXHRcdGhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHQvLyBTd2lwZSB2ZXJ0aWNhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBsZXNzIHRoYW4gdGhpcy5cblx0XHR2ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdGdldExvY2F0aW9uOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHdpblBhZ2VYID0gd2luZG93LnBhZ2VYT2Zmc2V0LFxuXHRcdFx0XHR3aW5QYWdlWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcblx0XHRcdFx0eCA9IGV2ZW50LmNsaWVudFgsXG5cdFx0XHRcdHkgPSBldmVudC5jbGllbnRZO1xuXG5cdFx0XHRpZiAoIGV2ZW50LnBhZ2VZID09PSAwICYmIE1hdGguZmxvb3IoIHkgKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VZICkgfHxcblx0XHRcdFx0ZXZlbnQucGFnZVggPT09IDAgJiYgTWF0aC5mbG9vciggeCApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBpT1M0IGNsaWVudFgvY2xpZW50WSBoYXZlIHRoZSB2YWx1ZSB0aGF0IHNob3VsZCBoYXZlIGJlZW5cblx0XHRcdFx0Ly8gaW4gcGFnZVgvcGFnZVkuIFdoaWxlIHBhZ2VYL3BhZ2UvIGhhdmUgdGhlIHZhbHVlIDBcblx0XHRcdFx0eCA9IHggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IHkgLSB3aW5QYWdlWTtcblx0XHRcdH0gZWxzZSBpZiAoIHkgPCAoIGV2ZW50LnBhZ2VZIC0gd2luUGFnZVkpIHx8IHggPCAoIGV2ZW50LnBhZ2VYIC0gd2luUGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBTb21lIEFuZHJvaWQgYnJvd3NlcnMgaGF2ZSB0b3RhbGx5IGJvZ3VzIHZhbHVlcyBmb3IgY2xpZW50WC9ZXG5cdFx0XHRcdC8vIHdoZW4gc2Nyb2xsaW5nL3pvb21pbmcgYSBwYWdlLiBEZXRlY3RhYmxlIHNpbmNlIGNsaWVudFgvY2xpZW50WVxuXHRcdFx0XHQvLyBzaG91bGQgbmV2ZXIgYmUgc21hbGxlciB0aGFuIHBhZ2VYL3BhZ2VZIG1pbnVzIHBhZ2Ugc2Nyb2xsXG5cdFx0XHRcdHggPSBldmVudC5wYWdlWCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0gZXZlbnQucGFnZVkgLSB3aW5QYWdlWTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogeCxcblx0XHRcdFx0eTogeVxuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF0sXG5cdFx0XHRcdFx0XHRvcmlnaW46ICQoIGV2ZW50LnRhcmdldCApXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdGhhbmRsZVN3aXBlOiBmdW5jdGlvbiggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKSB7XG5cdFx0XHRpZiAoIHN0b3AudGltZSAtIHN0YXJ0LnRpbWUgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZHVyYXRpb25UaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAxIF0gLSBzdG9wLmNvb3Jkc1sgMSBdICkgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUudmVydGljYWxEaXN0YW5jZVRocmVzaG9sZCApIHtcblx0XHRcdFx0dmFyIGRpcmVjdGlvbiA9IHN0YXJ0LmNvb3Jkc1swXSA+IHN0b3AuY29vcmRzWyAwIF0gPyBcInN3aXBlbGVmdFwiIDogXCJzd2lwZXJpZ2h0XCI7XG5cblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBcInN3aXBlXCIsICQuRXZlbnQoIFwic3dpcGVcIiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSksIHRydWUgKTtcblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBkaXJlY3Rpb24sJC5FdmVudCggZGlyZWN0aW9uLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9ICksIHRydWUgKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXG5cdFx0Ly8gVGhpcyBzZXJ2ZXMgYXMgYSBmbGFnIHRvIGVuc3VyZSB0aGF0IGF0IG1vc3Qgb25lIHN3aXBlIGV2ZW50IGV2ZW50IGlzXG5cdFx0Ly8gaW4gd29yayBhdCBhbnkgZ2l2ZW4gdGltZVxuXHRcdGV2ZW50SW5Qcm9ncmVzczogZmFsc2UsXG5cblx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLFxuXHRcdFx0XHR0aGlzT2JqZWN0ID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgPSAkKCB0aGlzT2JqZWN0ICksXG5cdFx0XHRcdGNvbnRleHQgPSB7fTtcblxuXHRcdFx0Ly8gUmV0cmlldmUgdGhlIGV2ZW50cyBkYXRhIGZvciB0aGlzIGVsZW1lbnQgYW5kIGFkZCB0aGUgc3dpcGUgY29udGV4dFxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCAhZXZlbnRzICkge1xuXHRcdFx0XHRldmVudHMgPSB7IGxlbmd0aDogMCB9O1xuXHRcdFx0XHQkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiLCBldmVudHMgKTtcblx0XHRcdH1cblx0XHRcdGV2ZW50cy5sZW5ndGgrKztcblx0XHRcdGV2ZW50cy5zd2lwZSA9IGNvbnRleHQ7XG5cblx0XHRcdGNvbnRleHQuc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHRcdFx0Ly8gQmFpbCBpZiB3ZSdyZSBhbHJlYWR5IHdvcmtpbmcgb24gYSBzd2lwZSBldmVudFxuXHRcdFx0XHRpZiAoICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSB0cnVlO1xuXG5cdFx0XHRcdHZhciBzdG9wLFxuXHRcdFx0XHRcdHN0YXJ0ID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0YXJ0KCBldmVudCApLFxuXHRcdFx0XHRcdG9yaWdUYXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHRcdFx0ZW1pdHRlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdGNvbnRleHQubW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRpZiAoICFzdGFydCB8fCBldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSApIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzdG9wID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0b3AoIGV2ZW50ICk7XG5cdFx0XHRcdFx0aWYgKCAhZW1pdHRlZCApIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaGFuZGxlU3dpcGUoIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICk7XG5cdFx0XHRcdFx0XHRpZiAoIGVtaXR0ZWQgKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gcHJldmVudCBzY3JvbGxpbmdcblx0XHRcdFx0XHRpZiAoIE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkICkge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y29udGV4dC5zdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBudWxsO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCRkb2N1bWVudC5vbiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApXG5cdFx0XHRcdFx0Lm9uZSggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0fTtcblx0XHRcdCR0aGlzLm9uKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHR9LFxuXG5cdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cywgY29udGV4dDtcblxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCBldmVudHMgKSB7XG5cdFx0XHRcdGNvbnRleHQgPSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGRlbGV0ZSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGV2ZW50cy5sZW5ndGgtLTtcblx0XHRcdFx0aWYgKCBldmVudHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0XHRcdCQucmVtb3ZlRGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGNvbnRleHQgKSB7XG5cdFx0XHRcdGlmICggY29udGV4dC5zdGFydCApIHtcblx0XHRcdFx0XHQkKCB0aGlzICkub2ZmKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQubW92ZSApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0b3AgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHQkLmVhY2goe1xuXHRcdHN3aXBlbGVmdDogXCJzd2lwZS5sZWZ0XCIsXG5cdFx0c3dpcGVyaWdodDogXCJzd2lwZS5yaWdodFwiXG5cdH0sIGZ1bmN0aW9uKCBldmVudCwgc291cmNlRXZlbnQgKSB7XG5cblx0XHQkLmV2ZW50LnNwZWNpYWxbIGV2ZW50IF0gPSB7XG5cdFx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS5iaW5kKCBzb3VyY2VFdmVudCwgJC5ub29wICk7XG5cdFx0XHR9LFxuXHRcdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkudW5iaW5kKCBzb3VyY2VFdmVudCApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xufSkoIGpRdWVyeSwgdGhpcyApO1xuKi9cbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChgJHtwcmVmaXhlc1tpXX1NdXRhdGlvbk9ic2VydmVyYCBpbiB3aW5kb3cpIHtcbiAgICAgIHJldHVybiB3aW5kb3dbYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KCkpO1xuXG5jb25zdCB0cmlnZ2VycyA9IChlbCwgdHlwZSkgPT4ge1xuICBlbC5kYXRhKHR5cGUpLnNwbGl0KCcgJykuZm9yRWFjaChpZCA9PiB7XG4gICAgJChgIyR7aWR9YClbIHR5cGUgPT09ICdjbG9zZScgPyAndHJpZ2dlcicgOiAndHJpZ2dlckhhbmRsZXInXShgJHt0eXBlfS56Zi50cmlnZ2VyYCwgW2VsXSk7XG4gIH0pO1xufTtcbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtb3Blbl0gd2lsbCByZXZlYWwgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1vcGVuXScsIGZ1bmN0aW9uKCkge1xuICB0cmlnZ2VycygkKHRoaXMpLCAnb3BlbicpO1xufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2VdIHdpbGwgY2xvc2UgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4vLyBJZiB1c2VkIHdpdGhvdXQgYSB2YWx1ZSBvbiBbZGF0YS1jbG9zZV0sIHRoZSBldmVudCB3aWxsIGJ1YmJsZSwgYWxsb3dpbmcgaXQgdG8gY2xvc2UgYSBwYXJlbnQgY29tcG9uZW50LlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2VdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgnY2xvc2UnKTtcbiAgaWYgKGlkKSB7XG4gICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ2Nsb3NlJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLXRvZ2dsZV0gd2lsbCB0b2dnbGUgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGVdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICd0b2dnbGUnKTtcbiAgfSBlbHNlIHtcbiAgICAkKHRoaXMpLnRyaWdnZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NhYmxlXSB3aWxsIHJlc3BvbmQgdG8gY2xvc2UuemYudHJpZ2dlciBldmVudHMuXG4kKGRvY3VtZW50KS5vbignY2xvc2UuemYudHJpZ2dlcicsICdbZGF0YS1jbG9zYWJsZV0nLCBmdW5jdGlvbihlKXtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgbGV0IGFuaW1hdGlvbiA9ICQodGhpcykuZGF0YSgnY2xvc2FibGUnKTtcblxuICBpZihhbmltYXRpb24gIT09ICcnKXtcbiAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KCQodGhpcyksIGFuaW1hdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICAgIH0pO1xuICB9ZWxzZXtcbiAgICAkKHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgfVxufSk7XG5cbiQoZG9jdW1lbnQpLm9uKCdmb2N1cy56Zi50cmlnZ2VyIGJsdXIuemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGUtZm9jdXNdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlLWZvY3VzJyk7XG4gICQoYCMke2lkfWApLnRyaWdnZXJIYW5kbGVyKCd0b2dnbGUuemYudHJpZ2dlcicsIFskKHRoaXMpXSk7XG59KTtcblxuLyoqXG4qIEZpcmVzIG9uY2UgYWZ0ZXIgYWxsIG90aGVyIHNjcmlwdHMgaGF2ZSBsb2FkZWRcbiogQGZ1bmN0aW9uXG4qIEBwcml2YXRlXG4qL1xuJCh3aW5kb3cpLm9uKCdsb2FkJywgKCkgPT4ge1xuICBjaGVja0xpc3RlbmVycygpO1xufSk7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXJzKCkge1xuICBldmVudHNMaXN0ZW5lcigpO1xuICByZXNpemVMaXN0ZW5lcigpO1xuICBzY3JvbGxMaXN0ZW5lcigpO1xuICBtdXRhdGVMaXN0ZW5lcigpO1xuICBjbG9zZW1lTGlzdGVuZXIoKTtcbn1cblxuLy8qKioqKioqKiBvbmx5IGZpcmVzIHRoaXMgZnVuY3Rpb24gb25jZSBvbiBsb2FkLCBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byB3YXRjaCAqKioqKioqKlxuZnVuY3Rpb24gY2xvc2VtZUxpc3RlbmVyKHBsdWdpbk5hbWUpIHtcbiAgdmFyIHlldGlCb3hlcyA9ICQoJ1tkYXRhLXlldGktYm94XScpLFxuICAgICAgcGx1Z05hbWVzID0gWydkcm9wZG93bicsICd0b29sdGlwJywgJ3JldmVhbCddO1xuXG4gIGlmKHBsdWdpbk5hbWUpe1xuICAgIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMucHVzaChwbHVnaW5OYW1lKTtcbiAgICB9ZWxzZSBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHBsdWdpbk5hbWVbMF0gPT09ICdzdHJpbmcnKXtcbiAgICAgIHBsdWdOYW1lcy5jb25jYXQocGx1Z2luTmFtZSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKCdQbHVnaW4gbmFtZXMgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICB9XG4gIGlmKHlldGlCb3hlcy5sZW5ndGgpe1xuICAgIGxldCBsaXN0ZW5lcnMgPSBwbHVnTmFtZXMubWFwKChuYW1lKSA9PiB7XG4gICAgICByZXR1cm4gYGNsb3NlbWUuemYuJHtuYW1lfWA7XG4gICAgfSkuam9pbignICcpO1xuXG4gICAgJCh3aW5kb3cpLm9mZihsaXN0ZW5lcnMpLm9uKGxpc3RlbmVycywgZnVuY3Rpb24oZSwgcGx1Z2luSWQpe1xuICAgICAgbGV0IHBsdWdpbiA9IGUubmFtZXNwYWNlLnNwbGl0KCcuJylbMF07XG4gICAgICBsZXQgcGx1Z2lucyA9ICQoYFtkYXRhLSR7cGx1Z2lufV1gKS5ub3QoYFtkYXRhLXlldGktYm94PVwiJHtwbHVnaW5JZH1cIl1gKTtcblxuICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCBfdGhpcyA9ICQodGhpcyk7XG5cbiAgICAgICAgX3RoaXMudHJpZ2dlckhhbmRsZXIoJ2Nsb3NlLnpmLnRyaWdnZXInLCBbX3RoaXNdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc2l6ZUxpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtcmVzaXplXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuemYudHJpZ2dlcicpXG4gICAgLm9uKCdyZXNpemUuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgcmVzaXplIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwicmVzaXplXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgcmVzaXplIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2Nyb2xsTGlzdGVuZXIoZGVib3VuY2Upe1xuICBsZXQgdGltZXIsXG4gICAgICAkbm9kZXMgPSAkKCdbZGF0YS1zY3JvbGxdJyk7XG4gIGlmKCRub2Rlcy5sZW5ndGgpe1xuICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC56Zi50cmlnZ2VyJylcbiAgICAub24oJ3Njcm9sbC56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZih0aW1lcil7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cblxuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBzY3JvbGwgZXZlbnRcbiAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJzY3JvbGxcIik7XG4gICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7Ly9kZWZhdWx0IHRpbWUgdG8gZW1pdCBzY3JvbGwgZXZlbnRcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtdXRhdGVMaXN0ZW5lcihkZWJvdW5jZSkge1xuICAgIGxldCAkbm9kZXMgPSAkKCdbZGF0YS1tdXRhdGVdJyk7XG4gICAgaWYgKCRub2Rlcy5sZW5ndGggJiYgTXV0YXRpb25PYnNlcnZlcil7XG5cdFx0XHQvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgbXV0YXRlIGV2ZW50XG4gICAgICAvL25vIElFIDkgb3IgMTBcblx0XHRcdCRub2Rlcy5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdCAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicpO1xuXHRcdFx0fSk7XG4gICAgfVxuIH1cblxuZnVuY3Rpb24gZXZlbnRzTGlzdGVuZXIoKSB7XG4gIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsgcmV0dXJuIGZhbHNlOyB9XG4gIGxldCBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXJlc2l6ZV0sIFtkYXRhLXNjcm9sbF0sIFtkYXRhLW11dGF0ZV0nKTtcblxuICAvL2VsZW1lbnQgY2FsbGJhY2tcbiAgdmFyIGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24gPSBmdW5jdGlvbiAobXV0YXRpb25SZWNvcmRzTGlzdCkge1xuICAgICAgdmFyICR0YXJnZXQgPSAkKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udGFyZ2V0KTtcblxuXHQgIC8vdHJpZ2dlciB0aGUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGVsZW1lbnQgZGVwZW5kaW5nIG9uIHR5cGVcbiAgICAgIHN3aXRjaCAobXV0YXRpb25SZWNvcmRzTGlzdFswXS50eXBlKSB7XG5cbiAgICAgICAgY2FzZSBcImF0dHJpYnV0ZXNcIjpcbiAgICAgICAgICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwic2Nyb2xsXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcblx0XHQgIFx0JHRhcmdldC50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LCB3aW5kb3cucGFnZVlPZmZzZXRdKTtcblx0XHQgIH1cblx0XHQgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJyZXNpemVcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuXHRcdCAgXHQkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXRdKTtcblx0XHQgICB9XG5cdFx0ICBpZiAobXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcInN0eWxlXCIpIHtcblx0XHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKTtcblx0XHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG5cdFx0ICB9XG5cdFx0ICBicmVhaztcblxuICAgICAgICBjYXNlIFwiY2hpbGRMaXN0XCI6XG5cdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpO1xuXHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vbm90aGluZ1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAobm9kZXMubGVuZ3RoKSB7XG4gICAgICAvL2ZvciBlYWNoIGVsZW1lbnQgdGhhdCBuZWVkcyB0byBsaXN0ZW4gZm9yIHJlc2l6aW5nLCBzY3JvbGxpbmcsIG9yIG11dGF0aW9uIGFkZCBhIHNpbmdsZSBvYnNlcnZlclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gbm9kZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHZhciBlbGVtZW50T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uKTtcbiAgICAgICAgZWxlbWVudE9ic2VydmVyLm9ic2VydmUobm9kZXNbaV0sIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlRmlsdGVyOiBbXCJkYXRhLWV2ZW50c1wiLCBcInN0eWxlXCJdIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gW1BIXVxuLy8gRm91bmRhdGlvbi5DaGVja1dhdGNoZXJzID0gY2hlY2tXYXRjaGVycztcbkZvdW5kYXRpb24uSUhlYXJZb3UgPSBjaGVja0xpc3RlbmVycztcbi8vIEZvdW5kYXRpb24uSVNlZVlvdSA9IHNjcm9sbExpc3RlbmVyO1xuLy8gRm91bmRhdGlvbi5JRmVlbFlvdSA9IGNsb3NlbWVMaXN0ZW5lcjtcblxufShqUXVlcnkpO1xuXG4vLyBmdW5jdGlvbiBkb21NdXRhdGlvbk9ic2VydmVyKGRlYm91bmNlKSB7XG4vLyAgIC8vICEhISBUaGlzIGlzIGNvbWluZyBzb29uIGFuZCBuZWVkcyBtb3JlIHdvcms7IG5vdCBhY3RpdmUgICEhISAvL1xuLy8gICB2YXIgdGltZXIsXG4vLyAgIG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtbXV0YXRlXScpO1xuLy8gICAvL1xuLy8gICBpZiAobm9kZXMubGVuZ3RoKSB7XG4vLyAgICAgLy8gdmFyIE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuLy8gICAgIC8vICAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XG4vLyAgICAgLy8gICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuLy8gICAgIC8vICAgICBpZiAocHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlcicgaW4gd2luZG93KSB7XG4vLyAgICAgLy8gICAgICAgcmV0dXJuIHdpbmRvd1twcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJ107XG4vLyAgICAgLy8gICAgIH1cbi8vICAgICAvLyAgIH1cbi8vICAgICAvLyAgIHJldHVybiBmYWxzZTtcbi8vICAgICAvLyB9KCkpO1xuLy9cbi8vXG4vLyAgICAgLy9mb3IgdGhlIGJvZHksIHdlIG5lZWQgdG8gbGlzdGVuIGZvciBhbGwgY2hhbmdlcyBlZmZlY3RpbmcgdGhlIHN0eWxlIGFuZCBjbGFzcyBhdHRyaWJ1dGVzXG4vLyAgICAgdmFyIGJvZHlPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGJvZHlNdXRhdGlvbik7XG4vLyAgICAgYm9keU9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOnRydWUsIGF0dHJpYnV0ZUZpbHRlcjpbXCJzdHlsZVwiLCBcImNsYXNzXCJdfSk7XG4vL1xuLy9cbi8vICAgICAvL2JvZHkgY2FsbGJhY2tcbi8vICAgICBmdW5jdGlvbiBib2R5TXV0YXRpb24obXV0YXRlKSB7XG4vLyAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgbXV0YXRpb24gZXZlbnRcbi8vICAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG4vL1xuLy8gICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuLy8gICAgICAgICBib2R5T2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuLy8gICAgICAgICAkKCdbZGF0YS1tdXRhdGVdJykuYXR0cignZGF0YS1ldmVudHMnLFwibXV0YXRlXCIpO1xuLy8gICAgICAgfSwgZGVib3VuY2UgfHwgMTUwKTtcbi8vICAgICB9XG4vLyAgIH1cbi8vIH1cbiIsIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyBGb3VuZGF0aW9uIENvcmVcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLmNvcmUuanMnO1xuLy8gRm91bmRhdGlvbiBVdGlsaXRpZXNcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwuYm94LmpzJztcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQuanMnO1xuaW1wb3J0ICdmb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5LmpzJztcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzJztcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwubmVzdC5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIuanMnO1xuaW1wb3J0ICdmb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC50b3VjaC5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzLmpzJztcbi8vIEZvdW5kYXRpb24gUGx1Z2lucy4gQWRkIG9yIHJlbW92ZSBhcyBuZWVkZWQgZm9yIHlvdXIgc2l0ZVxuaW1wb3J0ICdmb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24uZHJpbGxkb3duLmpzJztcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLmRyb3Bkb3duTWVudS5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi5yZXNwb25zaXZlTWVudS5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi5vZmZjYW52YXMuanMnO1xuXG5pbXBvcnQganF1ZXJ5IGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgcHJlcElucHV0cyBmcm9tICdtb2R1bGVzL3ByZXBpbnB1dHMuanMnO1xuaW1wb3J0IHNvY2lhbFNoYXJlIGZyb20gJ21vZHVsZXMvc29jaWFsU2hhcmUuanMnO1xuaW1wb3J0IGNhcm91c2VsIGZyb20gJ21vZHVsZXMvY2Fyb3VzZWwuanMnO1xuXG4oZnVuY3Rpb24oJCkge1xuICAvLyBJbml0aWFsaXplIEZvdW5kYXRpb25cbiAgJChkb2N1bWVudCkuZm91bmRhdGlvbigpO1xuXG4gIC8vIFByZXBhcmUgZm9ybSBpbnB1dHNcbiAgcHJlcElucHV0cygpO1xuICAvLyBJbml0aWFsaXplIHNvY2lhbCBzaGFyZSBmdW5jdGlvbmFsaXR5XG4gIC8vIFJlcGxhY2UgdGhlIGVtcHR5IHN0cmluZyBwYXJhbWV0ZXIgd2l0aCB5b3VyIEZhY2Vib29rIElEXG4gIHNvY2lhbFNoYXJlKCcnKTtcblxuICAvLyBJbml0aWFsaXplIGNhcm91c2Vsc1xuICBjYXJvdXNlbCgpO1xuXG4gIC8vIEluaXRpYWxpemUgUGx1Z2luc1xuICAkKCcubWFnbmlmaWMtdHJpZ2dlcicpLm1hZ25pZmljUG9wdXAoe1xuICAgIHR5cGU6ICdpbmxpbmUnLFxuICB9KTtcblxuICAkKCcubWVlcmthdC1jdGEnKS5tZWVya2F0KHtcbiAgICBiYWNrZ3JvdW5kOiAncmdiKDIxLCA3NiwgMTAyKSByZXBlYXQteCBsZWZ0IHRvcCcsXG4gICAgaGVpZ2h0OiAnMTIwcHgnLFxuICAgIHdpZHRoOiAnMTAwJScsXG4gICAgcG9zaXRpb246ICdib3R0b20nLFxuICAgIGNsb3NlOiAnLmNsb3NlLW1lZXJrYXQnLFxuICAgIGRvbnRTaG93QWdhaW46ICcuZG9udC1zaG93JyxcbiAgICBhbmltYXRpb25JbjogJ2ZhZGUnLFxuICAgIGFuaW1hdGlvblNwZWVkOiA1MDAsXG4gICAgb3BhY2l0eTogMC45LFxuICB9KTtcbn0pKGpxdWVyeSk7XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcbmltcG9ydCAndmVuZG9yL2pxdWVyeS5zbGljay5qcyc7XG5cbmNvbnN0IGNhcm91c2VsID0gZnVuY3Rpb24oKSB7XG4gICQoJy5qcy1jYXJvdXNlbCcpLnNsaWNrKHtcbiAgICBhZGFwdGl2ZUhlaWdodDogdHJ1ZSxcbiAgICBkb3RzOiBmYWxzZSxcbiAgICBjZW50ZXJNb2RlOiB0cnVlLFxuICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICBhcnJvd3M6IHRydWUsXG4gICAgY2VudGVyUGFkZGluZzogJzBweCcsXG4gICAgaW5maW5pdGU6IGZhbHNlLFxuICAgIHByZXZBcnJvdzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwidGlueVwiPidcbiAgICAgICAgKyAnPGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLWxlZnRcIj48L2k+PC9idXR0b24+JyxcbiAgICBuZXh0QXJyb3c6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInRpbnlcIj4nICtcbiAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1yaWdodFwiPjwvaT48L2J1dHRvbj4nLFxuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNhcm91c2VsO1xuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5cbmNvbnN0IHByZXBpbnB1dHMgPSBmdW5jdGlvbigpIHtcbiAgJCgnaW5wdXQsIHRleHRhcmVhJykucGxhY2Vob2xkZXIoKVxuICAgIC5maWx0ZXIoJ1t0eXBlPVwidGV4dFwiXSwgW3R5cGU9XCJlbWFpbFwiXSwgW3R5cGU9XCJ0ZWxcIl0sIFt0eXBlPVwicGFzc3dvcmRcIl0nKVxuICAgIC5hZGRDbGFzcygndGV4dCcpLmVuZCgpXG4gICAgLmZpbHRlcignW3R5cGU9XCJjaGVja2JveFwiXScpLmFkZENsYXNzKCdjaGVja2JveCcpLmVuZCgpXG4gICAgLmZpbHRlcignW3R5cGU9XCJyYWRpb1wiXScpLmFkZENsYXNzKCdyYWRpb2J1dHRvbicpLmVuZCgpXG4gICAgLmZpbHRlcignW3R5cGU9XCJzdWJtaXRcIl0nKS5hZGRDbGFzcygnc3VibWl0JykuZW5kKClcbiAgICAuZmlsdGVyKCdbdHlwZT1cImltYWdlXCJdJykuYWRkQ2xhc3MoJ2J1dHRvbkltYWdlJyk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBwcmVwaW5wdXRzO1xuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5cbmNvbnN0IHNvY2lhbFNoYXJlID0gZnVuY3Rpb24oZmJJZCkge1xuICBjb25zdCAkYm9keSA9ICQoJ2JvZHknKTtcblxuICAvLyBGYWNlYm9vayBzaGFyaW5nIHdpdGggdGhlIFNES1xuICAkLmdldFNjcmlwdCgnLy9jb25uZWN0LmZhY2Vib29rLm5ldC9lbl9VUy9zZGsuanMnKS5kb25lKGZ1bmN0aW9uKCkge1xuICAgICRib2R5Lm9uKCdjbGljay5zaGFyZXItZmInLCAnLnNoYXJlci1mYicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNvbnN0ICRsaW5rID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgbWV0aG9kOiAnZmVlZCcsXG4gICAgICAgIGRpc3BsYXk6ICdwb3B1cCcsXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV3VXJsID0gJGxpbmsuZGF0YSgncmVkaXJlY3QtdG8nKSA/XG4gICAgICAgICAgJGxpbmsuZGF0YSgncmVkaXJlY3QtdG8nKSA6IG51bGw7XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgd2luZG93LkZCLmluaXQoe1xuICAgICAgICBhcHBJZDogZmJJZCxcbiAgICAgICAgeGZibWw6IGZhbHNlLFxuICAgICAgICB2ZXJzaW9uOiAndjIuMCcsXG4gICAgICAgIHN0YXR1czogZmFsc2UsXG4gICAgICAgIGNvb2tpZTogdHJ1ZSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoJGxpbmsuZGF0YSgndGl0bGUnKSkge1xuICAgICAgICBvcHRpb25zLm5hbWUgPSAkbGluay5kYXRhKCd0aXRsZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJGxpbmsuZGF0YSgndXJsJykpIHtcbiAgICAgICAgb3B0aW9ucy5saW5rID0gJGxpbmsuZGF0YSgndXJsJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICgkbGluay5kYXRhKCdwaWN0dXJlJykpIHtcbiAgICAgICAgb3B0aW9ucy5waWN0dXJlID0gJGxpbmsuZGF0YSgncGljdHVyZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJGxpbmsuZGF0YSgnZGVzY3JpcHRpb24nKSkge1xuICAgICAgICBvcHRpb25zLmRlc2NyaXB0aW9uID0gJGxpbmsuZGF0YSgnZGVzY3JpcHRpb24nKTtcbiAgICAgIH1cblxuICAgICAgd2luZG93LkZCLnVpKG9wdGlvbnMsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChuZXdVcmwpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IG5ld1VybDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIFR3aXR0ZXIgc2hhcmluZ1xuICAkYm9keS5vbignY2xpY2suc2hhcmVyLXR3JywgJy5zaGFyZXItdHcnLCBmdW5jdGlvbihlKSB7XG4gICAgY29uc3QgJGxpbmsgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgY29uc3QgdXJsID0gJGxpbmsuZGF0YSgndXJsJyk7XG4gICAgY29uc3QgdGV4dCA9ICRsaW5rLmRhdGEoJ2Rlc2NyaXB0aW9uJyk7XG4gICAgY29uc3QgdmlhID0gJGxpbmsuZGF0YSgnc291cmNlJyk7XG4gICAgbGV0IHR3aXR0ZXJVUkwgPSBgaHR0cHM6Ly90d2l0dGVyLmNvbS9zaGFyZT91cmw9JHtlbmNvZGVVUklDb21wb25lbnQodXJsKX1gO1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgaWYgKHRleHQpIHtcbiAgICAgIHR3aXR0ZXJVUkwgKz0gYCZ0ZXh0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpfWA7XG4gICAgfVxuICAgIGlmICh2aWEpIHtcbiAgICAgIHR3aXR0ZXJVUkwgKz0gYCZ2aWE9JHtlbmNvZGVVUklDb21wb25lbnQodmlhKX1gO1xuICAgIH1cbiAgICB3aW5kb3cub3Blbih0d2l0dGVyVVJMLCAndHdlZXQnLFxuICAgICAgICAnd2lkdGg9NTAwLGhlaWdodD0zODQsbWVudWJhcj1ubyxzdGF0dXM9bm8sdG9vbGJhcj1ubycpO1xuICB9KTtcblxuICAvLyBMaW5rZWRJbiBzaGFyaW5nXG4gICRib2R5Lm9uKCdjbGljay5zaGFyZXItbGknLCAnLnNoYXJlci1saScsIGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zdCAkbGluayA9ICQoZS50YXJnZXQpO1xuICAgIGNvbnN0IHVybCA9ICRsaW5rLmRhdGEoJ3VybCcpO1xuICAgIGNvbnN0IHRpdGxlID0gJGxpbmsuZGF0YSgndGl0bGUnKTtcbiAgICBjb25zdCBzdW1tYXJ5ID0gJGxpbmsuZGF0YSgnZGVzY3JpcHRpb24nKTtcbiAgICBjb25zdCBzb3VyY2UgPSAkbGluay5kYXRhKCdzb3VyY2UnKTtcbiAgICBsZXQgbGlua2VkaW5VUkwgPSAnaHR0cHM6Ly93d3cubGlua2VkaW4uY29tL3NoYXJlQXJ0aWNsZT9taW5pPXRydWUmdXJsPScgK1xuICAgICAgICBlbmNvZGVVUklDb21wb25lbnQodXJsKTtcblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGlmICh0aXRsZSkge1xuICAgICAgbGlua2VkaW5VUkwgKz0gYCZ0aXRsZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aXRsZSl9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlua2VkaW5VUkwgKz0gJyZ0aXRsZT0nO1xuICAgIH1cblxuICAgIGlmIChzdW1tYXJ5KSB7XG4gICAgICBsaW5rZWRpblVSTCArPVxuICAgICAgICAgIGAmc3VtbWFyeT0ke2VuY29kZVVSSUNvbXBvbmVudChzdW1tYXJ5LnN1YnN0cmluZygwLCAyNTYpKX1gO1xuICAgIH1cblxuICAgIGlmIChzb3VyY2UpIHtcbiAgICAgIGxpbmtlZGluVVJMICs9IGAmc291cmNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNvdXJjZSl9YDtcbiAgICB9XG5cbiAgICB3aW5kb3cub3BlbihsaW5rZWRpblVSTCwgJ2xpbmtlZGluJyxcbiAgICAgICAgJ3dpZHRoPTUyMCxoZWlnaHQ9NTcwLG1lbnViYXI9bm8sc3RhdHVzPW5vLHRvb2xiYXI9bm8nKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBzb2NpYWxTaGFyZTtcbiIsIi8qXG4gICAgIF8gXyAgICAgIF8gICAgICAgX1xuIF9fX3wgKF8pIF9fX3wgfCBfXyAgKF8pX19fXG4vIF9ffCB8IHwvIF9ffCB8LyAvICB8IC8gX198XG5cXF9fIFxcIHwgfCAoX198ICAgPCBfIHwgXFxfXyBcXFxufF9fXy9ffF98XFxfX198X3xcXF8oXykvIHxfX18vXG4gICAgICAgICAgICAgICAgICAgfF9fL1xuXG4gVmVyc2lvbjogMS41LjBcbiAgQXV0aG9yOiBLZW4gV2hlZWxlclxuIFdlYnNpdGU6IGh0dHA6Ly9rZW53aGVlbGVyLmdpdGh1Yi5pb1xuICAgIERvY3M6IGh0dHA6Ly9rZW53aGVlbGVyLmdpdGh1Yi5pby9zbGlja1xuICAgIFJlcG86IGh0dHA6Ly9naXRodWIuY29tL2tlbndoZWVsZXIvc2xpY2tcbiAgSXNzdWVzOiBodHRwOi8vZ2l0aHViLmNvbS9rZW53aGVlbGVyL3NsaWNrL2lzc3Vlc1xuXG4gKi9cbi8qIGdsb2JhbCB3aW5kb3csIGRvY3VtZW50LCBkZWZpbmUsIGpRdWVyeSwgc2V0SW50ZXJ2YWwsIGNsZWFySW50ZXJ2YWwgKi9cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICB9IGVsc2Uge1xuICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgfVxufShmdW5jdGlvbigkKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgbGV0IFNsaWNrID0gd2luZG93LlNsaWNrIHx8IHt9O1xuXG4gIFNsaWNrID0gKGZ1bmN0aW9uKCkge1xuICAgIGxldCBpbnN0YW5jZVVpZCA9IDA7XG5cbiAgICBmdW5jdGlvbiBTbGljayhlbGVtZW50LCBzZXR0aW5ncykge1xuICAgICAgbGV0IF8gPSB0aGlzLFxuICAgICAgICBkYXRhU2V0dGluZ3MsIHJlc3BvbnNpdmVTZXR0aW5ncywgYnJlYWtwb2ludDtcblxuICAgICAgXy5kZWZhdWx0cyA9IHtcbiAgICAgICAgYWNjZXNzaWJpbGl0eTogdHJ1ZSxcbiAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IGZhbHNlLFxuICAgICAgICBhcHBlbmRBcnJvd3M6ICQoZWxlbWVudCksXG4gICAgICAgIGFwcGVuZERvdHM6ICQoZWxlbWVudCksXG4gICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgYXNOYXZGb3I6IG51bGwsXG4gICAgICAgIHByZXZBcnJvdzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIiBjbGFzcz1cInNsaWNrLXByZXZcIiBhcmlhLWxhYmVsPVwicHJldmlvdXNcIj5QcmV2aW91czwvYnV0dG9uPicsXG4gICAgICAgIG5leHRBcnJvdzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIiBjbGFzcz1cInNsaWNrLW5leHRcIiBhcmlhLWxhYmVsPVwibmV4dFwiPk5leHQ8L2J1dHRvbj4nLFxuICAgICAgICBhdXRvcGxheTogZmFsc2UsXG4gICAgICAgIGF1dG9wbGF5U3BlZWQ6IDMwMDAsXG4gICAgICAgIGNlbnRlck1vZGU6IGZhbHNlLFxuICAgICAgICBjZW50ZXJQYWRkaW5nOiAnNTBweCcsXG4gICAgICAgIGNzc0Vhc2U6ICdlYXNlJyxcbiAgICAgICAgY3VzdG9tUGFnaW5nOiBmdW5jdGlvbihzbGlkZXIsIGkpIHtcbiAgICAgICAgICByZXR1cm4gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIj4nICsgKGkgKyAxKSArICc8L2J1dHRvbj4nO1xuICAgICAgICB9LFxuICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgZG90c0NsYXNzOiAnc2xpY2stZG90cycsXG4gICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgZWFzaW5nOiAnbGluZWFyJyxcbiAgICAgICAgZWRnZUZyaWN0aW9uOiAwLjM1LFxuICAgICAgICBmYWRlOiBmYWxzZSxcbiAgICAgICAgZm9jdXNPblNlbGVjdDogZmFsc2UsXG4gICAgICAgIGluZmluaXRlOiB0cnVlLFxuICAgICAgICBpbml0aWFsU2xpZGU6IDAsXG4gICAgICAgIGxhenlMb2FkOiAnb25kZW1hbmQnLFxuICAgICAgICBtb2JpbGVGaXJzdDogZmFsc2UsXG4gICAgICAgIHBhdXNlT25Ib3ZlcjogdHJ1ZSxcbiAgICAgICAgcGF1c2VPbkRvdHNIb3ZlcjogZmFsc2UsXG4gICAgICAgIHJlc3BvbmRUbzogJ3dpbmRvdycsXG4gICAgICAgIHJlc3BvbnNpdmU6IG51bGwsXG4gICAgICAgIHJvd3M6IDEsXG4gICAgICAgIHJ0bDogZmFsc2UsXG4gICAgICAgIHNsaWRlOiAnJyxcbiAgICAgICAgc2xpZGVzUGVyUm93OiAxLFxuICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXG4gICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICBzcGVlZDogNTAwLFxuICAgICAgICBzd2lwZTogdHJ1ZSxcbiAgICAgICAgc3dpcGVUb1NsaWRlOiBmYWxzZSxcbiAgICAgICAgdG91Y2hNb3ZlOiB0cnVlLFxuICAgICAgICB0b3VjaFRocmVzaG9sZDogNSxcbiAgICAgICAgdXNlQ1NTOiB0cnVlLFxuICAgICAgICB2YXJpYWJsZVdpZHRoOiBmYWxzZSxcbiAgICAgICAgdmVydGljYWw6IGZhbHNlLFxuICAgICAgICB2ZXJ0aWNhbFN3aXBpbmc6IGZhbHNlLFxuICAgICAgICB3YWl0Rm9yQW5pbWF0ZTogdHJ1ZSxcbiAgICAgIH07XG5cbiAgICAgIF8uaW5pdGlhbHMgPSB7XG4gICAgICAgIGFuaW1hdGluZzogZmFsc2UsXG4gICAgICAgIGRyYWdnaW5nOiBmYWxzZSxcbiAgICAgICAgYXV0b1BsYXlUaW1lcjogbnVsbCxcbiAgICAgICAgY3VycmVudERpcmVjdGlvbjogMCxcbiAgICAgICAgY3VycmVudExlZnQ6IG51bGwsXG4gICAgICAgIGN1cnJlbnRTbGlkZTogMCxcbiAgICAgICAgZGlyZWN0aW9uOiAxLFxuICAgICAgICAkZG90czogbnVsbCxcbiAgICAgICAgbGlzdFdpZHRoOiBudWxsLFxuICAgICAgICBsaXN0SGVpZ2h0OiBudWxsLFxuICAgICAgICBsb2FkSW5kZXg6IDAsXG4gICAgICAgICRuZXh0QXJyb3c6IG51bGwsXG4gICAgICAgICRwcmV2QXJyb3c6IG51bGwsXG4gICAgICAgIHNsaWRlQ291bnQ6IG51bGwsXG4gICAgICAgIHNsaWRlV2lkdGg6IG51bGwsXG4gICAgICAgICRzbGlkZVRyYWNrOiBudWxsLFxuICAgICAgICAkc2xpZGVzOiBudWxsLFxuICAgICAgICBzbGlkaW5nOiBmYWxzZSxcbiAgICAgICAgc2xpZGVPZmZzZXQ6IDAsXG4gICAgICAgIHN3aXBlTGVmdDogbnVsbCxcbiAgICAgICAgJGxpc3Q6IG51bGwsXG4gICAgICAgIHRvdWNoT2JqZWN0OiB7fSxcbiAgICAgICAgdHJhbnNmb3Jtc0VuYWJsZWQ6IGZhbHNlLFxuICAgICAgfTtcblxuICAgICAgJC5leHRlbmQoXywgXy5pbml0aWFscyk7XG5cbiAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9IG51bGw7XG4gICAgICBfLmFuaW1UeXBlID0gbnVsbDtcbiAgICAgIF8uYW5pbVByb3AgPSBudWxsO1xuICAgICAgXy5icmVha3BvaW50cyA9IFtdO1xuICAgICAgXy5icmVha3BvaW50U2V0dGluZ3MgPSBbXTtcbiAgICAgIF8uY3NzVHJhbnNpdGlvbnMgPSBmYWxzZTtcbiAgICAgIF8uaGlkZGVuID0gJ2hpZGRlbic7XG4gICAgICBfLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgXy5wb3NpdGlvblByb3AgPSBudWxsO1xuICAgICAgXy5yZXNwb25kVG8gPSBudWxsO1xuICAgICAgXy5yb3dDb3VudCA9IDE7XG4gICAgICBfLnNob3VsZENsaWNrID0gdHJ1ZTtcbiAgICAgIF8uJHNsaWRlciA9ICQoZWxlbWVudCk7XG4gICAgICBfLiRzbGlkZXNDYWNoZSA9IG51bGw7XG4gICAgICBfLnRyYW5zZm9ybVR5cGUgPSBudWxsO1xuICAgICAgXy50cmFuc2l0aW9uVHlwZSA9IG51bGw7XG4gICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAndmlzaWJpbGl0eWNoYW5nZSc7XG4gICAgICBfLndpbmRvd1dpZHRoID0gMDtcbiAgICAgIF8ud2luZG93VGltZXIgPSBudWxsO1xuXG4gICAgICBkYXRhU2V0dGluZ3MgPSAkKGVsZW1lbnQpLmRhdGEoJ3NsaWNrJykgfHwge307XG5cbiAgICAgIF8ub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBfLmRlZmF1bHRzLCBkYXRhU2V0dGluZ3MsIHNldHRpbmdzKTtcblxuICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuXG4gICAgICBfLm9yaWdpbmFsU2V0dGluZ3MgPSBfLm9wdGlvbnM7XG4gICAgICByZXNwb25zaXZlU2V0dGluZ3MgPSBfLm9wdGlvbnMucmVzcG9uc2l2ZSB8fCBudWxsO1xuXG4gICAgICBpZiAocmVzcG9uc2l2ZVNldHRpbmdzICYmIHJlc3BvbnNpdmVTZXR0aW5ncy5sZW5ndGggPiAtMSkge1xuICAgICAgICBfLnJlc3BvbmRUbyA9IF8ub3B0aW9ucy5yZXNwb25kVG8gfHwgJ3dpbmRvdyc7XG4gICAgICAgIGZvciAoYnJlYWtwb2ludCBpbiByZXNwb25zaXZlU2V0dGluZ3MpIHtcbiAgICAgICAgICBpZiAocmVzcG9uc2l2ZVNldHRpbmdzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnB1c2gocmVzcG9uc2l2ZVNldHRpbmdzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnRdLmJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3NbcmVzcG9uc2l2ZVNldHRpbmdzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50XS5icmVha3BvaW50XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2l2ZVNldHRpbmdzW2JyZWFrcG9pbnRdLnNldHRpbmdzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfLmJyZWFrcG9pbnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgIGlmIChfLm9wdGlvbnMubW9iaWxlRmlyc3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybiBhIC0gYjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGIgLSBhO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgZG9jdW1lbnQubW96SGlkZGVuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBfLmhpZGRlbiA9ICdtb3pIaWRkZW4nO1xuICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAnbW96dmlzaWJpbGl0eWNoYW5nZSc7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tc0hpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgXy5oaWRkZW4gPSAnbXNIaWRkZW4nO1xuICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAnbXN2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LndlYmtpdEhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgXy5oaWRkZW4gPSAnd2Via2l0SGlkZGVuJztcbiAgICAgICAgXy52aXNpYmlsaXR5Q2hhbmdlID0gJ3dlYmtpdHZpc2liaWxpdHljaGFuZ2UnO1xuICAgICAgfVxuXG4gICAgICBfLmF1dG9QbGF5ID0gJC5wcm94eShfLmF1dG9QbGF5LCBfKTtcbiAgICAgIF8uYXV0b1BsYXlDbGVhciA9ICQucHJveHkoXy5hdXRvUGxheUNsZWFyLCBfKTtcbiAgICAgIF8uY2hhbmdlU2xpZGUgPSAkLnByb3h5KF8uY2hhbmdlU2xpZGUsIF8pO1xuICAgICAgXy5jbGlja0hhbmRsZXIgPSAkLnByb3h5KF8uY2xpY2tIYW5kbGVyLCBfKTtcbiAgICAgIF8uc2VsZWN0SGFuZGxlciA9ICQucHJveHkoXy5zZWxlY3RIYW5kbGVyLCBfKTtcbiAgICAgIF8uc2V0UG9zaXRpb24gPSAkLnByb3h5KF8uc2V0UG9zaXRpb24sIF8pO1xuICAgICAgXy5zd2lwZUhhbmRsZXIgPSAkLnByb3h5KF8uc3dpcGVIYW5kbGVyLCBfKTtcbiAgICAgIF8uZHJhZ0hhbmRsZXIgPSAkLnByb3h5KF8uZHJhZ0hhbmRsZXIsIF8pO1xuICAgICAgXy5rZXlIYW5kbGVyID0gJC5wcm94eShfLmtleUhhbmRsZXIsIF8pO1xuICAgICAgXy5hdXRvUGxheUl0ZXJhdG9yID0gJC5wcm94eShfLmF1dG9QbGF5SXRlcmF0b3IsIF8pO1xuXG4gICAgICBfLmluc3RhbmNlVWlkID0gaW5zdGFuY2VVaWQrKztcblxuICAgICAgICAgICAgLy8gQSBzaW1wbGUgd2F5IHRvIGNoZWNrIGZvciBIVE1MIHN0cmluZ3NcbiAgICAgICAgICAgIC8vIFN0cmljdCBIVE1MIHJlY29nbml0aW9uIChtdXN0IHN0YXJ0IHdpdGggPClcbiAgICAgICAgICAgIC8vIEV4dHJhY3RlZCBmcm9tIGpRdWVyeSB2MS4xMSBzb3VyY2VcbiAgICAgIF8uaHRtbEV4cHIgPSAvXig/OlxccyooPFtcXHdcXFddKz4pW14+XSopJC87XG5cbiAgICAgIF8uaW5pdCgpO1xuXG4gICAgICBfLmNoZWNrUmVzcG9uc2l2ZSh0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gU2xpY2s7XG4gIH0oKSk7XG5cbiAgU2xpY2sucHJvdG90eXBlLmFkZFNsaWRlID0gU2xpY2sucHJvdG90eXBlLnNsaWNrQWRkID0gZnVuY3Rpb24obWFya3VwLCBpbmRleCwgYWRkQmVmb3JlKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdib29sZWFuJykge1xuICAgICAgYWRkQmVmb3JlID0gaW5kZXg7XG4gICAgICBpbmRleCA9IG51bGw7XG4gICAgfSBlbHNlIGlmIChpbmRleCA8IDAgfHwgKGluZGV4ID49IF8uc2xpZGVDb3VudCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBfLnVubG9hZCgpO1xuXG4gICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdudW1iZXInKSB7XG4gICAgICBpZiAoaW5kZXggPT09IDAgJiYgXy4kc2xpZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAkKG1hcmt1cCkuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICB9IGVsc2UgaWYgKGFkZEJlZm9yZSkge1xuICAgICAgICAkKG1hcmt1cCkuaW5zZXJ0QmVmb3JlKF8uJHNsaWRlcy5lcShpbmRleCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJChtYXJrdXApLmluc2VydEFmdGVyKF8uJHNsaWRlcy5lcShpbmRleCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYWRkQmVmb3JlID09PSB0cnVlKSB7XG4gICAgICAgICQobWFya3VwKS5wcmVwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKG1hcmt1cCkuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgXy4kc2xpZGVzID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpO1xuXG4gICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgXy4kc2xpZGVUcmFjay5hcHBlbmQoXy4kc2xpZGVzKTtcblxuICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAkKGVsZW1lbnQpLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBpbmRleCk7XG4gICAgfSk7XG5cbiAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgIF8ucmVpbml0KCk7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLmFuaW1hdGVIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG4gICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT09IDEgJiYgXy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0ID09PSB0cnVlICYmIF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgIGxldCB0YXJnZXRIZWlnaHQgPSBfLiRzbGlkZXMuZXEoXy5jdXJyZW50U2xpZGUpLm91dGVySGVpZ2h0KHRydWUpO1xuICAgICAgXy4kbGlzdC5hbmltYXRlKHtcbiAgICAgICAgaGVpZ2h0OiB0YXJnZXRIZWlnaHQsXG4gICAgICB9LCBfLm9wdGlvbnMuc3BlZWQpO1xuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuYW5pbWF0ZVNsaWRlID0gZnVuY3Rpb24odGFyZ2V0TGVmdCwgY2FsbGJhY2spIHtcbiAgICBsZXQgYW5pbVByb3BzID0ge30sXG4gICAgICBfID0gdGhpcztcblxuICAgIF8uYW5pbWF0ZUhlaWdodCgpO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgdGFyZ2V0TGVmdCA9IC10YXJnZXRMZWZ0O1xuICAgIH1cbiAgICBpZiAoXy50cmFuc2Zvcm1zRW5hYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgIF8uJHNsaWRlVHJhY2suYW5pbWF0ZSh7XG4gICAgICAgICAgbGVmdDogdGFyZ2V0TGVmdCxcbiAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfLiRzbGlkZVRyYWNrLmFuaW1hdGUoe1xuICAgICAgICAgIHRvcDogdGFyZ2V0TGVmdCxcbiAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAgIF8uY3VycmVudExlZnQgPSAtKF8uY3VycmVudExlZnQpO1xuICAgICAgICB9XG4gICAgICAgICQoe1xuICAgICAgICAgIGFuaW1TdGFydDogXy5jdXJyZW50TGVmdCxcbiAgICAgICAgfSkuYW5pbWF0ZSh7XG4gICAgICAgICAgYW5pbVN0YXJ0OiB0YXJnZXRMZWZ0LFxuICAgICAgICB9LCB7XG4gICAgICAgICAgZHVyYXRpb246IF8ub3B0aW9ucy5zcGVlZCxcbiAgICAgICAgICBlYXNpbmc6IF8ub3B0aW9ucy5lYXNpbmcsXG4gICAgICAgICAgc3RlcDogZnVuY3Rpb24obm93KSB7XG4gICAgICAgICAgICBub3cgPSBNYXRoLmNlaWwobm93KTtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUoJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyArICdweCwgMHB4KSc7XG4gICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKGFuaW1Qcm9wcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKDBweCwnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ICsgJ3B4KSc7XG4gICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKGFuaW1Qcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgXy5hcHBseVRyYW5zaXRpb24oKTtcbiAgICAgICAgdGFyZ2V0TGVmdCA9IE1hdGguY2VpbCh0YXJnZXRMZWZ0KTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUzZCgnICsgdGFyZ2V0TGVmdCArICdweCwgMHB4LCAwcHgpJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoMHB4LCcgKyB0YXJnZXRMZWZ0ICsgJ3B4LCAwcHgpJztcbiAgICAgICAgfVxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhhbmltUHJvcHMpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfLmRpc2FibGVUcmFuc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5hc05hdkZvciA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgbGV0IF8gPSB0aGlzLFxuICAgICAgYXNOYXZGb3IgPSBfLm9wdGlvbnMuYXNOYXZGb3IgIT09IG51bGwgPyAkKF8ub3B0aW9ucy5hc05hdkZvcikuc2xpY2soJ2dldFNsaWNrJykgOiBudWxsO1xuICAgIGlmIChhc05hdkZvciAhPT0gbnVsbCkgYXNOYXZGb3Iuc2xpZGVIYW5kbGVyKGluZGV4LCB0cnVlKTtcbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuYXBwbHlUcmFuc2l0aW9uID0gZnVuY3Rpb24oc2xpZGUpIHtcbiAgICBsZXQgXyA9IHRoaXMsXG4gICAgICB0cmFuc2l0aW9uID0ge307XG5cbiAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICB0cmFuc2l0aW9uW18udHJhbnNpdGlvblR5cGVdID0gXy50cmFuc2Zvcm1UeXBlICsgJyAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJhbnNpdGlvbltfLnRyYW5zaXRpb25UeXBlXSA9ICdvcGFjaXR5ICcgKyBfLm9wdGlvbnMuc3BlZWQgKyAnbXMgJyArIF8ub3B0aW9ucy5jc3NFYXNlO1xuICAgIH1cblxuICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICBfLiRzbGlkZXMuZXEoc2xpZGUpLmNzcyh0cmFuc2l0aW9uKTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLmF1dG9QbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgaWYgKF8uYXV0b1BsYXlUaW1lcikge1xuICAgICAgY2xlYXJJbnRlcnZhbChfLmF1dG9QbGF5VGltZXIpO1xuICAgIH1cblxuICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmIF8ucGF1c2VkICE9PSB0cnVlKSB7XG4gICAgICBfLmF1dG9QbGF5VGltZXIgPSBzZXRJbnRlcnZhbChfLmF1dG9QbGF5SXRlcmF0b3IsXG4gICAgICAgICAgICAgICAgXy5vcHRpb25zLmF1dG9wbGF5U3BlZWQpO1xuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXlDbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcbiAgICBpZiAoXy5hdXRvUGxheVRpbWVyKSB7XG4gICAgICBjbGVhckludGVydmFsKF8uYXV0b1BsYXlUaW1lcik7XG4gICAgfVxuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5hdXRvUGxheUl0ZXJhdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgIGlmIChfLmRpcmVjdGlvbiA9PT0gMSkge1xuICAgICAgICBpZiAoKF8uY3VycmVudFNsaWRlICsgMSkgPT09IF8uc2xpZGVDb3VudCAtXG4gICAgICAgICAgICAgICAgICAgIDEpIHtcbiAgICAgICAgICBfLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmN1cnJlbnRTbGlkZSArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoKF8uY3VycmVudFNsaWRlIC0gMSA9PT0gMCkpIHtcbiAgICAgICAgICBfLmRpcmVjdGlvbiA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmN1cnJlbnRTbGlkZSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLmJ1aWxkQXJyb3dzID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgXy4kcHJldkFycm93ID0gJChfLm9wdGlvbnMucHJldkFycm93KTtcbiAgICAgIF8uJG5leHRBcnJvdyA9ICQoXy5vcHRpb25zLm5leHRBcnJvdyk7XG5cbiAgICAgIGlmIChfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLnByZXZBcnJvdykpIHtcbiAgICAgICAgXy4kcHJldkFycm93LmFwcGVuZFRvKF8ub3B0aW9ucy5hcHBlbmRBcnJvd3MpO1xuICAgICAgfVxuXG4gICAgICBpZiAoXy5odG1sRXhwci50ZXN0KF8ub3B0aW9ucy5uZXh0QXJyb3cpKSB7XG4gICAgICAgIF8uJG5leHRBcnJvdy5hcHBlbmRUbyhfLm9wdGlvbnMuYXBwZW5kQXJyb3dzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSAhPT0gdHJ1ZSkge1xuICAgICAgICBfLiRwcmV2QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5idWlsZERvdHMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXMsXG4gICAgICBpLCBkb3RTdHJpbmc7XG5cbiAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgZG90U3RyaW5nID0gJzx1bCBjbGFzcz1cIicgKyBfLm9wdGlvbnMuZG90c0NsYXNzICsgJ1wiPic7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPD0gXy5nZXREb3RDb3VudCgpOyBpICs9IDEpIHtcbiAgICAgICAgZG90U3RyaW5nICs9ICc8bGk+JyArIF8ub3B0aW9ucy5jdXN0b21QYWdpbmcuY2FsbCh0aGlzLCBfLCBpKSArICc8L2xpPic7XG4gICAgICB9XG5cbiAgICAgIGRvdFN0cmluZyArPSAnPC91bD4nO1xuXG4gICAgICBfLiRkb3RzID0gJChkb3RTdHJpbmcpLmFwcGVuZFRvKFxuICAgICAgICAgICAgICAgIF8ub3B0aW9ucy5hcHBlbmREb3RzKTtcblxuICAgICAgXy4kZG90cy5maW5kKCdsaScpLmZpcnN0KCkuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgfVxuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5idWlsZE91dCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlci5jaGlsZHJlbihcbiAgICAgICAgICAgICc6bm90KC5zbGljay1jbG9uZWQpJykuYWRkQ2xhc3MoXG4gICAgICAgICAgICAnc2xpY2stc2xpZGUnKTtcbiAgICBfLnNsaWRlQ291bnQgPSBfLiRzbGlkZXMubGVuZ3RoO1xuXG4gICAgXy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICQoZWxlbWVudCkuYXR0cignZGF0YS1zbGljay1pbmRleCcsIGluZGV4KTtcbiAgICB9KTtcblxuICAgIF8uJHNsaWRlc0NhY2hlID0gXy4kc2xpZGVzO1xuXG4gICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1zbGlkZXInKTtcblxuICAgIF8uJHNsaWRlVHJhY2sgPSAoXy5zbGlkZUNvdW50ID09PSAwKSA/XG4gICAgICAgICAgICAkKCc8ZGl2IGNsYXNzPVwic2xpY2stdHJhY2tcIi8+JykuYXBwZW5kVG8oXy4kc2xpZGVyKSA6XG4gICAgICAgICAgICBfLiRzbGlkZXMud3JhcEFsbCgnPGRpdiBjbGFzcz1cInNsaWNrLXRyYWNrXCIvPicpLnBhcmVudCgpO1xuXG4gICAgXy4kbGlzdCA9IF8uJHNsaWRlVHJhY2sud3JhcChcbiAgICAgICAgICAgICc8ZGl2IGFyaWEtbGl2ZT1cInBvbGl0ZVwiIGNsYXNzPVwic2xpY2stbGlzdFwiLz4nKS5wYXJlbnQoKTtcbiAgICBfLiRzbGlkZVRyYWNrLmNzcygnb3BhY2l0eScsIDApO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlIHx8IF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPT09IHRydWUpIHtcbiAgICAgIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA9IDE7XG4gICAgfVxuXG4gICAgJCgnaW1nW2RhdGEtbGF6eV0nLCBfLiRzbGlkZXIpLm5vdCgnW3NyY10nKS5hZGRDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgXy5zZXR1cEluZmluaXRlKCk7XG5cbiAgICBfLmJ1aWxkQXJyb3dzKCk7XG5cbiAgICBfLmJ1aWxkRG90cygpO1xuXG4gICAgXy51cGRhdGVEb3RzKCk7XG5cbiAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgIF8uJGxpc3QucHJvcCgndGFiSW5kZXgnLCAwKTtcbiAgICB9XG5cbiAgICBfLnNldFNsaWRlQ2xhc3Nlcyh0eXBlb2YgdGhpcy5jdXJyZW50U2xpZGUgPT09ICdudW1iZXInID8gdGhpcy5jdXJyZW50U2xpZGUgOiAwKTtcblxuICAgIGlmIChfLm9wdGlvbnMuZHJhZ2dhYmxlID09PSB0cnVlKSB7XG4gICAgICBfLiRsaXN0LmFkZENsYXNzKCdkcmFnZ2FibGUnKTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLmJ1aWxkUm93cyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcywgYSwgYiwgYywgbmV3U2xpZGVzLCBudW1PZlNsaWRlcywgb3JpZ2luYWxTbGlkZXMsIHNsaWRlc1BlclNlY3Rpb247XG5cbiAgICBuZXdTbGlkZXMgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgb3JpZ2luYWxTbGlkZXMgPSBfLiRzbGlkZXIuY2hpbGRyZW4oKTtcblxuICAgIGlmKF8ub3B0aW9ucy5yb3dzID4gMSkge1xuICAgICAgc2xpZGVzUGVyU2VjdGlvbiA9IF8ub3B0aW9ucy5zbGlkZXNQZXJSb3cgKiBfLm9wdGlvbnMucm93cztcbiAgICAgIG51bU9mU2xpZGVzID0gTWF0aC5jZWlsKFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsU2xpZGVzLmxlbmd0aCAvIHNsaWRlc1BlclNlY3Rpb25cbiAgICAgICAgICAgICk7XG5cbiAgICAgIGZvcihhID0gMDsgYSA8IG51bU9mU2xpZGVzOyBhKyspIHtcbiAgICAgICAgbGV0IHNsaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGZvcihiID0gMDsgYiA8IF8ub3B0aW9ucy5yb3dzOyBiKyspIHtcbiAgICAgICAgICBsZXQgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgZm9yKGMgPSAwOyBjIDwgXy5vcHRpb25zLnNsaWRlc1BlclJvdzsgYysrKSB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gKGEgKiBzbGlkZXNQZXJTZWN0aW9uICsgKChiICogXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyBjKSk7XG4gICAgICAgICAgICBpZiAob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKG9yaWdpbmFsU2xpZGVzLmdldCh0YXJnZXQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgc2xpZGUuYXBwZW5kQ2hpbGQocm93KTtcbiAgICAgICAgfVxuICAgICAgICBuZXdTbGlkZXMuYXBwZW5kQ2hpbGQoc2xpZGUpO1xuICAgICAgfVxuICAgICAgXy4kc2xpZGVyLmh0bWwobmV3U2xpZGVzKTtcbiAgICAgIF8uJHNsaWRlci5jaGlsZHJlbigpLmNoaWxkcmVuKCkuY2hpbGRyZW4oKVxuICAgICAgICAgICAgICAgIC53aWR0aCgoMTAwIC8gXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyAnJScpXG4gICAgICAgICAgICAgICAgLmNzcyh7J2Rpc3BsYXknOiAnaW5saW5lLWJsb2NrJ30pO1xuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuY2hlY2tSZXNwb25zaXZlID0gZnVuY3Rpb24oaW5pdGlhbCkge1xuICAgIGxldCBfID0gdGhpcyxcbiAgICAgIGJyZWFrcG9pbnQsIHRhcmdldEJyZWFrcG9pbnQsIHJlc3BvbmRUb1dpZHRoO1xuICAgIGxldCBzbGlkZXJXaWR0aCA9IF8uJHNsaWRlci53aWR0aCgpO1xuICAgIGxldCB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8ICQod2luZG93KS53aWR0aCgpO1xuICAgIGlmIChfLnJlc3BvbmRUbyA9PT0gJ3dpbmRvdycpIHtcbiAgICAgIHJlc3BvbmRUb1dpZHRoID0gd2luZG93V2lkdGg7XG4gICAgfSBlbHNlIGlmIChfLnJlc3BvbmRUbyA9PT0gJ3NsaWRlcicpIHtcbiAgICAgIHJlc3BvbmRUb1dpZHRoID0gc2xpZGVyV2lkdGg7XG4gICAgfSBlbHNlIGlmIChfLnJlc3BvbmRUbyA9PT0gJ21pbicpIHtcbiAgICAgIHJlc3BvbmRUb1dpZHRoID0gTWF0aC5taW4od2luZG93V2lkdGgsIHNsaWRlcldpZHRoKTtcbiAgICB9XG5cbiAgICBpZiAoXy5vcmlnaW5hbFNldHRpbmdzLnJlc3BvbnNpdmUgJiYgXy5vcmlnaW5hbFNldHRpbmdzXG4gICAgICAgICAgICAucmVzcG9uc2l2ZS5sZW5ndGggPiAtMSAmJiBfLm9yaWdpbmFsU2V0dGluZ3MucmVzcG9uc2l2ZSAhPT0gbnVsbCkge1xuICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IG51bGw7XG5cbiAgICAgIGZvciAoYnJlYWtwb2ludCBpbiBfLmJyZWFrcG9pbnRzKSB7XG4gICAgICAgIGlmIChfLmJyZWFrcG9pbnRzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgaWYgKF8ub3JpZ2luYWxTZXR0aW5ncy5tb2JpbGVGaXJzdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25kVG9XaWR0aCA8IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF0pIHtcbiAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25kVG9XaWR0aCA+IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF0pIHtcbiAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0YXJnZXRCcmVha3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChfLmFjdGl2ZUJyZWFrcG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICBpZiAodGFyZ2V0QnJlYWtwb2ludCAhPT0gXy5hY3RpdmVCcmVha3BvaW50KSB7XG4gICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xuICAgICAgICAgICAgICBfLnVuc2xpY2soKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIF8ub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBfLm9yaWdpbmFsU2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludFNldHRpbmdzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludF0pO1xuICAgICAgICAgICAgICBpZiAoaW5pdGlhbCA9PT0gdHJ1ZSlcbiAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG4gICAgICAgICAgICAgIF8ucmVmcmVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRTZXR0aW5nc1t0YXJnZXRCcmVha3BvaW50XSA9PT0gJ3Vuc2xpY2snKSB7XG4gICAgICAgICAgICBfLnVuc2xpY2soKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludF0pO1xuICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpXG4gICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcbiAgICAgICAgICAgIF8ucmVmcmVzaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKF8uYWN0aXZlQnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgIF8uYWN0aXZlQnJlYWtwb2ludCA9IG51bGw7XG4gICAgICAgICAgXy5vcHRpb25zID0gXy5vcmlnaW5hbFNldHRpbmdzO1xuICAgICAgICAgIGlmIChpbml0aWFsID09PSB0cnVlKVxuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuICAgICAgICAgIF8ucmVmcmVzaCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5jaGFuZ2VTbGlkZSA9IGZ1bmN0aW9uKGV2ZW50LCBkb250QW5pbWF0ZSkge1xuICAgIGxldCBfID0gdGhpcyxcbiAgICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCksXG4gICAgICBpbmRleE9mZnNldCwgc2xpZGVPZmZzZXQsIHVuZXZlbk9mZnNldDtcblxuICAgICAgICAvLyBJZiB0YXJnZXQgaXMgYSBsaW5rLCBwcmV2ZW50IGRlZmF1bHQgYWN0aW9uLlxuICAgICR0YXJnZXQuaXMoJ2EnKSAmJiBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdW5ldmVuT2Zmc2V0ID0gKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCk7XG4gICAgaW5kZXhPZmZzZXQgPSB1bmV2ZW5PZmZzZXQgPyAwIDogKF8uc2xpZGVDb3VudCAtIF8uY3VycmVudFNsaWRlKSAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcblxuICAgIHN3aXRjaCAoZXZlbnQuZGF0YS5tZXNzYWdlKSB7XG5cbiAgICBjYXNlICdwcmV2aW91cyc6XG4gICAgICBzbGlkZU9mZnNldCA9IGluZGV4T2Zmc2V0ID09PSAwID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIGluZGV4T2Zmc2V0O1xuICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgLSBzbGlkZU9mZnNldCwgZmFsc2UsIGRvbnRBbmltYXRlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbmV4dCc6XG4gICAgICBzbGlkZU9mZnNldCA9IGluZGV4T2Zmc2V0ID09PSAwID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogaW5kZXhPZmZzZXQ7XG4gICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmN1cnJlbnRTbGlkZSArIHNsaWRlT2Zmc2V0LCBmYWxzZSwgZG9udEFuaW1hdGUpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdpbmRleCc6XG4gICAgICB2YXIgaW5kZXggPSBldmVudC5kYXRhLmluZGV4ID09PSAwID8gMCA6XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmRhdGEuaW5kZXggfHwgJChldmVudC50YXJnZXQpLnBhcmVudCgpLmluZGV4KCkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG5cbiAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY2hlY2tOYXZpZ2FibGUoaW5kZXgpLCBmYWxzZSwgZG9udEFuaW1hdGUpO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuY2hlY2tOYXZpZ2FibGUgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGxldCBfID0gdGhpcyxcbiAgICAgIG5hdmlnYWJsZXMsIHByZXZOYXZpZ2FibGU7XG5cbiAgICBuYXZpZ2FibGVzID0gXy5nZXROYXZpZ2FibGVJbmRleGVzKCk7XG4gICAgcHJldk5hdmlnYWJsZSA9IDA7XG4gICAgaWYgKGluZGV4ID4gbmF2aWdhYmxlc1tuYXZpZ2FibGVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICBpbmRleCA9IG5hdmlnYWJsZXNbbmF2aWdhYmxlcy5sZW5ndGggLSAxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgbiBpbiBuYXZpZ2FibGVzKSB7XG4gICAgICAgIGlmIChpbmRleCA8IG5hdmlnYWJsZXNbbl0pIHtcbiAgICAgICAgICBpbmRleCA9IHByZXZOYXZpZ2FibGU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcHJldk5hdmlnYWJsZSA9IG5hdmlnYWJsZXNbbl07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGluZGV4O1xuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5jbGVhblVwRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICQoJ2xpJywgXy4kZG90cykub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xuICAgIH1cblxuICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMucGF1c2VPbkRvdHNIb3ZlciA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUpIHtcbiAgICAgICQoJ2xpJywgXy4kZG90cylcbiAgICAgICAgICAgICAgICAub2ZmKCdtb3VzZWVudGVyLnNsaWNrJywgXy5zZXRQYXVzZWQuYmluZChfLCB0cnVlKSlcbiAgICAgICAgICAgICAgICAub2ZmKCdtb3VzZWxlYXZlLnNsaWNrJywgXy5zZXRQYXVzZWQuYmluZChfLCBmYWxzZSkpO1xuICAgIH1cblxuICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgIF8uJHByZXZBcnJvdyAmJiBfLiRwcmV2QXJyb3cub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgXy4kbmV4dEFycm93ICYmIF8uJG5leHRBcnJvdy5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jaGFuZ2VTbGlkZSk7XG4gICAgfVxuXG4gICAgXy4kbGlzdC5vZmYoJ3RvdWNoc3RhcnQuc2xpY2sgbW91c2Vkb3duLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgIF8uJGxpc3Qub2ZmKCd0b3VjaG1vdmUuc2xpY2sgbW91c2Vtb3ZlLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgIF8uJGxpc3Qub2ZmKCd0b3VjaGVuZC5zbGljayBtb3VzZXVwLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgIF8uJGxpc3Qub2ZmKCd0b3VjaGNhbmNlbC5zbGljayBtb3VzZWxlYXZlLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuXG4gICAgXy4kbGlzdC5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jbGlja0hhbmRsZXIpO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5hdXRvcGxheSA9PT0gdHJ1ZSkge1xuICAgICAgJChkb2N1bWVudCkub2ZmKF8udmlzaWJpbGl0eUNoYW5nZSwgXy52aXNpYmlsaXR5KTtcbiAgICB9XG5cbiAgICBfLiRsaXN0Lm9mZignbW91c2VlbnRlci5zbGljaycsIF8uc2V0UGF1c2VkLmJpbmQoXywgdHJ1ZSkpO1xuICAgIF8uJGxpc3Qub2ZmKCdtb3VzZWxlYXZlLnNsaWNrJywgXy5zZXRQYXVzZWQuYmluZChfLCBmYWxzZSkpO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICBfLiRsaXN0Lm9mZigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgfVxuXG4gICAgaWYgKF8ub3B0aW9ucy5mb2N1c09uU2VsZWN0ID09PSB0cnVlKSB7XG4gICAgICAkKF8uJHNsaWRlVHJhY2spLmNoaWxkcmVuKCkub2ZmKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XG4gICAgfVxuXG4gICAgJCh3aW5kb3cpLm9mZignb3JpZW50YXRpb25jaGFuZ2Uuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8ub3JpZW50YXRpb25DaGFuZ2UpO1xuXG4gICAgJCh3aW5kb3cpLm9mZigncmVzaXplLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnJlc2l6ZSk7XG5cbiAgICAkKCdbZHJhZ2dhYmxlIT10cnVlXScsIF8uJHNsaWRlVHJhY2spLm9mZignZHJhZ3N0YXJ0JywgXy5wcmV2ZW50RGVmYXVsdCk7XG5cbiAgICAkKHdpbmRvdykub2ZmKCdsb2FkLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ3JlYWR5LnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuY2xlYW5VcFJvd3MgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXMsIG9yaWdpbmFsU2xpZGVzO1xuXG4gICAgaWYoXy5vcHRpb25zLnJvd3MgPiAxKSB7XG4gICAgICBvcmlnaW5hbFNsaWRlcyA9IF8uJHNsaWRlcy5jaGlsZHJlbigpLmNoaWxkcmVuKCk7XG4gICAgICBvcmlnaW5hbFNsaWRlcy5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgXy4kc2xpZGVyLmh0bWwob3JpZ2luYWxTbGlkZXMpO1xuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG5cbiAgICBpZiAoXy5zaG91bGRDbGljayA9PT0gZmFsc2UpIHtcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuXG4gICAgXy50b3VjaE9iamVjdCA9IHt9O1xuXG4gICAgXy5jbGVhblVwRXZlbnRzKCk7XG5cbiAgICAkKCcuc2xpY2stY2xvbmVkJywgXy4kc2xpZGVyKS5yZW1vdmUoKTtcblxuICAgIGlmIChfLiRkb3RzKSB7XG4gICAgICBfLiRkb3RzLnJlbW92ZSgpO1xuICAgIH1cbiAgICBpZiAoXy4kcHJldkFycm93ICYmICh0eXBlb2YgXy5vcHRpb25zLnByZXZBcnJvdyAhPT0gJ29iamVjdCcpKSB7XG4gICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlKCk7XG4gICAgfVxuICAgIGlmIChfLiRuZXh0QXJyb3cgJiYgKHR5cGVvZiBfLm9wdGlvbnMubmV4dEFycm93ICE9PSAnb2JqZWN0JykpIHtcbiAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBpZiAoXy4kc2xpZGVzKSB7XG4gICAgICBfLiRzbGlkZXMucmVtb3ZlQ2xhc3MoJ3NsaWNrLXNsaWRlIHNsaWNrLWFjdGl2ZSBzbGljay1jZW50ZXIgc2xpY2stdmlzaWJsZScpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXNsaWNrLWluZGV4JylcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICAgIGxlZnQ6ICcnLFxuICAgICAgICAgICAgICAgICAgdG9wOiAnJyxcbiAgICAgICAgICAgICAgICAgIHpJbmRleDogJycsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAnJyxcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiAnJyxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgXy4kc2xpZGVyLmh0bWwoXy4kc2xpZGVzKTtcbiAgICB9XG5cbiAgICBfLmNsZWFuVXBSb3dzKCk7XG5cbiAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLXNsaWRlcicpO1xuICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKTtcbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuZGlzYWJsZVRyYW5zaXRpb24gPSBmdW5jdGlvbihzbGlkZSkge1xuICAgIGxldCBfID0gdGhpcyxcbiAgICAgIHRyYW5zaXRpb24gPSB7fTtcblxuICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSAnJztcblxuICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICBfLiRzbGlkZXMuZXEoc2xpZGUpLmNzcyh0cmFuc2l0aW9uKTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLmZhZGVTbGlkZSA9IGZ1bmN0aW9uKHNsaWRlSW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgaWYgKF8uY3NzVHJhbnNpdGlvbnMgPT09IGZhbHNlKSB7XG4gICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuY3NzKHtcbiAgICAgICAgekluZGV4OiAxMDAwLFxuICAgICAgfSk7XG5cbiAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5hbmltYXRlKHtcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZywgY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBfLmFwcGx5VHJhbnNpdGlvbihzbGlkZUluZGV4KTtcblxuICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmNzcyh7XG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIHpJbmRleDogMTAwMCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBfLmRpc2FibGVUcmFuc2l0aW9uKHNsaWRlSW5kZXgpO1xuXG4gICAgICAgICAgY2FsbGJhY2suY2FsbCgpO1xuICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuZmlsdGVyU2xpZGVzID0gU2xpY2sucHJvdG90eXBlLnNsaWNrRmlsdGVyID0gZnVuY3Rpb24oZmlsdGVyKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgaWYgKGZpbHRlciAhPT0gbnVsbCkge1xuICAgICAgXy51bmxvYWQoKTtcblxuICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICBfLiRzbGlkZXNDYWNoZS5maWx0ZXIoZmlsdGVyKS5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcblxuICAgICAgXy5yZWluaXQoKTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLmdldEN1cnJlbnQgPSBTbGljay5wcm90b3R5cGUuc2xpY2tDdXJyZW50U2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG4gICAgcmV0dXJuIF8uY3VycmVudFNsaWRlO1xuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5nZXREb3RDb3VudCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIGxldCBicmVha1BvaW50ID0gMDtcbiAgICBsZXQgY291bnRlciA9IDA7XG4gICAgbGV0IHBhZ2VyUXR5ID0gMDtcblxuICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgIHBhZ2VyUXR5ID0gTWF0aC5jZWlsKF8uc2xpZGVDb3VudCAvIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCk7XG4gICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgcGFnZXJRdHkgPSBfLnNsaWRlQ291bnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoaWxlIChicmVha1BvaW50IDwgXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICsrcGFnZXJRdHk7XG4gICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhZ2VyUXR5IC0gMTtcbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuZ2V0TGVmdCA9IGZ1bmN0aW9uKHNsaWRlSW5kZXgpIHtcbiAgICBsZXQgXyA9IHRoaXMsXG4gICAgICB0YXJnZXRMZWZ0LFxuICAgICAgdmVydGljYWxIZWlnaHQsXG4gICAgICB2ZXJ0aWNhbE9mZnNldCA9IDAsXG4gICAgICB0YXJnZXRTbGlkZTtcblxuICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgIHZlcnRpY2FsSGVpZ2h0ID0gXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQoKTtcblxuICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoXy5zbGlkZVdpZHRoICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgKiAtMTtcbiAgICAgICAgdmVydGljYWxPZmZzZXQgPSAodmVydGljYWxIZWlnaHQgKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAqIC0xO1xuICAgICAgfVxuICAgICAgaWYgKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCkge1xuICAgICAgICBpZiAoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA+IF8uc2xpZGVDb3VudCAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgaWYgKHNsaWRlSW5kZXggPiBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSAoc2xpZGVJbmRleCAtIF8uc2xpZGVDb3VudCkpICogXy5zbGlkZVdpZHRoKSAqIC0xO1xuICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAoKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSAoc2xpZGVJbmRleCAtIF8uc2xpZGVDb3VudCkpICogdmVydGljYWxIZWlnaHQpICogLTE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkgKiBfLnNsaWRlV2lkdGgpICogLTE7XG4gICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSAqIHZlcnRpY2FsSGVpZ2h0KSAqIC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPiBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIC0gXy5zbGlkZUNvdW50KSAqIF8uc2xpZGVXaWR0aDtcbiAgICAgICAgdmVydGljYWxPZmZzZXQgPSAoKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAtIF8uc2xpZGVDb3VudCkgKiB2ZXJ0aWNhbEhlaWdodDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgdmVydGljYWxPZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgIF8uc2xpZGVPZmZzZXQgKz0gXy5zbGlkZVdpZHRoICogTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMikgLSBfLnNsaWRlV2lkdGg7XG4gICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XG4gICAgICBfLnNsaWRlT2Zmc2V0ICs9IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuICAgIH1cblxuICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICB0YXJnZXRMZWZ0ID0gKChzbGlkZUluZGV4ICogXy5zbGlkZVdpZHRoKSAqIC0xKSArIF8uc2xpZGVPZmZzZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldExlZnQgPSAoKHNsaWRlSW5kZXggKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMSkgKyB2ZXJ0aWNhbE9mZnNldDtcbiAgICB9XG5cbiAgICBpZiAoXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IHRydWUpIHtcbiAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyB8fCBfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlKSB7XG4gICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgIH1cblxuICAgICAgdGFyZ2V0TGVmdCA9IHRhcmdldFNsaWRlWzBdID8gdGFyZ2V0U2xpZGVbMF0ub2Zmc2V0TGVmdCAqIC0xIDogMDtcblxuICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5lcShzbGlkZUluZGV4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0TGVmdCA9IHRhcmdldFNsaWRlWzBdID8gdGFyZ2V0U2xpZGVbMF0ub2Zmc2V0TGVmdCAqIC0xIDogMDtcbiAgICAgICAgdGFyZ2V0TGVmdCArPSAoXy4kbGlzdC53aWR0aCgpIC0gdGFyZ2V0U2xpZGUub3V0ZXJXaWR0aCgpKSAvIDI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldExlZnQ7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLmdldE9wdGlvbiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0dldE9wdGlvbiA9IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIHJldHVybiBfLm9wdGlvbnNbb3B0aW9uXTtcbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuZ2V0TmF2aWdhYmxlSW5kZXhlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcyxcbiAgICAgIGJyZWFrUG9pbnQgPSAwLFxuICAgICAgY291bnRlciA9IDAsXG4gICAgICBpbmRleGVzID0gW10sXG4gICAgICBtYXg7XG5cbiAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSkge1xuICAgICAgbWF4ID0gXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDE7XG4gICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIG1heCA9IF8uc2xpZGVDb3VudDtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWtQb2ludCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAqIC0xO1xuICAgICAgY291bnRlciA9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAqIC0xO1xuICAgICAgbWF4ID0gXy5zbGlkZUNvdW50ICogMjtcbiAgICB9XG5cbiAgICB3aGlsZSAoYnJlYWtQb2ludCA8IG1heCkge1xuICAgICAgaW5kZXhlcy5wdXNoKGJyZWFrUG9pbnQpO1xuICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICBjb3VudGVyICs9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICB9XG5cbiAgICByZXR1cm4gaW5kZXhlcztcbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuZ2V0U2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuZ2V0U2xpZGVDb3VudCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcyxcbiAgICAgIHNsaWRlc1RyYXZlcnNlZCwgc3dpcGVkU2xpZGUsIGNlbnRlck9mZnNldDtcblxuICAgIGNlbnRlck9mZnNldCA9IF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlID8gXy5zbGlkZVdpZHRoICogTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMikgOiAwO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPT09IHRydWUpIHtcbiAgICAgIF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLXNsaWRlJykuZWFjaChmdW5jdGlvbihpbmRleCwgc2xpZGUpIHtcbiAgICAgICAgaWYgKHNsaWRlLm9mZnNldExlZnQgLSBjZW50ZXJPZmZzZXQgKyAoJChzbGlkZSkub3V0ZXJXaWR0aCgpIC8gMikgPiAoXy5zd2lwZUxlZnQgKiAtMSkpIHtcbiAgICAgICAgICBzd2lwZWRTbGlkZSA9IHNsaWRlO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHNsaWRlc1RyYXZlcnNlZCA9IE1hdGguYWJzKCQoc3dpcGVkU2xpZGUpLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnKSAtIF8uY3VycmVudFNsaWRlKSB8fCAxO1xuXG4gICAgICByZXR1cm4gc2xpZGVzVHJhdmVyc2VkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuZ29UbyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0dvVG8gPSBmdW5jdGlvbihzbGlkZSwgZG9udEFuaW1hdGUpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG5cbiAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgbWVzc2FnZTogJ2luZGV4JyxcbiAgICAgICAgaW5kZXg6IHBhcnNlSW50KHNsaWRlKSxcbiAgICAgIH0sXG4gICAgfSwgZG9udEFuaW1hdGUpO1xuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgaWYgKCEkKF8uJHNsaWRlcikuaGFzQ2xhc3MoJ3NsaWNrLWluaXRpYWxpemVkJykpIHtcbiAgICAgICQoXy4kc2xpZGVyKS5hZGRDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKTtcbiAgICAgIF8uYnVpbGRSb3dzKCk7XG4gICAgICBfLmJ1aWxkT3V0KCk7XG4gICAgICBfLnNldFByb3BzKCk7XG4gICAgICBfLnN0YXJ0TG9hZCgpO1xuICAgICAgXy5sb2FkU2xpZGVyKCk7XG4gICAgICBfLmluaXRpYWxpemVFdmVudHMoKTtcbiAgICAgIF8udXBkYXRlQXJyb3dzKCk7XG4gICAgICBfLnVwZGF0ZURvdHMoKTtcbiAgICB9XG5cbiAgICBfLiRzbGlkZXIudHJpZ2dlcignaW5pdCcsIFtfXSk7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLmluaXRBcnJvd0V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgIF8uJHByZXZBcnJvdy5vbignY2xpY2suc2xpY2snLCB7XG4gICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cycsXG4gICAgICB9LCBfLmNoYW5nZVNsaWRlKTtcbiAgICAgIF8uJG5leHRBcnJvdy5vbignY2xpY2suc2xpY2snLCB7XG4gICAgICAgIG1lc3NhZ2U6ICduZXh0JyxcbiAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuaW5pdERvdEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAkKCdsaScsIF8uJGRvdHMpLm9uKCdjbGljay5zbGljaycsIHtcbiAgICAgICAgbWVzc2FnZTogJ2luZGV4JyxcbiAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgIH1cblxuICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMucGF1c2VPbkRvdHNIb3ZlciA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUpIHtcbiAgICAgICQoJ2xpJywgXy4kZG90cylcbiAgICAgICAgICAgICAgICAub24oJ21vdXNlZW50ZXIuc2xpY2snLCBfLnNldFBhdXNlZC5iaW5kKF8sIHRydWUpKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VsZWF2ZS5zbGljaycsIF8uc2V0UGF1c2VkLmJpbmQoXywgZmFsc2UpKTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLmluaXRpYWxpemVFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG5cbiAgICBfLmluaXRBcnJvd0V2ZW50cygpO1xuXG4gICAgXy5pbml0RG90RXZlbnRzKCk7XG5cbiAgICBfLiRsaXN0Lm9uKCd0b3VjaHN0YXJ0LnNsaWNrIG1vdXNlZG93bi5zbGljaycsIHtcbiAgICAgIGFjdGlvbjogJ3N0YXJ0JyxcbiAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgXy4kbGlzdC5vbigndG91Y2htb3ZlLnNsaWNrIG1vdXNlbW92ZS5zbGljaycsIHtcbiAgICAgIGFjdGlvbjogJ21vdmUnLFxuICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcbiAgICBfLiRsaXN0Lm9uKCd0b3VjaGVuZC5zbGljayBtb3VzZXVwLnNsaWNrJywge1xuICAgICAgYWN0aW9uOiAnZW5kJyxcbiAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgXy4kbGlzdC5vbigndG91Y2hjYW5jZWwuc2xpY2sgbW91c2VsZWF2ZS5zbGljaycsIHtcbiAgICAgIGFjdGlvbjogJ2VuZCcsXG4gICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuXG4gICAgXy4kbGlzdC5vbignY2xpY2suc2xpY2snLCBfLmNsaWNrSGFuZGxlcik7XG5cbiAgICBpZiAoXy5vcHRpb25zLmF1dG9wbGF5ID09PSB0cnVlKSB7XG4gICAgICAkKGRvY3VtZW50KS5vbihfLnZpc2liaWxpdHlDaGFuZ2UsIF8udmlzaWJpbGl0eS5iaW5kKF8pKTtcbiAgICB9XG5cbiAgICBfLiRsaXN0Lm9uKCdtb3VzZWVudGVyLnNsaWNrJywgXy5zZXRQYXVzZWQuYmluZChfLCB0cnVlKSk7XG4gICAgXy4kbGlzdC5vbignbW91c2VsZWF2ZS5zbGljaycsIF8uc2V0UGF1c2VkLmJpbmQoXywgZmFsc2UpKTtcblxuICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgXy4kbGlzdC5vbigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgfVxuXG4gICAgaWYgKF8ub3B0aW9ucy5mb2N1c09uU2VsZWN0ID09PSB0cnVlKSB7XG4gICAgICAkKF8uJHNsaWRlVHJhY2spLmNoaWxkcmVuKCkub24oJ2NsaWNrLnNsaWNrJywgXy5zZWxlY3RIYW5kbGVyKTtcbiAgICB9XG5cbiAgICAkKHdpbmRvdykub24oJ29yaWVudGF0aW9uY2hhbmdlLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLm9yaWVudGF0aW9uQ2hhbmdlLmJpbmQoXykpO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8ucmVzaXplLmJpbmQoXykpO1xuXG4gICAgJCgnW2RyYWdnYWJsZSE9dHJ1ZV0nLCBfLiRzbGlkZVRyYWNrKS5vbignZHJhZ3N0YXJ0JywgXy5wcmV2ZW50RGVmYXVsdCk7XG5cbiAgICAkKHdpbmRvdykub24oJ2xvYWQuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8uc2V0UG9zaXRpb24pO1xuICAgICQoZG9jdW1lbnQpLm9uKCdyZWFkeS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLmluaXRVSSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgIF8uJHByZXZBcnJvdy5zaG93KCk7XG4gICAgICBfLiRuZXh0QXJyb3cuc2hvdygpO1xuICAgIH1cblxuICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICBfLiRkb3RzLnNob3coKTtcbiAgICB9XG5cbiAgICBpZiAoXy5vcHRpb25zLmF1dG9wbGF5ID09PSB0cnVlKSB7XG4gICAgICBfLmF1dG9QbGF5KCk7XG4gICAgfVxuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5rZXlIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG5cbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzcgJiYgXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgbWVzc2FnZTogJ3ByZXZpb3VzJyxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzkgJiYgXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgbWVzc2FnZTogJ25leHQnLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5sYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcyxcbiAgICAgIGxvYWRSYW5nZSwgY2xvbmVSYW5nZSwgcmFuZ2VTdGFydCwgcmFuZ2VFbmQ7XG5cbiAgICBmdW5jdGlvbiBsb2FkSW1hZ2VzKGltYWdlc1Njb3BlKSB7XG4gICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIGltYWdlc1Njb3BlKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgaW1hZ2UgPSAkKHRoaXMpLFxuICAgICAgICAgIGltYWdlU291cmNlID0gJCh0aGlzKS5hdHRyKCdkYXRhLWxhenknKSxcbiAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgIGltYWdlVG9Mb2FkLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGltYWdlLmFuaW1hdGUoe1xuICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICB9LCAyMDApO1xuICAgICAgICB9O1xuICAgICAgICBpbWFnZVRvTG9hZC5zcmMgPSBpbWFnZVNvdXJjZTtcblxuICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuYXR0cignc3JjJywgaW1hZ2VTb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLWxhenknKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICByYW5nZVN0YXJ0ID0gXy5jdXJyZW50U2xpZGUgKyAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKTtcbiAgICAgICAgcmFuZ2VFbmQgPSByYW5nZVN0YXJ0ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByYW5nZVN0YXJ0ID0gTWF0aC5tYXgoMCwgXy5jdXJyZW50U2xpZGUgLSAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKSk7XG4gICAgICAgIHJhbmdlRW5kID0gMiArIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMiArIDEpICsgXy5jdXJyZW50U2xpZGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJhbmdlU3RhcnQgPSBfLm9wdGlvbnMuaW5maW5pdGUgPyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgXy5jdXJyZW50U2xpZGUgOiBfLmN1cnJlbnRTbGlkZTtcbiAgICAgIHJhbmdlRW5kID0gcmFuZ2VTdGFydCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgaWYgKHJhbmdlU3RhcnQgPiAwKSByYW5nZVN0YXJ0LS07XG4gICAgICAgIGlmIChyYW5nZUVuZCA8PSBfLnNsaWRlQ291bnQpIHJhbmdlRW5kKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbG9hZFJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpLnNsaWNlKHJhbmdlU3RhcnQsIHJhbmdlRW5kKTtcbiAgICBsb2FkSW1hZ2VzKGxvYWRSYW5nZSk7XG5cbiAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLXNsaWRlJyk7XG4gICAgICBsb2FkSW1hZ2VzKGNsb25lUmFuZ2UpO1xuICAgIH0gZWxzZVxuICAgICAgICBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLWNsb25lZCcpLnNsaWNlKDAsIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPT09IDApIHtcbiAgICAgICAgICBjbG9uZVJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1jbG9uZWQnKS5zbGljZShfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICogLTEpO1xuICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XG4gICAgICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUubG9hZFNsaWRlciA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIF8uc2V0UG9zaXRpb24oKTtcblxuICAgIF8uJHNsaWRlVHJhY2suY3NzKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgfSk7XG5cbiAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKTtcblxuICAgIF8uaW5pdFVJKCk7XG5cbiAgICBpZiAoXy5vcHRpb25zLmxhenlMb2FkID09PSAncHJvZ3Jlc3NpdmUnKSB7XG4gICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoKTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLm5leHQgPSBTbGljay5wcm90b3R5cGUuc2xpY2tOZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIG1lc3NhZ2U6ICduZXh0JyxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLm9yaWVudGF0aW9uQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgXy5jaGVja1Jlc3BvbnNpdmUoKTtcbiAgICBfLnNldFBvc2l0aW9uKCk7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnBhdXNlID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG5cbiAgICBfLmF1dG9QbGF5Q2xlYXIoKTtcbiAgICBfLnBhdXNlZCA9IHRydWU7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnBsYXkgPSBTbGljay5wcm90b3R5cGUuc2xpY2tQbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgXy5wYXVzZWQgPSBmYWxzZTtcbiAgICBfLmF1dG9QbGF5KCk7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnBvc3RTbGlkZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2FmdGVyQ2hhbmdlJywgW18sIGluZGV4XSk7XG5cbiAgICBfLmFuaW1hdGluZyA9IGZhbHNlO1xuXG4gICAgXy5zZXRQb3NpdGlvbigpO1xuXG4gICAgXy5zd2lwZUxlZnQgPSBudWxsO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5hdXRvcGxheSA9PT0gdHJ1ZSAmJiBfLnBhdXNlZCA9PT0gZmFsc2UpIHtcbiAgICAgIF8uYXV0b1BsYXkoKTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnByZXYgPSBTbGljay5wcm90b3R5cGUuc2xpY2tQcmV2ID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cycsXG4gICAgICB9LFxuICAgIH0pO1xuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnByb2dyZXNzaXZlTGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXMsXG4gICAgICBpbWdDb3VudCwgdGFyZ2V0SW1hZ2U7XG5cbiAgICBpbWdDb3VudCA9ICQoJ2ltZ1tkYXRhLWxhenldJywgXy4kc2xpZGVyKS5sZW5ndGg7XG5cbiAgICBpZiAoaW1nQ291bnQgPiAwKSB7XG4gICAgICB0YXJnZXRJbWFnZSA9ICQoJ2ltZ1tkYXRhLWxhenldJywgXy4kc2xpZGVyKS5maXJzdCgpO1xuICAgICAgdGFyZ2V0SW1hZ2UuYXR0cignc3JjJywgdGFyZ2V0SW1hZ2UuYXR0cignZGF0YS1sYXp5JykpLnJlbW92ZUNsYXNzKCdzbGljay1sb2FkaW5nJykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgdGFyZ2V0SW1hZ2UucmVtb3ZlQXR0cignZGF0YS1sYXp5Jyk7XG4gICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgPT09IHRydWUpIHtcbiAgICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgdGFyZ2V0SW1hZ2UucmVtb3ZlQXR0cignZGF0YS1sYXp5Jyk7XG4gICAgICAgICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXMsXG4gICAgICBjdXJyZW50U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcblxuICAgIF8uZGVzdHJveSgpO1xuXG4gICAgJC5leHRlbmQoXywgXy5pbml0aWFscyk7XG5cbiAgICBfLmluaXQoKTtcblxuICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgZGF0YToge1xuICAgICAgICBtZXNzYWdlOiAnaW5kZXgnLFxuICAgICAgICBpbmRleDogY3VycmVudFNsaWRlLFxuICAgICAgfSxcbiAgICB9LCBmYWxzZSk7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnJlaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oXy5vcHRpb25zLnNsaWRlKS5hZGRDbGFzcyhcbiAgICAgICAgICAgICdzbGljay1zbGlkZScpO1xuXG4gICAgXy5zbGlkZUNvdW50ID0gXy4kc2xpZGVzLmxlbmd0aDtcblxuICAgIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgJiYgXy5jdXJyZW50U2xpZGUgIT09IDApIHtcbiAgICAgIF8uY3VycmVudFNsaWRlID0gXy5jdXJyZW50U2xpZGUgLSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgfVxuXG4gICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICBfLmN1cnJlbnRTbGlkZSA9IDA7XG4gICAgfVxuXG4gICAgXy5zZXRQcm9wcygpO1xuXG4gICAgXy5zZXR1cEluZmluaXRlKCk7XG5cbiAgICBfLmJ1aWxkQXJyb3dzKCk7XG5cbiAgICBfLnVwZGF0ZUFycm93cygpO1xuXG4gICAgXy5pbml0QXJyb3dFdmVudHMoKTtcblxuICAgIF8uYnVpbGREb3RzKCk7XG5cbiAgICBfLnVwZGF0ZURvdHMoKTtcblxuICAgIF8uaW5pdERvdEV2ZW50cygpO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5mb2N1c09uU2VsZWN0ID09PSB0cnVlKSB7XG4gICAgICAkKF8uJHNsaWRlVHJhY2spLmNoaWxkcmVuKCkub24oJ2NsaWNrLnNsaWNrJywgXy5zZWxlY3RIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBfLnNldFNsaWRlQ2xhc3NlcygwKTtcblxuICAgIF8uc2V0UG9zaXRpb24oKTtcblxuICAgIF8uJHNsaWRlci50cmlnZ2VyKCdyZUluaXQnLCBbX10pO1xuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG5cbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgIT09IF8ud2luZG93V2lkdGgpIHtcbiAgICAgIGNsZWFyVGltZW91dChfLndpbmRvd0RlbGF5KTtcbiAgICAgIF8ud2luZG93RGVsYXkgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgXy53aW5kb3dXaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZSgpO1xuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG4gICAgICB9LCA1MCk7XG4gICAgfVxuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5yZW1vdmVTbGlkZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1JlbW92ZSA9IGZ1bmN0aW9uKGluZGV4LCByZW1vdmVCZWZvcmUsIHJlbW92ZUFsbCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIGlmICh0eXBlb2YoaW5kZXgpID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHJlbW92ZUJlZm9yZSA9IGluZGV4O1xuICAgICAgaW5kZXggPSByZW1vdmVCZWZvcmUgPT09IHRydWUgPyAwIDogXy5zbGlkZUNvdW50IC0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5kZXggPSByZW1vdmVCZWZvcmUgPT09IHRydWUgPyAtLWluZGV4IDogaW5kZXg7XG4gICAgfVxuXG4gICAgaWYgKF8uc2xpZGVDb3VudCA8IDEgfHwgaW5kZXggPCAwIHx8IGluZGV4ID4gXy5zbGlkZUNvdW50IC0gMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIF8udW5sb2FkKCk7XG5cbiAgICBpZiAocmVtb3ZlQWxsID09PSB0cnVlKSB7XG4gICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCkucmVtb3ZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5lcShpbmRleCkucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgXy4kc2xpZGVzID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpO1xuXG4gICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgXy4kc2xpZGVUcmFjay5hcHBlbmQoXy4kc2xpZGVzKTtcblxuICAgIF8uJHNsaWRlc0NhY2hlID0gXy4kc2xpZGVzO1xuXG4gICAgXy5yZWluaXQoKTtcbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuc2V0Q1NTID0gZnVuY3Rpb24ocG9zaXRpb24pIHtcbiAgICBsZXQgXyA9IHRoaXMsXG4gICAgICBwb3NpdGlvblByb3BzID0ge30sXG4gICAgICB4LCB5O1xuXG4gICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgIHBvc2l0aW9uID0gLXBvc2l0aW9uO1xuICAgIH1cbiAgICB4ID0gXy5wb3NpdGlvblByb3AgPT0gJ2xlZnQnID8gTWF0aC5jZWlsKHBvc2l0aW9uKSArICdweCcgOiAnMHB4JztcbiAgICB5ID0gXy5wb3NpdGlvblByb3AgPT0gJ3RvcCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xuXG4gICAgcG9zaXRpb25Qcm9wc1tfLnBvc2l0aW9uUHJvcF0gPSBwb3NpdGlvbjtcblxuICAgIGlmIChfLnRyYW5zZm9ybXNFbmFibGVkID09PSBmYWxzZSkge1xuICAgICAgXy4kc2xpZGVUcmFjay5jc3MocG9zaXRpb25Qcm9wcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fTtcbiAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuICAgICAgICBwb3NpdGlvblByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZSgnICsgeCArICcsICcgKyB5ICsgJyknO1xuICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvc2l0aW9uUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoJyArIHggKyAnLCAnICsgeSArICcsIDBweCknO1xuICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnNldERpbWVuc2lvbnMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG5cbiAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgIF8uJGxpc3QuY3NzKHtcbiAgICAgICAgICBwYWRkaW5nOiAoJzBweCAnICsgXy5vcHRpb25zLmNlbnRlclBhZGRpbmcpLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgXy4kbGlzdC5oZWlnaHQoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICBfLiRsaXN0LmNzcyh7XG4gICAgICAgICAgcGFkZGluZzogKF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nICsgJyAwcHgnKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgXy5saXN0V2lkdGggPSBfLiRsaXN0LndpZHRoKCk7XG4gICAgXy5saXN0SGVpZ2h0ID0gXy4kbGlzdC5oZWlnaHQoKTtcblxuXG4gICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UgJiYgXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IGZhbHNlKSB7XG4gICAgICBfLnNsaWRlV2lkdGggPSBNYXRoLmNlaWwoXy5saXN0V2lkdGggLyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgIF8uJHNsaWRlVHJhY2sud2lkdGgoTWF0aC5jZWlsKChfLnNsaWRlV2lkdGggKiBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5sZW5ndGgpKSk7XG4gICAgfSBlbHNlIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gdHJ1ZSkge1xuICAgICAgXy4kc2xpZGVUcmFjay53aWR0aCg1MDAwICogXy5zbGlkZUNvdW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgXy5zbGlkZVdpZHRoID0gTWF0aC5jZWlsKF8ubGlzdFdpZHRoKTtcbiAgICAgIF8uJHNsaWRlVHJhY2suaGVpZ2h0KE1hdGguY2VpbCgoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5sZW5ndGgpKSk7XG4gICAgfVxuXG4gICAgbGV0IG9mZnNldCA9IF8uJHNsaWRlcy5maXJzdCgpLm91dGVyV2lkdGgodHJ1ZSkgLSBfLiRzbGlkZXMuZmlyc3QoKS53aWR0aCgpO1xuICAgIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gZmFsc2UpIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLndpZHRoKF8uc2xpZGVXaWR0aCAtIG9mZnNldCk7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnNldEZhZGUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXMsXG4gICAgICB0YXJnZXRMZWZ0O1xuXG4gICAgXy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgIHRhcmdldExlZnQgPSAoXy5zbGlkZVdpZHRoICogaW5kZXgpICogLTE7XG4gICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAkKGVsZW1lbnQpLmNzcyh7XG4gICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgcmlnaHQ6IHRhcmdldExlZnQsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIHpJbmRleDogODAwLFxuICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJChlbGVtZW50KS5jc3Moe1xuICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgIGxlZnQ6IHRhcmdldExlZnQsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIHpJbmRleDogODAwLFxuICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5jc3Moe1xuICAgICAgekluZGV4OiA5MDAsXG4gICAgICBvcGFjaXR5OiAxLFxuICAgIH0pO1xuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5zZXRIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG5cbiAgICBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PT0gMSAmJiBfLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgbGV0IHRhcmdldEhlaWdodCA9IF8uJHNsaWRlcy5lcShfLmN1cnJlbnRTbGlkZSkub3V0ZXJIZWlnaHQodHJ1ZSk7XG4gICAgICBfLiRsaXN0LmNzcygnaGVpZ2h0JywgdGFyZ2V0SGVpZ2h0KTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnNldE9wdGlvbiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1NldE9wdGlvbiA9IGZ1bmN0aW9uKG9wdGlvbiwgdmFsdWUsIHJlZnJlc2gpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG4gICAgXy5vcHRpb25zW29wdGlvbl0gPSB2YWx1ZTtcblxuICAgIGlmIChyZWZyZXNoID09PSB0cnVlKSB7XG4gICAgICBfLnVubG9hZCgpO1xuICAgICAgXy5yZWluaXQoKTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgXy5zZXREaW1lbnNpb25zKCk7XG5cbiAgICBfLnNldEhlaWdodCgpO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgXy5zZXRDU1MoXy5nZXRMZWZ0KF8uY3VycmVudFNsaWRlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF8uc2V0RmFkZSgpO1xuICAgIH1cblxuICAgIF8uJHNsaWRlci50cmlnZ2VyKCdzZXRQb3NpdGlvbicsIFtfXSk7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnNldFByb3BzID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzLFxuICAgICAgYm9keVN0eWxlID0gZG9jdW1lbnQuYm9keS5zdHlsZTtcblxuICAgIF8ucG9zaXRpb25Qcm9wID0gXy5vcHRpb25zLnZlcnRpY2FsID09PSB0cnVlID8gJ3RvcCcgOiAnbGVmdCc7XG5cbiAgICBpZiAoXy5wb3NpdGlvblByb3AgPT09ICd0b3AnKSB7XG4gICAgICBfLiRzbGlkZXIuYWRkQ2xhc3MoJ3NsaWNrLXZlcnRpY2FsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stdmVydGljYWwnKTtcbiAgICB9XG5cbiAgICBpZiAoYm9keVN0eWxlLldlYmtpdFRyYW5zaXRpb24gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgYm9keVN0eWxlLk1velRyYW5zaXRpb24gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgYm9keVN0eWxlLm1zVHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoXy5vcHRpb25zLnVzZUNTUyA9PT0gdHJ1ZSkge1xuICAgICAgICBfLmNzc1RyYW5zaXRpb25zID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYm9keVN0eWxlLk9UcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgXy5hbmltVHlwZSA9ICdPVHJhbnNmb3JtJztcbiAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctby10cmFuc2Zvcm0nO1xuICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdPVHJhbnNpdGlvbic7XG4gICAgICBpZiAoYm9keVN0eWxlLnBlcnNwZWN0aXZlUHJvcGVydHkgPT09IHVuZGVmaW5lZCAmJiBib2R5U3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYm9keVN0eWxlLk1velRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBfLmFuaW1UeXBlID0gJ01velRyYW5zZm9ybSc7XG4gICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLW1vei10cmFuc2Zvcm0nO1xuICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdNb3pUcmFuc2l0aW9uJztcbiAgICAgIGlmIChib2R5U3R5bGUucGVyc3BlY3RpdmVQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkICYmIGJvZHlTdHlsZS5Nb3pQZXJzcGVjdGl2ZSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XG4gICAgfVxuICAgIGlmIChib2R5U3R5bGUud2Via2l0VHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIF8uYW5pbVR5cGUgPSAnd2Via2l0VHJhbnNmb3JtJztcbiAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctd2Via2l0LXRyYW5zZm9ybSc7XG4gICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ3dlYmtpdFRyYW5zaXRpb24nO1xuICAgICAgaWYgKGJvZHlTdHlsZS5wZXJzcGVjdGl2ZVByb3BlcnR5ID09PSB1bmRlZmluZWQgJiYgYm9keVN0eWxlLndlYmtpdFBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGJvZHlTdHlsZS5tc1RyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBfLmFuaW1UeXBlID0gJ21zVHJhbnNmb3JtJztcbiAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbXMtdHJhbnNmb3JtJztcbiAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnbXNUcmFuc2l0aW9uJztcbiAgICAgIGlmIChib2R5U3R5bGUubXNUcmFuc2Zvcm0gPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYm9keVN0eWxlLnRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkICYmIF8uYW5pbVR5cGUgIT09IGZhbHNlKSB7XG4gICAgICBfLmFuaW1UeXBlID0gJ3RyYW5zZm9ybSc7XG4gICAgICBfLnRyYW5zZm9ybVR5cGUgPSAndHJhbnNmb3JtJztcbiAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAndHJhbnNpdGlvbic7XG4gICAgfVxuICAgIF8udHJhbnNmb3Jtc0VuYWJsZWQgPSAoXy5hbmltVHlwZSAhPT0gbnVsbCAmJiBfLmFuaW1UeXBlICE9PSBmYWxzZSk7XG4gIH07XG5cblxuICBTbGljay5wcm90b3R5cGUuc2V0U2xpZGVDbGFzc2VzID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBsZXQgXyA9IHRoaXMsXG4gICAgICBjZW50ZXJPZmZzZXQsIGFsbFNsaWRlcywgaW5kZXhPZmZzZXQsIHJlbWFpbmRlcjtcblxuICAgIF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKS5yZW1vdmVDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpLnJlbW92ZUNsYXNzKCdzbGljay1jZW50ZXInKTtcbiAgICBhbGxTbGlkZXMgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLXNsaWRlJyk7XG5cbiAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgIGNlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuXG4gICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG4gICAgICAgIGlmIChpbmRleCA+PSBjZW50ZXJPZmZzZXQgJiYgaW5kZXggPD0gKF8uc2xpZGVDb3VudCAtIDEpIC0gY2VudGVyT2Zmc2V0KSB7XG4gICAgICAgICAgXy4kc2xpZGVzLnNsaWNlKGluZGV4IC0gY2VudGVyT2Zmc2V0LCBpbmRleCArIGNlbnRlck9mZnNldCArIDEpLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluZGV4T2Zmc2V0ID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIGluZGV4O1xuICAgICAgICAgIGFsbFNsaWRlcy5zbGljZShpbmRleE9mZnNldCAtIGNlbnRlck9mZnNldCArIDEsIGluZGV4T2Zmc2V0ICsgY2VudGVyT2Zmc2V0ICsgMikuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICBhbGxTbGlkZXMuZXEoYWxsU2xpZGVzLmxlbmd0aCAtIDEgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KS5hZGRDbGFzcygnc2xpY2stY2VudGVyJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IF8uc2xpZGVDb3VudCAtIDEpIHtcbiAgICAgICAgICBhbGxTbGlkZXMuZXEoXy5vcHRpb25zLnNsaWRlc1RvU2hvdykuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIF8uJHNsaWRlcy5lcShpbmRleCkuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8PSAoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykpIHtcbiAgICAgICAgXy4kc2xpZGVzLnNsaWNlKGluZGV4LCBpbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgfSBlbHNlIGlmIChhbGxTbGlkZXMubGVuZ3RoIDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgYWxsU2xpZGVzLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVtYWluZGVyID0gXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgaW5kZXhPZmZzZXQgPSBfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUgPyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgaW5kZXggOiBpbmRleDtcbiAgICAgICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICYmIChfLnNsaWRlQ291bnQgLSBpbmRleCkgPCBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgYWxsU2xpZGVzLnNsaWNlKGluZGV4T2Zmc2V0IC0gKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLSByZW1haW5kZXIpLCBpbmRleE9mZnNldCArIHJlbWFpbmRlcikuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWxsU2xpZGVzLnNsaWNlKGluZGV4T2Zmc2V0LCBpbmRleE9mZnNldCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF8ub3B0aW9ucy5sYXp5TG9hZCA9PT0gJ29uZGVtYW5kJykge1xuICAgICAgXy5sYXp5TG9hZCgpO1xuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuc2V0dXBJbmZpbml0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcyxcbiAgICAgIGksIHNsaWRlSW5kZXgsIGluZmluaXRlQ291bnQ7XG5cbiAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgIF8ub3B0aW9ucy5jZW50ZXJNb2RlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgIHNsaWRlSW5kZXggPSBudWxsO1xuXG4gICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICBpbmZpbml0ZUNvdW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5maW5pdGVDb3VudCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSBfLnNsaWRlQ291bnQ7IGkgPiAoXy5zbGlkZUNvdW50IC1cbiAgICAgICAgICAgICAgICAgICAgICAgIGluZmluaXRlQ291bnQpOyBpIC09IDEpIHtcbiAgICAgICAgICBzbGlkZUluZGV4ID0gaSAtIDE7XG4gICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5maW5pdGVDb3VudDsgaSArPSAxKSB7XG4gICAgICAgICAgc2xpZGVJbmRleCA9IGk7XG4gICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggKyBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oXy4kc2xpZGVUcmFjaykuYWRkQ2xhc3MoJ3NsaWNrLWNsb25lZCcpO1xuICAgICAgICB9XG4gICAgICAgIF8uJHNsaWRlVHJhY2suZmluZCgnLnNsaWNrLWNsb25lZCcpLmZpbmQoJ1tpZF0nKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQodGhpcykuYXR0cignaWQnLCAnJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuc2V0UGF1c2VkID0gZnVuY3Rpb24ocGF1c2VkKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5hdXRvcGxheSA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMucGF1c2VPbkhvdmVyID09PSB0cnVlKSB7XG4gICAgICBfLnBhdXNlZCA9IHBhdXNlZDtcbiAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuc2VsZWN0SGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuXG4gICAgbGV0IHRhcmdldEVsZW1lbnQgPSAkKGV2ZW50LnRhcmdldCkuaXMoJy5zbGljay1zbGlkZScpID9cbiAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KSA6XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkucGFyZW50cygnLnNsaWNrLXNsaWRlJyk7XG5cbiAgICBsZXQgaW5kZXggPSBwYXJzZUludCh0YXJnZXRFbGVtZW50LmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnKSk7XG5cbiAgICBpZiAoIWluZGV4KSBpbmRleCA9IDA7XG5cbiAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgIF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKS5yZW1vdmVDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgXy4kc2xpZGVzLmVxKGluZGV4KS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLXNsaWRlJykucmVtb3ZlQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuICAgICAgICBfLiRzbGlkZXMuZXEoaW5kZXgpLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcbiAgICAgIH1cbiAgICAgIF8uYXNOYXZGb3IoaW5kZXgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBfLnNsaWRlSGFuZGxlcihpbmRleCk7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnNsaWRlSGFuZGxlciA9IGZ1bmN0aW9uKGluZGV4LCBzeW5jLCBkb250QW5pbWF0ZSkge1xuICAgIGxldCB0YXJnZXRTbGlkZSwgYW5pbVNsaWRlLCBvbGRTbGlkZSwgc2xpZGVMZWZ0LCB0YXJnZXRMZWZ0ID0gbnVsbCxcbiAgICAgIF8gPSB0aGlzO1xuXG4gICAgc3luYyA9IHN5bmMgfHwgZmFsc2U7XG5cbiAgICBpZiAoXy5hbmltYXRpbmcgPT09IHRydWUgJiYgXy5vcHRpb25zLndhaXRGb3JBbmltYXRlID09PSB0cnVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlICYmIF8uY3VycmVudFNsaWRlID09PSBpbmRleCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzeW5jID09PSBmYWxzZSkge1xuICAgICAgXy5hc05hdkZvcihpbmRleCk7XG4gICAgfVxuXG4gICAgdGFyZ2V0U2xpZGUgPSBpbmRleDtcbiAgICB0YXJnZXRMZWZ0ID0gXy5nZXRMZWZ0KHRhcmdldFNsaWRlKTtcbiAgICBzbGlkZUxlZnQgPSBfLmdldExlZnQoXy5jdXJyZW50U2xpZGUpO1xuXG4gICAgXy5jdXJyZW50TGVmdCA9IF8uc3dpcGVMZWZ0ID09PSBudWxsID8gc2xpZGVMZWZ0IDogXy5zd2lwZUxlZnQ7XG5cbiAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gZmFsc2UgJiYgKGluZGV4IDwgMCB8fCBpbmRleCA+IF8uZ2V0RG90Q291bnQoKSAqIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkpIHtcbiAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgXy5hbmltYXRlU2xpZGUoc2xpZGVMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUgJiYgKGluZGV4IDwgMCB8fCBpbmRleCA+IChfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpKSkge1xuICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICB0YXJnZXRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcbiAgICAgICAgICBfLmFuaW1hdGVTbGlkZShzbGlkZUxlZnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoXy5hdXRvUGxheVRpbWVyKTtcbiAgICB9XG5cbiAgICBpZiAodGFyZ2V0U2xpZGUgPCAwKSB7XG4gICAgICBpZiAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKSB7XG4gICAgICAgIGFuaW1TbGlkZSA9IF8uc2xpZGVDb3VudCAtIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYW5pbVNsaWRlID0gXy5zbGlkZUNvdW50ICsgdGFyZ2V0U2xpZGU7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0YXJnZXRTbGlkZSA+PSBfLnNsaWRlQ291bnQpIHtcbiAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcbiAgICAgICAgYW5pbVNsaWRlID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFuaW1TbGlkZSA9IHRhcmdldFNsaWRlIC0gXy5zbGlkZUNvdW50O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBhbmltU2xpZGUgPSB0YXJnZXRTbGlkZTtcbiAgICB9XG5cbiAgICBfLmFuaW1hdGluZyA9IHRydWU7XG5cbiAgICBfLiRzbGlkZXIudHJpZ2dlcignYmVmb3JlQ2hhbmdlJywgW18sIF8uY3VycmVudFNsaWRlLCBhbmltU2xpZGVdKTtcblxuICAgIG9sZFNsaWRlID0gXy5jdXJyZW50U2xpZGU7XG4gICAgXy5jdXJyZW50U2xpZGUgPSBhbmltU2xpZGU7XG5cbiAgICBfLnNldFNsaWRlQ2xhc3NlcyhfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICBfLnVwZGF0ZURvdHMoKTtcbiAgICBfLnVwZGF0ZUFycm93cygpO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlKSB7XG4gICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcbiAgICAgICAgXy5mYWRlU2xpZGUoYW5pbVNsaWRlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF8ucG9zdFNsaWRlKGFuaW1TbGlkZSk7XG4gICAgICB9XG4gICAgICBfLmFuaW1hdGVIZWlnaHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcbiAgICAgIF8uYW5pbWF0ZVNsaWRlKHRhcmdldExlZnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF8ucG9zdFNsaWRlKGFuaW1TbGlkZSk7XG4gICAgfVxuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5zdGFydExvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG5cbiAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICBfLiRwcmV2QXJyb3cuaGlkZSgpO1xuICAgICAgXy4kbmV4dEFycm93LmhpZGUoKTtcbiAgICB9XG5cbiAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgXy4kZG90cy5oaWRlKCk7XG4gICAgfVxuXG4gICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1sb2FkaW5nJyk7XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnN3aXBlRGlyZWN0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHhEaXN0LCB5RGlzdCwgciwgc3dpcGVBbmdsZSwgXyA9IHRoaXM7XG5cbiAgICB4RGlzdCA9IF8udG91Y2hPYmplY3Quc3RhcnRYIC0gXy50b3VjaE9iamVjdC5jdXJYO1xuICAgIHlEaXN0ID0gXy50b3VjaE9iamVjdC5zdGFydFkgLSBfLnRvdWNoT2JqZWN0LmN1clk7XG4gICAgciA9IE1hdGguYXRhbjIoeURpc3QsIHhEaXN0KTtcblxuICAgIHN3aXBlQW5nbGUgPSBNYXRoLnJvdW5kKHIgKiAxODAgLyBNYXRoLlBJKTtcbiAgICBpZiAoc3dpcGVBbmdsZSA8IDApIHtcbiAgICAgIHN3aXBlQW5nbGUgPSAzNjAgLSBNYXRoLmFicyhzd2lwZUFuZ2xlKTtcbiAgICB9XG5cbiAgICBpZiAoKHN3aXBlQW5nbGUgPD0gNDUpICYmIChzd2lwZUFuZ2xlID49IDApKSB7XG4gICAgICByZXR1cm4gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gJ2xlZnQnIDogJ3JpZ2h0Jyk7XG4gICAgfVxuICAgIGlmICgoc3dpcGVBbmdsZSA8PSAzNjApICYmIChzd2lwZUFuZ2xlID49IDMxNSkpIHtcbiAgICAgIHJldHVybiAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAnbGVmdCcgOiAncmlnaHQnKTtcbiAgICB9XG4gICAgaWYgKChzd2lwZUFuZ2xlID49IDEzNSkgJiYgKHN3aXBlQW5nbGUgPD0gMjI1KSkge1xuICAgICAgcmV0dXJuIChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/ICdyaWdodCcgOiAnbGVmdCcpO1xuICAgIH1cbiAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKChzd2lwZUFuZ2xlID49IDM1KSAmJiAoc3dpcGVBbmdsZSA8PSAxMzUpKSB7XG4gICAgICAgIHJldHVybiAnbGVmdCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJ3JpZ2h0JztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJ3ZlcnRpY2FsJztcbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuc3dpcGVFbmQgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGxldCBfID0gdGhpcyxcbiAgICAgIHNsaWRlQ291bnQ7XG5cbiAgICBfLmRyYWdnaW5nID0gZmFsc2U7XG5cbiAgICBfLnNob3VsZENsaWNrID0gKF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPiAxMCkgPyBmYWxzZSA6IHRydWU7XG5cbiAgICBpZiAoXy50b3VjaE9iamVjdC5jdXJYID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoXy50b3VjaE9iamVjdC5lZGdlSGl0ID09PSB0cnVlKSB7XG4gICAgICBfLiRzbGlkZXIudHJpZ2dlcignZWRnZScsIFtfLCBfLnN3aXBlRGlyZWN0aW9uKCldKTtcbiAgICB9XG5cbiAgICBpZiAoXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA+PSBfLnRvdWNoT2JqZWN0Lm1pblN3aXBlKSB7XG4gICAgICBzd2l0Y2ggKF8uc3dpcGVEaXJlY3Rpb24oKSkge1xuICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgIHNsaWRlQ291bnQgPSBfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID8gXy5jaGVja05hdmlnYWJsZShfLmN1cnJlbnRTbGlkZSArIF8uZ2V0U2xpZGVDb3VudCgpKSA6IF8uY3VycmVudFNsaWRlICsgXy5nZXRTbGlkZUNvdW50KCk7XG4gICAgICAgIF8uc2xpZGVIYW5kbGVyKHNsaWRlQ291bnQpO1xuICAgICAgICBfLmN1cnJlbnREaXJlY3Rpb24gPSAwO1xuICAgICAgICBfLnRvdWNoT2JqZWN0ID0ge307XG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdzd2lwZScsIFtfLCAnbGVmdCddKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgc2xpZGVDb3VudCA9IF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPyBfLmNoZWNrTmF2aWdhYmxlKF8uY3VycmVudFNsaWRlIC0gXy5nZXRTbGlkZUNvdW50KCkpIDogXy5jdXJyZW50U2xpZGUgLSBfLmdldFNsaWRlQ291bnQoKTtcbiAgICAgICAgXy5zbGlkZUhhbmRsZXIoc2xpZGVDb3VudCk7XG4gICAgICAgIF8uY3VycmVudERpcmVjdGlvbiA9IDE7XG4gICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ3N3aXBlJywgW18sICdyaWdodCddKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChfLnRvdWNoT2JqZWN0LnN0YXJ0WCAhPT0gXy50b3VjaE9iamVjdC5jdXJYKSB7XG4gICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlKTtcbiAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuc3dpcGVIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG5cbiAgICBpZiAoKF8ub3B0aW9ucy5zd2lwZSA9PT0gZmFsc2UpIHx8ICgnb250b3VjaGVuZCcgaW4gZG9jdW1lbnQgJiYgXy5vcHRpb25zLnN3aXBlID09PSBmYWxzZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5kcmFnZ2FibGUgPT09IGZhbHNlICYmIGV2ZW50LnR5cGUuaW5kZXhPZignbW91c2UnKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBfLnRvdWNoT2JqZWN0LmZpbmdlckNvdW50ID0gZXZlbnQub3JpZ2luYWxFdmVudCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgICBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMubGVuZ3RoIDogMTtcblxuICAgIF8udG91Y2hPYmplY3QubWluU3dpcGUgPSBfLmxpc3RXaWR0aCAvIF8ub3B0aW9uc1xuICAgICAgICAgICAgLnRvdWNoVGhyZXNob2xkO1xuXG4gICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgIF8udG91Y2hPYmplY3QubWluU3dpcGUgPSBfLmxpc3RIZWlnaHQgLyBfLm9wdGlvbnNcbiAgICAgICAgICAgICAgICAudG91Y2hUaHJlc2hvbGQ7XG4gICAgfVxuXG4gICAgc3dpdGNoIChldmVudC5kYXRhLmFjdGlvbikge1xuXG4gICAgY2FzZSAnc3RhcnQnOlxuICAgICAgXy5zd2lwZVN0YXJ0KGV2ZW50KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbW92ZSc6XG4gICAgICBfLnN3aXBlTW92ZShldmVudCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2VuZCc6XG4gICAgICBfLnN3aXBlRW5kKGV2ZW50KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgfVxuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS5zd2lwZU1vdmUgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGxldCBfID0gdGhpcyxcbiAgICAgIGVkZ2VXYXNIaXQgPSBmYWxzZSxcbiAgICAgIGN1ckxlZnQsIHN3aXBlRGlyZWN0aW9uLCBzd2lwZUxlbmd0aCwgcG9zaXRpb25PZmZzZXQsIHRvdWNoZXM7XG5cbiAgICB0b3VjaGVzID0gZXZlbnQub3JpZ2luYWxFdmVudCAhPT0gdW5kZWZpbmVkID8gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzIDogbnVsbDtcblxuICAgIGlmICghXy5kcmFnZ2luZyB8fCB0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY3VyTGVmdCA9IF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICBfLnRvdWNoT2JqZWN0LmN1clggPSB0b3VjaGVzICE9PSB1bmRlZmluZWQgPyB0b3VjaGVzWzBdLnBhZ2VYIDogZXZlbnQuY2xpZW50WDtcbiAgICBfLnRvdWNoT2JqZWN0LmN1clkgPSB0b3VjaGVzICE9PSB1bmRlZmluZWQgPyB0b3VjaGVzWzBdLnBhZ2VZIDogZXZlbnQuY2xpZW50WTtcblxuICAgIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgIE1hdGgucG93KF8udG91Y2hPYmplY3QuY3VyWCAtIF8udG91Y2hPYmplY3Quc3RhcnRYLCAyKSkpO1xuXG4gICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgICAgICBNYXRoLnBvdyhfLnRvdWNoT2JqZWN0LmN1clkgLSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSwgMikpKTtcbiAgICB9XG5cbiAgICBzd2lwZURpcmVjdGlvbiA9IF8uc3dpcGVEaXJlY3Rpb24oKTtcblxuICAgIGlmIChzd2lwZURpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgJiYgXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA+IDQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgcG9zaXRpb25PZmZzZXQgPSAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAxIDogLTEpICogKF8udG91Y2hPYmplY3QuY3VyWCA+IF8udG91Y2hPYmplY3Quc3RhcnRYID8gMSA6IC0xKTtcbiAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgcG9zaXRpb25PZmZzZXQgPSBfLnRvdWNoT2JqZWN0LmN1clkgPiBfLnRvdWNoT2JqZWN0LnN0YXJ0WSA/IDEgOiAtMTtcbiAgICB9XG5cblxuICAgIHN3aXBlTGVuZ3RoID0gXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aDtcblxuICAgIF8udG91Y2hPYmplY3QuZWRnZUhpdCA9IGZhbHNlO1xuXG4gICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgPT09IDAgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdyaWdodCcpIHx8IChfLmN1cnJlbnRTbGlkZSA+PSBfLmdldERvdENvdW50KCkgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdsZWZ0JykpIHtcbiAgICAgICAgc3dpcGVMZW5ndGggPSBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoICogXy5vcHRpb25zLmVkZ2VGcmljdGlvbjtcbiAgICAgICAgXy50b3VjaE9iamVjdC5lZGdlSGl0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgXy5zd2lwZUxlZnQgPSBjdXJMZWZ0ICsgc3dpcGVMZW5ndGggKiBwb3NpdGlvbk9mZnNldDtcbiAgICB9IGVsc2Uge1xuICAgICAgXy5zd2lwZUxlZnQgPSBjdXJMZWZ0ICsgKHN3aXBlTGVuZ3RoICogKF8uJGxpc3QuaGVpZ2h0KCkgLyBfLmxpc3RXaWR0aCkpICogcG9zaXRpb25PZmZzZXQ7XG4gICAgfVxuICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyBzd2lwZUxlbmd0aCAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgIH1cblxuICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gdHJ1ZSB8fCBfLm9wdGlvbnMudG91Y2hNb3ZlID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChfLmFuaW1hdGluZyA9PT0gdHJ1ZSkge1xuICAgICAgXy5zd2lwZUxlZnQgPSBudWxsO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIF8uc2V0Q1NTKF8uc3dpcGVMZWZ0KTtcbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUuc3dpcGVTdGFydCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGV0IF8gPSB0aGlzLFxuICAgICAgdG91Y2hlcztcblxuICAgIGlmIChfLnRvdWNoT2JqZWN0LmZpbmdlckNvdW50ICE9PSAxIHx8IF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICBfLnRvdWNoT2JqZWN0ID0ge307XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdG91Y2hlcyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXTtcbiAgICB9XG5cbiAgICBfLnRvdWNoT2JqZWN0LnN0YXJ0WCA9IF8udG91Y2hPYmplY3QuY3VyWCA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXMucGFnZVggOiBldmVudC5jbGllbnRYO1xuICAgIF8udG91Y2hPYmplY3Quc3RhcnRZID0gXy50b3VjaE9iamVjdC5jdXJZID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWSA6IGV2ZW50LmNsaWVudFk7XG5cbiAgICBfLmRyYWdnaW5nID0gdHJ1ZTtcbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUudW5maWx0ZXJTbGlkZXMgPSBTbGljay5wcm90b3R5cGUuc2xpY2tVbmZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIGlmIChfLiRzbGlkZXNDYWNoZSAhPT0gbnVsbCkge1xuICAgICAgXy51bmxvYWQoKTtcblxuICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICBfLiRzbGlkZXNDYWNoZS5hcHBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcblxuICAgICAgXy5yZWluaXQoKTtcbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgICQoJy5zbGljay1jbG9uZWQnLCBfLiRzbGlkZXIpLnJlbW92ZSgpO1xuICAgIGlmIChfLiRkb3RzKSB7XG4gICAgICBfLiRkb3RzLnJlbW92ZSgpO1xuICAgIH1cbiAgICBpZiAoXy4kcHJldkFycm93ICYmICh0eXBlb2YgXy5vcHRpb25zLnByZXZBcnJvdyAhPT0gJ29iamVjdCcpKSB7XG4gICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlKCk7XG4gICAgfVxuICAgIGlmIChfLiRuZXh0QXJyb3cgJiYgKHR5cGVvZiBfLm9wdGlvbnMubmV4dEFycm93ICE9PSAnb2JqZWN0JykpIHtcbiAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmUoKTtcbiAgICB9XG4gICAgXy4kc2xpZGVzLnJlbW92ZUNsYXNzKCdzbGljay1zbGlkZSBzbGljay1hY3RpdmUgc2xpY2stdmlzaWJsZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKS5jc3MoJ3dpZHRoJywgJycpO1xuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS51bnNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzO1xuICAgIF8uZGVzdHJveSgpO1xuICB9O1xuXG4gIFNsaWNrLnByb3RvdHlwZS51cGRhdGVBcnJvd3MgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXMsXG4gICAgICBjZW50ZXJPZmZzZXQ7XG5cbiAgICBjZW50ZXJPZmZzZXQgPSBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKTtcblxuICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8ub3B0aW9ucy5pbmZpbml0ZSAhPT1cbiAgICAgICAgICAgIHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgXy4kcHJldkFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpO1xuICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpO1xuICAgICAgaWYgKF8uY3VycmVudFNsaWRlID09PSAwKSB7XG4gICAgICAgIF8uJHByZXZBcnJvdy5hZGRDbGFzcygnc2xpY2stZGlzYWJsZWQnKTtcbiAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpO1xuICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSkge1xuICAgICAgICBfLiRuZXh0QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKTtcbiAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gMSAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICBfLiRuZXh0QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgU2xpY2sucHJvdG90eXBlLnVwZGF0ZURvdHMgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgXyA9IHRoaXM7XG5cbiAgICBpZiAoXy4kZG90cyAhPT0gbnVsbCkge1xuICAgICAgXy4kZG90cy5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICBfLiRkb3RzLmZpbmQoJ2xpJykuZXEoTWF0aC5mbG9vcihfLmN1cnJlbnRTbGlkZSAvIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkpLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgIH1cbiAgfTtcblxuICBTbGljay5wcm90b3R5cGUudmlzaWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBfID0gdGhpcztcblxuICAgIGlmIChkb2N1bWVudFtfLmhpZGRlbl0pIHtcbiAgICAgIF8ucGF1c2VkID0gdHJ1ZTtcbiAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBfLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgXy5hdXRvUGxheSgpO1xuICAgIH1cbiAgfTtcblxuICAkLmZuLnNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IF8gPSB0aGlzLFxuICAgICAgb3B0ID0gYXJndW1lbnRzWzBdLFxuICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICBsID0gXy5sZW5ndGgsXG4gICAgICBpID0gMCxcbiAgICAgIHJldDtcbiAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0ID09ICdvYmplY3QnIHx8IHR5cGVvZiBvcHQgPT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgIF9baV0uc2xpY2sgPSBuZXcgU2xpY2soX1tpXSwgb3B0KTtcbiAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXQgPSBfW2ldLnNsaWNrW29wdF0uYXBwbHkoX1tpXS5zbGljaywgYXJncyk7XG4gICAgICBpZiAodHlwZW9mIHJldCAhPSAndW5kZWZpbmVkJykgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0dXJuIF87XG4gIH07XG59KSk7XG4iXX0=
