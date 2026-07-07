import { _val, _db, _log } from "@netuno/server-types";

const codes = [
    {
        uid: "4abe2d9d-efbf-4d56-8cfc-0945dc3507ca",
        code: "AT",
        name: "Austria"
    },
    {
        uid: "ce68eec6-807a-431d-a524-6c63e93f2514",
        code: "BE",
        name: "Belgium"
    },
    {
        uid: "2a933dba-1a0e-4008-8704-1cbb77ebf5fa",
        code: "BG",
        name: "Bulgaria"
    },
    {
        uid: "0f962fb0-ea19-4a6c-971f-74fbea460f36",
        code: "HR",
        name: "Croatia"
    },
    {
        uid: "f0ef5680-53dc-486a-86e0-8fa012a43ab0",
        code: "CY",
        name: "Cyprus"
    },
    {
        uid: "2661d22a-e132-47af-b66c-7001b26ce2bb",
        code: "CZ",
        name: "Czech Republic"
    },
    {
        uid: "c84a412b-a236-4db1-a7a7-82af9b4ea189",
        code: "DK",
        name: "Denmark"
    },
    {
        uid: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        code: "DE",
        name: "Germany"
    },
    {
        uid: "b51aa5cb-3518-48f1-86c8-7d8edc246b57",
        code: "IE",
        name: "Ireland"
    },
    {
        uid: "10e2164b-d5df-4327-9908-8a9af44b57a4",
        code: "LI",
        name: "Liechtenstein"
    },
    {
        uid: "69b698d7-e344-47a0-a953-ffd610a03468",
        code: "SE",
        name: "Sweden"
    },
    {
        uid: "e1f9a02b-8937-4942-82ca-48e825eeafa8",
        code: "MT",
        name: "Malta"
    },
    {
        uid: "1f57c303-87f0-45bf-8bcb-d8b13538ec63",
        code: "FI",
        name: "Finland"
    },
    {
        uid: "7344b51e-fdbe-4ef4-9c10-2a25ff7f67f8",
        code: "NL",
        name: "Netherlands"
    },
    {
        uid: "07d4d357-6cb8-43c8-8316-15b7a63620f2",
        code: "EE",
        name: "Estonia"
    },
    {
        uid: "0c9a5b4f-1e8f-4f2e-b3a6-6c3a5f6b9759",
        code: "FR",
        name: "France"
    },
    {
        uid: "e90f806c-fbab-4631-9dbc-0a54b5804602",
        code: "GR",
        name: "Greece"
    },
    {
        uid: "ffd9aaa1-a4fa-44e4-a2d2-75f50a09e774",
        code: "HU",
        name: "Hungary"
    },
    {
        uid: "08dc4254-72c4-4acd-a6bd-458b611da58d",
        code: "GB",
        name: "United Kingdom"
    },
    {
        uid: "0d346897-da79-40ff-8ef1-108a5ef4ab3d",
        code: "IS",
        name: "Iceland"
    },
    {
        uid: "3d3cbece-0eb2-4bb2-b276-5a7016f778b5",
        code: "IM",
        name: "Isle of Man"
    },
    {
        uid: "9cfeeb0c-7303-4d6c-bb9e-1a2877c5b091",
        code: "IT",
        name: "Italy"
    },
    {
        uid: "02db115c-3940-4dc1-9842-0fa3453a4975",
        code: "LT",
        name: "Lithuania"
    },
    {
        uid: "0af45bae-fc3a-4b82-aa62-6eaa2027d23a",
        code: "LU",
        name: "Luxembourg"
    },
    {
        uid: "a6ba3a33-9dbc-4233-8c93-0465a0ce9dc6",
        code: "NO",
        name: "Norway"
    },
    {
        uid: "a9f46fb4-8e49-4898-a506-8a17f4a6fb57",
        code: "PL",
        name: "Poland"
    },
    {
        uid: "20a8b63f-5e2b-4fbc-a296-df78b76d33fb",
        code: "PT",
        name: "Portugal"
    },
    {
        uid: "94df71fb-0929-48de-8792-00d3647f4891",
        code: "RO",
        name: "Romania"
    },
    {
        uid: "cc1f05a4-ec79-4494-a5bc-310cb9e75890",
        code: "SK",
        name: "Slovakia"
    },
    {
        uid: "0f432b8b-277e-4c40-b0a2-b816f9bda2b0",
        code: "SI",
        name: "Slovenia"
    },
    {
        uid: "9ac80b72-76ef-4c05-a55d-69e0f67f3644",
        code: "ES",
        name: "Spain"
    }
];

codes.forEach((country) => {
    try {
        _db.insertIfNotExists("dpa_country_code", _val.map()
            .set("uid", country.uid)
            .set("code", country.code)
            .set("name", country.name)
        );
    } catch (e) {
        _log.warn("error: country code not created", e);
    }
});
