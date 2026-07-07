import {_error, _out, _time, _log} from "@netuno/server-types"

// _core: lib/function/parseDate
// _core: lib/function/parseFine

function cmsScrape(caseId, source) {

    const remote = _remote.init();
    const response = remote.get(source);

    if (response.ok()) {
        _log.info(`Processing case: ${caseId}`);

        const html = _html.parse(response.content());

        const topCard = html.selectFirst('section.et-card.p-6.sm\\:p-8.mb-6');
        const caseDetailsSection = html.selectFirst('section[aria-label="Case details"]');

        if (!topCard) {
            _log.error(`Missing top card section for case ${caseId}. Cannot extract controller, date, or fine.`);
            return;
        }

        if (!caseDetailsSection) {
            _log.error(`Missing case details section for case ${caseId}. Cannot extract DPA, sector, or type.`);
            return;
        }

        // Extract controller from the top card
        let controller = topCard.selectFirst('h1.et-h1')?.text().trim() || "Unknown Controller";
        if (controller.toLowerCase().includes("unknown")) {
            controller = "Unknown Controller";
        }


        // Extract from Case Details
        const dpaName = fetchDetail(caseDetailsSection, "Authority");
        const dateStr = fetchDetail(caseDetailsSection, "Date") || "";
        const { formattedDate, dateQuality } = parseDate(dateStr);
        let sector = fetchDetail(caseDetailsSection, "Sector") || "Unknown Sector";
        if (sector === "Not assigned") {
            sector = "Unknown Sector";
        }
        let type = fetchDetail(caseDetailsSection, "Type of violation") || "Unknown Type";
        if (type === "Unknown") {
            type = "Unknown Type";
        }
        let legalBasis = fetchDetail(caseDetailsSection, "Quoted Articles") || "Unknown Legal Basis";
        if (legalBasis === "Unknown") {
            legalBasis = "Unknown Legal Basis";
        }
        const summaryElement = caseDetailsSection.selectFirst('p.text-base.leading-relaxed');
        let summary = summaryElement ? summaryElement.text().trim() : "Unknown Summary";
        if (summary === "Unknown") {
            summary = "Unknown Summary";
        }
        const sourceLink = caseDetailsSection.selectFirst('a.et-source-link');
        const documentURL = sourceLink ? sourceLink.attr("href") : "";

        // Extract fine from the top card
        const fineElement = topCard.selectFirst('.et-detail-fine');
        const fineText = fineElement ? fineElement.text().trim() : "0 €";
        const fine = parseFine(fineText, dpaName);

        // Upload to database
        const caseData = _val.map()
            .set('dpa_id', _db.store("dpa", _val.map()
                .set('name', dpaName)
                .set('source_type_id', _db.store("dpa_source_type", _val.map()
                    .set('type', "Secondary")
                ))
            ))
            .set('case_uid', caseId)
            .set('controller', controller)
            .set('source', source)
            .set('date', formattedDate)
            .set('date_quality_id', _db.store("case_date_quality", _val.map()
                .set('quality', dateQuality)
            ))
            .set('type_id', _db.store("case_type", _val.map()
                .set('name', type)
            ))
            .set('sector_id', _db.store("case_sector", _val.map()
                .set('name', sector)
            ))
            .set('fine', fine.toFixed(2))
            .set('legal_basis', legalBasis)
            .set('summary', summary)
            .set('document_url', documentURL)
            .set('is_processed', false);

        const storeCase = _db.store('case', caseData);
        _log.info(`Successfully scraped case ${caseId}.`);
    } else {
        _log.error(`Failed to fetch page: ${response.statusCode} for URL: ${source}`);
    }
}

// Updated Helper: Extract text from a <dt> and its following <dd>
function fetchDetail(html, label) {
    // Find the div that contains the dt with our label
    const divs = html.select('div');
    for (let i = 0; i < divs.size(); i++) {
        const div = divs.get(i);
        const dt = div.selectFirst('dt');
        if (dt && dt.text().trim() === label) {
            const dd = div.selectFirst('dd');
            return dd ? dd.text().trim() : null;
        }
    }
    return null;
}
