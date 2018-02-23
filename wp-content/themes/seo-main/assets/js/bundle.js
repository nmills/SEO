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
  var searchBtn = $('.js-search-btn');
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2FjY29yZGlvbi5qcyIsInNyYy9qcy9tb2R1bGVzL2N1c3RvbS5qcyIsInNyYy9qcy9tb2R1bGVzL3NlYXJjaEJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBOztBQUVBLGdDOzs7OztBQUtBLGlEOztBQUVBLDJDO0FBQ0EsaUQsbUpBRkE7O0FBSUEsQ0FBQyxVQUFTLENBQVQsRUFBWTtBQUNYLElBQUcsUUFBSCxFQUFjLEtBQWQsQ0FBb0IsWUFBVztBQUM3Qjs7QUFFQTtBQUNBLE1BQUUsTUFBRixFQUFVLElBQVYsQ0FBZSx1QkFBZixFQUF3QyxVQUFTLENBQVQsRUFBWTtBQUNsRDtBQUNELEtBRkQ7QUFHRCxHQVBEOztBQVNBO0FBQ0EsV0FBUyxLQUFULEdBQWlCO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDRDtBQUNGLENBdENELG9CLENBVEE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ0hlLFlBQVc7QUFDeEIsSUFBRSxTQUFGLEVBQWEsS0FBYixDQUFtQixVQUFTLENBQVQsRUFBWTtBQUM3QixNQUFFLGNBQUY7O0FBRUEsUUFBSSxRQUFRLEVBQUUsSUFBRixDQUFaOztBQUVBO0FBQ0EsUUFBSSxNQUFNLElBQU4sQ0FBVyxTQUFYLEVBQXNCLFFBQXRCLENBQStCLE1BQS9CLENBQUosRUFBNEM7QUFDMUMsWUFBTSxJQUFOLENBQVcsU0FBWCxFQUFzQixXQUF0QixDQUFrQyxNQUFsQztBQUNBLFlBQU0sV0FBTixDQUFrQixRQUFsQjtBQUNBLFlBQU0sSUFBTixDQUFXLFNBQVgsRUFBc0IsT0FBdEIsQ0FBOEIsR0FBOUI7QUFDRDtBQUNEO0FBTEEsU0FNSztBQUNILGNBQU0sSUFBTixDQUFXLFNBQVgsRUFBc0IsV0FBdEIsQ0FBa0MsTUFBbEM7QUFDQSxVQUFFLFNBQUYsRUFBYSxXQUFiLENBQXlCLFFBQXpCO0FBQ0EsY0FBTSxJQUFOLENBQVcsU0FBWCxFQUFzQixPQUF0QixDQUE4QixHQUE5QjtBQUNBLGNBQU0sUUFBTixDQUFlLFFBQWY7QUFDQSxjQUFNLElBQU4sQ0FBVyxTQUFYLEVBQXNCLFdBQXRCLENBQWtDLE1BQWxDO0FBQ0EsY0FBTSxJQUFOLENBQVcsU0FBWCxFQUFzQixXQUF0QixDQUFrQyxHQUFsQztBQUNEO0FBQ0YsR0FwQkQ7QUFxQkQsQzs7Ozs7OztBQ3RCYyxZQUFXO0FBQ3hCLEdBQUUsMEJBQUYsRUFBOEIsS0FBOUI7QUFDRSxhQUFXO0FBQ1QsSUFBRSxtREFBRixFQUF1RCxRQUF2RCxDQUFnRSxNQUFoRTtBQUNELEVBSEg7QUFJRSxhQUFXO0FBQ1QsSUFBRSxtREFBRixFQUF1RCxXQUF2RCxDQUFtRSxNQUFuRTtBQUNELEVBTkg7OztBQVNDLEdBQUcsUUFBSCxFQUFjLElBQWQ7QUFDRjs7QUFFQSxHQUFHLFlBQUgsRUFBa0IsS0FBbEIsQ0FBd0IsWUFBVztBQUNsQyxJQUFHLG9CQUFILEVBQTBCLFdBQTFCLENBQXVDLE1BQXZDLEVBQStDLFlBQVc7QUFDekQsS0FBRyxZQUFILEVBQWtCLElBQWxCO0FBQ0EsS0FBRyxRQUFILEVBQWMsSUFBZDtBQUNBLEdBSEQ7QUFJQSxFQUxEOztBQU9BLEdBQUcsUUFBSCxFQUFjLEtBQWQsQ0FBb0IsWUFBVztBQUM5QixJQUFHLG9CQUFILEVBQTBCLFdBQTFCLENBQXVDLE1BQXZDLEVBQStDLFlBQVc7QUFDekQsS0FBRyxRQUFILEVBQWMsSUFBZDtBQUNBLEtBQUcsWUFBSCxFQUFrQixJQUFsQjtBQUNBLEdBSEQ7QUFJQSxFQUxEO0FBTUEsQzs7Ozs7OztBQzFCYyxZQUFXO0FBQ3hCLE1BQUksYUFBYSxFQUFFLGVBQUYsQ0FBakI7QUFDQSxNQUFJLFlBQVksRUFBRSxnQkFBRixDQUFoQjtBQUNBLE1BQUksaUJBQWlCLEVBQUUsMEJBQUYsQ0FBckI7OztBQUdBLE1BQUcsV0FBVyxNQUFkLEVBQXNCO0FBQ3BCLGNBQVUsS0FBVixDQUFnQixVQUFVLENBQVYsRUFBYTtBQUMzQixRQUFFLGNBQUY7QUFDQSxpQkFBVyxRQUFYLENBQW9CLFFBQXBCO0FBQ0QsS0FIRDs7QUFLQSxtQkFBZSxLQUFmLENBQXFCLFVBQVUsQ0FBVixFQUFZO0FBQy9CLFFBQUUsY0FBRjtBQUNBLGlCQUFXLFdBQVgsQ0FBdUIsUUFBdkI7QUFDRCxLQUhEO0FBSUQ7QUFDRixDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQganF1ZXJ5IGZyb20gJ2pxdWVyeSc7XG4vLyBpbXBvcnQgcHJlcElucHV0cyBmcm9tICdtb2R1bGVzL3ByZXBpbnB1dHMuanMnO1xuLy8gaW1wb3J0IHNvY2lhbFNoYXJlIGZyb20gJ21vZHVsZXMvc29jaWFsU2hhcmUuanMnO1xuLy8gaW1wb3J0IGNhcm91c2VsIGZyb20gJ21vZHVsZXMvY2Fyb3VzZWwuanMnO1xuLy8gaW1wb3J0IHF0aXAgZnJvbSAnbW9kdWxlcy9xdGlwLmpzJztcbmltcG9ydCBhY2NvcmRpb24gZnJvbSAnbW9kdWxlcy9hY2NvcmRpb24uanMnO1xuLy8gaW1wb3J0IGdhbGxlcnlXaWRnZXQgZnJvbSAnbW9kdWxlcy9nYWxsZXJ5V2lkZ2V0LmpzJztcbmltcG9ydCBjdXN0b20gZnJvbSAnbW9kdWxlcy9jdXN0b20uanMnO1xuaW1wb3J0IHNlYXJjaEJhciBmcm9tICdtb2R1bGVzL3NlYXJjaEJhci5qcyc7XG5cbihmdW5jdGlvbigkKSB7XG4gICQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgcmVhZHkoKTtcbiAgICBcbiAgICAvLyBTdHlsZWd1aWRlIGV2ZW50IHdoZW4gYW4gZWxlbWVudCBpcyByZW5kZXJlZFxuICAgICQod2luZG93KS5iaW5kKFwic3R5bGVndWlkZTpvblJlbmRlcmVkXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHJlYWR5KCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIEluaXRhbGl6aW5nIGFsbCBtb2R1bGVzXG4gIGZ1bmN0aW9uIHJlYWR5KCkge1xuICAgIC8vIFByZXBhcmUgZm9ybSBpbnB1dHNcbiAgICAvLyBwcmVwSW5wdXRzKCk7XG4gICAgLy8gSW5pdGlhbGl6ZSBzb2NpYWwgc2hhcmUgZnVuY3Rpb25hbGl0eS5cbiAgICAvLyBSZXBsYWNlIHRoZSBlbXB0eSBzdHJpbmcgcGFyYW1ldGVyIHdpdGggeW91ciBGYWNlYm9vayBJRFxuICAgIC8vIHNvY2lhbFNoYXJlKCcnKTtcblxuICAgIC8vIEluaXRpYWxpemUgY2Fyb3VzZWxzXG4gICAgLy8gY2Fyb3VzZWwoKTtcblxuICAgIC8vIEluaXRpYWxpemUgcVRpcFxuICAgIC8vIHF0aXAoKTtcblxuICAgIC8vIEluaXRpYWxpemUgYWNjb3JkaW9uXG4gICAgYWNjb3JkaW9uKCk7XG5cbiAgICAvLyBJbml0aWFsaXplIFBsdWdpbnNcbiAgICAvLyAkKCcubWFnbmlmaWMtdHJpZ2dlcicpLm1hZ25pZmljUG9wdXAoe1xuICAgIC8vICAgdHlwZTogJ2lubGluZScsXG4gICAgLy8gfSk7XG5cbiAgICAvLyBJbml0aWFsaXplIEdhbGxlcnkgU2xpZGVyXG4gICAgLy8gZ2FsbGVyeVdpZGdldCgpO1xuXG4gICAgY3VzdG9tKCk7XG4gICAgc2VhcmNoQmFyKCk7XG4gIH1cbn0pKGpxdWVyeSk7XG4iLCIvKipcbiogQWNjb3JkaW9uXG4qL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgJCgnLnRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBsZXQgJHRoaXMgPSAkKHRoaXMpO1xuXG4gICAgLy8gQ29sbGFwc2VcbiAgICBpZiAoJHRoaXMuZmluZCgnLmFuc3dlcicpLmhhc0NsYXNzKCdzaG93JykpIHtcbiAgICAgICR0aGlzLmZpbmQoJy5hbnN3ZXInKS5yZW1vdmVDbGFzcygnc2hvdycpO1xuICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJHRoaXMuZmluZCgnLmFuc3dlcicpLnNsaWRlVXAoMzUwKTtcbiAgICB9XG4gICAgLy8gRXhwYW5kXG4gICAgZWxzZSB7XG4gICAgICAkdGhpcy5maW5kKCcuYW5zd2VyJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcbiAgICAgICQoJy50b2dnbGUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAkdGhpcy5maW5kKCcuYW5zd2VyJykuc2xpZGVVcCgzNTApO1xuICAgICAgJHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJHRoaXMuZmluZCgnLmFuc3dlcicpLnRvZ2dsZUNsYXNzKCdzaG93Jyk7XG4gICAgICAkdGhpcy5maW5kKCcuYW5zd2VyJykuc2xpZGVUb2dnbGUoMzUwKTtcbiAgICB9XG4gIH0pO1xufSIsIi8qKlxuKiBDdXN0b20gSnNcbiovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICAkKFwiLmMtdWllX19kcm9wZG93bi1oZWFkaW5nXCIpLmhvdmVyKFxuICAgIGZ1bmN0aW9uKCkge1xuICAgICAgJChcIi5jLXVpZV9fZHJvcGRvd24taGVhZGluZyAuYy11aWVfX2Ryb3Bkb3duLW9wdGlvbnNcIikuYWRkQ2xhc3MoXCJkcm9wXCIpO1xuICAgIH0sXG4gICAgZnVuY3Rpb24oKSB7XG4gICAgICAkKFwiLmMtdWllX19kcm9wZG93bi1oZWFkaW5nIC5jLXVpZV9fZHJvcGRvd24tb3B0aW9uc1wiKS5yZW1vdmVDbGFzcyhcImRyb3BcIik7XG4gICAgfVxuICApO1xuXG4gIFx0JCggXCIuY3Jvc3NcIiApLmhpZGUoKTtcblx0Ly8gJCggXCIuYy1tZW51X19jb250YWluZXJcIiApLmhpZGUoKTtcblx0XG5cdCQoIFwiLmhhbWJ1cmdlclwiICkuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0JCggXCIuYy1tZW51X19jb250YWluZXJcIiApLnNsaWRlVG9nZ2xlKCBcInNsb3dcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHQkKCBcIi5oYW1idXJnZXJcIiApLmhpZGUoKTtcblx0XHRcdCQoIFwiLmNyb3NzXCIgKS5zaG93KCk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdCQoIFwiLmNyb3NzXCIgKS5jbGljayhmdW5jdGlvbigpIHtcblx0XHQkKCBcIi5jLW1lbnVfX2NvbnRhaW5lclwiICkuc2xpZGVUb2dnbGUoIFwic2xvd1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdCQoIFwiLmNyb3NzXCIgKS5oaWRlKCk7XG5cdFx0XHQkKCBcIi5oYW1idXJnZXJcIiApLnNob3coKTtcblx0XHR9KTtcblx0fSk7XG59IiwiLyoqXG4qIFNlYXJjaCBCYXJcbiovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VhcmNoRm9ybSA9ICQoJy5jLXNlYXJjaGZvcm0nKTtcbiAgdmFyIHNlYXJjaEJ0biA9ICQoJy5qcy1zZWFyY2gtYnRuJyk7XG4gIHZhciBzZWFyY2hCdG5DbG9zZSA9ICQoJy5jLXNlYXJjaGZvcm1fX2Nsb3NlLWJ0bicpO1xuXG5cbiAgaWYoc2VhcmNoRm9ybS5sZW5ndGgpIHtcbiAgICBzZWFyY2hCdG4uY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHNlYXJjaEZvcm0uYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgIH0pO1xuXG4gICAgc2VhcmNoQnRuQ2xvc2UuY2xpY2soZnVuY3Rpb24gKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgc2VhcmNoRm9ybS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgfSlcbiAgfVxufSJdfQ==
