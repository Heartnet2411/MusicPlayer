const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const playList = $('.playlist')
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const progress = $('#progress');
const playButton = $('.btn-toggle-play');
const nextButton = $('.btn-next');
const prevButton = $('.btn-prev');
const randomButton = $('.btn-random');
const repeatButton = $('.btn-repeat');

const app = {
    config : JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    currentIndex : 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,

    songs : [
    {
        name: 'Nevada',
        singer: 'Vicetone',
        path: './music/Nevada.mp3',
        image: './img/Nevada.jpg'   
    },
    {
        name: 'Light It Up',
        singer: 'Robin Hustin x TobiMorrow',
        path: './music/LightItUp.mp3',
        image: './img/LightItUp.jpg'
    },
    {       
        name: 'Yoru ni kakeru',
        singer: 'YOASOBI',
        path: './music/YoruniKakeru.mp3',
        image: './img/YoruniKakeru.jpg'
    },
    {
        name: 'Muộn rồi mà sao còn',
        singer: 'Sơn Tùng M-TP',
        path: './music/MuonRoiMaSaoCon.mp3',
        image: './img/MuonRoiMaSaoCon.jpg'
    },
    {
        name: 'See You Again',
        singer: 'Charlie Puth ft Wiz Khalifa',
        path: './music/SeeYouAgain.mp3',
        image: './img/SeeYouAgain.jpg'
    },
    {
        name: 'Symphony',
        singer: 'Clean Bandit ft Zara Larsson',
        path: './music/Symphony.mp3',
        image: './img/Symphony.jpg'
    },
    {
        name: 'Waiting For Love',
        singer: 'Avicii',
        path: './music/WaitingForLove.mp3',
        image: './img/WaitingForLove.jpg'
    },
    {
        name: 'Sugar',
        singer: 'Maroon 5',
        path: './music/Sugar.mp3',
        image: './img/Sugar.jpg'
    },
    {
        name: 'Ame wo Matsu',
        singer: 'Minami',
        path: './music/AmewoMatsu.mp3',
        image: './img/AmewoMatsu.jpg'
    },
    {
        name: 'Faded',
        singer: 'Alan Walker',
        path: './music/Faded.mp3',
        image: './img/Faded.jpg'
    },
    {
        name: 'Alone',
        singer: 'Alan Walker',
        path: './music/Alone.mp3',
        image: './img/Alone.jpg'
    }
            ],
    
    setConfig : function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render : function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index= ${index}>
                    <div class="thumb"
                            style="background-image: url('${song.image}');"></div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = htmls.join('\n')
    },

    handleEvent : function() {
        const cdWidth = cd.offsetWidth;

        // Xu ly CD quay / dung
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        // Xu ly CD phong to / thu nho
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' :0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xu ly pause / play
        playButton.onclick = function() {
            if(app.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }  
        }

        // Khi song duoc play
        audio.onplay = function() {
            app.isPlaying = true
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song bi pause
        audio.onpause = function() {
            app.isPlaying = false
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tien do bai hat thay doi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xu ly khi tua song
        progress.onchange = function (e){
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Xu ly next song
        nextButton.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong()
            } else {
                app.nextSong()  
            }
            audio.play()
        }

        // Xu ly prev song
        prevButton.onclick = function() {
            app.prevSong()
            audio.play()
        }

        // Xu ly random song
        randomButton.onclick = function() {
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            randomButton.classList.toggle('active', app.isRandom)
        }

        // Xu ly repeat song
        repeatButton.onclick = function() {
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)
            repeatButton.classList.toggle('active', app.isRepeat)
        }

        // Xu ly next song khi audio ended
        audio.onended = function() {
            if(app.isRepeat) {
                audio.play()
            } else {
                nextButton.click()
            }
        }

        // Lang nghe hanh vi click vao playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode && !e.target.closest('.option')) {
                //Xu ly khi click vao song
                
                if(songNode) {
                    app.currentIndex = Number(songNode.dataset.index)
                    app.loadCurrentSong()
                    audio.play()
                }
                // Xu ly khi click vao song option
                if(e.target.closest('.option')) {
                }
            }
        }
    },

    defineProperties : function() {
        Object.defineProperty(this, 'currentSong', {
            get : function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    loadCurrentSong : function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
        this.render()
        this.scrollToActiveSong()
    },

    //scroll den bai hat dang phat
    scrollToActiveSong : function(){
        if(this.currentIndex <= 3){
            $('.song.active').scrollIntoView({
                behavior : 'smooth',
                block : 'end'
            })}
        else{
            setTimeout(() => {
                $('.song.active').scrollIntoView({
                    behavior : 'smooth',
                    block : 'nearest'
                })
            }, 300)
        }
    },

    //xu ly khi click vao next song
    nextSong : function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length ){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    //xu ly khi click vao prev song
    prevSong : function(){
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length -1
        }
        this.loadCurrentSong()
    },

    playRandomSong : function(){
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while(newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    loadConfig : function() {  
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    start : function() {
        // Gan cau hinh tu config vao ung dung
        this.loadConfig();
        //Dinh nghia cac thuoc tinh cho object
        this.defineProperties();
        // Lang nghe xu ly cac su kien
        this.handleEvent();
        // Tai thong tin bai hat dau tien vao UI khi chay ung dung
        this.loadCurrentSong();
        // Tai cac bai hat vao UI
        this.render();

        // Hien thi trang thai ban dau cua button repeat & random
        randomButton.classList.toggle('active', this.isRandom)
        repeatButton.classList.toggle('active', this.isRepeat)
    },
}

app.start();