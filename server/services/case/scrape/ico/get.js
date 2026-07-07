import { _error, _out, _log, _exec } from "@netuno/server-types";

// _core: lib/DPA/icoCase

const icoDomain = "https://ico.org.uk";
const api = "https://ico.org.uk/api/search";

function fetchCases(pageNumber = 1, allCases = []){

    const remote = _remote.init().asJSON();

    const response = remote.post(
        api,
        _val.map()
        .set("filters", _val.list())
        .set("pageNumber", pageNumber)
        .set("order", "newest")
        .set("rootPageId", 17222),
    );

    if (response.ok()) {
        const responseData = JSON.parse(response.content());
        const cases = responseData.results;
        const pagination = responseData.pagination;

        const caseData = cases.map(caseItem => {
            return {
                url: icoDomain + caseItem.url,
                id: caseItem.id
            };
        });

        allCases.push(...caseData);


        if (pagination.hasMore) {
            _log.info(`Fetching next page: ${pageNumber + 1}`);
            return fetchCases(pageNumber + 1, allCases);
        } else {
            _log.info(`No more pages to fetch. Number of cases to scrape: ${allCases.length}`);
            return allCases;
        }
    } else {
        _log.error(`Failed to fetch API. Status code: ${response.statusCode()}, Content: ${response.content()}`);
        return allCases;
    }
}

async function main() {
    const allCases = fetchCases();
    let processedCases = 0;
    let successfulCases = 0;
    let failedCases = 0;

    if (allCases.length > 0) {
        for (const caseItem of allCases) {
            processedCases++;
            try {
                icoScrape(caseItem.id, caseItem.url);
                successfulCases++;

                if ((processedCases + 1) % 5 === 0 && processedCases !== allCases.length - 1) {
                    _exec.sleep(6000);
                }
                _log.info(`Successfully scraped case ID: ${caseItem.id}`);
            } catch (error) {
                _log.error(`Failed to scrape case ${caseItem.id}. Error: ${error.message}`);
                failedCases++;
            }
        };

        _out.json({
            success: true,
            message: `Processed ${allCases.length} cases, (${successfulCases} successful, ${failedCases} failed)`,
        });
    } else {
        _out.json({
            success: false,
            message: "No cases were fetched or processed."
        });
    }
}
main();
