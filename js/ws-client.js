/* 
    Profile 
    ------------
                */
/* Helpers */
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
let randomNames = ["John", "Ada", "Dan", "Boris", "Alice", "Bob", "Clara", "David", "Eve", "Frank", "Grace", "Hannah", "Ian", "Julia", "Kyle", "Liam", "Mia", "Nolan", "Olivia", "Peter"];
let randomDescriptions = ["I have", "I lost", "I like", "I play", "I enjoy", "I dislike", "I found", "I own", "I seek", "I admire", "I use", "I create", "I design", "I build", "I love", "I watch", "I dream of", "I prefer", "I wish for", "I need"];
let randomObjects = ["a cat", "a ball", "a apple", "a bottle", "a guitar", "a book", "a phone", "a star", "a tree", "a car", "a puzzle", "a song", "an idea", "a dream", "a mountain", "an ocean", "painting", "a recipe", "a joke", "the game"];


function createOrUpdateCursor(id, profile, ip, isLocal = false) {

    console.log("createOrUpdateCursor", id, profile, ip, isLocal);
    
    if (localCursorId === id && !isLocal) return;    

    if (!cursors[id]) {
        const cursor = document.createElement('div');
        cursor.className = 'cursor';
        document.body.appendChild(cursor);
        const randomColor = getRandomColor();
        cursor.style.setProperty('--cursor-before-color', randomColor);

        if (profile.image) {
            const img = document.createElement('img');
            img.src = profile.image;
            img.style.width = '40px';
            img.style.height = '40px';
            img.style.borderRadius = '50%';
            cursor.appendChild(img);
        }

        const text = document.createElement('div');
        text.innerHTML = `ID:${id}<br>IP:${ip || ''}<br><span class="cursor-name">${profile.name}</span><br><span class="cursor-desc">${profile.description}</span>`;
        cursor.appendChild(text);
        cursors[id] = cursor;
    } else {
        const cursor = cursors[id];
        const img = cursor.querySelector('img');
        const text = cursor.querySelector('div');

        if (profile.image) {
            if (!img) {
                const newImg = document.createElement('img');
                newImg.src = profile.image;
                newImg.style.width = '40px';
                newImg.style.height = '40px';
                newImg.style.borderRadius = '50%';
                cursor.insertBefore(newImg, cursor.firstChild);
            } else {
                img.src = profile.image;
            }
        } else if (img) {
            cursor.removeChild(img);
        }

        text.innerHTML = `ID:${id}<br>IP:${ip || ''}<br><span class="cursor-name">${profile.name}</span><br><span class="cursor-desc">${profile.description}</span>`;
    }
}


let userProfile, pfp

