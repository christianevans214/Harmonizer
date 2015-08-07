jQuery(document).ready(function(){


	NFClient.init(function(info) {
    	alert("Noteflight API is ready, version " + info.version);
  	});


  var options = {
    host: 'www.noteflight.com',
    width: 800,
    height: 400,
    hidePlaybackControls: false,
    viewParams: {
      scale: 1.5,
      role: 'template',
      app: 'html5'
    }
  }

  window.scoreView = new NFClient.ScoreView('score1', 'd482d5337aca77075c9a4329cdb1dbb0d6337ecb', options);
  console.log(scoreView)


function showScore(){
	console.log (scoreView.getScore())
}


 
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