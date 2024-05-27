//main.js
import { Paddle, Ball, BrickWall } from './classes.js';

const pantallaJuego = document.getElementById('juego');
const cinematicScreen = document.getElementById('cinematicScreen');
const loadingScreen = document.getElementById('loadingScreen');
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const gameOver = document.getElementById('gameOver');
const pantallaVictoria = document.getElementById('PantallaVictoria');
const pantallaRanking = document.getElementById('PantallaRanking');
const table = document.getElementById('table');

const musicaJuego =  document.getElementById('musicaJuego');
const musicaIntro = document.getElementById('musicaIntro');

const sonidoBoton = new Audio('./sonidos/boton.mp3');
const sonidoVictoria = new Audio('./sonidos/victoria.wav');
const sonidoGameOver = new Audio('./sonidos/GameOver.wav');
const sonidoLetra = new Audio('./sonidos/letra.mp3');
sonidoLetra.loop = true;

let paddle;
let ball;
let brickWall;
let lives;
let score;
let isGameOver = false;
let direction = '';

const text = "LA ERA Y EL MOMENTO DE ESTA HISTORIA SON DESCONOCIDOS. DESPUÉS DE QUE LA NAVE NODRIZA ARKANOID FUERA DESTRUIDA, UNA NAVE VAUS SE ESCAPÓ DE ELLA.";
const typingSpeed = 100;
const typingContainer = document.getElementById('typingContainer');

//TODOS LOS LISTENERS:

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

document.getElementById('startButton').addEventListener('click', function() {
    loadingScreen.style.display = 'none';
    gameOver.style.display = 'none';
    cinematicScreen.style.display = 'block';
    gameCanvas.style.display = 'none';
    pantallaVictoria.style.display = 'none';
    sonidoBoton.play();
    sonidoLetra.play();
    musicaIntro.play();  // Reproducir música después de la interacción del usuario
});

document.getElementById('startGameButton').addEventListener('click', () => startGame());

document.getElementById('submitScoreBtn').addEventListener('click', async () => {
    const initial1 = document.getElementById('initial1').value.toUpperCase();
    const initial2 = document.getElementById('initial2').value.toUpperCase();
    const initial3 = document.getElementById('initial3').value.toUpperCase();
    const initials = `${initial1}${initial2}${initial3}`;

    await submitScore(initials, score);
    sonidoBoton.play();
    // Simula el click en el botón "Salir" después de guardar la puntuación
    //document.getElementById('salir').click();
});

document.getElementById('salirRanking').addEventListener('click', () => {
    document.getElementById('initial1').value = '';
    document.getElementById('initial2').value = '';
    document.getElementById('initial3').value = '';

    pantallaRanking.style.display = 'none';
    sonidoBoton.play();    
    loadingScreen.style.display = 'block';
});



//FUNCIONES

function typeWriter(text, speed, container) {
    let i = 0;
    const typingInterval = setInterval(() => {
        if (i < text.length) {
            container.textContent += text.charAt(i); // Agregar el siguiente carácter
            i++;
        } else {
            clearInterval(typingInterval);
            sonidoLetra.pause();
        }
        container.scrollTop = container.scrollHeight; // Hacer scroll al final del contenedor
    }, speed);
}

window.onload = () => {
    typeWriter(text, typingSpeed, typingContainer);
};

function initializeGame() {
    paddle = new Paddle((canvas.width - 100) / 2, canvas.height - 20, 100, 20, './imagenes/sprite.png', 29, 174, 55, 10);    
    ball = new Ball(canvas.width / 2, canvas.height - 30, 10, 'white');
    brickWall = new BrickWall(5, 8, 60, 20, 12, 20, 80, ['#ff0000', '#e8ff00', '#0486ff', '#0df91b', '#da4fff']);    
    lives = 3;
    score = 0;
    isGameOver = false;
    musicaJuego.play();
    updateReactLives();
    updateReactScore();
}

function updateReactLives() {
    if (window.updateLives) {
        window.updateLives(lives);
    }
}