function setupProfileModal() {
    console.log("setupProfileModal");
    pfp = document.getElementById("profileModalToggleImage")
    userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (!userProfile) {
        const randomName = getRandomElement(randomNames);
        const randomDescription = getRandomElement(randomDescriptions);
        const randomObject = getRandomElement(randomObjects);
        userProfile = { 
            name: randomName + Math.floor(Math.random() * 1000),
            description: randomDescription + " " + randomObject,
            image: 'images/user-profile.svg'
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
    pfp.src = userProfile.image;
    var modal = document.getElementById("profileModal");
    var btn = document.getElementById("profileModalToggle");
    var span = document.getElementById("profile-close");
    window.profileModal = false;
    // Function to open the modal and prefill the form
    function openAndPrefillModal() {
        console.log("openAndPrefillModal");
        window.profileModal = true;
        modal.style.display = "block";
        document.getElementById('name').value = userProfile.name;
        document.getElementById('description').value = userProfile.description;
        // Display the profile image if it exists
        const profileImgPreview = document.getElementById('profileImgPreview');
        if (userProfile.image) {
            profileImgPreview.src = userProfile.image;
            pfp.src = userProfile.image;
            profileImgPreview.style.display = 'block';
        } else {
            profileImgPreview.style.display = 'none';
        }
    }
    btn.onclick = function() {
        openAndPrefillModal();
    }
    span.onclick = function() {
        modal.style.display = "none";
         window.profileModal = false;
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
             window.profileModal = false;
        }
    }



    // Event listener for name change
    document.getElementById('name').addEventListener('input', function() {
        userProfile.name = this.value;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        if (cursors[localCursorId]) {
            const nameElement = cursors[localCursorId].querySelector('.cursor-name');
            if (nameElement) {
                nameElement.textContent = userProfile.name;
            }
        }

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'profile', profile: userProfile }));
        }
    });

    // Event listener for description change
    document.getElementById('description').addEventListener('input', function() {
        userProfile.description = this.value;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        if (cursors[localCursorId]) {
            const descElement = cursors[localCursorId].querySelector('.cursor-desc');
            if (descElement) {
                descElement.textContent = userProfile.description;
            }
        }

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'profile', profile: userProfile }));
        }
    });


    // changes to pfp
    document.getElementById('profileImage').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.getElementById('imageCanvas');
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const resizedImage = canvas.toDataURL();
                    userProfile.image = resizedImage;
                    localStorage.setItem('userProfile', JSON.stringify(userProfile));
                    document.getElementById('profileImgPreview').src = resizedImage;
                    pfp.src = resizedImage

                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'profile', profile: userProfile }));
                    }

                    createOrUpdateCursor(localCursorId, userProfile, 'local', true);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    function updateLocalCursor(xPercent, yPercent) {
        if (cursors[localCursorId]) {
            const xPos = (xPercent / 100) * window.innerWidth;
            const yPos = (yPercent / 100) * document.documentElement.scrollHeight;
            cursors[localCursorId].style.left = xPos + 'px';
            cursors[localCursorId].style.top = yPos + 'px';
        }
    }



    // Function to extract coordinates from different event types
    function getCoordinates(event) {
        if (event.touches) {
            return { x: event.touches[0].clientX, y: event.touches[0].clientY + window.scrollY };
        } else {
            return { x: event.clientX, y: event.clientY + window.scrollY };
        }
    }

    // Function to handle movement
    function handleMovement(event) {
        const { x, y } = getCoordinates(event);
        const xPercent = (x / window.innerWidth) * 100;
        const yPercent = (y / document.documentElement.scrollHeight) * 100;
        updateLocalCursor(xPercent, yPercent);  // Update local cursor

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'move', x: xPercent, y: yPercent }));
        }
    }

    // Event types and the handler function
    const eventTypes = ['mousemove', 'touchmove'];
    eventTypes.forEach(type => {
        document.addEventListener(type, handleMovement, { passive: false });
    });



    // // Handle mouse movement
    // document.addEventListener('mousemove', function(event) {
    //     const xPercent = (event.clientX / window.innerWidth) * 100;
    //     const yPercent = ((event.clientY + window.scrollY) / document.documentElement.scrollHeight) * 100;
    //     updateLocalCursor(xPercent, yPercent);  // Update local cursor directly

    //     if (ws.readyState === WebSocket.OPEN) {
    //         ws.send(JSON.stringify({ type: 'move', x: xPercent, y: yPercent }));
    //     }
    // });


    window.addEventListener('scroll', function() {
        const scrollPercent = (window.scrollY / document.documentElement.scrollHeight) * 100;
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'scroll', y: scrollPercent }));
        }
    });    



}

function updateUserProfile(name, description, imageUpdated) {
    userProfile.name = name;
    userProfile.description = description;
    if (imageUpdated) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'profile', profile: userProfile }));
        }
        createOrUpdateCursor(localCursorId, userProfile, 'local', true);  // Update own virtual cursor
    } else {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'profile', profile: { name, description } }));
        }
        createOrUpdateCursor(localCursorId, { name, description }, 'local', true);  // Update own virtual cursor
    }
}







