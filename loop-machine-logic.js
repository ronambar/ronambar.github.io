var padsDict = { 
    "APad":{state : "off",audioId : "AAudio", isWaiting : false, delayTime : -1, lastClickedTime : 0},
    "BPad":{state : "off",audioId : "BAudio", isWaiting : false, delayTime : -1, lastClickedTime : 0},
    "CPad":{state : "off",audioId : "CAudio", isWaiting : false, delayTime : -1, lastClickedTime : 0},
    "DPad":{state : "off",audioId : "DAudio", isWaiting : false, delayTime : -1, lastClickedTime : 0},
    "EPad":{state : "off",audioId : "EAudio", isWaiting : false, delayTime : -1, lastClickedTime : 0},
    "FPad":{state : "off",audioId : "FAudio", isWaiting : false, delayTime : -1, lastClickedTime : 0},
    "GPad":{state : "off",audioId : "GAudio", isWaiting : false, delayTime : -1, lastClickedTime : 0},
    "HPad":{state : "off",audioId : "HAudio", isWaiting : false, delayTime : -1, lastClickedTime : 0},
    "IPad":{state : "off",audioId : "IAudio", isWaiting : false, delayTime : -1, lastClickedTime : 0},
};


var playButtonId = "playButton";
var stopButtonId = "stopButton";
var recButtonId = "recButton";
var playRecordingButtonId = "playRecording";

var musicSynchronizer = {startPlayingTime : 0, numOfPadsPlaying : 0, loopInterval : 0};

var loopRecorder = { 
    isRecording : false,
    startTime : 0,
    actionsLoop : new Array()// {buttonId : padId, clickedTime : 0, delayTime : 0, isWaiting : isWaiting};
};

var recordPlayer = {
    stopedPlayingRecordingTime : 0,
    startPlayingRecordingTime : 0,
}

var musicStoper = {isStoped : false,lastClickedTime : 0} ;

function isPlayRecording(){
    
    return recordPlayer.startPlayingRecordingTime > recordPlayer.stopedPlayingRecordingTime ;
}

function recButtonClicked(){
   
var recButton = document.getElementById(recButtonId);
var playRecordingButton = document.getElementById(playRecordingButtonId);
    if(loopRecorder.isRecording == false)
    {
        loopRecorder.isRecording = true;
        changeButtonTextAndColor(recButtonId, "Stop Recording", "red");
        booleanChangeButtonVisibility(playRecordingButtonId,false);// = "hidden";
        startRecord();
    } 
    else
    {
        loopRecorder.isRecording = false;
        changeButtonTextAndColor(recButtonId, "Record", "blue");
        booleanChangeButtonVisibility(playRecordingButtonId,true);
        endRecord();
    }
}

function startRecord(){
    loopRecorder.actionsLoop = new Array();
    loopRecorder.startTime = new Date().getTime();
    var index = 0;
    var currWaitingStatus = false;
    for (var padId in padsDict){
        if(padsDict[padId].state == "on")
        {
            index = getRecAtionLoopLen();
            currWaitingStatus = padsDict[padId].isWaiting;
            var padSound = document.getElementById(padsDict[padId].audioId);
            var delayTime = -1;
            
            if(isAudioPlaying(padSound) == true)
            {
                delayTime = padSound.currentTime * 1000; 
            }
            
            
            loopRecorder.actionsLoop[index] = 
                {buttonId : padId ,clickedTime : 0, delayTime : delayTime, isWaiting : currWaitingStatus};
        }
    }
}

function isAudioPlaying(audioToCheck){
    return !audioToCheck.paused;
}

function endRecord(){
   // loopRecorder.isRecording = false;
    var index = getRecAtionLoopLen();
    var timeOut = getCurrentRecTimeOffset();
    loopRecorder.actionsLoop[index] = {buttonId : stopButtonId, clickedTime : timeOut, delayTime : -1, isWaiting : false };
    loopRecorder.startTime = 0;
    stopClicked(false);
}
    
function getCurrentRecTimeOffset(){
    var timeToReturn =  new Date().getTime() - loopRecorder.startTime;
    return timeToReturn;
}

