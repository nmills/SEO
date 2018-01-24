/**
* Accordion
*/

export default function() {
  $('.toggle').click(function(e) {
    e.preventDefault();

    let $this = $(this);

    // Collapse
    if ($this.next().hasClass('show')) {
      $this.next().removeClass('show');
      $this.removeClass('active');
      $this.next().slideUp(350);
    }
    // Expand
    else {
      $this.parent().parent().find('li .inner').removeClass('show');
      $('.toggle').removeClass('active');
      $this.parent().parent().find('li .inner').slideUp(350);
      $this.addClass('active');
      $this.next().toggleClass('show');
      $this.next().slideToggle(350);
    }
  });
}
