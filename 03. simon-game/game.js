let buttonColors = ['red', 'blue', 'green', 'yellow'];
let gamePattern = []; // 정답지 배열
let userClickedPattern = [];
let h1 = document.querySelector('#level-title');
let btns = document.getElementsByClassName('btn');

let level = 0;
let started = true;

// 각 버튼에 클릭 이벤트를 추가
for (let i = 0; i < btns.length; i++) {
  btns[i].addEventListener('click', function () {
    let userChosenColor = btns[i].id;
    userClickedPattern.push(userChosenColor);
    // 버튼을 클릭하면 userClickedPattern 배열에 색을 추가한다.

    playSound(userChosenColor);
    animatePress(userChosenColor);
    checkAnswer(userClickedPattern.length - 1);
  });
}

// 웹 페이지 자체에 추가되는 이벤트, 키를 누르면 게임 시작
// 게임이 시작되면 nextSequence 함수가 호출됨.
document.addEventListener('keypress', () => {
  if (started) {
    h1.innerText = `Level ${level}`;
    nextSequence();
    started = false;
  }
});

function nextSequence() {
  userClickedPattern = [];

  // 랜덤 색상을 추출하여 gamePattern 배열에 추가함
  let randomNumber = Math.round(Math.random() * 3);
  let randomChosenColor = buttonColors[randomNumber];
  gamePattern.push(randomChosenColor);

  // 그리고 그 버튼을 깜빡여준다.
  document.getElementById(randomChosenColor).style.opacity = 0;
  setTimeout(
    () => (document.getElementById(randomChosenColor).style.opacity = 1),
    100
  );
  // 소리도 내주고
  playSound(randomChosenColor);

  // 레벨도 올려준다
  ++level;
  h1.innerText = `Level ${level}`;
}

function playSound(name) {
  let audio = new Audio(`./sounds/${name}.mp3`);
  audio.play();
}

function animatePress(currentColor) {
  let box = document.getElementById(currentColor);
  box.classList.add('pressed');
  setTimeout(() => box.classList.remove('pressed'), 100);
}

//
function checkAnswer(currentLevel) {
  // x번째 정답이랑 x번째 내가 클릭한 색이랑 일치한다면
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    // 그게 마지막 값이면
    if (gamePattern.length === userClickedPattern.length) {
      setTimeout(nextSequence, 1000);
    }
  } else {
    // 정답이 아닌 버튼을 클릭하면
    playSound('wrong');
    document.body.classList.add('game-over');
    setTimeout(() => document.body.classList.remove('game-over'), 200);
    h1.innerText = 'Game Over, Press Any Key to Restart';

    // 다시 처음으로
    startOver();
  }
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = true;
}
