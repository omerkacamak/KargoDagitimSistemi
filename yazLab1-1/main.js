const electron = require("electron");
const url = require("url");
const path = require("path");
const db = require("./connection").db;
const { ipcRenderer } = require("electron");
let orjyollar = [];
const { app, BrowserWindow, Menu, ipcMain } = electron;

let birinciGUI, ikinciGUI, teslimatGUI;
let takimlar = [];
app.on('ready', () => {
    birinciGUI = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        width: 600,
        height: 600,
        x: 40,
        y: 40

    })

    birinciGUI.loadURL(
        url.format({
            pathname: path.join(__dirname, "/birinciGUI/loginEkrani/login.html"),
            protocol: "file",
            slashes: true
        })


    );


    ipcMain.on('girisYapildi', (err, data) => {  // giriş butonuna basıldığı an gelen bilgi
        openFrame();
        birinciGUI.close();
    })


    ipcMain.on('syollar', (err, data) => {    // yollar path olayı
        console.log(data.lat);
        ikinciGUI.webContents.send('syollar2', data);
    })



    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);


    //************************************ */


    birinciGUI.webContents.once("dom-ready", () => {
    
        ipcMain.on('musteriEkle', (err, data) => {
            console.log(data.adres + "   LAAAA");
            db.query("INSERT INTO musteriler (MusteriAdi,MusteriLokasyon) VALUES('" + data.ad + "','" + data.adres + "') ", (e, results, f) => {
                console.log(e + " RESULTS BURDA");
            });

                /*************************************************** */ //SSSSSS

          db.query("SELECT * FROM musteriler", (e, sonuc, f) => {
                teslimatGUI.webContents.send('tabloGeldi', sonuc);

            })

            


            /***************************************************** */
            db.query("SELECT * FROM musteriler ORDER BY MusteriID DESC LIMIT 1", (e, r, f) => {  // ANLIK MÜŞTERİ TABLOSUNA EKLİYORUZ!
                console.log(r[0].MusteriID + " bokluk");
                db.query("INSERT INTO anlikMusteri (MusteriID) VALUES('" + r[0].MusteriID + "')", (er, re, fe) => {
                    
                    db.query("SELECT * FROM  anlikMusteri,musteriler where anlikMusteri.MusteriID =musteriler.MusteriID", (eror, sonuc, fef) => {
                        let orj = [];
                        for (item of sonuc) {
                            orj.push({
                                location: item.MusteriLokasyon,
                                stopover: true
                            })
                        }
                        let sons =[];
                        db.query('SELECT * FROM musteriler  where MusteriID NOT IN (select MusteriID from anlikMusteri)',(hat,sncr,t)=>{

                            for (item of sncr) {
                                sons.push({
                                    location: item.MusteriLokasyon,
                                    stopover: true
                                })
                            }
                            //console.log(sons[sons.length-1].location + "  zaa");
                            console.log(orj);
                            ikinciGUI.webContents.send('guzergah', {
                                anlik: orj,
                                sonyol:sons
                            });
                        })




                        
                        console.log(orj);

                    })
                })

                
            })

            /**************************************************** */
           
        }) // musteri ekle sonu

        ipcMain.on('show', (err, data) => {
            db.query("SELECT * FROM  anlikMusteri,musteriler where anlikMusteri.MusteriID =musteriler.MusteriID", (eror, sonuc, fef) => {
                let orj = [];
                for (item of sonuc) {
                    orj.push({
                        location: item.MusteriLokasyon,
                        stopover: true
                    })
                }
              
                db.query('SELECT * FROM musteriler  where MusteriID NOT IN (select MusteriID from anlikMusteri)',(hat,sncr,t)=>{
                    let sons =[];
                    for (item of sncr) {
                        sons.push({
                            location: item.MusteriLokasyon,
                            stopover: true
                        })
                    }
                    console.log(sons + "  zaa");
                            console.log(orj);
                    ikinciGUI.webContents.send('guzergah', {
                        anlik: orj,
                        sonyol:sons
                    });
                })
                console.log(orj+"sese");

            })
        })
    })
