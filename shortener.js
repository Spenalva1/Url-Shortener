const form = document.querySelector('#shortener');
const pError = document.querySelector('.error-message');
const fieldset = form.querySelector('fieldset');
const submitBtn = fieldset.querySelector('button');
const input = form.querySelector('input[name="url"]');
const linksContainer = document.querySelector('.shorted-links-container');
const toast = document.querySelector('.toast');

const BTN_DEFAULT_MESSAGE = 'Shorten It!';
const BTN_LOADING_MESSAGE = 'Loading';
let links = [];
let creatingLink = '';
let copied = -1;
const http_request = new XMLHttpRequest();

const getEndpoint = (url) => `https://api.shrtco.de/v2/shorten?url=${url}`;

const showToast = ({message = 'Success', duration = 3000} = {}) => {
    toast.textContent = message; 
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

const createShortedLink = (long, short, copied) => {
    return `<div class="link">
        <p class="long-link">${long}</p>
        <span class="divisor"></span>
        <p class="short-link">${short}</p>
        <div class="button-container">
        <button data-link="${short}" class="round-button ${copied ? 'copied' : ''}">${copied ? 'Copied!' : 'Copy'}</button>
        </div>
    </div>`;
}

const restoreFromLocalStorage = () => {
    const lsLinks = JSON.parse(localStorage.getItem('link'));
    if (lsLinks) {
        links.push(...lsLinks);
        linksContainer.dispatchEvent(new CustomEvent('linksUpdated'));
    }
}

const mirrorToLocalStorage = () => {
    const lsLinks = JSON.stringify(links);
    localStorage.setItem('link', lsLinks)
}

const displayLinks = () => {
    htmlLinks = links.map(link => createShortedLink(link.long, link.short, link.short === copied)).join('');
    linksContainer.innerHTML = htmlLinks;
}

const startLoading = () => {
    fieldset.disabled = true;
    submitBtn.textContent = BTN_LOADING_MESSAGE;
    submitBtn.classList.add('loading');
    if(pError.classList.contains('show')) {
        pError.classList.remove('show');
    }
    if(input.classList.contains('error')) {
        input.classList.remove('error');
    }
}

const stopLoading = () => {
    fieldset.disabled = false
    submitBtn.classList.remove('loading');
    submitBtn.textContent = BTN_DEFAULT_MESSAGE;
}

const displayError = (error) => {
    input.classList.add('error');
    pError.textContent = error;
    pError.classList.add('show');
    input.focus();
}

http_request.onreadystatechange = () => {
    if(http_request.readyState  === 1) {
        startLoading();
    }    
    if(http_request.readyState  === 4) {
        stopLoading();
        const { ok, result, error_code } = JSON.parse(http_request.response);
        if(!ok) {
            let errorMessage = error_code === 2 ? 'Please add a valid URL.' : 'Link could not be shortened. Please try again.';
            displayError(errorMessage);
            return;
        }
        const newLink = {
            short: result.short_link,
            long: creatingLink,
        }
        links.unshift(newLink);
        linksContainer.dispatchEvent(new CustomEvent('linksUpdated'));
        showToast({message: 'Link shortened succesfully!', duration: 3500});
        form.reset();
    }
};

const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

form.addEventListener('submit', (e) => {
    e.preventDefault();
    creatingLink = input.value;
    if(creatingLink === '') {
        displayError('Please add a link');
        return;
    }
    http_request.open('GET', getEndpoint(creatingLink), true);
    http_request.send();
});
linksContainer.addEventListener('linksUpdated', mirrorToLocalStorage);
linksContainer.addEventListener('linksUpdated', displayLinks);
linksContainer.addEventListener('click', (e) => {
    if(e.target.matches('button')) {   
        copyToClipboard(e.target.dataset.link);
        copied = e.target.dataset.link;
        displayLinks();
    }
})

restoreFromLocalStorage();