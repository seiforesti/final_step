import { AppSidebar } from "@/components/app-sidebar"
import { CustomDataTable } from "@/components/custom-data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function YourCustomPage() {
  // Your custom data
  const customData = [
    {
      id: 1,
      name: "Project Alpha",
      status: "Active",
      priority: "High",
      assignee: "John Doe",
    },
    {
      id: 2,
      name: "Project Beta",
      status: "Pending",
      priority: "Medium",
      assignee: "Jane Smith",
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            {/* Custom header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Your Dashboard</h1>
                <p className="text-muted-foreground">Manage your projects and tasks</p>
              </div>
            </div>

            {/* Custom content using the same styling patterns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold">Total Projects</h3>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold">Active Tasks</h3>
                <p className="text-2xl font-bold">156</p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold">Completed</h3>
                <p className="text-2xl font-bold">89</p>
              </div>
            </div>

            {/* Use the data table with your custom data */}
            <CustomDataTable data={customData} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