function updateReactScore() {
    if (window.updateScore) {
        window.updateScore(score);
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    paddle.draw(context);
    ball.draw(context);
    brickWall.draw(context);
}

function update() {
    if (pantallaJuego.style.display == 'none') {
        musicaIntro.play();
    } else {
        musicaIntro.pause();
    }
    if (isGameOver) {
        gameOver.style.display = 'block';
        canvas.style.display = 'none';
        pantallaJuego.style.display = 'none';
        loadingScreen.style.display = 'none';
        musicaJuego.pause();
        musicaIntro.play();
        sonidoGameOver.play();
        contador();
        return;
    }
   
    if (allBricksDestroyed()) { // Agregar una función para verificar si todos los ladrillos fueron destruidos
        canvas.style.display = 'none';
        pantallaJuego.style.display = 'none';
        loadingScreen.style.display = 'none';
        pantallaVictoria.style.display = 'block';
        sonidoVictoria.play();
        musicaJuego.pause();
        musicaIntro.play();
        showRegistroScreen();
        return; // Detener el bucle de juego
    }

    if (direction === 'left') {
        paddle.move('left', canvas.width);
    } else if (direction === 'right') {
        paddle.move('right', canvas.width);
    }

    ball.update(
        canvas.width,
        canvas.height,
        paddle,
        brickWall.bricks,
        () => {
            lives--;
            updateReactLives();
            if (lives === 0) {
                isGameOver = true;
            } else {
                ball.x = canvas.width / 2;
                ball.y = canvas.height - 30;
                ball.dx = 8;
                ball.dy = -8;
                paddle.x = (canvas.width - paddle.width) / 2;
            }
        },
        () => {
            score += 10;
            updateReactScore();
        }
    );
    draw();
    window.requestAnimationFrame(update);
}

function allBricksDestroyed() {
    // Verificar si todos los ladrillos fueron destruidos
    for (const row of brickWall.bricks) {
        for (const brick of row) {
            if (!brick.destroyed) {
                return false; // Al menos un ladrillo aún no ha sido destruido
            }
        }
    }
    return true; // Todos los ladrillos fueron destruidos
}

function showRegistroScreen() {
    //Vaciar letras de registros anteriores
    document.getElementById('initial1').value = '';
    document.getElementById('initial2').value = '';
    document.getElementById('initial3').value = '';

    // Mostrar la pantalla de registro y ocultar otras pantallas
    pantallaJuego.style.display = 'none';
    pantallaVictoria.style.display = 'block';
    document.getElementById('salir').onclick = () => {
        pantallaVictoria.style.display = 'none';
        sonidoBoton.play();
        gameOver.style.display = 'none';
        loadingScreen.style.display = 'block';
    };
}

async function submitScore(initials, score) {
    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initials, score }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Score saved:', data);
        fetchAndDisplayScores(); // Recuperar y mostrar el ranking después de guardar la puntuación
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

async function fetchAndDisplayScores() {
    try {
        const response = await fetch('/api/scores', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const scores = await response.json();
        displayScores(scores);
        pantallaVictoria.style.display = 'none'; // Ocultar la pantalla de registro
        pantallaRanking.style.display = 'block'; // Mostrar la pantalla de ranking
    } catch (error) {
        console.error('Error fetching scores:', error);
    }
}

function displayScores(scores) {
    table.innerHTML = ""; // Limpiar la tabla antes de mostrar nuevos datos
    const headerRow = document.createElement('div');
    headerRow.classList.add('row');
    headerRow.innerHTML = `<div class="cell">RANK</div><div class="cell">NAME</div><div class="cell">SCORE</div>`;
    table.appendChild(headerRow);

    scores.forEach((score, index) => {
        const row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = `<div class="cell">${index + 1}</div><div class="cell">${score.initials}</div><div class="cell">${score.score}</div>`;
        table.appendChild(row);
    });
}

function startGame() {
    cinematicScreen.style.display = 'none';
    gameOver.style.display = 'none';
    gameCanvas.style.display = 'block';
    pantallaJuego.style.display = 'block';
    pantallaVictoria.style.display = 'none';
    pantallaRanking.style.display = 'none';
    sonidoLetra.pause();

    initializeGame();
    update();
    sonidoBoton.play();
    musicaJuego.play();  // Reproducir música después de la interacción del usuario
};

function keyDownHandler(e) {
    if (e.key === 'ArrowLeft') {
        direction = 'left';
    } else if (e.key === 'ArrowRight') {
        direction = 'right';
    }
}

function keyUpHandler(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        direction = '';
    }
}

function contador() {
    let segundos = 15;
    
    const intervalo = setInterval(() => {
        segundos--;
        document.getElementById('countdown-number').innerText = segundos;
        
        document.getElementById('btnReinicio').onclick = () => {
            sonidoBoton.play();
            startGame();
            clearInterval(intervalo);
        }

        document.getElementById('btnMenu').onclick = () => {
            sonidoBoton.play();
            gameOver.style.display = 'none';
            loadingScreen.style.display = 'block';
            
            clearInterval(intervalo);
            
        };

        if (segundos === 0) {
            clearInterval(intervalo);
            gameOver.style.display = 'none';
            loadingScreen.style.display = 'block';
        }
    }, 1000);
}

//update();
