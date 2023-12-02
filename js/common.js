const UUP_API_ENDPOINT = 'https://api.uupdump.net/';

const STATUS_DIV_NAME = '#status';
const STATUS_TITLE_NAME = '#status-title';
const STATUS_TEXT_NAME = '#status-text';

const TEXT_ERROR = 'Error';
const TEXT_PLEASE_WAIT = 'Please wait...';
const TEXT_RETRIEVING_DATA = 'The data you requested is being retrieved...';

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

async function getResponseFromApi(page, params) {
    let query = '';
    let data;

    if(Object.keys(params).length != 0)
        query = '?' + new URLSearchParams(params).toString();

    const url = `${UUP_API_ENDPOINT}${page}${query}`;

    try {
        const response = await fetch(url);
        data = await response.json();
    } catch(error) {
        return {'error': error.message};
    }

    if(!('response' in data)) 
        return {'error': 'Response from the server is invalid.'};

    return data['response'];
}

function showSection(selector) {
    $(selector).classList.remove('hidden');
}

function hideSection(selector) {
    $(selector).classList.add('hidden');
}

function setStatusError(text) {
    $(STATUS_TITLE_NAME).innerHTML = TEXT_ERROR;
    $(STATUS_TEXT_NAME).innerHTML = text;
    showSection(STATUS_DIV_NAME);
}

function setStatusLoading() {
    $(STATUS_TITLE_NAME).innerHTML = TEXT_PLEASE_WAIT;
    $(STATUS_TEXT_NAME).innerHTML = TEXT_RETRIEVING_DATA;
    showSection(STATUS_DIV_NAME);
}

function clearStatus() {
    hideSection(STATUS_DIV_NAME);
}
