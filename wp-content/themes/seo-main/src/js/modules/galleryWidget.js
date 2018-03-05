/**
* Gallery Widget
*/
export default function() {
  // Exit if not line chart is found
  if(!$('.c-gallery').length)
    return false;
  
  var popupLink = $('.js-popup-link', '.c-gallery');
  var closeButton = $('.po__close', '.c-gallery');
  var sliderContainer = $('.c-gallery__slide', '.c-gallery');
  var body = $('body');
  var hamMenuLink = $('.js-nav-toggle');
  var header = $('.js-header');
  var winWidth = $(window).width();

  popupLink.on("click", function(e) {
    e.preventDefault();
    sliderContainer.addClass('popup-active');
    body.addClass('scroll-disable');
    hamMenuLink.hide();
    if (winWidth < 768) {
      header.addClass('width-auto');
    }
  });

  closeButton.on("click", function(e) {
    e.preventDefault();
    $('.c-gallery__slide').removeClass('popup-active');
    body.removeClass('scroll-disable');
    hamMenuLink.show(300);
    if (winWidth < 768) {
      header.removeClass('width-auto');
    }
  });

  $(document).on('keyup',function(evt) {
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
    speed: 0,

    onSlideBefore: function() {
      var count = slider.getCurrentSlide()
      var slides = $(".slideshow-cont")[count]
      var firstSlide = $('.cslide');
      var pager = count + 1;

      gradient();

      function gradient() {
        var gcount = count + 4;
        $('.transparency').remove();
        $('[data-rel=' + gcount + ']').append("<div class='transparency'></div>")
          // console.log(gcount)
      }

      thumbCont.find('.thumbslide:gt(' + count + ')').show();
      thumbCont.find('.thumbslide:lt(' + (count + 1) + ')').hide();
      $("li.active.current div.year").text($(slideCont[count]).data("year"));
      $("li.active.current div.year-title").text($(slideCont[count]).data("title"));
      if (count === endSlide) {
        $("#restart").show();
      }else{
        $("#restart").hide();
      }

      firstSlide.html(pager);
      // adding the inactive class to the arrows
        if ( pager == slider.getSlideCount()) {
          $('.arrows .right').addClass('inactive');
          $('.arrows .left').removeClass('inactive');
        } else if ( pager == '1') {
          $('.arrows .left').addClass('inactive');
          $('.arrows .right').removeClass('inactive');
        } else {
          $('.arrows .left').removeClass('inactive');
          $('.arrows .right').removeClass('inactive');
        }
      },

    onSlideAfter: function(){
    }
	});

	var slideQty = slider.getSlideCount();
	var endSlide = slider.getSlideCount() - 1;

	$(".title-head").find('li').each(function(){
    var current = $(this);
	});

	//Get the number of the last slide
	$('.eslide').html(slideQty);

	slideCont.each(function(i, slide) {
    thumbCont.append('<li class="row col1 thumbslide"id=thumb-'+ i +' data-rel="'+ i +'"><div class=year>' + $(this).data("year") + '</div><div class=year-title>' + $(this).data("title") + '</div></li>');
    thumbCont.find('.thumbslide:first').hide();
    $('[data-rel="4"]').append("<div class='transparency'></div>")
	})
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

	$('.left').click(function() {
    var slidecurrent = slider.getCurrentSlide() - 1;
    slider.goToPrevSlide();
	});

	$('.right').click(function() {
    slider.goToNextSlide();
	});
}