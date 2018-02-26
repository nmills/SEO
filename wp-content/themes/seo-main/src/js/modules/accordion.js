/**
* Accordion
*/

export default function() {
  $('.toggle span.content-grid').click(function(e) {
    e.preventDefault();

    let $this = $(this).parent();

    // Collapse
    if ($this.find('.answer').hasClass('show')) {
      $this.find('.answer').removeClass('show');
      $this.removeClass('active');
      $this.find('.answer').slideUp(350);
    }
    // Expand
    else {
      $this.find('.answer').removeClass('show');
      $('.toggle').removeClass('active');
      $this.find('.answer').slideUp(350);
      $this.addClass('active');
      $this.find('.answer').toggleClass('show');
      $this.find('.answer').slideToggle(350);
    }
  });
}