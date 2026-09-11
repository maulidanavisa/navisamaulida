const gameArea = document.getElementById("gameArea");

const player = document.getElementById("player");

const scoreText = document.getElementById("score");
const coinText = document.getElementById("coins");
const livesText = document.getElementById("lives");
const timerText = document.getElementById("timer");
const keyText = document.getElementById("keyStatus");

const progressBar = document.getElementById("progressBar");

const scoldingScene =
    document.getElementById("scoldingScene");


/* ================= GAME DATA ================= */

let level = 1;

let score = 0;

let coins = 0;

let lives = 3;

let playerX = 50;

let playerY = 50;

let playerSpeed = 4;

let timeLeft = 60;

let hasKey = false;

let gameRunning = false;

let paused = false;

let reverseControl = false;

let hitCooldown = false;

let timerInterval = null;

let eventInterval = null;

let teachers = [];

let walls = [];

const skinStorageKey = "schoolEscapeSkin";
const skinUnlockStorageKey = "schoolEscapeSkinsUnlocked";
let selectedSkin = localStorage.getItem(skinStorageKey) || "classic";
let skinsUnlocked = localStorage.getItem(skinUnlockStorageKey) === "true";


/* ================= KEYS ================= */

const keys = {

    up: false,

    down: false,

    left: false,

    right: false

};


/* ================= KEYBOARD ================= */

document.addEventListener("keydown", function(e) {
    const key = e.key.toLowerCase();


    if (
        key === "w" ||
        key === "arrowup"
    ) {

        keys.up = true;

        e.preventDefault();
    }


    if (
        key === "s" ||
        key === "arrowdown"
    ) {

        keys.down = true;

        e.preventDefault();
    }


    if (
        key === "a" ||
        key === "arrowleft"
    ) {

        keys.left = true;

        e.preventDefault();
    }


    if (
        key === "d" ||
        key === "arrowright"
    ) {

        keys.right = true;

        e.preventDefault();
    }


    if (
        key === "escape" &&
        gameRunning
    ) {

        togglePause();
    }

});

window.addEventListener("blur", function() {
    keys.up = false;
    keys.down = false;
    keys.left = false;
    keys.right = false;
});

document.querySelectorAll("button, .tutorial-item").forEach(function(element) {
    element.addEventListener("pointermove", function(e) {
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--pointer-x", (e.clientX - rect.left) + "px");
        element.style.setProperty("--pointer-y", (e.clientY - rect.top) + "px");
    });
});


document.addEventListener("keyup", function(e) {

    const key = e.key.toLowerCase();


    if (
        key === "w" ||
        key === "arrowup"
    ) {

        keys.up = false;
    }


    if (
        key === "s" ||
        key === "arrowdown"
    ) {

        keys.down = false;
    }


    if (
        key === "a" ||
        key === "arrowleft"
    ) {

        keys.left = false;
    }


    if (
        key === "d" ||
        key === "arrowright"
    ) {

        keys.right = false;
    }

});


/* ================= SCREEN ================= */

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");

        });


    document
        .getElementById(id)
        .classList.add("active");
}


/* ================= START ================= */

function startGame() {

    level = 1;

    score = 0;

    coins = 0;

    lives = 3;

    startBackgroundMusic();

    startLevel();
}

function applyPlayerSkin() {
    player.classList.remove("skin-classic", "skin-neon", "skin-shadow");
    player.classList.add("skin-" + selectedSkin);
}

function updateSkinMenu() {
    const lockStatus = document.getElementById("skinLockStatus");

    document.querySelectorAll(".skin-option").forEach(option => {
        const isLocked = option.dataset.skin !== "classic" && !skinsUnlocked;

        option.disabled = isLocked;
        option.classList.toggle("locked", isLocked);
        option.classList.toggle(
            "selected",
            option.dataset.skin === selectedSkin
        );

        if (isLocked) {
            option.querySelector("span:last-child").textContent =
                option.dataset.skin === "neon"
                    ? "Neon 🔒"
                    : "Shadow 🔒";
        }
    });

    if (lockStatus) {
        lockStatus.textContent = skinsUnlocked
            ? "✅ Semua skin terbuka"
            : "🔒 Selesaikan Level 5";
    }
}

function selectSkin(skin) {
    if (skin !== "classic" && !skinsUnlocked) {
        return;
    }

    selectedSkin = skin;
    localStorage.setItem(skinStorageKey, selectedSkin);
    applyPlayerSkin();
    updateSkinMenu();
}


