import React, { useState, useRef, useEffect } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiSave,
  FiPlay,
  FiCopy,
  FiTrash2,
  FiFolder,
  FiBook,
  FiStar,
  FiSettings,
  FiBell,
  FiX,
  FiMoreVertical,
  FiCalendar,
  FiFilter,
  FiSearch,
  FiDatabase,
  FiHome,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiBarChart2,
  FiList,
  FiUser,
  FiChevronRight as FiArrowRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiZap,
} from "react-icons/fi";
import Editor from "@monaco-editor/react";

// Types
type NotebookCell = {
  id: string;
  type: "code" | "markdown";
  content: string;
  output?: string;
};
type Tab = {
  id: string;
  title: string;
  date: string;
  unsaved?: boolean;
  cells: NotebookCell[];
};

// Data mocks
function getInitialCells(): NotebookCell[] {
  return [
    { id: "1", type: "code", content: "" },
    { id: "2", type: "code", content: "" },
  ];
}
const initialTabs: Tab[] = [
  {
    id: "tab1",
    title: "Untitled Notebook",
    date: "2025-06-04 11:12:45",
    cells: getInitialCells(),
  },
  {
    id: "tab2",
    title: "New Query",
    date: "2025-06-02 14:31",
    cells: getInitialCells(),
  },
  {
    id: "tab3",
    title: "Untitled Notebook",
    date: "2025-06-10 23:49:52",
    cells: getInitialCells(),
  },
];

