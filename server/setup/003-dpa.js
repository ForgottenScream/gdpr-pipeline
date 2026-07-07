import { _val, _db, _log } from "@netuno/server-types";

const dpas = [
    {
        uid: "bf147497-490c-4435-8e00-76c9d4e18507",
        name: "Data Protection Commision of Bulgaria (KZLD)",
        code_id: "2a933dba-1a0e-4008-8704-1cbb77ebf5fa",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "41d94a63-3d3b-40c2-a286-cb538e62ce59",
        name: "Data Protection Authority of Rheinland-Pfalz",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "c1190e39-e0a8-4fe4-b099-4bd75cb3e557",
        name: "Spanish Data Protection Authority (aepd)",
        code_id: "9ac80b72-76ef-4c05-a55d-69e0f67f3644",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "ef81d539-5ea5-49ac-849d-41dd1adc6275",
        name: "Commission for Personal Data Protection (KZLD)",
        code_id: "2a933dba-1a0e-4008-8704-1cbb77ebf5fa",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "1fd3cf03-1377-4c2f-8fb9-1526d5c0d089",
        name: "Data Protection Authority of Liechtenstein",
        code_id: "10e2164b-d5df-4327-9908-8a9af44b57a4",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "f1f2bc8a-6f3f-40be-a894-3291f65e1838",
        name: "Dutch Supervisory Authority for Data Protection (AP)",
        code_id: "7344b51e-fdbe-4ef4-9c10-2a25ff7f67f8",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "f24e32e9-4995-4ea1-b545-adb95096879d",
        name: "ICO",
        code_id: "08dc4254-72c4-4acd-a6bd-458b611da58d",
        source_type_id: "b89a492c-cb28-4afb-b4b6-76ffcb76c425"
    },
    {
        uid: "74464433-933e-48e5-8080-1d28a3d23278",
        name: "Information Commissioner (ICO)",
        code_id: "08dc4254-72c4-4acd-a6bd-458b611da58d",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "b65e1470-679e-42a4-bea3-46c048316e16",
        name: "Slovak Data Protection Office",
        code_id: "cc1f05a4-ec79-4494-a5bc-310cb9e75890",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "84c732b1-ee47-425a-bc79-c0f7747e54bc",
        name: "Lithuanian Data Protection Authority (VDAI)",
        code_id: "02db115c-3940-4dc1-9842-0fa3453a4975",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "518de8a7-ed56-4351-b985-2e2e1b4552fa",
        name: "Polish Data Protection Authority (UODO)",
        code_id: "a9f46fb4-8e49-4898-a506-8a17f4a6fb57",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "ead9796d-ba81-44af-ae11-f855970e391c",
        name: "Danish Data Protection Authority (Datatilsynet)",
        code_id: "c84a412b-a236-4db1-a7a7-82af9b4ea189",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "5ad066cc-b0a6-430d-9833-0c41b58dc52d",
        name: "Data Protection Authority of Rhineland-Palatinate",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "ecf8a605-cc88-4bd6-bcbe-af57a2fbf066",
        name: "Austrian Data Protection Authority (dsb)",
        code_id: "4abe2d9d-efbf-4d56-8cfc-0945dc3507ca",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "bd96135d-14bc-4e4e-ae74-867ed7ff556c",
        name: "Data Protection Authority of Nordrhein-Westfalen",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "6b82510e-0889-4e8d-b435-8307dc6ddbef",
        name: "Data Protection Authority of Saxony",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "0a197277-85ac-49ac-a291-0f8e7b562280",
        name: "Data Protection Authority of Sweden (Integritetsskyddsmyndigheten)",
        code_id: "69b698d7-e344-47a0-a953-ffd610a03468",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "ec1d8e48-691d-4ae4-a349-f2b255461e45",
        name: "Romanian National Supervisory Authority for Personal Data Processing (ANSPDCP)",
        code_id: "94df71fb-0929-48de-8792-00d3647f4891",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "00a06d85-5563-4cec-94d6-4e62c00558ef",
        name: "Belgian Data Protection Authority (APD)",
        code_id: "ce68eec6-807a-431d-a524-6c63e93f2514",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "98048f7d-ac0c-4b69-abcb-26ab8178fadd",
        name: "Data Protection Authority of Mecklenburg-Vorpommern",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "09e05c84-881f-4432-b21b-4b517e19524d",
        name: "Polish National Personal Data Protection Office (UODO)",
        code_id: "a9f46fb4-8e49-4898-a506-8a17f4a6fb57",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "919feca2-2d85-4222-bf74-f39a9515c996",
        name: "Italian Data Protection Authority (Garante)",
        code_id: "9cfeeb0c-7303-4d6c-bb9e-1a2877c5b091",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "cbd54623-8b3c-49a5-b57a-b385cd4cd22d",
        name: "Data Protection Authority of Hessen",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "7b2869bc-0910-4d52-9acb-e7456b48fc83",
        name: "Data Protection Authority of Sachsen-Anhalt",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "f5273bed-19be-4ce6-a529-c7326368df4a",
        name: "Data Protection Authority of Berlin",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "1c1ecee7-1399-4fb0-bdcb-54881043afcc",
        name: "Data Protection Authority of Brandenburg",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "cd80801d-a265-4426-bcc8-5b4cdd8b20d0",
        name: "Data Protection Authority of Sweden",
        code_id: "69b698d7-e344-47a0-a953-ffd610a03468",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "4a3da713-72ce-4c70-adf8-3d5a08e467d1",
        name: "Estonian Data Protection Authority (AKI)",
        code_id: "07d4d357-6cb8-43c8-8316-15b7a63620f2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "8ceb6ea1-0a58-4ce0-a44a-a0eb7024d928",
        name: "Data Protection Authority of Baden-Wuerttemberg",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "adc13b4f-6fc1-4d1b-852d-f134edff9833",
        name: "Icelandic data protection authority ('Persónuvernd')",
        code_id: "0d346897-da79-40ff-8ef1-108a5ef4ab3d",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "8c3a6486-7b5c-4520-864b-58cd4356e1ce",
        name: "French Data Protection Authority (CNIL)",
        code_id: "0c9a5b4f-1e8f-4f2e-b3a6-6c3a5f6b9759",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "77236ad0-dbb0-4d5d-a0ea-cc9baf61525f",
        name: "Data Protection Commissioner of Malta",
        code_id: "e1f9a02b-8937-4942-82ca-48e825eeafa8",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "a6ae4d40-355e-426d-863b-3ebe109792c9",
        name: "Data Protection Authority of Niedersachsen",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "34ca628e-f4f6-4249-968e-21b1cd056eee",
        name: "Norwegian Supervisory Authority (Datatilsynet)",
        code_id: "a6ba3a33-9dbc-4233-8c93-0465a0ce9dc6",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "1ed00f65-0cb2-420e-8071-82d9946443cd",
        name: "Hellenic Data Protection Authority (HDPA)",
        code_id: "e90f806c-fbab-4631-9dbc-0a54b5804602",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "b66b1ab5-95c6-42d5-a988-37cdd786bc7d",
        name: "Slovenian Supervisory Authority (Informacijski pooblaščenec)",
        code_id: "0f432b8b-277e-4c40-b0a2-b816f9bda2b0",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "5ed8745b-e487-43f6-a12f-bc3d4bd213ce",
        name: "Bulgarian Commission for Personal Data Protection (KZLD)",
        code_id: "2a933dba-1a0e-4008-8704-1cbb77ebf5fa",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "2cfe686a-6164-4670-bc40-977f19943dc7",
        name: "Data Protection Authority of Bremen",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "dcaddf54-c619-4c31-aa61-9b5a2330c347",
        name: "Portuguese Data Protection Authority (CNPD)",
        code_id: "20a8b63f-5e2b-4fbc-a296-df78b76d33fb",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "9662647b-ac40-487c-a852-d40628fbf2b1",
        name: "Data State Inspectorate (DSI)",
        code_id: "1f57c303-87f0-45bf-8bcb-d8b13538ec63",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "71a5da7c-770b-4eda-a968-ea3836106198",
        name: "Hungarian National Authority for Data Protection and the Freedom of Information (NAIH)",
        code_id: "ffd9aaa1-a4fa-44e4-a2d2-75f50a09e774",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "4cb0c804-a83f-42f0-9a83-4177dd239a8d",
        name: "Data Protection Authority of Hamburg",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "0237bcb3-40fa-4beb-83fa-573ec465b336",
        name: "Information Commissioner of Isle of Man",
        code_id: "3d3cbece-0eb2-4bb2-b276-5a7016f778b5",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "c57f7c51-14d2-44ba-b821-6016ba16fdc5",
        name: "Data Protection Authority of Saxony",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "18f05e0c-9355-4d00-8fd2-3cf1098b4385",
        name: "Data Protection Authority of Saarland",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "d02f93bb-39c7-4c26-ace9-13678fbbf547",
        name: "Data Protection Authority of Schleswig-Holstein",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "a6246626-3d23-4db2-b34b-27bc9c292672",
        name: "National Commission for Data Protection (CNPD)",
        code_id: "0af45bae-fc3a-4b82-aa62-6eaa2027d23a",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "8cb60976-7737-4a9a-ba55-07fea5c3a957",
        name: "Croatian Data Protection Authority (azop)",
        code_id: "0f962fb0-ea19-4a6c-971f-74fbea460f36",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "a9f14b03-51fd-4215-b337-1ecbdce26142",
        name: "Data Protection Authority of Thüringen",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "e0479d28-8ada-432a-bfe3-c46f3b1f619e",
        name: "The Federal Commissioner for Data Protection and Freedom of Information (BfDI)",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "38258012-7dcf-4d7d-92f1-ff99368e9a39",
        name: "Data Protection Authority of Bavaria",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "325234b6-d380-43b4-b549-1b4f3aaf3b01",
        name: "Data Protection Authority of Baden-Württemberg",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
   {
        uid: "4952e995-6953-40ac-8825-7471abb1a904",
        name: "Czech Data Protection Auhtority (UOOU)",
        code_id: "2661d22a-e132-47af-b66c-7001b26ce2bb",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "7a7ab0ca-e885-4f0a-a653-69e6ebb4bd6a",
        name: "Data Protection Authority of Hamburg (HmbBfDI)",
        code_id: "1d304270-5f1d-41c3-a466-c442a9a7b8a2",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "4247c43d-4006-47a1-9b3c-44c229ee6361",
        name: "Deputy Data Protection Ombudsman",
        code_id: "1f57c303-87f0-45bf-8bcb-d8b13538ec63",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "aef0f71f-de52-4a0c-be90-9d09f35987a7",
        name: "Data Protection Authority of Ireland",
        code_id: "b51aa5cb-3518-48f1-86c8-7d8edc246b57",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    },
    {
        uid: "1f081e5f-cb21-4eb7-96fc-1ddaa8911250",
        name: "Cypriot Data Protection Commissioner",
        code_id: "f0ef5680-53dc-486a-86e0-8fa012a43ab0",
        source_type_id: "fb249731-6733-4f39-9cf6-bd08e58e4fcc"
    }
];

dpas.forEach((dpa) => {
    try {
        _db.insertIfNotExists("dpa", _val.map()
            .set("uid", dpa.uid)
            .set("name", dpa.name)
            .set("code_id", dpa.code_id)
            .set("source_type_id", dpa.source_type_id)
        );
    } catch (e) {
        _log.warn("error: dpa not created", e);
    }
});
