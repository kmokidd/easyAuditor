var GLOBAL = {
    "song_id": null,
    "audio": null,
    "songName": null,
    flag: 0
}

var timeHandler = {
    // change to sec module
    timeInvert: function(time){
        var tmp = time.split(':');
        return parseInt(tmp[0])*60+parseInt(tmp[1]);
    },
    // change to mic:sec module
    timeDispose: function(time){
        var min = parseInt(time/60);
        var snd = parseInt(time%60);
        min = min>=10? min: '0'+min;
        snd = snd>=10? snd: '0'+snd;
        return min+":"+ snd;
    }
};

var reset = function($processYet, $currentTime, $duration, $mainControl){
    $processYet.width('0');
    $currentTime.html('00:00');
    $duration.html('00:00');

    $mainControl.find('.icon-cc-play').css('display', 'inline-block');
    $mainControl.find('.icon-cc-stop').css('display', 'none');
}

// initialize
var set = function(orginalData){
    var songInfo = {
        "artist": null,
        "track": null,
        "album": null,
        "picture_path": null,
        "lrc_path": null,
        "music_path": null,
        "song_id": null
    };
    var temp = orginalData.split('_');
    songInfo.artist = temp[0];
    songInfo.album = temp[1];
    songInfo.track = temp[2];
    songInfo.picture_path = temp[3];
    songInfo.lrc_path = temp[4];
    songInfo.music_path = temp[5];
    songInfo.song_id = temp[6];

    $('.songInfo .singer').html(songInfo.artist);
    $('.songInfo .songName').html(songInfo.track);
    $('.songInfo .album').html(songInfo.album);

    return songInfo;
}
var init = function($class, song, $duration, songInfo){
    console.log(songInfo);

    /*first loading, the process is 0 and controller is 'play'*/
    reset($('.processYet'),  $('.currentTime'), $('.allTime'), $('.main-controller'));

    /*set audio attributes*/
    GLOBAL.song_id = songInfo.song_id
    GLOBAL.audio = $class;

    //GLOBAL.audio.src = "./mp3/"+song;
    GLOBAL.audio.src = songInfo.music_path;

    GLOBAL.songName = songInfo.track;

    // get lrc text
    lrcHandler.getLrc(songInfo.lrc_path, $('.lrc'));
    console.log("song info's lp: "+ songInfo.lrc_path);

    GLOBAL.audio.addEventListener("loadedmetadata", function(){
        // console.log("in loadedmetadata");
        player.setDuration(); //设置好时间长度
    });
    GLOBAL.audio.addEventListener("play",function(){
        console.log("in play");
    });
    GLOBAL.audio.addEventListener("ended", function(){
        console.log("in end");
        reset($('.processYet'),  $('.currentTime'), $('.allTime'), $('.main-controller'));
    });
    GLOBAL.audio.addEventListener('timeupdate', function(){
        var length = $('.process').width();
        var currentTime = timeHandler.timeDispose(GLOBAL.audio.currentTime);
        var currentLength = GLOBAL.audio.currentTime/GLOBAL.audio.duration*length;

        $('.currentTime').html(currentTime);
        $('.processYet').width(currentLength);

        // scroller lrc
        lrcHandler.scrollLrc(timeHandler.timeInvert(currentTime), $('.lrc p'), $('.lrc'));
    });

    cut.init();
}

var player = {
    "preTime": null,
    "play": function($control){
        GLOBAL.audio.play();
        $control.find('.icon-cc-play').css('display', 'none');
        $control.find('.icon-cc-stop').css('display', 'inline-block');
    },
    "pause": function($control){
        GLOBAL.audio.pause();
        $control.find('.icon-cc-play').css('display', 'inline-block');
        $control.find('.icon-cc-stop').css('display', 'none');
    },
    "setDuration": function(){
        $('.allTime').html(timeHandler.timeDispose(GLOBAL.audio.duration));
    },
    "setMute": function(){
        $('.volProcessYet').css('width', 0);
        GLOBAL.audio.muted = true;
    },
    "setMaxVolum": function(){
        var length = $('.volProcess').css('width');
        $('.volProcessYet').css('width', length);
        GLOBAL.audio.muted = false;
        GLOBAL.audio.volume = 1;
    },
    "setProcess": function($process, $processYet, event){
        var process = $process.offset();
        var starPoint = process.left;
        var length = $process.width();
        var toWhere = event.clientX - starPoint;
        var percentage = toWhere/length;

        if(($process.attr('class')=='volProcess')||($process.attr('class')=='volProcessYet')){
            GLOBAL.audio.muted = false;
            GLOBAL.audio.volume = parseFloat(percentage);
            $processYet.width(toWhere);
        }
        else if(($process.attr('class')=='process')||($process.attr('class')=='processYet')){
            console.log("in process branch");
            GLOBAL.audio.currentTime = percentage*GLOBAL.audio.duration;
            $processYet.width(toWhere);
            GLOBAL.audio.play();

            /*set main controller*/
            $('.icon-cc-stop').css('display', 'inline-block');
            $('.icon-cc-play').css('display', 'none');
        }
    },
    "individual": function(index, playWho_id){
        setTimeout(function(){
            playWho_id.play();
        }, player.preTime*1000);
    },
    "playPartial": function(){
        // play music in the "lab" one by one
        var audio_items = $('.cutter-room audio');
        $.each(audio_items, function(index, item){
            var item_id = document.getElementById($(item).attr('id'));
            item_id.currentTime = $(item).data('start');

            if(index==0){
                item_id.play();
                player.preTime = $(item).data('end')-$(item).data('start');
                console.log(player.preTime);
                console.log("in 0");
            }
            else{
                player.individual(index, item_id);
                player.preTime += $(item).data('end')-$(item).data('start');
                console.log(player.preTime);
            }

            setInterval(function(){
                if (item_id.currentTime>=$(item).data('end')) {
                    item_id.pause();
                };
            }, 500);
        });
    },
    "trash": function(){
        // clean the lab including other <audio>
        $('.cutter-room audio').remove();
        $('.cutter-room .container').empty();
    }
}

