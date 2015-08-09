var playOption = "stop"
var isEditing = false;
//a boolean altered on justFreqThings file at lines 102/104 depending on whether note
//is a repeated one (sustained)
var repeatedNote = false;
var measureToReturn;
var measureCounter;
var editingMeasure;
var theNotes = [];
jQuery(document).ready(function() {
  var renderer;
  var newCtx;
  var stave;
  var notes;
  var voice;
  var formatter;
  //Count for the current note we're on in each measure. Not sure I use it for anything other than to check for first note in measure (in makeStaff)
  var counter = 0;
  //the current measure we're on
  measureCounter = 1;


  //note durations as string. between half and dotted half, we'll need to split the notes into two. mathDur is .625 (half and eighth)
  var NOTE_DURATIONS = ["8", "q", 'qd', "h", 'hd', "w"];
  //the fraction value for all notes above. Note sure if we'll need this.
  var NOTE_MATH = [.125, .25, .375, .5, .75, 1];


  var canvas = jQuery(".notesCanvas")[0];
  console.log(canvas);

  jQuery('#tempo').on('change', function(){
    var tempo = jQuery(this)[0].value
    setFrameRate(tempo/30)
  })
  
  //Function to prepare all the notes for creation in next function (createNotes())
  //Does a lot of stupid if/else checks to see if the new note coming in is a repeat, and if it is --
  //it'll do some calculations to combine it with the previous note.
  function makeStaff(repeatNote, noteCounter, notes) {
    //note needs to be a repeat but can't be repeating from previous measure.
    console.log("INFO INTAKE IN MAKE STAFF", notes[notes.length - 1], noteCounter, repeatNote);
    if (repeatNote && noteCounter > 1 && notes[notes.length - 1].duration !== "8r") {
      var notePitch = notes[notes.length - 1].note;
      var newNoteVal = notes[notes.length - 1].mathDur + notes[notes.length - 2].mathDur;


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


        //.875 is a dotted half note and eighth note (.75 + .125). This checks if we hit that case.
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

        //How to combine repeated notes if not either of above
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
      //Else to outer if/else (note not repeated)...it'll just go on and create notes.
      //not a repeat or first note. Just take all the notes, and tack rests onto the end with createNotes(notes)
      return createNotes(notes);
    }
  }


  //The function that turns an array of note objects into Vex.Flow.StaveNotes
  function createNotes(noteArr) {
    //this will be the array of Vex.Flow.StaveNotes that are returned.
    var vexFlowArray = [];

    //The actual number of notes for a measure (returns a fraction out of 1 e.g. 0.5/1.0 means half the measure has notes)
    var totalNotesMeasureVal = noteArr.reduce(function(curVal, nextNote) {
      return curVal + nextNote.mathDur;
    }, 0)

    //This returns the number of eighth rests will be needed to fill the measure (.125 is 1/8)
    var numOfEighthRests = (1 - totalNotesMeasureVal) / .125;

    //If for some reason the math is wrong, it throws an error for diagnostic reasons.
    if (totalNotesMeasureVal > 1) {
      throw new Error("exceeding max measure values")
    }

    //Loops through the note array, checks if it has a sharp or accidental, and creates a complete Vex.Flow.StaveNote for each;
    noteArr.forEach(function(note) {
      var noteToPush;
      var hasSharp = note.note.split('/')[0][note.note.split('/')[0].length - 1] === "#";
      var hasAccidental = note.duration[note.duration.length - 1] === "d";

      //creates initial vex.flow.stavenote
      noteToPush = new Vex.Flow.StaveNote({
          keys: [note.note],
          duration: note.duration
        })
        //if it has a sharp, it'll add the sharp
      if (hasSharp) {
        noteToPush.addAccidental(0, new Vex.Flow.Accidental("#"))
      }
      //if it has an accidental, it'll add a dot.
      if (hasAccidental) {
        noteToPush = noteToPush.addDotToAll();
      }
      //push to an array that will finally be returned, and used to create a new measure or "voice" in VexFlow terms;
      vexFlowArray.push(noteToPush);
    })

    //'For' loop that fills the final vexFlowArray with enough eighth rests so that it can make a voice.
    for (var i = 0; i < numOfEighthRests; i++) {
      vexFlowArray.push(new Vex.Flow.StaveNote({
        keys: ["b/4"],
        duration: "8r"
      }))
    }

    //FInally, if there are no eighth rests, it means we've filled a measure with all notes from singing, and it's time to start a new
    //measure...set note counter back to 0, empty note array, create a new measure, and increment the canvas we're on.
    if (numOfEighthRests === 0) {
      counter = 0;
      theNotes = [];
      //If currently in editing mode, it'll set isEditing to false to end the cycle, return the measureCounter to where it was BEFORe
      //editing, and select the last canvas in the div.
      if (isEditing) {
        isEditing = false;
        measureCounter = measureToReturn;
        canvas = jQuery(".notesCanvas")[measureCounter - 1];
        playOption = "stop";
      } else {
        addNewMeasure(measureCounter);
        canvas = jQuery(".notesCanvas")[measureCounter++];
      }
    }

    //returns the vexFlowArray we added all the vex stavenotes to.
    return vexFlowArray;
  }

  //Function that creates a new measure and appends to the #sheet div.
  function addNewMeasure(measureCounter) {
    var canvas = document.createElement('canvas');
    canvas.width = 511;
    canvas.height = 125;
    canvas.className = "notesCanvas";
    canvas.id = String(measureCounter);
    var sheetDiv = document.getElementById("sheet");
    sheetDiv.appendChild(canvas);

  }

  //Function to edit the measure. CAN ONLY BE RUN IF YOu'RE NOT RECORDING FIRST.
  //It'll start playing, allow you to re-sing the measure, and when you're done it'll stop the recording.
  //Works by setting the measureCounter to the id of the canvas clicked, while saving the measureToReturn for later use.
  window.editMeasure = function(id) {
    playOption = "play";
    isEditing = true;
    measureToReturn = measureCounter;
    measureCounter = id;
    theNotes = [];
    counter = 0;
    canvas = jQuery(".notesCanvas")[measureCounter];
  }

  //If restart button is hit, this function is called. It will reset like...everything...and empty the #sheet div except for one new canvas
  window.restartSong = function() {
    measureCounter = 0;
    theNotes = [];
    counter = 0;
    playOption = "stop";
    jQuery('#sheet').empty();
    addNewMeasure(measureCounter);
    canvas = jQuery(".notesCanvas")[measureCounter++];

  }

  //Function that does voice/canvas rendering and adds pitch to HTML (Should probably be separated at some point)
  window.updateMeasure = function(note, octave, actualOctave) {
    
    //If/else statement to set the pitch on the page
    if (octave === 0 && note === 0) {
      jQuery(".pitch").text("[-]");
    } else {
      jQuery(".pitch").text("[" + note + "/" + actualOctave + "]")
    }

    //If for some reason no octave is give, set it equal to 4...Don't know why it would happen but hey it's a good catch and makes function
    //more robust
    if (!octave) octave = "4";

    //If a rest is registered (no singing),  0 note and 0 octave values are sent to this function. We use that to push a rest note.
    if (note === 0) {
      theNotes.push({
          note: "b/4",
          duration: "8r",
          mathDur: .125
        })
        //If a note is registered, push that note to theNotes and keep on chuggin along function
    } else {
      theNotes.push({
        note: note.toLowerCase() + "/" + octave + "",
        duration: '8',
        mathDur: .125
      })
    }
    //increments the note counter (let's us know what note we're on)
    counter++

    //creates a renderer for Vex.Flow Canvas
    renderer = new Vex.Flow.Renderer(canvas,
      Vex.Flow.Renderer.Backends.CANVAS);

    //Gets canvas to play with
    newCtx = renderer.getContext();
    //Clears the canvas everytime before we re-create it for measure editing
    newCtx.clearRect(0, 0, canvas.width, canvas.height);

    //Makes new stave, adds treble clef
    stave = new Vex.Flow.Stave(10, 0, 500);
    stave.addClef("treble").setContext(newCtx).draw();


    //Makes the notes we use to add to voice (uses makeStaff, createNotes, and addNewMeasure functions above)
    notes = makeStaff(repeatedNote, counter, theNotes);

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
  //These will be for clickable events
  stopPlaying();
  startPlaying();
  restartPlaying();
  clickToEdit();
})


//DOM EVENT EMITTERS DEFINED

//Stop Button
function stopPlaying() {
  jQuery('.stop').on('click', function() {
    playOption = "stop";
    console.log("PLAY OPTION", playOption);
  })
}

//Start Button
function startPlaying() {
  jQuery('.play').on('click', function() {
    playOption = "play";
    console.log("PLAY OPTION", playOption);
  })
}

//Restart Button
function restartPlaying() {
  jQuery('.restart').on('click', function() {
    restartSong();
    console.log("PLAY OPTION", playOption);
  })
}

//Click on an individual canvas box. IF you're not recording it'll allow you to edit a certain measure.
function clickToEdit() {
  jQuery("#sheet").on('click', ".notesCanvas", function() {
    console.log("ID", this.id);
    if (playOption === "stop") editMeasure(this.id);
  })
}