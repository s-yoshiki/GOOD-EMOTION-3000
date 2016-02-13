/***********************
*
*   11/08/2015 
*  Shinagawa Yoshiki
*
*************************/
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia;

var canvasChangeFlags = false;

var canvas = document.getElementById("canvas");
canvas.height = canvas.height*((window.innerWidth/2)/canvas.width);
canvas.width = window.innerWidth/2;

var canvas2 = document.getElementById("canvas2");
canvas2.height = canvas.height;
canvas2.width = canvas.width;

var overlay = document.getElementById("overlay");
overlay.height = canvas.height;
overlay.width = window.innerWidth;

var buffer = document.getElementById("buffer");
buffer.width = canvas.width;
buffer.height = canvas.height;

var buffer2 = document.getElementById("buffer2");
buffer2.width = canvas.width;
buffer2.height = canvas.height;

var video = document.getElementById("my-video");
//video.height = canvas.height;
//video.width = canvas.width;

var video2 = document.getElementById("their-video");
//video2.height = canvas.height;
//video2.width = canvas.width;

var context = canvas.getContext("2d");
var context2 = canvas2.getContext("2d");
var contextOverlay = overlay.getContext("2d");

var sketch = document.getElementById("sketch");

sketch.height = canvas2.height;
sketch.width = canvas2.width;
var conn;
var test_c = 0;
var peer = new Peer({
    key: '8bcd5c66-aa38-4336-9454-da690043e1a6',
    debug: 3
});

/*関数送信用P2P*/
var peer2 = new Peer({
    key: '8bcd5c66-aa38-4336-9454-da690043e1a6',
    debug: 3
});

peer2.on('open', function(){});

//////about sending function's message
peer2.on('connection', connect);

function connect(c) {
    conn = c;
    conn.on('data', function(data) {
        document.getElementById("messages").innerHTML = data;
        try{
            //eval(data);
            (Function(data))();
        }catch(e){
            document.getElementById("messages").innerHTML = data;
        }
        document.getElementById("func-id").value = conn.peer   
    });
    conn.on('close', function(err) {
        alert(conn.peer + ' has left the chat.');
    });
}
$(document).ready(function() {
    // Conect to a peer
    $('#make-call').click(function() {
        var c = peer2.connect($('#func-id').val());
        c.on('open', function() {
            connect(c);
        });
        c.on('error', function(err) {
            //alert(err); 
        });
    });
    /*
    ////メッセージの送信
    $('#send').click(function() {
        var msg = $('#text').val();
        conn.send(msg);
        //$('#messages').append('You:' + msg);
        //$('#text').val('');
    });*/
});

peer2.on('error', function(err) {
    //alert("peer2 error");
    document.getElementById("settings").style.display = "inline";
});

//about video stream
peer.on('open', function() {
    document.getElementById("my-id").innerHTML = peer.id + "" + peer2.id;
    document.getElementById("url").value = location.href.split(location.hash).join("") + "?=" + peer.id + peer2.id;
    setUrl();
    startVideo();
});

peer.on('call', function(call) {
    call.answer(window.localStream);
    step3(call);
});

peer.on('error', function(err) {
    //alert(err.message);
    document.getElementById("settings").style.display = "inline";
    //alert("peer error");
});


$(function() {
    $('#make-call').click(function() {
        var call = peer.call($('#callto-id').val(), window.localStream);
        step3(call);
        
    });
    $('#end-call').click(function() {
        window.existingCall.close();
    });
    $('#step1-retry').click(function() {
        $('#step1-error').hide();
        step1();
    });
    step1();
});
//****************"sent stream"******************//
function step1() {
    navigator.getUserMedia({audio: true,video: true},function(stream) {
        $('#my-video').prop('src', URL.createObjectURL(stream));
        window.localStream = stream;
    },function(){
        //error
        document.getElementById("settings").style.display = "inline";
    });
}


function step3(call) {
    // Hang up on an existing call if present
    document.getElementById("callto-id").value =  call.peer;
    if (window.existingCall) {
        window.existingCall.close();
    }
    call.on('stream', function(stream) {
        document.getElementById("settings").style.display = "none";
        $('#their-video').prop('src', URL.createObjectURL(stream));
    });
    // UI stuff
    window.existingCall = call;
    //$('#their-id').text(call.peer);
    call.on('close', function(){
        document.getElementById("settings").style.display = "inline";
    });
}


function setUrl() {
    var text = "";
    if(location.href.indexOf("?=") !== -1){
        text=location.href.slice(location.href.length-32,location.href.length);
    }
    
    var videoId = "",funcId = "";
    if (text.length !== 32) {
        text = "";
    } else {
        for (var i = 0; i < 16; i++) {
            videoId += text[i];
        }
        funcId = text.split(videoId).join("");
        document.getElementById("callto-id").value = videoId;
        document.getElementById("func-id").value = funcId;
        canvasChangeFlags = true;
    }
    document.getElementById("callto-id").style.visibility = "hidden";
    document.getElementById("func-id").style.visibility = "hidden";
}

document.getElementById("tweet").onclick = function(){
    var text = "Call me! super crazy chat!";
    text = "";
    var url = document.getElementById("url").value;
    window.open("http://twitter.com/intent/tweet?text="+text+"  "+url);
};

/**/

var global_color = "#FFF";
var global_color_count = 0;

document.getElementById("color").onclick = function(){
    global_color_count++;
    global_color = "rgb("+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+")";
    if(global_color_count%10===0){
        global_color = -1;
        document.getElementById("color").style.background = "#FFF";
        document.getElementById("color").style.color = "#000";
        document.getElementById("color").innerHTML = "R";
    }else{
        document.getElementById("color").style.background = global_color;
        document.getElementById("color").style.color = global_color;
        document.getElementById("color").innerHTML = ".";
    }
    conn.send("TheirFaceParts.cheek.text ="+"'"+document.getElementById("textarea").value+"'");
    conn.send("TheirFaceParts.cheek.color ="+"'"+global_color+"'");
    conn.send("TheirFaceParts.forehead.text ="+"'"+document.getElementById("textarea").value+"'");
    conn.send("TheirFaceParts.forehead.color ="+"'"+global_color+"'");
    conn.send("TheirFaceParts.eye.text ="+"'"+document.getElementById("textarea").value+"'");
    conn.send("TheirFaceParts.eye.color ="+"'"+global_color+"'");
    conn.send("TheirFaceParts.mouth.text ="+"'"+document.getElementById("textarea").value+"'");
    conn.send("TheirFaceParts.mouth.color ="+"'"+global_color+"'");
};

