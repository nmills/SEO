/**
* SVG Animation
*/

export default function() {
  if ($('.c-ph-stats__container').length) {
    var triggerAtY = $('.c-ph-stats__container').offset().top - $(window).outerHeight();
    $(window).scroll(function(event) {

      // #target not yet in view
      if (triggerAtY > $(window).scrollTop()) {
        return;
      }

      // SVG animation
      var svg = jQuery(".curve").drawsvg({
        duration: 2000,
        easing: "linear",
        reverse: "true"
      });
      svg.drawsvg("animate");
      
      // remove this event handler
      $(this).off(event);
    });
  }
}