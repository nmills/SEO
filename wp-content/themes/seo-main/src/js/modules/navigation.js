/**
 * Navigation
 */


export default function() {
  // Adding position to submenu items to align with parent

  var width = $(window).width();

  if ((width >= 1024)) {
    if ($('.main-nav-dropdown').length) {
      var active_parent = $('a.active-parent').offset().left;
      var container = $('.container.region_hero').offset().left;
      var left_offset = active_parent - container;

      console.log(left_offset);

      $(".child-menu").css("left", left_offset + "px");
    }
  }
}