// ScheduleDialog (identique à votre version)
function ScheduleDialog({
  open,
  onClose,
  jobName,
}: {
  open: boolean;
  onClose: () => void;
  jobName: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#232733] rounded-lg shadow-lg w-[420px] max-w-full p-4 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
          onClick={onClose}
        >
          <FiX size={18} />
        </button>
        <h2 className="text-lg font-bold mb-3">New schedule</h2>
        <label className="block text-xs mb-1 font-semibold">Job name*</label>
        <input
          className="w-full bg-[#181c24] border border-gray-700 rounded px-2 py-1 mb-3 text-gray-100 text-xs"
          value={jobName}
          readOnly
        />
        <div className="flex gap-2 mb-3">
          <button className="flex-1 py-1 rounded bg-[#232733] border border-blue-400 text-blue-300 font-semibold text-xs">
            Simple
          </button>
          <button className="flex-1 py-1 rounded bg-blue-900 bor</div>der border-blue-400 text-blue-200 font-semibold text-xs">
            Advanced
          </button>
        </div>
        <div className="mb-3">
          <label className="block text-xs mb-1 font-semibold">Schedule</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              defaultValue={1}
              className="w-12 bg-[#181c24] border border-gray-700 rounded px-1 py-1 text-gray-100 text-xs"
            />
            <select className="bg-[#181c24] border border-gray-700 rounded px-1 py-1 text-gray-100 text-xs">
              <option>Day</option>
              <option>Hour</option>
              <option>Minute</option>
            </select>
            <span className="text-gray-400 text-xs">at</span>
            <select className="bg-[#181c24] border border-gray-700 rounded px-1 py-1 text-gray-100 text-xs">
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i}>{i.toString().padStart(2, "0")}</option>
              ))}
            </select>
            <span className="text-gray-400 text-xs">:</span>
            <select className="bg-[#181c24] border border-gray-700 rounded px-1 py-1 text-gray-100 text-xs">
              {Array.from({ length: 60 }).map((_, i) => (
                <option key={i}>{i.toString().padStart(2, "0")}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center mt-2 text-xs gap-2">
            <input type="checkbox" className="accent-blue-500" />
            Show cron syntax
          </label>
        </div>
        <div className="mb-3">
          <label className="block text-xs mb-1 font-semibold">Timezone</label>
          <select className="w-full bg-[#181c24] border border-gray-700 rounded px-1 py-1 text-gray-100 text-xs">
            <option>(UTC+00:00) UTC</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-xs mb-1 font-semibold">Compute*</label>
          <select className="w-full bg-[#181c24] border border-gray-700 rounded px-1 py-1 text-gray-100 text-xs">
            <option>Serverless</option>
          </select>
          <div className="text-xs text-gray-400 mt-1">9.77 GB · 10 Cores</div>
        </div>
        <div className="mb-3">
          <label className="block text-xs mb-1 font-semibold">
            Performance optimization{" "}
            <span className="ml-1 text-xs text-purple-400">New</span>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" className="accent-blue-500" />
            Performance optimized
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-[#181c24] border border-gray-700 text-gray-200 text-xs"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white font-semibold text-xs">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// CellMenu (identique à votre version)
function CellMenu({
  onRun,
  onRunAllAbove,
  onRunAllBelow,
}: {
  onRun: () => void;
  onRunAllAbove: () => void;
  onRunAllBelow: () => void;
}) {
  return (
    <div className="absolute z-40 left-8 top-7 bg-[#232733] border border-gray-700 rounded shadow-lg w-44 py-1 text-xs">
      <button
        className="w-full text-left px-3 py-1 hover:bg-[#181c24]"
        onClick={onRun}
      >
        Run cell{" "}
        <span className="float-right text-[10px] text-gray-400">
          Ctrl+Enter
        </span>
      </button>
      <button className="w-full text-left px-3 py-1 text-gray-500 cursor-not-allowed">
        Debug cell{" "}
        <span className="float-right text-[10px] text-gray-400">
          Alt+Shift+D
        </span>
      </button>
      <button
        className="w-full text-left px-3 py-1 hover:bg-[#181c24]"
        onClick={onRun}
      >
        Run selected text{" "}
        <span className="float-right text-[10px] text-gray-400">
          Ctrl+Shift+Enter
        </span>
      </button>
      <button
        className="w-full text-left px-3 py-1 hover:bg-[#181c24]"
        onClick={onRunAllAbove}
      >
        Run all above{" "}
        <span className="float-right text-[10px] text-gray-400">
          Alt+Shift+Up
        </span>
      </button>
      <button
        className="w-full text-left px-3 py-1 hover:bg-[#181c24]"
        onClick={onRunAllBelow}
      >
        Run all below{" "}
        <span className="float-right text-[10px] text-gray-400">
          Alt+Shift+Down
        </span>
      </button>
    </div>
  );
}

// TreeNode (identique à votre version)
function TreeNode({
  label,
  icon,
  childrenNodes,
}: {
  label: string;
  icon: React.ReactNode;
  childrenNodes?: React.ReactNode[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div
        className="flex items-center gap-1 cursor-pointer hover:bg-[#181c24] rounded px-1 py-0.5"
        onClick={() => setOpen(!open)}
      >
        {childrenNodes && (
          <span className="text-gray-400">
            {open ? <FiChevronDown /> : <FiChevronRight />}
          </span>
        )}
        {icon} {label}
      </div>
      {open && childrenNodes && <div className="ml-4">{childrenNodes}</div>}
    </div>
  );
}

// TabTitleInput for inline editing (identique à votre version)
function TabTitleInput({
  initialValue,
  onBlurOrEnter,
}: {
  initialValue: string;
  onBlurOrEnter: (v: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <input
      ref={inputRef}
      className="bg-[#181c24] border border-blue-400 rounded px-1 py-0.5 text-sm text-blue-200 w-32 outline-none"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onBlurOrEnter(value.trim() || initialValue)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onBlurOrEnter(value.trim() || initialValue);
        } else if (e.key === "Escape") {
          onBlurOrEnter(initialValue);
        }
      }}
      style={{ minWidth: 80, maxWidth: 160 }}
    />
  );
}

// NotebookTabsBar amélioré
function NotebookTabsBar({
  tabs,
  activeTab,
  setActiveTab,
  addTab,
  closeTab,
  onRenameTab,
  editingTabId,
  setEditingTabId,
}: {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  addTab: () => void;
  closeTab: (id: string) => void;
  onRenameTab: (id: string, newTitle: string) => void;
  editingTabId: string | null;
  setEditingTabId: (id: string | null) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const activeTabIdx = tabs.findIndex((t) => t.id === activeTab);
    const tabNodes =
      scrollRef.current.querySelectorAll<HTMLDivElement>(".notebook-tab-item");
    if (tabNodes[activeTabIdx]) {
      tabNodes[activeTabIdx].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab, tabs.length]);

  // Largeur d'un tab ~200px, donc 4 tabs visibles = 800px
  const TABS_VISIBLE_WIDTH = 800;

  return (
    <div className="relative w-full bg-[#232733] border-b border-[#232733] flex items-center h-14 min-h-14 max-h-14 z-10">
      {/* Tabs scroll left */}
      <button
        className="p-1 text-gray-400 hover:text-blue-400 flex-shrink-0"
        onClick={() => {
          scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
        }}
        tabIndex={-1}
        aria-label="Scroll tabs left"
        style={{ marginRight: 2 }}
      >
        <FiChevronLeft />
      </button>
      {/* Tabs list */}
      <div
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto scrollbar-thin notebook-tabs-scroll min-w-0"
        style={{
          scrollbarColor: "transparent transparent",
          scrollbarWidth: "thin",
          minWidth: 0,
          maxWidth: TABS_VISIBLE_WIDTH,
        }}
      >
        {tabs.map((tab, i) => (
          <div
            key={tab.id}
            className={`notebook-tab-item flex items-center px-4 py-2 cursor-pointer text-sm border-b-2 ${
              activeTab === tab.id
                ? "border-blue-400 text-blue-300 bg-[#232733] font-semibold"
                : "border-transparent text-gray-300"
            } relative select-none mr-2 rounded-t-md transition-all duration-150`}
            onClick={() => setActiveTab(tab.id)}
            onDoubleClick={() => setEditingTabId(tab.id)}
            style={{
              minWidth: 180,
              maxWidth: 200,
              whiteSpace: "nowrap",
              userSelect: "none",
              flex: "0 0 200px",
              boxShadow:
                activeTab === tab.id ? "0 2px 8px #23273344" : undefined,
              height: "100%",
              alignItems: "center",
              display: "flex",
            }}
          >
            <FiBook className="mr-1 text-gray-400" />
            <div className="flex flex-col min-w-0">
              {editingTabId === tab.id ? (
                <TabTitleInput
                  initialValue={tab.title}
                  onBlurOrEnter={(newTitle) => {
                    onRenameTab(tab.id, newTitle);
                    setEditingTabId(null);
                  }}
                />
              ) : (
                <span className="truncate">{tab.title}</span>
              )}
              <span className="text-[10px] text-gray-500 truncate">
                {tab.date}
              </span>
            </div>
            {tab.unsaved && (
              <span className="ml-1 text-xs text-orange-400">*</span>
            )}
            <button
              className="ml-2 text-gray-500 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              title="Close"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
      {/* Actions à droite */}
      <div className="flex items-center absolute right-0 top-0 h-full pr-2 bg-[#232733]">
        <button
          className="ml-2 px-2 py-1 rounded bg-[#181c24] text-gray-400 hover:text-blue-400"
          title="New Tab"
          onClick={addTab}
        >
          <FiPlus />
        </button>
        <button
          className="ml-1 p-1 text-gray-400 hover:text-blue-400"
          onClick={() => {
            scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
          }}
          tabIndex={-1}
          aria-label="Scroll tabs right"
        >
          <FiChevronRight />
        </button>
      </div>
      <style>
        {`
          .notebook-tabs-scroll::-webkit-scrollbar {
            height: 6px;
            background: transparent;
          }
          .notebook-tabs-scroll::-webkit-scrollbar-thumb {
            background: #232733;
            border-radius: 4px;
            opacity: 0;
          }
          .notebook-tabs-scroll:hover::-webkit-scrollbar-thumb {
            opacity: 1;
          }
          .notebook-cell-content-scrollbar {
            max-height: 150px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;
          }
          .notebook-cell-content-scrollbar::-webkit-scrollbar {
            width: 5px;
            background: transparent;
          }
          .notebook-cell-content-scrollbar::-webkit-scrollbar-thumb {
            background: #232733;
            border-radius: 4px;
            opacity: 0;
            transition: opacity 0.2s;
          }
          .notebook-cell-content-scrollbar:hover::-webkit-scrollbar-thumb {
            opacity: 0.5;
          }
        `}
      </style>
    </div>
  );
}

function NotebookPage() {
  // The entire NotebookPage component code here (copy from previous implementation)
  // For brevity, assume the full component code is here as before
  // This defines NotebookPage as a function declaration to avoid 'Cannot find name' error

  // Get current tab and its cells
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState("tab1");
  const [showSchedule, setShowSchedule] = useState(false);
  const [cellMenuIdx, setCellMenuIdx] = useState<number | null>(null);
  const [sidebar, setSidebar] = useState<
    | "catalog"
    | "workspace"
    | "recents"
    | "favorites"
    | "dashboards"
    | "users"
    | "settings"
  >("catalog");
  const [language, setLanguage] = useState("Python");
  const [favorite, setFavorite] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [aiAssistCellIdx, setAIAssistCellIdx] = useState<number | null>(null);
  const [aiPrompt, setAIPrompt] = useState("");
  const [aiLoading, setAILoading] = useState(false);

  // Cell actions (per tab)
  function setCellsForTab(tabId: string, newCells: NotebookCell[]) {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, cells: newCells, unsaved: true } : tab
      )
    );
  }
  function addCell(idx?: number) {
    const cells = tabs.find((tab) => tab.id === activeTab)?.cells || [];
    const newCell: NotebookCell = {
      id: Date.now().toString(),
      type: "code",
      content: "",
    };
    let newCells: NotebookCell[];
    if (typeof idx === "number") {
      newCells = [...cells.slice(0, idx + 1), newCell, ...cells.slice(idx + 1)];
    } else {
      newCells = [...cells, newCell];
    }
    setCellsForTab(activeTab, newCells);
  }
  function updateCell(id: string, content: string) {
    const cells = tabs.find((tab) => tab.id === activeTab)?.cells || [];
    setCellsForTab(
      activeTab,
      cells.map((cell: NotebookCell) => (cell.id === id ? { ...cell, content } : cell))
    );
  }
  function runCell(id: string) {
    const cells = tabs.find((tab) => tab.id === activeTab)?.cells || [];
    setCellsForTab(
      activeTab,
      cells.map((cell: NotebookCell) =>
        cell.id === id
          ? { ...cell, output: `Résultat simulé pour: ${cell.content}` }
          : cell
      )
    );
  }
  function runAllAbove(idx: number) {
    const cells = tabs.find((tab) => tab.id === activeTab)?.cells || [];
    setCellsForTab(
      activeTab,
      cells.map((cell: NotebookCell, i: number) =>
        i < idx
          ? { ...cell, output: `Résultat simulé pour: ${cell.content}` }
          : cell
      )
    );
  }
  function runAllBelow(idx: number) {
    const cells = tabs.find((tab) => tab.id === activeTab)?.cells || [];
    setCellsForTab(
      activeTab,
      cells.map((cell: NotebookCell, i: number) =>
        i > idx
          ? { ...cell, output: `Résultat simulé pour: ${cell.content}` }
          : cell
      )
    );
  }
  function removeCell(id: string) {
    const cells = tabs.find((tab) => tab.id === activeTab)?.cells || [];
    setCellsForTab(
      activeTab,
      cells.filter((cell: NotebookCell) => cell.id !== id)
    );
  }
  function changeCellType(id: string, type: "code" | "markdown") {
    const cells = tabs.find((tab) => tab.id === activeTab)?.cells || [];
    setCellsForTab(
      activeTab,
      cells.map((cell: NotebookCell) => (cell.id === id ? { ...cell, type } : cell))
    );
  }
  function copyCell(idx: number) {
    const cells = tabs.find((tab) => tab.id === activeTab)?.cells || [];
    const cell = cells[idx];
    const newCell = { ...cell, id: Date.now().toString() };
    setCellsForTab(activeTab, [
      ...cells.slice(0, idx + 1),
      newCell,
      ...cells.slice(idx + 1),
    ]);
  }
  function moveCell(idx: number, dir: "up" | "down") {
    const cells = tabs.find((tab) => tab.id === activeTab)?.cells || [];
    if (
      (dir === "up" && idx === 0) ||
      (dir === "down" && idx === cells.length - 1)
    )
      return;
    const newCells = [...cells];
    const [removed] = newCells.splice(idx, 1);
    newCells.splice(dir === "up" ? idx - 1 : idx + 1, 0, removed);
    setCellsForTab(activeTab, newCells);
  }

  // Tabs actions
  function addTab() {
    const now = new Date();
    const dateStr = now
      .toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(" ", " ");
    const id = "tab" + Date.now();
    setTabs([
      ...tabs,
      {
        id,
        title: "Untitled Notebook",
        date: dateStr,
        cells: getInitialCells(),
      },
    ]);
    setActiveTab(id);
  }
  function closeTab(id: string) {
    let idx = tabs.findIndex((t) => t.id === id);
    let newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id && newTabs.length) {
      setActiveTab(newTabs[Math.max(0, idx - 1)].id);
    }
  }
  function onRenameTab(id: string, newTitle: string) {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id ? { ...tab, title: newTitle, unsaved: true } : tab
      )
    );
  }

  // Toolbar actions
  function onRunAll() {
    const cells = tabs.find((tab) => tab.id === activeTab)?.cells || [];
    setCellsForTab(
      activeTab,
      cells.map((cell: NotebookCell) =>
        cell.type === "code"
          ? { ...cell, output: `Résultat simulé pour: ${cell.content}` }
          : cell
      )
    );
  }
  function onSave() {
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTab ? { ...tab, unsaved: false } : tab
      )
    );
  }
  function onSchedule() {
    setShowSchedule(true);
  }
  function toggleFavorite() {
    setFavorite((f) => !f);
  }

  // Fonction simulée d'appel AI (à remplacer par un vrai appel backend plus tard)
  async function handleAIAssist(idx: number, prompt: string) {
    setAILoading(true);
    // Simule une génération de code Python
    await new Promise((r) => setTimeout(r, 1200));
    const aiCode = `# Code généré pour : ${prompt}\ndef hello():\n    print("Hello from AI!")`;
    updateCell(
      (tabs.find((tab) => tab.id === activeTab)?.cells[idx] as NotebookCell).id,
      aiCode
    );
    setAILoading(false);
    setAIAssistCellIdx(null);
    setAIPrompt("");
  }

  // Layout constants
  const contextualSidebarWidth =
    sidebar === "catalog"
      ? sidebarExpanded
        ? 224
        : 56
      : sidebar === "workspace"
      ? sidebarExpanded
        ? 192
        : 56
      : 0;

  return (
    <div className="flex w-full h-full">
      {/* Contextual Sidebar */}
      {(sidebar === "catalog" || sidebar === "workspace") && (
        <aside
          className="flex-shrink-0 flex-grow-0 h-full transition-all duration-200 border-r border-[#232733] bg-[#232733]"
          style={{
            width: contextualSidebarWidth,
            minWidth: contextualSidebarWidth,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div className="flex items-center px-3 py-2 border-b border-[#232733]">
            {sidebar === "catalog" ? (
              <FiDatabase className="mr-1" />
            ) : (
              <FiHome className="mr-1" />
            )}
            {sidebarExpanded && (
              <span className="font-semibold text-xs capitalize">
                {sidebar}
              </span>
            )}
            <button
              className="ml-auto text-gray-400 hover:text-gray-200"
              tabIndex={-1}
              onClick={() => setSidebarExpanded(false)}
            >
              <FiX size={14} />
            </button>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1 px-3 py-1">
            {sidebarExpanded && (
              <div className="flex-1 flex items-center bg-[#181c24] rounded px-1">
                <FiSearch className="text-gray-400" size={14} />
                <input
                  className="bg-transparent outline-none px-1 py-1 w-full text-xs text-gray-200"
                  placeholder={
                    sidebar === "catalog"
                      ? "Type to search..."
                      : "Search workspace..."
                  }
                  style={{ fontSize: "11px" }}
                />
              </div>
            )}
            <button className="p-1 rounded hover:bg-[#181c24]" title="Filter">
              <FiFilter size={14} />
            </button>
            <button
              className="p-1 rounded hover:bg-[#181c24]"
              title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              onClick={() => setSidebarExpanded((v) => !v)}
            >
              {sidebarExpanded ? (
                <FiChevronsLeft size={14} />
              ) : (
                <FiChevronsRight size={14} />
              )}
            </button>
          </div>
          {/* Content */}
          {sidebarExpanded && (
            <>
              <div className="flex gap-1 px-3 pb-1">
                <button className="px-1.5 py-0.5 rounded bg-blue-900 text-blue-300 text-[10px] font-semibold">
                  For you
                </button>
                <button className="px-1.5 py-0.5 rounded bg-[#181c24] text-gray-300 text-[10px] font-semibold">
                  All
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-1 text-xs min-h-0 notebook-scrollbar">
                {sidebar === "catalog" ? (
                  <>
                    <div className="mb-1 text-[10px] text-gray-400">
                      My organization
                    </div>
                    <div className="ml-1">
                      <TreeNode
                        label="workspace"
                        icon={<FiFolder className="text-gray-400" size={13} />}
                        childrenNodes={[
                          <TreeNode
                            key="ws1"
                            label="project1"
                            icon={
                              <FiFolder className="text-gray-400" size={13} />
                            }
                          />,
                          <TreeNode
                            key="ws2"
                            label="project2"
                            icon={
                              <FiFolder className="text-gray-400" size={13} />
                            }
                          />,
                        ]}
                      />
                      <TreeNode
                        label="default"
                        icon={
                          <FiDatabase className="text-gray-400" size={13} />
                        }
                      />
                      <TreeNode
                        label="information_schema"
                        icon={
                          <FiDatabase className="text-gray-400" size={13} />
                        }
                      />
                      <TreeNode
                        label="system"
                        icon={
                          <FiDatabase className="text-gray-400" size={13} />
                        }
                      />
                    </div>
                    <div className="mt-2 text-[10px] text-gray-400">
                      Delta Shares Received
                    </div>
                    <div className="ml-1">
                      <TreeNode
                        label="samples"
                        icon={<FiFolder className="text-gray-400" size={13} />}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-1 pb-1">
                      <button className="px-1.5 py-0.5 rounded bg-blue-900 text-blue-300 text-[10px] font-semibold flex items-center gap-1">
                        <FiHome size={12} /> Workspace
                      </button>
                      <button className="px-1.5 py-0.5 rounded bg-[#181c24] text-gray-300 text-[10px] font-semibold flex items-center gap-1">
                        <FiClock size={12} /> Recents
                      </button>
                      <button className="px-1.5 py-0.5 rounded bg-[#181c24] text-gray-300 text-[10px] font-semibold flex items-center gap-1">
                        <FiStar size={12} /> Favorites
                      </button>
                      <button className="px-1.5 py-0.5 rounded bg-[#181c24] text-gray-300 text-[10px] font-semibold flex items-center gap-1">
                        <FiBarChart2 size={12} /> Dashboards
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 cursor-pointer hover:bg-[#181c24] rounded px-1 py-0.5">
                        <FiFolder className="text-gray-400" size={13} /> New
                        Pipeline 2025-06-09 16:55
                      </div>
                      <div className="flex items-center gap-1 cursor-pointer hover:bg-[#181c24] rounded px-1 py-0.5">
                        <FiFolder className="text-gray-400" size={13} /> New
                        Pipeline 2025-06-10 18:58
                      </div>
                      <div className="flex items-center gap-1 cursor-pointer hover:bg-[#181c24] rounded px-1 py-0.5">
                        <FiBook className="text-gray-400" size={13} /> Untitled
                        Notebook 2025-06-04 11:12:45
                      </div>
                      <div className="flex items-center gap-1 cursor-pointer hover:bg-[#181c24] rounded px-1 py-0.5">
                        <FiBook className="text-gray-400" size={13} /> Data
                        Exploration
                      </div>
                      <div className="flex items-center gap-1 cursor-pointer hover:bg-[#181c24] rounded px-1 py-0.5">
                        <FiBarChart2 className="text-gray-400" size={13} />{" "}
                        Sales Dashboard
                      </div>
                    </div>
                    <div className="p-1 border-t border-[#232733] text-[10px] text-gray-500 flex items-center gap-2 mt-2">
                      <FiBell className="inline" size={12} /> Notifications
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </aside>
      )}
      {/* Main notebook area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-[#181c24]">
        {/* Header sticky */}
        <div
          className="sticky top-0 left-0 right-0 z-10 bg-[#232733] flex flex-col min-w-0 border-b border-[#232733]"
          style={{
            boxShadow: "0 1px 0 0 #232733",
          }}
        >
          <header className="flex flex-col w-full">
            <NotebookTabsBar
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              addTab={addTab}
              closeTab={closeTab}
              onRenameTab={onRenameTab}
              editingTabId={editingTabId}
              setEditingTabId={setEditingTabId}
            />

          </header>
        </div>
        {/* Scrollable cells area */}
        <div
          className="flex-1 min-h-0 min-w-0"
          style={{
            background: "#181c24",
            minHeight: 0,
            minWidth: 0,
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          <style>
            {`
              .notebook-cells-content-scrollbar {
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: transparent transparent;
                max-height: 100%;
                min-height: 0;
              }
              .notebook-cells-content-scrollbar::-webkit-scrollbar {
                width: 7px;
                background: transparent;
              }
              .notebook-cells-content-scrollbar::-webkit-scrollbar-thumb {
                background: #232733;
                border-radius: 4px;
                opacity: 0;
                transition: opacity 0.2s;
              }
              .notebook-cells-content-scrollbar:hover::-webkit-scrollbar-thumb {
                opacity: 0.5;
              }
              .notebook-cell-content-scrollbar {
                max-height: 150px;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: transparent transparent;
              }
              .notebook-cell-content-scrollbar::-webkit-scrollbar {
                width: 5px;
                background: transparent;
              }
              .notebook-cell-content-scrollbar::-webkit-scrollbar-thumb {
                background: #232733;
                border-radius: 4px;
                opacity: 0;
                transition: opacity 0.2s;
              }
              .notebook-cell-content-scrollbar:hover::-webkit-scrollbar-thumb {
                opacity: 0.5;
              }
            `}
          </style>
          <div
            className="w-full max-w-3xl mx-auto flex flex-col gap-4 py-6 px-2 notebook-cells-content-scrollbar"
            style={{
              flex: 1,
              minHeight: 0,
              maxHeight: "100%",
            }}
          >
            {(tabs.find((tab) => tab.id === activeTab)?.cells || []).map((cell: NotebookCell, idx: number) => (
              <div
                key={cell.id}
                tabIndex={0}
                className="notebook-cell bg-[#232733] rounded-lg shadow-sm p-0 group relative border border-[#232733] hover:border-blue-700 transition-all outline-none"
                style={{
                  margin: 0,
                  padding: 0,
                  minWidth: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-2 px-4 pt-4 pb-2">
 <button
      className="flex items-center justify-center w-7 h-7 rounded bg-[#181c24] border border-gray-700 hover:border-blue-400 transition shadow"
      onClick={() => setCellMenuIdx(cellMenuIdx === idx ? null : idx)}
      tabIndex={-1}
      title="Show table popup"
      style={{ marginRight: 2 }}
    >
      <FiPlay className="text-blue-400" size={16} />
                    {cellMenuIdx === idx && (
                      <CellMenu
                        onRun={() => runCell(cell.id)}
                        onRunAllAbove={() => runAllAbove(idx)}
                        onRunAllBelow={() => runAllBelow(idx)}
                      />
                    )}
                  </button>
                  <select
                    className="ml-2 bg-[#181c24] border border-gray-700 rounded px-2 py-1 text-xs text-gray-300"
                    value={cell.type}
                    onChange={(e) =>
                      changeCellType(
                        cell.id,
                        e.target.value as "code" | "markdown"
                      )
                    }
                  >
                    <option value="code">Code</option>
                    <option value="markdown">Markdown</option>
                  </select>
                  <span className="ml-auto flex gap-2 items-center">
                    <button onClick={() => runCell(cell.id)} title="Run cell">
                      <FiPlay className="text-blue-400" />
                    </button>
                    <button onClick={() => addCell(idx)} title="Add cell below">
                      <FiPlus className="text-green-400" />
                    </button>
                    <button onClick={() => removeCell(cell.id)} title="Delete cell">
                      <FiTrash2 className="text-red-400" />
                    </button>
                    <button onClick={() => copyCell(idx)} title="Copy cell">
                      <FiCopy className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => moveCell(idx, "up")}
                      title="Move up"
                      disabled={idx === 0}
                    >
                      <FiChevronUp className={`text-gray-400 ${idx === 0 ? "opacity-30" : ""}`} />
                    </button>
                    <button
                      onClick={() => moveCell(idx, "down")}
                      title="Move down"
                      disabled={
                        idx === (tabs.find((tab) => tab.id === activeTab)?.cells.length || 0) - 1
                      }
                    >
                      <FiChevronDown
                        className={`text-gray-400 ${
                          idx ===
                          (tabs.find((tab) => tab.id === activeTab)?.cells.length || 0) - 1
                            ? "opacity-30"
                            : ""
                        }`}
                      />
                    </button>
                    {/* Ajout du bouton IA violet à droite de la corbeille */}
                    <CellAIAssistButton onClick={() => setAIAssistCellIdx(idx)} />
                    <button title="More" className="ml-2">
                      <FiMoreVertical className="text-gray-400" />
                    </button>
                  </span>
                </div>
                <div className="px-4 pb-4 notebook-cell-content-scrollbar">
                  {cell.type === "code" ? (
                    <div>
                      <div className="flex items-center mb-2">
                       
                        {aiAssistCellIdx === idx && (
                          <div className="flex items-center gap-2 mt-3 mb-2 p-2 rounded-lg bg-[#201c2b] border border-purple-700 shadow-sm">
                            <span className="text-purple-400 font-semibold text-xs">@</span>
                            <input
                              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-100 placeholder-gray-400"
                              placeholder='@ pour objets, / pour commandes, ou décrivez votre besoin...'
                              value={aiPrompt}
                              onChange={e => setAIPrompt(e.target.value)}
                              disabled={aiLoading}
                              autoFocus
                              style={{ minWidth: 120 }}
                            />
                            <button
                              type="button"
                              className="px-3 py-1 rounded bg-gradient-to-tr from-purple-600 to-pink-500 text-white text-xs font-semibold shadow"
                              onClick={async () => {
                                if (aiPrompt.trim()) await handleAIAssist(idx, aiPrompt);
                              }}
                              disabled={aiLoading}
                            >
                              {aiLoading ? "Génération..." : "Générer"}
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 rounded text-xs text-gray-300 hover:text-red-400"
                              onClick={() => setAIAssistCellIdx(null)}
                              disabled={aiLoading}
                            >
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>
                      <Editor
                        height="180px"
                        language="python"
                        theme="vs-dark"
                        value={cell.content}
                        onChange={(value) => updateCell(cell.id, value || "")}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 15,
                          fontFamily: "Fira Mono, monospace",
                          lineNumbers: "on",
                          wordWrap: "on",
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          folding: true,
                          formatOnType: true,
                          formatOnPaste: true,
                          autoClosingBrackets: "always",
                          autoClosingQuotes: "always",
                          suggestOnTriggerCharacters: true,
                          quickSuggestions: { other: true, comments: true, strings: true },
                          tabSize: 4,
                          padding: { top: 10, bottom: 10 },
                          bracketPairColorization: { enabled: true },
                          renderLineHighlight: "all",
                          cursorSmoothCaretAnimation: "on",
                          smoothScrolling: true,
                          scrollbar: {
                            vertical: "auto",
                            horizontal: "auto",
                            useShadows: false,
                            verticalScrollbarSize: 5,
                            horizontalScrollbarSize: 5,
                            arrowSize: 0,
                          },
                          renderWhitespace: "boundary",
                          scrollBeyondLastColumn: 5,
                          overviewRulerBorder: false,
                          contextmenu: true,
                          accessibilitySupport: "on",
                          quickSuggestionsDelay: 0,
                          parameterHints: { enabled: true },
                          suggestSelection: "first",
                          acceptSuggestionOnEnter: "on",
                          snippetSuggestions: "inline",
                          tabCompletion: "on",
                          suggestFontSize: 14,
                          suggestLineHeight: 22,
                          selectionHighlight: true,
                          occurrencesHighlight: "singleFile",
                          codeLens: true,
                          glyphMargin: true,
                        }}
                      />
                    </div>
                  ) : (
                    <textarea
                      className="w-full bg-[#181c24] border border-[#232733] rounded p-2 text-gray-100 font-serif resize-none italic focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all"
                      rows={2}
                      placeholder="Write markdown..."
                      value={cell.content}
                      onChange={(e) => updateCell(cell.id, e.target.value)}
                    />
                  )}
                  {cell.output && cell.type === "code" && (
                    <div className="mt-2 bg-[#181c24] border border-blue-900 rounded p-2 text-blue-300 text-xs">
                      {cell.output}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="text-xs text-gray-500 text-center mt-8">
              [Shift+Enter] to run and move to next cell
              <br />
              [Ctrl+Shift+P] to open the command palette
              <br />
              [Esc H] to see all keyboard shortcuts
            </div>
          </div>
        </div>
      </div>
      <ScheduleDialog
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        jobName={
          tabs.find((t) => t.id === activeTab)
            ? `${tabs.find((t) => t.id === activeTab)!.title} ${
                tabs.find((t) => t.id === activeTab)!.date
              }`
            : ""
        }
      />
    </div>
  );
}

// Ajoute ce composant pour l'icône AI style Databricks
function CellAIAssistButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 shadow-md hover:scale-110 transition-all"
      title="Générer avec l'IA"
      onClick={onClick}
      style={{ marginLeft: 2, padding: 0, minWidth: 0, minHeight: 0, fontSize: "13px", lineHeight: 1 }}
    >
      <span
        style={{
          color: "white",
          fontSize: "13px",
          fontWeight: 700,
          display: "inline-block",
          lineHeight: 1,
          margin: 0,
          padding: 0,
        }}
      >
        ⚡
      </span>
    </button>
  );
}
export default NotebookPage;
