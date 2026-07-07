import { _log } from "@netuno/server-types";

function parseFine(input, dpaName) {
    const inputStr = input ? input.toString() : "";
    if (!inputStr.trim()) {
        _log.warn("No fine input provided.");
        return 0;
    }

    const fineRegex = /([€£]\s*[\d,]+(?:\.\d+)?\s*(?:m|k|million|thousand)?\s*[€£]?|[\d,]+(?:\.\d+)?\s*(?:m|k|million|thousand)?\s*[€£])/gi;
    const fineMatch = inputStr.match(fineRegex);

    if (!fineMatch || fineMatch.length === 0) {
        _log.warn(`No fine found in input: `, inputStr);
        return 0;
    }

    const fineStr = fineMatch[0].toString().toLowerCase();

    const numberRegex = /([\d,]+(?:\.\d+)?)/;
    const numberMatch = fineStr.match(numberRegex);
    if (!numberMatch) {
        _log.warn(`Failed to extract number from: "${fineStr}"`);
        return 0;
    }

    let numericPart = numberMatch[0];
    let multiplier = 1;

    if (fineStr.includes('m') || fineStr.includes('million')) {
        multiplier = 1000000;
    } else if (fineStr.includes('k') || fineStr.includes('thousand')) {
        multiplier = 1000;
    }

    const cleaned = numericPart.replace(/,/g, '');
    let fine = parseFloat(cleaned);

    if (isNaN(fine)) {
        _log.warn(`Failed to parse fine from: `, fineStr);
        return 0;
    }

    fine = fine * multiplier;

    // Convert GBP to EUR for ICO
    fine = parseFloat(fine.toFixed(2));

    if (dpaName === "ICO" || dpaName === "Information Commissioner (ICO)") {
        fine = fine * 1.15;
        fine = parseFloat(fine.toFixed(2)); // Round again after conversion
    }
    return fine;
}
