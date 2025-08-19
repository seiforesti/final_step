import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Tag,
  Typography,
  Space,
  Input,
  message,
} from "antd";
import { useAccessRequests, useReviewAccessRequest } from "../../api/rbac";

const { Title, Text } = Typography;

const AccessRequestsPage: React.FC = () => {
  const { data: requests, isLoading, refetch } = useAccessRequests();
  const reviewRequest = useReviewAccessRequest();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState("");

  const handleReview = async (approve: boolean) => {
    if (!selectedRequest) return;
    await reviewRequest.mutateAsync({
      request_id: selectedRequest.id,
      approve,
      review_note: reviewNote,
    });
    message.success(approve ? "Request approved" : "Request denied");
    setSelectedRequest(null);
    setReviewNote("");
    refetch();
  };

  return (
    <div>
      <Title level={4}>Access Requests</Title>
      <Table
        dataSource={requests || []}
        loading={isLoading}
        rowKey="id"
        columns={[
          { title: "User ID", dataIndex: "user_id" },
          { title: "Resource Type", dataIndex: "resource_type" },
          { title: "Resource ID", dataIndex: "resource_id" },
          { title: "Requested Role", dataIndex: "requested_role" },
          { title: "Justification", dataIndex: "justification" },
          {
            title: "Status",
            dataIndex: "status",
            render: (status: string) => (
              <Tag
                color={
                  status === "approved"
                    ? "green"
                    : status === "rejected"
                    ? "red"
                    : "gold"
                }
              >
                {status}
              </Tag>
            ),
          },
          {
            title: "Actions",
            render: (_: any, req: any) =>
              req.status === "pending" ? (
                <Space>
                  <Button
                    type="primary"
                    onClick={() => setSelectedRequest(req)}
                  >
                    Review
                  </Button>
                </Space>
              ) : null,
          },
        ]}
      />
      <Modal
        open={!!selectedRequest}
        onCancel={() => setSelectedRequest(null)}
        onOk={() => handleReview(true)}
        okText="Approve"
        cancelText="Deny"
        onCancelText="Deny"
        onCancelSecondary={() => handleReview(false)}
        title="Review Access Request"
        footer={[
          <Button key="deny" danger onClick={() => handleReview(false)}>
            Deny
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() => handleReview(true)}
          >
            Approve
          </Button>,
        ]}
      >
        {selectedRequest && (
          <div>
            <Text strong>User ID:</Text> {selectedRequest.user_id}
            <br />
            <Text strong>Resource:</Text> {selectedRequest.resource_type} /{" "}
            {selectedRequest.resource_id}
            <br />
            <Text strong>Requested Role:</Text> {selectedRequest.requested_role}
            <br />
            <Text strong>Justification:</Text> {selectedRequest.justification}
            <br />
            <Input.TextArea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Review note (optional)"
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ marginTop: 12 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AccessRequestsPage;
