/**
* qTip
*/

export default function() {
  if ($(window).width() > 768) {
    var pointerPosition = 'center left';
    var tooltipPosition = 'bottom right';
    var pointerOffset = -35;
  } else {
    var pointerPosition = 'top center';
    var tooltipPosition = 'bottom center';
    var pointerOffset = 0;
  }

  $('[data-tooltip]').qtip({
    content: {
      attr: 'data-tooltip',
      button: 'x',
    },
    position: {
      my: pointerPosition,
      at: tooltipPosition,
      // target: $('.tooltip'),
      viewport: $(window),
      adjust: {
        resize: true,
        method: 'shift shift',
        x: 0,
        y: -10,
      },
    },
    style: {
      classes: 'tooltip-viewer',
      tip: {
        corner: true,
        corner: pointerPosition,
        mimic: 'center top',
        border: 1,
        width: 40,
        height: 40,
        offset: pointerOffset,
      },
    },
    show: {
      event: 'click',
      effect: function() {
        $(this).fadeTo(500, 1);
      },
    },
    hide: {
      event: false,
      effect: function() {
        $(this).fadeTo(500, 0);
      },
    },
  });

  // $('[class*="tooltip"]').click(function (){
  //   $(this).removeClass('active');
  //   $(this).addClass('active');
  // });
}
