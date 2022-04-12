const { ipcMain } = require("electron");
const electron = require("electron");
const { ipcRenderer } = electron;

const girisBtn = document.querySelector('#girisBtn');
let ad = document.querySelector('#kullaniciAdi');
let sifre = document.querySelector('#sifre');

girisBtn.addEventListener('click', () => {
    ipcRenderer.send('girisyap',{
        isim:ad.value,
        password: sifre.value
        
    });

    ipcRenderer.on('girissorgu',(hata,data)=>{
        console.log(data);
        if(data==1)
        {
            console.log("Girişe basıldı");
            ipcRenderer.send('girisYapildi', "Giriş Yapildi");
        }

        else{
            window.alert('Hatalı Kullanıcı Adı veya Şifre');
        }
    })

   

})