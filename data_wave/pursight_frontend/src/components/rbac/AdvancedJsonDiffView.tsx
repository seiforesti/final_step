import React from "react";
import ReactDiffViewer from "react-diff-viewer";

function pretty(obj: any) {
  return typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
}

const AdvancedJsonDiffView: React.FC<{ before?: any; after?: any }> = ({
  before,
  after,
}) => {
  if (!before && !after) return <div>No data</div>;
  if (JSON.stringify(before) === JSON.stringify(after))
    return <div>No changes</div>;
  return (
    <ReactDiffViewer
      oldValue={pretty(before)}
      newValue={pretty(after)}
      splitView={true}
      showDiffOnly={false}
      leftTitle="Before"
      rightTitle="After"
      styles={{
        variables: {
          light: {
            diffViewerBackground: "#181818",
            addedBackground: "#232d23",
            removedBackground: "#2d2323",
            wordAddedBackground: "#95de64",
            wordRemovedBackground: "#ff7875",
          },
        },
      }}
    />
  );
};

export default AdvancedJsonDiffView;
