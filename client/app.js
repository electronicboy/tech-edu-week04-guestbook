const API_URL = location.href.includes("localhost") ? "http://localhost:8081" : "https://cat-tech-edu-week04-guestbook.onrender.com"
const WSS_URL = "ws" + API_URL.slice(4) + "/ws";
console.log(WSS_URL)
const ws = new WebSocket(WSS_URL)

const comments = document.getElementById('comments');
/** @type {HTMLFormElement} */
const formElement = document.getElementById('comment-form');


/**
 *
 * @returns {Promise<Response>} response with messages
 */
function fetchMessages() {
    return fetch(`${API_URL}/messages`)
}

/**
 *
 * @param formData
 * @returns {Promise<Response>}
 */
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

formElement.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(formElement));
    sendMessage(formData).then(async (res) => {
        if (res.status === 200) {
            // If we have the WS, then we don't need to manually update
            if (ws.readyState !== WebSocket.OPEN) {
                updateMessages()
            }
            formElement.reset()
        } else {
            res.json().then((resBody) => {
                if (resBody.message) {
                    addError(formElement, resBody.message)
                }
            })
        }
    })
})

/**
 *
 * @param formElement {HTMLFormElement}
 * @param error {string}
 */
function addError(formElement, error) {
    /** @type {HTMLCollection} */
    let formChildren = formElement.children;
    for (let formChild of formChildren) {
        if (formChild.classList.contains('form-error')) {
            formChild.style.display = 'block';
            formChild.textContent = error
            return;
        }
    }
}


function updateMessages() {
    return fetchMessages().then((response) => {
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

// After the initial hit, enable the WS. This does have a risk of losing some
// messages, but, the only real way to deal with this better would likely involve
// purely relying on the WS for fetching comments or having some form of "seen" message
// tracking to ensure that we avoid duplicates and dealing with then in a cordial manner, etc.
updateMessages().then(() => {
    ws.onmessage = (event) => {
        comments.appendChild(generateCommentBody(JSON.parse(event.data)));
    }
})