document.getElementById('profileForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    let profileImage = document.getElementById('profileImage').files[0];
    let imageUpdated = false;

    if (profileImage) {
        imageUpdated = true;
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.getElementById('imageCanvas');
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const resizedImage = canvas.toDataURL();
                userProfile.image = resizedImage;
                localStorage.setItem('userProfile', JSON.stringify(userProfile));

                updateUserProfile(name, description, imageUpdated);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(profileImage);
    } else {
        updateUserProfile(name, description, imageUpdated);
    }

    modal.style.display = "none";
});



function sendProfileUpdate() {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'profile', profile: userProfile }));
    }
}



let cursors = {};
let ws

let localCursorId;

const reconnectInterval = 5000;


const navElement = document.querySelector('nav');

function updateNavAndCursors(isConnected) {
    if (isConnected) {
        navElement.style.borderBottom = '1px solid green';
        navElement.classList.remove('blink-disconnect');
        // Set cursors to normal appearance
        Object.values(cursors).forEach(cursor => {
            cursor.style.opacity = '1';
            cursor.style.filter = 'none';
        });
    } else {
        navElement.style.borderBottom = '1px solid red';
        navElement.classList.add('blink-disconnect');
        // Set cursors to semi-transparent and greyed out
        Object.values(cursors).forEach(cursor => {
            cursor.style.opacity = '0.5';
            cursor.style.filter = 'grayscale(100%)';
        });
    }
}

function tryReconnect() {
    if (!ws || ws.readyState === WebSocket.CLOSED) {
        initWS();
    }
}


function initWS() {

    // const hostname = window.location.hostname;
    
    // const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // const wsUrl = `${wsProtocol}//${hostname}:4444`;

    // const wsUrl = 'wss://37.27.5.200:4444'
    // const wsUrl = 'wss://yolo.cx:4444'
    // const wsUrl = 'wss://wss.mielniczuk.com';
    const wsUrl = 'wss://analytics.mielniczuk.com:4444';


    ws = new WebSocket(wsUrl);

    ws.onopen = function() {
        console.log("Connected to the server.");
        updateNavAndCursors(true);
        clearExistingCursors(); // Clear existing cursors on successful connection
    };      

    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);

        if (data.type === 'existingClient') {
            // Handle existing clients when a new client connects
            createOrUpdateCursor(data.id, data.profile, data.ip);
            if (data.position) {
                const xPos = (data.position.x / 100) * window.innerWidth;
                const yPos = (data.position.y / 100) * document.documentElement.scrollHeight;
                cursors[data.id].style.left = xPos + 'px';
                cursors[data.id].style.top = yPos + 'px';
            }
        } else if (data.type === 'init') {
            // Handle initialization of the client
            localCursorId = data.id;
            createOrUpdateCursor(data.id, userProfile, data.ip, true);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'profile', profile: userProfile }));
            }
        } else if (data.type === 'move') {
            // Update cursor position for move messages
            if (cursors[data.id]) {
                const xPos = (data.x / 100) * window.innerWidth;
                const yPos = (data.y / 100) * document.documentElement.scrollHeight;
                cursors[data.id].style.left = xPos + 'px';
                cursors[data.id].style.top = yPos + 'px';
            }
        } else if (data.type === 'profileUpdate') {
            // Update profile for existing cursors
            createOrUpdateCursor(data.id, data.profile, data.ip);
        } else if (data.type === 'disconnect') {
            // Handle cursor removal on user disconnect
            if (cursors[data.id]) {
                document.body.removeChild(cursors[data.id]);
                delete cursors[data.id];
            }
        }
    };

    ws.onclose = function() {
        console.log("Disconnected from the server. Attempting to reconnect...");
        updateNavAndCursors(false);
        setTimeout(tryReconnect, reconnectInterval);
    };

    ws.onerror = function(err) {
        console.log("WebSocket Error: ", err);
        ws.close();
    };
}


function clearExistingCursors() {
    for (let id in cursors) {
        if (cursors[id] && cursors[id].parentNode) {
            cursors[id].parentNode.removeChild(cursors[id]);
        }
    }
    cursors = {}; // Reset the cursors object
}

document.addEventListener('DOMContentLoaded', function() {
    initWS();
    setupProfileModal()
})