/* ================= LEVEL ================= */

function startLevel() {

    clearIntervals();

    gameRunning = true;

    paused = false;

    hasKey = false;

    reverseControl = false;

    hitCooldown = false;


    playerSpeed =
        4 + ((level - 1) * 0.35);


    if (level === 1) {

        timeLeft = 60;

    } else if (level === 2) {

        timeLeft = 52;

    } else if (level === 3) {

        timeLeft = 45;

    } else if (level === 4) {

        timeLeft = 38;

    } else {

        timeLeft = 30;

    }


    playerX = 50;

    playerY = 50;


    player.style.left =
        playerX + "px";

    player.style.top =
        playerY + "px";


    showScreen("gameScreen");


    setupLevelTheme();

    resetObjects();

    createLevelObjects();

    setupLevelChallenge();

    updateUI();


    timerInterval =
        setInterval(function() {

            if (
                !gameRunning ||
                paused
            ) {
                return;
            }


            timeLeft--;

            updateUI();


            if (
                timeLeft <= 10 &&
                timeLeft > 0
            ) {

                showMessage(
                    "⚠️ Waktu tinggal " +
                    timeLeft +
                    " detik!"
                );

            }


            if (timeLeft <= 0) {

                gameOver(
                    "⏰ Waktu habis!"
                );

            }

        }, 1000);


    eventInterval =
        setInterval(function() {

            if (
                !gameRunning ||
                paused
            ) {
                return;
            }


            randomEvent();

        },
        Math.max(
            6000,
            9500 - (level * 600)
        ));

}


/* ================= THEME ================= */

function setupLevelTheme() {

    gameArea.classList.remove(
        "level-1",
        "level-2",
        "level-3",
        "level-4",
        "level-5"
    );


    let title;

    let desc;


    if (level === 1) {

        gameArea.classList.add("level-1");

        title =
            "🏫 LEVEL 1 — KELAS";

        desc =
            "Guru mulai mengejar! Cari kunci dan kabur!";

    }


    else if (level === 2) {

        gameArea.classList.add("level-2");

        title =
            "🌑 LEVEL 2 — KORIDOR GELAP";

        desc =
            "Guru lebih cepat + lampu sering mati!";

    }


    else if (level === 3) {

        gameArea.classList.add("level-3");

        title =
            "📚 LEVEL 3 — PERPUSTAKAAN";

        desc =
            "Ada 2 guru yang mengejar kamu!";

    }


    else if (level === 4) {

        gameArea.classList.add("level-4");

        title =
            "💻 LEVEL 4 — LAB KOMPUTER";

        desc =
            "2 guru cepat + kontrol bisa terbalik!";

    }


    else {

        gameArea.classList.add("level-5");

        title =
            "🚨 LEVEL 5 — JAM PULANG";

        desc =
            "3 GURU SUPER CEPAT! JANGAN SAMPAI KENA!";

    }


    document.getElementById(
        "levelTitle"
    ).textContent = title;


    document.getElementById(
        "levelDesc"
    ).textContent = desc;


    const banner =
        document.getElementById(
            "levelBanner"
        );


    banner.classList.add("show");


    setTimeout(function() {

        banner.classList.remove("show");

    }, 2200);

}


/* ================= RESET ================= */

function resetObjects() {

    gameArea
        .querySelectorAll(
            ".teacher, .coin, .book, .wall, .key, .door, .portal, .secret-star, .blackout"
        )
        .forEach(object => {

            object.remove();

        });


    teachers = [];

    walls = [];
}


/* ================= CREATE OBJECTS ================= */

function createLevelObjects() {

    createDoor();

    createKey();


    const coinAmount =
        3 + level;


    for (
        let i = 0;
        i < coinAmount;
        i++
    ) {

        createCoin();

    }


    const bookAmount =
        2 + (level * 2);


    for (
        let i = 0;
        i < bookAmount;
        i++
    ) {

        createBook();

    }


    createWalls();


    let teacherAmount;


    if (level === 1) {

        teacherAmount = 1;

    }

    else if (level === 2) {

        teacherAmount = 1;

    }

    else if (level === 3) {

        teacherAmount = 2;

    }

    else if (level === 4) {

        teacherAmount = 2;

    }

    else {

        teacherAmount = 3;

    }


    for (
        let i = 0;
        i < teacherAmount;
        i++
    ) {

        createTeacher();

    }

}


