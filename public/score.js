// score.js
const { useState, useEffect } = React;

const ScoreComponent = ({ score }) => {
    return (
        <div style={{ color: 'white', textAlign: 'center' }}>
            <h2>Score</h2>
            <p>{score}</p>
        </div>
    );
};

const LivesComponent = ({ lives }) => {
    const hearts = '❤️'.repeat(lives);
    return (
        <div style={{ color: 'white', textAlign: 'center' }}>
            <h2>Lives</h2>
            <p style={{ fontSize: '40px', letterSpacing: '10px', marginTop: '-15px' }}>{hearts}</p>
        </div>
    );
};

// Contenedor para manejar el marcador y las vidas
const ScoreLivesContainer = ({ initialScore, initialLives }) => {
    const [score, setScore] = useState(initialScore);
    const [lives, setLives] = useState(initialLives);

    useEffect(() => {
        window.updateScore = (newScore) => {
            setScore(newScore);
        };
        window.updateLives = (newLives) => {
            setLives(newLives);
        };
    }, []);

    return (
        <div style={{border: '2px solid white', width: '210px', position: 'absolute', marginLeft: '700px', top: '35%'}}>
            <ScoreComponent score={score} />
            <LivesComponent lives={lives} />
        </div>
    );
};

ReactDOM.render(<ScoreLivesContainer initialScore={0} initialLives={3} />, document.getElementById('score-component'));