const UUP_PACKAGE_LINK = 'https://uupdump.net/get.php';

const BUILD_NAME = '#build-name';
const BUILD_UUID = '#build-uuid';

const LANGUAGE_SELECTION = '#language-selection';
const LANGUAGE_SELECTION_SELECT = '#language-selection-select';

const EDITION_SELECTION = '#edition-selection';
const EDITION_SELECTION_LIST = '#edition-selection-list';

const DOWNLOAD_INFO = '#download-info';
const DOWNLOAD_LINK = '#download-link';

const TEXT_NO_LANGUAGES = 'This build can\'t be downloaded.';
const TEXT_UNSPECIFIED_BUILD = 'Build not specified.';
const TEXT_SELECT_EDITION = 'Please select at least one edition.'

function addListenersToEditionOptions() {
    $$('.edition-option').forEach((x) => {
        x.addEventListener('click', () => {
            evaluateEditions();
        });
    });
}

function updateLanguageList(langList) {
    const langs = Object.values(langList);
    langs.sort();

    const options = langs.map((x) => {
        return `
            <option value="${x}">
                ${x}
            </option>
        `;
    }).join('');

    $(LANGUAGE_SELECTION_SELECT).innerHTML = `
        <option value="">--- Please select ---</option>
        ${options}
    `;

    showSection(LANGUAGE_SELECTION);
}

function updateEditionList(editionList) {
    const editions = Object.values(editionList);
    editions.sort();

    const options = editions.map((x) => {
        return `
            <label>
                <input class="edition-option" type="checkbox" value="${x}">
                <code>${x}</code>
            </label>
        `;
    }).join('');

    $(EDITION_SELECTION_LIST).innerHTML = options;
    addListenersToEditionOptions();
    showSection(EDITION_SELECTION);
}

function updateBuildName(updateInfo) {
    const title = updateInfo['title'];
    const arch = updateInfo['arch'];

    $(BUILD_NAME).innerHTML = `${title} ${arch}`;
}

function buildDownloadLink(editions) {
    const editionsStr = editions.join(';').toLowerCase();
    const query = '?' + new URLSearchParams({
        'id': $(BUILD_UUID).value,
        'pack': $(LANGUAGE_SELECTION_SELECT).value,
        'edition': editionsStr,
        'autodl': 2
    }).toString();

    return `${UUP_PACKAGE_LINK}${query}`;
}

function evaluateEditions() {
    const selectedEditions = [];

    for(const x of $$('.edition-option').values()) {
        if(x.checked)
            selectedEditions.push(x.value);
    }

    if(selectedEditions.length < 1) {
        hideSection(DOWNLOAD_INFO)
        return;
    }

    $(DOWNLOAD_LINK).href = buildDownloadLink(selectedEditions);
    showSection(DOWNLOAD_INFO);
}

async function preparePage(uuid) {
    setStatusLoading();
    const response = await getResponseFromApi('listlangs.php', {'id': uuid});

    if('error' in response) {
        setStatusError(response['error']);
        return;
    }

    if(response['langList'].length < 1) {
        setStatusError(TEXT_NO_LANGUAGES);
        return;
    }

    updateBuildName(response['updateInfo']);
    updateLanguageList(response['langList']);
    clearStatus();
}

async function languageSelected(uuid, lang) {
    hideSection(EDITION_SELECTION);
    hideSection(DOWNLOAD_INFO);

    if(lang === "")
        return;

    setStatusLoading();
    const response = await getResponseFromApi('listeditions.php', {'id': uuid, 'lang': lang});

    if('error' in response) {
        setStatusError(response['error']);
        return;
    }

    updateEditionList(response['editionList']);
    clearStatus();
}

$(LANGUAGE_SELECTION_SELECT).addEventListener('change', async () => {
    const selection = $(LANGUAGE_SELECTION_SELECT).value;
    const uuid = $(BUILD_UUID).value;

    await languageSelected(uuid, selection);
});

document.addEventListener('DOMContentLoaded', async () => {
    if(!window.location.hash) {
        setStatusError(TEXT_UNSPECIFIED_BUILD);
        return;
    }

    const uuid = window.location.hash.substring(1);
    $(BUILD_UUID).value = uuid;
    preparePage(uuid);
});
