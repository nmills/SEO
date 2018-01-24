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
}