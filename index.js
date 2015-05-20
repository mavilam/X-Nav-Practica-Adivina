var ngame = 0;
var map;
var solLoc;
var jsonMsg;
var points = 0;
var currentIndex;
var gameFinished = false;
var gameName;
var firstTime = true;
var state;
var tag;
var historyID = 0;
var locate;
var marker;
var fromHistory=false;
var importGames = {
	"count": 0,
	"geo":[]
}

function resetCarousel(){
	$('.carousel-inner').html("");

	html = "<div class='item active'>";
    html += "<img src="+"http://blog.popplaces.com/wp-content/uploads/2014/09/welcome.jpg"+" >";
    html += "<div class='container'>";
    html += "<div class='carousel-caption'>";
    html += "</div></div></div></div>";

    $('.carousel-inner').append(html);
}

function getImgs(tag){
	console.log(tag);
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
		return - distance * pics;
	}else if(distance > 6000){
		return - 2500;
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
		var prePoints = calculatePoints(distance, currentIndex);

		solMap();

		points += prePoints;
		var result = "<p>Distancia " + distance + "km " + currentIndex + " fotos = " + prePoints + " puntos</p>";

		state["displayPoints"][state["count"]] = result;
		state["count"] ++;
		console.log(state);

		$("#points").append(result);
		
		ngame ++;

		console.log(jsonMsg.features.length + " " + ngame);
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
	console.log(jsonMsg);
	var lat = jsonMsg.features[ngame].geometry.coordinates[1];
	var lon = jsonMsg.features[ngame].geometry.coordinates[0];
    	
    solLoc = L.latLng(lat, lon);
    locate = jsonMsg.features[ngame].properties.name;
    tag = jsonMsg.features[ngame].properties.tag;
    console.log(jsonMsg.features[ngame].properties);
    getImgs(tag);
}

function beginGame(data){
	
	jsonMsg = data;
	begin();
}

function resetGame(){
	marker.setOpacity(0);
	map.setView([0, 0], 1);
	resetCarousel();
	points = 0;
	ngame = 0;
	gameFinished = false;
	$("#points").empty();
}

function registerGame(){
	state={
		"points":points,
		"count" : 0,
		"displayPoints": [],
		"import": false,
		"name":gameName
	};
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
	
	$("#history").append('<a class="history" id="' + historyID + '" >'+gameName+ ' ' + time() + ' ' + points +'</a><br/>');
	

	$("#"+historyID).click(function(){
		var id = $(this).attr("id"); 
		historyFunction(id);
	});
	historyID ++;
}

function historyFunction(id){

	var go = id - historyID;
	alert(go + " " + id + " " + historyID);
	historyID = go;
	
	if(go != 0){
		if(fromHistory){
			registerGame();
		}
		replace();
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
    fromHistory = true;
    /*if($("#" + historyID).length != 0) {
	  $("#" + historyID).remove();
	  alert("bbbb");
	}else{
		alert("a");
	}*/

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
		readToken();
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

/*function lee(){
	$.getJSON( "json/Estadios.json", function( data ) {
				importGames["geo"][importGames["count"]] = data;
			$("#gameOptions").append('<option value="import'+ importGames["count"] +'">Importado '+ time() + ' </option>');

			importGames["count"] ++;
			console.log(importGames);
	});
}*/

$(document).ready(function() {


	window.addEventListener('popstate', function(event) {

        alert("JUEGO REANUDADO!");

        $("#points").empty();
        for(i = 0 ; i<event.state.displayPoints.length ; i++){
        	$("#points").append(event.state.displayPoints[i]);
        }
        setState(event);
        resetCarousel();
        getImgs(tag);


    });

	$('.carousel').bind('slide.bs.carousel', function (e) {
	    currentIndex = $('div.active').index() + 1;
	});

	readyMap();
	
	$('#go').click(function(){

		if(!firstTime){
			replace();
		}

		resetGame();

		var interval = $("#gameDifficulty option:selected").val();
			
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
			github : "178bbf1a96ea6ca75380"
	    },{
			redirect_uri : 'redirect.html',
			oauth_proxy : "https://auth-server.herokuapp.com/proxy",
			scope : "publish_files",
	    });

	    signIn();
	});

	/*$("#readaa").click(function(){
		lee();
	});*/
});