var ngame = 0;
var map;
var solLoc;
var jsonMsg;
var points = 0;
var photograhps = 0;
var gameFinished = false;
var gameName;
var firstTime = true;
var state;
var tag;
var historyID = 0;
var locate;
var marker;
var played = 0;
var fromHistory=false;
var useState = false;
var importGames = {
	"count": 0,
	"geo":[]
}

function resetCarousel(){
	$('.carousel-inner').html("");

	html = "<div class='item active'>";
    html += "<img src='img/AreYouReady.jpg'>";
    html += "<div class='container'>";
    html += "<div class='carousel-caption'>";
    html += "</div></div></div></div>";

    $('.carousel-inner').append(html);
}

function getImgs(tag){

	$.getJSON("https://api.flickr.com/services/feeds/photos_public.gne?tags="
		+tag+"&tagmode=any&format=json&jsoncallback=?",function(data){

		resetCarousel();

		for(i in data.items){
			
			html = "<div class='item'>";
            html += "<img src="+data.items[i].media.m+" >";
            html += "<div class='container'>";
            html += "<div class='carousel-caption'>";
            html += "</div></div></div></div>";     
            $('.carousel-inner').append(html);
            if(i == 10){
            	break;
            }
		}
	});
}

function readyMap(){
	map = L.map('map');

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 20
	}).addTo(map);

	marker = L.marker([0, 0]).addTo(map)
    	.bindPopup(locate)
    	.openPopup();
    marker.setOpacity(0);

	map.setView([0, 0], 1);

	map.on('dblclick', function(e) {
		transition(e);
	});
	
}

function calculatePoints(distance,pics){
	if(distance > 2500 && distance < 6000){
		return - Math.round(distance/100) * pics;
	}else if(distance > 6000){
		return - 60*pics;
	}else{
		return Math.round((2500 - distance)/pics);
	}
}

function solMap(){
	map.setView([solLoc.lat,solLoc.lng],10);
	map.removeLayer(marker);
	marker = L.marker([solLoc.lat, solLoc.lng]).addTo(map)
    	.bindPopup(locate)
    	.openPopup();
    marker.setOpacity(1);
}



function transition(e){
	if(!gameFinished){

		var distance = Math.round(e.latlng.distanceTo(solLoc)/1000);
		var prePoints = calculatePoints(distance, photograhps);

		solMap();

		points += prePoints;
		var result = "<p>Distancia " + distance + "km " + photograhps + " fotos = " + prePoints + " puntos</p>";

		state["displayPoints"][state["count"]] = result;
		state["count"] ++;
		
		console.log(state);

		$("#points").append(result);
		
		ngame ++;

		if(ngame>=3){
			
			alert("Fin del juego has conseguido " + points + " puntos!");
			resetCarousel();
			gameFinished = true;

		}else{
			begin();
		}
	}else{
		alert("Comienza un nuevo juego");
	}
}

function begin(){
	
	var gameNumber = Math.floor(Math.random() * jsonMsg.features.length);
	var lat = jsonMsg.features[gameNumber].geometry.coordinates[1];
	var lon = jsonMsg.features[gameNumber].geometry.coordinates[0];
    	
    solLoc = L.latLng(lat, lon);
    locate = jsonMsg.features[gameNumber].properties.name;
    tag = jsonMsg.features[gameNumber].properties.tag;
    
    getImgs(tag);
}

function beginGame(data){
	
	jsonMsg = data;
	photograhps = 0;
	begin();
}

function resetGame(){
	marker.setOpacity(0);
	map.setView([0, 0], 1);
	resetCarousel();
	photograhps = 0;
	points = 0;
	ngame = 0;
	gameFinished = false;
	$("#points").empty();
}

function resetState(){
	state={
		"points":points,
		"count" : 0,
		"displayPoints": [],
		"import": false,
		"name":gameName
	};
}

function registerGame(){

	resetState();

	if(historyID != played){
		var less = played -historyID;
		
		historyID = played;
		useState = false;
		history.go(less);
	}
	history.pushState(state ,null,"game=" + gameName);
	console.log(state);

}

function time(){
	var date = new Date()
	var hour = date.getHours()
	var minute = date.getMinutes()
	var second = date.getSeconds()
	if (hour < 10) {hour = "0" + hour}
	if (minute < 10) {minute = "0" + minute}
	if (second < 10) {second = "0" + second}
	var finalHour = hour + ":" + minute + ":" + second;
	return finalHour;
}

function prepareState(){
	state["points"] = points;
	state["tag"] = tag;
	state["loc"] = solLoc;
	state["locate"] = locate;
	state["game"] = gameName;
	state["gameFinished"] = gameFinished;
	state["geo"] = jsonMsg;
}

function replace(){

	prepareState();

	history.replaceState(state ,null,"game=" + gameName );

	$("#history").append('<li class="history" id="' + played + '">'+gameName+ ' ' + time() + ' ' + points +'</li>');
	

	$("#"+played).click(function(){
		firstTime = true;
		var p = $(this).attr("id"); 
		historyFunction(p);
	});


}

function historyFunction(p){

	var go = p - historyID;
	
	historyID = p;
	
	if(go != 0){
		if(fromHistory){
			
			prepareState();
			
			history.replaceState(state ,null,"game=" + gameName );
		}
		fromHistory = true;
		useState = true;
		history.go(go);
	}else{
		alert("Ya estas en ese juego");
	}
}

