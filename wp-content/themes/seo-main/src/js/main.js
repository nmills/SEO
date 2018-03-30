/* eslint-env browser */
'use strict';

import jquery from 'jquery';
import accordion from 'modules/accordion.js';
import video from 'modules/video.js';
import searchBar from 'modules/searchBar.js';
import hamburger from 'modules/hamburger.js';
import bxslider from 'modules/jquery.bxslider.min.js';
import galleryWidget from 'modules/galleryWidget.js';
import player_button from 'modules/video_player_button.js';


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
    accordion();

    // Initialize Plugins
    // $('.magnific-trigger').magnificPopup({
    //   type: 'inline',
    // });

    // Initialize Gallery Slider
    galleryWidget();

    // video();
    player_button();
    searchBar();
    hamburger();
  }
})(jquery);
