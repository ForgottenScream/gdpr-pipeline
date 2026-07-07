import {_error, _out, _time, _log} from "@netuno/server-types"

// _core: lib/function/parseDate
// _core: lib/function/parseFine
// _core: lib/function/fetchSpan

function icoScrape(id, source) {
    const remote = _remote.init();
    const response = remote.get(source);

    if (response.ok()) {
        const html = _html.parse(response.content()).selectFirst("main");
        const controller = html.select('h1').first().text();

        _log.info(`Processing case: `, id);

        const { formattedDate, dateQuality } = parseDate(fetchSpan(html, 'Date'));
        const type = fetchSpan(html, 'Type') || 'Unknown Type';
        const sector = fetchSpan(html, 'Sector') || 'Unknown Sector';
        const dpaName = 'ICO';

        const wrongText = "When searching by date, incorrect results may be produced due to errors with the dates of some documents added before 31 December 2024.";
        const richTextElements = html.select(".rich-text");
        let allRichText = "";
        let summary = "Unknown Summary";

        for (let element of richTextElements) {
            const text = element.text().trim();
            if (text && !text.includes(wrongText)) {
                allRichText += text + " "; // Combine all text for fine parsing
                if (summary === "Unknown Summary") {
                    summary = text;
                }
            }
        }

        if (summary === "Unknown Summary" && richTextElements.first()) {
            summary = richTextElements.first().text().toString().replace(wrongText, "").trim();
        }

        const fine = parseFine(allRichText, dpaName);

        const legalBasis = "Unknown Legal Basis";

        const documentURL = html.selectFirst("further-reading")
            ? "https://ico.org.uk" + html.selectFirst("further-reading").attr("x-href")
            : "";

        const caseData = _val.map()
            .set('dpa_id', _db.store("dpa", _val.map()
                .set('name', dpaName)
                .set('source_type_id', _db.store("dpa_source_type", _val.map()
                    .set('type', "Primary")
                ))
            ))
            .set('case_uid', id)
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

        _db.store('case', caseData);

        _log.info(`Successfully scraped case `, id);
    } else {
        _log.error(`Failed to fetch page: ${response.statusCode} for URL: ${source}`);
    }
}
