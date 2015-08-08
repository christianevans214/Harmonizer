var playOption = "stop"
var isEditing = false;
//a boolean altered on justFreqThings file at lines 102/104 depending on whether note
//is a repeated one (sustained)
var repeatedNote = false;
var measureToReturn;
var measureCounter;
var editingMeasure;
var theNotes = [];
// var canvas;
jQuery(document).ready(function() {
  var renderer;
  var newCtx;
  var stave;
  var notes;
  var voice;
  var formatter;
  var counter = 0;
  //maybe the Notes should be an array of Objects with each object being like {note: ____, duration: _____, mathDur:____(fraction)}
  //{note: "b/4",duration: '8r', mathDur: .125}
  measureCounter = 1;
  //note durations as string. between half and dotted half, we'll need to split the notes into two. mathDur is .625 (half and eighth)
  var NOTE_DURATIONS = ["8", "q", 'qd', "h", 'hd', "w"];
  //the fraction value for all notes above. Note sure if we'll need this.
  var NOTE_MATH = [.125, .25, .375, .5, .75, 1];


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


  function makeStaff(repeatNote, noteCounter, notes) {
    //note needs to be a repeat but can't be repeating from previous measure.
    console.log("INFO INTAKE IN MAKE STAFF", notes[notes.length - 1], noteCounter, repeatNote);
    if (repeatNote && noteCounter > 1 && notes[notes.length - 1].duration !== "8r") {
      // console.log("NOTES IN MAKE STAFF", notes[notes.length - 1]);
      var notePitch = notes[notes.length - 1].note;
      var newNoteVal = notes[notes.length - 1].mathDur + notes[notes.length - 2].mathDur;
      // console.log(newNoteVal);
      //inner if/else statements to handle making new notes.
      //.625 is a half note and eighth note (.5 + .125)
      if (newNoteVal === .625) {
        var newHalfNote = {
          note: notePitch,
          duration: 'h',
          mathDur: .5
        }
        var newEighthNote = {
          note: notePitch,
          duration: '8',
          mathDur: .125
        }
        notes.splice(-2)
        notes.push(newHalfNote);
        notes.push(newEighthNote);
        //need to make createNotes function
        return createNotes(notes);
        //.875 is a dotted half note and eighth note (.75 + .125)
      } else if (newNoteVal === .875) {
        var newDottedHalf = {
          note: notePitch,
          duration: 'hd',
          mathDur: .75
        }
        var newEighthNote = {
          note: notePitch,
          duration: '8',
          mathDur: .125
        }
        notes.splice(-2);
        notes.push(newHalfNote);
        notes.push(newEighthNote);
        return createNotes(notes);
      } else {
        var newDuration = NOTE_DURATIONS[NOTE_MATH.indexOf(newNoteVal)];
        // console.log("NEW DURATION", newDuration)
        //in case this doesn't work how I hoped.
        if (newDuration === undefined) {
          // console.log("ERR WITH NOTE VAL", newNoteVal);
          throw new Error("problematic newNoteVal");
        }
        var newNote = {
          note: notePitch,
          duration: newDuration,
          mathDur: newNoteVal
        }
        notes.splice(-2);
        notes.push(newNote);
        return createNotes(notes);
      }

    } else {
      //not a repeat or first note. Just take all the notes, and tack rests onto the end with createNotes(notes)
      return createNotes(notes);
    }
  }

  // toReturn.push(new Vex.Flow.StaveNote({
  //         keys: [note],
  //         duration: noteCounter - 1 >= i ? "8" : "8r"
  //       }))
  function createNotes(noteArr) {
    var arrToReturn = [];
    var totalNotesMeasureVal = noteArr.reduce(function(curVal, nextNote) {
      return curVal + nextNote.mathDur;
    }, 0)
    var numOfEighthRests = (1 - totalNotesMeasureVal) / .125;
    // console.log("NOTE ARR", noteArr);
    // console.log("TOTAL NOTES MEASURE VAL", totalNotesMeasureVal);

    // console.log("NUM OF EIGHTH RESTS", numOfEighthRests);
    if (totalNotesMeasureVal > 1) {
      throw new Error("exceeding max measure values")
    }
    noteArr.forEach(function(note) {
      var noteToPush;
      var hasSharp = note.note.split('/')[0][note.note.split('/')[0].length - 1] === "#";
      var hasAccidental = note.duration[note.duration.length - 1] === "d";
      console.log("HAS SHARP", hasSharp);
      console.log("HAS ACCIDENTAL", hasAccidental);
      if (hasSharp) {
        noteToPush = new Vex.Flow.StaveNote({
          keys: [note.note],
          duration: note.duration
        }).addAccidental(0, new Vex.Flow.Accidental("#"))
      } else {
        noteToPush = new Vex.Flow.StaveNote({
          keys: [note.note],
          duration: note.duration
        })
      }
      if (hasAccidental) {
        noteToPush = noteToPush.addDotToAll()
      }
      arrToReturn.push(noteToPush);
    })
    for (var i = 0; i < numOfEighthRests; i++) {
      arrToReturn.push(new Vex.Flow.StaveNote({
        keys: ["b/4"],
        duration: "8r"
      }))
    }
    if (numOfEighthRests === 0) {
      counter = 0;
      theNotes = [];
      addNewMeasure(measureCounter);
      canvas = jQuery(".notesCanvas")[measureCounter++];
    }
    return arrToReturn;
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
    if (octave === 0 && note === 0) {
      jQuery(".pitch").text("[-]");
    } else {
      jQuery(".pitch").text("[" + note + "/" + octave + "]")
    }
    if (!octave) octave = "4";
    if (note === 0) theNotes.push({
      note: "b/4",
      duration: "8r",
      mathDur: .125
    })
    else {
      theNotes.push({
        note: note.toLowerCase() + "/" + octave + "",
        duration: '8',
        mathDur: .125
      })
    }
    counter++
    renderer = new Vex.Flow.Renderer(canvas,
      Vex.Flow.Renderer.Backends.CANVAS);

    newCtx = renderer.getContext();
    newCtx.clearRect(0, 0, canvas.width, canvas.height);
    stave = new Vex.Flow.Stave(10, 0, 500);
    stave.addClef("treble").setContext(newCtx).draw();


    //here's where we make the notes...maybe around here we can invoke an optional new function if the pitch is the same?
    notes = makeStaff(repeatedNote, counter, theNotes);

    // console.log(notes);
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


  //DOM EVENT EMITTERS
  stopPlaying();
  startPlaying();
  restartPlaying();
  clickToEdit();
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
    console.log("PLAY OPTION", playOption);
  })
}

function startPlaying() {
  jQuery('.play').on('click', function() {
    playOption = "play";
    console.log("PLAY OPTION", playOption);
  })
}

function restartPlaying() {
  jQuery('.restart').on('click', function() {
    restartSong();
    console.log("PLAY OPTION", playOption);
  })
}

// function clickToEdit() {
//   jQuery("#sheet").on('click', ".notesCanvas", function() {
//     console.log("ID", this.id);
//     measureToReturn = measureCounter;
//     repeatedNote = false;
//     editingMeasure = this.id;
//     measureCounter = this.id;
//     canvas = jQuery('.notesCanvas')[this.id];
//     console.log("EDIT CANVAS", canvas);
//     console.log
//     isEditing = true;
//     counter = 0;
//     theNotes = [];
//   })
// }