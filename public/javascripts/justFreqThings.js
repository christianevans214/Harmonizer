var mic;
var fft;
var lowPass;


var doCenterClip = false;
var centerClipThreshold = 0.0;
var preNormalize = true;
var postNormalize = true;
var root = "A";
var drums;

var notesMap = {
	'A': [0, 2, 4, 6],
	'A#': [0, 3, 4, 6],
	'B': [1, 3, 5, 7],
	'C': [2, 4, 6, 8],
	'C#': [2, 4, 6, 8],
	'D': [3, 5, 7, 9],
	'D#': [3, 5, 7, 9],
	'E': [0, 2, 4, 6],
	'F': [5, 7, 9, 11],
	'F#': [3, 5, 7, 9],
	'G': [2, 4, 6, 8],
	'G#': [7, 9, 4, 6]
}

var newRoot = function(root) {
	// drums.kill();
	// Gibber.scale.root.seq([root+'4', noteStrings[noteStrings.indexOf(root)+5] + "4"],1)
	// console.log(notesMap)
	// a.chord.seq([notesMap[root]],1/8)
	// fm.note.seq(notesMap[root].rnd(), [1/4,1/8].rnd(1/16,2))
	// pluck.note.seq(notesMap[root].rnd(),[1/16,1/8].rnd())

	// drums = EDrums('x*o*x*o-')
	// drums.amp = .75
}

function setup() {
	mic = new p5.AudioIn();
	mic.start();


	lowPass = new p5.LowPass();
	lowPass.disconnect();
	mic.connect(lowPass);


	fft = new p5.FFT();
	fft.setInput(lowPass);

	setFrameRate(4);
}

var currentFreq = 130;

function noteFromPitch(frequency) {
	var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
	return Math.round(noteNum) + 69;
}

var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"];

var note;

function frequencyFromNoteNumber(note) {
	return 440 * Math.pow(2, (note - 69) / 12);
}

var curNote;

function draw() {
	//scroll follow
	if (playOption === "play") window.scrollTo(0, (document.body.scrollHeight+200));

	// nick's one-liner metronome (tm)
	jQuery('#metro').toggle()
		// console.log(new Date())
	var timeDomain = fft.waveform(2048, 'float32');
	var corrBuff = autoCorrelate(timeDomain);
	if (mic.getLevel() > 0.03) {
		hasSungFirstNote = true;
		console.log(mic.getLevel())
		var freq = findFrequency(corrBuff);
		note = noteFromPitch(freq);
		if (curNote === note) {
			console.log("on point")
			repeatedNote = true;
		} else {
			repeatedNote = false;
			curNote = note;
		}
		console.log("info on note", note, note / 12, Math.floor(note / 12));
		//throws whistling octave range (6,7,8) into staff (3,4,5) octave range
		if (playOption === "play" && hasSungFirstNote) {
			var octaveRange = Math.floor(note / 12);
			var originalOctave = Math.floor(note / 12);
			if (octaveRange === 6 || octaveRange === 7 || octaveRange === 8) {
				octaveRange = octaveRange - 3;
			}
			updateMeasure(noteStrings[note % 12], octaveRange, originalOctave)
		}
		note = noteFromPitch(freq);
		console.log(noteStrings[note % 12])
	} else {
		if (playOption === "play" && hasSungFirstNote) {
			updateMeasure(0, 0)
		}
	}
	//if there's a pause in your note singing, it'll stop repeating when you start again
	repeatedNote = false;

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