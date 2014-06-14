# easyAuditor

If you are short at jQuery or JavaScript but want to add some music in your project, then you are in the right place. **easyAuditor** is a very easy [jQuery plugin](http://plugins.jquery.com/) to enable audio used on the Internet. But it **requries modern browsers**, so if the users' browser is under IE10, this plugin will not work normally.

## File Structure
	
	easyAuditor
	├── js/
	│   ├── easyPlayer.js
	│   ├── easyEditor.js
	├── css/
	├── sass/
	└── html/ 

This plugin provides two functions to users. One is playing audios on web page and other is editing audios. Just importing ```easyPlayer.js``` into HTML you can play music successfully. But if you want to edit audios, this project now did not offer any APIs to back-end, and the browsers cannot deal with audio files. So without proper back-end code, the editing functions are fake in fact. More details will be given in *Quick Start*.  

The default CSS is provided in case users do not want to write their own CSS. In ```html/``` directory, index.html is the demo page, you can clone or download this project and directly open *index.html*. However, locally you do not have the default audio files, so you still need to make some changes in the files. Let's move to see how to use this plugin.

## Quick start

1. Firstly, you need to include ```jQuery``` in you HTML. In this project, you can directly use JS files in vendor/ directory  

    	<script src="/js/vendor/jquery-1.10.2.min.js"></script>
2. If you only need a online player with shown lyrics, you have two things to do:

	+ The HTML structure is fixed

			<!-- player -->
			<div class="player">
				<audio id="player" src="/mp3/gushi.mp3"></audio><span class="currentTime">00&quot;&quot;00</span>
				<div class="process-container">
					<span class="process"></span>
					<span class="processYet">
						<span class="processSign"><i id="topSign" class="icon-circle"></i><i class="icon-verticalLine"></i><i id="bottomSign" class="icon-circle"></i>
						</span>
					</span>
				</div>
				<span class="allTime">00&quot;&quot;00</span>
			</div>
			<div class="ctrlPanel clearfix">
				<button class="icon-cc-prev"></button>
				<button class="icon-cc-play"></button>
				<button class="icon-cc-stop"></button>
				<button class="icon-cc-next"></button>
				<button class="icon-cut">
				  <z class="icon-cut-shank"></z>
				</button>
				<button class="icon-select"></button>
				<button class="icon-replay"></button>
			</div>
			
			<!-- song list -->
			<div class="sList">
				<table class="sItem">
					<thead>
						<tr class="songHead">
						<th>歌曲</th>
						<th>演唱者</th>
						<th>专辑</th>
						</tr>
					</thead>
					<tbody>
						<tr data-info="0_ljj_xinqiang_al_pp_/lrc/xinqiang.lrc_/mp3/xinqiang.mp3" class="songInfo">
						<td><i class="icon-player"></i><span>心墙</span></td>
						<td><span>林俊杰</span></td>
						<td><span>《One》</span></td>
						</tr>
						<tr data-info="1_wlh_xinzhongderiyue_al_pp_/lrc/xinzhongderiyue.lrc_/mp3/xinzhongderiyue.mp3" class="songInfo">
						<td><i class="icon-player"></i><span>心中的日月</span></td>
						<td><span>王力宏</span></td>
						<td><span>《心中的日月》</span></td>
						</tr>
					</tbody>
				</table>
			</div>

	+ Import ```easyPlayer.js```, and call the method:
		
			<script src="/js/easyPlayer.js"></script>
			<script>
		      $(function(){
		          $('body').easyPlayer();
		      });
		    </script>
3. If you need an audio editor, apart from the above codes, you need to add the following:
	+ HTML structure:

			<div class="editor">
				<div class="container clearfix">
				</div>
				<div class="operations"></div>
			</div>

	+ imported *easyEditor.js* after *easyPlayer.js*：
	 		
			<script src="/js/easyEditor.js"></script>
4. But, pay attention to the audio files information in HTML tag. Since this is a plugin, cannot modify the behavior of user's click a song then jumping to the playing page. The initial information of songs are handy inputted. But in real case, those information are passed by back-end.

## Features

1. Playing music
2. Editing audios