ipcMain.on('girisyap',(a,gveri)=>{
    db.query('SELECT count(kullaniciid) as giris FROM kullanicilar where kullaniciAdi ="'+gveri.isim+'" and kullanicisifre="'+gveri.password+'"' , (errr,tsonuc,yu)=>{
        console.log(tsonuc[0].giris);
       birinciGUI.webContents.send('girissorgu',tsonuc[0].giris);
    })
})
    ipcMain.on('yeni', (err, data) => {
        console.log("Kim bu " + data);
        db.query("SELECT MusteriID FROM musteriler where MusteriLokasyon = ?", data, (err, ress, fef) => {
            console.log(ress[0].MusteriID);
            db.query("DELETE FROM anlikMusteri where MusteriID= ?", ress[0].MusteriID, (ero, son, ret) => {
                db.query("SELECT * FROM  anlikMusteri,musteriler where anlikMusteri.MusteriID =musteriler.MusteriID", (eror, sonuc, fef) => {
                    let orj = [];
                    for (item of sonuc) {
                        orj.push({
                            location: item.MusteriLokasyon,
                            stopover: true
                        })
                    }

                    let sons =[];
                    db.query('SELECT * FROM musteriler  where MusteriID NOT IN (select MusteriID from anlikMusteri)',(hat,sncr,t)=>{

                        for (item of sncr) {
                            sons.push({
                                location: item.MusteriLokasyon,
                                stopover: true
                            })
                        }
                      //  console.log(sons[sons.length-1].location + "  zaa");
                            console.log(orj);
                        ikinciGUI.webContents.send('guzergah', {
                            anlik: orj,
                            sonyol:sons
                        });
                    })
                    console.log(orj);


                })
            })

        })
    })
ipcMain.on('tumsil',(e,t)=>{
    db.query('DELETE FROM anlikMusteri',(a,bc,d)=>{

    });
    db.query('DELETE FROM musteriler',(ax,bcx,dx)=>{

    });
    
})
ipcMain.on('izmit',(d,et)=>{
    db.query("INSERT INTO musteriler (MusteriAdi,MusteriLokasyon,teslimDurumu) VALUES('MERKEZ','izmit','MERKEZ') ",(erf,fer,ter)=>{
        
    })
})

    ipcMain.on('acilis', (e, results) => {  // sayfa ilk açıldığpında kargo listesi gelir!!!!
       /* db.query("SELECT * FROM musteriler", (e, r, f) => {
            teslimatGUI.webContents.send('tabloyaFoc', r);
            console.log(r);
        })*/
        // ***********************************************
        db.query('SELECT * FROM musteriler where MusteriID NOT IN (select MusteriID from anlikMusteri)',(hata,sncx,fg)=>{
            let ss =[];
            console.log(sncx + "  sncx iptal")
            for(item of sncx)
            {
                ss.push({
                    MusteriID :item.MusteriID,
                    MusteriAdi :item.MusteriAdi,
                    MusteriLokasyon: item.MusteriLokasyon,
                    teslimDurumu: item.teslimDurumu
                })
            }
    
            for(it of ss)
            {
                it.teslimDurumu='TESLİM EDİLDİ';
            }
            let anlik =[];
            db.query('SELECT * FROM  anlikMusteri,musteriler where anlikMusteri.MusteriID =musteriler.MusteriID ',(ht,rsltx,tt)=>{
                teslimatGUI.webContents.send('tabloyaFoc',{
                    eskiMusteriler: ss,
                    anlikMusteriler: rsltx
                });
                
            })
            
        })

        //************************************************* */
       
    })
ipcMain.on('istek',(hat,veriq)=>{
    db.query("SELECT * FROM  anlikMusteri,musteriler where anlikMusteri.MusteriID =musteriler.MusteriID", (eror, resul, fef) => {
        let orj = [];
        for (item of resul) {
            orj.push({
                location: item.MusteriLokasyon,
                stopover: true
            })
        }

        ikinciGUI.webContents.send('sguzergah', orj);
        console.log(orj);
        


    })  
   
   
}) // İSTEK SONU
ipcMain.on('tekteksil',(hata,bilgi)=>{
    db.query('DELETE FROM anlikMusteri where MusteriID= ?',bilgi,(e,t,f)=>{
        
    });
    db.query('DELETE FROM musteriler where MusteriID= ?',bilgi,(x,y,z)=>{
        
    });

})
ipcMain.on('istek2',(et,dt)=>{
    db.query('SELECT * FROM musteriler where MusteriID NOT IN (select MusteriID from anlikMusteri)',(hata,snc,fg)=>{
        let dizim =[];
        for(item of snc)
        {
            dizim.push({
                MusteriID :item.MusteriID,
                MusteriAdi :item.MusteriAdi,
                MusteriLokasyon: item.MusteriLokasyon,
                teslimDurumu: item.teslimDurumu
            })
        }

        for(it of dizim)
        {
            it.teslimDurumu='TESLİM EDİLDİ';
        }
        let anlik =[];
        db.query('SELECT * FROM  anlikMusteri,musteriler where anlikMusteri.MusteriID =musteriler.MusteriID ',(ht,rslt,tt)=>{
            teslimatGUI.webContents.send('teslimbitti',{
                eskiMusteriler: dizim,
                anlikMusteriler: rslt
            });


        })
        
    })
})

