const electron = require("electron");
const { cp } = require("original-fs");
const {ipcRenderer} = electron;

const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let image = "./qwe.png"
let labelIndex = 0;
let dizi;
function initMap(){
    const izmit={lat:40.679744960066536, lng:29.968844310351994};
    const ornek ={lat:3912145., lng:31.054510000000004};
    const ankara = { lat: 39.925533, lng: 32.866287 };
  

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: ankara
      });
     // addMarker(ornek,map)
      const geocoder = new google.maps.Geocoder();
      const infowindow = new google.maps.InfoWindow();

      google.maps.event.addListener(map, "click", (event) => { // HARİTA ÜSTÜNE TIKLAMA EVENTİ
        console.log("TIKLADIM");
        addMarker(event.latLng, map);
        console.log(JSON.stringify(event.latLng.toJSON(), null, 2));
    objs=JSON.stringify(event.latLng.toJSON(), null, 2);
    dizi=JSON.parse(objs);
        console.log(dizi.lat+ "zaaa  " +dizi.lng);
       geocodeLatLng(geocoder, map, infowindow);
      });

     
} // init map sonu


let musteriAdi = document.getElementById('musteriAdi');
let musteriAdres = document.getElementById('musteriAdres');
let body =document.querySelector("#govde");


    body.innerHTML='';
    ipcRenderer.send('acilis'); // tabloyu almak için acilisi gönder ne olursa olsun !!!!
    

ipcRenderer.on('tabloyaFoc',(e,data)=>{ // Sayfa ilk açıldığında siparişler gelsin !!!
    for(item of data.eskiMusteriler)
        {
            tabloGetir(item.MusteriID,item.MusteriAdi,item.MusteriLokasyon,item.teslimDurumu);
        }
        console.log(data.eskiMusteriler);
        console.log(data.anlikMusteriler)

        for(item of data.anlikMusteriler)
        {
            tabloGetir(item.MusteriID,item.MusteriAdi,item.MusteriLokasyon,item.teslimDurumu);
        }
})

/*const silBtn =document.querySelector('#silBtn');
silBtn.addEventListener('click',()=>{
ipcRenderer.send('hepsisilmeTalebi')
{
  body.innerHTML='';
  
}

})*/
ipcRenderer.on('teslimbitti',(error,verix)=>{
  body.innerHTML='';

  for(item of verix.eskiMusteriler)
  {
    tabloGetir(item.MusteriID,item.MusteriAdi,item.MusteriLokasyon,item.teslimDurumu);
  }
  for(item2 of verix.anlikMusteriler)
  {
    tabloGetir(item2.MusteriID,item2.MusteriAdi,item2.MusteriLokasyon,item2.teslimDurumu);
  }
})


let qw=0;
const ekleBtn = document.querySelector('#ekleBtn');
const showbtn = document.querySelector('#show');
showbtn.addEventListener('click',()=>{
  ipcRenderer.send('tumsil');
  body.innerHTML='';
})
ipcRenderer.send('show');
ekleBtn.addEventListener('click', ()=>{
    ipcRenderer.send('musteriEkle',{
        ad:musteriAdi.value,
        adres:musteriAdres.value
    });
    tabloGetir(0,musteriAdi.value,musteriAdres.value,'YOLDA');
   qw++;

   /* ipcRenderer.on('tabloGeldi',(err,data)=>{
      
      body.innerHTML='';
      
        for(item of data)
        {
          
            tabloGetir(item.MusteriID,item.MusteriAdi,item.MusteriLokasyon,item.teslimDurumu);
            console.log(item.MusteriID,item.MusteriAdi,item.MusteriLokasyon,item.teslimDurumu);
           
        }

        
    })*/
    /*ipcRenderer.send('eklela');
    ipcRenderer.on('ekledim',(h,v)=>{
      body.innerHTML='';
      for(item of v.eskiMusteriler)
        {
          
            tabloGetir(item.MusteriID,item.MusteriAdi,item.MusteriLokasyon,item.teslimDurumu);
            console.log(item.MusteriID,item.MusteriAdi,item.MusteriLokasyon,item.teslimDurumu);
           
        }

        for(item of v.anlikMusteriler)
        {
          
            tabloGetir(item.MusteriID,item.MusteriAdi,item.MusteriLokasyon,item.teslimDurumu);
            console.log(item.MusteriID,item.MusteriAdi,item.MusteriLokasyon,item.teslimDurumu);
           
        }
    })*/

    
})


let tabloGetir = (id,ad,adres,teslim)=>{
    console.log("BAŞLADI")
    let tr = document.createElement('tr');
    let td0 = document.createElement('td');
    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let td3 = document.createElement('td');
    let td4 =document.createElement('td');
    let tbody = document.querySelector('#govde');
    let deleteBtn = document.createElement('button');
if(teslim=="YOLDA")
{
    td3.classList='bg-warning'
    console.log("EVET YOLDA")
}
else if(teslim==="TESLİM EDİLDİ"){
    td3.classList="bg-success"
}
else{
    td3.classList="bg-danger"
}
    td0.innerText=id;
    td1.innerText=ad;
    td2.innerText=adres;
    td3.innerText=teslim
    deleteBtn.innerHTML='SİL'
    td4.appendChild(deleteBtn);
    tbody.appendChild(tr);
    tr.appendChild(td0);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    console.log("BİTTİ")


    deleteBtn.addEventListener('click',(e)=>{
      e.preventDefault();
      console.log(e.target.parentElement.parentElement);
      e.target.parentElement.parentElement.remove();
      ipcRenderer.send('tekteksil',e.target.parentElement.parentElement.children[0].innerText);
      ipcRenderer.send('show');
    })
}


function addMarker(location, map) {
    // Add the marker at the clicked location, and add the next-available label
    // from the array of alphabetical characters.
    new google.maps.Marker({
      position: location,
      label: labels[labelIndex++ % labels.length],
      map: map,
      icon: image,
      draggable:true
    });
  
  
    
  }


  function geocodeLatLng(geocoder, map, infowindow) {
    
   a=dizi.lat;
   b=dizi.lng;
  let inp = document.getElementById('musteriAdres');
    const ax = parseFloat(a);
    const bx = parseFloat(b);
   
    const latlng = {
      lat: ax,
      lng: bx,
    };
  
    geocoder
      .geocode({ location: latlng })
      .then((response) => {
        if (response.results[0]) {
         
  
       /*   const marker = new google.maps.Marker({
            position: latlng,
            map: map,
          });
  
          infowindow.setContent(response.results[0].formatted_address);*/
          
          //console.log("Norm ENDER   " + response.results[0].address_components[2].long_name +
          //response.results[0].address_components[1].long_name);
          //inp.value=response.results[0].address_components[2].long_name +"  " +response.results[0].address_components[1].long_name + "  " +response.results[0].address_components[3].long_name ;
          inp.value=response.results[0].formatted_address;
          console.log(response.results[0]);
         // infowindow.open(map, marker);
        } else {
          window.alert("No results found");
        }
      })
      .catch((e) => window.alert("Geocoder failed due to: " + e));
  }