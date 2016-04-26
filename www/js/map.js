var map;
var info;

document.addEventListener("deviceready", function() {
    
    // Take the info from the json saved in index.js
    console.log( info );
	//if( window.localStorage.getItem("info") !== null ) {
    	info = JSON.parse( window.localStorage.getItem("info") );
	//}
    console.log( info.length );
    
    document.addEventListener("backbutton", phoneEvent.onBackKeyDown , false);
    
    // Initialize the map view
    var div = document.getElementById("map");
    map = plugin.google.maps.Map.getMap(div);
    
    if( window.localStorage.getItem("mapType") === null ) {
        window.localStorage.setItem("mapType" , "ROADMAP");
    }
	tracking.distance = window.localStorage.getItem("notificationRange");
    
    // Wait until the map is ready status.
    map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
}, false);

var phoneEvent = {
    onBackKeyDown: function() {
        if( optionMenu.isOpen ) {
            optionMenu.close();
        } else {
            if( map != null ) {
                map.remove();
                window.location.href = "index.html";
            }            
        }
    }
};

function onMapReady() {
    map.clear();
    
    // set the type of map based on the mapType localStorage variable
    if( window.localStorage.getItem("mapType") === "ROADMAP" ) {
        map.setMapTypeId(plugin.google.maps.MapTypeId.ROADMAP);
    } else {
        map.setMapTypeId(plugin.google.maps.MapTypeId.HYBRID);
    }
	
    myPosition.startFindPosition();
    readMarkers.initMarker();
}

var myPosition = {
	
	findPositionId: null,
	
	startFindPosition: function() {
        myPosition.findPositionId = navigator.geolocation.watchPosition(myPosition.onPositionSuccess,
                                                  myPosition.onPositionError,
			{ maximumAge: 5000, timeout: 5000, enableHighAccuracy: true });
    },
    
    onPositionSuccess: function(position) {
        "use strict";
        console.log("position: " +position);
		
		var longitude = position.coords.longitude;
		var latitude = position.coords.latitude;
		drawPath.origin = new plugin.google.maps.LatLng( latitude , longitude );
        map.setCenter( drawPath.origin );
		
		map.addMarker(
            {
                icon: 'blue',
                position: drawPath.origin,
                title: "myPosition"
            }, function(marker) {
				marker.getPosition( tracking.setMyPosition );
			});
			
			tracking.notificationPush = false;
			if( tracking.myPosition !== null ) {
				if( readMarkers.markers !== [] ) {
					readMarkers.markers.forEach( tracking.markersInRange );
					if( tracking.notificationPush === true ) {
						console.log( tracking.markers );
					}
				}
			}
    },
    
    onPositionError: function(error) {
        "use strict";
		var messaggio = "";
		
		switch (error.code) {
			   
			case error.PositionError.PERMISSION_DENIED:
				messaggio = "L'applicazione non è autorizzata all'acquisizione della posizione corrente";
				break;
				   
			case error.PositionError.POSITION_UNAVAILABLE:
				messaggio = "Non è disponibile la rilevazione della posizione corrente";
				break;
				   
			case error.PositionError.TIMEOUT:
				messaggio = "Non è stato possibile rilevare la posizione corrente";
				break;
		}
		document.getElementById( "location" ).innerHTML = messaggio;
    },
    
    stopFindPosition: function() {
        navigator.geolocation.clearWatch( myPosition.findPositionId );
    }
};

