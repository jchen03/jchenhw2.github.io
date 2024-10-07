import { addImage, getImages, deleteImage, addComment, getComments, deleteComment } from './api.mjs'

let counter = 0;

function onError(err) {
    console.error("[error]", err);
}

function displayImages() {
    const images = JSON.parse(localStorage.getItem('images')) || [];
    const count = document.querySelector('.count');
    const author = document.querySelector('.author');
    const title = document.querySelector('.description');
    const mainImage = document.getElementById('main-image');
    if(images.length > 0){
        count.textContent = counter + 1 + '/' + images.length;
        author.textContent = "Author: " + images[counter].author;
        title.textContent = "Title: " + images[counter].title;
        mainImage.src =`/api/images/${counter}/picture`;
    }
    if(images.length == 0){
        author.textContent = "No images available";
        title.textContent = "Please add an image";
    }
}

function displayComments(imageId) {
    const comments = JSON.parse(localStorage.getItem('comments')) || [];
    const commentsImage =  comments.filter(comment => comment.imageId === imageId);
    const commentSection = document.querySelector('.comment-section');
    const recentComments = commentsImage.slice(-10);

    commentSection.innerHTML = '';

    for (const comment of recentComments) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `
            <div class="comment-top">
                <div class="comment-author">Author: ${comment.author}</div> 
                <div class="comment-date">Date Posted: ${new Date(comment.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                })}</div>
            </div>
            <div class="comment-middle">
                <div class="comment-content">${comment.content}</div>
                <div class="comment-delete">
                    <button type="button" class="button-cmt-delete" comment-id="${comment._id}">Delete</button>
                </div>
            </div>`;
        commentSection.appendChild(commentDiv); 
    }
    const deleteButtons = document.querySelectorAll('.button-cmt-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentId = this.getAttribute('comment-id');
            deleteComment(imageId, commentId, onError, function(){
                updateComments();
            });
            this.closest('.comment').remove();
        });
    });
}

function updateImages(){
    getImages(onError, function(images){
        localStorage.removeItem('images');
        localStorage.setItem('images', JSON.stringify(images));
    });
    displayImages();
    location.reload();
}

function updateComments(){
    getComments(counter, onError, function(comments){
        localStorage.removeItem('comments');
        localStorage.setItem('comments', JSON.stringify(comments));
    });
    displayComments(counter);
    location.reload();
}

displayImages();
displayComments(counter);

document.getElementById('add-btn').addEventListener('click', function() {
    const formElement = document.querySelector('.add-form');
    formElement.classList.toggle('hidden');
});


document.getElementById('add-image').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const picture = document.getElementById('picture').files[0];
    if(!picture){
        console.log("No image selected");
        return;
    }
    addImage(title, author, picture, onError, function(){
        updateImages();
    });
    this.reset();
});



document.getElementById('prev').addEventListener('click', function() {
    const images = JSON.parse(localStorage.getItem('images')) || [];
    if (counter > 0) {
        counter--;
    } else {
        counter = images.length - 1;
    }
    displayImages();
    displayComments(counter)
});

document.getElementById('next').addEventListener('click', function() {
    const images = JSON.parse(localStorage.getItem('images')) || [];
    if (counter < images.length - 1) {
        counter++;
    } else {
        counter = 0;
    }
    displayImages();
    displayComments(counter);
});


document.getElementById('delete-btn').addEventListener('click', function() {
    // const images = JSON.parse(localStorage.getItem('images')) || [];
    // const count = document.querySelector('.count');    
    // const currentImage = parseInt(count.textContent.split('/')[0]);
    // const currentImageId = images[currentImage - 1].imageId;
    deleteImage(counter, onError, function(){   
        updateImages();
    });
});

document.getElementById('comment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const author = document.getElementById('author-input').value;
    const content = document.getElementById('comment-input').value;
    addComment(counter, author, content, onError, function(){
        updateComments();
    });
    this.reset();
});



