var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';


let myS = document.getElementById("mySidebar");

// Get the DIV with overlay effect
let overlayBg = document.getElementById("myOverlay");

function w3_open() {
    //legendMaker();
    if (myS.style.display === 'block') {
      mySr.style.display = 'none';
      //overlayBg.style.display = "none";
    } else {
      myS.style.display = 'block';
      //overlayBg.style.display = "block";
    };
  }
  
  // Close the sidebar with the close button
  function w3_close() {
    myS.style.display = "none";
    //overlayBg.style.display = "none";
  }

  $(document).ready(function(){
    $("#overview").click(function(){
      $("#overviewDetails").slideToggle();
      $(this).find($(".fa")).toggleClass('fa-chevron-up fa-chevron-down');
    });
  });

  $(document).ready(function(){
    $("#close").click(function(){
      $("#mySidebar").toggle();
      //$(this).find($(".fa")).toggleClass('fa-chevron-up fa-chevron-down');
    });
  });


var dark   = L.tileLayer(mbUrl, {id: 'mapbox/dark-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
streets  = L.tileLayer(mbUrl, {id: 'mapbox/outdoors-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
satellite  = L.tileLayer(mbUrl, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
rivers1 = L.geoJSON(river_map, {
    style: style,
    onEachFeature: onEachFeature,
    filter: function(feature, layer) { 
        if (feature.properties.STRAHLER > 4) {
            return true;
        };
    }
});
rivers2 = L.geoJSON(river_map, {
    style: style,
    onEachFeature: onEachFeature,
    filter: function(feature, layer) { 
        if (feature.properties.STRAHLER > 2) {
            return true;
        };
    }
});
rivers3 = L.geoJSON(river_map, {
    style: style,
    onEachFeature: onEachFeature,
    filter: function(feature, layer) { 
        if (feature.properties.STRAHLER > 0) {
            return true;
        };
    }
});

var map = L.map('map', {
    minZoom: 3,
    layers: [satellite, rivers1]
    })
    .fitWorld()
    .flyTo([-28,23], 5);

var circle = L.circle([lat, lon], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

function getColor(d) {
return d > 100.00 ? '#08306b' :
    d > 50.00  ? '#08519c' :
    d > 20.00  ? '#2171b5' :
    d > 10.00  ? '#4292c6' :
    d > 5.00  ? '#6baed6' :
    d > 2.00  ? '##9ecae1' :
    d > 1.00   ? '#c6dbef' :
                '#deebf7';
}


function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: getColor(feature.properties.LENGTH_KM),
        dashArray: '1',
        fillOpacity: 0.4,
        fillColor: 'white'
    };
}

function highlightFeature(e) {
    var layer = e.target;
    //let name = layer.feature.properties.NAME;
    layer.setStyle({
        weight: 5,
        color: '#a50f15',
        dashArray: '1',
        fillOpacity: 0.7,
        
    });
    sendToSide(e);

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
;

}
function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle([e.latlng, radius],{
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5
    }).addTo(map);
}

function onLocationError(e) {
    alert(e.message);
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

map.locate({setView: true, maxZoom: 16});

function sendToSide (e) {
    let name = e.target.feature.properties.NAME;
    let distToMouth = e.target.feature.properties.DIST2MTH / 1000;
    let lengthRiv = e.target.feature.properties.LENGTH_KM;
    let classRiv = e.target.feature.properties.CLASS;
    document.getElementById("eventM").innerHTML = 
    `<h4>${name} River</h4>`;
    document.getElementById("lengthRiv").innerHTML = 
    `<p>Length: <br><b>${parseFloat(lengthRiv).toFixed(2)} Km<b></p>`;
    document.getElementById("distToMouth").innerHTML = 
    `<p>To mouth: <br><b> ${parseFloat(distToMouth).toFixed(2)} Km</b></p>`;
    document.getElementById("classRiv").innerHTML = 
    `<p>Type: <b>${classRiv}</b></p>`;

    let chemArray;

async function getCsv () {

    let response = await fetch('data/chemistry.csv');
    const csv = await response.text();
    let something = Papa.parse(csv, {
        header: true,
    });
    return something
}

async function controller () {

    let chemData = await getCsv();
    

    for (let i=0; i<chemData.data.length; i++) {

        if (chemData.data[i]['River Name'] == name){

            document.getElementById("chemistryPH").innerHTML = 
            `<p>pH: <b> ${chemData.data[i]['PH']? chemData.data[i]['PH']: "N/A"}</b></p>
            <p>Phosphates: <b> ${chemData.data[i]['PO4-P']? chemData.data[i]['PO4-P']: "N/A"}</b></p>
            <p>Ammonium: <b> ${chemData.data[i]['NH4-N']? chemData.data[i]['NH4-N']: "N/A"}</b></p>`;
            break;
        }
        
        let arr = chemData.data[i];
        function itero(){
            let output = '';
            
                for(let keys in arr) {
                    for (let b=0; b<5; b++){
                        output += JSON.stringify(arr) +JSON.stringify(arr[keys]);
                        }
                    let stringo = output.replace(/"/gi, '') + `</br></br>`;
                    return stringo;
            }
        }
   
        document.getElementById("popo").innerHTML = `<p>${itero()}</p>`; 
    
        }
        
    }



    

controller();
}



function resetHighlight(e) {
    rivers1.resetStyle(e.target);
    rivers2.resetStyle(e.target);
    rivers3.resetStyle(e.target);  

}



function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
    var layer = e.target;
    
    console.log((layer.feature.properties ? layer.feature.properties.TMPRIV_ : null));
    

   /*$(document).ready(function (){
        $("dd").load("data/data.json",function(response, status){
            if (status == "success"){
              $(response).each(function(){
 
                var text = JSON.parse(response);
                $('dd').text(text.TMPRIV_).appendTo('dd');
              });
              
            }
        });
    });  */
    //obj.push([{"TMPRIV_" : "layer.feature.properties.TMPRIV_", "waterQuality": "0", "managed": "0"}]);

}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
    
}


map.on('zoomend', function() {
    var zoomlevel = map.getZoom();
    if (zoomlevel  <= 5){
        if (map.hasLayer(rivers1 || rivers1 && rivers2 || rivers3)) {
            map.removeLayer(rivers2);
            map.removeLayer(rivers3);
            console.log("rivers 1 already active");
        } else {
            map.addLayer(rivers1);
            console.log("rivers 1 added");
        }
    }
    if (zoomlevel >= 6 && zoomlevel <10){
        if (map.hasLayer(rivers2 || rivers2 && rivers1 || rivers3)){
            map.removeLayer(rivers1);
            map.removeLayer(rivers3);
            console.log("rivers 2 already active");
        }
        else {
            map.addLayer(rivers2);
            console.log("rivers 2 added");
        }
    }
    if (zoomlevel >= 10){
        if (map.hasLayer(rivers3 || rivers3 && rivers1 || rivers2)){
            map.removeLayer(rivers1);
            map.removeLayer(rivers2);
            console.log("rivers 3 already active");
        } else {
            map.addLayer(rivers3);
            console.log("rivers 3 added");
        }
    }
    console.log("Current Zoom Level =" + zoomlevel)
});


/*function legendMaker (map) {

    var div = document.getElementById('legendA'),
    grades = [0, 1, 2, 5, 10, 20, 50, 100],
    labels = [],
    from, to;

    for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
        '<i style="background:' + getColor(from + 1) + '"></i> ' +
        from + (to ? '&ndash;' + to : ' + Km'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);
*/

let lat, lon;
const button = document.getElementById('w3-bar-item w3-button w3-padding');
button.addEventListener('click', async event => {
  const state = document.getElementById('state').value;
  const data = { lat, lon, state };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
  const response = await fetch('/api', options);
  const json = await response.json();
  console.log(json);
  
});

if ('geolocation' in navigator) {
  console.log('geolocation available');
  navigator.geolocation.getCurrentPosition(async position => {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    document.getElementById('latitude').textContent = lat;
    document.getElementById('longitude').textContent = lon;
  });
} else {
  console.log('geolocation not available');
}

/*async function getCsv () {
    const response = await fetch('data/chemistry.csv');
    const csvData = await response.text();
    let sliced = csvData.split('\n').slice(1,20);

    console.log(sliced);
}

  getCsv();
  */
const headings = ['RHP Site Code','Sampling Date','LatitudeGIS','LongitudeGIS','Reference Site','Site Visit Owner','River Name','Tributary Of','Drainage Region','Longitudinal Zone','Altitude','Political Region','Water Management Area','Ecoregion 1','Ecoregion 2','Secondary Catchment','Quartenary Catchment','Vegetation Type','Geology Type','Bioregion','Water Chemistry management region','Rainfall Region','Fastest Flow','Samples Collected','Water Filtered','Volume Filtered','Date of Analysis','Sample Frozen','Preservatives','Institute','Turbidity','AL','AL-DISS','AL-H','AS','AS-DISS','AS-H','B','B-DISS','B-H','BA','BA-DISS','BA-H','BE','BE-DISS','BE-H','CA','CaCO3','CD','CD-DISS','CD-H','CL','CO','CO-DISS','CO-H','COD','COND','CR','CR-DISS','CR-H','CU','CU-DISS','CU-H','DO','DOC','DOPER','ECOLI','F','FE','FE-DISS','FE-H','HG','HG-H','K','KN','MG','MN','MN-DISS','MN-H','MO','MO-DISS','MO-H','NA','NH4-N','NI','NI-DISS','NI-H','NO2-N','NO3+NO2-N','NO3-N','ORGS','PB','PB-DISS','PB-H','PH','PHEN','PO4-P','REDOX','SALINITY','SD','SI','SO4','SR','SR-DISS','SR-H','SRP','TAL','TDS','TEMP','TI','TI-DISS','TI-H','TP','TSS','TURB','V','V-DISS','V-H','ZN','ZN-DISS','ZN-H','ZR','ZR-DISS','ZR-H'];

var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}