const app = {
    reviews: [],
    tempURL: null,
    permFolder: null,
    oldFile: null,
    permFile: null,
    
    KEY: null,
    init: () => {
      //set key based on device id
      app.KEY = "device" in window ? "REVIEW" + device.uuid : "REVIEWTEMPKEY";
      //check localstorage for list of reviews
      
      app.setTime();
    },
    setTime:()=>{
      setTimeout(function() {
        app.getReviews();
        console.log("File system/plugin is ready");
        app.addListeners();
        app.getPermFolder();
      }, 2000);
      
    },
    getPermFolder: ()=>{
      let path = cordova.file.dataDirectory;
      resolveLocalFileSystemURL(
        path,
        dirEntry => {
          dirEntry.getDirectory(
            "images",
            { create: true },
            permDir => {
              app.permFolder = permDir;
              console.log("Created or opened", permDir.nativeURL);
              
              
            },
            err => {
              console.warn("failed to create or open permanent image dir");
            }
            );
          },
          err => {
            console.warn("We should not be getting an error yet");
          }
          );
        },
        
        getReviews: () => {
          let ul = document.querySelector(".review-list");

          if (localStorage.getItem(app.KEY)) {
            let str = localStorage.getItem(app.KEY);
            app.reviews = JSON.parse(str);
          }
          console.log(app.reviews)
          if(app.reviews.length === 0){
            
            ul.innerHTML = "There are no reviews yet ,please click add button to add a review";
          }
          else{
            ul.innerHTML="";
            let array = app.reviews.forEach(element=>{
              let li = document.createElement("li");
              li.setAttribute("data-id",element.id);
              let img = document.createElement("img");
              img.setAttribute("src",element.img);
              img.setAttribute("alt","reviewed image ");
              let p = document.createElement("p");
              p.textContent = `Title:- ${element.title}`;
              let p1 = document.createElement("p");
              p1.textContent = `Rating:- ${element.rating}`;
              li.appendChild(img);
              li.appendChild(p);
              li.appendChild(p1);
              ul.appendChild(li);
            })
          }
        },
        details:(ev)=>{
          let clicked = ev.target;
          let compare = clicked.closest('[data-id]');
          console.log(compare)
          let dataid = parseInt(compare.getAttribute('data-id'));
          console.log(dataid)
          let detail = app.reviews.find(inside=>
            inside.id === dataid
            )
            console.log(detail)
            document.querySelector("#imgDetails").setAttribute("src",detail.img);
            document.querySelector("span").textContent = `Rating:- ${detail.rating}`;
            document.querySelector(".item").textContent = `Title:- ${detail.title}`;
            document.querySelector("#home").classList.remove("active");
            document.querySelector("#details").classList.add("active");
            app.oldFile = detail.id;
          },
          addListeners: () => {
            //from home to details
            document.getElementById("btnAdd").addEventListener("click", app.nav);
            //from home to add
            document
            .getElementById("btnDetailsBack")
            .addEventListener("click", app.nav);
            //from add to home
            document.getElementById("btnAddBack").addEventListener("click", app.nav);
            document.querySelector("ul").addEventListener("click",app.details);
            document.getElementById("btnDelete").addEventListener("click",app.delete);
            
    },
    nav: ev => {

      let btn = ev.target;
      let target = btn.getAttribute("data-target");
      document.getElementById("take").addEventListener("click",app.review);
      document.querySelector(".page.active").classList.remove("active");
      document.getElementById(target).classList.add("active");
      document.querySelector("#add").classList.remove("hasPhoto");
    document.querySelector("#name").value = "";
    },
    review:()=>{
      console.log("working");
      let opts = {
        quality: 80,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        mediaType: Camera.MediaType.PICTURE,
        encodingType: Camera.EncodingType.JPEG,
        cameraDirection: Camera.Direction.BACK,
        targetWidth: 300,
        targetHeight: 400
    };
    
    navigator.camera.getPicture(app.ftw, app.wtf, opts);
    },
    ftw: function(imgURI){
      console.log("got it")
      app.tempURL = imgURI;
    
      document.getElementById('imgAdd').src = app.tempURL;
      document.querySelector("#add").classList.add("hasPhoto");
      let stars = document.querySelectorAll('.star');
            console.log(stars)
            stars.forEach(function(star){
                star.addEventListener('click', app.setRating); 
                console.log("stars")
            });
            
            let rating = parseInt(document.querySelector('.stars').getAttribute('data-rating'));
            let target = stars[rating - 1];
            target.dispatchEvent(new MouseEvent('click'));
        
      document.querySelector("#btnSave").addEventListener("click",app.copyimg);

      },
  wtf: function(){
      console.log("not get it")
      // document.getElementById('msg').textContent = msg;
  },
  
  copyimg:()=>{
    
    let fileName = Date.now().toString() + ".jpg";

    
    resolveLocalFileSystemURL(
      app.tempURL,
      entry => {
        entry.copyTo(
          app.permFolder,
          fileName,
          permFile => {
            let name = document.querySelector("#name").value;
            let rat = parseInt(document.querySelector(".stars").getAttribute("data-rating"));
            console.log(rat)
            if(name == ""){
              alert("please enter valid title")
            }
            else{
              app.permFile = permFile;    
              document.getElementById("add").classList.remove("active");
              document.getElementById("home").classList.add("active");
              document.querySelector("#add").classList.remove("hasPhoto");
              document.querySelector("#name").value = "";
              
              
              let url=app.permFile;
              let url1 = url.nativeURL;
              app.reviews.push(
                {id:Date.now(),
                  title:name,
                  rating:rat,
                  img:url1
                }
                )
                localStorage.setItem(app.KEY, JSON.stringify(app.reviews));
                app.getReviews();
         
            } 
          },
          fileErr => {
            console.warn("Copy error", fileErr);
          }
          );
        },
        
        err => {
          console.error(err);
        }
        );
      },
      setRating:(ev)=>{
        console.log("stars")
        let span = ev.currentTarget;
        
        let stars = document.querySelectorAll('.star');
        let match = false;
        let num = 0;
        stars.forEach(function(star, index){
            if(match){
                star.classList.remove('rated');
            }else{
                star.classList.add('rated');
            }
            //are we currently looking at the span that was clicked
            if(star === span){
                match = true;
                num = index + 1;
            }
        });
        document.querySelector('.stars').setAttribute('data-rating', num);
    },
      
  delete:()=>{
    let old = app.oldFile;
    console.log(old);
    let dell = app.reviews.forEach(element=>{

      if(old===element.id){
        console.log(element.id);
        let index = app.reviews.indexOf(element);
        let newdata = app.reviews.splice(index,1);
        console.log(app.reviews);

        localStorage.setItem(app.KEY,JSON.stringify(app.reviews));
        app.getReviews();
        document.querySelector("#details").classList.remove("active");
        document.querySelector("#home").classList.add("active");

      }
      
    }
      )
    
    
    

  },
  cancel:()=>{
    
  },
  };
  const ready = "cordova" in window ? "deviceready" : "DOMContentLoaded";
  document.addEventListener(ready, app.init);