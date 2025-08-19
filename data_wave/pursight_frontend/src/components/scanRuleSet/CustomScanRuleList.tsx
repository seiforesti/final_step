import React, { useState } from "react";
import {
  Button,
  Input,
  Label,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Textarea,
  MessageBar,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { Delete24Regular, Add24Regular } from "@fluentui/react-icons";
import { useCustomScanRules } from "../../hooks/useCustomScanRules";

const useStyles = makeStyles({
  root: {
    ...shorthands.padding("24px"),
    maxWidth: "700px",
    margin: "0 auto",
  },
  table: {
    marginTop: "16px",
    marginBottom: "24px",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "16px",
    marginBottom: "16px",
  },
});

export default function CustomScanRuleList() {
  const styles = useStyles();
  const {
    customScanRules,
    isCustomScanRulesLoading,
    isCustomScanRulesError,
    customScanRulesError,
    createMutation,
    deleteMutation,
    validateExpression,
    testExpression,
  } = useCustomScanRules();

  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    expression: "",
  });
  const [testData, setTestData] = useState("{}");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  if (isCustomScanRulesLoading)
    return <Spinner label="Loading custom scan rules..." />;
  if (isCustomScanRulesError)
    return (
      <MessageBar intent="error">{String(customScanRulesError)}</MessageBar>
    );

  return (
    <div className={styles.root}>
      <Label as="h2" size="large">
        Custom Scan Rules
      </Label>
      <Button
        icon={<Add24Regular />}
        appearance="primary"
        onClick={() => setShowDialog(true)}
      >
        New Rule
      </Button>
      <Table className={styles.table} aria-label="Custom Scan Rules">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Expression</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customScanRules?.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell>{rule.name}</TableCell>
              <TableCell>{rule.description}</TableCell>
              <TableCell>
                <pre style={{ margin: 0 }}>{rule.expression}</pre>
              </TableCell>
              <TableCell className={styles.actions}>
                <Button
                  icon={<Delete24Regular />}
                  appearance="subtle"
                  onClick={() => deleteMutation.mutate(rule.id)}
                  aria-label="Delete"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        open={showDialog}
        onOpenChange={(_, data) => setShowDialog(data.open)}
      >
        <DialogTitle>Create New Custom Scan Rule</DialogTitle>
        <DialogContent>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(newRule);
              setShowDialog(false);
            }}
          >
            <Label>Name</Label>
            <Input
              required
              value={newRule.name}
              onChange={(e) =>
                setNewRule((r) => ({ ...r, name: e.target.value }))
              }
            />
            <Label>Description</Label>
            <Input
              value={newRule.description}
              onChange={(e) =>
                setNewRule((r) => ({ ...r, description: e.target.value }))
              }
            />
            <Label>Expression</Label>
            <Textarea
              required
              value={newRule.expression}
              onChange={(e) =>
                setNewRule((r) => ({ ...r, expression: e.target.value }))
              }
            />
            <Button
              type="button"
              onClick={async () => {
                const res = await validateExpression(newRule.expression);
                setSuccess(res.valid ? "Valid expression!" : "");
                setError(res.valid ? "" : res.error || "Invalid expression");
              }}
            >
              Validate Expression
            </Button>
            <Label>Test Data (JSON)</Label>
            <Textarea
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
            />
            <Button
              type="button"
              onClick={async () => {
                try {
                  const res = await testExpression(
                    newRule.expression,
                    JSON.parse(testData)
                  );
                  setTestResult(JSON.stringify(res, null, 2));
                  setError("");
                } catch (e) {
                  setTestResult("Invalid test data JSON");
                  setError("Invalid test data JSON");
                }
              }}
            >
              Test Expression
            </Button>
            {success && <MessageBar intent="success">{success}</MessageBar>}
            {error && <MessageBar intent="error">{error}</MessageBar>}
            {testResult && <pre>{testResult}</pre>}
          </form>
        </DialogContent>
        <DialogActions>
          <Button appearance="secondary" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button
            appearance="primary"
            type="submit"
            onClick={() => {
              createMutation.mutate(newRule);
              setShowDialog(false);
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
