/*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) _id 
        - (String) title
        - (String) author
        - (Date) date

    comment objects must have the following attributes
        - (String) _id
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date

****************************** */

function handleResponse(res){
	if (res.status != 200) { return res.text().then(text => { throw new Error(`${text} (status: ${res.status})`)}); }
	return res.json();
}

// add an image to the gallery
export function addImage(title, author, picture, failure, success) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("picture", picture);
    fetch("/api/images/", {
		method: "POST",
		body: formData
    })
    .then(handleResponse)
    .then(success)
    .catch(failure);
}

export function getImages(failure, success){
    return fetch("/api/images/")
    .then(handleResponse)
    .then(success)
    .catch(failure);
}

// delete an image from the gallery given its imageId
export function deleteImage(imageId, failure, success) {
    fetch("/api/images/" + imageId + "/", {
        method: "DELETE"
    })
    .then(handleResponse)
    .then(success)
    .catch(failure);
}

// add a comment to an image
export function addComment(imageId, author, content, failure, success) {

    fetch(`/api/images/${imageId}/comments`, {
        method: "POST",
        body: JSON.stringify({ author: author, content: content }),
        headers: {"Content-Type": "application/json"}
    })
    .then(handleResponse)
    .then(success)
    .catch(failure);
}

// get comments to an image
export function getComments(imageId, failure, success) {
    fetch(`/api/images/${imageId}/comments`)
    .then(handleResponse)
    .then(success)
    .catch(failure);
}

// delete a comment to an image
export function deleteComment(imageId, commentId, failure, success) {
    fetch(`/api/images/${imageId}/comments/${commentId}`, {
        method: "DELETE"
    })
    .then(handleResponse)
    .then(success)
    .catch(failure);
}

