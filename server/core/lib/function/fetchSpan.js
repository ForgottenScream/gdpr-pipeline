import { _log } from "@netuno/server-types";

function fetchSpan(html, label) {
    const lis = html.select("li");
    for (let li of lis) {
        const span = li.selectFirst("span");
        if (span && span.text().trim() === label) {
            const strong = li.selectFirst("strong");
            return strong ? strong.text().trim() : "";
        }
    }
    return "";
}
