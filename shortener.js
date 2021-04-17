const form = document.querySelector('#shortener');


form.addEventListener('submit', (e) => {
    e.preventDefault();
    const link = e.target[0].value;
    console.log(link);
})