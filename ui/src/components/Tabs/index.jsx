import { Tabs } from 'antd';
import CaseStatus from '../Case-Status';
import DPAStatistics from '../DPA-Statistics';
import CaseStatistics from '../Case-Statistics';

const onChange = key => {
  console.log(key);
};
const items = [
  {
    key: '1',
    label: 'Case Status',
    children: <CaseStatus />,
  },
  {
    key: '2',
    label: 'DPA Statistics',
    children: <DPAStatistics />,
  },
  {
    key: '3',
    label: 'Case Statistics',
    children: <CaseStatistics />,
  },
];
const App = () => <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;
export default App;
