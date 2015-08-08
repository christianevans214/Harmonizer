var playOption = "stop"
jQuery(document).ready(function() {
  var canvas;
  var renderer;
  var newCtx;
  var stave;
  var notes;
  var voice;
  var formatter;
  var counter = 0;
  var theNotes = [];
  var measureCounter = 1;


  var canvas = jQuery(".notesCanvas")[0];
  console.log(canvas);

  function addNewMeasure(measureCounter) {
    var canvas = document.createElement('canvas');
    canvas.width = 511;
    canvas.height = 125;
    canvas.className = "notesCanvas";
    console.log("MEASURE COUNTER", measureCounter);
    console.log("NEW CANVAS", canvas);
    canvas.id = String(measureCounter);
    // canvas.className += " " + measureCounter.toString();
    // canvas.id = String(measureCounter);
    // canvas.
    var sheetDiv = document.getElementById("sheet");
    sheetDiv.appendChild(canvas);

  }

  function makeStaff(noteCounter, Notes) {
    var inputArr = [Notes[0] || "b/4", Notes[1] || "b/4", Notes[2] || "b/4", Notes[3] || "b/4", Notes[4] || "b/4", Notes[5] || "b/4", Notes[6] || "b/4", Notes[7] || "b/4"];
    // var inputArr = [0, 0, 0, 0, 0, 0, 0, 0];
    console.log(inputArr);
    var restArr = []
    console.log(inputArr);
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
    console.log(note, octave);
    if (!octave) octave = "4";
    theNotes.push(note.toLowerCase() + "/" + octave + "")
    counter++
    renderer = new Vex.Flow.Renderer(canvas,
      Vex.Flow.Renderer.Backends.CANVAS);

    newCtx = renderer.getContext();
    newCtx.clearRect(0, 0, canvas.width, canvas.height);
    stave = new Vex.Flow.Stave(10, 0, 500);
    stave.addClef("treble").setContext(newCtx).draw();

    notes = makeStaff(counter, theNotes);


    // Create a voice in 4/4
    voice = new Vex.Flow.Voice({
      num_beats: 4,
      beat_value: 4,
      resolution: Vex.Flow.RESOLUTION
    });
    console.log(voice)

    // Add notes to voice
    voice.addTickables(notes);

    // Format and justify the notes to 500 pixels
    formatter = new Vex.Flow.Formatter().
    joinVoices([voice]).format([voice], 500);

    // Render voice
    voice.draw(newCtx, stave);


  }

  // updateMeasure("C")



  //note flight stuff

  // 	NFClient.init(function(info) {
  //     	alert("Noteflight API is ready, version " + info.version);
  //   	});


  //   var options = {
  //     host: 'www.noteflight.com',
  //     width: 800,
  //     height: 400,
  //     hidePlaybackControls: false,
  //     viewParams: {
  //       scale: 1.5,
  //       role: 'template',
  //       app: 'html5'
  //     }
  //   }

  //   window.scoreView = new NFClient.ScoreView('score1', 'd482d5337aca77075c9a4329cdb1dbb0d6337ecb', options);
  //   console.log(scoreView)


  // function showScore(){
  // 	console.log (scoreView.getScore())
  // }



  //

  var drums = {
    kick: "x",
    snare: "o",
    close: "*",
    open: "-",
    rest: "\."
  }

  var drumKeys = Object.keys(drums)
  var oneCount = 0
  var twoCount = 0
  var threeCount = 0
  var fourCount = 0
  var fiveCount = 0
  var sixCount = 0
  var sevenCount = 0
  var eightCount = 0

  var changeDrums = function(num, counter) {
    jQuery("#" + num).click(function() {
      jQuery(this).text(drumKeys[counter++])
      editStr(num - 1, drums[drumKeys[counter - 1]])

      if (counter === drumKeys.length) counter = 0;
    });
  }

  changeDrums(1, oneCount);
  changeDrums(2, twoCount)
  changeDrums(3, threeCount)
  changeDrums(4, fourCount)
  changeDrums(5, fiveCount)
  changeDrums(6, sixCount)
  changeDrums(7, sevenCount)
  changeDrums(8, eightCount)


  //DOM EVENT EMITTERS
  stopPlaying();
  startPlaying();
  restartPlaying();
})

var drumStr = 'x*o-'

function editStr(idx, char) {
  var strArr = drumStr.split('')
  console.log(strArr)
  strArr[idx] = char;
  drumStr = strArr.join('')
  console.log(drumStr)
  drums.kill();
  drums = EDrums(drumStr);
}

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