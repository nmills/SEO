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

}
