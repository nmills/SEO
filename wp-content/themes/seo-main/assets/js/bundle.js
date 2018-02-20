(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);




var _accordion = require('modules/accordion.js');var _accordion2 = _interopRequireDefault(_accordion);

var _custom = require('modules/custom.js');var _custom2 = _interopRequireDefault(_custom);
var _searchBar = require('modules/searchBar.js');var _searchBar2 = _interopRequireDefault(_searchBar);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // import galleryWidget from 'modules/galleryWidget.js';

(function ($) {
    $(document).ready(function () {
        ready();

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
        (0, _searchBar2.default)();
    }
})(_jquery2.default); // import prepInputs from 'modules/prepinputs.js';
// import socialShare from 'modules/socialShare.js';
// import carousel from 'modules/carousel.js';
// import qtip from 'modules/qtip.js';

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"modules/accordion.js":2,"modules/custom.js":3,"modules/searchBar.js":4}],2:[function(require,module,exports){
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
  });
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

},{}],4:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =



function () {
  var searchForm = $('.c-searchform');
  var searchBtn = $('.c-search-btn');
  var searchBtnClose = $('.c-searchform__close-btn');


  if (searchForm.length) {
    searchBtn.click(function (e) {
      e.preventDefault();
      searchForm.addClass('active');
    });

    searchBtnClose.click(function (e) {
      e.preventDefault();
      searchForm.removeClass('active');
    });
  }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxzcmNcXGpzXFxtYWluLmpzIiwic3JjXFxqc1xcbW9kdWxlc1xcYWNjb3JkaW9uLmpzIiwic3JjXFxqc1xcbW9kdWxlc1xcY3VzdG9tLmpzIiwic3JjXFxqc1xcbW9kdWxlc1xcc2VhcmNoQmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7O0FBRUEsZ0M7Ozs7O0FBS0EsaUQ7O0FBRUEsMkM7QUFDQSxpRCxtSkFGQTs7QUFJQSxDQUFDLFVBQVMsQ0FBVCxFQUFZO0FBQ1gsTUFBRyxRQUFILEVBQWMsS0FBZCxDQUFvQixZQUFXO0FBQzdCOztBQUVBO0FBQ0EsVUFBRSxNQUFGLEVBQVUsSUFBVixDQUFlLHVCQUFmLEVBQXdDLFVBQVMsQ0FBVCxFQUFZO0FBQ2xEO0FBQ0QsU0FGRDtBQUdELEtBUEQ7O0FBU0E7QUFDQSxhQUFTLEtBQVQsR0FBaUI7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNEO0FBQ0YsQ0F0Q0Qsb0IsQ0FUQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDSGUsWUFBVztBQUN4QixJQUFFLFNBQUYsRUFBYSxLQUFiLENBQW1CLFVBQVMsQ0FBVCxFQUFZO0FBQzdCLE1BQUUsY0FBRjs7QUFFQSxRQUFJLFFBQVEsRUFBRSxJQUFGLENBQVo7O0FBRUE7QUFDQSxRQUFJLE1BQU0sSUFBTixDQUFXLFNBQVgsRUFBc0IsUUFBdEIsQ0FBK0IsTUFBL0IsQ0FBSixFQUE0QztBQUMxQyxZQUFNLElBQU4sQ0FBVyxTQUFYLEVBQXNCLFdBQXRCLENBQWtDLE1BQWxDO0FBQ0EsWUFBTSxXQUFOLENBQWtCLFFBQWxCO0FBQ0EsWUFBTSxJQUFOLENBQVcsU0FBWCxFQUFzQixPQUF0QixDQUE4QixHQUE5QjtBQUNEO0FBQ0Q7QUFMQSxTQU1LO0FBQ0gsY0FBTSxJQUFOLENBQVcsU0FBWCxFQUFzQixXQUF0QixDQUFrQyxNQUFsQztBQUNBLFVBQUUsU0FBRixFQUFhLFdBQWIsQ0FBeUIsUUFBekI7QUFDQSxjQUFNLElBQU4sQ0FBVyxTQUFYLEVBQXNCLE9BQXRCLENBQThCLEdBQTlCO0FBQ0EsY0FBTSxRQUFOLENBQWUsUUFBZjtBQUNBLGNBQU0sSUFBTixDQUFXLFNBQVgsRUFBc0IsV0FBdEIsQ0FBa0MsTUFBbEM7QUFDQSxjQUFNLElBQU4sQ0FBVyxTQUFYLEVBQXNCLFdBQXRCLENBQWtDLEdBQWxDO0FBQ0Q7QUFDRixHQXBCRDtBQXFCRCxDOzs7Ozs7O0FDdEJjLFlBQVc7QUFDeEIsR0FBRSwwQkFBRixFQUE4QixLQUE5QjtBQUNFLGFBQVc7QUFDVCxJQUFFLG1EQUFGLEVBQXVELFFBQXZELENBQWdFLE1BQWhFO0FBQ0QsRUFISDtBQUlFLGFBQVc7QUFDVCxJQUFFLG1EQUFGLEVBQXVELFdBQXZELENBQW1FLE1BQW5FO0FBQ0QsRUFOSDs7O0FBU0MsR0FBRyxRQUFILEVBQWMsSUFBZDtBQUNGOztBQUVBLEdBQUcsWUFBSCxFQUFrQixLQUFsQixDQUF3QixZQUFXO0FBQ2xDLElBQUcsb0JBQUgsRUFBMEIsV0FBMUIsQ0FBdUMsTUFBdkMsRUFBK0MsWUFBVztBQUN6RCxLQUFHLFlBQUgsRUFBa0IsSUFBbEI7QUFDQSxLQUFHLFFBQUgsRUFBYyxJQUFkO0FBQ0EsR0FIRDtBQUlBLEVBTEQ7O0FBT0EsR0FBRyxRQUFILEVBQWMsS0FBZCxDQUFvQixZQUFXO0FBQzlCLElBQUcsb0JBQUgsRUFBMEIsV0FBMUIsQ0FBdUMsTUFBdkMsRUFBK0MsWUFBVztBQUN6RCxLQUFHLFFBQUgsRUFBYyxJQUFkO0FBQ0EsS0FBRyxZQUFILEVBQWtCLElBQWxCO0FBQ0EsR0FIRDtBQUlBLEVBTEQ7QUFNQSxDOzs7Ozs7O0FDMUJjLFlBQVc7QUFDeEIsTUFBSSxhQUFhLEVBQUUsZUFBRixDQUFqQjtBQUNBLE1BQUksWUFBWSxFQUFFLGVBQUYsQ0FBaEI7QUFDQSxNQUFJLGlCQUFpQixFQUFFLDBCQUFGLENBQXJCOzs7QUFHQSxNQUFHLFdBQVcsTUFBZCxFQUFzQjtBQUNwQixjQUFVLEtBQVYsQ0FBZ0IsVUFBVSxDQUFWLEVBQWE7QUFDM0IsUUFBRSxjQUFGO0FBQ0EsaUJBQVcsUUFBWCxDQUFvQixRQUFwQjtBQUNELEtBSEQ7O0FBS0EsbUJBQWUsS0FBZixDQUFxQixVQUFVLENBQVYsRUFBWTtBQUMvQixRQUFFLGNBQUY7QUFDQSxpQkFBVyxXQUFYLENBQXVCLFFBQXZCO0FBQ0QsS0FIRDtBQUlEO0FBQ0YsQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IGpxdWVyeSBmcm9tICdqcXVlcnknO1xyXG4vLyBpbXBvcnQgcHJlcElucHV0cyBmcm9tICdtb2R1bGVzL3ByZXBpbnB1dHMuanMnO1xyXG4vLyBpbXBvcnQgc29jaWFsU2hhcmUgZnJvbSAnbW9kdWxlcy9zb2NpYWxTaGFyZS5qcyc7XHJcbi8vIGltcG9ydCBjYXJvdXNlbCBmcm9tICdtb2R1bGVzL2Nhcm91c2VsLmpzJztcclxuLy8gaW1wb3J0IHF0aXAgZnJvbSAnbW9kdWxlcy9xdGlwLmpzJztcclxuaW1wb3J0IGFjY29yZGlvbiBmcm9tICdtb2R1bGVzL2FjY29yZGlvbi5qcyc7XHJcbi8vIGltcG9ydCBnYWxsZXJ5V2lkZ2V0IGZyb20gJ21vZHVsZXMvZ2FsbGVyeVdpZGdldC5qcyc7XHJcbmltcG9ydCBjdXN0b20gZnJvbSAnbW9kdWxlcy9jdXN0b20uanMnO1xyXG5pbXBvcnQgc2VhcmNoQmFyIGZyb20gJ21vZHVsZXMvc2VhcmNoQmFyLmpzJztcclxuXHJcbihmdW5jdGlvbigkKSB7XHJcbiAgJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIHJlYWR5KCk7XHJcbiAgICBcclxuICAgIC8vIFN0eWxlZ3VpZGUgZXZlbnQgd2hlbiBhbiBlbGVtZW50IGlzIHJlbmRlcmVkXHJcbiAgICAkKHdpbmRvdykuYmluZChcInN0eWxlZ3VpZGU6b25SZW5kZXJlZFwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHJlYWR5KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgLy8gSW5pdGFsaXppbmcgYWxsIG1vZHVsZXNcclxuICBmdW5jdGlvbiByZWFkeSgpIHtcclxuICAgIC8vIFByZXBhcmUgZm9ybSBpbnB1dHNcclxuICAgIC8vIHByZXBJbnB1dHMoKTtcclxuICAgIC8vIEluaXRpYWxpemUgc29jaWFsIHNoYXJlIGZ1bmN0aW9uYWxpdHkuXHJcbiAgICAvLyBSZXBsYWNlIHRoZSBlbXB0eSBzdHJpbmcgcGFyYW1ldGVyIHdpdGggeW91ciBGYWNlYm9vayBJRFxyXG4gICAgLy8gc29jaWFsU2hhcmUoJycpO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgY2Fyb3VzZWxzXHJcbiAgICAvLyBjYXJvdXNlbCgpO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgcVRpcFxyXG4gICAgLy8gcXRpcCgpO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgYWNjb3JkaW9uXHJcbiAgICBhY2NvcmRpb24oKTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIFBsdWdpbnNcclxuICAgIC8vICQoJy5tYWduaWZpYy10cmlnZ2VyJykubWFnbmlmaWNQb3B1cCh7XHJcbiAgICAvLyAgIHR5cGU6ICdpbmxpbmUnLFxyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBHYWxsZXJ5IFNsaWRlclxyXG4gICAgLy8gZ2FsbGVyeVdpZGdldCgpO1xyXG5cclxuICAgIGN1c3RvbSgpO1xyXG4gICAgc2VhcmNoQmFyKCk7XHJcbiAgfVxyXG59KShqcXVlcnkpO1xyXG4iLCIvKipcclxuKiBBY2NvcmRpb25cclxuKi9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xyXG4gICQoJy50b2dnbGUnKS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgbGV0ICR0aGlzID0gJCh0aGlzKTtcclxuXHJcbiAgICAvLyBDb2xsYXBzZVxyXG4gICAgaWYgKCR0aGlzLmZpbmQoJy5hbnN3ZXInKS5oYXNDbGFzcygnc2hvdycpKSB7XHJcbiAgICAgICR0aGlzLmZpbmQoJy5hbnN3ZXInKS5yZW1vdmVDbGFzcygnc2hvdycpO1xyXG4gICAgICAkdGhpcy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICR0aGlzLmZpbmQoJy5hbnN3ZXInKS5zbGlkZVVwKDM1MCk7XHJcbiAgICB9XHJcbiAgICAvLyBFeHBhbmRcclxuICAgIGVsc2Uge1xyXG4gICAgICAkdGhpcy5maW5kKCcuYW5zd2VyJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcclxuICAgICAgJCgnLnRvZ2dsZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgJHRoaXMuZmluZCgnLmFuc3dlcicpLnNsaWRlVXAoMzUwKTtcclxuICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAkdGhpcy5maW5kKCcuYW5zd2VyJykudG9nZ2xlQ2xhc3MoJ3Nob3cnKTtcclxuICAgICAgJHRoaXMuZmluZCgnLmFuc3dlcicpLnNsaWRlVG9nZ2xlKDM1MCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0iLCIvKipcclxuKiBDdXN0b20gSnNcclxuKi9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xyXG4gICQoXCIuYy11aWVfX2Ryb3Bkb3duLWhlYWRpbmdcIikuaG92ZXIoXHJcbiAgICBmdW5jdGlvbigpIHtcclxuICAgICAgJChcIi5jLXVpZV9fZHJvcGRvd24taGVhZGluZyAuYy11aWVfX2Ryb3Bkb3duLW9wdGlvbnNcIikuYWRkQ2xhc3MoXCJkcm9wXCIpO1xyXG4gICAgfSxcclxuICAgIGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKFwiLmMtdWllX19kcm9wZG93bi1oZWFkaW5nIC5jLXVpZV9fZHJvcGRvd24tb3B0aW9uc1wiKS5yZW1vdmVDbGFzcyhcImRyb3BcIik7XHJcbiAgICB9XHJcbiAgKTtcclxuXHJcbiAgXHQkKCBcIi5jcm9zc1wiICkuaGlkZSgpO1xyXG5cdC8vICQoIFwiLmMtbWVudV9fY29udGFpbmVyXCIgKS5oaWRlKCk7XHJcblx0XHJcblx0JCggXCIuaGFtYnVyZ2VyXCIgKS5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdCQoIFwiLmMtbWVudV9fY29udGFpbmVyXCIgKS5zbGlkZVRvZ2dsZSggXCJzbG93XCIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHQkKCBcIi5oYW1idXJnZXJcIiApLmhpZGUoKTtcclxuXHRcdFx0JCggXCIuY3Jvc3NcIiApLnNob3coKTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cclxuXHQkKCBcIi5jcm9zc1wiICkuY2xpY2soZnVuY3Rpb24oKSB7XHJcblx0XHQkKCBcIi5jLW1lbnVfX2NvbnRhaW5lclwiICkuc2xpZGVUb2dnbGUoIFwic2xvd1wiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0JCggXCIuY3Jvc3NcIiApLmhpZGUoKTtcclxuXHRcdFx0JCggXCIuaGFtYnVyZ2VyXCIgKS5zaG93KCk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxufSIsIi8qKlxyXG4qIFNlYXJjaCBCYXJcclxuKi9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBzZWFyY2hGb3JtID0gJCgnLmMtc2VhcmNoZm9ybScpO1xyXG4gIHZhciBzZWFyY2hCdG4gPSAkKCcuYy1zZWFyY2gtYnRuJyk7XHJcbiAgdmFyIHNlYXJjaEJ0bkNsb3NlID0gJCgnLmMtc2VhcmNoZm9ybV9fY2xvc2UtYnRuJyk7XHJcblxyXG5cclxuICBpZihzZWFyY2hGb3JtLmxlbmd0aCkge1xyXG4gICAgc2VhcmNoQnRuLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgc2VhcmNoRm9ybS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZWFyY2hCdG5DbG9zZS5jbGljayhmdW5jdGlvbiAoZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgc2VhcmNoRm9ybS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICB9KVxyXG4gIH1cclxufSJdfQ==
