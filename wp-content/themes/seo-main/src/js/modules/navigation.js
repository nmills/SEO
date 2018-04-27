/**
 * Navigation
 */


export default function() {
  // Adding position to submenu items to align with parent

  var width = $(window).width();

  if ((width >= 1024)) {
    if ($('.main-nav-dropdown').length) {
      var active_parent = $('a.active-parent').offset().left;
      var container = $('.main-nav-dropdown').offset().left;
      var left_offset = active_parent - container - 32;

      console.log(left_offset);

      $(".child-menu").css("left", left_offset + "px");
    }
  }
}
