const API_URL = location.href.includes("localhost") ? "http://localhost:8081" : "https://cat-tech-edu-week04-guestbook.onrender.com"


const comments = document.getElementById('comments');


/**
 *
 * @returns {Promise<Response>} response with messages
 */
function fetchMessages() {
    return fetch(`${API_URL}/messages`)
}

function sendMessage(formData) {
    return fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
    })
}


/**
 * Generate the HTML element for a comment
 *
 * @param comment {{name: string, message:string}}
 * @return {HTMLDivElement}
 */
function generateCommentBody(comment) {
    const container = document.createElement('div');
    container.classList.add('comment-entry');

    const nameElement = document.createElement('span')
    nameElement.classList.add('comment-entry-name');
    nameElement.textContent = comment.name;
    container.appendChild(nameElement);

    const messageElement = document.createElement('p')
    messageElement.classList.add('comment-entry-message');
    messageElement.textContent = comment.message;
    container.appendChild(messageElement);

    return container;
}




function updateMessages() {
    fetchMessages().then((response) => {
        comments.innerHTML = ''
        // TODO: We can probably clean this up a bit
        if (response.status !== 200) {
            const error = document.createElement('div')
            error.textContent = "Failed to update comments";
            comments.appendChild(error)
            return;
        }

        response.json().then((resolved) => {
            resolved.forEach(comment => {
                comments.appendChild(generateCommentBody(comment))
            })
        })
    })
}

updateMessages()