/* ================= RANDOM ================= */

function randomPosition(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;

}


/* ================= DOOR ================= */

function createDoor() {

    const door =
        document.createElement("div");


    door.className = "door";

    door.textContent = "🚪";


    door.style.left =
        (gameArea.clientWidth - 100) +
        "px";


    door.style.top =
        (gameArea.clientHeight - 120) +
        "px";


    gameArea.appendChild(door);
}


/* ================= KEY ================= */

function createKey() {

    const key =
        document.createElement("div");


    key.className = "key";


    const icon =
        document.createElement("span");

    icon.className = "key-icon";
    icon.textContent = "🔑";

    key.appendChild(icon);


    key.style.left =
        randomPosition(
            120,
            gameArea.clientWidth - 130
        ) + "px";


    key.style.top =
        randomPosition(
            120,
            gameArea.clientHeight - 150
        ) + "px";


    gameArea.appendChild(key);
}


/* ================= COIN ================= */

function createCoin() {

    const coin =
        document.createElement("div");


    coin.className = "coin";


    const image =
        document.createElement("img");


    image.src =
        "coin.png";


    image.alt = "Coin";


    coin.appendChild(image);


    coin.style.left =
        randomPosition(
            80,
            gameArea.clientWidth - 100
        ) + "px";


    coin.style.top =
        randomPosition(
            110,
            gameArea.clientHeight - 120
        ) + "px";


    gameArea.appendChild(coin);
}

/* ================= BOOK ================= */

function createBook() {

    const book =
        document.createElement("div");


    book.className =
        "book obstacle";


    book.textContent = "📚";


    book.style.left =
        randomPosition(
            100,
            gameArea.clientWidth - 130
        ) + "px";


    book.style.top =
        randomPosition(
            100,
            gameArea.clientHeight - 130
        ) + "px";


    gameArea.appendChild(book);
}


/* ================= WALL ================= */

function createWalls() {

    const positions = [

        {
            left: 180,
            top: 150,
            width: 150,
            height: 25
        },

        {
            left: 430,
            top: 220,
            width: 25,
            height: 150
        },

        {
            left: 220,
            top: 400,
            width: 180,
            height: 25
        }

    ];


    if (level >= 3) {

        positions.push({

            left: 600,

            top: 130,

            width: 25,

            height: 160

        });

    }


    if (level >= 4) {

        positions.push({

            left: 520,

            top: 400,

            width: 180,

            height: 25

        });

    }


    if (level >= 5) {

        positions.push({

            left: 100,

            top: 280,

            width: 130,

            height: 25

        });

    }


    positions.forEach(data => {

        const wall =
            document.createElement("div");


        wall.className = "wall";


        wall.style.left =
            data.left + "px";


        wall.style.top =
            data.top + "px";


        wall.style.width =
            data.width + "px";


        wall.style.height =
            data.height + "px";


        gameArea.appendChild(wall);


        walls.push(wall);

    });

}


/* ================= TEACHER ================= */

function createTeacher() {

    const teacher =
        document.createElement("div");


    teacher.className = "teacher";


    const image =
        document.createElement("img");

    image.src =
        "teacher.png";


    image.alt =
        "Guru";


    teacher.appendChild(image);


    let x;

    let y;


    do {

        x =
            randomPosition(
                300,
                gameArea.clientWidth - 120
            );


        y =
            randomPosition(
                130,
                gameArea.clientHeight - 120
            );


    } while (
        Math.abs(x - playerX) < 200
    );


    teacher.style.left =
        x + "px";


    teacher.style.top =
        y + "px";


    let speed;


    if (level === 1) {

        speed = 0.65;

    }
    else if (level === 2) {

        speed = 1.05;

    }
    else if (level === 3) {

        speed = 1.5;

    }
    else if (level === 4) {

        speed = 2.1;

    }
    else {

        speed = 2.8;

    }


    speed +=
        Math.random() * .15;


    teacher.dataset.speed =
        speed.toFixed(2);


    if (level >= 4) {

        teacher.classList.add(
            "level4"
        );

    }


    if (level === 5) {

        teacher.classList.add(
            "level5"
        );

    }


    gameArea.appendChild(teacher);

    teachers.push(teacher);
}


/* ================= CHALLENGE ================= */

