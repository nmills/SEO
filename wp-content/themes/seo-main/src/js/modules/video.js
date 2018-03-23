/**
 * Video player play button
 */

export default function() {
  $('.c-hero_playbutton').click(function() {
    if ($(this).siblings(".video-player").get(0).paused) {
      $(this).siblings(".video-player").get(0).play();
      $(this).fadeOut();
    }
  });

  $('.video-player').click(function() {
    if (!$(this).get(0).paused) {
      $(this).get(0).pause();
      $(this).siblings(".c-hero_playbutton").fadeIn();
    }
  });
}