var readMarkers = {
    
	markers: [],
    LatLngBounds: null,
    
    initMarker: function() {
        //object used for set all the marker into the first view
        this.LatLngBounds = new plugin.google.maps.LatLngBounds();
        for( var i = 0 ; i < info.length ; i++ ) {
            this.createMarker( info[i] , i );
        }
        this.fitBounds();
    },
    
    icon: "",
    
    createMarker: function( myMarker , i ) {
        console.log("lat: " + myMarker.lat + "\nlng: " + myMarker.lng );
        if( myMarker.type === "ArtWork" ) {
            this.icon = base64image.artIcon;
        } else {
            this.icon = base64image.museumIcon;
        }
        console.log(myMarker);
        map.addMarker(
            {
                icon: this.icon,
                position: new plugin.google.maps.LatLng( myMarker.lat , myMarker.lng ),
                disableAutoPan: false,
                //data saved into marker used in the markerClick function
                placeTitle: myMarker.title,
                placeType: myMarker.type,
                placeImg: myMarker.image,
                placeDesc: myMarker.description,
                placeLat: myMarker.lat,
                placeLng: myMarker.lng,
                'markerClick': function(marker) {
                    readMarkers.markerListener(marker);
                }
            }, function(marker) {
				marker.getPosition(function(marker1){
					readMarkers.markers[i] = marker1;
				});
			}
        );
        // add this marker to the visible markers in the first view
        this.LatLngBounds.extend( new plugin.google.maps.LatLng( myMarker.lat , myMarker.lng ) );
    },
    
    //function called when markers are clicked
    markerListener: function( marker ) {
        console.log(marker.get("placeImg"));
        // object saved for the navigation used later
        drawPath.destination = new plugin.google.maps.LatLng( marker.get("placeLat") , marker.get("placeLng") );
        // contents of the popup showed when markers are clicked
        document.getElementById("infoMarker").innerHTML = 
            '<div id="infoContainer">'+
                '<div class="closeContainer">'+
                    '<div class="img32 closeImg" onclick="infoMarker.close()">'+
                        '<img onclick="infoMarker.close()" src='+ base64image.closeImg +'>'+
                    '</div>'+
                '</div>'+
                '<div class="divInfo">'+
                    '<p id="title">'+ marker.get( "placeTitle" ) +'</p>'+
                    '<p id="type">'+ marker.get( "placeType" ) +'<p/>'+
                '</div>'+
                '<div class="infoImg">'+
                    '<img src="'+ marker.get( "placeImg" ) +'"/>'+
                '</div>'+
                '<p>'+ marker.get( "placeDesc" ) +'</p>'+
                '<p id="path" onClick="drawPath.initMap()">Percorso</p>'+
            '</div>';
        // function that make visible the popup
        infoMarker.open();
    },
    
    // function that make visible in the first view all markers
    fitBounds: function() {
            map.moveCamera({
                'target': this.LatLngBounds
            });
            map.getCameraPosition( function(camera) {
                console.log(camera);
            });
        console.log( this.LatLngBounds );
    }
};

var tracking = {
	
	myPosition: null,
	equal: false,
	distance: null,
	markers: [],
	notificationPush: false,
	
	setMyPosition: function(marker) {
		tracking.myPosition = marker;
	},
	
	markersInRange: function(item1,index1) {
		if( Math.sqrt( Math.pow(item1.lat - tracking.myPosition.lat,2) + Math.pow(item1.lng - tracking.myPosition.lng,2) ) <= ( tracking.distance * 0.55 ) ) {
							
			tracking.markers.forEach( function(item2,index2) {
				if( item2 === item1 ) {
					tracking.equal = true;
				}
			});
						
			if( tracking.equal === false ) {
				tracking.markers.push( item1 );
				tracking.notificationPush = true;
			}
		} else {
			tracking.markers.forEach( function(item2,index2) {
				if( item2 === item1 ) {
					tracking.markers.splice(index2,1);
					tracking.notificationPush = true;
				}
			});
		}
				
	}
};

var drawPath = {
    origin: null,
    destination: null,
    
    // function that call navigator in the google maps app
    initMap: function() {
        if (confirm("Do you want to go?")) {
            plugin.google.maps.external.launchNavigation({
                "from": this.origin,
                "to": this.destination
            });
        }
    }
};

var infoMarker = {
    isOpen: false,
    
    open: function() {
        /*
        if(menuInfo.isOpen === true) {
            $("#menuInfo").index = 2;
        } else {
            $("#menuInfo").index = 1;
        }
        */
        console.log("infoMarker open");
        document.getElementById("infoMarker").style.visibility = "visible";
        this.isOpen = true;
    },
    
    close: function() {
        console.log("infoMarker close");
        document.getElementById("infoMarker").style.visibility = "hidden";
        this.isOpen = false;
    }
};

var optionMenu = {
    isOpen: false,
    
    open: function() {
        console.log("optionMenu open");
        document.getElementById("optionMenu").style.visibility = "visible";
        document.getElementById("coverDiv").style.visibility = "visible";
        document.getElementById("optionMenu").style.width = "80%";
        setTimeout(function(){ $(".optionButton").addClass("optionButton-visible"); }, 100);
        this.isOpen = true;
    },
    
    close: function() {
        console.log("optionMenu close");
        $(".optionButton").removeClass("optionButton-visible");
        setTimeout(function(){ document.getElementById("optionMenu").style.width = "0px"; }, 100);
        document.getElementById("coverDiv").style.visibility = "hidden";
        setTimeout(function(){ document.getElementById("optionMenu").style.visibility = "hidden"; }, 300);
        this.isOpen = false;
    }
};