function setupLevelChallenge() {

    if (level === 1) {

        showMessage(
            "🏃 GURU MENGEJAR! CEPAT CARI KUNCI!"
        );

    }


    else if (level === 2) {

        showMessage(
            "🌑 KORIDOR GELAP! CARI JALAN SEBELUM LAMPU PADAM!"
        );

        addExtraObstacle();
        addExtraObstacle();

        setTimeout(function() {

            if (gameRunning) {

                activateBlackout();

            }

        }, 2800);

    }


    else if (level === 3) {

        showMessage(
            "📚 PERPUSTAKAAN BERANTAKAN! PORTAL BISA JADI JALAN KELUAR!"
        );


        addExtraObstacle();

        addExtraObstacle();


        setTimeout(function() {

            if (gameRunning) {

                spawnPortal();

            }

        }, 2500);

    }


    else if (level === 4) {

        showMessage(
            "💻 SISTEM ERROR! KONTROL AKAN TERBALIK!"
        );

        activateChase();

        setTimeout(function() {

            if (gameRunning) {

                activateGlitch();

            }

        }, 4000);

    }


    else {

        showMessage(
            "🚨 MODE DARURAT! 3 GURU + LAMPU PADAM! LARI!"
        );

        setTimeout(function() {
            if (gameRunning) {
                activateBlackout();
                activateChase();
            }
        }, 1800);

    }

}


/* ================= EXTRA OBSTACLE ================= */

function addExtraObstacle() {

    const obstacle =
        document.createElement("div");


    obstacle.className =
        "book obstacle";


    obstacle.textContent = "📚";


    obstacle.style.left =
        randomPosition(
            100,
            gameArea.clientWidth - 130
        ) + "px";


    obstacle.style.top =
        randomPosition(
            100,
            gameArea.clientHeight - 130
        ) + "px";


    gameArea.appendChild(obstacle);
}


/* ================= PLAYER MOVEMENT ================= */

function gameMovement() {

    if (
        gameRunning &&
        !paused
    ) {

        let dx = 0;

        let dy = 0;


        if (!reverseControl) {

            if (keys.up) {

                dy -= playerSpeed;

            }

            if (keys.down) {

                dy += playerSpeed;

            }

            if (keys.left) {

                dx -= playerSpeed;

            }

            if (keys.right) {

                dx += playerSpeed;

            }

        }

        else {

            if (keys.up) {

                dy += playerSpeed;

            }

            if (keys.down) {

                dy -= playerSpeed;

            }

            if (keys.left) {

                dx += playerSpeed;

            }

            if (keys.right) {

                dx -= playerSpeed;

            }

        }


        if (
            dx !== 0 &&
            dy !== 0
        ) {

            dx *= .707;

            dy *= .707;

        }


        if (
            dx !== 0 ||
            dy !== 0
        ) {

            movePlayer(dx, dy);

        }

    }


    requestAnimationFrame(
        gameMovement
    );
}


gameMovement();


/* ================= MOVE PLAYER ================= */

function movePlayer(dx, dy) {

    const oldX = playerX;

    const oldY = playerY;


    let newX =
        playerX + dx;


    let newY =
        playerY + dy;


    const maxX =
        gameArea.clientWidth -
        player.offsetWidth;


    const maxY =
        gameArea.clientHeight -
        player.offsetHeight;


    newX =
        Math.max(
            0,
            Math.min(newX, maxX)
        );


    newY =
        Math.max(
            0,
            Math.min(newY, maxY)
        );


    playerX = newX;

    playerY = newY;


    player.style.left =
        playerX + "px";


    player.style.top =
        playerY + "px";


    if (checkWallCollision()) {

        playerX = oldX;

        playerY = oldY;


        player.style.left =
            playerX + "px";


        player.style.top =
            playerY + "px";

    }


    checkInteractions();
}


/* ================= COLLISION WALL ================= */

function checkWallCollision() {

    const playerRect =
        player.getBoundingClientRect();


    for (const wall of walls) {

        if (
            isColliding(
                playerRect,
                wall.getBoundingClientRect()
            )
        ) {

            return true;

        }

    }


    const obstacles =
        gameArea.querySelectorAll(
            ".obstacle"
        );


    for (const obstacle of obstacles) {

        if (
            isColliding(
                playerRect,
                obstacle.getBoundingClientRect()
            )
        ) {

            return true;

        }

    }


    return false;
}


/* ================= INTERACTION ================= */

