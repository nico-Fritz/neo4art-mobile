document.addEventListener("deviceready", function() {
    
    zoomMap.getValue();
    
    if( window.localStorage.getItem("mapType") === "ROADMAP" ) {
        document.getElementById("roadmapCheckbox").innerHTML = '<img class="img" src="'+ base64image.check +'"/>';
        document.getElementById("satelliteCheckbox").innerHTML = '';
    } else {
        document.getElementById("satelliteCheckbox").innerHTML = '<img class="img" src="'+ base64image.check +'"/>';
        document.getElementById("roadmapCheckbox").innerHTML = '';
    }
    
    document.addEventListener("backbutton", phoneEvent.onBackKeyDown , false);
    
    //To support multiple devices
    var windowHeightSeventyPercent = parseInt(screen.height * 0.7); 
    
    //Make page body scroll by adding height to make user to fillup field.
    $("input").focusin(function(){
        $("body").height($("body").height()+parseInt(windowHeightSeventyPercent)); 
    });

    $("input").focusout(function(){
        $("body").height($("body").height()-parseInt(windowHeightSeventyPercent));
    });
    
}, false);

var phoneEvent = {
    onBackKeyDown: function() {
        window.localStorage.setItem( "mapZoom" , zoomMap.value );
        window.location.href = "map.html";
    }
};

var maptype = {
    roadmap: function() {
        console.log("check roadmap");
        document.getElementById("roadmapCheckbox").innerHTML = '"<img class="img" src="'+ base64image.check +'"/>';
        document.getElementById("satelliteCheckbox").innerHTML = '';
        window.localStorage.setItem("mapType", "ROADMAP");
    },
    
    satellite: function() {
        console.log("check satellite");
        document.getElementById("satelliteCheckbox").innerHTML = '<img class="img" src="'+ base64image.check +'"/>';
        document.getElementById("roadmapCheckbox").innerHTML = '';
        window.localStorage.setItem("mapType", "SATELLITE");
    }
}

zoomMap = {
    value: 0,
    
    getValue: function() {
        this.value = window.localStorage.getItem("mapZoom");
        $("#zoomBar").val( this.value );
        $("#zoomValueText").val( this.value );
    },
    
    changeValueBar: function( value ) {
        console.log(value);
        $("#zoomValueText").val( value );
        this.value = value;
    },
    
    changeValueText: function( value ) {
        console.log(value);
        $("#zoomBar").val( value );
        this.value = value;
    },
};

var settings = {
	save: function() {
		window.localStorage.setItem("mapRange",document.getElementById("rangeValueText").value);
		console.log("saved: " + document.getElementById("rangeValueText").value);
	}
};

var base64image = {
    check: "data:image/png;base64,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"
};