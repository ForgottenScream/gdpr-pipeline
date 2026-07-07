import React, {useState} from "react";
import { Button, notification } from 'antd';
import _service from '@netuno/service-client'

export default function DeleteButton() {
  const [loading, setLoading] = useState(false);
  const onClick = () => {
    _service({
      url: 'case/export',
      start: () => {
        setLoading(true);
      },
      success: ({json}) => {
        notification.success({
          title: 'Success',
          description: 'All data from the database has been exported!'
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
    target="_blank"
    href="/services/case/export">
    Export Data
    </Button>
  );
}