function checkInteractions() {

    const playerRect =
        player.getBoundingClientRect();


    /* KEY */

    const key =
        gameArea.querySelector(".key");


    if (
        key &&
        isColliding(
            playerRect,
            key.getBoundingClientRect()
        )
    ) {

        hasKey = true;

        score += 100;


        key.remove();


        showMessage(
            "🔑 KUNCI DITEMUKAN! +100"
        );


        updateUI();

    }


    /* COIN */

    gameArea
        .querySelectorAll(".coin")
        .forEach(coin => {

            if (
                isColliding(
                    playerRect,
                    coin.getBoundingClientRect()
                )
            ) {

                coin.remove();

                coins++;

                score += 50;


                showMessage(
                    "🪙 +50 SCORE!"
                );


                updateUI();

            }

        });


    /* STAR */

    const star =
        gameArea.querySelector(
            ".secret-star"
        );


    if (
        star &&
        isColliding(
            playerRect,
            star.getBoundingClientRect()
        )
    ) {

        star.remove();

        score += 500;


        showEvent(
            "⭐ +500 SCORE!"
        );


        updateUI();

    }


    /* PORTAL */

    const portal =
        gameArea.querySelector(
            ".portal"
        );


    if (
        portal &&
        isColliding(
            playerRect,
            portal.getBoundingClientRect()
        )
    ) {

        playerX =
            randomPosition(
                60,
                gameArea.clientWidth - 100
            );


        playerY =
            randomPosition(
                60,
                gameArea.clientHeight - 100
            );


        player.style.left =
            playerX + "px";


        player.style.top =
            playerY + "px";


        portal.remove();


        showEvent(
            "🌀 TELEPORT!"
        );

    }


    /* DOOR */

    const door =
        gameArea.querySelector(
            ".door"
        );


    if (
        door &&
        isColliding(
            playerRect,
            door.getBoundingClientRect()
        )
    ) {

        if (hasKey) {

            levelComplete();

        }

        else {

            showMessage(
                "🔒 AMBIL KUNCI DULU!"
            );

        }

    }


    /* TEACHER */

    teachers.forEach(teacher => {

        if (
            isColliding(
                playerRect,
                teacher.getBoundingClientRect()
            )
        ) {

            loseLife();

        }

    });

}


/* ================= COLLISION ================= */

function isColliding(a, b) {

    return (

        a.left < b.right &&

        a.right > b.left &&

        a.top < b.bottom &&

        a.bottom > b.top

    );

}


/* ================= TEACHER MOVEMENT ================= */

function moveTeachers() {

    if (
        gameRunning &&
        !paused
    ) {

        teachers.forEach(
            teacher => {

                let x =
                    parseFloat(
                        teacher.style.left
                    ) || 0;


                let y =
                    parseFloat(
                        teacher.style.top
                    ) || 0;


                let speed =
                    parseFloat(
                        teacher.dataset.speed
                    );


                const dx =
                    playerX - x;


                const dy =
                    playerY - y;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (distance > 0) {

                    x +=
                        (dx / distance) *
                        speed;


                    y +=
                        (dy / distance) *
                        speed;

                }


                x =
                    Math.max(
                        5,
                        Math.min(
                            x,
                            gameArea.clientWidth - 75
                        )
                    );


                y =
                    Math.max(
                        5,
                        Math.min(
                            y,
                            gameArea.clientHeight - 90
                        )
                    );


                teacher.style.left =
                    x + "px";


                teacher.style.top =
                    y + "px";

            }
        );

    }


    requestAnimationFrame(
        moveTeachers
    );
}


moveTeachers();


/* ================= LOSE LIFE ================= */

function loseLife() {

    if (
        !gameRunning ||
        hitCooldown
    ) {

        return;

    }


    hitCooldown = true;


    lives--;


    score =
        Math.max(
            0,
            score - 30
        );


    updateUI();


    gameArea.classList.add(
        "hit"
    );


    setTimeout(function() {

        gameArea.classList.remove(
            "hit"
        );

    }, 600);


    if (lives > 0) {

        showMessage(
            "😵 KETANGKAP GURU! -1 NYAWA"
        );


        playerX = 50;

        playerY = 50;


        player.style.left =
            playerX + "px";


        player.style.top =
            playerY + "px";


        teachers.forEach(
            teacher => {

                let x =
                    parseFloat(
                        teacher.style.left
                    );


                let y =
                    parseFloat(
                        teacher.style.top
                    );


                if (
                    Math.abs(
                        x - playerX
                    ) < 150 &&
                    Math.abs(
                        y - playerY
                    ) < 150
                ) {

                    teacher.style.left =
                        randomPosition(
                            300,
                            gameArea.clientWidth - 80
                        ) + "px";


                    teacher.style.top =
                        randomPosition(
                            120,
                            gameArea.clientHeight - 80
                        ) + "px";

                }

            }
        );


        setTimeout(
            () => {
                hitCooldown = false;
            },
            1300
        );


        return;

    }


    gameRunning = false;

    clearIntervals();


    showScoldingScene();
}


