import React, {useState} from "react";
import { Button, notification } from 'antd';
import _service from '@netuno/service-client'

function FetchButton() {
  const [loading, setLoading] = useState(false);
  const onClick = () => {
    _service({
      method: 'GET',
      url: 'case/scrape',
      start: () => {
        setLoading(true);
      },
      success: ({json}) => {
        notification.success({
          title: 'Success',
          description: 'Your data has been saved.'
        });
      },
      fail: (e) => {
        console.log("Service failed.", e);
      },
      end: () => {
        setLoading(false);
      },
    });
  };
  return(
    <Button
    type="primary"
    loading={loading}
    onClick={onClick}>
    Fetch Cases
    </Button>
  );
}

export default FetchButton