//*************************************  about video chat  **************************
var ctrack = new clm.tracker({useWebGL:true});
ctrack.init(pModel);

function startVideo(){
    //video.play();
    ctrack.start(video);
    drawVideo();
    TrackingCount = true;
}

var cp2;
var TrackingType = false;

document.getElementById("tracking-type").onclick = function(){
    if(TrackingType===true){
        document.getElementById("tracking-type").innerHTML = "tracking OFF";
        TrackingType=false;
        ctrack = new clm.tracker({
            useWebGL:true
        });
        ctrack.init(pModel);
        ctrack.start(video);
    }else{
        document.getElementById("tracking-type").innerHTML = "tracking ON";
        TrackingType=true;
        try{
            conn.send("SendEmotion(0,0,0,0);");
        }catch(e){
            console.log(e);
        }
        ctrack.stop();
        ctrack.reset();
        ctrack.clear();
        //delete ctrack;
    }
};


function drawVideo() {
    window.requestAnimationFrame(drawVideo);

    var cp = ctrack.getCurrentParameters();
    var er = ec.meanPredict(cp);
    var src,dst;

    //filtering
    if(canvasChangeFlags===false){
        //canvasが自分
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context2.drawImage(video2, 0, 0, canvas.width, canvas.height);

        //processing my Emotion
        src = context.getImageData(0, 0, canvas.width, canvas.height);
        dst = src;
        if(TrackingType === false){
            if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===1){
                //angry
                for (var i = 0; i < src.data.length; i = i + 4) {
                    var noise = 1;
                    if(Math.random()>0.95){
                        noise = 0;
                    } 
                    dst.data[i] = src.data[i]*noise;
                    dst.data[i + 1] = src.data[i +1]*(1-er[0].value-0.4)*noise;
                    dst.data[i + 2] = src.data[i + 2]*(1-er[0].value-0.4)*noise;
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===2){
                //sad
                for (var i = 0; i < src.data.length; i = i + 4) {
                    if(src.data[i]>50){
                        if(240>src.data[i+1]&&src.data[i+1]>120){
                            if(220>src.data[i+2]&&src.data[i+2]>70){
                            }else{
                                dst.data[i]=255*Math.random();
                                dst.data[i+1]=255*Math.random();
                                dst.data[i+2]=255*Math.random();
                            }
                        }else{
                            dst.data[ i ] = dst.data[ i ]*(1 - er[1].value)*0;
                            dst.data[i+1] = dst.data[i+1]*(1 - er[1].value)*0;
                            dst.data[i+2] = dst.data[i+2]*(1 - er[1].value)*0;
                        }
                    }else{
                        dst.data[ i ] = dst.data[ i ]*(1 - er[1].value)*0;
                        dst.data[i+1] = dst.data[i+1]*(1 - er[1].value)*0;
                        dst.data[i+2] = dst.data[i+2]*(1 - er[1].value)*0;
                    }
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===3){
                //surprised
                for (var i = 0; i < src.data.length; i = i + 4) {
                    if(src.data[i]>50){
                        if(240>src.data[i+1]&&src.data[i+1]>120){
                            if(220>src.data[i+2]&&src.data[i+2]>70){
                            }else{
                            }
                        }else{
                            dst.data[ i ] = dst.data[ i ]*(1 - er[1].value)*0;
                            dst.data[i+1] = dst.data[i+1]*(1 - er[1].value)*0;
                            dst.data[i+2] = dst.data[i+2]*(1 - er[1].value)*0;
                        }
                    }else{
                        dst.data[ i ] = dst.data[ i ]*(1 - er[1].value)*0;
                        dst.data[i+1] = dst.data[i+1]*(1 - er[1].value)*0;
                        dst.data[i+2] = dst.data[i+2]*(1 - er[1].value)*0;
                    }
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===4){
                //funny
                var center = {};
                center.x = ctrack.getCurrentPosition[62][0]/video.width*canvas.width;
                center.y = ctrack.getCurrentPosition[62][1]/video.width*canvas.width;
                //document.getElementById("step3").innerHTML  = center.x+","+center.y;
                for (var i = 0; i < src.data.length; i = i + 4) {
                    var x = (i%(canvas.width*4))/4;
                    var y = (i/(canvas.width*4));
                    var w = Math.abs(center.x-x);
                    var h = Math.abs(center.y-y);
                    dst.data[i] += (w+h)/2;
                    dst.data[i + 1] += (w+h)/2;
                    dst.data[i + 2] += (w+h)/2;
                    if(dst.data[i]>255)dst.data[i]=255;
                    if(dst.data[i+1]>255)dst.data[i+1]=255;
                    if(dst.data[i+2]>255)dst.data[i+2]=255;
                    //dst.data[i + 3] -= (w+h)/2;
                }
            }else if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===5){
                //surprised & funny
                for (var i = 0; i < src.data.length; i = i + 4) { 
                    dst.data[i] = Math.abs(255-src.data[i])*0;
                    dst.data[i + 1] = Math.abs(255-src.data[i +1]);
                    dst.data[i + 2] = Math.abs(255-src.data[i + 2]);
                    dst.data[i + 3] = Math.abs(255-src.data[i + 3]);
                }
            }else if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===6){
                //funny
                var center = {};
                center.x = ctrack.getCurrentPosition()[62][0]/video.width*canvas.width;
                center.y = ctrack.getCurrentPosition()[62][1]/video.width*canvas.width;
                //document.getElementById("step3").innerHTML  = center.x+","+center.y;
                for(var i=0;i<canvas.height;i++){
                    for(var j=0;j<canvas.width*4;j+=4){
                        if(Math.random()<0.99){
                            var w = Math.abs(center.x-j/4);
                            var h = Math.abs(center.y-i);
                            // dst.data[i*canvas.width*4+j   ] +=  Math.sqrt(w*w+h*h);//i+j/4;
                            // dst.data[i*canvas.width*4+j + 1] += Math.sqrt(w*w+h*h);//i+j/4;
                            // dst.data[i*canvas.width*4+j + 2] += Math.sqrt(w*w+h*h);//i+j/4;
                            dst.data[i*canvas.width*4+j   ] +=  w/2+h/2;//i+j/4;
                            dst.data[i*canvas.width*4+j + 1] += w/2+h/2;//i+j/4;
                            dst.data[i*canvas.width*4+j + 2] += w/2+h/2;//i+j/4;
                            //dst.data[i + 3] = Math.abs(255-src.data[i + 3]);
                        }else{
                            dst.data[i*canvas.width*4+j   ]  =255;//i+j/4;
                            dst.data[i*canvas.width*4+j + 1] =255;//i+j/4;
                            dst.data[i*canvas.width*4+j + 2] =  0;//i+j/4;
                        }
                    }
                }
            }
            context.putImageData(dst, 0, 0);
        }

        src = context2.getImageData(0, 0, canvas.width, canvas.height);
        dst = src;
        if(TrackingType === false){
            if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===1){
                //angry
                for (var i = 0; i < src.data.length; i = i + 4) {
                    var noise = 1;
                    if(Math.random()>0.95){
                        noise = 0;
                    } 
                    dst.data[i] = src.data[i]*noise;
                    dst.data[i + 1] = src.data[i +1]*(1-er[0].value-0.4)*noise;
                    dst.data[i + 2] = src.data[i + 2]*(1-er[0].value-0.4)*noise;
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===2){
                //sad
                for (var i = 0; i < src.data.length; i = i + 4) {
                    if(src.data[i]>50){
                        if(240>src.data[i+1]&&src.data[i+1]>120){
                            if(220>src.data[i+2]&&src.data[i+2]>70){
                            }else{
                                //dst.data[i]=0;
                                //dst.data[i+1]=0;
                                //dst.data[i+2]=0;
                            }
                        }else{
                            dst.data[ i ] = dst.data[ i ]*(1 - er[1].value);
                            dst.data[i+1] = dst.data[i+1]*(1 - er[1].value);
                            dst.data[i+2] = dst.data[i+2]*(1 - er[1].value);
                        }
                    }else{
                        dst.data[ i ] = dst.data[ i ]*(1 - er[1].value);
                        dst.data[i+1] = dst.data[i+1]*(1 - er[1].value);
                        dst.data[i+2] = dst.data[i+2]*(1 - er[1].value);
                    }
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===3){
                //surprised
                for (var i = 0; i < src.data.length; i = i + 4) {
                    if(src.data[i]>50){
                        if(240>src.data[i+1]&&src.data[i+1]>120){
                            if(220>src.data[i+2]&&src.data[i+2]>70){
                            }else{
                                //dst.data[i]=0;
                                //dst.data[i+1]=0;
                                //dst.data[i+2]=0;
                            }
                        }else{
                            dst.data[ i ] = dst.data[ i ]*(1 - er[2].value);
                            dst.data[i+1] = dst.data[i+1]*(1 - er[2].value);
                            dst.data[i+2] = dst.data[i+2]*(1 - er[2].value);
                        }
                    }else{
                        dst.data[ i ] = dst.data[ i ]*(1 - er[2].value);
                        dst.data[i+1] = dst.data[i+1]*(1 - er[2].value);
                        dst.data[i+2] = dst.data[i+2]*(1 - er[2].value);
                    }
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===4){
                //funny
                for (var i = 0; i < src.data.length; i = i + 4) { 
                    dst.data[i] = src.data[i];
                    dst.data[i + 1] = src.data[i +1];
                    dst.data[i + 2] = src.data[i + 2]*(1-((er[3].value-0.5)*2));
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===5){
                //surprised & funny
                for (var i = 0; i < src.data.length; i = i + 4) { 
                    dst.data[i] = Math.abs(255-src.data[i]);
                    dst.data[i + 1] = Math.abs(255-src.data[i +1]);
                    dst.data[i + 2] = Math.abs(255-src.data[i + 2]);
                    dst.data[i + 3] = Math.abs(255-src.data[i + 3]);
                }
            }else if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===6){
                //surprised & funny
                var center = {};
                center.x = TheirFacePosition[62][0]/video.width*canvas.width;
                center.y = TheirFacePosition[62][1]/video.width*canvas.width;
                //document.getElementById("step3").innerHTML  = center.x+","+center.y;
                for(var i=0;i<canvas.height;i++){
                    for(var j=0;j<canvas.width*4;j+=4){
                        if(Math.random()<0.99){
                            var w = Math.abs(center.x-j/4);
                            var h = Math.abs(center.y-i);
                            // dst.data[i*canvas.width*4+j   ] +=  Math.sqrt(w*w+h*h);//i+j/4;
                            // dst.data[i*canvas.width*4+j + 1] += Math.sqrt(w*w+h*h);//i+j/4;
                            // dst.data[i*canvas.width*4+j + 2] += Math.sqrt(w*w+h*h);//i+j/4;
                            dst.data[i*canvas.width*4+j   ] +=  w/2+h/2;//i+j/4;
                            dst.data[i*canvas.width*4+j + 1] += w/2+h/2;//i+j/4;
                            dst.data[i*canvas.width*4+j + 2] += w/2+h/2;//i+j/4;
                            //dst.data[i + 3] = Math.abs(255-src.data[i + 3]);
                        }else{
                            dst.data[i*canvas.width*4+j   ]  =255;//i+j/4;
                            dst.data[i*canvas.width*4+j + 1] =255;//i+j/4;
                            dst.data[i*canvas.width*4+j + 2] =  0;//i+j/4;
                        }
                    }
                }
            }
            context2.putImageData(dst, 0, 0);
        }

        //document.getElementById("step3").innerHTML = EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value);
        //document.getElementById("step3").innerHTML = EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny);
    }else{
        //canvas2が自分
        context.drawImage(video2, 0, 0, canvas.width, canvas.height);
        context2.drawImage(video, 0, 0, canvas.width, canvas.height);

        //processing my Emotion
        src = context2.getImageData(0, 0, canvas.width, canvas.height);
        dst = src;
        if(TrackingType === false){
            if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===1){
                //angry
                for (var i = 0; i < src.data.length; i = i + 4) {
                    var noise = 1;
                    if(Math.random()>0.95){
                        noise = 0;
                    } 
                    dst.data[i] = src.data[i]*noise;
                    dst.data[i + 1] = src.data[i +1]*(1-er[0].value-0.4)*noise;
                    dst.data[i + 2] = src.data[i + 2]*(1-er[0].value-0.4)*noise;
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===2){
                //sad
                for (var i = 0; i < src.data.length; i = i + 4) {
                    if(src.data[i]>50){
                        if(240>src.data[i+1]&&src.data[i+1]>120){
                            if(220>src.data[i+2]&&src.data[i+2]>70){
                            }else{
                                //dst.data[i]=0;
                                //dst.data[i+1]=0;
                                //dst.data[i+2]=0;
                            }
                        }else{
                            dst.data[ i ] = dst.data[ i ]*(1 - er[1].value);
                            dst.data[i+1] = dst.data[i+1]*(1 - er[1].value);
                            dst.data[i+2] = dst.data[i+2]*(1 - er[1].value);
                        }
                    }else{
                        dst.data[ i ] = dst.data[ i ]*(1 - er[1].value);
                        dst.data[i+1] = dst.data[i+1]*(1 - er[1].value);
                        dst.data[i+2] = dst.data[i+2]*(1 - er[1].value);
                    }
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===3){
                //surprised
                for (var i = 0; i < src.data.length; i = i + 4) {
                    if(src.data[i]>50){
                        if(240>src.data[i+1]&&src.data[i+1]>120){
                            if(220>src.data[i+2]&&src.data[i+2]>70){
                            }else{
                                //dst.data[i]=0;
                                //dst.data[i+1]=0;
                                //dst.data[i+2]=0;
                            }
                        }else{
                            dst.data[ i ] = dst.data[ i ]*(1 - er[2].value);
                            dst.data[i+1] = dst.data[i+1]*(1 - er[2].value);
                            dst.data[i+2] = dst.data[i+2]*(1 - er[2].value);
                        }
                    }else{
                        dst.data[ i ] = dst.data[ i ]*(1 - er[2].value);
                        dst.data[i+1] = dst.data[i+1]*(1 - er[2].value);
                        dst.data[i+2] = dst.data[i+2]*(1 - er[2].value);
                    }
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===4){
                //funny
                for (var i = 0; i < src.data.length; i = i + 4) { 
                    dst.data[i] = src.data[i];
                    dst.data[i + 1] = src.data[i +1];
                    dst.data[i + 2] = src.data[i + 2]*(1-((er[3].value-0.5)*2));
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===5){
                //surprised & funny
                for (var i = 0; i < src.data.length; i = i + 4) { 
                    dst.data[i] = Math.abs(255-src.data[i]);
                    dst.data[i + 1] = Math.abs(255-src.data[i +1]);
                    dst.data[i + 2] = Math.abs(255-src.data[i + 2]);
                    dst.data[i + 3] = Math.abs(255-src.data[i + 3]);
                }
            }else if(EmotionProcess(er[0].value,er[1].value,er[2].value,er[3].value)===6){
                //surprised & funny
                var center = {};
                center.x = ctrack.getCurrentPosition()[62][0]/video.width*canvas.width;
                center.y = ctrack.getCurrentPosition()[62][1]/video.width*canvas.width;
                //document.getElementById("step3").innerHTML  = center.x+","+center.y;
                for(var i=0;i<canvas.height;i++){
                    for(var j=0;j<canvas.width*4;j+=4){
                        if(Math.random()<0.99){
                            var w = Math.abs(center.x-j/4);
                            var h = Math.abs(center.y-i);
                            // dst.data[i*canvas.width*4+j   ] +=  Math.sqrt(w*w+h*h);//i+j/4;
                            // dst.data[i*canvas.width*4+j + 1] += Math.sqrt(w*w+h*h);//i+j/4;
                            // dst.data[i*canvas.width*4+j + 2] += Math.sqrt(w*w+h*h);//i+j/4;
                            dst.data[i*canvas.width*4+j   ] +=  w/2+h/2;//i+j/4;
                            dst.data[i*canvas.width*4+j + 1] += w/2+h/2;//i+j/4;
                            dst.data[i*canvas.width*4+j + 2] += w/2+h/2;//i+j/4;
                            //dst.data[i + 3] = Math.abs(255-src.data[i + 3]);
                        }else{
                            dst.data[i*canvas.width*4+j   ]  =255;//i+j/4;
                            dst.data[i*canvas.width*4+j + 1] =255;//i+j/4;
                            dst.data[i*canvas.width*4+j + 2] =  0;//i+j/4;
                        }
                    }
                }
            }
            context2.putImageData(dst, 0, 0);
        }
        
        src = context.getImageData(0, 0, canvas.width, canvas.height);
        dst = src;
        if(TrackingType === false){
            if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===1){
                //angry
                for (var i = 0; i < src.data.length; i = i + 4) {
                    var noise = 1;
                    if(Math.random()>0.95){
                        noise = 0;
                    } 
                    dst.data[i] = src.data[i]*noise;
                    dst.data[i + 1] = src.data[i +1]*(1-er[0].value-0.4)*noise;
                    dst.data[i + 2] = src.data[i + 2]*(1-er[0].value-0.4)*noise;
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===2){
                //sad
                for (var i = 0; i < src.data.length; i = i + 4) {
                    if(src.data[i]>50){
                        if(240>src.data[i+1]&&src.data[i+1]>120){
                            if(220>src.data[i+2]&&src.data[i+2]>70){
                            }else{
                                //dst.data[i]=0;
                                //dst.data[i+1]=0;
                                //dst.data[i+2]=0;
                            }
                        }else{
                            dst.data[ i ] = dst.data[ i ]*(1 - er[1].value);
                            dst.data[i+1] = dst.data[i+1]*(1 - er[1].value);
                            dst.data[i+2] = dst.data[i+2]*(1 - er[1].value);
                        }
                    }else{
                        dst.data[ i ] = dst.data[ i ]*(1 - er[1].value);
                        dst.data[i+1] = dst.data[i+1]*(1 - er[1].value);
                        dst.data[i+2] = dst.data[i+2]*(1 - er[1].value);
                    }
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===3){
                //surprised
                for (var i = 0; i < src.data.length; i = i + 4) {
                    if(src.data[i]>50){
                        if(240>src.data[i+1]&&src.data[i+1]>120){
                            if(220>src.data[i+2]&&src.data[i+2]>70){
                            }else{
                                //dst.data[i]=0;
                                //dst.data[i+1]=0;
                                //dst.data[i+2]=0;
                            }
                        }else{
                            dst.data[ i ] = dst.data[ i ]*(1 - er[2].value);
                            dst.data[i+1] = dst.data[i+1]*(1 - er[2].value);
                            dst.data[i+2] = dst.data[i+2]*(1 - er[2].value);
                        }
                    }else{
                        dst.data[ i ] = dst.data[ i ]*(1 - er[2].value);
                        dst.data[i+1] = dst.data[i+1]*(1 - er[2].value);
                        dst.data[i+2] = dst.data[i+2]*(1 - er[2].value);
                    }
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===4){
                //funny
                for (var i = 0; i < src.data.length; i = i + 4) { 
                    dst.data[i] = src.data[i];
                    dst.data[i + 1] = src.data[i +1];
                    dst.data[i + 2] = src.data[i + 2]*(1-((er[3].value-0.5)*2));
                    dst.data[i + 3] = src.data[i + 3];
                }
            }else if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===5){
                //surprised & funny
                for (var i = 0; i < src.data.length; i = i + 4) { 
                    dst.data[i] = Math.abs(255-src.data[i]);
                    dst.data[i + 1] = Math.abs(255-src.data[i +1]);
                    dst.data[i + 2] = Math.abs(255-src.data[i + 2]);
                    dst.data[i + 3] = Math.abs(255-src.data[i + 3]);
                }
            }else if(EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny)===6){
                //surprised & funny
                var center = {};
                center.x = TheirFacePosition[62][0]/video.width*canvas.width;
                center.y = TheirFacePosition[62][1]/video.width*canvas.width;
                //document.getElementById("step3").innerHTML  = center.x+","+center.y;
                for(var i=0;i<canvas.height;i++){
                    for(var j=0;j<canvas.width*4;j+=4){
                        if(Math.random()<0.99){
                            var w = Math.abs(center.x-j/4);
                            var h = Math.abs(center.y-i);
                            // dst.data[i*canvas.width*4+j   ] +=  Math.sqrt(w*w+h*h);//i+j/4;
                            // dst.data[i*canvas.width*4+j + 1] += Math.sqrt(w*w+h*h);//i+j/4;
                            // dst.data[i*canvas.width*4+j + 2] += Math.sqrt(w*w+h*h);//i+j/4;
                            dst.data[i*canvas.width*4+j   ] +=  w/2+h/2;//i+j/4;
                            dst.data[i*canvas.width*4+j + 1] += w/2+h/2;//i+j/4;
                            dst.data[i*canvas.width*4+j + 2] += w/2+h/2;//i+j/4;
                            //dst.data[i + 3] = Math.abs(255-src.data[i + 3]);
                        }else{
                            dst.data[i*canvas.width*4+j   ]  =255;//i+j/4;
                            dst.data[i*canvas.width*4+j + 1] =255;//i+j/4;
                            dst.data[i*canvas.width*4+j + 2] =  0;//i+j/4;
                        }
                    }
                }
            }
            context.putImageData(dst, 0, 0);
        }
    }

    //document.getElementById("step3").innerHTML = EmotionProcess(TheirFaceEmotion.angry ,TheirFaceEmotion.sad ,TheirFaceEmotion.surprised ,TheirFaceEmotion.funny);
    
    //face ditection
    if(document.getElementById("checkbox").checked){
        if(canvasChangeFlags===false){
            if (ctrack.getCurrentPosition()) {    
                //ctrack.draw(canvas);
                try{
                    DrawPointCanvas(ctrack.getCurrentPosition(),"o",global_color);
                    DrawPointCanvas2(TheirFacePosition,"o",global_color);
                }catch(e){
                    console.log(e);
                }
            }
        }else{
            if (ctrack.getCurrentPosition()) {    
                //ctrack.draw(canvas2);
                try{
                    DrawPointCanvas2(ctrack.getCurrentPosition(),"o",global_color);
                    DrawPointCanvas(TheirFacePosition,"o",global_color);
                }catch(e){
                    console.log(e);
                }
            }
        }
    }

    if(canvasChangeFlags === false){
        if(TrackingType === false){
            drawCheekCanvas(ctrack.getCurrentPosition(), MyFaceParts.cheek.count, global_color,document.getElementById("textarea").value);
            drawForeheadCanvas(ctrack.getCurrentPosition(), MyFaceParts.forehead.count, global_color,document.getElementById("textarea").value);
            drawEyeCanvas(ctrack.getCurrentPosition(), MyFaceParts.eye.count, global_color,document.getElementById("textarea").value);
            try{
                drawCheekCanvas2(TheirFacePosition, TheirFaceParts.cheek.count, TheirFaceParts.cheek.color,TheirFaceParts.cheek.text);
                drawForeheadCanvas2(TheirFacePosition, TheirFaceParts.forehead.count, TheirFaceParts.forehead.color,TheirFaceParts.forehead.text);
                drawEyeCanvas2(TheirFacePosition, TheirFaceParts.eye.count, TheirFaceParts.eye.color,TheirFaceParts.eye.text);
            }catch(e){
                console.log("drawCheekCanvas2");
            }
            //conn.send("drawCheekCanvas(TheirFacePosition,"+MyFaceParts.cheek.count+","+global_color+","+document.getElementById("textarea").value+");");
        }
    }else{
        if(TrackingType === false){
            drawCheekCanvas2(ctrack.getCurrentPosition(), MyFaceParts.cheek.count, global_color,document.getElementById("textarea").value);
            drawForeheadCanvas2(ctrack.getCurrentPosition(), MyFaceParts.forehead.count, global_color,document.getElementById("textarea").value);
            drawEyeCanvas2(ctrack.getCurrentPosition(), MyFaceParts.eye.count, global_color,document.getElementById("textarea").value);
            try{
                drawCheekCanvas(TheirFacePosition, TheirFaceParts.cheek.count, TheirFaceParts.cheek.color,TheirFaceParts.cheek.text);
                drawForeheadCanvas(TheirFacePosition, TheirFaceParts.forehead.count, TheirFaceParts.forehead.color,TheirFaceParts.forehead.text);
                drawEyeCanvas(TheirFacePosition, TheirFaceParts.eye.count, TheirFaceParts.eye.color,TheirFaceParts.eye.text);
            }catch(e){
                console.log("drawCheekCanvas2");
            }
            //conn.send("drawCheekCanvas2(TheirFacePosition,"+MyFaceParts.cheek.count+","+global_color+","+document.getElementById("textarea").value+");");
        }
    }
    
    
    try{
        conn.send("SendEmotion("+er[0].value+","+er[1].value+","+er[2].value+","+er[3].value+");");
    }catch(e){
        console.log(e);
    }
    /*
    document.getElementById(0).innerHTML = "angry     : "+TheirFaceEmotion.angry;
    document.getElementById(1).innerHTML = "sad       : "+TheirFaceEmotion.sad;
    document.getElementById(2).innerHTML = "surprised : "+TheirFaceEmotion.surprised;
    document.getElementById(3).innerHTML = "funny     : "+TheirFaceEmotion.funny;*/
    document.getElementById(0).innerHTML = "angry     : "+er[0].value;
    document.getElementById(1).innerHTML = "sad       : "+er[1].value;
    document.getElementById(2).innerHTML = "surprised : "+er[2].value;
    document.getElementById(3).innerHTML = "funny     : "+er[3].value;
    
    delete src,dst;
    
    if(TrackingType === false){
        SendFacePosition(ctrack.getCurrentPosition());
    }else{
        SendFacePosition(0);
    }
    return;
};

var ec = new emotionClassifier();
ec.init(emotionModel);
var emotionData = ec.getBlank();

function SendFacePosition(array){
    if(array === 0){
        array = [];
        for (var i = 0;i<70 ; i++) {
            text += "["+0+","+0+"]";
            if(i===array.length-1){
                text+="];";
            }else{
                text+=",";
            }
        }
    }
    var text="[";
    for (var i = 0;i<array.length ; i++) {
        text += "["+array[i][0]+","+array[i][1]+"]";
        if(i===array.length-1){
            text+="];";
        }else{
            text+=",";
        }
    }

    try{
        conn.send("TheirFacePosition = "+text);
    }catch(e){
        console.log(e);
    }
}

var TheirFacePosition = [];

var TheirFaceEmotion = {
    angry:0,
    sad:0,
    surprised:0,
    funny:0
};

function SendEmotion(angry,sad,surprised,funny){
    TheirFaceEmotion.angry = angry;
    TheirFaceEmotion.sad = sad;
    TheirFaceEmotion.surprised = surprised;
    TheirFaceEmotion.funny = funny;
}

function EmotionProcess(angry,sad,surprised,funny){
    var em = 0;
    if(angry<0.5 && sad<0.5 && surprised<0.5 && funny<0.5){
        em = 0;
    }else if(angry>0.1 && sad<0.8 && surprised<0.8 && funny<0.8){
        //angry
        em = 1;
    }else if(angry<0.8 && sad>0.7 && surprised<0.8 && funny<0.8){
        //sad
        em = 2;
    }else if(angry<0.8 && sad<0.8 && surprised>0.8 && funny<0.8){
        //surprised
        em = 3;
    }else if(angry<0.8 && sad<0.8 && surprised>0.8 && funny>0.8){
        //funny and surprised
        em = 4;
    }else if(angry<0.8 && sad>0.7 && surprised<0.8 && funny>0.8){
        //funny and sad
        em = 5;
    }else if(funny>0.8){
        //funny
        em = 6
    }else{
        em = 7;
    }
    return em;
}

//**********************************overlay*****************************
var MousePoint = {
    x1:0,
    y1:0,
    x2:0,
    y2:0
};

var mouseFlag;
var DrawLineSize = 8;
var DrawLineColor = "#000";

overlay.addEventListener("mousedown",function(e){
    var width_top = overlay.getBoundingClientRect().left;
    var height_top = overlay.getBoundingClientRect().top;
    MousePoint.x1 = parseInt(e.clientX - width_top,10)/overlay.width;
    MousePoint.y1 = +parseInt(e.clientY - height_top,10)/overlay.height;
    MousePoint.x2 = MousePoint.x1;
    MousePoint.y2 = MousePoint.y1;
    //DrawLineColor = "rgb("+Math.ceil(255*Math.random())+","+Math.ceil(255*Math.random())+","+Math.ceil(255*Math.random())+")";
    DrawLineColor = global_color;
    //DrawLineSize  = Math.ceil(Math.random()*10);
    mouseFlag = true;
});

overlay.addEventListener("mouseup",function(){
    mouseFlag = false;
});

overlay.addEventListener("mousemove", function(e){
    if(mouseFlag === true){
        var lineWidth = 30;
        contextOverlay.fillStyle = "#0F0";
        var width_top = overlay.getBoundingClientRect().left;
        var height_top = overlay.getBoundingClientRect().top;
        
        //var x,y;
        MousePoint.x1 = parseInt(e.clientX - width_top,10)/overlay.width;
        MousePoint.y1 = +parseInt(e.clientY - height_top,10)/overlay.height;
        if(global_color===-1){
            DrawLineColor = "rgb("+Math.ceil(255*Math.random())+","+Math.ceil(255*Math.random())+","+Math.ceil(255*Math.random())+")";
        }

        DrawLineOverlay(MousePoint.x1,MousePoint.y1,MousePoint.x2,MousePoint.y2,DrawLineColor,DrawLineSize);

        document.getElementById("mouse").innerHTML = MousePoint.x1 +" : "+MousePoint.y1+" : "+MousePoint.x2+" : "+MousePoint.y2;
        //DrawFillRectOverlay(x,y,"#F00",lineWidth)
        $(document).ready(function() {
            var msg = "DrawLineOverlay("+MousePoint.x1+","+MousePoint.y1+","+MousePoint.x2+","+MousePoint.y2+",'"+DrawLineColor+"',"+DrawLineSize+")";
            try{
                conn.send(msg);
            }catch(e){
                console.log(e);
            }
            //document.getElementById("messages").innerHTML = msg;
        }); 
        MousePoint.x2 = MousePoint.x1;
        MousePoint.y2 = MousePoint.y1;
    }else{
        moseFlag= false;
    }

});

document.getElementById("clear-overlay").onclick = function(){
    var dst = contextOverlay.getImageData(0, 0, overlay.width, overlay.height);
    for (var i = 0; i < dst.data.length; i = i + 4) {
        dst.data[i + 3] = 0;
    }
    contextOverlay.putImageData(dst, 0, 0);
};


function DrawFillRectOverlay(x,y,color,size){
    if(size===undefined){
        size=10;
    }
    if(color===undefined){
        color="#0F0";
    };
    contextOverlay.fillStyle = color;
    contextOverlay.lineWidth = size;
    x = overlay.width*x;
    y = overlay.height*y;
    contextOverlay.fillRect(x,y,size,size);
}

function DrawLineOverlay(x1,y1,x2,y2,color,size){
    if(size===undefined){
        size=10;
    }
    if(color===undefined){
        color="#0F0";
    };
    
    x1 = overlay.width*x1;
    y1 = overlay.height*y1;
    x2 = overlay.width*x2;
    y2 = overlay.height*y2;

    contextOverlay.fillStyle = color;
    contextOverlay.strokeStyle = color;
    contextOverlay.lineWidth = size;
    contextOverlay.beginPath();
    contextOverlay.moveTo(x1,y1);
    contextOverlay.lineTo(x2,y2);
    contextOverlay.stroke();
    //contextOverlay.fillRect(x,y,size,size);
}

//********************** send text ******************

document.getElementById("send-text").onclick = function(){
    var x = Math.random()*0.94;
    var y = Math.random();
    var msg = document.getElementById("textarea").value;
    var font = Math.ceil(Math.random()*70)+'px "Arial"';
    var color="#FFF";
    if(global_color===-1){
        color = "rgb("+Math.ceil(255*Math.random())+","+Math.ceil(255*Math.random())+","+Math.ceil(255*Math.random())+")";
    }else{
        color = global_color;
    }

    var sendingText = "";
    DrawTextOverlay(msg,x,y,color,font);
    sendingText = "DrawTextOverlay('"+msg+"',"+x+","+y+",'"+color+"','"+font+"')";

    try{
        conn.send(sendingText);
    }catch(e){
        console.log(e);
    }
};

function DrawTextOverlay(text,x,y,color,font){
    text = text.split("\n").join(". ");
    x = Math.ceil(x*overlay.width);
    y = Math.ceil(y*overlay.height);
    contextOverlay.fillStyle = color;
    contextOverlay.font = font;
    contextOverlay.fillText(text,x,y);
}

function DrawTextCanvas(text,x,y,color,font){
    text = text.split("\n").join(". ");
    //x = Math.ceil(x*canvas.width);
    //y = Math.ceil(y*canvas.height);
    context.fillStyle = color;
    context.font = font;
    context.fillText(text,x,y);
}

function DrawTextCanvas2(text,x,y,color,font){
    text = text.split("\n").join(". ");
    //x = Math.ceil(x*canvas2.width);
    //y = Math.ceil(y*canvas2.height);
    context2.fillStyle = color;
    context2.font = font;
    context2.fillText(text,x,y);
}

function sendFacePoint(x){
    document.getElementById("messages").innerHTML = x;
}

//***************************send Emotion***************


function DrawFaceLineCanvas(array){
    //document.getElementById("messages2").innerHTML = array.length;
    for(var i=0;i<array.length;i++){
        //DrawLineCanvas(array[i][0],array[i][1],array[i+1][0],array[i+1][0],"#F00",1);
        context.fillText(String(i),array[i][0],array[i][1]);
    }
}

function DrawLineCanvas(x1,y1,x2,y2,color,size){
    if(size===undefined){
        size=10;
    }
    if(color===undefined){
        color="#0F0";
    };
    
    x1 = canvas.width*x1;
    y1 = canvas.height*y1;
    x2 = canvas.width*x2;
    y2 = canvas.height*y2;

    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(x1,y1);
    context.lineTo(x2,y2);
    context.stroke();
    //contextOverlay.fillRect(x,y,size,size);
}

function DrawPointCanvas(array,text,color){
    if(text===undefined){
        text="o"
    }
    if(color===undefined){
        //context.fillStyle = "#fff";
    }else if(color===-1){
        context.fillStyle = "rgb("+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+")";
    }else{
        context.fillStyle = color;
    }
    context.font = '5px "Arial"';
    for(var i=0;i<array.length;i++){
        context.fillText(text,array[i][0]/video.width*canvas.width,array[i][1]/video.width*canvas.width);
    }
}

function DrawPointCanvas2(array,text,color){
    if(text===undefined){
        text="o"
    }
    if(color===undefined){
        //context.fillStyle = "#fff";
    }else if(color===-1){
        context2.fillStyle = "rgb("+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+")";
    }else{
        context2.fillStyle = color;
    }
    context2.font = '5px "Arial"';
    for(var i=0;i<array.length-1;i++){
        context2.fillText(text,array[i][0]/video.width*canvas.width,array[i][1]/video.width*canvas.width);
    }
}

var MyFaceParts = {
    cheek:{
        count:0,
        text :"",
        color:""
    },
    forehead:{
        count:0,
        text :"",
        color:""
    },
    eye:{
        count:0,
        text :"",
        color:""
    },
    mouth:{
        count:0,
        text :"",
        color:""
    }
}

var TheirFaceParts = {
    cheek:{
        count:0,
        text :"",
        color:"#FFF"
    },
    forehead:{
        count:0,
        text :"",
        color:"#FF"
    },
    eye:{
        count:0,
        text :"",
        color:"#FFF"
    },
    mouth:{
        count:0,
        text :"",
        color:"#FFF"
    }
}

document.getElementById("cheek").onclick = function(){
    MyFaceParts.cheek.count++;
    conn.send("TheirFaceParts.cheek.text ="+"'"+document.getElementById("textarea").value+"'");
    conn.send("TheirFaceParts.cheek.color ="+"'"+global_color+"'");
    conn.send("TheirFaceParts.cheek.count ="+MyFaceParts.cheek.count);
};

document.getElementById("forehead").onclick = function(){
    MyFaceParts.forehead.count++;
    conn.send("TheirFaceParts.forehead.text ="+"'"+document.getElementById("textarea").value+"'");
    conn.send("TheirFaceParts.forehead.color ="+"'"+global_color+"'");
    conn.send("TheirFaceParts.forehead.count = "+MyFaceParts.forehead.count);
};
document.getElementById("eye").onclick = function(){
    MyFaceParts.eye.count++;
    conn.send("TheirFaceParts.eye.text ="+"'"+document.getElementById("textarea").value+"'");
    conn.send("TheirFaceParts.eye.color ="+"'"+global_color+"'");
    conn.send("TheirFaceParts.eye.count ="+MyFaceParts.eye.count);
};
document.getElementById("mouth").onclick = function(){
    MyFaceParts.mouth.count++;
    conn.send("TheirFaceParts.mouth.text ="+"'"+document.getElementById("textarea").value+"'");
    conn.send("TheirFaceParts.mouth.color ="+"'"+global_color+"'");
    conn.send("TheirFaceParts.mouth.count ="+MyFaceParts.mouth.count);
};

function drawCheekCanvas(array,n,color,text){
    if(n>3){
        n=n%5;
    }
    if(color===-1){
        context.fillStyle = "rgb("+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+")";
    }else{
        context.fillStyle = color;
    }
    context.font = Math.ceil(Math.abs(array[1][0]/video.width*canvas.width-array[34][0]/video.width*canvas.width)/2.5)+'px "Arial"';
    var x1,y1,x2,y2;
    x1 = array[1][0]/video.width*canvas.width+Math.abs(array[1][0]/video.width*canvas.width-array[34][0]/video.width*canvas.width)/2;
    y1 = array[34][1]/video.width*canvas.width;
    x2 = array[40][0]/video.width*canvas.width+Math.abs(array[40][0]/video.width*canvas.width-array[13][0]/video.width*canvas.width)/2-20;
    y2 = array[40][1]/video.width*canvas.width;
    if(n===0){
        
    }else if(n===1){
        context.fillText("！",x1,y1);
        context.fillText("！",x2,y2);
    }else if(n===2){
        context.fillText("？",x1,y1);
        context.fillText("？",x2,y2);
    }else if(n===3){
        context.fillText("$",x1,y1);
        context.fillText("$",x2,y2);
    }else{
        if(text===""){
            text="●";
        }
        context.fillText(text,x1,y1);
        context.fillText(text,x2,y2);
    }
}

function drawForeheadCanvas(array,n,color,text){
    if(n>3){
        n=n%5;
    }
    if(color===-1){
        context.fillStyle = "rgb("+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+")";
    }else{
        context.fillStyle = color;
    }
    context.font = Math.ceil(Math.abs(array[1][0]/video.width*canvas.width-array[34][0]/video.width*canvas.width))+'px "Arial"';
    var x1,y1,x2,y2;
    x1 = array[33][0]/video.width*canvas.width-20;
    y1 = array[21][1]/video.width*canvas.width;
    //x2 = array[40][0]/video.width*canvas.width+Math.abs(array[40][0]/video.width*canvas.width-array[13][0]/video.width*canvas.width)/2-20;
    //y2 = array[40][1]/video.width*canvas.width;
    if(n===0){
        
    }else if(n===1){
        context.fillText("！",x1,y1);
        //context.fillText("！",x2,y2);
    }else if(n===2){
        context.fillText("？",x1,y1);
        //context.fillText("？",x2,y2);
    }else if(n===3){
        context.fillText("肉",x1,y1);
        //context.fillText("$",x2,y2);
    }else{
        if(text===""){
            text="●";
        }
        context.fillText(text,x1,y1);
        //context.fillText(text,x2,y2);
    }
}
function drawEyeCanvas(array,n,color,text){
    if(n>3){
        n=n%5;
    }
    if(color===-1){
        context.fillStyle = "rgb("+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+")";
    }else{
        context.fillStyle = color;
    }
    context.font = Math.ceil(Math.abs(array[1][0]/video.width*canvas.width-array[34][0]/video.width*canvas.width)/1.8)+'px "Arial"';
    var x1,y1,x2,y2;
    x1 = array[27][0]/video.width*canvas.width-10;
    y1 = array[27][1]/video.width*canvas.width;
    x2 = array[32][0]/video.width*canvas.width-10;
    y2 = array[32][1]/video.width*canvas.width;
    if(n===0){
        
    }else if(n===1){
        context.fillText("＄",x1,y1);
        context.fillText("＄",x2,y2);
    }else if(n===2){
        context.fillText("●",x1,y1);
        context.fillText("●",x2,y2);
    }else if(n===3){
        context.fillText("♥",x1,y1);
        context.fillText("♥",x2,y2);
    }else{
        if(text===""){
            text="●";
        }
        context.fillText(text,x1,y1);
        context.fillText(text,x2,y2);
    }
}

//function drawMouthCanvas(array,n){}

function drawCheekCanvas2(array,n,color,text){
    if(n>3){
        n=n%5;
    }
    if(color===-1){
        context2.fillStyle = "rgb("+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+")";
    }else{
        context2.fillStyle = color;
    }
    context2.font = Math.ceil(Math.abs(array[1][0]/video.width*canvas.width-array[34][0]/video.width*canvas.width)/2.5)+'px "Arial"';
    var x1,y1,x2,y2;
    x1 = array[1][0]/video.width*canvas.width+Math.abs(array[1][0]/video.width*canvas.width-array[34][0]/video.width*canvas.width)/2;
    y1 = array[34][1]/video.width*canvas.width;
    x2 = array[40][0]/video.width*canvas.width+Math.abs(array[40][0]/video.width*canvas.width-array[13][0]/video.width*canvas.width)/2-20;
    y2 = array[40][1]/video.width*canvas.width;
    if(n===0){
        
    }else if(n===1){
        context2.fillText("！",x1,y1);
        context2.fillText("！",x2,y2);
    }else if(n===2){
        context2.fillText("？",x1,y1);
        context2.fillText("？",x2,y2);
    }else if(n===3){
        context2.fillText("$",x1,y1);
        context2.fillText("$",x2,y2);
    }else{
        if(text===""){
            text="●";
        }
        context2.fillText(text,x1,y1);
        context2.fillText(text,x2,y2);
    }
}

function drawForeheadCanvas2(array,n,color,text){
    if(n>3){
        n=n%5;
    }
    if(color===-1){
        context2.fillStyle = "rgb("+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+")";
    }else{
        context2.fillStyle = color;
    }
    context.font = Math.ceil(Math.abs(array[1][0]/video.width*canvas.width-array[34][0]/video.width*canvas.width))+'px "Arial"';
    var x1,y1,x2,y2;
    x1 = array[33][0]/video.width*canvas.width-20;
    y1 = array[21][1]/video.width*canvas.width;
    //x2 = array[40][0]/video.width*canvas.width+Math.abs(array[40][0]/video.width*canvas.width-array[13][0]/video.width*canvas.width)/2-20;
    //y2 = array[40][1]/video.width*canvas.width;
    if(n===0){
        
    }else if(n===1){
        context2.fillText("！",x1,y1);
        //context.fillText("！",x2,y2);
    }else if(n===2){
        context2.fillText("？",x1,y1);
        //context.fillText("？",x2,y2);
    }else if(n===3){
        context2.fillText("肉",x1,y1);
        //context.fillText("$",x2,y2);
    }else{
        if(text===""){
            text="●";
        }
        context2.fillText(text,x1,y1);
        //context.fillText(text,x2,y2);
    }
}
function drawEyeCanvas2(array,n,color,text){
    if(n>3){
        n=n%5;
    }
    if(color===-1){
        context2.fillStyle = "rgb("+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+","+Math.ceil(Math.random()*255)+")";
    }else{
        context2.fillStyle = color;
    }
    context.font = Math.ceil(Math.abs(array[1][0]/video.width*canvas.width-array[34][0]/video.width*canvas.width)/2.5)+'px "Arial"';
    var x1,y1,x2,y2;
    x1 = array[27][0]/video.width*canvas.width-10;
    y1 = array[27][1]/video.width*canvas.width;
    x2 = array[32][0]/video.width*canvas.width-10;
    y2 = array[32][1]/video.width*canvas.width;
    if(n===0){
        
    }else if(n===1){
        context2.fillText("＄",x1,y1);
        context2.fillText("＄",x2,y2);
    }else if(n===2){
        context2.fillText("●",x1,y1);
        context2.fillText("●",x2,y2);
    }else if(n===3){
        context2.font = Math.ceil(Math.abs(array[1][0]/video.width*canvas.width-array[34][0]/video.width*canvas.width)/1)+'px "Arial"';
        context2.fillText("♥",x1,y1);
        context2.fillText("♥",x2,y2);
    }else{
        if(text===""){
            text="●";
        }
        context2.fillText(text,x1,y1);
        context2.fillText(text,x2,y2);
    }
}
