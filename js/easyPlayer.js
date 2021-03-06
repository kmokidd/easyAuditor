/************************
jquery-easyPlayer v1.0

requires jQuery 1.8+
************************/


(function (factory){
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else{
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    //the player's and song's default config
    var Global = {
        flag: 0
    };
    var _defaults = {
        audio: document.getElementById('player'),
        songInfo: {
            songId: null,
            artist: null,
            track: null,
            album: null,
            picture_path: null,
            lrc_path: '/lrc/xinqiang.lrc',
            audio_path: '/mp3/xinqiang.mp3'
        },
        playerCtrlClass: {
            singer: 'singer',
            songName: 'songName',
            album: 'album',
            mainCtrl: 'ctrlPanel',
            playCtrl: 'icon-cc-play',
            pauseCtrl: 'icon-cc-stop',
            duration: 'allTime',
            currentTime: 'currentTime',
            process: 'process',
            processYet: 'processYet',
            prevSong: 'icon-cc-prev',
            nextSong: 'icon-cc-next',
            songItem: 'songInfo',
            songList: 'sList',
            lrcWrapper: 'lrcWrapper',
            lrc: 'lrc'
        }
    };

    //privacy methods
    var _privateMethods = {
        timeHandler: {
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
        },
        infoParser: function(originalData){
            var newData = {
                    songInfo:{
                        songId: null,
                        artist: null,
                        track: null,
                        album: null,
                        picture_path: null,
                        lrc_path: null,
                        audio_path: null
                    }
                };
            var temp = originalData.split('_');
            newData.songInfo.songId = temp[0];
            newData.songInfo.artist = temp[1];
            newData.songInfo.track = temp[2];
            newData.songInfo.album = temp[3];
            newData.songInfo.picture_path = temp[4];
            newData.songInfo.lrc_path = temp[5];
            newData.songInfo.audio_path = temp[6];

            return newData;
        },
        reset: function($processYet, $currentTime, $duration, $mainControl, $lrcWrapper){
            $processYet.width('0');
            $currentTime.html('00:00');
            $duration.html('00:00');
            $processYet.siblings('.icon-cut').remove();

            $mainControl.find('.'+_defaults.playerCtrlClass.playCtrl).css('display', 'inline-block');
            $mainControl.find('.'+_defaults.playerCtrlClass.pauseCtrl).css('display', 'none');

            //adjust lrc position
            $lrcWrapper.animate({scrollTop: 0}, 500);
        },
        play: function(settings){
            settings.audio.play();
            var $ctrl = $('.'+settings.playerCtrlClass.mainCtrl);

            $ctrl.children('.'+settings.playerCtrlClass.playCtrl).css('display', 'none');
            $ctrl.children('.'+settings.playerCtrlClass.pauseCtrl).css('display', 'inline-block');
        },
        pause: function(settings){
            settings.audio.pause();
            var $ctrl = $('.'+settings.playerCtrlClass.mainCtrl);

            $ctrl.find('.'+settings.playerCtrlClass.playCtrl).css('display', 'inline-block');
            $ctrl.find('.'+settings.playerCtrlClass.pauseCtrl).css('display', 'none');
        },
        setDuration: function(settings){
            $('.'+settings.playerCtrlClass.duration)
            .html(_privateMethods.timeHandler.timeDispose(settings.audio.duration));
        },
        setTimeUpdate: function(settings){
            var length = $('.'+settings.playerCtrlClass.process).width(),
                currentTime = _privateMethods.timeHandler.timeDispose(settings.audio.currentTime);
                currentLength = settings.audio.currentTime/settings.audio.duration*length;

            $('.'+settings.playerCtrlClass.currentTime).html(currentTime);
            $('.'+settings.playerCtrlClass.processYet).width(currentLength);

            var $lrc = $('.'+settings.playerCtrlClass.lrc)
                , $lrcP = $lrc.find('p')
                , $lrcWrapper = $lrc.parent();

            _privateMethods.lrcHandler.scrollLrc(_privateMethods.timeHandler.timeInvert(currentTime), $lrcP, $lrcWrapper);
        },
        setProcess: function(settings, event){
            var $process = $('.'+settings.playerCtrlClass.process),
                $processYet = $('.'+settings.playerCtrlClass.processYet);

            var process = $process.offset()
                , startPoint = process.left
                , len = $process.width()
                , toWhere = event.clientX - startPoint
                , percentage = toWhere/len;

            setting.audio.currentTime = percentage*settings.audio.duration;
            $processYet.width(toWhere);
            _privateMethods.play(settings);
        },
        prevSong: function($currentNode){
            var prevData = $currentNode.prev().addClass('curSong').data('info'),
                songSettings = _privateMethods.infoParser(prevData),
                newSettings = $.extend(true, _defaults, songSettings);

            $currentNode.removeClass('curSong');
            methods.init(newSettings);
            settings = $.extend(true, _defaults, newSettings);
            _privateMethods.play(newSettings);
        },
        nextSong: function($currentNode){
            var nextData = $currentNode.next().addClass('curSong').data('info'),
                songSettings = _privateMethods.infoParser(nextData),
                newSettings = $.extend(true, _defaults, songSettings);

            $currentNode.removeClass('curSong');
            methods.init(newSettings);
            settings = $.extend(true, _defaults, newSettings);
            _privateMethods.play(newSettings);
        },
        lrcHandler:{
            getLrc: function(settings){
                $.ajax({
                    url: settings.songInfo.lrc_path,
                    type: 'GET',
                    dataType: 'text',
                    success: function(data){
                        console.log("in get lrc!!");
                        var $container = $('.'+settings.playerCtrlClass.lrc);
                        if($container.find('p').length>=0){
                            Global.flag = 0; // reset flag
                            $container.css('top', 0); // scroll back to top
                            $container.find('p').remove(); // remove the old lrc
                        }

                        _privateMethods.lrcHandler.setLrc(data, $container);
                    },
                    error: function(jqXHR, error, errorThrown){
                        if(jqXHR.status&&jqXHR.status==400){
                            console.error(jqXHR.responseText);
                        }else{
                            console.error('error!');
                        }
                    }
                });
            },
            setLrc: function(lrcText, $container){
                // lyrics content
                var lrcVal = lrcText.replace(/\[\d\d:\d\d.\d\d]/g, ""),
                    lrcArray = lrcVal.split("\n");

                var musicName, singer, html="", lrcTimeArray=[];

                // mapping musicName and singer
                lrcArray[0].replace(/\[\w\w\:(.*?)\]/g, function() {
                    musicName = arguments[1] || " ";
                });
                lrcArray[1].replace(/\[\w\w\:(.*?)\]/g, function() {
                    singer = arguments[1] || " ";
                });

                // combine singer's name and music name
                html += "<p class=\"lrc-line\" data-timeLine=\"0\"><span class=\"mr15\">歌曲：" + musicName + "</span>歌手：" + singer + "</p>";
                // song's part
                lrcArray.splice(0, 4);

                // get timeline
                lrcText.replace(/\[(\d*):(\d*)([\.|\:]\d*)\]/g, function() {
                    var min = arguments[1] | 0, //min
                        sec = arguments[2] | 0, //sev
                        realMin = min * 60 + sec; //cal total sec
                    lrcTimeArray.push(realMin);
                });

                // append the formatted text into a var
                for (var i = 0; i < lrcTimeArray.length; i++) {
                    html += "<p class=\"lrc-line\" data-timeLine=\"" + lrcTimeArray[i] + "\">" + lrcArray[i] + "</p>";
                }

                $container.append(html);
            },
            scrollLrc: function(currentTime, $lrcList, $lrcWrapper){
                for(var i=0; i<$lrcList.length; i++){
                    var dataTimeLine = parseInt($lrcList.eq(i+1).data("timeline"));

                    if(Global.flag === 0){
                        $lrcList.eq(1).addClass('focus'); // for the first lyrics
                    }
                    if(Global.flag!==currentTime){ //timpeupdate will repeat 4 times each sec
                        if(dataTimeLine === currentTime){
                            Global.flag = currentTime;
                            $lrcList.removeClass('focus');
                            $lrcList.eq(i+1).addClass('focus');

                            var stepSize = parseInt($lrcList.eq(1).css('margin-top'))+parseInt($lrcList.eq(1).css('line-height'))
                                , newSt = $lrcWrapper.scrollTop()+stepSize;

                            //var st = $('.lrcWrapper').scrollTop()+stepSize;
                            $lrcWrapper.animate({scrollTop: newSt}, 500);

                            break;
                        }
                    }
                }
            }
        }
    }


    // methods could be called
    var methods = {
        init: function(options){
            var settings = $.extend({}, _defaults, options);
            console.log(settings);

            _privateMethods.reset($('.'+settings.playerCtrlClass.processYet), $('.'+settings.playerCtrlClass.currentTime), $('.'+settings.playerCtrlClass.duration), $('.'+settings.playerCtrlClass.mainCtrl), $('.'+settings.playerCtrlClass.lrcWrapper));
            settings.audio.src = settings.songInfo.audio_path;
            // settings.audio.muted = true;
            //console.log(settings.audio.src);

            //Get LRC
            _privateMethods.lrcHandler.getLrc(settings);
            settings.audio.addEventListener('loadedmetadata', function(){
                console.log("loaded!!");
                _privateMethods.setDuration(settings);
            });
            settings.audio.addEventListener('ended', function(){
                console.log("end!!!");
                _privateMethods.reset($('.'+settings.playerCtrlClass.processYet), $('.'+settings.playerCtrlClass.currentTime), $('.'+settings.playerCtrlClass.duration), $('.'+settings.playerCtrlClass.mainCtrl), $('.'+settings.playerCtrlClass.lrcWrapper));
                _privateMethods.nextSong($('.curSong'));
            });
            settings.audio.addEventListener('timeupdate', function(){
                _privateMethods.setTimeUpdate(settings);
            });
            return this;
        },
        bindEvents: function(options){
            var settings = $.extend(true, _defaults, options);
            methods.init(settings);

            //bind events
            $('.'+settings.playerCtrlClass.playCtrl).on('click', function() { _privateMethods.play(settings);});
            $('.'+settings.playerCtrlClass.pauseCtrl).on('click', function() { _privateMethods.pause(settings);});
            $('.'+settings.playerCtrlClass.prevSong).on('click', function(){ _privateMethods.prevSong($('.curSong'));})
            $('.'+settings.playerCtrlClass.nextSong).on('click', function(){ _privateMethods.nextSong($('.curSong'));})
            $('.'+settings.playerCtrlClass.songList).delegate(('.'+settings.playerCtrlClass.songItem), 'click', function(event){
                $(this).siblings().removeClass('curSong');

                var originData = $(this).addClass('curSong').data('info');
                var songSettings = _privateMethods.infoParser(originData);
                var newSettings = $.extend(true, _defaults, songSettings);

                methods.init(newSettings);
                settings = $.extend(true, _defaults, newSettings);
                _privateMethods.play(newSettings);
            });

            $('body').easyEditor(settings.songInfo);

            return this;
        }
    }




    //Plugin entry
    $.fn.easyPlayer = function(method){
        if(!this.length) return this;

        if(typeof method==='object' || !method){
            //return methods.init.apply(this, arguments);
            return methods.bindEvents.apply(this, arguments);
        }else{
            $.error('Method '+method+" does not exist on jQuery easyPlayer!");
        }
    }
}));