/* ================= SCOLDING ================= */

function showScoldingScene() {

    scoldingScene.classList.add(
        "show"
    );


    setTimeout(function() {

        scoldingScene.classList.remove(
            "show"
        );


        gameOver(
            "👩‍🏫 Kamu ketahuan guru!"
        );


    }, 3500);
}


/* ================= LEVEL COMPLETE ================= */

function levelComplete() {

    gameRunning = false;

    clearIntervals();


    score +=
        timeLeft * 10;


    updateUI();


    document.getElementById(
        "levelScore"
    ).textContent =
        "⭐ Score: " + score;


    if (level >= 5) {

        finishGame();

        return;

    }


    showScreen(
        "levelCompleteScreen"
    );
}


/* ================= NEXT LEVEL ================= */

function nextLevel() {

    level++;


    if (level > 5) {

        finishGame();

        return;

    }


    startLevel();
}


/* ================= FINISH ================= */

function finishGame() {

    gameRunning = false;

    clearIntervals();

    skinsUnlocked = true;
    localStorage.setItem(skinUnlockStorageKey, "true");
    updateSkinMenu();


    document.getElementById(
        "finalScore"
    ).textContent =
        "🏆 Total Score: " + score;


    document.getElementById(
        "gameOverReason"
    ).textContent =
        "🎉 SEMUA LEVEL BERHASIL!";


    showScreen(
        "gameOverScreen"
    );
}


/* ================= GAME OVER ================= */

function gameOver(reason) {

    gameRunning = false;

    clearIntervals();


    document.getElementById(
        "gameOverReason"
    ).textContent = reason;


    document.getElementById(
        "finalScore"
    ).textContent =
        "⭐ Score: " + score;


    showScreen(
        "gameOverScreen"
    );
}


/* ================= RANDOM EVENT ================= */

function randomEvent() {

    const random =
        Math.floor(
            Math.random() * 6
        );


    if (random === 0) {

        activateBlackout();

    }

    else if (random === 1) {

        activateChase();

    }

    else if (random === 2) {

        secretStar();

    }

    else if (random === 3) {

        energyBoost();

    }

    else if (random === 4) {

        spawnPortal();

    }

    else {

        showEvent(
            "🔔 JANGAN LENGAH!"
        );

    }

}


/* ================= BLACKOUT ================= */

function activateBlackout() {

    if (
        gameArea.querySelector(
            ".blackout"
        )
    ) {

        return;

    }


    const blackout =
        document.createElement("div");


    blackout.className =
        "blackout";


    gameArea.appendChild(
        blackout
    );


    showEvent(
        "💡 BLACKOUT!"
    );


    setTimeout(function() {

        if (
            blackout.isConnected
        ) {

            blackout.remove();


            showEvent(
                "💡 LAMPU MENYALA!"
            );

        }

    }, 3500);

}


/* ================= CHASE ================= */

function activateChase() {

    teachers.forEach(
        teacher => {

            let speed =
                parseFloat(
                    teacher.dataset.speed
                );


            teacher.dataset.speed =
                (
                    speed + .2 + (level * .1)
                ).toFixed(2);

        }
    );


    showEvent(
        "🚨 GURU MENJADI LEBIH CEPAT!"
    );


    setTimeout(function() {

        teachers.forEach(
            teacher => {

                let speed =
                    parseFloat(
                        teacher.dataset.speed
                    );


                teacher.dataset.speed =
                    Math.max(
                        0.65,
                        speed - (.2 + (level * .1))
                    ).toFixed(2);

            }
        );


        showEvent(
            "😮 Guru mulai melambat!"
        );


    }, 5000);

}


/* ================= SECRET STAR ================= */

