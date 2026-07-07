import React, {useState} from "react";
import { Button, notification } from 'antd';
import _service from '@netuno/service-client'

export default function DeleteButton() {
  const [loading, setLoading] = useState(false);
  const onClick = () => {
    _service({
      url: 'case/delete',
      start: () => {
        setLoading(true);
      },
      success: ({json}) => {
        notification.success({
          title: 'Success',
          description: 'All Cases have been deleted.'
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
    Delete Cases
    </Button>
  );
}
