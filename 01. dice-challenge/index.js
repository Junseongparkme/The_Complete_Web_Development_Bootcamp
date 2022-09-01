let randomNumber1 = Math.floor(Math.random() * 6) + 1;
let randomNumber2 = Math.floor(Math.random() * 6) + 1;

document
  .querySelector('.img1')
  .setAttribute('src', `images/dice${randomNumber1}.png`);

document
  .querySelector('.img2')
  .setAttribute('src', `images/dice${randomNumber2}.png`);

let h1 = document.querySelector('h1');

if (randomNumber1 > randomNumber2) {
  h1.innerText = '🏅Player 1 Win!';
} else if (randomNumber1 < randomNumber2) {
  h1.innerText = 'Player 2 Win!🏅';
} else {
  h1.innerText = '🏅Draw!🏅';
}

let rollBtn = document.querySelector('#roll-button');

rollBtn.addEventListener('click', function () {
  location.reload();
});
