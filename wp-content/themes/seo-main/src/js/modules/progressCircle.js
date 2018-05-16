/**
* Progress Circle
*/

export default function() {
  var progress_circle = $(".my-progress-bar").gmpc({
    line_width: 10,
    color: "#ccc",
    starting_position: 50, // 12.00 o' clock position, 25 stands for 3.00 o'clock (clock-wise)
    percent: 0, // percent starts from
    percentage: true,
    // text: "More power behind every pixel"
  })
  .gmpc("animate", 80, 3000);
}