// search
var search = {
    "successful": function(data){
        $('.search-result').find('li').remove();
        $.each(data, function(i, node){
            var data_id = node.artist+'_'+node.album+'_'+node.track+'_'+node.picture_path+'_'+node.lrc_path+'_'+node.music_path+'_'+node.song_id;
            var li = '<li id="'+node.song_id+'" data-id="'+data_id+'"><span class="song">'+node.track+'</span><span class="seperator">-</span><span class="singer">'+node.artist+'</span><i class="icon-add"></i></li>';
            $('.search-result').append(li);
        });
    },
    "error": function(){
        console.log("error");
    },
    "add2list": function($song){
        var songInfo = set($song.data('id'));

        var $addTo = $('.cutter-songList ul');
        // to be add into each li
        var data_id = songInfo.artist+'_'+songInfo.album+'_'+songInfo.track+'_'+songInfo.picture_path+'_'+songInfo.lrc_path+'_'+songInfo.music_path+'_'+songInfo.song_id;
        var addWhat = '<li data-id="'+data_id+'"><i class="icon-play"></i><span class="song">'+songInfo.track+'</span><span class="singer">'+songInfo.artist+'</span></li>';

        $addTo.append(addWhat);
        $('.search-result li').remove(); // clean trash result
    }
}


// cut audio segment
var cut = {
    "startTime": null,
    "endTime": null,
    "start" : '<i class="icon-scissor" id="start"></i>',
    "end" : '<i class="icon-scissor" id="end"></i>',
    "audio_seg": '<div class="seg-container"><span class="seg-operations"><i title="复制" class="icon-copy"></i><i title="向前粘贴" class="icon-paste-front"></i><i title="向后粘贴" class="icon-paste-back"></i><i title="删除" class="icon-delete"></i></span><span class="seg-audio"></span></div>',
    "init": function(){
        $('.icon-scissor').remove();
    },
    "setCutPoint": function(scissor_id){
        // get current .processYet position
        var offset_left = $('.processYet').width();
        var percentage = offset_left/$('.process').width();

        // put .icon-scissor on the current position
        if(scissor_id == 'start'){
            $('.process-container').append(cut.start);
            cut.startTime = percentage*GLOBAL.audio.duration;
        }
        else{
            $('.process-container').append(cut.end);
            cut.endTime = percentage*GLOBAL.audio.duration;
        }
        $('#'+scissor_id).css('left', offset_left+"px");
    },
    "successful": function(src){
        var container_width = $('.cutter-room .container').width();
        var segment_Len = parseInt($('#end').css('left'))-parseInt($('#start').css('left'));
        var segs = $('.cutter-room .container').find('.seg-container');
        var audio_self = "<audio id='player_"+GLOBAL.song_id+"'>";

        // add one more segment for the new cut part
        $('.cutter-room').append(audio_self);
        $('.cutter-room .container').append(cut.audio_seg);
        $('.seg-container:last-child').attr('id', GLOBAL.song_id);
        $('#'+GLOBAL.song_id).attr('data-originw', segment_Len);
        $('#'+GLOBAL.song_id).find('.seg-audio').html(GLOBAL.songName); // show song name in the span

        var new_seg = document.getElementById("player_"+GLOBAL.song_id);
        $("#player_"+GLOBAL.song_id).data('start', cut.startTime);
        $("#player_"+GLOBAL.song_id).data('end', cut.endTime);
        //new_seg.src = GLOBAL.audio.src; //sth wrong with this line
        new_seg.src = GLOBAL.audio.src+"?foo="+(new Date().getTime());
        //$(new_seg).data('src', GLOBAL.audio.src);

        if(segs.length == 0){
            $('#'+GLOBAL.song_id).find('.seg-audio').css('width', container_width);
        }
        // if there have been already several segments, re-calculate each width
        else{
            var sum=0, count=0;
            while (count < segs.length){
                sum += parseInt($(segs).eq(count).data('originw'));
                count +=1;
            }
            // including the newest segment, the whole width
            sum += $('#'+GLOBAL.song_id).data('originw');

            var originwArr = new Array(); // to store each %
            segs = $('.cutter-room .container').find('.seg-container');
            $.each(segs, function(index){
                var percentage = segs.eq(index).data('originw')/sum;
                var currentLen = percentage*(container_width-4-5*segs.length);
                segs.eq(index).find('.seg-audio').css('width',currentLen+"px");

                originwArr.push(percentage);
            });
        }
    },
    "pass2back": function($parent){
        // Get audio seg information
        var seg_audio = $parent.find('.seg-container');
        var tobePass = "";
        $.each(seg_audio, function(i, node){
            var song_id = $(node).attr('id');
            var start = $("#player_"+song_id).data('start');
            var end = $("#player_"+song_id).data('end');
            tobePass += song_id+"|"+start+"|"+end+"_";
        });
        console.log(tobePass);

        //pass to the backend
        $.ajax({
            type: "GET",
            url: "result.json",
            //url: "/montage_operation/",
            dataType: 'json',
            data: tobePass,
            success: function(data){
                init(document.getElementById("player"),'.mp3', $('.allTime'), data);
            },
            error: function(){
                search.error();
            }
        });
    }
}

