import { Space } from 'antd';
import SectorType from './SectorType';
import Aggregate from './Aggregate';

export default function CaseStatistics() {
    return (
        <>
        <Space orientation="vertical" size="medium" style={{ display: 'flex' }}>
        <h1>Case Breakdown by DPA, Sector, and Type.</h1>
        <SectorType />
        <Aggregate />
        </Space>
        </>
    );
}