function secretStar() {

    if (
        gameArea.querySelector(
            ".secret-star"
        )
    ) {

        return;

    }


    const star =
        document.createElement("div");


    star.className =
        "secret-star";


    star.textContent = "⭐";


    star.style.left =
        randomPosition(
            100,
            gameArea.clientWidth - 120
        ) + "px";


    star.style.top =
        randomPosition(
            100,
            gameArea.clientHeight - 120
        ) + "px";


    gameArea.appendChild(
        star
    );


    showEvent(
        "⭐ SECRET STAR MUNCUL!"
    );


    setTimeout(function() {

        if (
            star.isConnected
        ) {

            star.remove();

        }

    }, 6000);

}


/* ================= ENERGY ================= */

function energyBoost() {

    timeLeft += 7;

    score += 25;


    showEvent(
        "🧃 ENERGY! +7 DETIK"
    );


    updateUI();

}


/* ================= PORTAL ================= */

function spawnPortal() {

    if (
        gameArea.querySelector(
            ".portal"
        )
    ) {

        return;

    }


    const portal =
        document.createElement("div");


    portal.className =
        "portal";


    portal.textContent = "🌀";


    portal.style.left =
        randomPosition(
            100,
            gameArea.clientWidth - 120
        ) + "px";


    portal.style.top =
        randomPosition(
            100,
            gameArea.clientHeight - 120
        ) + "px";


    gameArea.appendChild(
        portal
    );


    showEvent(
        "🌀 PORTAL MUNCUL!"
    );


    setTimeout(function() {

        if (
            portal.isConnected
        ) {

            portal.remove();

        }

    }, 7000);

}


/* ================= GLITCH ================= */

function activateGlitch() {

    reverseControl = true;


    showEvent(
        "⚠️ GLITCH! KONTROL TERBALIK!"
    );


    setTimeout(function() {

        reverseControl = false;


        showEvent(
            "✅ KONTROL NORMAL!"
        );

    }, 4000);

}


/* ================= MESSAGE ================= */

function showMessage(message) {

    const box =
        document.getElementById(
            "messageBox"
        );


    box.textContent = message;


    box.classList.add(
        "show"
    );


    setTimeout(function() {

        box.classList.remove(
            "show"
        );

    }, 1800);

}


/* ================= EVENT MESSAGE ================= */

function showEvent(message) {

    const box =
        document.getElementById(
            "eventMessage"
        );


    box.textContent = message;


    box.classList.add(
        "show"
    );


    setTimeout(function() {

        box.classList.remove(
            "show"
        );

    }, 2000);

}


/* ================= UPDATE UI ================= */

function updateUI() {

    scoreText.textContent =
        score;


    coinText.textContent =
        coins;


    livesText.textContent =
        lives;


    timerText.textContent =
        timeLeft;


    keyText.textContent =
        hasKey
            ? "Sudah punya 🔓"
            : "Belum punya 🔒";


    let maxTime;


    if (level === 1) {

        maxTime = 60;

    }

    else if (level === 2) {

        maxTime = 52;

    }

    else if (level === 3) {

        maxTime = 45;

    }

    else if (level === 4) {

        maxTime = 38;

    }

    else {

        maxTime = 30;

    }


    const percentage =
        (timeLeft / maxTime) * 100;


    progressBar.style.width =
        Math.max(
            0,
            percentage
        ) + "%";

}


/* ================= PAUSE ================= */

function togglePause() {

    if (!gameRunning) {

        return;

    }


    paused = !paused;


    if (paused) {

        showScreen(
            "pauseScreen"
        );

    }

    else {

        showScreen(
            "gameScreen"
        );

    }

}


/* ================= RESUME ================= */

function resumeGame() {

    paused = false;

    showScreen(
        "gameScreen"
    );

}


/* ================= RESTART ================= */

function restartGame() {

    clearIntervals();


    level = 1;

    score = 0;

    coins = 0;

    lives = 3;


    scoldingScene.classList.remove(
        "show"
    );


    startLevel();

}


/* ================= TUTORIAL ================= */

function openTutorial() {

    showScreen(
        "tutorialScreen"
    );

}


/* ================= MENU ================= */

function backToMenu() {

    gameRunning = false;


    clearIntervals();


    scoldingScene.classList.remove(
        "show"
    );


    showScreen(
        "menuScreen"
    );

}


/* ================= INTERVAL ================= */

function clearIntervals() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;

    }


    if (eventInterval) {

        clearInterval(
            eventInterval
        );

        eventInterval = null;

    }

}


/* ================= CLICK SOUND ================= */

