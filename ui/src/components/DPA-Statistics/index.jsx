import { Space } from 'antd';
import HeatMap from './HeatMap';
import HeatMapLeaflet from './HeatMapLeaflet';

export default function DPAStatistics() {
  return (
    <>
      <h2>European Data Protection Authority (DPA) Fines by Country</h2>
      <HeatMapLeaflet />
    </>
  );
}
