const API_URL = location.href.includes("localhost") ? "http://localhost:8081" :
    location.href.includes("192.168.200.12") ? "http://192.168.200.12:8081" : "https://cat-tech-edu-week04-guestbook.onrender.com"
const WSS_URL = "ws" + API_URL.slice(4) + "/ws";
console.log(WSS_URL)
const ws = new WebSocket(WSS_URL)

const commandsContainer = document.getElementById('comments');
/** @type {HTMLFormElement} */
const formElement = document.getElementById('comment-form');

/** @type {HTMLElement[]} */
const commentElements = [];

/**
 *
 * @returns {Promise<Response>} response with messages
 */
function fetchMessages() {
    return fetch(`${API_URL}/messages`)
}

const API = {
    /**
     * @return {Promise<Response>}
     * @param id the id of the comment to remove
     */
    deleteComment: (id) => {
        // Ideally, we'd have authentication in the client and only allow you to remove
        // comments that you created yourself, however, dealing with JWT token security
        // without a persistent FS is above me right now.
        return fetch(`${API_URL}/messages/delete/${id}`, {
            method: "DELETE",
        })
    },
    /**
     *
     * @param formData
     * @return {Promise<Response>}
     */
    sendMessage: (formData) => {
        return fetch(`${API_URL}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData)
        })
    }
}

/**
 * Generate the HTML element for a comment
 *
 * @param comment {{id:number, name: string, message:string}}
 * @return {HTMLDivElement}
 */
function generateCommentBody(comment) {
    const container = document.createElement('div');
    container.classList.add('comment-entry');

    const commentEntryHeader = document.createElement('div');
    commentEntryHeader.classList.add('comment-entry-header');

    const nameElement = document.createElement('span')
    nameElement.classList.add('comment-entry-name');
    nameElement.classList.add('comment-entry-holder');
    nameElement.textContent = comment.name;

    const deleteElement = document.createElement('a')
    deleteElement.classList.add('comment-entry-delete');
    deleteElement.textContent = "␥"
    deleteElement.href = "#"
    deleteElement.addEventListener('click', (e) => {
        e.preventDefault();
        API.deleteComment(comment.id).then((response) => {
            if (response.status === 200) {
                if (ws.readyState !== WebSocket.OPEN) {
                    response.json().then(comment => deleteComment(comment.id));
                    deleteComment(comment.id)
                }
            } else {
                response.json().then(responseBody => {
                    if (responseBody.message) {
                        alert(responseBody.message);
                    }
                }).catch(error => {})
            }
        })

    })

    commentEntryHeader.appendChild(nameElement);
    commentEntryHeader.appendChild(deleteElement);

    container.appendChild(commentEntryHeader);

    // const seperatorElement = document.createElement('hr')
    // container.appendChild(seperatorElement)

    const messageElement = document.createElement('p')
    messageElement.classList.add('comment-entry-message');
    messageElement.classList.add('comment-entry-holder')
    messageElement.textContent = comment.message;
    container.appendChild(messageElement);

    return container;
}

formElement.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(formElement));
    API.sendMessage(formData).then(async (res) => {
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
    }).catch((err) => {
        addError(formElement, "An error occurred sending your message")
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
        commandsContainer.innerHTML = ''
        // TODO: We can probably clean this up a bit
        if (response.status !== 200) {
            const error = document.createElement('div')
            error.textContent = "Failed to update comments";
            commandsContainer.appendChild(error)
            return;
        }

        response.json().then((resolved) => {
            resolved.forEach(comment => {
                addComment(comment)
            })
        })
    })
}


/** @param comment {{id: number, name: string, message:string}} */
function addComment(comment) {
    let generatedComment = generateCommentBody(comment);
    commentElements[comment.id] = generatedComment;
    commandsContainer.prepend(generatedComment)
}

function deleteComment(commentId) {
    let commentElement = commentElements[commentId];
    if (commentElement) {
        commentElement.remove();
    }
}

// After the initial hit, enable the WS. This does have a risk of losing some
// messages, but, the only real way to deal with this better would likely involve
// purely relying on the WS for fetching comments or having some form of "seen" message
// tracking to ensure that we avoid duplicates and dealing with then in a cordial manner, etc.
updateMessages().then(() => {
    ws.onmessage = (event) => {
        let eventJSON = JSON.parse(event.data);
        switch (eventJSON.action) {
            case "add":
                addComment(eventJSON); // addComment already deals with only the params we care about
                break;
            case "delete":
                deleteComment(eventJSON.id);

        }

    }
})
