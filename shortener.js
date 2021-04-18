const form = document.querySelector('#shortener');
const linksContainer = document.querySelector('.shorted-links-container');
let links = [];
let creatingLink = '';
let copied = -1;
http_request = new XMLHttpRequest();

const getEndpoint = (url) => `https://api.shrtco.de/v2/shorten?url=${url}`;

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

http_request.onreadystatechange = () => {
    if(http_request.readyState  === 4) {
        const resp = JSON.parse(http_request.response);
        const newLink = {
            short: resp.result.short_link,
            long: creatingLink,
        }
        links.unshift(newLink);
        linksContainer.dispatchEvent(new CustomEvent('linksUpdated'));
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
    creatingLink = form.querySelector('input[name="url"]').value;
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