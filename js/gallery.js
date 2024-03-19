// Initialize the gallery and vocabulary list



async function init() {
    console.log("Initializing gallery...");

    const galleryPath = './images/gallery2/';
    const response = await fetch(galleryPath + 'data-gallery.json');
    const data = await response.json();
    console.log("Fetched data: ", data);

    const vocabulary = buildVocabulary(data);
    createVocabularyList(vocabulary, data, galleryPath);
    displayGallery(data, galleryPath);
}

// Build a vocabulary from the descriptions
function buildVocabulary(data) {
    const wordsSet = new Set();
    data.forEach(item => {
        const words = item.description.split(/\s+/);
        words.forEach(word => wordsSet.add(word.toLowerCase()));
    });
    return Array.from(wordsSet).sort();
}

// Display the vocabulary list
function createVocabularyList(vocabulary, data, galleryPath) {
    const vocabButton = document.createElement('button');
    vocabButton.innerHTML = `<svg viewBox="0 0 20 20" height="38" width="38" xmlns="http://www.w3.org/2000/svg"><path d="m7.5 13h5c.2761424 0 .5.2238576.5.5 0 .2454599-.1768752.4496084-.4101244.4919443l-.0898756.0080557h-5c-.27614237 0-.5-.2238576-.5-.5 0-.2454599.17687516-.4496084.41012437-.4919443l.08987563-.0080557h5zm-2-4h9c.2761424 0 .5.22385763.5.5 0 .24545989-.1768752.44960837-.4101244.49194433l-.0898756.00805567h-9c-.27614237 0-.5-.22385763-.5-.5 0-.24545989.17687516-.44960837.41012437-.49194433l.08987563-.00805567h9zm-2-4h13c.2761424 0 .5.22385763.5.5 0 .24545989-.1768752.44960837-.4101244.49194433l-.0898756.00805567h-13c-.27614237 0-.5-.22385763-.5-.5 0-.24545989.17687516-.44960837.41012437-.49194433l.08987563-.00805567h13z" fill="#212121"/></svg>`;
    vocabButton.id = 'keywords-button';
    vocabButton.onclick = () => toggleVocabularyVisibility();
    document.body.appendChild(vocabButton);

    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter keywords...';
    filterInput.id = 'vocabulary-filter';
    filterInput.className = 'vocabulary-filter-input'; // Added class
    filterInput.onkeyup = () => filterVocabularyList(vocabulary, data, galleryPath);
    filterInput.style.display = 'none'; // Initially hidden
    document.body.appendChild(filterInput);

    const vocabularyDiv = document.createElement('div');
    vocabularyDiv.id = 'vocabulary';
    vocabularyDiv.style.display = 'none';
    vocabulary.forEach(word => {
        const wordElement = document.createElement('button');
        wordElement.classList.add('v-bu');
        wordElement.textContent = word;
        wordElement.onclick = () => filterGallery(word, data, galleryPath);
        vocabularyDiv.appendChild(wordElement);
    });
    document.body.appendChild(vocabularyDiv);
}

// Toggle vocabulary list visibility
function toggleVocabularyVisibility() {
    const vocabDiv = document.getElementById('vocabulary');
    const filterInput = document.getElementById('vocabulary-filter');
    const isVisible = vocabDiv.style.display === 'block';
    vocabDiv.style.display = isVisible ? 'none' : 'block';
    filterInput.style.display = isVisible ? 'none' : 'block';

    window.umami.track("filter-"+isVisible)

}

function filterVocabularyList(vocabulary, data, galleryPath) {
    const inputText = document.getElementById('vocabulary-filter').value.toLowerCase();
    const vocabularyWords = document.getElementsByClassName('v-bu');
    let filteredVocabulary = [];

    for (const wordElement of vocabularyWords) {
        if (wordElement.textContent.toLowerCase().startsWith(inputText)) {
            wordElement.style.display = '';
            filteredVocabulary.push(wordElement.textContent);
        } else {
            wordElement.style.display = 'none';
        }
    }

    // Filter gallery items based on the filtered vocabulary
    const filteredData = data.filter(item => 
        filteredVocabulary.some(keyword => 
            item.description.toLowerCase().includes(keyword)
        )
    );

    // If no specific word is selected or the input text is empty, display all gallery items
    displayGallery(filteredData.length > 0 ? filteredData : data, galleryPath);


    window.umami.track("filter-search-"+inputText)

}



// Filter gallery based on selected keyword
function filterGallery(keyword, data, galleryPath) {
    const filteredData = data.filter(item => item.description.toLowerCase().includes(keyword));
    displayGallery(filteredData, galleryPath);
}


function speakTitle(title) {
    if (!window.speechSynthesis) {
        console.warn("Web Speech API not supported");
        return;
    }

    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(title);

    // Optionally set properties like voice, pitch, rate
    // utterance.voice = ...;
    // utterance.pitch = ...;
    // utterance.rate = ...;

    // Speak the title
    window.speechSynthesis.speak(utterance);
}



const borderRadiusStyles = [
    '50% 0', 
    '0 50%'
];

const defaultBorderRadius = '50%'; // Define the default border-radius

