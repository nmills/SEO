(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);




var _accordion = require('modules/accordion.js');var _accordion2 = _interopRequireDefault(_accordion);

var _custom = require('modules/custom.js');var _custom2 = _interopRequireDefault(_custom);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // import prepInputs from 'modules/prepinputs.js';
// import socialShare from 'modules/socialShare.js';
// import carousel from 'modules/carousel.js';
// import qtip from 'modules/qtip.js';
(function ($) {$(document).ready(function () {ready();

        // Styleguide event when an element is rendered
        $(window).bind("styleguide:onRendered", function (e) {
            ready();
        });
    });

    // Initalizing all modules
    function ready() {
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
        (0, _accordion2.default)();

        // Initialize Plugins
        // $('.magnific-trigger').magnificPopup({
        //   type: 'inline',
        // });

        // Initialize Gallery Slider
        // galleryWidget();

        (0, _custom2.default)();
    }
})(_jquery2.default); // import galleryWidget from 'modules/galleryWidget.js';

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"modules/accordion.js":2,"modules/custom.js":3}],2:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =



function () {
  $('.toggle').click(function (e) {
    e.preventDefault();

    var $this = $(this);

    // Collapse
    if ($this.find('.answer').hasClass('show')) {
      $this.find('.answer').removeClass('show');
      $this.removeClass('active');
      $this.find('.answer').slideUp(350);
    }
    // Expand
    else {
        $this.find('.answer').removeClass('show');
        $('.toggle').removeClass('active');
        $this.find('.answer').slideUp(350);
        $this.addClass('active');
        $this.find('.answer').toggleClass('show');
        $this.find('.answer').slideToggle(350);
      }
    console.log($this.find('li .answer'));
  });
  console.log('test');
};

},{}],3:[function(require,module,exports){
"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default =



function () {
	$(".c-uie__dropdown-heading").hover(
	function () {
		$(".c-uie__dropdown-heading .c-uie__dropdown-options").addClass("drop");
	},
	function () {
		$(".c-uie__dropdown-heading .c-uie__dropdown-options").removeClass("drop");
	});


	$(".cross").hide();
	// $( ".c-menu__container" ).hide();

	$(".hamburger").click(function () {
		$(".c-menu__container").slideToggle("slow", function () {
			$(".hamburger").hide();
			$(".cross").show();
		});
	});

	$(".cross").click(function () {
		$(".c-menu__container").slideToggle("slow", function () {
			$(".cross").hide();
			$(".hamburger").show();
		});
	});
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxzcmNcXGpzXFxtYWluLmpzIiwic3JjXFxqc1xcbW9kdWxlc1xcYWNjb3JkaW9uLmpzIiwic3JjXFxqc1xcbW9kdWxlc1xcY3VzdG9tLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7O0FBRUEsZ0M7Ozs7O0FBS0EsaUQ7O0FBRUEsMkMsNklBTkE7QUFDQTtBQUNBO0FBQ0E7QUFLQSxDQUFDLFVBQVMsQ0FBVCxFQUFZLENBQ1gsRUFBRyxRQUFILEVBQWMsS0FBZCxDQUFvQixZQUFXLENBQzdCOztBQUVBO0FBQ0EsVUFBRSxNQUFGLEVBQVUsSUFBVixDQUFlLHVCQUFmLEVBQXdDLFVBQVMsQ0FBVCxFQUFZO0FBQ2xEO0FBQ0QsU0FGRDtBQUdELEtBUEQ7O0FBU0E7QUFDQSxhQUFTLEtBQVQsR0FBaUI7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDRDtBQUNGLENBckNELG9CLENBSEE7Ozs7Ozs7OztBQ0xlLFlBQVc7QUFDeEIsSUFBRSxTQUFGLEVBQWEsS0FBYixDQUFtQixVQUFTLENBQVQsRUFBWTtBQUM3QixNQUFFLGNBQUY7O0FBRUEsUUFBSSxRQUFRLEVBQUUsSUFBRixDQUFaOztBQUVBO0FBQ0EsUUFBSSxNQUFNLElBQU4sQ0FBVyxTQUFYLEVBQXNCLFFBQXRCLENBQStCLE1BQS9CLENBQUosRUFBNEM7QUFDMUMsWUFBTSxJQUFOLENBQVcsU0FBWCxFQUFzQixXQUF0QixDQUFrQyxNQUFsQztBQUNBLFlBQU0sV0FBTixDQUFrQixRQUFsQjtBQUNBLFlBQU0sSUFBTixDQUFXLFNBQVgsRUFBc0IsT0FBdEIsQ0FBOEIsR0FBOUI7QUFDRDtBQUNEO0FBTEEsU0FNSztBQUNILGNBQU0sSUFBTixDQUFXLFNBQVgsRUFBc0IsV0FBdEIsQ0FBa0MsTUFBbEM7QUFDQSxVQUFFLFNBQUYsRUFBYSxXQUFiLENBQXlCLFFBQXpCO0FBQ0EsY0FBTSxJQUFOLENBQVcsU0FBWCxFQUFzQixPQUF0QixDQUE4QixHQUE5QjtBQUNBLGNBQU0sUUFBTixDQUFlLFFBQWY7QUFDQSxjQUFNLElBQU4sQ0FBVyxTQUFYLEVBQXNCLFdBQXRCLENBQWtDLE1BQWxDO0FBQ0EsY0FBTSxJQUFOLENBQVcsU0FBWCxFQUFzQixXQUF0QixDQUFrQyxHQUFsQztBQUNEO0FBQ0QsWUFBUSxHQUFSLENBQVksTUFBTSxJQUFOLENBQVcsWUFBWCxDQUFaO0FBQ0QsR0FyQkQ7QUFzQkEsVUFBUSxHQUFSLENBQVksTUFBWjtBQUNELEM7Ozs7Ozs7QUN4QmMsWUFBVztBQUN4QixHQUFFLDBCQUFGLEVBQThCLEtBQTlCO0FBQ0UsYUFBVztBQUNULElBQUUsbURBQUYsRUFBdUQsUUFBdkQsQ0FBZ0UsTUFBaEU7QUFDRCxFQUhIO0FBSUUsYUFBVztBQUNULElBQUUsbURBQUYsRUFBdUQsV0FBdkQsQ0FBbUUsTUFBbkU7QUFDRCxFQU5IOzs7QUFTQyxHQUFHLFFBQUgsRUFBYyxJQUFkO0FBQ0Y7O0FBRUEsR0FBRyxZQUFILEVBQWtCLEtBQWxCLENBQXdCLFlBQVc7QUFDbEMsSUFBRyxvQkFBSCxFQUEwQixXQUExQixDQUF1QyxNQUF2QyxFQUErQyxZQUFXO0FBQ3pELEtBQUcsWUFBSCxFQUFrQixJQUFsQjtBQUNBLEtBQUcsUUFBSCxFQUFjLElBQWQ7QUFDQSxHQUhEO0FBSUEsRUFMRDs7QUFPQSxHQUFHLFFBQUgsRUFBYyxLQUFkLENBQW9CLFlBQVc7QUFDOUIsSUFBRyxvQkFBSCxFQUEwQixXQUExQixDQUF1QyxNQUF2QyxFQUErQyxZQUFXO0FBQ3pELEtBQUcsUUFBSCxFQUFjLElBQWQ7QUFDQSxLQUFHLFlBQUgsRUFBa0IsSUFBbEI7QUFDQSxHQUhEO0FBSUEsRUFMRDtBQU1BLEMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBqcXVlcnkgZnJvbSAnanF1ZXJ5JztcclxuLy8gaW1wb3J0IHByZXBJbnB1dHMgZnJvbSAnbW9kdWxlcy9wcmVwaW5wdXRzLmpzJztcclxuLy8gaW1wb3J0IHNvY2lhbFNoYXJlIGZyb20gJ21vZHVsZXMvc29jaWFsU2hhcmUuanMnO1xyXG4vLyBpbXBvcnQgY2Fyb3VzZWwgZnJvbSAnbW9kdWxlcy9jYXJvdXNlbC5qcyc7XHJcbi8vIGltcG9ydCBxdGlwIGZyb20gJ21vZHVsZXMvcXRpcC5qcyc7XHJcbmltcG9ydCBhY2NvcmRpb24gZnJvbSAnbW9kdWxlcy9hY2NvcmRpb24uanMnO1xyXG4vLyBpbXBvcnQgZ2FsbGVyeVdpZGdldCBmcm9tICdtb2R1bGVzL2dhbGxlcnlXaWRnZXQuanMnO1xyXG5pbXBvcnQgY3VzdG9tIGZyb20gJ21vZHVsZXMvY3VzdG9tLmpzJztcclxuXHJcbihmdW5jdGlvbigkKSB7XHJcbiAgJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIHJlYWR5KCk7XHJcbiAgICBcclxuICAgIC8vIFN0eWxlZ3VpZGUgZXZlbnQgd2hlbiBhbiBlbGVtZW50IGlzIHJlbmRlcmVkXHJcbiAgICAkKHdpbmRvdykuYmluZChcInN0eWxlZ3VpZGU6b25SZW5kZXJlZFwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHJlYWR5KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gSW5pdGFsaXppbmcgYWxsIG1vZHVsZXNcclxuICBmdW5jdGlvbiByZWFkeSgpIHtcclxuICAgIC8vIFByZXBhcmUgZm9ybSBpbnB1dHNcclxuICAgIC8vIHByZXBJbnB1dHMoKTtcclxuICAgIC8vIEluaXRpYWxpemUgc29jaWFsIHNoYXJlIGZ1bmN0aW9uYWxpdHkuXHJcbiAgICAvLyBSZXBsYWNlIHRoZSBlbXB0eSBzdHJpbmcgcGFyYW1ldGVyIHdpdGggeW91ciBGYWNlYm9vayBJRFxyXG4gICAgLy8gc29jaWFsU2hhcmUoJycpO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgY2Fyb3VzZWxzXHJcbiAgICAvLyBjYXJvdXNlbCgpO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgcVRpcFxyXG4gICAgLy8gcXRpcCgpO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgYWNjb3JkaW9uXHJcbiAgICBhY2NvcmRpb24oKTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIFBsdWdpbnNcclxuICAgIC8vICQoJy5tYWduaWZpYy10cmlnZ2VyJykubWFnbmlmaWNQb3B1cCh7XHJcbiAgICAvLyAgIHR5cGU6ICdpbmxpbmUnLFxyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBHYWxsZXJ5IFNsaWRlclxyXG4gICAgLy8gZ2FsbGVyeVdpZGdldCgpO1xyXG5cclxuICAgIGN1c3RvbSgpO1xyXG4gIH1cclxufSkoanF1ZXJ5KTtcclxuIiwiLyoqXHJcbiogQWNjb3JkaW9uXHJcbiovXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcclxuICAkKCcudG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIGxldCAkdGhpcyA9ICQodGhpcyk7XHJcblxyXG4gICAgLy8gQ29sbGFwc2VcclxuICAgIGlmICgkdGhpcy5maW5kKCcuYW5zd2VyJykuaGFzQ2xhc3MoJ3Nob3cnKSkge1xyXG4gICAgICAkdGhpcy5maW5kKCcuYW5zd2VyJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcclxuICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAkdGhpcy5maW5kKCcuYW5zd2VyJykuc2xpZGVVcCgzNTApO1xyXG4gICAgfVxyXG4gICAgLy8gRXhwYW5kXHJcbiAgICBlbHNlIHtcclxuICAgICAgJHRoaXMuZmluZCgnLmFuc3dlcicpLnJlbW92ZUNsYXNzKCdzaG93Jyk7XHJcbiAgICAgICQoJy50b2dnbGUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICR0aGlzLmZpbmQoJy5hbnN3ZXInKS5zbGlkZVVwKDM1MCk7XHJcbiAgICAgICR0aGlzLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgJHRoaXMuZmluZCgnLmFuc3dlcicpLnRvZ2dsZUNsYXNzKCdzaG93Jyk7XHJcbiAgICAgICR0aGlzLmZpbmQoJy5hbnN3ZXInKS5zbGlkZVRvZ2dsZSgzNTApO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coJHRoaXMuZmluZCgnbGkgLmFuc3dlcicpKTtcclxuICB9KTtcclxuICBjb25zb2xlLmxvZygndGVzdCcpO1xyXG59IiwiLyoqXHJcbiogQ3VzdG9tIEpzXHJcbiovXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcclxuICAkKFwiLmMtdWllX19kcm9wZG93bi1oZWFkaW5nXCIpLmhvdmVyKFxyXG4gICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICQoXCIuYy11aWVfX2Ryb3Bkb3duLWhlYWRpbmcgLmMtdWllX19kcm9wZG93bi1vcHRpb25zXCIpLmFkZENsYXNzKFwiZHJvcFwiKTtcclxuICAgIH0sXHJcbiAgICBmdW5jdGlvbigpIHtcclxuICAgICAgJChcIi5jLXVpZV9fZHJvcGRvd24taGVhZGluZyAuYy11aWVfX2Ryb3Bkb3duLW9wdGlvbnNcIikucmVtb3ZlQ2xhc3MoXCJkcm9wXCIpO1xyXG4gICAgfVxyXG4gICk7XHJcblxyXG4gIFx0JCggXCIuY3Jvc3NcIiApLmhpZGUoKTtcclxuXHQvLyAkKCBcIi5jLW1lbnVfX2NvbnRhaW5lclwiICkuaGlkZSgpO1xyXG5cdFxyXG5cdCQoIFwiLmhhbWJ1cmdlclwiICkuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHQkKCBcIi5jLW1lbnVfX2NvbnRhaW5lclwiICkuc2xpZGVUb2dnbGUoIFwic2xvd1wiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0JCggXCIuaGFtYnVyZ2VyXCIgKS5oaWRlKCk7XHJcblx0XHRcdCQoIFwiLmNyb3NzXCIgKS5zaG93KCk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxuXHJcblx0JCggXCIuY3Jvc3NcIiApLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0JCggXCIuYy1tZW51X19jb250YWluZXJcIiApLnNsaWRlVG9nZ2xlKCBcInNsb3dcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdCQoIFwiLmNyb3NzXCIgKS5oaWRlKCk7XHJcblx0XHRcdCQoIFwiLmhhbWJ1cmdlclwiICkuc2hvdygpO1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcbn0iXX0=
