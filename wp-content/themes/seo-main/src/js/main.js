/* eslint-env browser */
'use strict';

import jquery from 'jquery';
// import prepInputs from 'modules/prepinputs.js';
// import socialShare from 'modules/socialShare.js';
// import carousel from 'modules/carousel.js';
// import qtip from 'modules/qtip.js';
// import accordion from 'modules/accordion.js';
// import galleryWidget from 'modules/galleryWidget.js';
// import custom from 'modules/custom.js';

(function($) {
  $( document ).ready(function() {
    ready();
    
    // Styleguide event when an element is rendered
    $(window).bind("styleguide:onRendered", function(e) {
      ready();
    });
  });

  // Initalizing all modules
  function ready() {
    // Prepare form inputs
    // prepInputs();
    // Initialize social share functionality.
    // Replace the empty string parameter with your Facebook ID
    // socialShare('');

    // Initialize carousels
    // carousel();

    // Initialize qTip
    // qtip();

    // Initialize accordion
    // accordion();

    // Initialize Plugins
    // $('.magnific-trigger').magnificPopup({
    //   type: 'inline',
    // });

    // Initialize Gallery Slider
    // galleryWidget();

    custom();
  }
})(jquery);
