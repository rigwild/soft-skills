import { Form, Input, message, Modal } from "antd";
import { renameUpload as apiRenameUpload } from "api/upload";
import { AxiosError } from "axios";
import { getErrorMessage } from "functions/error";
import React, { useState } from "react";
import { Upload } from "types/dashboard";

type Props = {
  visible: boolean;
  upload: Upload;
  renameUpload: (_id: string, name: string) => void;
  closeModal: () => void;
};

const RenameModal = (props: Props) => {
  const { visible, upload, renameUpload, closeModal } = props;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRenameUpload = (name: string) => {
    setLoading(true);
    apiRenameUpload(upload._id, name)
      .then(() => {
        renameUpload(upload._id, name);
        form.resetFields();
        closeModal();
      })
      .catch((error: AxiosError) => message.error(getErrorMessage(error), 4))
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      visible={visible}
      title={`Rename upload : ${upload?.name}`}
      style={{ top: 275 }}
      okText="Rename"
      cancelText="Cancel"
      onCancel={closeModal}
      onOk={() => {
        form.validateFields().then((values) => handleRenameUpload(values.name));
      }}
      closable={!loading}
      cancelButtonProps={{ disabled: loading }}
      okButtonProps={{ loading }}
    >
      <Form form={form}>
        <Form.Item
          name="name"
          label="New name"
          rules={[
            {
              required: true,
              message: "Please input a new name for the upload!",
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RenameModal;
