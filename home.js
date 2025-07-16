const slides = document.querySelectorAll(".gallery-slide");
let index = 0;

function showSlide() {
  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    if (i === index) {
      slide.classList.add("active");
    }
  });
  index = (index + 1) % slides.length;
}

setInterval(showSlide, 3000);
