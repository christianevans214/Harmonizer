var mic;
var fft;


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
	lowPass = new p5.LowPass();
	fft = new p5.FFT();
	// lowPass.disconnect();
	// lowPass.setInput(mic);
	// fft.setInput(lowPass);
	// mic.connect(fft);

	mic.connect(lowPass);

	fft.setInput(lowPass);

	mic.start();
	// reverb.connect()

	// lowPass.connect("Master")

	// lowPass.connect()

	setFrameRate(4);
}

function makeMajorChord(freq) {
	osc.freq(freq * 1.25)
	osc2.freq(freq * 1.5)
}

function makeMinorChord(freq) {
	osc.freq(freq * 1.2)
	osc2.freq(freq * 1.5)
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

//runs 50-60 times per second (every 20-30 ms)
//could we throttle this?
var recalcAvg = function(newFreq, curAvg, count) {
	return (curAvg * count + newFreq) / (count + 1);
}
var curNote;

function draw() {
	// console.log(new Date())
	var timeDomain = fft.waveform(2048, 'float32');
	var corrBuff = autoCorrelate(timeDomain);
	if (mic.getLevel() > 0.01) {
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
		if (playOption === "play") updateMeasure(noteStrings[note % 12], Math.floor(note / 12))
		note = noteFromPitch(freq);
		console.log(noteStrings[note % 12])
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