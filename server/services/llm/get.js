import { _exec, _out, _log, _db, _val, _remote } from "@netuno/server-types";

// _core: lib/function/callLLM

function fetchICOData() {
    return _db.query(`
        SELECT
            c.id,
            c.case_uid,
            c.controller,
            c.fine,
            c.date,
            cdq.quality AS "date quality",
            c.legal_basis AS "legal basis",
            cs.name AS sector,
            ct.name AS type,
            d.name,
            c.summary
        FROM "case" c
        INNER JOIN case_sector cs ON c.sector_id = cs.id
        INNER JOIN case_type ct ON c.type_id = ct.id
        INNER JOIN case_date_quality cdq ON c.date_quality_id = cdq.id
        INNER JOIN dpa d ON c.dpa_id = d.id
        WHERE d.name = 'ICO';
    `);
}

function fetchICOSourceComparisonData() {
    return _db.query(`
        (
            SELECT
                c.id,
                c.case_uid,
                c.controller,
                c.fine,
                c.date,
                cdq.quality AS "date quality",
                c.legal_basis AS "legal basis",
                cs.name AS sector,
                ct.name AS type,
                d.name,
                dst.id AS source_type_id,
                dst.type AS source_type,
                dcc.name AS country,
                c.summary
            FROM "case" c
            INNER JOIN case_sector cs ON c.sector_id = cs.id
            INNER JOIN case_type ct ON c.type_id = ct.id
            INNER JOIN case_date_quality cdq ON c.date_quality_id = cdq.id
            INNER JOIN dpa d ON c.dpa_id = d.id
            INNER JOIN dpa_source_type dst ON d.source_type_id = dst.id
            INNER JOIN dpa_country_code dcc ON d.code_id = dcc.id
            WHERE d.name = 'ICO'
              AND dst.type = 'Primary'
            LIMIT 100
        )
        UNION ALL
        (
            SELECT
                c.id,
                c.case_uid,
                c.controller,
                c.fine,
                c.date,
                cdq.quality AS "date quality",
                c.legal_basis AS "legal basis",
                cs.name AS sector,
                ct.name AS type,
                d.name,
                dst.id AS source_type_id,
                dst.type AS source_type,
                dcc.name AS country,
                c.summary
            FROM "case" c
            INNER JOIN case_sector cs ON c.sector_id = cs.id
            INNER JOIN case_type ct ON c.type_id = ct.id
            INNER JOIN case_date_quality cdq ON c.date_quality_id = cdq.id
            INNER JOIN dpa d ON c.dpa_id = d.id
            INNER JOIN dpa_source_type dst ON d.source_type_id = dst.id
            INNER JOIN dpa_country_code dcc ON d.code_id = dcc.id
            WHERE d.name = 'Information Commissioner (ICO)'
              AND dst.type = 'Secondary'
            LIMIT 100
        )
        ORDER BY id ASC;
    `);
}

function fetchTripleComparisonData() {
    return _db.query(`
    (
    SELECT
        c.id,
        c.case_uid,
        c.controller,
        c.fine,
        c.date,
        cdq.quality AS "date quality",
        c.legal_basis AS "legal basis",
        cs.name AS sector,
        ct.name AS type,
        d.name AS dpa,
        dcc.name AS country,
        c.summary
    FROM "case" c
    INNER JOIN case_sector cs ON c.sector_id = cs.id
    INNER JOIN case_type ct ON c.type_id = ct.id
    INNER JOIN case_date_quality cdq ON c.date_quality_id = cdq.id
    INNER JOIN dpa d ON c.dpa_id = d.id
    INNER JOIN dpa_country_code dcc ON d.code_id = dcc.id
    INNER JOIN dpa_source_type dst ON d.source_type_id = dst.id
    WHERE d.name = 'Data Protection Authority of Ireland'
    LIMIT 100
)
UNION ALL
(
    SELECT
        c.id,
        c.case_uid,
        c.controller,
        c.fine,
        c.date,
        cdq.quality AS "date quality",
        c.legal_basis AS "legal basis",
        cs.name AS sector,
        ct.name AS type,
        d.name AS dpa,
        dcc.name AS country,
        c.summary
    FROM "case" c
    INNER JOIN case_sector cs ON c.sector_id = cs.id
    INNER JOIN case_type ct ON c.type_id = ct.id
    INNER JOIN case_date_quality cdq ON c.date_quality_id = cdq.id
    INNER JOIN dpa d ON c.dpa_id = d.id
    INNER JOIN dpa_country_code dcc ON d.code_id = dcc.id
    INNER JOIN dpa_source_type dst ON d.source_type_id = dst.id
    WHERE d.name = 'French Data Protection Authority (CNIL)'
    LIMIT 100
)
UNION ALL
(
    SELECT
        c.id,
        c.case_uid,
        c.controller,
        c.fine,
        c.date,
        cdq.quality AS "date quality",
        c.legal_basis AS "legal basis",
        cs.name AS sector,
        ct.name AS type,
        d.name AS dpa,
        dcc.name AS country,
        c.summary
    FROM "case" c
    INNER JOIN case_sector cs ON c.sector_id = cs.id
    INNER JOIN case_type ct ON c.type_id = ct.id
    INNER JOIN case_date_quality cdq ON c.date_quality_id = cdq.id
    INNER JOIN dpa d ON c.dpa_id = d.id
    INNER JOIN dpa_country_code dcc ON d.code_id = dcc.id
    INNER JOIN dpa_source_type dst ON d.source_type_id = dst.id
    WHERE d.name = 'Spanish Data Protection Authority (aepd)'
    LIMIT 100
)
ORDER BY id ASC;
    `);
}

