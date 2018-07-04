/* Custom Dropdown */
'use strict';

const cusDropdown = function() {
  if($(window).width() < 767) {
    $(".selector").on('click', function(){
      $(".selector").next().removeClass("active");
      $(this).parent().addClass("active");
      $(this).toggleClass("show");
      $(this).next().toggleClass("active");
    });

    $(window).on('click', function(e) {
      if ($(".selector").has(event.target).length == 0 && !$(".selector").is(event.target)){
        $(".selector").parent().removeClass("active");
        $(".selector").removeClass("show");
        $(".selector").next().removeClass("active");
      }
    });
  }
};

export default cusDropdown;