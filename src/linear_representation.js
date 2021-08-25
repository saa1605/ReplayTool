$(document).ready(function () {
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
  // let apparent_cursor_end_prev = apparent_cursor_end;

  let lastPointer = 0;
  let real_cursor_start = idx;
  let real_cursor_end = idx;
  let real_cursor_end_prev = real_cursor_end;
  let isEdit = false;

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

  //d = {};
  //d[-1] = 0;
  //d_start = {};
  //d_start[-1] = 0;

  d = new Array(2000).fill(0);

  function updateD(from) {
    for (let i = from; i < d.length; i++) {
      d[i] = d[from];
    }
  }

  arcs = [];
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

        //if (!(real_cursor_end in d)) {
        //if (!(real_cursor_end - 1 in d)) {
        //d[real_cursor_end] = d[Object.keys(d).length - 2];
        //} else {
        //d[real_cursor_end] = d[real_cursor_end - 1];
        //}
        //} else if (d[real_cursor_end] < d[real_cursor_end - 1]) {
        //d[real_cursor_end] = d[real_cursor_end - 1];
        //}
        //d[real_cursor_end] += delete_counter;
        //for (let i = real_cursor_end; i < Object.keys(d).length; i++) {
        //if (d[i] < d[i - 1]) {
        //d[i] = d[i - 1];
        //}
        //}
        if (real_cursor_end > 0) {
          d[real_cursor_end] += delete_counter;
          updateD(real_cursor_end, delete_counter);
        }
        apparent_cursor_end = real_cursor_end + d[real_cursor_end];
        // console.log(
        //   current_text,
        //   apparent_cursor_end,
        //   apparent_cursor_start,
        //   real_cursor_end,
        //   real_cursor_start,
        //   d.slice(0, d.length)
        // );
        if (real_cursor_end < prev_text.length - 1) {
          isEdit = true;
        }
      } else {
        current_cursor = cursor_positions[idx]["end"];
      }
      switch (keys[idx]) {
        // Delete or Backspace
        case 8:
          if (show_deletes) {
            if (real_cursor_end != real_cursor_start) {
              // console.log(keys[idx])
              for (
                delete_counter = 0;
                delete_counter < Math.abs(real_cursor_end - real_cursor_start);
                delete_counter++
              ) {
                tokens[apparent_cursor_end - delete_counter - 1] =
                  `<span style="opacity:0.4" class="delete" id="token_${idx}"><strike>` +
                  tokens[apparent_cursor_end - delete_counter - 1] +
                  "</strike></span>";
              }
              updateD(real_cursor_end, delete_counter);
              delete_counter = 0;
              // updateD(real_cursor_start);
              // delete_counter = 0;
              // let upperbound = Math.max(
              //   real_to_apparent_mapping_start[real_cursor_start],
              //   real_to_apparent_mapping_end[real_cursor_end]
              // );
              // let lowerbound = Math.min(
              //   real_to_apparent_mapping_start[real_cursor_start],
              //   real_to_apparent_mapping_end[real_cursor_end]
              // );

              // for (
              //   delete_counter = lowerbound;
              //   delete_counter < upperbound;
              //   delete_counter++
              // ) {
              //   tokens[delete_counter] =
              //     '<span style="opacity:0.4"><strike>' +
              //     tokens[delete_counter] +
              //     "</strike></span>";
              //   accumalated_deletes.splice(lowerbound, 0, 1);
              // }
              // delete_counter = 0;
            } else {
              // console.log(tokens[apparent_cursor_end - delete_counter - 1]);
              if (
                tokens[apparent_cursor_end - delete_counter - 1] !== undefined
              ) {
                // console.log(tokens[apparent_cursor_end - delete_counter - 1])
                while (
                  tokens[apparent_cursor_end - delete_counter - 1].includes(
                    "opacity"
                  )
                ) {
                  delete_counter += 1;
                  if (
                    tokens[apparent_cursor_end - delete_counter - 1] ==
                    undefined
                  ) {
                    break;
                  }
                }
              }

              tokens[apparent_cursor_end - delete_counter - 1] =
                `<span style="opacity:0.4" class="delete" id="token_${idx}"><strike>` +
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
              `<span style="color:green" class="phrase-complete" id="token_${idx}">` +
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
          delete_counter = 0;
          tokens.splice(apparent_cursor_end, 0, "<br/>");
          caps_flag = false;
          break;

        // Alphanumeric Characters
        default:
          accumalated_deletes.push(0);

          // let alphanumeric_tok = "";

          // alphanumeric_tok = current_text[real_cursor_end];
          let alphanumeric_tok = "";

          alphanumeric_tok = current_text[real_cursor_end];
          if (isEdit) {
            alphanumeric_tok = `<span class="edit-insert" id="token_${idx}">${alphanumeric_tok}</span>`;
          } else {
            alphanumeric_tok = `<span class="insert" id="token_${idx}">${alphanumeric_tok}</span>`;
          }

          caps_flag = false;

          tokens.splice(apparent_cursor_end, 0, alphanumeric_tok);

          delete_counter = 0;
          break;
      }

      if (apparent_cursor_end > lastPointer) {
        lastPointer = apparent_cursor_end;
      }
      isEdit = false;
      apparent_cursor_end_prev = apparent_cursor_end;
      prev_text = current_text;
      temporal_token_registry.push(tokens.slice());
    }
  }

  // function process() {
  //   for (idx = 0; idx < keys.length; idx++) {
  //     current_text = logs[idx];

  //     if (show_deletes) {
  //       real_cursor_start = cursor_positions[idx]["start"];
  //       real_cursor_end = cursor_positions[idx]["end"];
  //       if (!(real_cursor_start in real_to_apparent_mapping_start)) {
  //         real_to_apparent_mapping_start[real_cursor_start] =
  //           real_cursor_start +
  //           accumalated_deletes.slice().reduce((a, b) => a + b, 0);
  //       }
  //       if (!(real_cursor_end in real_to_apparent_mapping_end)) {
  //         real_to_apparent_mapping_end[real_cursor_end] =
  //           real_cursor_end +
  //           accumalated_deletes.slice().reduce((a, b) => a + b, 0);
  //       }
  //       if (real_cursor_end > 0) {
  //         d[real_cursor_end] += delete_counter;
  //         updateD(real_cursor_end);
  //       }
  //       apparent_cursor_end = real_cursor_end + d[real_cursor_end];
  //       apparent_cursor_start = real_cursor_start + d[real_cursor_start];

  //       // Is this instance an edit?
  //       // The user is typing somewhere in between existing text, so if the cursor location is much lesser than the length of prev text it is an edit
  //       if (real_cursor_end < prev_text.length - 1) {
  //         isEdit = true;
  //       }
  //     } else {
  //       current_cursor = cursor_positions[idx]["end"];
  //     }
  //     switch (keys[idx]) {
  //       // Delete or Backspace
  //       case 8:
  //         if (show_deletes) {
  //           if (real_cursor_end != real_cursor_start) {
  //             // let upperbound = Math.max(
  //             //   real_to_apparent_mapping_start[real_cursor_start],
  //             //   real_to_apparent_mapping_end[real_cursor_end]
  //             // );
  //             // let lowerbound = Math.min(
  //             //   real_to_apparent_mapping_start[real_cursor_start],
  //             //   real_to_apparent_mapping_end[real_cursor_end]
  //             // );

  //             // for (
  //             //   delete_counter = lowerbound;
  //             //   delete_counter < upperbound;
  //             //   delete_counter++
  //             // ) {
  //             //   tokens[delete_counter] =
  //             //     '<span style="opacity:0.4"><strike>' +
  //             //     tokens[delete_counter] +
  //             //     "</strike></span>";
  //             //   accumalated_deletes.splice(lowerbound, 0, 1);
  //             // }
  //             for (
  //               let bulkDeleteCounter = apparent_cursor_end;
  //               bulkDeleteCounter > apparent_cursor_start;
  //               bulkDeleteCounter--
  //             ) {
  //               tokens[bulkDeleteCounter] =
  //                 `<span style="opacity:0.4"><strike>` +
  //                 tokens[bulkDeleteCounter] +
  //                 "</strike></span>";
  //             }
  //             delete_counter = apparent_cursor_end - apparent_cursor_start;
  //           } else {
  //             tokens[apparent_cursor_end - delete_counter - 1] =
  //               `<span style="opacity:0.4;" class="delete" id="token_${idx}"><strike>` +
  //               tokens[apparent_cursor_end - delete_counter - 1] +
  //               "</strike></span>";
  //             caps_flag = false;
  //             if (isEdit) {
  //               tokens[
  //                 apparent_cursor_end - delete_counter - 1
  //               ] = `<span class="edit-delete" id="token_${idx}">${
  //                 tokens[apparent_cursor_end - delete_counter - 1]
  //               }</span>`;
  //             }
  //             delete_counter += 1;
  //             accumalated_deletes.push(1);
  //           }
  //         } else {
  //           if (
  //             cursor_positions[idx]["end"] != cursor_positions[idx]["start"]
  //           ) {
  //             tokens.splice(
  //               Math.min(
  //                 cursor_positions[idx]["end"],
  //                 cursor_positions[idx]["start"]
  //               ),
  //               Math.abs(
  //                 cursor_positions[idx]["end"] - cursor_positions[idx]["start"]
  //               )
  //             );
  //           } else {
  //             tokens.splice(cursor_positions[idx]["end"] - 1, 1);
  //           }
  //         }

  //         break;
  //       // Shift
  //       case 16:
  //         caps_flag = true;
  //         delete_counter = 0;
  //         accumalated_deletes.push(0);
  //         break;
  //       // Tab
  //       case 9:
  //         delete_counter = 0;
  //         caps_flag = false;
  //         accumalated_deletes.push(0);
  //         const suggestion_tok = accepted_suggestions[idx].split("");
  //         let i = 0;
  //         for (i = 0; i < suggestion_tok.length; i++) {
  //           let t =
  //             `<span style="color:green;" class="phrase-complete" id="token_${idx}">` +
  //             suggestion_tok[i] +
  //             "</span>";
  //           tokens.splice(apparent_cursor_end + i, 0, t);
  //           d[real_cursor_end + i] = d[real_cursor_end];
  //         }
  //         break;

  //       // Left Arrow
  //       case 37:
  //         delete_counter = 0;
  //         caps_flag = false;
  //         break;

  //       // Right Arrow
  //       case 39:
  //         delete_counter = 0;
  //         caps_flag = false;
  //         break;

  //       // Newline
  //       case 13:
  //         delete_counter = 0;
  //         tokens.splice(apparent_cursor_end, 0, "<br/>");
  //         caps_flag = false;
  //         break;

  //       // Alphanumeric Characters
  //       default:
  //         accumalated_deletes.push(0);

  //         let alphanumeric_tok = "";

  //         alphanumeric_tok = current_text[real_cursor_end];
  //         if (isEdit) {
  //           alphanumeric_tok = `<span class="edit-insert" id="token_${idx}">${alphanumeric_tok}</span>`;
  //         } else {
  //           alphanumeric_tok = `<span class="insert" id="token_${idx}">${alphanumeric_tok}</span>`;
  //         }
  //         caps_flag = false;

  //         tokens.splice(apparent_cursor_end, 0, alphanumeric_tok);

  //         delete_counter = 0;
  //         break;
  //     }

  //     isEdit = false;
  //     real_cursor_end_prev = real_cursor_end;
  //     prev_text = current_text;
  //     temporal_token_registry.push(tokens.slice());
  //   }
  // }
  function linearRepresentation() {
    $("body").css("font-family", "Fira Mono, Monospace");
    tokens = "";
    $("#userText").html(
      temporal_token_registry[temporal_token_registry.length - 1].join("")
    );
    // console.log(
    //   temporal_token_registry[temporal_token_registry.length - 1].join("")
    // );
    $("#userText").css("max-width", "90%");
    $(".edit").css("background-color", "yellow");
    let currentElement;
    let x;
    let y;
    let svg;
    let prevX;
    let prevY;
    let first = true;
    const X_OFFSET = -95;
    const Y_OFFSET = -65 + 22;
    console.log(keys.length)
    for (let idx = 0; idx < keys.length; idx++) {
      currentElement = document.getElementById(`token_${idx}`);
      if (currentElement != null) {
        x = currentElement.getBoundingClientRect().x;
        y = currentElement.getBoundingClientRect().y;
        svg = d3.select("svg");
        let radius = 0;
        if (duration[idx] < 1000) {
          radius = duration[idx] / 175;
        } else {
          radius = 10;
        }
        let c = currentElement.className;
        console.log(c);
        if (c == "insert") {
          svg
            .append("circle")
            .attr("cx", x + X_OFFSET)
            .attr("cy", y + Y_OFFSET)
            .attr("r", radius)
            .attr("stroke", "#3CC9D2")
            .attr("fill", "#3CC9D2")
            .style("opacity", "0.25");
        } else if (c == "phrase-complete") {
          svg
            .append("circle")
            .attr("cx", x + X_OFFSET)
            .attr("cy", y + Y_OFFSET)
            .attr("r", radius)
            .attr("stroke", "#00980F")
            .attr("fill", "#00980F")
            .style("opacity", "0.4");
        } else if (c == "delete") {
          svg
            .append("circle")
            .attr("cx", x + X_OFFSET)
            .attr("cy", y + Y_OFFSET)
            .attr("r", radius)
            .attr("stroke", "#FF0000")
            .attr("fill", "#FF0000")
            .style("opacity", "0.25");
        } else if (c == "edit-insert") {
          svg
            .append("circle")
            .attr("cx", x + X_OFFSET)
            .attr("cy", y + Y_OFFSET)
            .attr("r", radius)
            .attr("stroke", "#0057FF")
            .attr("fill", "#0057FF")
            .style("opacity", "0.4");
        } else if (c == "edit-delete") {
          svg
            .append("circle")
            .attr("cx", x + X_OFFSET)
            .attr("cy", y + Y_OFFSET)
            .attr("r", radius)
            .attr("stroke", "#9B51E0")
            .attr("fill", "#9B51E0")
            .style("opacity", "0.35");
        }
        // if (!first && idx < 500) {
        //   svg
        //     .append("line")
        //     .attr("x1", prevX - 70)
        //     .attr("y1", prevY + 10)
        //     .attr("x2", x - 70)
        //     .attr("y2", y + 10)
        //     .attr("stroke", "#FFC876")
        //     .attr("fill", "#FFC876");
        // }
        first = false;
        prevX = x;
        prevY = y;
      }
    }
  }
  process();
  linearRepresentation();
  //  display();
});
