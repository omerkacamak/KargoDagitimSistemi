const { ipcMain } = require("electron");
const electron = require("electron");
const { cp } = require("original-fs");
const { ipcRenderer } = electron;
let map;
let ways = [];
let tarif;
let foto = "./cargo.png";
let sirket= "./sirket.png"
let mm;
let endLocation;
const izmit = { lat: 40.679744960066536, lng: 29.968844310351994 };
/*ways.push({     // ilk durağımız!!!
  location: "izmit",
        stopover: true
});*/
const ankara = { lat: 39.925533, lng: 32.866287 };
let isaretciler = [];
function initMap() {

  const directionsRenderer = new google.maps.DirectionsRenderer();
  const directionService = new google.maps.DirectionsService();


   map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: izmit,

  });
  var smarker = new google.maps.Marker({
    position: izmit,
    title: "Hello World!",
    icon: foto
  });

  var tarker =new google.maps.Marker({
    position: izmit,
    title: "Hello World!",
    icon: sirket
  });
  tarker.setMap(map);
  console.log(smarker.position);
  setInterval(function(){
    
    ipcRenderer.send('istek');
    ipcRenderer.on('sguzergah',(e,yol)=>{
     if(yol.length!=0)
     {
      ipcRenderer.send('yeni',yol[0].location); //silme
      console.log(yol[0].location);
     
     }
     setTimeout(function(){
      ipcRenderer.send('istek2');
      if(mm)
      {
        mm.setMap(null);
      }
       mm =new google.maps.Marker({
        position: endLocation,
        map:map,
        icon: foto,
        title: "Hello World!",
      });
      if(yol.length!=0)
      {
        const infowindow = new google.maps.InfoWindow({
          content: "KURYE " +yol[1].location + " YOLUNDA",
        });
        
          infowindow.open(map, mm);
  
      }
     
     },1000)
    });
   
    
    console.log(endLocation)
  },15000)
  


  
  console.log(ways);

  smarker.setMap(null);


  console.log(tarif + " tarif1");
  directionsRenderer.setMap(map);
  ipcRenderer.on('guzergah', (e, yollar) => {
    console.log(yollar);
    
   
    
    
   /* console.log(ways);
  for (item of yollar) {
      ways.push({
        location: item.MusteriLokasyon,
        stopover: true
      });
    }
    console.log(ways);*/
   // console.log(ways[0].location);
    calculateAndDisplayRoute(directionService, directionsRenderer,yollar);

  })
  addMarker(tarif, map);

  ipcRenderer.on('syollar2', (err, veri) => {
   
  })

} // init map sonu ********




function calculateAndDisplayRoute(directionsService, directionsRenderer,dizi) {

/* if(dizi.length===0)
 {
   
  ipcRenderer.send('izmit');
  console.log('izmite girdi')
 }*/
console.log("ÇALIŞ")
console.log(dizi);
console.log(dizi.anlik)
//console.log( dizi.sonyol[dizi.sonyol.length-1].location);
console.log(dizi.sonyol);
  if(dizi.anlik.length!=0)
{

  // let baslangic = dizi.anlik.shift();
let son = dizi.anlik.pop();
//console.log(baslangic);
console.log(son);
console.log(dizi);

setTimeout(function(){
  

  directionsService
    .route({
      origin: {
        query: dizi.sonyol.length == 0 ? 'izmit' : dizi.sonyol[dizi.sonyol.length-1].location,
      },
      destination: {
        query: son.location,
      },
      waypoints: dizi.anlik,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .then((response) => {
      directionsRenderer.setDirections(response);
      const route = response.routes[0];
      console.log(response.routes[0].overview_path[0]);
      let aa = JSON.stringify(route.legs[0].end_location.toJSON(), null, 2);
      tarif = JSON.parse(aa);


      console.log(tarif.lat + " this is tarif");
      console.log(tarif.lng + " this is tarif");
      ipcRenderer.send('syollar', tarif);

      console.log(route.legs[0]);
      console.log(route.legs[1]);
      console.log(route.legs);
      
      
      let bb = JSON.stringify(route.legs[0].end_location.toJSON(), null, 2);
      console.log(bb);
       endLocation = JSON.parse(bb);
      console.log("OBJ -->  " + endLocation);
      console.log("OBJ -->  " + endLocation.lat);
      console.log("OBJ  LNG --> " + endLocation.lng);
      
        let alert = document.querySelector('#yolAlert');
        alert.innerHTML=`<h2>KURYE ${route.legs[0].start_address} ADRESİNE TESLİM ETTİ`;
        console.log(dizi);


    })
    .catch((e) => window.alert("Directions request failed due to " + e));
  },900);
} 
}


function addMarker(location, map) {
  // Add the marker at the clicked location, and add the next-available label
  // from the array of alphabetical characters.
  new google.maps.Marker({
    position: location,
    map: map
  });

  console.log("Marker çalıştı");

}



let markerHareket = (pozisyon) => {
  var lurk = new google.maps.Marker({
    position: pozisyon,
    title: "Hello World!",
    icon: foto
  });
  isaretciler.push(lurk);


}