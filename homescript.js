const playButton = document.getElementById('start-button');
const inputOverlay = document.getElementById('inputOverlay');
const confirmPlayersButton = document.getElementById('confirmPlayersButton');
const player1Input = document.getElementById('player1');
const player2Input = document.getElementById('player2');
const turn = document.getElementById('turns');
const warningMessage = document.getElementById('warningMessage');

inputOverlay.style.display = 'none';

playButton.addEventListener('click', () => {
    inputOverlay.style.display = 'block';
});

player1Input.addEventListener('input', checkInputs);
player2Input.addEventListener('input', checkInputs);
turn.addEventListener('input', checkInputs);


function checkInputs() {
    const player1Name = player1Input.value.trim();
    const player2Name = player2Input.value.trim();
    const turnlft = turn.value.trim();

    confirmPlayersButton.disabled = !(player1Name && player2Name && turnlft);
}

confirmPlayersButton.addEventListener('click', () => {
    const player1Name = player1Input.value.trim();
    const player2Name = player2Input.value.trim();
    const turnlft = turn.value.trim();

    if (!player1Name || !player2Name || !turnlft) {
        warningMessage.style.display = 'block';
        confirmPlayersButton.removeAttribute('disabled');
    } else {
      localStorage.setItem("player1Name", player1Name);
      localStorage.setItem("player2Name", player2Name);
      localStorage.setItem("Turns", turnlft);
        warningMessage.style.display = 'none';
        window.location.href = 'index.html'; 
    }
});




const quitButton = document.getElementById('quit-button');
quitButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to quit?')) {
        window.close();
    }
});

  function playHoverSound() {
    var hoverSound = new Audio('music/button-124476.mp3');
    hoverSound.play();
  }

  function playClickSound() {
    var clickSound = new Audio('music/mouse-click-153941.mp3');
    clickSound.play();
  }