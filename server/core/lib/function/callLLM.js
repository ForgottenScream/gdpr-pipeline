import { _out, _log, _val, _remote } from "@netuno/server-types";

const remote = _remote.init()
    .asJSON()
    .setURL("https://openrouter.ai/api/v1/chat/completions")
    .setHeader(_val.map()
        .set("Authorization", "Bearer " + _app.settings().getString("llm_api_key"))
        .set("Content-Type", "application/json")
    );

const placeholderMap = {
    "fine": 0,
    "controller": "Unknown Controller",
    "legal_basis": "Unknown Legal Basis",
    "summary": "Unknown Summary",
    "sector": "Unknown Sector",
    "type": "Unknown Type",
    "date": "2000-01-01"
};

const guidance = _val.map()
    .set("controller", "Look for organization names, phrases like 'la défenderesse', 'the controller', or 'against [NAME]'. If not found, return 'Unknown Controller'.")
    .set("fine", "Look for monetary values (e.g., '1000 euros', '€1,000', '£500'). RETURN ONLY A FLOAT (e.g., 1000.0, 500.0). STRIP ALL SYMBOLS/TEXTS. If in £, convert to € (1 £ = 1.15 €). Example: '€1,000' → 1000.0, '£500' → 575.0. If not found, return 0.")
    .set("legal_basis", "Look for references to GDPR articles (e.g., 'Article 31 du RGPD', 'GDPR Article 58(2)'). If not found, return 'Unknown Legal Basis'.")
    .set("summary", "Extract a concise summary of the enforcement action and breach from the text. If not found, return 'Unknown Summary'.")
    .set("sector", "Look for industry or sector descriptions (e.g., 'foundation', 'non-profit', 'healthcare'). If not found, return 'Unknown Sector'.")
    .set("type", "Look for enforcement action types (e.g., 'administrative fine', 'warning', 'corrective measure'). If not found, return 'Unknown Type'.")
    .set("date", "Look for dates in formats like DD/MM/YYYY, YYYY-MM-DD, or 'dd month yyyy'. If not found, return '2000-01-01'.");

function specificGuidance(missingFields) {
    const result = _val.list();
    for (const field of missingFields) {
        result.add(guidance.getString(field));
    }
    return result.join("\n");
}

function apiCall(extractedText, missingFields) {
    const fields = missingFields.join(",");

    const exampleParts = _val.list();
    for (let i = 0; i < missingFields.length; i++){
        const field = missingFields.get(i);
        const placeholder = placeholderMap[field];
        if (field === "fine") {
            exampleParts.add(`"${field}": 0`);
        } else {
            exampleParts.add(`"${field}": "${placeholder}"`);
        }
    }
    const exampleOutput = exampleParts.join(",\n");

    const systemPrompt = `
Extract GDPR enforcement data from the OCR text.
ONLY return a JSON object with EXACTLY these fields: ${fields}

Guidance for requested fields:
${specificGuidance(missingFields)}

Rules:
- ONLY include the fields explicitly requested above.
- If a requested field cannot be found, return its placeholder value.
- Do NOT include any other fields, even if found in the text.
- Ignore OCR errors and non-relevant text.

Example Output:
{${exampleOutput}}
`;
    remote.setData(_val.map()
        .set("model", "moonshotai/kimi-k2.6")
        .set("temperature", 0)
        .set("messages", _val.list()
            .add(_val.map()
                .set("role", "system")
                .set("content", systemPrompt)
            )
            .add(_val.map()
                .set("role", "user")
                .set("content", extractedText)
            )
        )
        .set("reasoning", _val.map()
            .set("enabled", false)
        )
        .set("stream", false)
        .set("response_format", _val.map()
            .set("type", "json_object")
        )
    );

    const response = remote.post();

    if (response.ok()) {
        const result = response.json();
        const content = result.getValues("choices", _val.list())
            .getValues(0, _val.map())
            .getValues("message", _val.map())
            .getString("content");
        return _val.fromJSON(content);
    } else {
        _log.error(`OpenRouter API error: ${response.statusCode()} - ${response.content()}`);
        return null;
    }
}

function callLLM(extractedText, missingFields) {
    if (extractedText && typeof extractedText === 'object' && extractedText.result === false) {
        return _val.map()
            .set("success", false)
            .set("error", extractedText.error || "Text extraction failed");
    }

    if (!extractedText) {
        return _val.map()
            .set("success", false)
            .set("error", "extractedText parameter is required");
    }

    if (!missingFields || missingFields.length === 0) {
        return _val.map()
            .set("success", false)
            .set("error", "missingFields parameter is required and must not be empty");
    }

    const extractedData = apiCall(extractedText, missingFields);
    if (extractedData) {
        return _val.map()
            .set("success", true)
            .set("data", extractedData);
    } else {
        return _val.map()
            .set("success", false)
            .set("error", "Failed to process text with LLM");
    }
}
