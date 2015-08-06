var mic;
var fft;


var doCenterClip = false;
var centerClipThreshold = 0.0;
var preNormalize = true;
var postNormalize = true;
var root = "A";
var drums;

var notesMap = {
	'A': [0,2,4,6],
	'A#': [0,3,4,6],
	'B': [1,3,5,7],
	'C': [2,4,6,8],
	'C#': [2,4,6,8],
	'D': [3,5,7,9],
	'D#': [3,5,7,9],
	'E': [4,6,1,3],
	'F': [6,7,9,4],
	'F#': [4,6,1,3],
	'G': [7,9,4,6],
	'G#':[7,9,4,6]
}

var newRoot = function(root){
	// drums.kill();
	// Gibber.scale.root.seq([root+'4', noteStrings[noteStrings.indexOf(root)+5] + "4"],1)
	// console.log(notesMap)
	// a.chord.seq([notesMap[root]],1/8)
	fm.note.seq(notesMap[root].rnd(), [1/4,1/8].rnd(1/16,2))
	pluck.note.seq(notesMap[root].rnd(),[1/16,1/8].rnd())

	// drums = EDrums('x*o*x*o-')
	// drums.amp = .75
}
function setup() {
	// uncomment this line to make the canvas the full size of the window
	// createCanvas(windowWidth, windowHeight);

  	Gibber.scale.mode.seq(['Dorian'])
	Gibber.scale.root.seq(['A3'],1)
	// drums = EDrums('x***o**x*x*xo-*-')
	reverb = new p5.Reverb();
  	gain = Gain({ amp: 1 })

	a = new FM({maxVoices:4,amp:.8})
	delay = Delay()
	fm = new FM( 'bass' );
	fm.fx.add(gain)

	pluck = Pluck();
	pluck.fx.add(Reverb(),Delay())


	b= LPF();
	a.fx.add(b, Reverb())
	// b = FM('bass')

	newRoot(root);
	createCanvas(windowWidth, windowHeight);
	mic = new p5.AudioIn();

	// lowPass = new p5.LowPass();
	// lowPass.disconnect();
	// mic.connect(reverb);

	// reverb.connect()

	// lowPass.connect("Master")

	// lowPass.connect()
	// osc3 = new p5.Oscillator();
 //  	osc3.setType('sine');
 //  	osc3.amp(0.5);
 //  	osc3.start();

	// osc = new p5.Oscillator();
 //  	osc.setType('sine');
 //  	osc.amp(0.3);
 //  	osc.start();
 //  	osc.freq(0);

	// osc2 = new p5.Oscillator();
	// osc2.setType('sine');
 //  	osc2.amp(0.3);
 //  	osc2.start();

	fft = new p5.FFT();
	fft.setInput(mic);
	// peakDetect = new p5.PeakDetect();
	mic.start();
	setFrameRate(4);
}

function makeMajorChord(freq){
	osc.freq(freq*1.25)
	osc2.freq(freq*1.5)
}

function makeMinorChord(freq){
	osc.freq(freq* 1.2)
	osc2.freq(freq * 1.5)
}
var currentFreq = 130;

	function noteFromPitch( frequency ) {
		var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
		return Math.round( noteNum ) + 69;
	}

	var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"];

	var note;

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

//runs 50-60 times per second (every 20-30 ms)
//could we throttle this?
var recalcAvg = function(newFreq, curAvg, count){
	return (curAvg * count + newFreq)/(count + 1);
}
var curNote;
function draw() {
		// drums.amp = mic.getLevel();
	// var freqs = fft.analyze();
	// // console.log(Math.max.apply(null,fft.analyze()));
	// var maxPoints = []
	// freqs.forEach(function(elem,index){
	// 	if (elem > 200){
	// 		maxPoints.push([elem,index])
	// 	}
	// })
	// var allOsc = [osc,osc2,osc3]
	// console.log(maxPoints)
	// if (maxPoints.length > 0){
	// 	allOsc.forEach(function(elem,index){
	// 		elem.freq(maxPoints[index][0])
	// 	})
	// }	

	// console.log(maxPoints)
	// console.log(maxPoints.length);

	background(200);
	var timeDomain = fft.waveform(2048, 'float32');
	var corrBuff = autoCorrelate(timeDomain);
	if (mic.getLevel()>0.13) {
	var freq = findFrequency(corrBuff);
	note = noteFromPitch(freq);
	if(curNote=== note){
		console.log("on point")
	}else{
		console.log( noteStrings[note%12] )
		newRoot(noteStrings[note%12]);
		curNote = note;
	}
	beginShape();
	for (var i = 0; i < corrBuff.length; i++) {
		var w = map(i, 0, corrBuff.length, 0, width);
		var h = map(corrBuff[i], -1, 1, height, 0);
		curveVertex(w, h);
	}
	endShape();

	fill(0);
	text('Center Clip: ' + centerClipThreshold, 20, 20);
	line(0, height / 2, width, height / 2);
	// osc.freq(freq*1.5);
	// osc2.freq(freq*1.2);
	console.log(mic.getLevel())
	text('Fundamental Frequency: ' + freq.toFixed(2), 20, 50);
	note =  noteFromPitch(freq);
	// osc.freq(frequencyFromNoteNumber(note));
	console.log( noteStrings[note%12] )

	}

}


