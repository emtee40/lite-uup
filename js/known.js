const SEARCH_FORM = '#search-builds';
const SEARCH_INPUT = '#search-builds-query';
const SEARCH_DATE_SORT = '#search-builds-date-sort';

const SEARCH_RESULTS = '#search-results';
const SEARCH_RESULTS_TABLE = '#search-results-table-body';

function buildResultsTable(results) {
    const builds = Object.values(results['builds']);
    const table = builds.map((x) => {
        return `
            <tr>
                <td>
                    <a href="download.html#${x['uuid']}">
                        ${x['title']} ${x['arch']}
                    </a>
                </td>
                <td>
                    ${new Date(x['created'] * 1000).toLocaleDateString()}
                </td>
            </tr>
        `;
    }).join('');

    $(SEARCH_RESULTS_TABLE).innerHTML = table;
    showSection(SEARCH_RESULTS);
}

async function performSearch(search, sort) {
    const query = {
        'search': search,
        'sortByDate': sort
    }

    hideSection(SEARCH_RESULTS);
    setStatusLoading();
    const response = await getResponseFromApi('listid.php', query);

    if('error' in response) {
        setStatusError(response['error']);
        return;
    }

    clearStatus();
    buildResultsTable(response);
}

$(SEARCH_FORM).addEventListener('submit', async (event) => {
    event.preventDefault();
    const search = $(SEARCH_INPUT).value;
    const sort = $(SEARCH_DATE_SORT).checked ? 1 : 0;
    window.location.hash = search;

    await performSearch(search, sort);
});

document.addEventListener('DOMContentLoaded', async () => {
    if(!window.location.hash)
        return;

    const search = window.location.hash.substring(1);
    $(SEARCH_INPUT).value = search;

    await performSearch(search, 0);
});
