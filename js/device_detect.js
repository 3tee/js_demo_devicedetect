//在此之前，需引用3tee的js sdk包，然后在此处进行变量调用
var AVDEngine = ModuleBase.use(ModulesEnum.avdEngine);
var avdEngine = new AVDEngine();

//获取页面元素对象
var checkVideo = document.getElementById("checkVideo");
var checkAudio = document.getElementById("checkAudio");
var localLevel = document.getElementById("audioLevel");
var hasVideo = document.getElementById("hasVideo");
var hasAudio = document.getElementById("hasAudio");
var videoList = document.getElementById("videoList");
var audioList = document.getElementById("audioList");

//检测是否有设备
function checkHasDevice() {
	avdEngine.checkDevice().then(checkHasDeviceResult).otherwise(alertError);
}

function checkHasDeviceResult(result) {
	if(result.video){//值为true或false
		hasVideo.innerHTML = "有";
	} else {
		hasVideo.innerHTML = "无";
	}
	
	if(result.audio){//值为true或false
		hasAudio.innerHTML = "有";
	} else {
		hasAudio.innerHTML = "无";
	}
	
	//还会返回result.speaker这个值，true表示有扬声器设备
	console.log("has video:" + result.video);
	console.log("has audio:" + result.audio);
	console.log("has speaker:" + result.speaker);
}

//获取设备列表，并显示在页面上
function getDeviceList() {
	avdEngine.getDeviceObject().then(showDevices).otherwise(alertError);
}

function showDevices(deviceObject) {
	videoList.innerHTML = null;//清空list
	audioList.innerHTML = null;
	
	var video = deviceObject.video;//video对象，key value分别是deviceId和deviceName
	var audio = deviceObject.audio;//audio对象，key value分别是deviceId和deviceName
	for(var key in video) {
		var option = document.createElement("option");
		option.value = key;
		option.text = video[key];
		videoList.appendChild(option);
	}

	for(var key in audio) {
		var option = document.createElement("option");
		option.value = key;
		option.text = audio[key];
		audioList.appendChild(option);
	}
	
	if(videoList.length > 0){
		videoList.style.display = "inline";//存在摄像头，显示下拉框
	}
	if(audioList.length > 0){
		audioList.style.display = "inline";
	}
}

function changeVideo() {//checkCloseVideo，此函数会关闭之前最后一次打开的video流
	checkCloseVideo();//关闭流，否则打开另一路流以后无法关闭
}

function changeAudio() {//checkCloseAudio，此函数会关闭之前最后一次打开的audo流
	checkCloseAudio();//关闭流，否则打开另一路流以后无法关闭
}

function refreshDevice() {//更新设备，再调用一次getDeviceObject即可
	avdEngine.getDeviceObject().then(showDevices).otherwise(alertError);
}

//检测视频正常打开关闭
function checkOpenVideo() {//视频打开
	var videoId = videoList.value;//获取videoId，打开对应的摄像头。如果为空，sdk会打开其中一个摄像头
	avdEngine.checkOpenVideo(videoId).then(showVideo).otherwise(alertError);
}

function showVideo(stream) {//页面上把显示video流
	attachMediaStream(checkVideo, stream);
}

function checkCloseVideo() {//视频关闭
	avdEngine.checkCloseVideo();
	attachMediaStream(checkVideo, null);//页面上清空video元素
}

//检测音频正常打开关闭
function checkOpenAudio() {//音频打开
	var audioId = audioList.value;//获取audioId，打开对应的摄像头。如果为空，sdk会打开其中一个麦克风
	//avdEngine.checkCloseAudio();//先关闭再打开
	avdEngine.checkOpenAudio(audioId).then(showAudio).otherwise(alertError);
}

function showAudio(stream) {
	attachMediaStream(checkAudio, stream);
	if(stream) {
		localLevel.style.display = 'inline';
		var localCollector = new LocalStatsCollector(stream, 1000, showAudioLevel);//获取音量值，showAudioLevel函数是callback
		localCollector.start();
	}
}

function showAudioLevel(audioLevel) {//显示音量值
	localLevel.innerHTML = "音量值(阈值0-1):" + audioLevel;
}

function checkCloseAudio() {//音频关闭
	avdEngine.checkCloseAudio();
	attachMediaStream(checkAudio, null);//页面上清空audio元素
	localLevel.style.display = 'none';
}


//统一错误处理，把错误alert出来
function alertError(error) {
	alert("code:" + error.code + " ;  message:" + error.message);
}