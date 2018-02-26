/**
* Hamburger Menu
*/

export default function() {
  var hamburgerBtn = $(".js-hamburger-btn");
  var subMenuLink = $(".has-submenu");
  var dropDownMenu = $(".main-nav-dropdown");
  var mainMenu = $(".c-nav--bottom");

  hamburgerBtn.click(function() {
  	if(!$(this).hasClass('active')) {
      $(this).addClass('active');
      mainMenu.slideDown('medium');
    } else {
      $(this).removeClass('active');
      mainMenu.slideUp('medium');
    }
  });
	
	subMenuLink.click(function() {
    if(!$(this).hasClass('active')){
      subMenuLink.filter('.active')
      .removeClass('active')
      .find('.main-nav-dropdown')
      .slideUp('medium');

      $(this)
      .addClass('active')
      .find('.main-nav-dropdown').slideDown('medium');
    } else{
      $(this)
      .removeClass('active')
      .find('.main-nav-dropdown').slideUp('medium');
    }
	});
}