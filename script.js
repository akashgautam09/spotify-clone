let songs;
let currfolder;
let currentsong = new Audio(); // Audio object to control song playback
let time = document.createElement("div"); // Used to display current time and duration


// Play Music Function

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track;

    // Show song name in UI
    document.querySelector(".info").innerHTML = decodeURI(track);

    // Update time after metadata is loaded (duration available)
    currentsong.addEventListener("loadedmetadata", () => {
        updateTimeDisplay();
    }, { once: true });

    if (!pause) {
        currentsong.play();
        play.src = "svgs/pause.svg";
    }
}


// Time Display Function

function updateTimeDisplay() {
    const currentMinutes = Math.floor(currentsong.currentTime / 60);
    const currentSeconds = Math.floor(currentsong.currentTime % 60);
    const currentTimeFormatted = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;

    const durationMinutes = Math.floor(currentsong.duration / 60);
    const durationSeconds = Math.floor(currentsong.duration % 60);
    const durationFormatted = `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;

    time.innerHTML = `${currentTimeFormatted} / ${durationFormatted}`;

    // Update UI
    document.querySelector(".songtime").innerHTML = time.innerHTML;
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
}


// Fetch Songs from Folder

async function getsongs(folder) {
    currfolder = folder;

    let a = await fetch(`/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs = [];

    // Extract only .mp3 file names from hrefs
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let f = decodeURI(element.href);
            f = f.replace(/\\/g, '/');
            songs.push(f.split(`/${folder}/`)[1]);
        }
    }
    // let artist = songInfo.songs && songInfo.songs[song] ? songInfo.songs[song] : "Unknown Artist";

    // Update song list in the UI
    let infoResponse = await fetch(`/${folder}/info.json`);
    let songInfo = await infoResponse.json();
    let songUL = document.querySelector(".songslist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        let artist = songInfo.songs && songInfo.songs[song] ? songInfo.songs[song] : "Unknown Artist";
        songUL.innerHTML += `
            <li>
                <img class="invert" src="svgs/music.svg" alt="">
                <div class="songinfo">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div class="artist-name">${artist}</div>
                </div>
                <div class="playnow">
                    <div>Play Now</div>
                    <img class="invert" id="libplaybtn" src="svgs/playsong.svg" alt="">
                </div>
            </li>`;
    }

    // Add click event to each song item to play that song
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let track = e.querySelector(".songinfo").firstElementChild.innerHTML.trim();
            playmusic(track);
        });
    });
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("songs")) {

            let cleaned = decodeURI(e.href).replace(/\\/g, "/");
            let folder = (cleaned.split("/").slice(-2)[0]);

            // console.log(folder)
            //    load metadata for albums
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="playbtn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <div class="imagecard"><img src="/songs/${folder}/cover.png" alt=""></div>
                        <div class="cardcontent">
                            <p class="cardP1">${response.title}</p>
                            <p class="cardP2">${response.discription}</p>
                        </div>
                    </div>`

        }
    }
    // Card Click - Change Folder
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0])

        });
    });

}

// Main Function

async function main() {

    displayAlbums()

    // Load initial song list
    await getsongs("songs/nc");

    // Load first song in paused state
    playmusic(songs[0], true);

    // Play / Pause button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "svgs/pause.svg";
        } else {
            currentsong.pause();
            play.src = "svgs/playsong.svg";
        }
    });

    // Update Time During Playback
    currentsong.addEventListener("timeupdate", updateTimeDisplay);

    // Seekbar Click Event
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    // Mobile Menu - Open/Close
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Previous Button
    previous.addEventListener("click", () => {
        console.log("previous clicked");
        let currentSongName = decodeURI(currentsong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentSongName);
        if (index > 0) {
            playmusic(songs[index - 1]);
        } else {
            playmusic(songs[songs.length - 1]); // Loop to last song if at start
        }
    });

    // Next Button
    next.addEventListener("click", () => {
        console.log("next clicked");
        let currentSongName = decodeURI(currentsong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentSongName);
        if (index < songs.length - 1) {
            playmusic(songs[index + 1]);
        } else {
            playmusic(songs[0]); // Loop to first song if at end
        }
    });

    // Volume Control
    document.querySelector(".hide-vol-seek").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;

        const volumeIcon = document.querySelector(".vol-seek-cont>img");
        if (currentsong.volume >= 0.01) {
            if (volumeIcon.src.includes("svgs/mute.svg")) {
                volumeIcon.src = volumeIcon.src.replace("svgs/mute.svg", "svgs/volume.svg");
            }
        } else {
            if (volumeIcon.src.includes("svgs/volume.svg")) {
                volumeIcon.src = volumeIcon.src.replace("svgs/volume.svg", "svgs/mute.svg");
            }
        }

    });

    // Add addEventListener to volume
    document.querySelector(".vol-seek-cont>img").addEventListener("click", e => {
        if (e.target.src.includes("svgs/volume.svg")) {
            e.target.src = e.target.src.replace("svgs/volume.svg", "svgs/mute.svg")
            document.querySelector(".vol-seek-cont").getElementsByTagName("input")[0].value = 0
            currentsong.volume = 0;
        }
        else {
            e.target.src = e.target.src.replace("svgs/mute.svg", "svgs/volume.svg")
            document.querySelector(".vol-seek-cont").getElementsByTagName("input")[0].value = 20
            currentsong.volume = 0.2;
        }
    })
}

main();