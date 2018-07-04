/* Custom Dropdown */
'use strict';

const cusDropdown = function() {
  var selector = $(".selector");
  
  if($(window).width() < 767) {
    selector.on('click', function(){
      selector.next().removeClass("active");
      $(this).parent().toggleClass("active");
      $(this).toggleClass("show");
    });

    $(window).on('click', function(e) {
      if (selector.has(event.target).length == 0 && !selector.is(event.target)){
        selector.parent().removeClass("active");
        selector.removeClass("show");
      }
    });
  }
};

export default cusDropdown;