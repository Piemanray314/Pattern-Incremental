let points = 0;

const pointsSpan = document.getElementById("points");
const clickButton = document.getElementById("click-button");

clickButton.addEventListener("click", () => {
  points += 1;
  pointsSpan.textContent = points;
});