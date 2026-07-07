import { Space } from 'antd';
import FetchButton from './FetchButton';
import UseLLMButton from './UseLLMButton';
import DeleteButton from './DeleteButton';
import NumOfCases from './NumOfCases';
import NumOfProcessedCases from './NumOfProcessedCases';
import DPACaseHealth from './DPACaseHealth';
import ExportButton from './ExportButton';


export default function CaseStatus() {
    return (
        <Space orientation="vertical" size="medium" style={{ display: 'flex' }}>
        <h1>To begin, press the 'Fetch Cases' Button.</h1>
        <FetchButton />
        <UseLLMButton />
        <DeleteButton />
        <NumOfCases />
        <NumOfProcessedCases />
        <DPACaseHealth />
        <ExportButton />
        </Space>
    );
}
