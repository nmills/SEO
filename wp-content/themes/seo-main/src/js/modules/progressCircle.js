/**
* Progress Circle
*/

export default function() {
  if ($('.c-ratiometer_container').length) {
    var triggerAtY = $('.c-ratiometer_container').offset().top - $(window).outerHeight();
    $(window).scroll(function(event) {

      // #target not yet in view
      if (triggerAtY > $(window).scrollTop()) {
        return;
      }

      $('.c-ratiometer .js-progress-bar').easyPieChart({
        size: 255,
        lineWidth: 10,
        trackColor: '#FFFFFF',
        barColor: '#7CB4F6',
        scaleColor: false,
        animate: 2000,
        rotate: 130,
        lineCap: 'square',
        onStep: function(from, to, percent) {
          $(this.el).siblings('.c-rationmeter-text').find('.percent').text(Math.round(percent) + '%');
        }
      });
      
      //remove this event handler
      $(this).off(event);
    });
  }
}