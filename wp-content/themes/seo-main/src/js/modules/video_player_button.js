/**
 * Full Width Video
 */
export default function() {
  // Inject YouTube API script
  var tag = document.createElement('script');
  tag.src = "//www.youtube.com/player_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


  var playButton = $('#play-button');

  // Get youtube video ID function
  function getId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[2].length == 11) {
      return match[2];
    } else {
      return 'error';
    }  
  }

  // The first argument of YT.Player is an HTML element ID. YouTube API will replace my <div id="triptych__video"> tag with an iframe containing the youtube video.
  window.onYouTubeIframeAPIReady = function () {
    $('.fullwidth__video').each(function(){
      var VideoURL = $(this).attr('video-url');
      var playButton = $(this).siblings('#play-button');
      // Get youtube video ID from the URL
      var videoId = getId(VideoURL);
      var fullWidthplayer = new YT.Player($(this)[0], {
        height: 320,
        width: 400,
        playerVars : {
          controls: 0,
          rel: 0
        },
        videoId : videoId,
        events : {
          'onReady' : onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });

function onPlayerStateChange(event) {
  console.log(YT.PlayerState.PAUSED);
    if(event.data == YT.PlayerState.PAUSED) {
      playButton.show();
    }
  }

  function onPlayerReady(event) {
    playButton.on("click", function(e) {
      // Playing video from start
      fullWidthplayer.playVideo();
      playButton.hide();
    });
  }


    });
  };

  
}