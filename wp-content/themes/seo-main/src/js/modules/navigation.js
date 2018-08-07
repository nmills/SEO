/**
 * Navigation
 */


export default function() {
  // Adding position to submenu items to align with parent

  var width = $(window).width();

  setTimeout(function(){
    if ($('.main-nav-dropdown').length && (width >= 840)) {
      var active_parent = $('a.active-parent').position().left;
      $(".child-menu").css({
        'left' : active_parent + 'px',
        'opacity' : '1'
      });
    }
  }, 10);
}