$(function(){
    /*initialize*/
    var songInfo = set($('audio').data('id'));
    if(songInfo.song_id.length!=0)
        search.add2list($('audio')); // first time jump to montage.html, the picked song has already in the list
    init(document.getElementById("player"), "xinQiang.mp3", $('.allTime'), songInfo);

    /* control play or stop music.*/
    $('.icon-cc-play').click(function(){
        player.play($('.main-controller'));
    });
    $('.icon-cc-stop').click(function(){
        player.pause($('.main-controller'));
    });

    /*keyboard control*/
    $(document).keydown(function(e){
        var key = (e.keyCode) || (e.which) || (e.charCode);
        if(key =='32'){
            if($('.icon-cc-stop').css('display')!='none')
                player.pause($('.main-controller'));
            else
                player.play($('.main-controller'));
        }
    });

    /* control song process*/
    $('.process').click(function(){
        player.setProcess($(this), $(this).siblings().eq(0), event);
    });
    $('.processYet').click(function(){
        player.setProcess($(this).siblings().eq(0), $(this), event);
    });

/*control volumn*/
    /*mute or un-mute*/
    $('.icon-min-vol').click(function(){
        player.setMute();
    });
    $('.icon-max-vol').click(function(){
        player.setMaxVolum();
    });

    /*turn up or donw vol*/
    $('.volProcess').click(function(){
        player.setProcess($(this), $(this).siblings().eq(0), event);
    });
    $('.volProcessYet').click(function(){
        player.setProcess($(this).siblings().eq(0), $(this), event);
    });

/* control process*/
    $('.process-container .process').click(function(){
        player.setProcess($(this), $(this).siblings().eq(1), event);
    })
    $('.process-container .processYet').click(function(){
        player.setProcess($(this).siblings().eq(1), $(this), event);
    });

/* search songs and add them into .cutter-songlist*/
    $('.search input').keyup(function(){
        var searchWhat = $(this).val();
        if(searchWhat.trim().length!=0){
            $.ajax({
                type: "GET",
                //url: "/montage/",
                url: "test.json",
                dataType: "json",
                data: searchWhat,
                success: function(data){
                    console.log(data);
                    if(searchWhat.length>0)
                        search.successful(data);
                    else // if input nothing, empty the .search-result
                        $('.search-result li').remove();
                },
                error: function(){
                    search.error();
                }
            });
        }else{
            // if input is nothing, don't request data
            // and remove the lis
            $('.search-result').find('li').remove();
        }
    });
    /*add new song into .cutter-songlist*/
    $('.search-result').delegate('li', 'click', function(){
        search.add2list($(this));
    });


/* play other songs from song-list*/
    $('.cutter-songList').delegate('li', 'click', function(){
        var cut_songInfo = set($(this).data('id'));
        init(document.getElementById("player"),'.mp3', $('.allTime'), cut_songInfo);
        event.preventDefault();
    });

/* montage */
    $('.icon-cut').click(function(){
        if($('.icon-scissor').length == 0)
            cut.setCutPoint('start');
        else if ($('.icon-scissor').length == 1)
            cut.setCutPoint('end');
        else
            return false;
    });
    $('.icon-select').click(function(){
        cut.successful(GLOBAL.audio.src);
    });
/*control the materials*/
    $('.cutter-room .container').delegate('.seg-container', 'mouseover mouseout', function(){
        if(event.type == 'mouseover')
            $(this).children().eq(0).show();
        else
            $(this).children().eq(0).hide();
    });
    $('.cut-btn').click(function(){
        var icon_class = $(this).children().attr('class');
        if(icon_class=='icon-cr-power'){
            //把缓存区的mp3文件的id和start end时间和在一起 传给后台
            cut.pass2back($('.cutter-room .container'));
        }
        else if(icon_class=='icon-cr-play'){
            player.playPartial();
        }
        else{
            player.trash();
        }
    });
});

// 用server.js运行的时候 不能拉动进度条了
// 故事.mp3 duration有错

// 在grunt下没有上述问题