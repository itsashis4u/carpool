var mapContainer = document.getElementById('map-container');
var map = new google.maps.Map(mapContainer, {
          zoom:16,
          center: {lat: 20.2961, lng: 85.8245}
        });

var directionsService = new google.maps.DirectionsService;
var directionsDisplay = new google.maps.DirectionsRenderer({
            map: map
        })
var pointsArray = [];
var count = 1;
window.flag = false;
function getLocation(){
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	}
	else{
		alert("Geolocation not supported");
	}

	clickInitialize();
}

function clickInitialize() {
	google.maps.event.addListener(map, 'click', function(args) {  
        console.log('latlng', args.latLng);
    	pointsArray.push({id : count, lat : args.latLng.lat(), lng : args.latLng.lng(), markerId : new google.maps.Marker({
	      position: {lat : args.latLng.lat(), lng : args.latLng.lng()},
	      animation: google.maps.Animation.DROP,
	      map: map,
	      title: "("+ args.latLng.lat() + ", " + args.latLng.lng() + ")"
        })
    });  	
	      count++;
    });
}

function showPosition(position){
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	map.setCenter(new google.maps.LatLng(lat, lng));
	 
	// console.log(position.coords.accuracy)
}
var distanceArray = [];
document.querySelector("#finish").addEventListener('click', function(e){
	distanceArray = [];
	for (var i = 0; i < pointsArray.length; i++) {
		for(var j = i+1; j < pointsArray.length ; j++){
			var dist = calcDistance(pointsArray[i],pointsArray[j]);
			// console.log(JSON.stringify(pointsArray[i]) + " " + JSON.stringify(pointsArray[j])  + " " + dist);
			if (typeof distanceArray[i] == "undefined")
				distanceArray[i] = [dist]
			else
				distanceArray[i].push(dist)
			//distanceArray.push({path : pointsArray[i].id + "-" + pointsArray[j].id, distance : dist});
		}
	}
	var least_path = get_path_dist(0, pointsArray, [], 0)

console.log("Optimum Path: ", JSON.stringify(least_path));

renderPath(least_path[1]);
showResult(least_path)

e.target.disabled = true;
document.querySelector("#removeMarker").disabled = true;
});


//To reset
document.querySelector("#reset").addEventListener('click', function(){
	for (var i = 0; i < pointsArray.length; i++) {
		pointsArray[i].markerId.setMap(null);

	}
	pointsArray = [];
	distanceArray = [];
	document.querySelector("#finish").disabled = false;
	document.querySelector("#removeMarker").disabled = false;
	document.querySelector("#dist").innerHTML = "";
	document.querySelector("#path").innerHTML = "";
});

//To remove last marker 
document.querySelector("#removeMarker").addEventListener('click', function(e){
	pointsArray[pointsArray.length - 1].markerId.setMap(null);
	delete pointsArray[pointsArray.length - 1];
});


function calcDistance(p1, p2) {
	l1 = new google.maps.LatLng(p1.lat, p1.lng);
	l2 = new google.maps.LatLng(p2.lat, p2.lng);

  return (google.maps.geometry.spherical.computeDistanceBetween(l1, l2) / 1000).toFixed(5);
}


// Find distance between 2 points
function dist(pt1, pt2) {
	return parseFloat(calcDistance(pt1, pt2))
	// i = pt1 <= pt2 ? pt1 : pt2
	// j = pt1 > pt2 ? pt1 : pt2
	// return distanceArray[i][j-i-1]
}

// Get shortest path in DFS
function get_path_dist (from, cods, path, dist_ij) {
    if (path.indexOf(from) != -1)
        return [dist_ij, path]

    path = JSON.parse(JSON.stringify(path))
    path.push(from)

    var len = path.length+1 == cods.length ? cods.length:cods.length-1
    var local_path = [-1, []]

    for (var i=0; i<len; i++) {
        if (path.indexOf(i) != -1)
            continue
        // var tmp = get_path_dist(i, cods, path, dist_ij+dist(cods[from], cods[i]))
        var tmp = get_path_dist(i, cods, path, dist_ij+dist(cods[from], cods[i]))
        if (local_path[0] == -1 || tmp[0] < local_path[0])
            local_path = tmp
    }
    
    if (local_path[0] == -1)
        return [dist_ij, path]
    return [local_path[0], local_path[1]]
}

// Array of co-ordinaates
// var cods = [[1, 1], [0, 2], [2, 2], [0, 1], [2, 1], [0, 0], [1, 0], [2, 0], [1, 2]] 
// var cod_count = cods.length

// var least_path = get_path_dist(0, cods, [], 0)

// console.log("Optimum Path: ", JSON.stringify(least_path))

function renderPath(optimalArray){
	if(window.flag){
		for (var i = 0; i < pointsArray.length; i++) {
		pointsArray[i].markerId.setMap(null);
	}
	var source = new google.maps.LatLng(pointsArray[0].lat, pointsArray[0].lng);
	var dest = new google.maps.LatLng(pointsArray[optimalArray.length-1].lat, pointsArray[optimalArray.length-1].lng);
	var waypts = [];
	for (var i = 1; i < optimalArray.length - 1; i++) {
		waypts.push({
                location: new google.maps.LatLng(pointsArray[i].lat, pointsArray[i].lng),
                stopover: true
              });
		
	}
	directionsService.route({
        origin: source,
        destination: dest,
        avoidTolls: true,
        waypoints : waypts,
        optimizeWaypoints:true,
        avoidHighways: false,
        travelMode: google.maps.TravelMode.DRIVING
    }, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
	}
	else{
		return false;
	}
}
function showResult(arr){
	document.querySelector("#dist").innerHTML = arr[0] + " KM";
	document.querySelector("#path").innerHTML = arr[1].join(', ');

}

window.onload = getLocation;