// images in base64
var base64image = {
    closeImg: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQffCQkJERlnx5n+AAACFUlEQVRo3r2ZzW7aQBhFjx0/Uko2VZpFSfJE+VlUtI/btAGyBeLJYsay47/MjL+LkRDCI50ztoDvcqE5CkqA8Kw6GkbRP+Hxz9wBlQxfAfc8DRUKLoDfOF65lilUwA+2ODbARavg8X9wHHDsRAoev8Nx7CuUAX+i5h3HVqDQ4t+pOQWF0u/fX/wTNQ4nUejiHa6jUAA84zgEvEKhj/cKBxyPfsGa/aeTtgpjeP96x0/CfbhmK1KYxm/5HuhUMoWv8FV3ob1CNF6jkIS3V0jG2ypk4e0UsvE2CovwyxUW45cpmODzFczweQqm+HQFc3yaggQfryDDxylI8TEKYvy8wp4VV7xp8fMKL/zT46cV6vCQ4+cVzoKfVjgbvlXY4T7tu7kWcnyjsBpR8Phv6ficfwNG0j0AxcT7xvu/YT95C1TJuoMffutpAl00fuxjKFGYxp9FYfoX7y8vGbOjGX7PJStpuOfrcUMZ7iPwlTDcR+GbVRKF+GFLopA265krpI+apgp5k66ZQv6gbaKwbM5frLA8ZixSsEk52Qp2IStLwTbjJSvYR8wkBU3CjVbQBewohVKGj1EoAe6kAXsu3K/9kiccx0FlYxeyxhRqjjgewNdGG/qllW3G6yv40upXoFN2FFQJt6vQ4kMw9MXlBl8pqhJum6yPAT/oTjc4/gsDtld4HeK9Qgk8spbhG4VbHpjpz89e338Ays2ns1Ak4FAAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTUtMDktMDlUMDk6MTc6MjUtMDQ6MDDfKanNAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE1LTA5LTA5VDA5OjE3OjI1LTA0OjAwrnQRcQAAAABJRU5ErkJggg==",
    
    museumIcon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAX3AAAF9wHt/KUzAAAAB3RJTUUH3wkHAy4x5+Tp3QAAA9JJREFUWMPFlzFvXEUQx3//2T3f4XMKpEiRrSAkIugQZRr4AJCS2qKnTUebT5Caig8QyRUFHeIbQCQXIJQCiighlohDgnNvh2Jn7/aefXGCQ9jT6u3Nm5n/7Mzs7Dx4xZHI7DLHEGAGZobYZU4iv6o69HJM4hLOE6BgAhngQAkWq7q8GMXnwGOE4xc1wAJDqIKa0KIs3/uHoeanxu14BorjpdrYdLz0MBLCyFBXyeoMZTYR6YawA2F/xzwQ6QbYBKz9krAECSOTasheHF2YABkhCcuGRBgCaVfYTWF3hbmwEs9+fVfYTUi7VSZjoUtLXZPQt4RN8RTCTCgZMAdgLmHXhX0t7KgDHIQtArjEeujeH4XMdZhrvkwSJWGWIvKJBCK1KSGsxntH2L6w70eKFzF9wxy/H0LHvtBO6A6siouI3KrPa8JuCbs3UnLS7bKcM5t3TkbG3xN2C+xaYKliV3ckYXdesLPXPe/URBC5RkMJ/DvgW2ARKdBSdnyY9S/pBXhCzcQslIBhWQcMS8AAfObwDfBXCPfl7Yzicy59iOe24IvYZCqUgbCkcZozGcTiUPhXAezA0055BmaxfhrKx/Rn4cV2tmdh0MLh0JkgnptQk+19ZbmeA/tS2CNhP4K9VyuhIexzYb8L+0XYx1oVnU8jyX4Lnla0PhJ2KOx+nCqErV0YuQPv6bvA2zUXdAXs1wjtVfC9COweCK/O2QO9G5qurkKuK8AHYc07PVbIrQxwSm9EXvLiqcstW/GT2j3B2p3icba0xt+t5d3dMCrOSz3T9dguE3vWAU07wX79VtMk2OowGs/aKRlf4F5FfatZZCHop4DUGcNWt55uoPf8ZxlgKGB8s2C/3gQUBjugkZd0ygO2viweJ26p0PFpKBuDbjJm2pWBtY0Ij03aGuoSKqriGa5u1WIj6GQdqKm2kWdKbHKjAXKdcqliR8MZO920bsXPRx7ryt5pA2hX8cgAn628cxaoxh6YdmdyRBeG+ciATKLa9hysUEQcpRiXAAbyqk+pY966hxH/PHgBdnq6U7SofWW0QZlsLKLTdRwfvDbcD4D7wDbwZ7WilGN4SH2XgUddQfkDOKLeAQ+Dl5B9TL3YHpS6+0GggmEsXNUDCzm4Y5+Avx8AOfz7LKbCoEY/oV5IzQNbEdxFAHqNO7OOvgD9LMoPAg1kB5KEbUOeRqfbWqvX3YQ0nQeBtV37IEDY7WinjqON6luvYTQvSj+O/7cNyAWbCS6HW/ss3/RZc1H6NLAuF2wmYQPnfDH8h6PIsH1WleNNDrH2hfI/DdmoRXrT4x/kt2magfWOxAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNS0wOS0wN1QwMzo0Njo0OS0wNDowMFqunc8AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTUtMDktMDdUMDM6NDY6NDktMDQ6MDAr8yVzAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg==",
    
    artIcon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAAg0AAAINAXdOvnAAAAAHdElNRQffCQcDMSapbWKEAAAC6klEQVRIx43VTWhdRRQH8N+97zVJ6xeC1dRQCgWlOxG0ARe6k6KoC1FEBIMp1k1BxY+1XVQpWKiIiCkIigqV0oVgoNGFG1FLtVpEq6HESszCJkhsTV/evfe4ePM+kry0nVncO8Occ/7nP/9zJrPeyNI3XHZkfXZylJ11TaZcx02+1rjW+a+71lCPm7zv2awXQU2oDLnXQ243bIsL/jDjC5MWZPIOrkyuEnZa7DVn0ItmxIpZCQsOGU7pkMuw0bjwbq/5Pb4XKqVCCKVSoalUCeftRi7HDV5KgU53zR+zJBQKYd6EqQ6GUmFZKRxUww5nU6Bwsc3lmFKlUAnhfvC+SFhabprCBE6I5DBcaEUfdUloKpXCXzapYUxoCifs8ozZ5O495xMzpfANDPpOWE5xKuFx1BwTKg07wLhQKBP0UCmE5+D5FOlXJxPcJZOJ0HDRreCJxEY45VRCMwEb/CCEI+p4tYOiC/NT2436ORn96w4DfheebCn50XT0QWRutJgilT1aWNYUycHehOatti7eERrCa+CRVTKKhKKtjiPYYs6sze1a+CodafrQIfMJz2o1tqg7awQTwlOot0TUvpRu3v1nKTyNB4RFm7uVvJgMyw7L/WYhHMdW08KMTV0Hsx2+z1joG7lFZ8NdmBTC20n+4LcEbw+2OplWvbXYiv8m9gnhnG29zeSYEM4YUMcLSVTd+ZPTwrQhu4Twp9GVvWiPEP5xGzjcU0CF8EZi/WE3mdN0wPDqVjZiXgi/eNkHq8A3bbNd+BxTwrN9m5tP1sDuOrjFfmGnfcJB1Neac6eGUGiuuMRWId1tztf2C0fVZX26uBoOdMp5pXC+NSZMC0cN6vcIpM1rHBeWV+iwIbxitxA+siG9F9Zzcb0vO2lUSsvCrBE3O2yv+uXM213xOq/7r6cu/nZf58Ly/uDbDBAyhSmfuWTJgHM+Nu5HuVCTiyu9kK1Eaum7UZ0rgV4vlXoH2VWaZ+vsXAXk1vgfdrvwb9OwC6MAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTUtMDktMDdUMDM6NDk6MzgtMDQ6MDAHF8TvAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE1LTA5LTA3VDAzOjQ5OjM4LTA0OjAwdkp8UwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII="
};