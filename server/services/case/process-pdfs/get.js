import { _exec, _out, _log, _db, _val } from "@netuno/server-types";

// _core: lib/function/tesseract
// _core: lib/function/callLLM

function getMissingFields(caseRow) {
    const placeholders = [
        '0E-14',
        'Unknown Controller',
        'Unknown Type',
        'Unknown Sector',
        'Unknown Summary',
        'Unknown Legal Basis',
        '2000-01-01'
    ];

    const fieldsToCheck = [
        { name: 'controller', value: caseRow.getString("controller") },
        { name: 'fine', value: caseRow.getString("fine") },
        { name: 'legal_basis', value: caseRow.getString("legal_basis") },
        { name: 'summary', value: caseRow.getString("summary") },
        { name: 'sector', value: caseRow.getString("sector") },
        { name: 'type', value: caseRow.getString("type") },
        { name: 'date', value: caseRow.getString("date") }
    ];

    const missingFields = _val.list();
    for (const field of fieldsToCheck) {
        if (placeholders.includes(field.value)) {
            missingFields.add(field.name);
        }
    }

    return missingFields;
}

function fetchCases() {
    return _db.query(`
        SELECT
            c.id,
            c.case_uid,
            c.controller,
            c.document_url,
            c.fine,
            c.legal_basis,
            c.summary,
            c.date,
            s.name AS sector,
            t.name AS "type"
        FROM "case" c
        LEFT JOIN case_sector s ON c.sector_id = s.id
        LEFT JOIN case_type t ON c.type_id = t.id
        WHERE c.is_processed = false
        AND c.document_url IS NOT NULL
        AND c.document_url LIKE '%%.pdf%%'
    `);
}

function processCases(cases) {
    let successfulCases = 0, failedCases = 0, skippedCases = 0;

    if (!cases || cases.length === 0) {
        return _val.map().set("success", false).set("message", "No cases found.");
    }

    for (const caseRow of cases) {
        const documentURL = caseRow.getString("document_url");
        const caseId = caseRow.getInt("id");
        const missingFields = getMissingFields(caseRow);

        if (missingFields.isEmpty()) {
            _log.info(`Case ${caseId} already has valid data, skipping`);
            _db.update('case', caseId, _val.map().set("is_processed", true));
            skippedCases++;
            continue;
        }

        try {
            _log.info(`Processing case ${caseId}: ${documentURL} (missing fields: ${missingFields.join(", ")})`);

            const processPDFResult = tesseract(documentURL);

            if (processPDFResult && typeof processPDFResult === 'object' && processPDFResult.result === false) {
                _log.error(`Tesseract error for case ${caseId}: ${processPDFResult.error}`);
                failedCases++;
                continue;
            }
            if (!processPDFResult || !processPDFResult.pages || processPDFResult.pages.length === 0) {
                _log.error(`Failed to extract text for case ${caseId}`);
                failedCases++;
                continue;
            }

            const extractedText = processPDFResult.pages.join("\n").trim();
            if (!extractedText) {
                failedCases++;
                continue;
            }

            const llmResult = callLLM(extractedText, missingFields);
            _log.info(`llm result: ${llmResult.toJSON()}`);

            if (llmResult.getBoolean("success")) {
                const parsedData = llmResult.getValues("data");
                const updateData = _val.map();
                updateData.set("is_processed", true);
                if (missingFields.contains("controller")) updateData.set("controller", parsedData.getString("controller"));
                if (missingFields.contains("fine")) updateData.set("fine", parsedData.getDouble("fine"));
                if (missingFields.contains("legal_basis")) updateData.set("legal_basis", parsedData.getString("legal_basis"));
                if (missingFields.contains("summary")) updateData.set("summary", parsedData.getString("summary"));
                if (missingFields.contains("sector")) updateData.set("sector_id", _db.store("case_sector", _val.map().set("name", parsedData.getString("sector"))));
                if (missingFields.contains("type")) updateData.set("type_id", _db.store("case_type", _val.map().set("name", parsedData.getString("type"))));
                if (missingFields.contains("date")) {
                    updateData.set("date", parsedData.getString("date"));
                    if (parsedData.getString("date") === "2000-01-01"){
                        updateData.set('date_quality_id', _db.store("case_date_quality", _val.map().set('quality', 'Unknown Date')));
                    }
                    updateData.set('date_quality_id', _db.store("case_date_quality", _val.map().set('quality', 'Exact')));
                };

                _db.update("case", caseId, updateData);
                _log.info(`Successfully updated case ${caseId} with fields: ${Array.from(updateData.keys()).join(", ")}`);

                successfulCases++;
            } else {
                _log.error(`Failed to extract data for case ${caseId}: ${llmResult.getString("error")}`);
                failedCases++;
            }
        } catch (error) {
            _log.error(`Error processing case ${caseId}: ${error.message}`, error);
            failedCases++;
        }
    }

    return _val.map()
        .set("success", true)
        .set("message", `Processed ${cases.length} cases (${successfulCases} updated, ${skippedCases} skipped, ${failedCases} failed).`);
}

function main() {
    _out.json(processCases(fetchCases()));
}

main();