let audioContext = null;
let musicGain = null;
let musicInterval = null;
let musicStep = 0;
let musicEnabled = true;
let musicVolume = .035;

function startBackgroundMusic() {
    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext || !musicEnabled) {
        return;
    }

    if (!audioContext) {
        audioContext = new AudioContext();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    if (!musicGain) {
        musicGain = audioContext.createGain();
        musicGain.gain.value = musicVolume;
        musicGain.connect(audioContext.destination);
    }

    if (musicInterval) {
        return;
    }

    const melody = [
        261.63, 329.63, 392, 329.63,
        293.66, 349.23, 440, 349.23,
        261.63, 329.63, 392, 493.88,
        440, 392, 329.63, 293.66
    ];

    const playNote = function() {
        if (!musicEnabled || !audioContext || audioContext.state !== "running") {
            return;
        }

        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const frequency = melody[musicStep % melody.length];

        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(.0001, now);
        gain.gain.exponentialRampToValueAtTime(.8, now + .04);
        gain.gain.exponentialRampToValueAtTime(.0001, now + .48);

        oscillator.connect(gain);
        gain.connect(musicGain);
        oscillator.start(now);
        oscillator.stop(now + .5);
        musicStep++;
    };

    playNote();
    musicInterval = setInterval(playNote, 560);
}

function stopBackgroundMusic() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
}

function toggleBackgroundMusic() {
    musicEnabled = !musicEnabled;
    const soundToggle = document.getElementById("soundToggle");

    if (musicEnabled) {
        startBackgroundMusic();
        soundToggle.textContent = "🔊 Musik";
        soundToggle.setAttribute("aria-label", "Matikan musik");
    } else {
        stopBackgroundMusic();
        soundToggle.textContent = "🔇 Musik";
        soundToggle.setAttribute("aria-label", "Nyalakan musik");
    }

    soundToggle.setAttribute("aria-pressed", String(musicEnabled));
}

function setMusicVolume(value) {
    musicVolume = Number(value) / 1000;
    const volumeValue = document.getElementById("volumeValue");

    if (musicGain && audioContext) {
        musicGain.gain.setTargetAtTime(
            musicVolume,
            audioContext.currentTime,
            .02
        );
    }

    volumeValue.textContent = value + "%";
}

function toggleSettings() {
    const settingsPanel = document.getElementById("settingsPanel");
    const settingsToggle = document.getElementById("settingsToggle");
    const isOpen = settingsPanel.hidden;

    settingsPanel.hidden = !isOpen;
    settingsToggle.setAttribute("aria-expanded", String(isOpen));
}

function playClickSound() {
    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) {
        return;
    }

    if (!audioContext) {
        audioContext = new AudioContext();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
        520,
        audioContext.currentTime
    );
    oscillator.frequency.exponentialRampToValueAtTime(
        760,
        audioContext.currentTime + .06
    );

    gain.gain.setValueAtTime(
        .0001,
        audioContext.currentTime
    );
    gain.gain.exponentialRampToValueAtTime(
        .08,
        audioContext.currentTime + .01
    );
    gain.gain.exponentialRampToValueAtTime(
        .0001,
        audioContext.currentTime + .1
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + .1);
}

document.addEventListener("click", function(e) {
    if (
        e.target instanceof Element &&
        e.target.closest("button")
    ) {
        playClickSound();
    }
});


/* ================= BUTTON ================= */

document.getElementById(
    "startButton"
).onclick = startGame;


document.getElementById(
    "tutorialButton"
).onclick = openTutorial;


document.getElementById(
    "nextLevelButton"
).onclick = nextLevel;


document.getElementById(
    "restartButton"
).onclick = restartGame;


document.getElementById(
    "resumeButton"
).onclick = resumeGame;

document.getElementById(
    "soundToggle"
).onclick = toggleBackgroundMusic;

document.getElementById(
    "settingsToggle"
).onclick = toggleSettings;

document.getElementById(
    "volumeSlider"
).oninput = function() {
    setMusicVolume(this.value);
};

document.querySelectorAll(".skin-option").forEach(option => {
    option.onclick = function() {
        selectSkin(option.dataset.skin);
    };
});


document
    .querySelectorAll(".menuButton")
    .forEach(button => {

        button.onclick =
            backToMenu;

    });


/* ================= INITIAL ================= */

showScreen(
    "menuScreen"
);

applyPlayerSkin();
updateSkinMenu();