function updateRecorder(buttonId){
    index = getRecAtionLoopLen();
    time = getCurrentRecTimeOffset();
    loopRecorder.actionsLoop[index] = 
                {buttonId : buttonId ,clickedTime : time, delayTime: -1, isWaiting : false, lastClickedTime : 0};
}

function getRecAtionLoopLen(){
    return loopRecorder.actionsLoop.length;
}

function playRecording(){
    
    if(isPlayRecording() == false)
    {
        startPlayRecording();
    }
    else
    {
        stopPlayRecording();
    }
    
}

function startPlayRecording(){
    
    recordPlayer.startPlayingRecordingTime = new Date().getTime();
    changeButtonTextAndColor(playRecordingButtonId, "Stop Playig", "red");
    changeAllPadsDisabledState()
    
    resetAllPads();
    setAllStartingPads();
    reproductionAllOnNonWaitingPads();
    reproductionAllWaitingPads();
    
    var actionsArr= loopRecorder.actionsLoop;
    var lastActionIndex = getRecAtionLoopLen();
    for (var i in actionsArr){
        var currButtonId = actionsArr[i].buttonId;   
        var currTimeOut = actionsArr[i].clickedTime;
        
        if( i == lastActionIndex-1)      // last play recording action -> stop() action 
        {
            finishPlayRecordingWithTimeOut(currTimeOut);
        }
        else if(currTimeOut != 0)
        {
            playButtonByIdWithTimeOut(currButtonId,currTimeOut);
        }   
    }
    
}

function stopPlayRecording(){
    
    changeButtonTextAndColor(playRecordingButtonId, "playRecording", "blue");
    recordPlayer.stopedPlayingRecordingTime = new Date().getTime();
    stopClicked(false);
}

function setAllStartingPads(){
    var actionsArr= loopRecorder.actionsLoop;
    
    for (var i in actionsArr){
        if (actionsArr[i].clickedTime == 0) // stating action
        {
            updatePadsDictByRecAction(actionsArr[i]);
        }
        else
        {
            break;
        }
    }
}
    
function updatePadsDictByRecAction(recAction){
    var padId = recAction.buttonId;
    
    padsDict[padId].state = "on";
    padsDict[padId].isWaiting = recAction.isWaiting;
    padsDict[padId].delayTime = recAction.delayTime;
    padsDict[padId].lastClickedTime = new Date().getTime();
}

function playButtonByIdWithTimeOut(buttonId,timeOut){
    
    var currTime = new Date().getTime();
    setTimeout(function(){playButtonById(buttonId,currTime)},timeOut);
}

function finishPlayRecordingWithTimeOut(timeOut){
    
    var currTime = new Date().getTime();
    setTimeout(function(){finisPlayRecording(currTime)},timeOut);
}

function finisPlayRecording(calledTime){
    
    if(recordPlayer.startPlayingRecordingTime > calledTime ||
      recordPlayer.stopedPlayingRecordingTime > calledTime)
    {
        return;
    }
        
    stopPlayRecording();
}

function playButtonById(buttonId,calledTime){
   
    if(recordPlayer.startPlayingRecordingTime > calledTime ||
      recordPlayer.stopedPlayingRecordingTime > calledTime){
        return;
    }
    if(buttonId == playButtonId) 
       {
           playClicked();
       }
    else if(buttonId == stopButtonId)
        {
            stopClicked(true);
        }
    else    // Pad button
        {
            padClicked(buttonId);
        }
}

function padClicked(padId) {
    musicStoper.isStoped = false;
    
    if(loopRecorder.isRecording == true){
            updateRecorder(padId);
    }
    
    var currPad = document.getElementById(padId);
    var mySound = document.getElementById(padsDict[padId].audioId);
   
    if(padsDict[padId].state == "off")
    {
        setPadState(padId,"on");
        syncedPlay(padId);
   } 
    else
    {
        setPadState(padId,"off");
        syncedPause(padId);
    }
}

function updateClickedTimeByButtonId(buttonId){
   var timetToUpdate = new Date().getTime();
    
    if(buttonId == stopButtonId){
        musicStoper.lastClickedTime = timetToUpdate;
    }
    else
    {
        padsDict[buttonId].lastClickedTime = timetToUpdate;
    }
}

