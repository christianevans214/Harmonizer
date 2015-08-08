var playOption = "stop"
  //a boolean altered on justFreqThings file at lines 102/104 depending on whether note
  //is a repeated one (sustained)
var repeatedNote = false;
jQuery(document).ready(function() {
  var canvas;
  var renderer;
  var newCtx;
  var stave;
  var notes;
  var voice;
  var formatter;
  var counter = 0;
  //maybe the Notes should be an array of Objects with each object being like {note: ____, duration: _____}
  var theNotes = [];
  var measureCounter = 1;
  var NOTE_DURATIONS = ["8", "q", "h", "w"];


  var canvas = jQuery(".notesCanvas")[0];
  console.log(canvas);

  function addNewMeasure(measureCounter) {
    var canvas = document.createElement('canvas');
    canvas.width = 511;
    canvas.height = 125;
    canvas.className = "notesCanvas";
    canvas.id = String(measureCounter);
    var sheetDiv = document.getElementById("sheet");
    sheetDiv.appendChild(canvas);

  }

  function makeStaff(noteCounter, Notes) {
    var inputArr = [Notes[0] || "b/4", Notes[1] || "b/4", Notes[2] || "b/4", Notes[3] || "b/4", Notes[4] || "b/4", Notes[5] || "b/4", Notes[6] || "b/4", Notes[7] || "b/4"];
    var toReturn = [];
    inputArr.forEach(function(note, i) {
      var letter = note.split('/')[0];
      if (letter[letter.length - 1] === "#") {
        toReturn.push(new Vex.Flow.StaveNote({
          keys: [note],
          duration: noteCounter - 1 >= i ? "8" : "8r"
        }).addAccidental(0, new Vex.Flow.Accidental("#")))
      } else {
        toReturn.push(new Vex.Flow.StaveNote({
          keys: [note],
          duration: noteCounter - 1 >= i ? "8" : "8r"
        }))
      }
    })
    if (noteCounter === 8) {
      counter = 0;
      theNotes = [];
      addNewMeasure(measureCounter);
      canvas = jQuery(".notesCanvas")[measureCounter++];
    }
    return toReturn;
  }
  window.restartSong = function() {
    measureCounter = 0;
    theNotes = [];
    counter = 0;
    playOption = "stop";
    jQuery('#sheet').empty();
    addNewMeasure(measureCounter);
    canvas = jQuery(".notesCanvas")[measureCounter++];

  }
  window.updateMeasure = function(note, octave) {
    if (!octave) octave = "4";
    theNotes.push(note.toLowerCase() + "/" + octave + "")
    counter++
    renderer = new Vex.Flow.Renderer(canvas,
      Vex.Flow.Renderer.Backends.CANVAS);

    newCtx = renderer.getContext();
    newCtx.clearRect(0, 0, canvas.width, canvas.height);
    stave = new Vex.Flow.Stave(10, 0, 500);
    stave.addClef("treble").setContext(newCtx).draw();


    //here's where we make the notes...maybe around here we can invoke an optional new function if the pitch is the same?
    notes = makeStaff(counter, theNotes);


    // Create a voice in 4/4
    voice = new Vex.Flow.Voice({
      num_beats: 4,
      beat_value: 4,
      resolution: Vex.Flow.RESOLUTION
    });

    // Add notes to voice
    voice.addTickables(notes);

    // Format and justify the notes to 500 pixels
    formatter = new Vex.Flow.Formatter().
    joinVoices([voice]).format([voice], 500);

    // Render voice
    voice.draw(newCtx, stave);


  }

  // var drums = {
  //   kick: "x",
  //   snare: "o",
  //   close: "*",
  //   open: "-",
  //   rest: "\."
  // }

  // var drumKeys = Object.keys(drums)
  // var oneCount = 0
  // var twoCount = 0
  // var threeCount = 0
  // var fourCount = 0
  // var fiveCount = 0
  // var sixCount = 0
  // var sevenCount = 0
  // var eightCount = 0

  // var changeDrums = function(num, counter) {
  //   jQuery("#" + num).click(function() {
  //     jQuery(this).text(drumKeys[counter++])
  //     editStr(num - 1, drums[drumKeys[counter - 1]])

  //     if (counter === drumKeys.length) counter = 0;
  //   });
  // }

  // changeDrums(1, oneCount);
  // changeDrums(2, twoCount)
  // changeDrums(3, threeCount)
  // changeDrums(4, fourCount)
  // changeDrums(5, fiveCount)
  // changeDrums(6, sixCount)
  // changeDrums(7, sevenCount)
  // changeDrums(8, eightCount)

  //DOM EVENT EMITTERS
  stopPlaying();
  startPlaying();
  restartPlaying();
})

// var drumStr = 'x*o-'

// function editStr(idx, char) {
//   var strArr = drumStr.split('')
//   console.log(strArr)
//   strArr[idx] = char;
//   drumStr = strArr.join('')
//   console.log(drumStr)
//   drums.kill();
//   drums = EDrums(drumStr);
// }

function stopPlaying() {
  jQuery('.stop').on('click', function() {
    playOption = "stop";
    console.log("PLAY OPTION");
  })
}

function startPlaying() {
  jQuery('.play').on('click', function() {
    playOption = "play";
    console.log("PLAY OPTION");
  })
}

function restartPlaying() {
  jQuery('.restart').on('click', function() {
    restartSong();
    console.log("PLAY OPTION");
  })
}