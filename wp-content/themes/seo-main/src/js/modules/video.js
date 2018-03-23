/**
 * Video player play button
 */

export default function() {
  $('.c-hero_playbutton').click(function() {
    if ($(".video-player").get(0).paused) {
      $(".video-player").get(0).play();
      $(".c-hero_playbutton").fadeOut();
    }
  });

  $('.video-player').click(function() {
    if (!$(".video-player").get(0).paused) {
      $(".video-player").get(0).pause();
      $(".c-hero_playbutton").fadeIn();
    }
  });
}