// Display the gallery based on filtered or full data
function displayGallery(data, galleryPath) {
    const wrap = document.getElementById('gallery-wrap') || createGalleryWrap();
    wrap.innerHTML = '';
    const gallery = document.createElement('div');
    gallery.id = 'gallery';

    data.forEach((item, index) => {
        const divWrap = document.createElement('div');
        divWrap.className = 'gallery-item-wrap';
        divWrap.innerHTML = getMediaHTML(item, galleryPath, false);
        divWrap.onclick = () => openPreview(data, index, galleryPath); // Pass current data set

        const galleryItem = divWrap.querySelector('.gallery-item');


        galleryItem.addEventListener('mouseenter', () => {
            const randomStyle = borderRadiusStyles[Math.floor(Math.random() * borderRadiusStyles.length)];
            galleryItem.style.borderRadius = randomStyle;
            // speakTitle(item.title);

        });

        galleryItem.addEventListener('mouseleave', () => {
            galleryItem.style.borderRadius = defaultBorderRadius;
        });

        gallery.appendChild(divWrap);
    });

    wrap.appendChild(gallery);
}






// Generate HTML for media item
function getMediaHTML(item, basePath, isPreview) {
    let thumbnailPath = item.thumbnail ? `${basePath}${item.thumbnail}` : '';
    if (isPreview) {
        return `<video controls autoplay><source src="${basePath}video-${item.src}/${item.src}.mp4" type="video/mp4">Your browser does not support the video tag.</video><div class="media-title-preview">${item.title}</div>`;
    } else {
        return `<div class="gallery-item" style="background-image: url('${thumbnailPath}')"></div><div class="media-title">${item.title}</div>`;
    }
}


// Open preview modal for a selected item
// Open preview modal for a selected item
function openPreview(data, index, galleryPath) {
    const item = data[index];
    const previewModal = document.getElementById('preview-modal') || createModal();
    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = getMediaHTML(item, galleryPath, true);
    addNavigation(previewContent, data, index, galleryPath);
    previewModal.style.display = 'flex';
    setTimeout(() => previewModal.style.opacity = 1, 10); // Transition to opacity 1
}


// Add navigation buttons to modal
function addNavigation(contentElement, data, currentIndex, galleryPath) {
    const prevIndex = currentIndex - 1 < 0 ? data.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex + 1 >= data.length ? 0 : currentIndex + 1;

    const prev = document.createElement('span');
    const next = document.createElement('span');
    prev.className = 'nav-arrow left-arrow';
    next.className = 'nav-arrow right-arrow';
    prev.innerHTML = `<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m4.29642509 11.9999996 8.49111931-8.72698338c.2888539-.2968776.2823494-.77170679-.0145282-1.06056067s-.7717068-.28234937-1.0605606.01452823l-9.00000005 9.25000002c-.28327407.2911428-.28327407.7548896 0 1.0460324l9.00000005 9.25c.2888538.2968776.763683.3033821 1.0605606.0145282.2968776-.2888538.3033821-.763683.0145282-1.0605606z" fill="white"/></svg>`;
    next.innerHTML = `<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" style="transform:scaleX(-1)"><path d="m4.29642509 11.9999996 8.49111931-8.72698338c.2888539-.2968776.2823494-.77170679-.0145282-1.06056067s-.7717068-.28234937-1.0605606.01452823l-9.00000005 9.25000002c-.28327407.2911428-.28327407.7548896 0 1.0460324l9.00000005 9.25c.2888538.2968776.763683.3033821 1.0605606.0145282.2968776-.2888538.3033821-.763683.0145282-1.0605606z" fill="white"/></svg>`;

    prev.onclick = (e) => {
        e.stopPropagation();
        openPreview(data, prevIndex, galleryPath);
    };
    next.onclick = (e) => {
        e.stopPropagation();
        openPreview(data, nextIndex, galleryPath);
    };

    contentElement.appendChild(prev);
    contentElement.appendChild(next);
}

// Function to stop all videos
function stopAllVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => video.pause());
}


// Create modal for preview
function createModal() {
    const modal = document.createElement('div');
    modal.id = 'preview-modal';
    modal.innerHTML = `<div id="preview-content"></div><span id="close-modal" class="close-modal pn-b"><svg id="close-modal-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M202.82861,197.17188a3.99991,3.99991,0,1,1-5.65722,5.65624L128,133.65723,58.82861,202.82812a3.99991,3.99991,0,0,1-5.65722-5.65624L122.343,128,53.17139,58.82812a3.99991,3.99991,0,0,1,5.65722-5.65624L128,122.34277l69.17139-69.17089a3.99991,3.99991,0,0,1,5.65722,5.65624L133.657,128Z" fill="white"/></svg></span>`;
    modal.style.opacity = 0; // Initially set opacity to 0
    modal.addEventListener('click', (e) => {
        if (e.target.closest('.close-modal') || e.target === modal) {
            closeModal(modal);
        }
    });

    document.body.appendChild(modal);
    return modal;
}

// Function to close the modal and stop all videos
function closeModal(modal) {
    modal.style.display = 'none';
    stopAllVideos();
}

// Add event listener for ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('preview-modal');
        if (modal && modal.style.display === 'flex') {
            closeModal(modal);
        }
    }
});



// Create gallery wrapper
function createGalleryWrap() {
    const wrap = document.createElement('div');
    wrap.id = 'gallery-wrap';
    document.body.appendChild(wrap);
    return wrap;
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});
