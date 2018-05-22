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

  var owl = $('.owl-carousel');
  owl.owlCarousel({
      items:1,
      loop:true,
      margin:0,
      autoplay:false,
      autoplayTimeout:5000,
      autoplayHoverPause:false
  });
  $('.play').on('click',function(){
      owl.trigger('play.owl.autoplay',[1000])
  })
  $('.stop').on('click',function(){
      owl.trigger('stop.owl.autoplay')
  })
}
