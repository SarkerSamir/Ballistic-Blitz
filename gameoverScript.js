
var winner_name,winner_score;

document.addEventListener("DOMContentLoaded", () => {
  const player1NameElement = document.getElementById("playerName"); 
  const player2NameElement = document.getElementById("playerScore");
  //const maxTurnsLabel = document.getElementById('maxTurns');

  winner_name = localStorage.getItem("winner_name");
  winner_score = localStorage.getItem("winner_score");
  //const turnlb = localStorage.getItem("Turns");

 



  player1NameElement.textContent = winner_name;
  player2NameElement.textContent = winner_score;

    
});
 



/* const playAgainButton = document.getElementById('play-again');

playAgainButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});
 */
