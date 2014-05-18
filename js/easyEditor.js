/************************
jquery-easyEditor v1.0

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
}(function($){
    var audio = document.getElementById('player'),
        isStart = true;

    var _defaults = {
        editor:{
            wrapper: 'editor',
            container: 'container',
            operate: 'operations',
            audioSeg: 'seg-container'
        },
        operations: {
            ctrlPanel: 'ctrlPanel',
            timePoint: 'icon-cut',
            success: 'icon-select'
        }
    };

    // music editor
    var _privateSpace = {
        "startTime": null,
        "endTime": null,
        "start" : '<i class="icon-cut" id="start"><z class="icon-cut-shank"></z></i>',
        "end" : '<i class="icon-cut" id="end"><z class="icon-cut-shank"></z></i>',
        "audio_seg": '<div class="seg-container"><span class="seg-audio"></span></div>',
        init: function(settings){
            $('.'+settings.operations.timePoint).remove();
        },
        setCutPoint: function(scissor_id){
            // get current .processYet position
            var offset_left = $('.processYet').width(),
                percentage = offset_left/$('.process').width();

            if(scissor_id==='start'){
                $('.process-container').append(_privateSpace.start);
                _privateSpace.startTime = percentage*audio.duration;
            }else{
                $('.process-container').append(_privateSpace.end);
                _privateSpace.endTime = percentage*audio.duration;
            }
            $('#'+scissor_id).css('left', offset_left+"px");
        },
        successful: function(songInfo){
            var container_width = $('.editor .container').width(),
                segment_Len = parseInt($('#end').css('left'))-parseInt($('#start').css('left')),
                segs = $('.editor .container').find('.seg-container'),
                audio_self = "<audio id='player_"+songInfo.songId+"'>";

            // add one more segment for the new cut part
            $('.editor').append(audio_self);
            $('.editor .container').append(_privateSpace.audio_seg);
            $('.seg-container:last-child').attr('id', songInfo.songId);
            $('#'+songInfo.songId).attr('data-originw', segment_Len);
            $('#'+songInfo.songId).find('.seg-audio').html(songInfo.songName); // show song name in the span

            var new_seg = document.getElementById("player_"+songInfo.songId);
            $("#player_"+songInfo.songId).data('start', _privateSpace.startTime);
            $("#player_"+songInfo.songId).data('end', _privateSpace.endTime);
            // new_seg.src = GLOBAL.audio.src+"?foo="+(new Date().getTime());

            if(segs.length == 0){
                $('#'+songInfo.songId).find('.seg-audio').css('width', container_width);
                $('#'+songInfo.songId).find('.seg-audio').html(songInfo.track);
            }else{
                var sum=0, count=0;
                var tmp = $('.editor .container').find('.seg-container');
                $.each(tmp, function(index, val) {
                    sum = sum + parseInt(tmp.eq(index).data('originw'));
                    console.log("sum is: "+ sum);
                });
                console.log("SUM is: "+ sum);

                var originwArr = []; // to store each %
                segs = $('.editor .container').find('.seg-container');
                $.each(segs, function(index){
                    var $current = segs.eq(index),
                        percentage = $current.data('originw')/sum;
                    var currentLen = percentage*(container_width-2-1*segs.length);
                    $current.find('.seg-audio').css('width',currentLen+"px");
                    $current.find('.seg-audio').html(songInfo.track);

                    originwArr.push(percentage);
                });
            }
        }
    }

    var methods = {
        init: function(options){
            var settings = $.extend({}, _defaults, options);
        },
        bindEvents: function(options){
            var settings = $.extend({}, _defaults, options);

            $('.'+settings.operations.ctrlPanel).delegate(('.'+settings.operations.timePoint), 'click', function(event) {
                if(isStart){
                    _privateSpace.setCutPoint('start');
                    isStart = false;
                }else{
                    _privateSpace.setCutPoint('end');
                    isStart = true;
                }
            });

            $('.'+settings.operations.ctrlPanel).delegate(('.'+settings.operations.success), 'click', function(event) {
                _privateSpace.successful(options);
            });
        }
    }


    //Plugin entry
    $.fn.easyEditor = function(method){
        if(!this.length) return this;

        if(typeof method==='object' || !method){
            //return methods.init.apply(this, arguments);
            return methods.bindEvents.apply(this, arguments);
        }else{
            $.error('Method '+method+" does not exist on jQuery easyPlayer!");
        }
    }
}));
