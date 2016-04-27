﻿/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

$(document).ajaxStart(function() {
    $("#spinner").show();
    document.getElementById("opacityDiv").style.opacity = 0.3;
});

$(document).ajaxStop(function() {
    $("#spinner").hide();
    document.getElementById("opacityDiv").style.opacity = 1.0;
});

$(document).ready(function() {
    document.addEventListener("backbutton", onBackKeyDown, false);
    
    window.localStorage.clear();
    $("#spinner").hide();
    errorPopup.close();
    $(".closeImg").append('<img src='+ base64image.closeImg +'>');
    geolocation.startFindPosition();
});

function onBackKeyDown() {
    navigator.app.exitApp();
}

var geolocation = {
    //function that find the current position with gps, internet mobile, wifi or sim
    findCurrentPosition: function() {
		"use strict";
        console.log("findCurrentPosition");
		navigator.geolocation.getCurrentPosition(
			this.onPositionSuccess,
			this.onPositionError,
			{ maximumAge: 5000, timeout: 30000, enableHighAccuracy: true });
	},
		
    //
	onPositionSuccess: function(position) {
		"use strict";
        console.log("position: " +position);
        app.ajaxCall( position.coords.latitude , position.coords.longitude );
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
		alert( messaggio );
	},
    
    findPositionId: null,
    
    startFindPosition: function() {
        this.findPositionId = navigator.geolocation.watchPosition(this.onPositionSuccess2,
                                                  this.onPositionError2,
			{ maximumAge: 5000, timeout: 30000, enableHighAccuracy: true });
    },
    
    onPositionSuccess2: function(position) {
        "use strict";
        console.log("position: " +position);
        document.getElementById( "location" ).innerHTML = "Lat: " + position.coords.latitude + "<br>" +
                                                          "Lon: " + position.coords.longitude;
    },
    
    onPositionError2: function(error) {
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
        navigator.geolocation.clearWatch( geolocation.findPositionId );
    }
};

var app = {
    
    
    permanentStorage: window.localStorage,
    
    map: function() {
        window.location.href = "map.html";
    },
    
    ajaxCall: function( lat , lon ) {
        console.log("lat: "+lat+" long: "+lon);
        $.ajax({
            method : 'get',
            url : 'http://nico-fritz.asuscomm.com:8080/GeolocationServlet/poi?lat='+ lat +'&lng='+ lon,
            dataType : 'json',
            
            success : function(result) {
                console.log(result);
                app.permanentStorage.setItem( "info" , JSON.stringify( result ) );
                //app.permanentStorage.setItem( "info1" , result );
                window.location.href = "map.html";
            },
            
            error : function(error) {
                console.log(error.status);
                errorPopup.open();
                document.getElementById("popup-text").innerHTML = error.status;
            }
        });
    },
    
    getData: function() {
        var result = '['
            + '{"title": "punto1" , "type": "type1" , "image": "image1" , "description": "punto1" , "lat": 45.48180044131416 , "lng": 12.15581157322572},'
            + '{"title": "punto2" , "type": "type1" , "image": "image2" , "description": "punto2" , "lat": 45.58031244877388 , "lng": 12.093459866077152},'
            + '{"title": "punto3" , "type": "type1" , "image": "image3" , "description": "punto3" , "lat": 45.50668460758791 , "lng": 12.153354418986025},'
            + '{"title": "punto4" , "type": "type1" , "image": "image4" , "description": "punto4" , "lat": 45.53572447616481 , "lng": 12.124377901261482},'
            + '{"title": "punto5" , "type": "type1" , "image": "image5" , "description": "punto5" , "lat": 45.49782970420162 , "lng": 12.187257852446187},'
            + '{"title": "punto6" , "type": "type1" , "image": "image6" , "description": "punto6" , "lat": 45.46613468164949 , "lng": 12.135853025884211},'
            + '{"title": "punto7" , "type": "type2" , "image": "image7" , "description": "punto7" , "lat": 45.47780102783627 , "lng": 12.099805098138917},'
            + '{"title": "punto8" , "type": "type2" , "image": "image8" , "description": "punto8" , "lat": 45.49314542957933 , "lng": 12.104406746663743},'
            + '{"title": "punto9" , "type": "type2" , "image": "image9" , "description": "punto9" , "lat": 45.43629405234991 , "lng": 12.050538462233956},'
            + '{"title": "punto10" , "type": "type3" , "image": "image10" , "description": "punto10" , "lat": 45.45635609374537 , "lng": 12.046036411033366},'
            + '{"title": "punto11" , "type": "type3" , "image": "image11" , "description": "punto11" , "lat": 45.4168799949603 , "lng": 12.058508769624078},'
            + '{"title": "punto12" , "type": "type3" , "image": "image12" , "description": "punto12" , "lat": 45.49366170951895 , "lng": 12.062884748262343}'
         + ']';
        app.permanentStorage.setItem( "info" , JSON.stringify( result ) );
        //app.permanentStorage.setItem( "info1" , result );
        window.location.href = "map.html";
    }
};

var errorPopup = {
    isOpen: false,
    
    open: function() {
        $("#errorPopup").show();
        this.isOpen = true;
    },
    
    close: function() {
        $("#errorPopup").hide();
        this.isOpen = false;
    }
};

var base64image = {
    closeImg: "data:image/png;base64,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"
};
