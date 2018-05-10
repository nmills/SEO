/**
 * Custom Scripts
 */


export default function() {

  var width = $(window).width();

  if ((width >= 1024)) {
    $(".c-gh-program__item").each(function() {
      var single_height = $(this).find(".heading_desktop").height();
      console.log(single_height.height);
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
      console.log('test');
    } else {
      $('html, body').animate({
          scrollTop: $('.container.region_main_content').offset().top + (-100)
        }, 'slow'); 
        console.log('test2');  
    }
  }

  // Clearing the search field on click
  $(".c-searchform__textfield input").on("click", function() {
      $(this).val("");
  })

  $( ".icon.icon-search--small" ).click(function() {
   $('.header__search').focus();
  });

  $( ".icon.icon-search-red--small" ).click(function() {
   $('.result__search').focus();
  });
}
