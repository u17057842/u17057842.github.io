var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';


let myS = document.getElementById("mySidebar");


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
        .bindPopup("Accuracy: " + radius + "m").openPopup();
    L.circle(e.latlng, radius).addTo(map);
}

function onLocationError(e) {
    alert(e.message);
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

map.locate();

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
            <p>Ammonium: <b> ${chemData.data[i]['NH4-N']? chemData.data[i]['NH4-N']: "N/A"}</b></p>
            <p>Lead: <b> ${chemData.data[i]['PB']? chemData.data[i]['PB']: "N/A"}</b></p>`;

            document.getElementById("pollution").innerHTML = 
            `<p>Toxicity Level: <b>${chemData.data[i]['PB'] >= 0.01 ? "HIGH" : "N/A"}</b></p>`;

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
var baseLayers = {
    "Mapbox dark": dark,
    "Street map": streets,
    "Satellite map": satellite

};

L.control.layers(baseLayers).addTo(map);


const headings = ['RHP Site Code','Sampling Date','LatitudeGIS','LongitudeGIS','Reference Site','Site Visit Owner','River Name','Tributary Of','Drainage Region','Longitudinal Zone','Altitude','Political Region','Water Management Area','Ecoregion 1','Ecoregion 2','Secondary Catchment','Quartenary Catchment','Vegetation Type','Geology Type','Bioregion','Water Chemistry management region','Rainfall Region','Fastest Flow','Samples Collected','Water Filtered','Volume Filtered','Date of Analysis','Sample Frozen','Preservatives','Institute','Turbidity','AL','AL-DISS','AL-H','AS','AS-DISS','AS-H','B','B-DISS','B-H','BA','BA-DISS','BA-H','BE','BE-DISS','BE-H','CA','CaCO3','CD','CD-DISS','CD-H','CL','CO','CO-DISS','CO-H','COD','COND','CR','CR-DISS','CR-H','CU','CU-DISS','CU-H','DO','DOC','DOPER','ECOLI','F','FE','FE-DISS','FE-H','HG','HG-H','K','KN','MG','MN','MN-DISS','MN-H','MO','MO-DISS','MO-H','NA','NH4-N','NI','NI-DISS','NI-H','NO2-N','NO3+NO2-N','NO3-N','ORGS','PB','PB-DISS','PB-H','PH','PHEN','PO4-P','REDOX','SALINITY','SD','SI','SO4','SR','SR-DISS','SR-H','SRP','TAL','TDS','TEMP','TI','TI-DISS','TI-H','TP','TSS','TURB','V','V-DISS','V-H','ZN','ZN-DISS','ZN-H','ZR','ZR-DISS','ZR-H'];

var modal = document.getElementById("myModal");


var btn = document.getElementById("myBtn");

var span = document.getElementsByClassName("close")[0];


btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

var slider = document.getElementById("qualitySlider");
var output = document.getElementById("qualitySliderValue"); 
output.innerHTML = slider.value; 

slider.oninput = function() {
  output.innerHTML = this.value;
}