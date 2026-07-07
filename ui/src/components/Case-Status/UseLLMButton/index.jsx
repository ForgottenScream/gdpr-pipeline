import React, {useState} from "react";
import { Button, notification } from 'antd';
import _service from '@netuno/service-client'

function UseLLMButton() {
  const [loading, setLoading] = useState(false);
  const onClick = () => {
    _service({
      method: 'GET',
      url: 'case/process-pdfs',
      start: () => {
        setLoading(true);
      },
      success: ({json}) => {
        notification.success({
          title: 'Success',
          description: 'The cases have been processed.'
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
    <>
      <h2>Caution: API Key required.</h2>
      <Button
      type="primary"
      loading={loading}
      onClick={onClick}>
      Process Cases (LLM)
      </Button>
    </>
  );
}

export default UseLLMButton
