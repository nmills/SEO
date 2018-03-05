(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);
var _accordion = require('modules/accordion.js');var _accordion2 = _interopRequireDefault(_accordion);

var _searchBar = require('modules/searchBar.js');var _searchBar2 = _interopRequireDefault(_searchBar);
var _hamburger = require('modules/hamburger.js');var _hamburger2 = _interopRequireDefault(_hamburger);
var _galleryWidget = require('modules/galleryWidget.js');var _galleryWidget2 = _interopRequireDefault(_galleryWidget);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

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
        (0, _galleryWidget2.default)();

        // custom();
        (0, _searchBar2.default)();
        (0, _hamburger2.default)();
    }
})(_jquery2.default); // import custom from 'modules/custom.js';

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"modules/accordion.js":2,"modules/galleryWidget.js":3,"modules/hamburger.js":4,"modules/searchBar.js":5}],2:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =



function () {
  $('.toggle span.content-grid').click(function (e) {
    e.preventDefault();

    var $this = $(this).parent();

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
'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =


function () {
  // Exit if not line chart is found
  if (!$('.c-gallery').length)
  return false;

  var popupLink = $('.js-popup-link', '.c-gallery');
  var closeButton = $('.po__close', '.c-gallery');
  var sliderContainer = $('.c-gallery__slide', '.c-gallery');
  var body = $('body');
  var hamMenuLink = $('.js-nav-toggle');
  var header = $('.js-header');
  var winWidth = $(window).width();

  popupLink.on("click", function (e) {
    e.preventDefault();
    sliderContainer.addClass('popup-active');
    body.addClass('scroll-disable');
    hamMenuLink.hide();
    if (winWidth < 768) {
      header.addClass('width-auto');
    }
  });

  closeButton.on("click", function (e) {
    e.preventDefault();
    $('.c-gallery__slide').removeClass('popup-active');
    body.removeClass('scroll-disable');
    hamMenuLink.show(300);
    if (winWidth < 768) {
      header.removeClass('width-auto');
    }
  });

  $(document).on('keyup', function (evt) {
    if (evt.keyCode == 27) {
      $('.c-gallery__slide').removeClass('popup-active');
      body.removeClass('scroll-disable');
      hamMenuLink.show(300);
      if (winWidth < 768) {
        header.removeClass('width-auto');
      }
    }
  });

  var thumbCont = $('#thumb-cont');
  var slideCont = $('.bxslide');
  var slideright = true;
  var showRestart;
  var count;
  var showReset = true;

  var slider = $('#slider-container').bxSlider({
    minSlides: 1,
    maxSlides: 1,
    infiniteLoop: false,
    mode: 'fade',
    controls: false,
    slideMargin: 0,
    pager: false,
    adaptiveHeight: true,
    speed: 500,

    onSlideBefore: function onSlideBefore() {
      var count = slider.getCurrentSlide();
      var slides = $(".slideshow-cont")[count];
      var firstSlide = $('.cslide');
      var pager = count + 1;

      gradient();

      function gradient() {
        var gcount = count + 4;
        $('.transparency').remove();
        $('[data-rel=' + gcount + ']').append("<div class='transparency'></div>");
        // console.log(gcount)
      }

      thumbCont.find('.thumbslide:gt(' + count + ')').show();
      thumbCont.find('.thumbslide:lt(' + (count + 1) + ')').hide();
      $("li.active.current div.year").text($(slideCont[count]).data("year"));
      $("li.active.current div.year-title").text($(slideCont[count]).data("title"));
      if (count === endSlide) {
        $("#restart").show();
      } else {
        $("#restart").hide();
      }

      firstSlide.html(pager);
    },

    onSlideAfter: function onSlideAfter() {

    } });


  var slideQty = slider.getSlideCount();
  var endSlide = slider.getSlideCount() - 1;

  $(".title-head").find('li').each(function () {
    var current = $(this);
  });

  //Get the number of the last slide
  $('.eslide').html(slideQty);

  slideCont.each(function (i, slide) {
    thumbCont.append('<li class="row col1 thumbslide"id=thumb-' + i + ' data-rel="' + i + '"><div class=year>' + $(this).data("year") + '</div><div class=year-title>' + $(this).data("title") + '</div></li>');
    thumbCont.find('.thumbslide:first').hide();
    $('[data-rel="4"]').append("<div class='transparency'></div>");
  });
  thumbCont.append("<li class='row col1 thumbnail' id='restart'><h1>Restart Slideshow ></h1></li>");

  $('#restart').click(function () {
    slider.goToSlide(0);
  });

  $("li.active.current div.year").text($(slideCont[0]).data("year"));
  $("li.active.current div.year-title").text($(slideCont[0]).data("title"));

  thumbCont.find("li.thumbslide").click(function (e) {
    slider.goToSlide($(this).data("rel"));
    e.stopPropagation();
  });

  $('.left').click(function () {
    var slidecurrent = slider.getCurrentSlide() - 1;
    slider.goToPrevSlide();
  });

  $('.right').click(function () {
    slider.goToNextSlide();
  });
};

},{}],4:[function(require,module,exports){
"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default =



function () {
  var hamburgerBtn = $(".js-hamburger-btn");
  var subMenuLink = $(".has-submenu");
  var dropDownMenu = $(".main-nav-dropdown");
  var mainMenu = $(".c-nav--bottom");

  hamburgerBtn.click(function () {
    if (!$(this).hasClass('active')) {
      $(this).addClass('active');
      mainMenu.slideDown('medium');
    } else {
      $(this).removeClass('active');
      mainMenu.slideUp('medium');
    }
  });

  subMenuLink.click(function () {
    if (!$(this).hasClass('active')) {
      subMenuLink.filter('.active').
      removeClass('active').
      find('.main-nav-dropdown').
      slideUp('medium');

      $(this).
      addClass('active').
      find('.main-nav-dropdown').slideDown('medium');
    } else {
      $(this).
      removeClass('active').
      find('.main-nav-dropdown').slideUp('medium');
    }
  });
};

},{}],5:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxzcmNcXGpzXFxtYWluLmpzIiwic3JjXFxqc1xcbW9kdWxlc1xcYWNjb3JkaW9uLmpzIiwic3JjXFxqc1xcbW9kdWxlc1xcZ2FsbGVyeVdpZGdldC5qcyIsInNyY1xcanNcXG1vZHVsZXNcXGhhbWJ1cmdlci5qcyIsInNyY1xcanNcXG1vZHVsZXNcXHNlYXJjaEJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBOztBQUVBLGdDO0FBQ0EsaUQ7O0FBRUEsaUQ7QUFDQSxpRDtBQUNBLHlEOztBQUVBLENBQUMsVUFBUyxDQUFULEVBQVk7QUFDWCxNQUFHLFFBQUgsRUFBYyxLQUFkLENBQW9CLFlBQVc7QUFDN0I7O0FBRUE7QUFDQSxVQUFFLE1BQUYsRUFBVSxJQUFWLENBQWUsdUJBQWYsRUFBd0MsVUFBUyxDQUFULEVBQVk7QUFDbEQ7QUFDRCxTQUZEO0FBR0QsS0FQRDs7QUFTQTtBQUNBLGFBQVMsS0FBVCxHQUFpQjtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDRDtBQUNGLENBdkNELG9CLENBTEE7Ozs7Ozs7OztBQ0RlLFlBQVc7QUFDeEIsSUFBRSwyQkFBRixFQUErQixLQUEvQixDQUFxQyxVQUFTLENBQVQsRUFBWTtBQUMvQyxNQUFFLGNBQUY7O0FBRUEsUUFBSSxRQUFRLEVBQUUsSUFBRixFQUFRLE1BQVIsRUFBWjs7QUFFQTtBQUNBLFFBQUksTUFBTSxJQUFOLENBQVcsU0FBWCxFQUFzQixRQUF0QixDQUErQixNQUEvQixDQUFKLEVBQTRDO0FBQzFDLFlBQU0sSUFBTixDQUFXLFNBQVgsRUFBc0IsV0FBdEIsQ0FBa0MsTUFBbEM7QUFDQSxZQUFNLFdBQU4sQ0FBa0IsUUFBbEI7QUFD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LE1BQUcsV0FBVyxNQUFkLEVBQXNCO0FBQ3BCLGNBQVUsS0FBVixDQUFnQixVQUFVLENBQVYsRUFBYTtBQUMzQixRQUFFLGNBQUY7QUFDQSxpQkFBVyxRQUFYLENBQW9CLFFBQXBCO0FBQ0QsS0FIRDs7QUFLQSxtQkFBZSxLQUFmLENBQXFCLFVBQVUsQ0FBVixFQUFZO0FBQy9CLFFBQUUsY0FBRjtBQUNBLGlCQUFXLFdBQVgsQ0FBdUIsUUFBdkI7QUFDRCxLQUhEO0FBSUQ7QUFDRixDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQganF1ZXJ5IGZyb20gJ2pxdWVyeSc7XHJcbmltcG9ydCBhY2NvcmRpb24gZnJvbSAnbW9kdWxlcy9hY2NvcmRpb24uanMnO1xyXG4vLyBpbXBvcnQgY3VzdG9tIGZyb20gJ21vZHVsZXMvY3VzdG9tLmpzJztcclxuaW1wb3J0IHNlYXJjaEJhciBmcm9tICdtb2R1bGVzL3NlYXJjaEJhci5qcyc7XHJcbmltcG9ydCBoYW1idXJnZXIgZnJvbSAnbW9kdWxlcy9oYW1idXJnZXIuanMnO1xyXG5pbXBvcnQgZ2FsbGVyeVdpZGdldCBmcm9tICdtb2R1bGVzL2dhbGxlcnlXaWRnZXQuanMnO1xyXG5cclxuKGZ1bmN0aW9uKCQpIHtcclxuICAkKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgcmVhZHkoKTtcclxuICAgIFxyXG4gICAgLy8gU3R5bGVndWlkZSBldmVudCB3aGVuIGFuIGVsZW1lbnQgaXMgcmVuZGVyZWRcclxuICAgICQod2luZG93KS5iaW5kKFwic3R5bGVndWlkZTpvblJlbmRlcmVkXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgcmVhZHkoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBJbml0YWxpemluZyBhbGwgbW9kdWxlc1xyXG4gIGZ1bmN0aW9uIHJlYWR5KCkge1xyXG4gICAgLy8gUHJlcGFyZSBmb3JtIGlucHV0c1xyXG4gICAgLy8gcHJlcElucHV0cygpO1xyXG4gICAgLy8gSW5pdGlhbGl6ZSBzb2NpYWwgc2hhcmUgZnVuY3Rpb25hbGl0eS5cclxuICAgIC8vIFJlcGxhY2UgdGhlIGVtcHR5IHN0cmluZyBwYXJhbWV0ZXIgd2l0aCB5b3VyIEZhY2Vib29rIElEXHJcbiAgICAvLyBzb2NpYWxTaGFyZSgnJyk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBjYXJvdXNlbHNcclxuICAgIC8vIGNhcm91c2VsKCk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBxVGlwXHJcbiAgICAvLyBxdGlwKCk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBhY2NvcmRpb25cclxuICAgIGFjY29yZGlvbigpO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgUGx1Z2luc1xyXG4gICAgLy8gJCgnLm1hZ25pZmljLXRyaWdnZXInKS5tYWduaWZpY1BvcHVwKHtcclxuICAgIC8vICAgdHlwZTogJ2lubGluZScsXHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIEdhbGxlcnkgU2xpZGVyXHJcbiAgICBnYWxsZXJ5V2lkZ2V0KCk7XHJcblxyXG4gICAgLy8gY3VzdG9tKCk7XHJcbiAgICBzZWFyY2hCYXIoKTtcclxuICAgIGhhbWJ1cmdlcigpO1xyXG4gIH1cclxufSkoanF1ZXJ5KTtcclxuIiwiLyoqXHJcbiogQWNjb3JkaW9uXHJcbiovXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcclxuICAkKCcudG9nZ2xlIHNwYW4uY29udGVudC1ncmlkJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIGxldCAkdGhpcyA9ICQodGhpcykucGFyZW50KCk7XHJcblxyXG4gICAgLy8gQ29sbGFwc2VcclxuICAgIGlmICgkdGhpcy5maW5kKCcuYW5zd2VyJykuaGFzQ2xhc3MoJ3Nob3cnKSkge1xyXG4gICAgICAkdGhpcy5maW5kKCcuYW5zd2VyJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcclxuICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAkdGhpcy5maW5kKCcuYW5zd2VyJykuc2xpZGVVcCgzNTApO1xyXG4gICAgfVxyXG4gICAgLy8gRXhwYW5kXHJcbiAgICBlbHNlIHtcclxuICAgICAgJHRoaXMuZmluZCgnLmFuc3dlcicpLnJlbW92ZUNsYXNzKCdzaG93Jyk7XHJcbiAgICAgICQoJy50b2dnbGUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICR0aGlzLmZpbmQoJy5hbnN3ZXInKS5zbGlkZVVwKDM1MCk7XHJcbiAgICAgICR0aGlzLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgJHRoaXMuZmluZCgnLmFuc3dlcicpLnRvZ2dsZUNsYXNzKCdzaG93Jyk7XHJcbiAgICAgICR0aGlzLmZpbmQoJy5hbnN3ZXInKS5zbGlkZVRvZ2dsZSgzNTApO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59IiwiLyoqXG4qIEdhbGxlcnkgV2lkZ2V0XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIC8vIEV4aXQgaWYgbm90IGxpbmUgY2hhcnQgaXMgZm91bmRcbiAgaWYoISQoJy5jLWdhbGxlcnknKS5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICBcbiAgdmFyIHBvcHVwTGluayA9ICQoJy5qcy1wb3B1cC1saW5rJywgJy5jLWdhbGxlcnknKTtcbiAgdmFyIGNsb3NlQnV0dG9uID0gJCgnLnBvX19jbG9zZScsICcuYy1nYWxsZXJ5Jyk7XG4gIHZhciBzbGlkZXJDb250YWluZXIgPSAkKCcuYy1nYWxsZXJ5X19zbGlkZScsICcuYy1nYWxsZXJ5Jyk7XG4gIHZhciBib2R5ID0gJCgnYm9keScpO1xuICB2YXIgaGFtTWVudUxpbmsgPSAkKCcuanMtbmF2LXRvZ2dsZScpO1xuICB2YXIgaGVhZGVyID0gJCgnLmpzLWhlYWRlcicpO1xuICB2YXIgd2luV2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcblxuICBwb3B1cExpbmsub24oXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHNsaWRlckNvbnRhaW5lci5hZGRDbGFzcygncG9wdXAtYWN0aXZlJyk7XG4gICAgYm9keS5hZGRDbGFzcygnc2Nyb2xsLWRpc2FibGUnKTtcbiAgICBoYW1NZW51TGluay5oaWRlKCk7XG4gICAgaWYgKHdpbldpZHRoIDwgNzY4KSB7XG4gICAgICBoZWFkZXIuYWRkQ2xhc3MoJ3dpZHRoLWF1dG8nKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNsb3NlQnV0dG9uLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKCcuYy1nYWxsZXJ5X19zbGlkZScpLnJlbW92ZUNsYXNzKCdwb3B1cC1hY3RpdmUnKTtcbiAgICBib2R5LnJlbW92ZUNsYXNzKCdzY3JvbGwtZGlzYWJsZScpO1xuICAgIGhhbU1lbnVMaW5rLnNob3coMzAwKTtcbiAgICBpZiAod2luV2lkdGggPCA3NjgpIHtcbiAgICAgIGhlYWRlci5yZW1vdmVDbGFzcygnd2lkdGgtYXV0bycpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2tleXVwJyxmdW5jdGlvbihldnQpIHtcbiAgICBpZiAoZXZ0LmtleUNvZGUgPT0gMjcpIHtcbiAgICAgICQoJy5jLWdhbGxlcnlfX3NsaWRlJykucmVtb3ZlQ2xhc3MoJ3BvcHVwLWFjdGl2ZScpO1xuICAgICAgYm9keS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRpc2FibGUnKTtcbiAgICAgIGhhbU1lbnVMaW5rLnNob3coMzAwKTtcbiAgICAgIGlmICh3aW5XaWR0aCA8IDc2OCkge1xuICAgICAgICBoZWFkZXIucmVtb3ZlQ2xhc3MoJ3dpZHRoLWF1dG8nKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG5cdHZhciB0aHVtYkNvbnQgPSAkKCcjdGh1bWItY29udCcpO1xuXHR2YXIgc2xpZGVDb250ID0gJCgnLmJ4c2xpZGUnKTtcblx0dmFyIHNsaWRlcmlnaHQgPSB0cnVlO1xuXHR2YXIgc2hvd1Jlc3RhcnQ7XG5cdHZhciBjb3VudDtcblx0dmFyIHNob3dSZXNldCA9IHRydWU7XG5cblx0dmFyIHNsaWRlciA9ICQoJyNzbGlkZXItY29udGFpbmVyJykuYnhTbGlkZXIoe1xuICAgIG1pblNsaWRlczogMSxcbiAgICBtYXhTbGlkZXM6IDEsXG4gICAgaW5maW5pdGVMb29wOiBmYWxzZSxcbiAgICBtb2RlOiAnZmFkZScsXG4gICAgY29udHJvbHM6IGZhbHNlLFxuICAgIHNsaWRlTWFyZ2luOiAwLFxuICAgIHBhZ2VyOiBmYWxzZSxcbiAgICBhZGFwdGl2ZUhlaWdodDogdHJ1ZSxcbiAgICBzcGVlZDogNTAwLFxuXG4gICAgb25TbGlkZUJlZm9yZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY291bnQgPSBzbGlkZXIuZ2V0Q3VycmVudFNsaWRlKClcbiAgICAgIHZhciBzbGlkZXMgPSAkKFwiLnNsaWRlc2hvdy1jb250XCIpW2NvdW50XVxuICAgICAgdmFyIGZpcnN0U2xpZGUgPSAkKCcuY3NsaWRlJyk7XG4gICAgICB2YXIgcGFnZXIgPSBjb3VudCArIDE7XG5cbiAgICAgIGdyYWRpZW50KCk7XG5cbiAgICAgIGZ1bmN0aW9uIGdyYWRpZW50KCkge1xuICAgICAgICB2YXIgZ2NvdW50ID0gY291bnQgKyA0O1xuICAgICAgICAkKCcudHJhbnNwYXJlbmN5JykucmVtb3ZlKCk7XG4gICAgICAgICQoJ1tkYXRhLXJlbD0nICsgZ2NvdW50ICsgJ10nKS5hcHBlbmQoXCI8ZGl2IGNsYXNzPSd0cmFuc3BhcmVuY3knPjwvZGl2PlwiKVxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGdjb3VudClcbiAgICAgIH1cblxuICAgICAgdGh1bWJDb250LmZpbmQoJy50aHVtYnNsaWRlOmd0KCcgKyBjb3VudCArICcpJykuc2hvdygpO1xuICAgICAgdGh1bWJDb250LmZpbmQoJy50aHVtYnNsaWRlOmx0KCcgKyAoY291bnQgKyAxKSArICcpJykuaGlkZSgpO1xuICAgICAgJChcImxpLmFjdGl2ZS5jdXJyZW50IGRpdi55ZWFyXCIpLnRleHQoJChzbGlkZUNvbnRbY291bnRdKS5kYXRhKFwieWVhclwiKSk7XG4gICAgICAkKFwibGkuYWN0aXZlLmN1cnJlbnQgZGl2LnllYXItdGl0bGVcIikudGV4dCgkKHNsaWRlQ29udFtjb3VudF0pLmRhdGEoXCJ0aXRsZVwiKSk7XG4gICAgICBpZiAoY291bnQgPT09IGVuZFNsaWRlKSB7XG4gICAgICAgICQoXCIjcmVzdGFydFwiKS5zaG93KCk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgJChcIiNyZXN0YXJ0XCIpLmhpZGUoKTtcbiAgICAgIH1cblxuICAgICAgZmlyc3RTbGlkZS5odG1sKHBhZ2VyKTtcbiAgICB9LFxuXG4gICAgb25TbGlkZUFmdGVyOiBmdW5jdGlvbigpe1xuXG4gICAgfVxuXHR9KTtcblxuXHR2YXIgc2xpZGVRdHkgPSBzbGlkZXIuZ2V0U2xpZGVDb3VudCgpO1xuXHR2YXIgZW5kU2xpZGUgPSBzbGlkZXIuZ2V0U2xpZGVDb3VudCgpIC0gMTtcblxuXHQkKFwiLnRpdGxlLWhlYWRcIikuZmluZCgnbGknKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgdmFyIGN1cnJlbnQgPSAkKHRoaXMpO1xuXHR9KTtcblxuXHQvL0dldCB0aGUgbnVtYmVyIG9mIHRoZSBsYXN0IHNsaWRlXG5cdCQoJy5lc2xpZGUnKS5odG1sKHNsaWRlUXR5KTtcblxuXHRzbGlkZUNvbnQuZWFjaChmdW5jdGlvbihpLCBzbGlkZSkge1xuICAgIHRodW1iQ29udC5hcHBlbmQoJzxsaSBjbGFzcz1cInJvdyBjb2wxIHRodW1ic2xpZGVcImlkPXRodW1iLScrIGkgKycgZGF0YS1yZWw9XCInKyBpICsnXCI+PGRpdiBjbGFzcz15ZWFyPicgKyAkKHRoaXMpLmRhdGEoXCJ5ZWFyXCIpICsgJzwvZGl2PjxkaXYgY2xhc3M9eWVhci10aXRsZT4nICsgJCh0aGlzKS5kYXRhKFwidGl0bGVcIikgKyAnPC9kaXY+PC9saT4nKTtcbiAgICB0aHVtYkNvbnQuZmluZCgnLnRodW1ic2xpZGU6Zmlyc3QnKS5oaWRlKCk7XG4gICAgJCgnW2RhdGEtcmVsPVwiNFwiXScpLmFwcGVuZChcIjxkaXYgY2xhc3M9J3RyYW5zcGFyZW5jeSc+PC9kaXY+XCIpXG5cdH0pXG5cdHRodW1iQ29udC5hcHBlbmQoXCI8bGkgY2xhc3M9J3JvdyBjb2wxIHRodW1ibmFpbCcgaWQ9J3Jlc3RhcnQnPjxoMT5SZXN0YXJ0IFNsaWRlc2hvdyA+PC9oMT48L2xpPlwiKTtcblxuXHQkKCcjcmVzdGFydCcpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gICAgc2xpZGVyLmdvVG9TbGlkZSgwKTtcblx0fSk7XG5cblx0JChcImxpLmFjdGl2ZS5jdXJyZW50IGRpdi55ZWFyXCIpLnRleHQoJChzbGlkZUNvbnRbMF0pLmRhdGEoXCJ5ZWFyXCIpKTtcblx0JChcImxpLmFjdGl2ZS5jdXJyZW50IGRpdi55ZWFyLXRpdGxlXCIpLnRleHQoJChzbGlkZUNvbnRbMF0pLmRhdGEoXCJ0aXRsZVwiKSk7XG5cblx0dGh1bWJDb250LmZpbmQoXCJsaS50aHVtYnNsaWRlXCIpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgIHNsaWRlci5nb1RvU2xpZGUoJCh0aGlzKS5kYXRhKFwicmVsXCIpKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHR9KTtcblxuXHQkKCcubGVmdCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzbGlkZWN1cnJlbnQgPSBzbGlkZXIuZ2V0Q3VycmVudFNsaWRlKCkgLSAxO1xuICAgIHNsaWRlci5nb1RvUHJldlNsaWRlKCk7XG5cdH0pO1xuXG5cdCQoJy5yaWdodCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIHNsaWRlci5nb1RvTmV4dFNsaWRlKCk7XG5cdH0pO1xufSIsIi8qKlxyXG4qIEhhbWJ1cmdlciBNZW51XHJcbiovXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcclxuICB2YXIgaGFtYnVyZ2VyQnRuID0gJChcIi5qcy1oYW1idXJnZXItYnRuXCIpO1xyXG4gIHZhciBzdWJNZW51TGluayA9ICQoXCIuaGFzLXN1Ym1lbnVcIik7XHJcbiAgdmFyIGRyb3BEb3duTWVudSA9ICQoXCIubWFpbi1uYXYtZHJvcGRvd25cIik7XHJcbiAgdmFyIG1haW5NZW51ID0gJChcIi5jLW5hdi0tYm90dG9tXCIpO1xyXG5cclxuICBoYW1idXJnZXJCdG4uY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgXHRpZighJCh0aGlzKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcclxuICAgICAgJCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgIG1haW5NZW51LnNsaWRlRG93bignbWVkaXVtJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgbWFpbk1lbnUuc2xpZGVVcCgnbWVkaXVtJyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblx0XHJcblx0c3ViTWVudUxpbmsuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICBpZighJCh0aGlzKS5oYXNDbGFzcygnYWN0aXZlJykpe1xyXG4gICAgICBzdWJNZW51TGluay5maWx0ZXIoJy5hY3RpdmUnKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgIC5maW5kKCcubWFpbi1uYXYtZHJvcGRvd24nKVxyXG4gICAgICAuc2xpZGVVcCgnbWVkaXVtJyk7XHJcblxyXG4gICAgICAkKHRoaXMpXHJcbiAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgICAgLmZpbmQoJy5tYWluLW5hdi1kcm9wZG93bicpLnNsaWRlRG93bignbWVkaXVtJyk7XHJcbiAgICB9IGVsc2V7XHJcbiAgICAgICQodGhpcylcclxuICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAuZmluZCgnLm1haW4tbmF2LWRyb3Bkb3duJykuc2xpZGVVcCgnbWVkaXVtJyk7XHJcbiAgICB9XHJcblx0fSk7XHJcbn0iLCIvKipcclxuKiBTZWFyY2ggQmFyXHJcbiovXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcclxuICB2YXIgc2VhcmNoRm9ybSA9ICQoJy5jLXNlYXJjaGZvcm0nKTtcclxuICB2YXIgc2VhcmNoQnRuID0gJCgnLmpzLXNlYXJjaC1idG4nKTtcclxuICB2YXIgc2VhcmNoQnRuQ2xvc2UgPSAkKCcuYy1zZWFyY2hmb3JtX19jbG9zZS1idG4nKTtcclxuXHJcblxyXG4gIGlmKHNlYXJjaEZvcm0ubGVuZ3RoKSB7XHJcbiAgICBzZWFyY2hCdG4uY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBzZWFyY2hGb3JtLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHNlYXJjaEJ0bkNsb3NlLmNsaWNrKGZ1bmN0aW9uIChlKXtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBzZWFyY2hGb3JtLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgIH0pXHJcbiAgfVxyXG59Il19
