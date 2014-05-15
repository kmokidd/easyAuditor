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
    var audio = document.getElementById('player');

    var _defaults = {
        editor:{
            wrapper: 'editor',
            container: 'container',
            operate: 'operations',
            audioSeg: 'seg-container'
        },
        operations: {
            timePoint: 'icon-scissor',
            successful: 'icon-select'
        }
    };

    // music editor
    var _privateSpace = {
        "startTime": null,
        "endTime": null,
        "start" : '<i class="icon-scissor" id="start"></i>',
        "end" : '<i class="icon-scissor" id="end"></i>',
        "audio_seg": '<div class="seg-container"><span class="seg-audio"></span></div>'
        init: function(settings){
            $('.'+settings.operations.timePoint).remove();
        },
        setCutPoint: function(scissor_id){
            // get current .processYet position
            var offset_left = $('.processYet').width(),
                percentage = offset_left/$('.process').width();

            if(scissor_id==='start'){
                $('.process-container').append(cut.start);
                cut.startTime = percentage*audio.duration;
            }else{
                $('.process-container').append(cut.end);
                cut.endTime = percentage*audio.duration;
            }
            $('#'+scissor_id).css('left', offset_left+"px");
        },
        successful: function(src){

        }
    }

    var methods = {
        init: function(options){
            var settings = $.extend({}, _defaults, options);

        }
    }


    //Plugin entry
    $.fn.easyEditor = function(method){
        if(!this.length) return this;

        if(typeof method==='object' || !method){
            return methods.init.apply(this, arguments);
        }else{
            $.error('Method '+method+" does not exist on jQuery easyPlayer!");
        }
    }
}));
