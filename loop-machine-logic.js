/*eslint-env es6*//*eslint-env browser*/

let padsDict = { 
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


const playButtonId = "playButton";
const stopButtonId = "stopButton";
const recButtonId = "recButton";
const playRecordingButtonId = "playRecording";
const loadRecordingButtonId = "loadRecording";
let isLoadRecordingAvailable = false;


let musicSynchronizer = {startPlayingTime : 0, numOfPadsPlaying : 0, loopInterval : 0};

let loopRecorder = { 
    isRecording : false,
    startTime : 0,
    actionsLoop : new Array()// {buttonId : padId, clickedTime : 0, delayTime : 0, isWaiting : isWaiting};
};

let recordPlayer = {
    stopedPlayingRecordingTime : 0,
    startPlayingRecordingTime : 0,
}

let musicStoper = {isStoped : false,lastClickedTime : 0} ;

const storeUserData=()=>{
    
    storeOrLoadAllGlobalData("store");
}

const loadUserData=()=>{
   
    storeOrLoadAllGlobalData("load");
}

const updateButtonsByUserData=()=>{
   
    for (let padId in padsDict){
        updatePadStyleByState(padId);
    }
    
    if(loopRecorder.actionsLoop.length == 0)
    {
        setPlayRecordingButtonState("playRecordingOff");
        hidePlayRecordingButton();
    }
    else
    {
        setPlayRecordingButtonState("playRecordingOn");
        showPlayRecordingButton();
        changeButtonDisabledState(playRecordingButtonId,false)
    }
    
}

const updatePadStyleByState=(padId)=>{
   
    let padToUpdate = document.getElementById(padId);
    
    if(padsDict[padId].state == "off")
    {
        padToUpdate.style.backgroundColor = "deeppink";
    }
    else
    {
        padToUpdate.style.backgroundColor = "cornflowerblue";
    }
    
}

const storeOrLoadAllGlobalData=(dataQuery)=>{
    storeOrLoadPadsDict(dataQuery);
    storeOrLoadMusicSynchronizer(dataQuery);
    storeOrLoadLoopRecorder(dataQuery);
    storeOrLoadRecordPlayer(dataQuery);
    storeOrLoadMusicStoper(dataQuery);
}

const storeOrLoadPadsDict=(dataQuery)=>{
    if(dataQuery == "store")
    {
        window.localStorage.setItem("padsDict", JSON.stringify(padsDict));
    }
    else
    {
        JSONreturnVal = window.localStorage.getItem("padsDict");
        padsDict = JSON.parse(JSONreturnVal);
    }
}

const storeOrLoadMusicSynchronizer=(dataQuery)=>{
    if(dataQuery == "store")
    {
        window.localStorage.setItem("musicSynchronizer", JSON.stringify(musicSynchronizer));
    }
    else
    {
        JSONreturnVal = window.localStorage.getItem("musicSynchronizer");
        musicSynchronizer = JSON.parse(JSONreturnVal);
    }
}

const storeOrLoadLoopRecorder=(dataQuery)=>{
    if(dataQuery == "store")
    {
        window.localStorage.setItem("loopRecorder", JSON.stringify(loopRecorder));
    }
    else
    {
        JSONreturnVal = window.localStorage.getItem("loopRecorder");
        loopRecorder = JSON.parse(JSONreturnVal);
    }
}

const storeOrLoadRecordPlayer=(dataQuery)=>{
    if(dataQuery == "store")
    {
        window.localStorage.setItem("recordPlayer", JSON.stringify(recordPlayer));
    }
    else
    {
        JSONreturnVal = window.localStorage.getItem("recordPlayer");
        recordPlayer = JSON.parse(JSONreturnVal);
    }
}

const storeOrLoadMusicStoper=(dataQuery)=>{
    if(dataQuery == "store")
    {
        window.localStorage.setItem("musicStoper", JSON.stringify(musicStoper));
    }
    else
    {
        JSONreturnVal = window.localStorage.getItem("musicStoper");
        musicStoper = JSON.parse(JSONreturnVal);
    }
}

const isPlayRecording=()=>{
    
    return recordPlayer.startPlayingRecordingTime > recordPlayer.stopedPlayingRecordingTime ;
}

const recButtonClicked=()=>{

    if(loopRecorder.isRecording == false)
    {
        loopRecorder.isRecording = true;
        setRecordButtonStateByRecordStatus(true);
        setPlayRecordingButtonDisabledState(true);
        startRecord();
    } 
    else
    {
        loopRecorder.isRecording = false;
        setRecordButtonStateByRecordStatus(false);
        showPlayRecordingButton();
        setPlayRecordingButtonState("playRecordingOn");
        setPlayRecordingButtonDisabledState(false);
        endRecord();
    }
}

const startRecord=()=>{
    loopRecorder.actionsLoop = new Array();
    loopRecorder.startTime = new Date().getTime();
    let index = 0;
    let currWaitingStatus = false;
    
    for (let padId in padsDict){
        
        if(padsDict[padId].state == "on")
        {
            index = getRecAtionLoopLen();
            currWaitingStatus = padsDict[padId].isWaiting;
            let padSound = document.getElementById(padsDict[padId].audioId);
            let delayTime = -1;
            
            if(isAudioPlaying(padSound) == true)
            {
                delayTime = padSound.currentTime * 1000; 
            }
            
            
            loopRecorder.actionsLoop[index] = 
                {buttonId : padId ,clickedTime : 0, delayTime : delayTime, isWaiting : currWaitingStatus};
        }
    }
}

const isAudioPlaying=(audioToCheck)=>{
    return !audioToCheck.paused;
}

const endRecord=()=>{
    let index = getRecAtionLoopLen();
    let timeOut = getCurrentRecTimeOffset();
    
    loopRecorder.actionsLoop[index] = {buttonId : stopButtonId, clickedTime : timeOut, delayTime : -1, isWaiting : false };
    loopRecorder.startTime = 0;
    stopClicked(false);
}
    
const getCurrentRecTimeOffset=()=>{
    let timeToReturn =  new Date().getTime() - loopRecorder.startTime;
    return timeToReturn;
}

const updateRecorder=(buttonId)=>{
    let index = getRecAtionLoopLen();
    let time = getCurrentRecTimeOffset();
    loopRecorder.actionsLoop[index] = 
                {buttonId : buttonId ,clickedTime : time, delayTime: -1, isWaiting : false, lastClickedTime : 0};
}

const getRecAtionLoopLen=()=>{
    return loopRecorder.actionsLoop.length;
}

const playRecording=()=>{
    
    if(isPlayRecording() == false)
    {
        startPlayRecording();
    }
    else
    {
        stopPlayRecording();
    }
    
}

const startPlayRecording=()=>{
    
    recordPlayer.startPlayingRecordingTime = new Date().getTime();
    setPlayRecordingButtonState("playRecordingOff");
    setButtonsDisabledStateWhilePlayRecord(true);
    stopClicked(false);
    resetAllPads();
    setAllStartingPads();
    reproductionAllOnNonWaitingPads();
    reproductionAllWaitingPads();
    
    let actionsArr= loopRecorder.actionsLoop;
    let lastActionIndex = getRecAtionLoopLen();
    for (let i in actionsArr){
        let currButtonId = actionsArr[i].buttonId;   
        let currTimeOut = actionsArr[i].clickedTime;
        
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

const setButtonsDisabledStateWhilePlayRecord=(newState)=>{
    changeAllPadsDisabledState(newState);
    changeButtonDisabledState(playButtonId,newState);
    changeButtonDisabledState(stopButtonId,newState);
    changeButtonDisabledState(recButtonId,newState);
    changeButtonDisabledState(loadRecordingButtonId,newState);
}

const stopPlayRecording=()=>{
    
    setPlayRecordingButtonState("playRecordingOn");
    recordPlayer.stopedPlayingRecordingTime = new Date().getTime();
    stopClicked(false);
    setButtonsDisabledStateWhilePlayRecord(false);
    
}

const setAllStartingPads=()=>{
    let actionsArr= loopRecorder.actionsLoop;
    
    for (let i in actionsArr){
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
    
const updatePadsDictByRecAction=(recAction)=>{
    let padId = recAction.buttonId;
    
    padsDict[padId].state = "on";
    padsDict[padId].isWaiting = recAction.isWaiting;
    padsDict[padId].delayTime = recAction.delayTime;
    padsDict[padId].lastClickedTime = new Date().getTime();
}

const playButtonByIdWithTimeOut=(buttonId,timeOut)=>{
    
    let currTime = new Date().getTime();
    setTimeout(()=>{playButtonById(buttonId,currTime);},timeOut);
}

const finishPlayRecordingWithTimeOut=(timeOut)=>{
    
    let currTime = new Date().getTime();
    setTimeout(()=>{finisPlayRecording(currTime);},timeOut);
}

const finisPlayRecording=(calledTime)=>{
    
    if(recordPlayer.startPlayingRecordingTime > calledTime ||
      recordPlayer.stopedPlayingRecordingTime > calledTime)
    {
        return;
    }
        
    stopPlayRecording();
}

const playButtonById=(buttonId,calledTime)=>{
   
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

const padClicked=(padId)=> {
    musicStoper.isStoped = false;
    
    if(loopRecorder.isRecording == true){
            updateRecorder(padId);
    }
   
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

const updateClickedTimeByButtonId=(buttonId)=>{
   let timetToUpdate = new Date().getTime();
    
    if(buttonId == stopButtonId){
        musicStoper.lastClickedTime = timetToUpdate;
    }
    else
    {
        padsDict[buttonId].lastClickedTime = timetToUpdate;
    }
}

const setPadState=(padId,newState)=>{
    
    let currPad = document.getElementById(padId);
    
    if(newState == "off")
    {
        currPad.style.backgroundColor = "deeppink";
    }
    else
    {
        currPad.style.backgroundColor = "cornflowerblue";
        updateClickedTimeByButtonId(padId);
    }
   
    padsDict[padId].state = newState;
}

const syncedPlay=(padId)=>{
    
    let mySound = document.getElementById(padsDict[padId].audioId);
    mySound.loop = true; 
    if(musicSynchronizer.numOfPadsPlaying == 0){
        setMusicSynchronizer(mySound);
        mySound.play();
    }
    else
    {
        padsDict[padId].isWaiting = true ;
        let timeOut = getCurrentSynchronizationTimeOut();
        if (timeOut != 0)
        {
            setTimeout(()=>{playIfNotStopedYet(padId,mySound)},timeOut);
        }
        else
        {
            playIfNotStopedYet(padId,mySound);
        }
    }
}

const getCurrentSynchronizationTimeOut=()=>{
    let currTime = new Date().getTime();
    let timeOut = musicSynchronizer.loopInterval -  (currTime - musicSynchronizer.startPlayingTime) % musicSynchronizer.loopInterval;
    
    return timeOut;
}

const playIfNotStopedYet=(padId,mySound)=>{
    
    if(isPadStillNeedToPlay(padId))
    {
        padsDict[padId].isWaiting = false;
        playAndIncNumOfPeds(mySound);
    }
}

const playAndIncNumOfPeds=(soundToPlay)=>{
    musicSynchronizer.numOfPadsPlaying += 1;
    soundToPlay.play();
}

const delayPlayAndIncNumOfPeds=(soundToPlay,delay)=>{
    
    musicSynchronizer.numOfPadsPlaying += 1;
    soundToPlay.currentTime = delay/1000;
    soundToPlay.play();
}

const isPadStillNeedToPlay=(padId)=>{
    
    let isPadStillCorrecr = padsDict[padId].state == "on" && padsDict[padId].isWaiting == true;
    let stoperCorrecr = musicStoper.isStoped == false && musicStoper.lastClickedTime < padsDict[padId].lastClickedTime;
    
    return isPadStillCorrecr && stoperCorrecr ;
}

const stopSound=(soundToStop)=>{
    soundToStop.pause();
    soundToStop.currentTime = 0;
}

const syncedPause=(padId)=>{
    
    let soundToStop = document.getElementById(padsDict[padId].audioId);
    
    if(musicSynchronizer.numOfPadsPlaying > 0){
        musicSynchronizer.numOfPadsPlaying -= 1;
    }
    
    padsDict[padId].isWaiting = false;
    stopSound(soundToStop);
}

const playClicked=()=>{
    
    if(loopRecorder.isRecording == true){
        updateRecorder(playButtonId);
    }
    
    musicStoper.isStoped = false;
    changeManageButtonState(playButtonId);
    playAllOnPadsDirectly();
}

const playAllOnPadsDirectly=()=>{
    
   let isFirstPadToPlay = true;
    for (let padId in padsDict){
        if(padsDict[padId].state == "on")
        {
            let currAudio = document.getElementById(padsDict[padId].audioId);
            
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

const reproductionAllOnNonWaitingPads=()=>{
    
    let isFirstPadToPlay = true;
    for (let padId in padsDict){
       let currAudio = document.getElementById(padsDict[padId].audioId);
        
        if(padsDict[padId].state == "on")
        {
            let currDelayTime = padsDict[padId].delayTime;
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
            document.getElementById(padId).style.backgroundColor = "cornflowerblue";
        }
    }
}

const syncedDelayPlay=(padId)=>{
    
    let mySound = document.getElementById(padsDict[padId].audioId); 
    let currDelayTime = padsDict[padId].delayTime;
    
    setDelayMusicSynchronizer(mySound,currDelayTime);
    mySound.loop = true;
    mySound.currentTime = currDelayTime/1000;
    mySound.play();
}

const reproductionAllWaitingPads=()=>{
    
    for (let padId in padsDict){
        if(padsDict[padId].state == "on" && padsDict[padId].isWaiting == true)
        {
            syncedPlay(padId);
        }
    }
}

const stopClicked=(isChangeColor)=>{
    
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
    
    
    for (let padId in padsDict){
        if(padsDict[padId].state == "on")
        {
            let currAudio = document.getElementById(padsDict[padId].audioId); 
            stopSound(currAudio);
        }
    }
}

const resetMusicSynchronizer=()=>{
    musicSynchronizer.startPlayingTime = 0;
    musicSynchronizer.numOfPadsPlaying = 0;
    musicSynchronizer.loopInterval = 0;
}

const setMusicSynchronizer=(soundToSetBy)=>{
    musicSynchronizer.startPlayingTime = new Date().getTime();
    musicSynchronizer.loopInterval = soundToSetBy.duration * 1000; // pars to miliseconds
    musicSynchronizer.numOfPadsPlaying += 1;
}

const setDelayMusicSynchronizer=(soundToSetBy, delay)=>{
    let timeNow = new Date().getTime();
    musicSynchronizer.startPlayingTime =  timeNow - delay; 
    musicSynchronizer.loopInterval = soundToSetBy.duration * 1000; // pars to miliseconds
    musicSynchronizer.numOfPadsPlaying += 1;

}

const resetAllPads=()=>{
    
    musicStoper.isStoped = false;
    for (let padId in padsDict){
        {
            setPadState(padId,"off");
        }
    }
}

const changeManageButtonState=(buttonId)=>{
    
    let newStateButton = document.getElementById(stopButtonId);;
    let oppositeButton = document.getElementById(playButtonId);
    
    if( buttonId == playButtonId)
    {
        let tempItem = newStateButton;
        newStateButton = oppositeButton;
        oppositeButton = tempItem;
    }
    
}

const loadRecordingClicked=()=>{
    
    loadUserData();
    updateButtonsByUserData();
    
}

const storeRecordingClicked=()=>{
    
    let loadRecordingButton = document.getElementById(loadRecordingButtonId);
    
    if(isLoadRecordingAvailable == false)
    {
        isLoadRecordingAvailable = true;
        loadRecordingButton.disabled = false;
        loadRecordingButton.style.visibility = "visible";
    }
    
    storeUserData();
}

const changeButtonDisabledState=(buttonId,newState)=>{

    document.getElementById(buttonId).disabled = newState;
}

const booleanChangeButtonVisibility=(buttonId,newState)=>{
    let stateToUpdate = "visible";
    
    if(newState == false)
    {
        stateToUpdate = "hidden";
    }
    
    document.getElementById(buttonId).style.visibility = stateToUpdate;
}

const changeButtonTextAndColor=(buttonId, newText, newColor)=>{
    
    let buttonToChange = document.getElementById(buttonId);
    buttonToChange.innerHTML = newText;
    buttonToChange.style.backgroundColor = newColor;
}

const changeAllPadsDisabledState=(newState)=>{
    
    for (let padId in padsDict){
        changeButtonDisabledState(padId,newState);
    }
}

const setRecordButtonStateByRecordStatus=(isRecording)=>{
   
    let recButton = document.getElementById(recButtonId);
    
    if(isRecording == true)
    {
        recButton.className = "recButtonClicked";
    }
    else
    {
        recButton.className = "recButtonDefault";
    } 
}

const setPlayRecordingButtonDisabledState=(newDisableState)=>{
    let playRecordingButton = document.getElementById(playRecordingButtonId);
    
    if(playRecordingButton.className != "playRecordingDefault"){
        playRecordingButton.disabled = newDisableState;
    }
    
}

const setPlayRecordingButtonState=(playRecordingNewState)=>{
    let playRecordingButton = document.getElementById(playRecordingButtonId);
    
    if(playRecordingNewState == "playRecordingOn" || recButton.className != "playRecordingDefault")
    {
        playRecordingButton.className = playRecordingNewState;
    }
}

const onloadFunction=()=>{
    let loadRecordingButton = document.getElementById(loadRecordingButtonId);
    let playRecordingButton = document.getElementById(playRecordingButtonId);
    
    isLoadRecordingAvailable = window.localStorage.getItem("padsDict") != null
    playRecordingButton.disabled = true;
    playRecordingButton.style.visibility = "hidden";
    
    if(isLoadRecordingAvailable == false){
        loadRecordingButton.disabled = true;
        loadRecordingButton.style.visibility = "hidden";
    }
}

const showPlayRecordingButton=()=>{
    let playRecordingButton = document.getElementById(playRecordingButtonId);
    
    if(playRecordingButton.style.visibility == "hidden")
    {
        playRecordingButton.style.visibility = "visible";
    }
}

const hidePlayRecordingButton=()=>{
    let playRecordingButton = document.getElementById(playRecordingButtonId);
    
    if(playRecordingButton.style.visibility == "visible")
    {
        playRecordingButton.style.visibility = "hidden";
    }
}