ipcMain.on('eklela',(et,dt)=>{
    db.query('SELECT * FROM musteriler where MusteriID NOT IN (select MusteriID from anlikMusteri)',(hata,sncı,fg)=>{
        let dizimx =[];
        for(item of sncı)
        {
            dizimx.push({
                MusteriID :item.MusteriID,
                MusteriAdi :item.MusteriAdi,
                MusteriLokasyon: item.MusteriLokasyon,
                teslimDurumu: item.teslimDurumu
            })
        }

        for(it of dizimx)
        {
            it.teslimDurumu='TESLİM EDİLDİ';
        }
        let anlik =[];
        db.query('SELECT * FROM  anlikMusteri,musteriler where anlikMusteri.MusteriID =musteriler.MusteriID ',(ht,rslty,tt)=>{
            teslimatGUI.webContents.send('ekledim',{
                eskiMusteriler: dizimx,
                anlikMusteriler: rslty
            });


        })
        
    })
})




//setInterval(function(){
    /*db.query("SELECT * FROM  anlikMusteri,musteriler where anlikMusteri.MusteriID =musteriler.MusteriID", (eror, resul, fef) => {
        let orj = [];
        for (item of resul) {
            orj.push({
                location: item.MusteriLokasyon,
                stopover: true
            })
        }

        ikinciGUI.webContents.send('sguzergah', orj);
        console.log(orj);
        


    })*/

   /* db.query('SELECT * FROM musteriler where MusteriID NOT IN (select MusteriID from anlikmusteri)',(hata,snc,fg)=>{
        let dizim =[];
        for(item of snc)
        {
            dizim.push({
                MusteriID :item.MusteriID,
                MusteriAdi :item.MusteriAdi,
                MusteriLokasyon: item.MusteriLokasyon,
                teslimDurumu: item.teslimDurumu
            })
        }

        for(it of dizim)
        {
            it.teslimDurumu='TESLİM EDİLDİ';
        }
        let anlik =[];
        db.query('SELECT * FROM  anlikMusteri,musteriler where anlikMusteri.MusteriID =musteriler.MusteriID ',(ht,rslt,tt)=>{
            teslimatGUI.webContents.send('teslimbitti',{
                eskiMusteriler: dizim,
                anlikMusteriler: rslt
            });
        })
        
    })*/
//},10000) // set interval

}) // app.on sonu



const mainMenuTemplate = [
    {

        label: "Console",
        click(item, focusedWindow) {
            focusedWindow.toggleDevTools();

        }
    }
]


let openFrame = () => {  // yeni açılacak iki gui
    teslimatGUI = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        width: 750,
        height: 700,
        x: 40,
        y: 40

    })




    teslimatGUI.loadURL(
        url.format({
            pathname: path.join(__dirname, "/birinciGUI/teslimatEkrani/teslimatEkrani.html"),
            protocol: "file",
            slashes: true
        })
    );

    ikinciGUI = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        width: 650,
        height: 700,
        x: 750,
        y: 40

    })




    ikinciGUI.loadURL(
        url.format({
            pathname: path.join(__dirname, "/ikinciGUI/harita.html"),
            protocol: "file",
            slashes: true
        })
    );


}





let baslangic = (strings)=>{
    db.query('SELECT * FROM musteriler where MusteriID NOT IN (select MusteriID from anlikMusteri)',(hata,sncx,fg)=>{
        let ss =[];
        for(item of sncx)
        {
            ss.push({
                MusteriID :item.MusteriID,
                MusteriAdi :item.MusteriAdi,
                MusteriLokasyon: item.MusteriLokasyon,
                teslimDurumu: item.teslimDurumu
            })
        }

        for(it of ss)
        {
            it.teslimDurumu='TESLİM EDİLDİ';
        }
        let anlik =[];
        db.query('SELECT * FROM  anlikMusteri,musteriler where anlikMusteri.MusteriID =musteriler.MusteriID ',(ht,rsltx,tt)=>{
            teslimatGUI.webContents.send(strings,{
                eskiMusteriler: ss,
                anlikMusteriler: rsltx
            });
            
        })
        
    })
}