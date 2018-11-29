var player1 = true;
var items = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
$(function() {
  let combos = [[[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]]];

  function markWon(combo) {
    for (let coords = 0; coords < combo.length; coords++) {
      let playingField = $("#playingfield");
      let x = combo[coords][0];
      let y = combo[coords][1];
      $("#playingfield").children().eq(y).children().eq(x).addClass("won");
    }
  }
  function getWinningCombo() {
    for (let combo = 0; combo < combos.length; combo++) {
      let c = combos[combo];
      let firstVal = items[c[0][0]][c[0][1]];
      if (items[c[0][0]][c[0][1]] == 0) {
        continue;
      }
      let found = true;
      for (let coords = 1; coords < c.length; coords++) {
        let currentVal = items[c[coords][0]][c[coords][1]];
        if (currentVal != firstVal) {
          found = false;
          break;
        }
      }
      if (found) {
        return c;
      }
    }
    return null;
  }
  $("button").button();
  $("#playingfield button").click(function(event) {
    let target = $(event.target);
    let x = target.attr('locx');
    let y = target.attr('locy');
    if (items[x][y] != 0) {
      return;
    }
    if (player1) {
      target.button("option", "label", "X");
      items[x][y] = 1;
    } else {
      target.button("option", "label", "O");
      items[x][y] = 2;
    }
    let winningCombo = getWinningCombo();
    if (winningCombo != null) {
      $("#playingfield button").button("disable");
      markWon(winningCombo);
    }
    player1 = !player1;
  });
  $("#reset").click(function(event) {
    for (let x = 0; x < items.length; x++) {
      for (let y = 0; y < items[x].length; y++) {
        items[x][y] = 0;
      }
    }
    $(".won").removeClass("won");
    $("#playingfield button").button("enable");
    $("#playingfield button").button("option", "label", "&nbsp;&nbsp;");
  });
});