// accepts a timeDomainBuffer and multiplies every value
function autoCorrelate(timeDomainBuffer) {

	var nSamples = timeDomainBuffer.length;

	// pre-normalize the input buffer
	if (preNormalize) {
		timeDomainBuffer = normalize(timeDomainBuffer);
	}

	// zero out any values below the centerClipThreshold
	if (doCenterClip) {
		timeDomainBuffer = centerClip(timeDomainBuffer);
	}

	var autoCorrBuffer = [];
	for (var lag = 0; lag < nSamples; lag++) {
		var sum = 0;
		for (var index = 0; index < nSamples; index++) {
			var indexLagged = index + lag;
			if (indexLagged < nSamples) {
				var sound1 = timeDomainBuffer[index];
				var sound2 = timeDomainBuffer[indexLagged];
				var product = sound1 * sound2;
				sum += product;
			}
		}

		// average to a value between -1 and 1
		autoCorrBuffer[lag] = sum / nSamples;
	}

	// normalize the output buffer
	if (postNormalize) {
		autoCorrBuffer = normalize(autoCorrBuffer);
	}

	return autoCorrBuffer;
}


// Find the biggest value in a buffer, set that value to 1.0,
// and scale every other value by the same amount.
function normalize(buffer) {
	var biggestVal = 0;
	var nSamples = buffer.length;
	for (var index = 0; index < nSamples; index++) {
		if (abs(buffer[index]) > biggestVal) {
			biggestVal = abs(buffer[index]);
		}
	}
	for (var index = 0; index < nSamples; index++) {

		// divide each sample of the buffer by the biggest val
		buffer[index] /= biggestVal;
	}
	return buffer;
}

// Accepts a buffer of samples, and sets any samples whose
// amplitude is below the centerClipThreshold to zero.
// This factors them out of the autocorrelation.
function centerClip(buffer) {
	var nSamples = buffer.length;

	// center clip removes any samples whose abs is less than centerClipThreshold
	// centerClipThreshold = map(mouseY, 0, height, 0, 1);

	if (centerClipThreshold > 0.0) {
		for (var i = 0; i < nSamples; i++) {
			var val = buffer[i];
			buffer[i] = (Math.abs(val) > centerClipThreshold) ? val : 0;
		}
	}
	return buffer;
}

// Calculate the fundamental frequency of a buffer
// by finding the peaks, and counting the distance
// between peaks in samples, and converting that
// number of samples to a frequency value.
function findFrequency(autocorr) {

	var nSamples = autocorr.length;
	var valOfLargestPeakSoFar = 0;
	var indexOfLargestPeakSoFar = -1;

	for (var index = 1; index < nSamples; index++) {
		var valL = autocorr[index - 1];
		var valC = autocorr[index];
		var valR = autocorr[index + 1];

		var bIsPeak = ((valL < valC) && (valR < valC));
		if (bIsPeak) {
			if (valC > valOfLargestPeakSoFar) {
				valOfLargestPeakSoFar = valC;
				indexOfLargestPeakSoFar = index;
			}
		}
	}

	var distanceToNextLargestPeak = indexOfLargestPeakSoFar - 0;

	// convert sample count to frequency
	var fundamentalFrequency = sampleRate() / distanceToNextLargestPeak;
	return fundamentalFrequency;
}