function callLLM(dataset, prompt) {
    const remote = _remote.init()
        .asJSON()
        .setURL("https://openrouter.ai/api/v1/chat/completions")
        .setHeader(_val.map()
            .set("Authorization", "Bearer " + _app.settings().getString("llm_api_key"))
            .set("Content-Type", "application/json")
        );

    const datasetJson = JSON.stringify(dataset, null, 2);

    remote.setData(_val.map()
        .set("model", "moonshotai/kimi-k2.6")
        .set("temperature", 0)
        .set("messages", _val.list()
            .add(_val.map()
                .set("role", "system")
                .set("content", "You are a GDPR compliance analyst. Analyze the provided dataset and answer the question thoroughly.")
            )
            .add(_val.map()
                .set("role", "user")
                .set("content", `Dataset:\n${datasetJson}\n\nQuestion: ${prompt}`)
            )
        )
        .set("stream", false)
    );

    const response = remote.post();

    if (response.ok()) {
        _log.info(`LLM call successful for prompt: ${prompt.substring(0, 50)}...`);
        const result = response.json();
        return result.getValues("choices", _val.list())
            .getValues(0, _val.map())
            .getValues("message", _val.map())
            .getString("content");
    } else {
        _log.error(`OpenRouter API error: ${response.statusCode()} - ${response.content()}`);
        return null;
    }
}

function processTasks() {
    const tasks = [
//        {
//            query: fetchICOData(),
//            prompt: `Analyze the attached dataset of ICO enforcement cases. How does the ICO's enforcement of UK GDPR Articles compare to PECR/DPA 2018 in terms of violation frequency and penalty severity?`
//        },
//        {
//            query: fetchICOSourceComparisonData(),
//            prompt: `Are the ICO cases that are fetched from CMS (secondary source) the same as the ICO cases from ICO themselves (primary source)?`
//        },
        {
            query: fetchTripleComparisonData(),
            prompt: `How do the enforcement strategies of Ireland's DPC, Spain's AEPD, and France's CNIL compare in terms of:
1) Frequency vs. Severity (Spain's high volume vs. Ireland's single largest fine vs. France's high cumulative fines but lower case volume).
2) Targeted Violations (Which GDPR Articles or national laws are prioritized by each DPA? Are there sector-specific focuses?).
3) Outcome Effectiveness (Does high-frequency, low-fine enforcement (Spain) or low-frequency, high-fine enforcement (Ireland) lead to better compliance outcomes? How does France's balanced approach compare in deterrence and public awareness?)`
        }
    ];

    const results = _val.list();
    let successfulTasks = 0, failedTasks = 0;

    for (const task of tasks) {
        try {
            _log.info(`Processing task: ${task.prompt.substring(0, 50)}...`);

            const dataset = [];
            for (const row of task.query) {
                const rowObj = {};
                for (const key of row.keys()) {
                    rowObj[key] = row.getString(key);
                }
                dataset.push(rowObj);
            }

            _log.info(`Task has ${dataset.length} rows of data`);

            if (dataset.length === 0) {
                _log.warn(`No data for task: ${task.prompt.substring(0, 50)}...`);
                results.add(_val.map()
                    .set("prompt", task.prompt)
                    .set("response", "No data available")
                    .set("row_count", 0)
                );
                failedTasks++;
                continue;
            }

            const llmResponse = callLLM(dataset, task.prompt);

            if (llmResponse) {
                results.add(_val.map()
                    .set("prompt", task.prompt)
                    .set("response", llmResponse)
                    .set("row_count", dataset.length)
                );
                successfulTasks++;
            } else {
                results.add(_val.map()
                    .set("prompt", task.prompt)
                    .set("response", "Failed to get LLM response")
                    .set("row_count", dataset.length)
                );
                failedTasks++;
            }
        } catch (error) {
            _log.error(`Error processing task: ${error.message}`, error);
            results.add(_val.map()
                .set("prompt", task.prompt)
                .set("response", `Error: ${error.message}`)
                .set("row_count", 0)
            );
            failedTasks++;
        }
    }

    _log.info(`Processed ${tasks.length} tasks (${successfulTasks} successful, ${failedTasks} failed)`);

    return results;
}

function main() {
    _out.json(processTasks());
}

main();
