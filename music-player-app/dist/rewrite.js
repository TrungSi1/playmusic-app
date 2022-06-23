/**
 * render playlist
 * cuộn thay đổi width của cd
 * play và pause bài hát current
 * xoay cd khi play
 * next song và prev song
 * random và repeat
 * xử lý chuyển khi hết bài
 * tránh random trúng bài đã nghe
 * active nếu song được play
 * autoscroll bài đang active lên view
 * click song trong playlist để play
 * dùng json sever lưu config app
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = 'appPlayMusic'; //khai báo mảng để lưu trữ trong json server

const cd = $('.cd')
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $('audio');
const play = $('.btn-toggle-play');
const player = $('.player');
const progressValue = $('.progress');
const nextSongBtn = $('.btn-next');
const prevSongBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');



// quay đĩa cd dùng animate web API 
const cdRotate = cdThumb.animate([
  {transform: 'rotate(360deg)'}
],
{
  duration: 40000,
  iterations: Infinity
})
cdRotate.pause() // vừa tạo ra nó sẽ auto xoay nên phải pause nó lại 

//1. render playlist
//2. scroll thi cd nho lai
const app = {
    currentIndex: 0, 
    randomActive: false,
    repeatActive: false,
    isPlaying: false,
    config: {}, //trường hợp không có json server thì cho config ban đầu là rỗng
    // lấy giá trị config repeatActive, randomActive trong json
    config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},

    played:[],
    songs: [
        {
            name: 'Ước Mơ Của Mẹ',
            singer: 'Văn Mai Hương',
            path: 'https://tainhacmienphi.biz/download-music/129996',
            image: 'https://i.scdn.co/image/ab67616d0000b273eb1347995c27ccd3fc470b16'

        },
        {
            name: 'Giấc Mơ Trưa',
            singer: 'Thùy Chi',
            path: "https://tainhac365.org/download-music/6293",
            image: 'https://www.daophatngaynay.com/vn/files/images/2017/quy3/c29b30420ffaf80b4ab2ca7401f60db9_959131269.jpg'
        },
        {
            name: 'Quê Tôi',
            singer: 'Thùy Chi',
            path: "https://tainhac365.org/download-music/19634",
            image: 'https://media.blogradio.vn/Upload/CMS/Nam_2014/Thang_8/Ngay_14/Images/que-toi-1.jpg'
        },
        {
            name: 'Phải Chăng Em Đã Yêu',
            singer: 'Juky San',
            path: 'https://tainhac365.org/download-music/442964',
            image: 'https://i.scdn.co/image/ab67616d0000b2733c5aa1993ffb4faf43369065'
        },
        {
            name: 'Ánh Sao Và Bầu Trời',
            singer: 'T.R.I',
            path: 'https://tainhac365.org/download-music/516285',
            image: 'https://i1.sndcdn.com/artworks-INX0oflBP0a2bTJJ-j3y3BA-t500x500.jpg'
        },
        {
            name: 'Hai Mươi Hai (22)',
            singer: 'Amee',
            path: 'https://tainhac365.org/download-music/559374',
            image: 'https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_jpeg/cover/b/6/d/e/b6de6c0857b19e1c921f2d379817d491.jpg'
        },
        {
            name: 'Nhật Kí Đom Đóm',
            singer: 'Bảo Uyên',
            path: 'https://aredir.nixcdn.com/NhacCuaTui932/NhatKyDomDomChoEmGanAnhThemChutNuaOst-BaoUyen-4697494.mp3?st=3rA9a986hAmciVI4X_qoSg&e=1655830019',
            image: 'https://data.chiasenhac.com/data/cover/109/108887.jpg'
        },
        {
            name: 'Có Hẹn Với Thanh Xuân',
            singer: 'Monstar',
            path: 'https://tainhac365.org/download-music/492524',
            image: 'https://kenh14cdn.com/thumb_w/660/203336854389633024/2021/7/18/photo-1-16266149790192082922515.jpg'
        }
    ],

    // set trạng thái của random và repeat vào json 
    setConfig: function (key, value) {
      this.config[key] = value; // gán lại mảng config
      localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config)); //cập nhật lại vào json
    }, 

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {  // tạo một object trong app tên currentSong với value là kết quả của funtion 
          get: function () {
            return this.songs[this.currentIndex]; // 0 trong currentIndex là bài hát đầu tiên
          }
        });
      },

    loadCurrentSong: function () {
      
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
      },

    render: function(){
        const html = this.songs.map((song,index) => { //this la app
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div
              class="thumb"
              style="
                background-image: url(${song.image});
              "
            ></div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        });
        $('.playlist').innerHTML = html.join('');
    },
   
    handleEvent: function(){
      // Tăng giảm đĩa cd lúc cuộn
        const cdWidth = cd.offsetWidth;
        document.onscroll = () => {
           const scrolltop = window.scrollY; // khi scroll thi bien tang len
           const newCdWidth = cdWidth - scrollY; 
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0 ; // khi scroll nhanh quá nó ra âm do đó cd không biến mất do đó phải có dk này
            cd.style.opacity = newCdWidth / cdWidth;
        }
      
        // nhấn nút để play hoặc pause bài hát
         play.onclick =  () => {
          if(app.isPlaying) {
            audio.pause();
          }
           else{
            audio.play();
          }
        }
        audio.onplay = function () {
          app.isPlaying = true;
          player.classList.add("playing");
          cdRotate.play();
          // chỉ thêm bài hát chưa có trong danh sách đã nghe
          addsongPlayed = app.played.every((song) => app.currentIndex !== song);
          if(addsongPlayed) {
            app.played.push(app.currentIndex);
          }
        
        };
    
        // Khi song bị pause
        // When the song is pause
        audio.onpause = function () {
          app.isPlaying = false;
          player.classList.remove("playing");
          cdRotate.pause();
        };
        
       
        // chay thanh progress
        audio.ontimeupdate = () => {
          if(audio.duration){
            const progressPresent = (audio.currentTime / audio.duration)*100;
            progressValue.value = progressPresent;
          }
        }
        // chức năng tua
        progressValue.onchange = (e) => {
          audio.currentTime = ((e.target.value / 100)*audio.duration);
        };
       
        // bấm nút next bài hát
        nextSongBtn.onclick = () => {
          if(app.randomActive){
            app.randomPlay();
          }
          else {
            app.nextSong();
          }
          audio.play();
            // render lại bài hát đang active
          app.render();
          app.autoScrollSong();
        
        }
        // bấm nút prev bài hát
        prevSongBtn.onclick = () => {
         
          if(app.randomActive){
            app.randomPlay();
           }
           else {
            app.prevSong()
           }
           audio.play();
          // render lại bài hát đang active
           app.render();
           app.autoScrollSong();
        }

        // kích hoạt radom khi nhấn nút random
        randomBtn.onclick = () => {
          app.randomActive = !app.randomActive; //ban đầu đang đưuọc gán là false qua dòng này thành true
          randomBtn.classList.toggle('active',app.randomActive); // sau phẩy là đk, nếu true thì thực hiện add, flase thì remove
          app.setConfig("randomActive", app.randomActive); //set lại config

        }
         // kích hoạt repeat khi nhấn nút repeat
         repeatBtn.onclick = () => {
          app.repeatActive = !app.repeatActive; //ban đầu đang đưuọc gán là false qua dòng này thành true
          repeatBtn.classList.toggle('active',app.repeatActive); // sau phẩy là đk, nếu true thì thực hiện add, flase thì remove
          app.setConfig("repeatActive", app.repeatActive); // set lại config

        }

        //next khi hết bài
        audio.onended = () => {
          // next song hoặc repeat 
          app.repeatActive ? play.click() : nextSongBtn.click(); // cách 2
        }
        
        // play khi ckick bài bất kì
        playlist.onclick = function (e) {
          //hàm closest dùng để get ra cái element mà mình set khi click vào nó hay con của nó
          //.song:not(.active) là thẻ song không có active
          // songNode sau khi thực thi trả ra là một elementHtml type là Object
          const songNode = e.target.closest(".song:not(.active)");
          // xem có click vào đúng chỗ đó không
            // Xử lý khi click vào song
            // Handle when clicking on the song và không click vào option
            if (songNode && !e.target.closest(".option")) {
            // dùng dataset khi trên elementHtml được khai báo 1 Attribute là data-tên
            // khi lấy ra sử dụng thì dataset.tên nó sẽ trả về kiểu string
            app.currentIndex = Number(songNode.dataset.index); //Number() để ép kiểu
            app.loadCurrentSong();
            app.render();
            audio.play();
            }
    
            // Xử lý khi click vào song option
            // Handle when clicking on the song option
            if (e.target.closest(".option")) {
            }
        };
       
        
    },

    nextSong:  function ()  { // nếu dùn Array funtion thì không dùng this được this phải là app
      this.currentIndex ++ ;
      if(this.currentIndex >= this.songs.length){
        this.currentIndex = 0 ;
      }
      app.loadCurrentSong();
    },
    prevSong:  function ()  { // nếu dùn Array funtion thì không dùng this được this phải là app
      this.currentIndex -- ;
      if(this.currentIndex < 0){
        this.currentIndex = this.songs.length - 1 ; // lấy index nên trừ đi 1 thì index = 7 là bài số 8
      }
      app.loadCurrentSong();
    },
    //thực hiên random
    randomPlay: () => {
      let randomIndex ;
      let songPlay;
      do {
       randomIndex = Math.floor(Math.random() * app.songs.length);// hàm random nhân bao nhiêu thì nó sẽ ran dom trong khoản đó
      // làm rỗng mảng đã nghe khi đã nghe hết list
       if(app.played.length == app.songs.length){
        app.played = [];
      };
        songPlay = app.played.some((song) => randomIndex === song);
       // tránh random trúng bài hiện tại hoặc bài đã nghe
      } while (randomIndex === app.currentIndex || songPlay);
      app.currentIndex = randomIndex ;
      app.loadCurrentSong();
    },
    // Tự động cuộn
    autoScrollSong: function () {
      setTimeout(() => {
        $(".song.active").scrollIntoView({
          behavior: "smooth", // hiệu ứng cuộn
          block: "end" //vị trí cuộn tới
          // nếu block nằm trong vùng nhìn thấy thì scroll chính vị tri đó
          // nếu block ở vị trí không nhìn thấy thì scroll tới cuối view nhìn
        });
      }, 300);
    },

    //lấy giá trị config lấy được từ json gán lại cho app
    loadConfig: function () {
      this.randomActive = this.config.randomActive;
      this.repeatActive = this.config.repeatActive;
    },
    start: function(){

        //load các trạng thái đã được lưu trong json server
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        // Defines properties for the object
        this.defineProperties();  // Định nghĩa các thuộc tính cho object tạo mới
         // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        // Load the first song information into the UI when running the app
        this.loadCurrentSong();
         // Render playlist
        this.render(); // this la app
         // Lắng nghe / xử lý các sự kiện (DOM events)
        // Listening / handling events (DOM events)
        this.handleEvent();

        randomBtn.classList.toggle("active", this.randomActive);
        repeatBtn.classList.toggle("active", this.repeatActive);
        
    },
};

app.start();

