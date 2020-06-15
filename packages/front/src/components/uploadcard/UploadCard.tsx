import {
  DeleteOutlined,
  ExperimentOutlined,
  LoadingOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Spin, Tooltip } from "antd";
import { dateFormat } from "functions/date";
import React from "react";
import { Link } from "react-router-dom";
import { AnalysisState, Upload } from "types/dashboard";

type Props = {
  upload: Upload;
  retryAnalysis: (_id: string) => void;
  deleteUpload: (_id: string) => void;
};

const UploadCard = (props: Props) => {
  const { upload, retryAnalysis, deleteUpload } = props;

  const getStateContent = (state: AnalysisState) => {
    type AlertType = "warning" | "error" | "success" | undefined;
    let type: AlertType = undefined;
    switch (state) {
      case AnalysisState.PENDING:
        type = "warning";
        break;
      case AnalysisState.ERROR:
        type = "error";
        break;
      case AnalysisState.SUCCESS:
        type = "success";
        break;
    }
    return <Alert message={`Analysis state: ${state}`} type={type} showIcon />;
  };

  const getAnalysisDate = (upload: Upload) => {
    return upload.state === "pending" || upload.state === "error"
      ? "-"
      : dateFormat(new Date(upload.lastStateEditTimestamp));
  };

  const getExtra = (state: AnalysisState) => {
    switch (state) {
      case AnalysisState.PENDING:
        return (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        );
      case AnalysisState.SUCCESS:
      case AnalysisState.ERROR:
        return (
          <Tooltip title="Delete analysis" placement="top">
            <Button
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              style={{ marginTop: 5 }}
              onClick={() => deleteUpload(upload._id)}
            />
          </Tooltip>
        );
    }
  };

  const getAction = (upload: Upload) => {
    switch (upload.state) {
      case AnalysisState.SUCCESS:
        return [
          <Link to={`/analysis/${upload.analysisId}`} key="analysis">
            <Button type="primary" icon={<ExperimentOutlined />}>
              Show analysis
            </Button>
          </Link>,
        ];
      case AnalysisState.ERROR:
        return [
          <Button
            type="primary"
            icon={<RedoOutlined />}
            style={{ backgroundColor: "#ffbf00", borderColor: "#ffbf00" }}
            onClick={() => retryAnalysis(upload._id)}
          >
            Retry
          </Button>,
        ];
    }
  };

  return (
    <Card
      title={upload.videoFile}
      extra={getExtra(upload.state)}
      style={{ height: 290, width: 300, margin: 15 }}
      actions={getAction(upload)}
    >
      {getStateContent(upload.state)}
      <div style={{ marginTop: 15 }}>
        <p style={{ marginBottom: 5 }}>
          <strong>Uploaded: </strong>
          {dateFormat(new Date(upload.uploadTimestamp))}
        </p>
        <p>
          <strong>Analysed:  </strong>
          {getAnalysisDate(upload)}
        </p>
      </div>
    </Card>
  );
};

export default UploadCard;
