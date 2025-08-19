import React, { useEffect } from "react";
import { Badge, Tooltip } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useAccessRequests } from "../../api/rbac";

const PendingRequestsNotifier: React.FC<{ onClick?: () => void }> = ({
  onClick,
}) => {
  const { data: requests, refetch } = useAccessRequests({ status: "pending" });
  useEffect(() => {
    // Poll for new requests every 60s
    const interval = setInterval(() => refetch(), 60000);
    return () => clearInterval(interval);
  }, [refetch]);
  const count = requests?.length || 0;
  return (
    <Tooltip
      title={
        count > 0 ? `${count} pending access requests` : "No pending requests"
      }
    >
      <Badge count={count} size="small">
        <BellOutlined
          style={{
            fontSize: 20,
            color: count > 0 ? "#faad14" : undefined,
            cursor: "pointer",
          }}
          onClick={onClick}
        />
      </Badge>
    </Tooltip>
  );
};

export default PendingRequestsNotifier;
