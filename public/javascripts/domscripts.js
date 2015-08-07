jQuery(document).ready(function(){
	var canvas;
	var renderer;
	var newCtx;
	var stave;
	var notes;
	var voice;
	var formatter;
	var counter=0;
	var theNotes = [];
	var measureCounter = 0;


var canvas = jQuery(".notesCanvas")[0];
console.log(canvas);

window.updateMeasure = function(note, octave){
	console.log(note, octave);
	if(!octave) octave = "4";
	theNotes.push(note.toLowerCase() + "/" + octave + "")
	counter ++
	renderer = new Vex.Flow.Renderer(canvas,
    Vex.Flow.Renderer.Backends.CANVAS);

  newCtx = renderer.getContext();
	  newCtx.clearRect(0, 0, canvas.width, canvas.height);
   stave = new Vex.Flow.Stave(10, 0, 500);
 stave.addClef("treble").setContext(newCtx).draw();
if (counter == 0){
  notes = [
  	new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr"}),
  		new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr"}),
  			new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr"}),
  				new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr"})
  	]
  }

  if (counter == 1){
  	  notes = [
  	new Vex.Flow.StaveNote({ keys: [theNotes[0]], duration: "q"}),
  		new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr"}),
  			new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr"}),
  				new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr"})
  	]
  }

   if (counter == 2){
  	  notes = [
  	new Vex.Flow.StaveNote({ keys: [theNotes[0]], duration: "q"}),
  		new Vex.Flow.StaveNote({ keys: [theNotes[1]], duration: "q"}),
  			new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr"}),
  				new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr"})
  	]
  }


   if (counter == 3){
  	  notes = [
  	new Vex.Flow.StaveNote({ keys: [theNotes[0]], duration: "q"}),
  		new Vex.Flow.StaveNote({ keys: [theNotes[1]], duration: "q"}),
  			new Vex.Flow.StaveNote({ keys: [theNotes[2]], duration: "q"}),
  				new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr"})
  	]
  }
   if (counter == 4){
  	  notes = [
  	new Vex.Flow.StaveNote({ keys: [theNotes[0]], duration: "q"}),
  		new Vex.Flow.StaveNote({ keys: [theNotes[1]], duration: "q"}),
  			new Vex.Flow.StaveNote({ keys: [theNotes[2]], duration: "q"}),
  				new Vex.Flow.StaveNote({ keys: [theNotes[3]], duration: "q"})
  	]

  	counter = 0;
  	theNotes = [];
  	canvas = jQuery(".notesCanvas")[++measureCounter];
  
  }





  // Create the notes

  //  notes = [
  //   // A quarter-note C.
  //   new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q" }),

  //   // A quarter-note D.
  //   new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "q" }),

  //   // A quarter-note rest. Note that the key (b/4) specifies the vertical
  //   // position of the rest.
  //   new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr" }),

  //   // A C-Major chord.
  //   new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
  // ];

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

updateMeasure("C")
        


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

	var changeDrums = function(num,counter){
		jQuery("#"+num).click(function(){
			jQuery(this).text(drumKeys[counter++])
			editStr(num-1,drums[drumKeys[counter-1]])
		
		if (counter === drumKeys.length) counter = 0;
		});
	}

	changeDrums(1,oneCount);
	changeDrums(2,twoCount)
	changeDrums(3,threeCount)
	changeDrums(4,fourCount)
	changeDrums(5,fiveCount)
	changeDrums(6,sixCount)
	changeDrums(7,sevenCount)
	changeDrums(8,eightCount)
})

var drumStr = 'x*o-'
function editStr(idx,char){
	var strArr = drumStr.split('')
	console.log(strArr)
	strArr[idx] = char;
	drumStr = strArr.join('')
	console.log(drumStr)
	drums.kill();
	drums = EDrums(drumStr);
}