function setPadState(padId,newState){
    
    var currPad = document.getElementById(padId);
    if(newState == "off")
    {
        currPad.style.backgroundColor = "blue";
    }
    else
    {
        currPad.style.backgroundColor = "red";
        updateClickedTimeByButtonId(padId);
    }
   
    padsDict[padId].state = newState;
}

function syncedPlay(padId){
    
    var mySound = document.getElementById(padsDict[padId].audioId);
    mySound.loop = true; 
    if(musicSynchronizer.numOfPadsPlaying == 0){
        setMusicSynchronizer(mySound);
        mySound.play();
    }
    else
    {
        padsDict[padId].isWaiting = true ;
        var timeOut = getCurrentSynchronizationTimeOut();
        if (timeOut != 0)
        {
            setTimeout(function(){playIfNotStopedYet(padId,mySound)},timeOut);
        }
        else
        {
            playIfNotStopedYet(padId,mySound);
        }
    }
}

function getCurrentSynchronizationTimeOut(){
    var currTime = new Date().getTime();
    var timeOut = musicSynchronizer.loopInterval -  (currTime - musicSynchronizer.startPlayingTime) % musicSynchronizer.loopInterval;
    
    return timeOut;
}

function playIfNotStopedYet(padId,mySound){
    
    if(isPadStillNeedToPlay(padId))
    {
        padsDict[padId].isWaiting = false;
        playAndIncNumOfPeds(mySound);
    }
}

function playAndIncNumOfPeds(soundToPlay){
    musicSynchronizer.numOfPadsPlaying += 1;
    //alert("after += 1 => numOfPadsPlaying = " + musicSynchronizer.numOfPadsPlaying);
    soundToPlay.play();
}

function delayPlayAndIncNumOfPeds(soundToPlay,delay){
    
    musicSynchronizer.numOfPadsPlaying += 1;
    //alert("after += 1 => numOfPadsPlaying = " + musicSynchronizer.numOfPadsPlaying);
    soundToPlay.currentTime = delay/1000;
    soundToPlay.play();
}

function isPadStillNeedToPlay(padId){
    
    var isPadStillCorrecr = padsDict[padId].state == "on" && padsDict[padId].isWaiting == true;
    var stoperCorrecr = musicStoper.isStoped == false && musicStoper.lastClickedTime < padsDict[padId].lastClickedTime;
    
    return isPadStillCorrecr && stoperCorrecr ;
}

function stopSound(soundToStop){
    soundToStop.pause();
    soundToStop.currentTime = 0;
}

function syncedPause(padId){
    
    var soundToStop = document.getElementById(padsDict[padId].audioId);
    
    if(musicSynchronizer.numOfPadsPlaying > 0){
        musicSynchronizer.numOfPadsPlaying -= 1;
        //alert("after -= 1 => numOfPadsPlaying = " + musicSynchronizer.numOfPadsPlaying);
    }
    
    padsDict[padId].isWaiting = false;
    stopSound(soundToStop);
}

function playClicked(){
    
    if(loopRecorder.isRecording == true){
        updateRecorder(playButtonId);
    }
    
    musicStoper.isStoped = false;
    changeManageButtonState(playButtonId);
    playAllOnPadsDirectly();
}

function playAllOnPadsDirectly(){
    
   var isFirstPadToPlay = true;
    for (var padId in padsDict){
        if(padsDict[padId].state == "on")
        {
            var currAudio = document.getElementById(padsDict[padId].audioId);
            
            if(isFirstPadToPlay == true)
            {
                syncedPlay(padId);
                isFirstPadToPlay = false;
            }
            else
            {
                playAndIncNumOfPeds(currAudio);
            }
            
        }
    }
}

function reproductionAllOnNonWaitingPads(){
    
    var isFirstPadToPlay = true;
    for (var padId in padsDict){
       var currAudio = document.getElementById(padsDict[padId].audioId);
        
        if(padsDict[padId].state == "on")
        {
            var currDelayTime = padsDict[padId].delayTime;
            if(padsDict[padId].isWaiting == false && currDelayTime != -1) // need to be played directly
            {
                if(isFirstPadToPlay == true)
                {
                    syncedDelayPlay(padId,currDelayTime);
                    isFirstPadToPlay = false;
                }
                else
                {
                    delayPlayAndIncNumOfPeds(currAudio,currDelayTime);//withdelay
                }
            }
            document.getElementById(padId).style.backgroundColor = "red";
        }
    }
}

