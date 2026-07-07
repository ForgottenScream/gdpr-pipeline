import { _error, _out, _log, _exec } from "@netuno/server-types";

// _core: lib/DPA/cmsCase

const cmsDomain = "https://www.enforcementtracker.com";

function fetchTotalCases() {
    const remote = _remote.init();
    const response = remote.get(cmsDomain);

    if (response.ok()) {
        const html = _html.parse(response.content());
        const totalCasesElement = html.selectFirst('div.et-card.p-3 div.font-bold.tabular-nums');
        if (totalCasesElement) {
            const totalCasesText = totalCasesElement.text().trim().replace(/,/g, '');
            return parseInt(totalCasesText, 10);
        }
        _log.error("Could not extract total cases from the homepage.");
        return null;
    } else {
        _log.error(`Failed to fetch total cases. Status code: ${response.statusCode()}`);
        return null;
    }
}

async function main() {
    const totalCases = fetchTotalCases();
    if (!totalCases) {
        _out.json({
            success: false,
            message: "Failed to determine the total number of cases."
        });
        return;
    }

    _log.info(`Total cases: ${totalCases}. Starting to scrape all cases from 1 to ${totalCases}.`);

    let processedCases = 0;
    let successfulCases = 0;
    let failedCases = 0;

    for (let id = 1; id <= totalCases; id++) {
        processedCases++;
        const caseId = `ETid-${id}`;
        const caseUrl = `${cmsDomain}/${caseId}`;

        try {
            cmsScrape(id, caseUrl);
            successfulCases++;

            if (processedCases % 10 === 0 && processedCases !== totalCases) {
                _log.info(`Pausing for 5 seconds after ${processedCases} cases...`);
                _exec.sleep(5000);
            }

            _log.info(`Successfully scraped case ID: ${id}`);
        } catch (error) {
            _log.error(`Failed to scrape case ${id}. Error: ${error.message}`);
            failedCases++;
        }
    }

    _out.json({
        success: true,
        message: `Processed ${processedCases} cases (${successfulCases} successful, ${failedCases} failed).`,
    });
}

main();
