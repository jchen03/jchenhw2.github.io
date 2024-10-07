document.addEventListener('DOMContentLoaded', function() { 
    const images = JSON.parse(localStorage.getItem('images')) || [];
    for(let i = 0; i < images.length; i++) {
        const credits = document.getElementById('credits');
        const credit = document.createElement('div');
        credit.classList.add('credit');
        credit.innerHTML = `
            <div class="credit-num">Image ${i + 1}</div>
            <div class="credit-title">Title : ${images[i].title}</div>
            <div class="credit-author">Author: ${images[i].author}</div>
            <div class="credit-url">URL: ${images[i].url}</div>
        `;
        credits.appendChild(credit);
    }
});