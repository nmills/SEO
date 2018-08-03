/**
 * Custom Scripts
 */

export default function() {

  var width = $(window).width();

  if ((width >= 1024)) {
    $(".c-gh-program__item").each(function() {
      var single_height = $(this).find(".heading_desktop").height();
      if (single_height > 40) {
        $(this).find(".heading_desktop").css('bottom', '-40px');
      }
    });
  }

  // Making the prog list image clickable
  $('.c-gh-program__item').click(function(e) { 
      var link = $(this).find("a").attr('href')
      window.open(link,"_self");
  });

  // News and Events page scroll
  if(window.location.href.indexOf("#filter-news") > -1) {
    if ((width >= 840)) {
      $('html, body').animate({
          scrollTop: $('.container.region_main_content').offset().top + (-170)
        }, 'slow');  
    } else {
      $('html, body').animate({
          scrollTop: $('.container.region_main_content').offset().top + (-100)
        }, 'slow');   
    }
  }

  // Owl Carousel Init
  var owl = $('.page-template-template-global_homepage .owl-carousel');
  if (owl.length) {
    owl.owlCarousel({
      items: 1,
      loop: true,
      margin: 0,
      dots: false,
      autoplay: true,
      autoplayTimeout: 3000,
      autoplayHoverPause: false,
      animateOut: 'fadeOut'
    });
  }

  // Owl Carousel Init
  var owl = $('.page-template-template-program_homepage .owl-carousel');
  $.each(owl, function() {
    var slides = $(this).find('.item').length;
    if (slides > 4) {
      $(this).owlCarousel({
        items: 4,
        loop: true,
        margin: 0,
        dots: false,
        autoplay: true,
        autoplayTimeout: 3000, 
        autoplayHoverPause: false,
        animateOut: 'fadeOut',
        responsiveClass:true,
        responsive:{
            0:{
                items:2
            },
            480:{
                items:3
            },
            768:{
                items:4
            }
        }
      });
    }
  }); 

  var owl = $('.page-template-template-program_landing .owl-carousel');
  $.each(owl, function() {
    var slides = $(this).find('.item').length;
    if (slides > 4) {
      $(this).owlCarousel({
        items: 4,
        loop: true,
        margin: 0,
        dots: false,
        autoplay: true,
        autoplayTimeout: 3000, 
        autoplayHoverPause: false,
        animateOut: 'fadeOut',
        responsiveClass:true,
        responsive:{
            0:{
                items:2
            },
            480:{
                items:3
            },
            768:{
                items:4
            }
        }
      });
    }
  }); 

  if ($("ul.main-nav-dropdown").length) {
    $( "body" ).addClass("has_submenu");
  }

  $('footer.site-footer .c-footer__widget-container a img').each(function(){
        var $img = $(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
    
        $.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = $(data).find('svg');
    
            // Add replaced image's ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }
    
            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');
            
            // Check if the viewport is set, else we gonna set it if we can.
            if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
            }
    
            // Replace image with new SVG
            $img.replaceWith($svg);
    
        }, 'xml');
    
    });
}
