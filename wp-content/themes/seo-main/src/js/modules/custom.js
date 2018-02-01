/**
* Custom Js
*/

export default function() {
  $(".c-uie__dropdown-heading").hover(
    function() {
      $(".c-uie__dropdown-heading .c-uie__dropdown-options").addClass("drop");
    },
    function() {
      $(".c-uie__dropdown-heading .c-uie__dropdown-options").removeClass("drop");
    }
  );

  	$( ".cross" ).hide();
	// $( ".c-menu__container" ).hide();
	
	$( ".hamburger" ).click(function() {
		$( ".c-menu__container" ).slideToggle( "slow", function() {
			$( ".hamburger" ).hide();
			$( ".cross" ).show();
		});
	});

	$( ".cross" ).click(function() {
		$( ".c-menu__container" ).slideToggle( "slow", function() {
			$( ".cross" ).hide();
			$( ".hamburger" ).show();
		});
	});
}