$(document).ready(function () {
  // const keys = data.keys
  // const cursor_positions = data.cursor_positions
  // const logs = data.logs.slice(1, data.logs.length)
  // const suggestions = data.suggestions
  // const accepted_suggestions = data.accepted_suggestions

  const keys = data["key"];
  const selectionEnd = data["selectionEnd"];
  const selectionStart = data["selectionStart"];
  const logs = data["userText"].slice(1, data["userText"].length);
  const suggestionText = data["suggestionText"].slice(
    1,
    data["userText"].length
  );
  const accepted_suggestions = data["acceptedSuggestion"];
  const cursor_positions = [];
  const suggestions = [];
  const duration = data["duration"];

  const NORMALIZATION_CONST = 400;

  for (let d = 0; d < duration.length; d++) {
    if (duration[d] > 1000) {
      duration[d] = 1000;
    }
  }
  for (let i = 0; i < suggestionText.length; i++) {
    suggestions.push(suggestionText[i].replace(logs[i], ""));
  }
  for (let i = 0; i < selectionEnd.length; i++) {
    cursor_positions.push({ start: selectionStart[i], end: selectionEnd[i] });
  }
  let userTextSelector = document.querySelectorAll("#userText");

  let idx = 0;

  let real_to_apparent_mapping_start = {};
  let real_to_apparent_mapping_end = {};

  let apparent_cursor_end = idx;
  let apparent_cursor_start = idx;
  let apparent_cursor_end_prev = apparent_cursor_end;
  let lastPointer = 0;
  let real_cursor_start = idx;
  let real_cursor_end = idx;

  let prev_text = "";
  let current_text = "";
  let caps_flag = false;
  let show_deletes = true;
  const temporal_token_array = [];

  let multiplier = 1;
  let adder = 1;
  var counterOn = true;
  var delay = 300;
  var lastRun;
  var tempDelay;
  var intervalId;

  let delete_counter = 0;
  let accumalated_deletes = [0];
  let tokens = [];
  const temporal_token_registry = [];

  circleSize = [];

  d = {};
  d[-1] = 0;
  d_start = {};
  d_start[-1] = 0;
  function process() {
    for (idx = 0; idx < keys.length; idx++) {
      current_text = logs[idx];

      if (show_deletes) {
        real_cursor_start = cursor_positions[idx]["start"];
        real_cursor_end = cursor_positions[idx]["end"];
        if (!(real_cursor_start in real_to_apparent_mapping_start)) {
          real_to_apparent_mapping_start[real_cursor_start] =
            real_cursor_start +
            accumalated_deletes.slice().reduce((a, b) => a + b, 0);
        }
        if (!(real_cursor_end in real_to_apparent_mapping_end)) {
          real_to_apparent_mapping_end[real_cursor_end] =
            real_cursor_end +
            accumalated_deletes.slice().reduce((a, b) => a + b, 0);
        }

        // apparent_cursor_start = real_to_apparent_mapping_start[real_cursor_start];
        // apparent_cursor_end = real_to_apparent_mapping_start[real_cursor_end];
        // apparent_cursor_start = real_cursor_start + accumalated_deletes.slice().reduce((a, b) => a + b, 0);
        // apparent_cursor_end = real_cursor_end + accumalated_deletes.slice().reduce((a, b) => a + b, 0);

        if (!(real_cursor_end in d)) {
          if (!(real_cursor_end - 1 in d)) {
            d[real_cursor_end] = d[Object.keys(d).length - 2];
          } else {
            d[real_cursor_end] = d[real_cursor_end - 1];
          }
        } else if (d[real_cursor_end] < d[real_cursor_end - 1]) {
          d[real_cursor_end] = d[real_cursor_end - 1];
        }
        d[real_cursor_end] += delete_counter;
        // console.log(d[real_cursor_end])
        for (let i = real_cursor_end; i < Object.keys(d).length; i++) {
          if (d[i] < d[i - 1]) {
            d[i] = d[i - 1];
          }
        }
        apparent_cursor_end = real_cursor_end + d[real_cursor_end];
        // console.log(apparent_cursor_end, apparent_cursor_end_2)
        // real_to_apparent_mapping_start[real_cursor_start] = apparent_cursor_start
        // real_to_apparent_mapping_end[real_cursor_end] = apparent_cursor_end
        console.log(apparent_cursor_end, real_cursor_end, current_text);

        // circleSize.splice(apparent_cursor_end, 0, duration[idx]);
      } else {
        current_cursor = cursor_positions[idx]["end"];
      }
      switch (keys[idx]) {
        // Delete or Backspace
        case 8:
          if (show_deletes) {
            if (real_cursor_end != real_cursor_start) {
              let upperbound = Math.max(
                real_to_apparent_mapping_start[real_cursor_start],
                real_to_apparent_mapping_end[real_cursor_end]
              );
              let lowerbound = Math.min(
                real_to_apparent_mapping_start[real_cursor_start],
                real_to_apparent_mapping_end[real_cursor_end]
              );

              for (
                delete_counter = lowerbound;
                delete_counter < upperbound;
                delete_counter++
              ) {
                tokens[delete_counter] =
                  '<span style="opacity:0.4"><strike>' +
                  tokens[delete_counter] +
                  "</strike></span>";
                accumalated_deletes.splice(lowerbound, 0, 1);
              }
              delete_counter = 0;
            } else {
              tokens[apparent_cursor_end - delete_counter - 1] =
                `<span style="opacity:0.4"><strike>` +
                tokens[apparent_cursor_end - delete_counter - 1] +
                "</strike></span>";
              caps_flag = false;
              delete_counter += 1;
              accumalated_deletes.push(1);

            }
          } else {
            if (
              cursor_positions[idx]["end"] != cursor_positions[idx]["start"]
            ) {
              tokens.splice(
                Math.min(
                  cursor_positions[idx]["end"],
                  cursor_positions[idx]["start"]
                ),
                Math.abs(
                  cursor_positions[idx]["end"] - cursor_positions[idx]["start"]
                )
              );
            } else {
              tokens.splice(cursor_positions[idx]["end"] - 1, 1);
            }
          }

          break;
        // Shift
        case 16:
          caps_flag = true;
          delete_counter = 0;
          accumalated_deletes.push(0);
          break;
        // Tab
        case 9:
          delete_counter = 0;
          caps_flag = false;
          accumalated_deletes.push(0);
          const suggestion_tok = accepted_suggestions[idx].split("");
          let i = 0;
          for (i = 0; i < suggestion_tok.length; i++) {
            let t =
              `<span style="color:green">` +
              suggestion_tok[i] +
              "</span>";
            tokens.splice(apparent_cursor_end + i, 0, t);
            d[real_cursor_end + i] = d[real_cursor_end];
          }
          break;
        
        // Left Arrow 
        case 37:
          delete_counter = 0;
          caps_flag = false;
          break;

        // Right Arrow 
        case 39:
          delete_counter = 0;
          caps_flag = false;
          break;

        // Newline 
        case 13:
          tokens.splice(apparent_cursor_end, 0, "<br/>");
          caps_flag = false;
          break;

        // Alphanumeric Characters  
        default:
          accumalated_deletes.push(0);

          let alphanumeric_tok = "";
          if (apparent_cursor_end < lastPointer) {
            alphanumeric_tok = "[" + current_text[real_cursor_end] + "]";
          } else {
            alphanumeric_tok = current_text[real_cursor_end];
          }
          caps_flag = false;

          tokens.splice(
            apparent_cursor_end,
            0,
            alphanumeric_tok
          );

          // Uncomment Below code to generate static display of suggestions

          // if (current_text != suggestionText[idx]) {
          //   let extraText = suggestionText[idx].replace(current_text, '')
          //   for (let i = 0; i < extraText.length; i++) {
          //     d[real_cursor_end + i] = d[real_cursor_end] + extraText.length;
          //     let t = "<span style=color:red>" + extraText[i] + "</span>";
          //     tokens.splice(apparent_cursor_end + i, 0, t);
          //   }
          // }

          // deletes_accumulated_so_far.splice(current_cursor, 0, 0)
          //   if (real_cursor_end > 450 && real_cursor_end < 490) {
          //     console.log(
          //       { ...d },
          //       current_text,
          //       apparent_cursor_end,
          //       real_cursor_end,
          //       current_text[real_cursor_end],
          //       delete_counter
          //     );
          //   }
          delete_counter = 0;
          break;
      }

      if (apparent_cursor_end > lastPointer) {
        lastPointer = apparent_cursor_end;
      }
      apparent_cursor_end_prev = apparent_cursor_end;
      prev_text = current_text;
      temporal_token_registry.push(tokens.slice());
    }
  }
  let timestep = 0;

  function display() {
    if (timestep < temporal_token_registry.length) {
      $("#userText").html(
        "<span class='tokens' style='font-family: 'Fira Mono', 'Monospace''>" +
          temporal_token_registry[timestep].join("") +
          '<span style="opacity:0.5; color:red">' +
          suggestions[timestep] +
          "</span>" +
          "</span>"
      );
      // let size = ((duration[timestep] / 100).toString() + 'em')
      // console.log(size)
      // $(".tokens").css('font-family', 'url("Fira Mono, Monospace")')
      // $(".tokens").css('background', 'url("yellow_circle.png"), no-repeat')
      // $(".tokens").css('background-size', size)
      // $(".tokens").css('background-position', 'left bottom')
    }
    timestep += adder;
    timeoutId = setTimeout(display, delay);
    lastRun = new Date();
  }

  function linearRepresentation() {
    tokens = "";
    console.log(
      temporal_token_registry[temporal_token_registry.length - 1].join("")
    );
    $("#userText").html(
      temporal_token_registry[temporal_token_registry.length - 1].join("")
    );
    $("#userText").css("max-width", "800px");
    // for (let i = 0; i < temporal_token_registry.length; i++) {
    //   tokens =
    //     tokens + temporal_token_registry[temporal_token_registry.length - 1][i];
    // }
    // console.log(tokens);
    // $("#userText").html(tokens);
    // for (let i = 0; i < temporal_token_registry.length; i++) {
    //   console.log(circleSize);

    //   size = circleSize[i] / 100;
    //   if (size > 1) {
    //     size = 1;
    //   }
    //   sizeString = size.toString() + "em";

    //   console.log("size: ", sizeString);
    //   $(`#tok_${i}`).css("width", sizeString);
    //   $(`#tok_${i}`).css("height", sizeString);
    //   $(`#tok_${i}`).css("border-radius", "50%");
    //   $(`#tok_${i}`).css("background", "yellow");
    //   $(`#tok_${i}`).css("positions", "relative");

    //   $(`#tok_${i}`).css("z-index:", "-1");
    // }
  }
  function toggleCounter() {
    var curTime = new Date();
    counterOn = !counterOn;
    if (counterOn) {
      lastRun = curTime.valueOf() + tempDelay - delay;
      timeoutId = setTimeout(display, tempDelay);
    } else {
      clearTimeout(timeoutId);
      tempDelay = delay - (curTime.valueOf() - lastRun);
    }
  }

  $(document).keydown(function (e) {
    if (e.which === 80) {
      toggleCounter();
    } else if (e.which === 67) {
      idx = 0;
      toggleCounter();
    } else if (e.which == 37) {
      adder = -1;
    } else if (e.which == 39) {
      adder = 1;
    } else if (e.which == 38) {
      delay -= 50;
      multiplier /= 2;
    } else if (e.which == 40) {
      delay += 50;
      multiplier *= 2;
    } else if (e.which == 76) {
      linearRepresentation();
    }
  });

  process();
  display();
});
