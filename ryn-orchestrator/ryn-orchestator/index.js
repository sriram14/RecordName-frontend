function RecordYourName(guid, baseURL){
    this.appKey = guid;
    this.audioStatusUrl = "https://recordname.azure-api.net/AudioStatus/GetAudioStatus";
    this.imagesBaseUrl = baseURL + "/assets/images";
    this.css();
}
RecordYourName.prototype.css=function(){
    let style = document.createElement("style");
    style.innerHTML = ".audio-icon{width:16px;height:16px;margin-left:10px;}";
    style.innerHTML += ".mask{z-index:1;background:rgba(0,0,0,0.4);position:absolute;top:0px;left:0px;width:100%;height:100%}";
    style.innerHTML += ".audio-rec-body{border-radius: 10px;z-index:2;background:white;height:30%;width:30%;position:absolute;left:35%;top:30%;}"
    style.innerHTML += ".audio-icon-mic{width:48px;height:48px;}";
    style.innerHTML += ".audio-rec-body-div{text-align:center;padding:20px;padding-top:60px;}"
    style.innerHTML += ".timerCountdownText{font-weight:bold;font-size:1.6em}"
    style.innerHTML += ".audio-play-div{text-align:center;padding:20px;padding-top:30px;}"
    style.innerHTML += ".audio-close{position:absolute;right:-20px;top:-20px;background-color: white;border-radius: 40px;height: 40px;width: 40px;text-align: center;border: 1px solid #686868;line-height: 40px;}"
    style.innerHTML += ".audio-close > img{height:16px;width:16px;}"
   
    document.body.appendChild(style);
}
RecordYourName.prototype.fetch=function(info, isAdmin){
    let params={
        useridList:[],
        partnerid:this.appKey
    }
    info.forEach((v,i,a)=>{
        params.useridList.push(v.userId);
    });

    const xhttp = new XMLHttpRequest();
    xhttp.open('POST',this.audioStatusUrl,true);
    xhttp.setRequestHeader('Content-Type','application/json');
    xhttp.send(JSON.stringify(params));
    let that = this;
    xhttp.onreadystatechange = function(){
        if(xhttp.readyState == 4 ){
            console.log(this);
            if(xhttp.status == 200 || xhttp.status==204){
                console.log(xhttp.responseText);
                that.buildUI(info,xhttp.responseText);
            }else{
                console.error("Unable to retrieve audio status "+xhttp.readyState);
                that.buildUI(info,{}, isAdmin);
            }
        }
    }

}
RecordYourName.prototype.buildUI = function(info, response, isAdmin){
    //find the loggedOn true
    function checkLoggedOn(user){
        return user.loggedOn==true;
    }
    function findObject(user){
        console.log(userInContext.userid , user.userId)
        return userInContext.userId == user.userid;
    }
    let loggedOnUser = info.find(checkLoggedOn);
    let userInContext = {};
    if(loggedOnUser)
        this.buildLoggedOnUserUI(loggedOnUser,response);
   
    response = JSON.parse(response);
    console.log(response, info);
    info.forEach((original)=>{
        response.forEach((resp)=>{
            if(original.userId==resp.userid){
                for(let y in resp)
                    original[y] = resp[y];
            }    
        });
    });
    info.forEach((f)=>{
        if(f.userid!=loggedOnUser.userId)
            this.buildOthersUI(f, isAdmin);
    });
}
RecordYourName.prototype.getToken = function(userInfo){
    return fetch("https://recordname.azure-api.net/api/v1/GetToken")  
        .then(response => response.text())
}
RecordYourName.prototype.play = function(userInfo){
    //trying with MS
    console.log(userInfo);
    let that=this;
    if(!userInfo.audioavailable){
        this.getToken().then((token)=>{
            that.localeFilter(userInfo.location,userInfo.gender, token).then((e)=>{
                console.log(e);
                that.fetchAudio(userInfo, token, e[0].ShortName)
                .then((blob)=>{
                    const audioUrl = URL.createObjectURL(blob);
                    const audio = new Audio(audioUrl);
                    audio.play();
                });    
            });
           
        })
    }else{
        fetch(userInfo.bloburl)
        .then(response => response.blob())
        .then((blob)=>{
            console.log(blob)
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audio.play();
        });
    }
}
RecordYourName.prototype.fetchAudio = function(userInfo, token, shortNameAzure){
    return fetch("https://eastus.tts.speech.microsoft.com/cognitiveservices/v1", {
        method: "POST",
        headers: {"X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm",
                "Content-Type": "application/ssml+xml",
                "Host": "eastus.tts.speech.microsoft.com",
                "Authorization": "Bearer "+ token,
                }
        ,
        body: `<speak version='1.0' xml:lang='en-US'>
                    <voice xml:lang='en-US' name='${shortNameAzure}'>
                            <prosody rate='medium'>    
                                ${userInfo.preferredName}
                            </prosody>
                        </voice>
                   
                </speak>`
        })
        .then((audio) => {
            return audio.blob();
        })
}
RecordYourName.prototype.localeFilter =function(location, gender, token){
    gender = gender==null? 'female':'male';
    location = location.toLowerCase();
    return this.getVoiceList(token)
    .then((voiceList) => {
        let voices = JSON.parse(voiceList);
        let shortNameList = voices.filter(element => {
            return (gender?(element.Gender.toLowerCase() === gender.toLowerCase()):true) && element.LocaleName.toLowerCase().includes(location) || (element.LocaleName.includes("Chinese") && location === "china");
        });
        if(shortNameList.length==0){
            if(gender.toLowerCase()=="female"){
                shortNameList.push({ShortName:"en-US-JennyNeural"});
            }else{
                shortNameList.push({ShortName:"en-US-BrandonNeural"});
            }
        }
        return shortNameList;
    })
}
RecordYourName.prototype.getVoiceList = function(token){
    if(!localStorage.getItem("voiceList")){
        return this.getToken()
        .then((token) => fetch("https://eastus.tts.speech.microsoft.com/cognitiveservices/voices/list" , {
                headers: {"Authorization": "Bearer "+ token, "Content-Type": "application/json"}
            })
        .then(response => response.text())
        .then(data => {
                    localStorage.setItem("voiceList", data);
                    return localStorage.getItem("voiceList");;
                }));
    }else{
        return new Promise((resolve) => {
            resolve(localStorage.getItem("voiceList"));
        })
    }
}
RecordYourName.prototype.buildOthersUI = function(loggedOnUser, isAdmin){
    let that = this;
    let placeholder = document.getElementById(loggedOnUser.placeHodler);
    console.log(loggedOnUser);
    let ph = document.createElement("span");
    let speaker = document.createElement("img");
    let mic = document.createElement("img");
    speaker.src = this.imagesBaseUrl+"/speaker.svg";
    mic.src = this.imagesBaseUrl+"/mic_outline.svg";
    speaker.onclick = function(e){
        that.play(loggedOnUser);
    }

    speaker.className = "audio-icon";
    mic.className = "audio-icon";
   
    mic.onclick = function(){
        that.buildAudioRecording(loggedOnUser);
    }
   
    ph.appendChild(speaker);

    if(isAdmin)
        ph.appendChild(mic);

    placeholder.appendChild(ph);
}
RecordYourName.prototype.buildLoggedOnUserUI = function(loggedOnUser, response){
    let that = this;
    let placeholder = document.getElementById(loggedOnUser.placeHodler);
    let ph = document.createElement("span");
    let speaker = document.createElement("img");
    let mic = document.createElement("img");
    speaker.src = this.imagesBaseUrl+"/speaker.svg";
    mic.src = this.imagesBaseUrl+"/mic_outline.svg";
    speaker.onclick = function(e){
        that.play(loggedOnUser,response);
    }

    speaker.className = "audio-icon";
    mic.className = "audio-icon";
   
    mic.onclick = function(){
        that.buildAudioRecording(loggedOnUser);
    }
   
    ph.appendChild(speaker);
    ph.appendChild(mic);
    placeholder.appendChild(ph);
}
RecordYourName.prototype.buildAudioRecording = function(loggedOnUser){
    let mask = document.createElement("div");
    mask.className = "mask";
    document.body.appendChild(mask);

    let body = document.createElement("div");
    body.className="audio-rec-body"
    document.body.appendChild(body);

    let closeIcon = document.createElement("div");
    closeIcon.className = "audio-close";
    let closeIconImg = document.createElement("img");
    closeIconImg.src = this.imagesBaseUrl+"/close.png";
    closeIcon.appendChild(closeIconImg);
    body.appendChild(closeIcon);
    closeIcon.onclick=function(){
        setTimeout(() => {
            document.getElementsByClassName("mask")[0].remove();
            document.getElementsByClassName("audio-rec-body")[0].remove();
        }, 0);
    }

    let micRec = document.createElement("div");
    let micRecIcon = document.createElement("img")
    micRec.className="audio-rec-body-div"
    micRecIcon.src = this.imagesBaseUrl+"/mic_outline.svg";
    micRecIcon.className = "audio-icon-mic";
    micRec.appendChild(micRecIcon);
    let that = this;
    micRecIcon.id= "audio-rec-mic-id"
    micRecIcon.onclick = function(){
        if(!that.isRecording)
            that.startRecording(loggedOnUser);
        else
            that.stopRecording(loggedOnUser);
    }
    let timerCountdownText = document.createElement("div");
    timerCountdownText.innerText = "00:05";
    timerCountdownText.className = "timerCountdownText";
    timerCountdownText.id = "timer";
    micRec.appendChild(timerCountdownText);
    body.appendChild(micRec);

    let audioPlay = document.createElement("div");
    audioPlay.className = "audio-play-div";

    audioPlay.innerHTML = "<div class='pt10 pb10'>Click to play</div>";


    let audioPlayIcon = document.createElement("img");
    audioPlayIcon.src = this.imagesBaseUrl+"/speaker.svg";
    audioPlayIcon.className = "audio-icon-mic";
   
    audioPlayIcon.onclick = function(){
        const audioUrl = URL.createObjectURL(that.audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    }
    let audioBreak = document.createElement("span");
    audioBreak.innerHTML = " &nbsp; ";

    let audioSavePh = document.createElement("div");
    audioSavePh.className="pt10";
    let audioSave = document.createElement("input");
    audioSave.type="button"
    audioSave.value = "Save"
    audioSavePh.appendChild(audioSave);
    audioSavePh.appendChild(audioBreak);
    let audioDiscard = document.createElement("input");
    audioDiscard.type="button"
    audioDiscard.value = "Discard"
    audioSavePh.appendChild(audioDiscard);
    audioDiscard.onclick = function(){
        that.discard();
    }
    audioSave.onclick = function(){
        that.save(loggedOnUser);
    }

    audioPlay.appendChild(audioPlayIcon);
    audioPlay.appendChild(audioSavePh);
    audioPlay.style.display = "none";
    body.appendChild(audioPlay);

}
RecordYourName.prototype.save=function(loggedOnUser){
    loggedOnUser = loggedOnUser.userId;
    let data = new FormData();
    data.append("file",this.audioBlob);
    data.append("userId", loggedOnUser);
    data.append("partnerId", this.appKey);
    data.append("blobUrl", "");
    data.append("fileSize", "3455");
    data.append("fileType", "mp3");
    let token = window.localStorage.getItem("token");
    data.append("token", token);
    const url = "https://recordname.azure-api.net/api/upload/api/Upload/UploadFile";
    const xhttp = new XMLHttpRequest();
    xhttp.open('POST',url,true);
    xhttp.onreadystatechange = function(){
        if(xhttp.readyState==4 && xhttp.status==200){
            alert("success");
        }
    }
    xhttp.send(data);

}
RecordYourName.prototype.countDown = function () {
    let that = this;
    console.log('calling countdown');
    var minute = '00';
    var sec = 5;
    clear = setInterval(() => {
        sec = parseInt(sec);
        sec--;
        if (sec == 0) {
            clearInterval(clear);
            that.stopRecording();
        }
        sec = '0' + sec;
        let time = document.getElementById("timer");
        console.log(time);
        time.innerText = minute + ":" + sec;
    }, 1000);
}
RecordYourName.prototype.stopRecording=function(loggedOnUser){
    this.mediaRecorder.stop();
    this.isRecording = false;
    document.getElementById("audio-rec-mic-id").src = this.imagesBaseUrl+"/mic_outline.svg";
    document.getElementsByClassName("audio-rec-body-div")[0].style.display = "none";
    document.getElementsByClassName("audio-play-div")[0].style.display = "";
}
RecordYourName.prototype.discard=function(loggedOnUser){
    this.isRecording = undefined;
    document.getElementsByClassName("audio-rec-body-div")[0].style.display = "";
    document.getElementsByClassName("audio-play-div")[0].style.display = "none";
    let timer = document.getElementById("timer");
    timer.innerText = "00" + ":" + "05";
}
RecordYourName.prototype.startRecording=function(loggedOnUser){
    document.getElementById("audio-rec-mic-id").src = this.imagesBaseUrl+"/stop.svg";
    let that = this;
    this.isRecording = true;
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        that.mediaRecorder = new MediaRecorder(stream);
        that.mediaRecorder.start();
        console.log('coming to start');
        setTimeout(() => { that.countDown() }, 500);
        const audioChunks = [];

        that.mediaRecorder.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
        });

        that.mediaRecorder.addEventListener("stop", () => {
            that.audioBlob = new Blob(audioChunks,{type:'audio/*'});
            console.log(that.audioBlob);
        });
    });
}
window.RecordYourName = RecordYourName;