function setState(event){

	ngame = event.state.count;
    solLoc = event.state.loc;
    tag = event.state.tag;
    points = event.state.points;
    locate = event.state.locate;
    gameName = event.state.game;
    gameFinished = event.state.gameFinished;
    jsonMsg = event.state.geo;
    resetState();
    state["displayPoints"]= event.state.displayPoints;
	state["count"] = event.state.count;
    if(ngame == 3){
		alert("Se comienza el juego de nuevo");
		ngame = 0;
		resetGame();
	}
}

//// PARTE LEER REPO DE GITHUB
var newForm = "<input type='text'id='user' />" +
    "<input type='text' id='repo' />" +
    "<button type='button' id='dataButton'>Lee</button>" ;
var repo;
var ghObj;


function readToken(){
	$("#newForm").html("");
	auth = hello("github").getAuthResponse();
	token = auth.access_token;
	
	ghObj = new Github({
		token: token,
		auth: "oauth"
    });

	$("#blankSpace").append(newForm);
	$("#dataButton").click(getData);
};

function getData(){
	console.log($("#user").val());
	console.log($("#repo").val());
	repo = ghObj.getRepo($("#user").val(), $("#repo").val());
	repo.show(function(error,repo){
		if (error) {
			$("#blankSpace").append("<h3>Error de lectura: " + error.error + "</h3>");
	    } else {
			$("#blankSpace").append("<p>Repo data:</p>" +
				      "<ul><li>Full name: " + repo.full_name + "</li>" +
				      "</ul><div id='files'></div>");
			files();
	    }
	});
    
};

function files() {
    repo.contents('master', '', function(error, contents) {
        var repoList = $("#files");
        if (error) {
            repoList.html("<p>Error code: " + error.error + "</p>");
        } else {
            var files = [];
            var len = contents.length;
            for (var i = 0; i < len; i++) {
                files.push(contents[i].name);
            }
            repoList.html("<ul><li>" + 
                files.join("</li><li>") +
                "</li>"+
                "</li></ul></ul>" +
				  "<div id='readwrite'>" +
				  "<input type='text' name='filename' " +
				  "id='filename' size='20' />" +
				  "<button type='button' id='readGeo'>" +
				  "Lee</button><br>" +
				  "</div>");
            $("#files li").click(selectFile);
			$("#readGeo").click(readFile);
         }
    });
}

function selectFile() {
    element = $(this);
    $("#filename").val(element.text());
};

function readFile() {

    repo.read('master', $("#filename").val(), function(err, data) {
    	if(err != null){
    		alert(error);
    	}
		importGames["geo"][importGames["count"]] = data;
		$("#gameOptions").append('<option value="import'+ importGames["count"] +'">Importado '+ time() + ' </option>');
		importGames["count"] ++;

    });
};

function signIn(){
	access = hello("github");
    access.login({response_type: 'code'}).then( function(){
		getToken();
    }, function( e ){
		alert('Signin error: ' + e.error.message);
    });
}

function playImportGame(gameName){
	registerGame();
	state["import"] = true;
	var gameNumber = parseInt(gameName.substring(6, 7)); 

	beginGame(JSON.parse(importGames["geo"][gameNumber]));

}

$(document).ready(function() {
	//Cambia el tamaño si es para móviles
	if($(window).width()<980){
        $('#map').css("height", ($(window).height() /2));    
        $('#map').css("width", ($(window).width() /(1.1)));
        $('.carousel').css("height", ($(window).height() /2));    
        $('.carousel').css("width", ($(window).width() /(1.1)));

    }

	window.addEventListener('popstate', function(event) {

       if(useState){
	       	 alert("JUEGO REANUDADO!");

		    $("#points").empty();
		    for(i = 0 ; i<event.state.displayPoints.length ; i++){
		        $("#points").append(event.state.displayPoints[i]);
		    }
		    setState(event);
		    resetCarousel();
		    getImgs(tag);
       }
      
    });

	$('.carousel').bind('slide.bs.carousel', function (e) {
	    photograhps ++;
	});

	readyMap();
	
	$('#go').click(function(){

		if(!firstTime){
			replace();
		}
		if(!fromHistory){
			resetGame();
		}else{

			prepareState();
			history.replaceState(state ,null,"game=" + gameName );
		}
		

		var interval = $("#gameDifficulty option:selected").val();
		historyID ++;
		played ++;	
		$('.carousel').on("slide.bs.carousel", function (e){
		    $('.carousel').data("bs.carousel").options.interval =  interval;
	    });
	    fromHistory = false;
		firstTime = false;

		gameName = $("#gameOptions option:selected").val();

		if(gameName.substring(0, 6) == "import"){
			playImportGame(gameName);
		}else{
			var game = "json/" + gameName + ".json";
			registerGame();
			
			$.getJSON( game, function( data ) {
				beginGame(data);
		    });
		}
		
		
	});

	$('#stop').click(function(){

		resetGame();
	});

	$("#read").click(function(){
		hello.init({
			github : "addc64a9121e96235f3f"
	    },{
			redirect_uri : 'redirect.html',
			oauth_proxy : "https://auth-server.herokuapp.com/proxy",
			scope : "publish_files",
	    });

	    signIn();
	});


	$('.pop').click(function(event) {
	    var width  = 575,
	        height = 400,
	        left   = ($(window).width()  - width)  / 2,
	        top    = ($(window).height() - height) / 2,
	        url    = "https://twitter.com/intent/tweet?text=¡Prueba! http://mavilam.github.io/X-Nav-Practica-Adivina/ ",
	        opts   = 'status=1' +
	                 ',width='  + width  +
	                 ',height=' + height +
	                 ',top='    + top    +
	                 ',left='   + left;
	    
	    window.open(url, 'twitter', opts);
	 
	    return false;
  });


});