function syncedDelayPlay(padId){
    
    var mySound = document.getElementById(padsDict[padId].audioId); 
    var currDelayTime = padsDict[padId].delayTime;
    
    setDelayMusicSynchronizer(mySound,currDelayTime);
    mySound.loop = true;
    mySound.currentTime = currDelayTime/1000;
    mySound.play();
}

function reproductionAllWaitingPads(){
    
    for (var padId in padsDict){
        if(padsDict[padId].state == "on" && padsDict[padId].isWaiting == true)
        {
            syncedPlay(padId);
        }
    }
}

function stopClicked(isChangeColor){
    
    if(loopRecorder.isRecording == true)
    {
        updateRecorder(stopButtonId);
    }
    
    updateClickedTimeByButtonId(stopButtonId);
    musicStoper.isStoped = true;
    resetMusicSynchronizer();
    
    if(isChangeColor == true)
    {
        changeManageButtonState(stopButtonId);
    }
    
    
    for (var padId in padsDict){
        if(padsDict[padId].state == "on")
        {
            var currAudio = document.getElementById(padsDict[padId].audioId); 
            stopSound(currAudio);
        }
    }
}

function resetMusicSynchronizer(){
    musicSynchronizer.startPlayingTime = 0;
    musicSynchronizer.numOfPadsPlaying = 0;
    //alert("after reset => numOfPadsPlaying = " + musicSynchronizer.numOfPadsPlaying);
    musicSynchronizer.loopInterval = 0;
}

function setMusicSynchronizer(soundToSetBy){
    musicSynchronizer.startPlayingTime = new Date().getTime();
    musicSynchronizer.loopInterval = soundToSetBy.duration * 1000; // pars to mili seconds
    musicSynchronizer.numOfPadsPlaying += 1;
    //alert("after += 1 => numOfPadsPlaying = " + musicSynchronizer.numOfPadsPlaying);
}

function setDelayMusicSynchronizer(soundToSetBy, delay){
    var timeNow = new Date().getTime();
    musicSynchronizer.startPlayingTime =  timeNow - delay; ///- delay chaeck if work !!!!!!
    musicSynchronizer.loopInterval = soundToSetBy.duration * 1000; // pars to mili seconds
    musicSynchronizer.numOfPadsPlaying += 1;
    //alert("after += 1 => numOfPadsPlaying = " + musicSynchronizer.numOfPadsPlaying);
}

function resetAllPads(){
    
    musicStoper.isStoped = false;
    for (let padId in padsDict){
        {
            setPadState(padId,"off");
        }
    }
}

function changeManageButtonState(buttonId){
    
    var newStateButton = document.getElementById(stopButtonId);;
    var oppositeButton = document.getElementById(playButtonId);
    
    if( buttonId == playButtonId)
    {
        var tempItem = newStateButton;
        newStateButton = oppositeButton;
        oppositeButton = tempItem;
    }
    
    newStateButton.style.backgroundColor = "red";    
    oppositeButton.style.backgroundColor = "blue";
}

function loadRecordingClicked(){}

function changeButtonDisabledState(buttonId,newState){

    document.getElementById(buttonId).disabled = newState;
}

function booleanChangeButtonVisibility(buttonId,newState){
    var stateToUpdate = "visible";
    
    if(newState == false)
    {
        stateToUpdate = "hidden";
    }
    
    document.getElementById(buttonId).style.visibility = stateToUpdate;
}

function changeButtonTextAndColor(buttonId, newText, newColor){
    
    var buttonToChange = document.getElementById(buttonId);
    buttonToChange.innerHTML = newText;
    buttonToChange.style.backgroundColor = newColor;
}

function changeAllPadsDisabledState(newState){
    
    for (var padId in padsDict){
        changeButtonDisabledState(padId,newState);
    }
}

