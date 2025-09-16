"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { VercelTabs } from "@/components/ui/vercel-tabs"
import { CreateButton } from "@/components/create-button"
import { StatusBadge } from "@/components/status-badge"
import { ActionMenu } from "@/components/action-menu"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { useToast } from "@/hooks/use-toast"
import { filterDataForUser, shouldShowEmptyState, getEmptyStateMessage } from "@/lib/demo-data-filter"
import { autoScalingGroups, autoScalingTemplates, type AutoScalingGroup, type AutoScalingTemplate } from "@/lib/data"
import { EmptyState } from "@/components/ui/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { ShadcnDataTable } from "@/components/ui/shadcn-data-table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MoreVertical, Trash2, Eye, Edit } from "lucide-react"

// Auto Scaling Groups Section
function AutoScalingGroupsSection() {
  const [selectedASG, setSelectedASG] = useState<AutoScalingGroup | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { toast } = useToast()

  // Filter data based on user access
  const filteredASGs = filterDataForUser(autoScalingGroups, "asg")
  const showEmptyState = shouldShowEmptyState(filteredASGs, "asg")

  const handleDelete = (asg: AutoScalingGroup) => {
    setSelectedASG(asg)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedASG) {
      toast({
        title: "Auto Scaling Group deleted",
        description: `${selectedASG.name} has been deleted successfully.`,
      })
      setIsDeleteModalOpen(false)
      setSelectedASG(null)
    }
  }

  const handleEdit = (asg: AutoScalingGroup) => {
    toast({
      title: "Edit Auto Scaling Group",
      description: `Editing ${asg.name}...`,
    })
  }

  const handlePause = (asg: AutoScalingGroup) => {
    toast({
      title: "Auto Scaling Group paused",
      description: `${asg.name} has been paused.`,
    })
  }

  const handleStart = (asg: AutoScalingGroup) => {
    toast({
      title: "Auto Scaling Group started",
      description: `${asg.name} has been started.`,
    })
  }

  const handleViewDetails = (asg: AutoScalingGroup) => {
    toast({
      title: "View Details",
      description: `Viewing details for ${asg.name}...`,
    })
  }

  const handleSettings = (asg: AutoScalingGroup) => {
    toast({
      title: "Settings",
      description: `Opening settings for ${asg.name}...`,
    })
  }

  // Table columns configuration
  const columns = [
    {
      key: "name",
      label: "ASG Name",
      sortable: true,
      searchable: true,
      render: (value: string, row: AutoScalingGroup) => (
        <a
          href={`/compute/auto-scaling/${row.id}`}
          className="text-primary font-medium hover:underline leading-5"
        >
          {value}
        </a>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <StatusBadge status={value} />
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === "CPU" 
            ? "bg-gray-100 text-gray-700" 
            : "bg-gray-100 text-gray-700"
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: "flavour",
      label: "Flavour",
      sortable: true,
      render: (value: string) => (
        <div className="text-sm leading-5">{value}</div>
      ),
    },
    {
      key: "desiredCapacity",
      label: "Desired Capacity",
      sortable: true,
      render: (value: number, row: AutoScalingGroup) => (
        <div className="text-sm leading-5">
          <span className="font-medium">{value}</span>
          <span className="text-muted-foreground ml-2">
            Min: {row.minCapacity} | Max: {row.maxCapacity}
          </span>
        </div>
      ),
    },
    {
      key: "createdOn",
      label: "Created On",
      sortable: true,
      render: (value: string) => {
        const date = new Date(value);
        return (
          <div className="text-muted-foreground leading-5">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        );
      },
    },
        {
          key: "actions",
          label: "Actions",
          align: "right" as const,
          render: (value: any, row: AutoScalingGroup) => {
        const asg = row
        
        return (
          <div className="flex justify-end">
            <ActionMenu
              customActions={[
                {
                  label: "View",
                  icon: <Eye className="mr-2 h-4 w-4" />,
                  onClick: () => handleViewDetails(asg),
                },
                {
                  label: "Delete",
                  icon: <Trash2 className="mr-2 h-4 w-4" />,
                  onClick: () => handleDelete(asg),
                  variant: "destructive",
                },
              ]}
              resourceName={asg.name}
              resourceType="Auto Scaling Group"
            />
          </div>
        )
      },
    },
  ]

  const dataWithActions = filteredASGs

  const handleRefresh = () => {
    window.location.reload()
  }

  // Get unique VPCs for filter options
  const vpcOptions = Array.from(new Set(filteredASGs.map(asg => asg.vpc)))
    .map(vpc => ({ value: vpc, label: vpc }))

  // Add "All VPCs" option at the beginning
  vpcOptions.unshift({ value: "all", label: "All VPCs" })

  return (
    <div>
      {showEmptyState ? (
        <Card className="mt-8">
          <CardContent>
            <EmptyState
              {...getEmptyStateMessage('asg')}
            />
          </CardContent>
        </Card>
      ) : (
        <ShadcnDataTable
          columns={columns}
          data={dataWithActions}
          searchableColumns={["name", "vpc"]}
          defaultSort={{ column: "createdOn", direction: "desc" }}
          pageSize={10}
          enableSearch={true}
          enablePagination={true}
          onRefresh={handleRefresh}
          enableVpcFilter={true}
          vpcOptions={vpcOptions}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        resourceName={selectedASG?.name || ""}
        resourceType="Auto Scaling Group"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

// Templates Section
function TemplatesSection() {
  const [selectedTemplate, setSelectedTemplate] = useState<AutoScalingTemplate | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Filter data based on user access
  const filteredTemplates = filterDataForUser(autoScalingTemplates, "template")
  const showEmptyState = shouldShowEmptyState(filteredTemplates, "template")

  const handleDelete = (template: AutoScalingTemplate) => {
    setSelectedTemplate(template)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedTemplate) {
      toast({
        title: "Template deleted",
        description: `${selectedTemplate.name} has been deleted successfully.`,
      })
      setIsDeleteModalOpen(false)
      setSelectedTemplate(null)
    }
  }

  const handleEdit = (template: AutoScalingTemplate) => {
    toast({
      title: "Edit Template",
      description: `Editing ${template.name}...`,
    })
  }

  const handleViewDetails = (template: AutoScalingTemplate) => {
    toast({
      title: "View Details",
      description: `Viewing details for ${template.name}...`,
    })
  }

  const handleClone = (template: AutoScalingTemplate) => {
    toast({
      title: "Template Cloned",
      description: `${template.name} has been cloned.`,
    })
  }

  // Table columns for templates
  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <div className="font-medium leading-5">{value}</div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === "CPU" 
            ? "bg-gray-100 text-gray-700" 
            : "bg-gray-100 text-gray-700"
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: "flavour",
      label: "Flavour",
      sortable: true,
      render: (value: string) => (
        <div className="text-sm leading-5">{value}</div>
      ),
    },
    {
      key: "version",
      label: "Version",
      sortable: true,
      render: (value: number, row: AutoScalingTemplate) => (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="font-mono text-xs cursor-help">
                  V{value}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.isLatest ? "This is the latest version of the template" : "This is not the latest version"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {row.isLatest && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Latest version" />
          )}
        </div>
      ),
    },
    {
      key: "createdOn",
      label: "Created On",
      sortable: true,
      render: (value: string) => {
        const date = new Date(value);
        return (
          <div className="text-muted-foreground leading-5">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        );
      },
    },
        {
          key: "actions",
          label: "Actions",
          align: "right" as const,
          render: (value: any, row: AutoScalingTemplate) => {
        const template = row
        
        return (
          <div className="flex justify-end">
            <ActionMenu
              customActions={[
                {
                  label: "View",
                  icon: <Eye className="mr-2 h-4 w-4" />,
                  onClick: () => handleViewDetails(template),
                },
                {
                  label: "Edit",
                  icon: <Edit className="mr-2 h-4 w-4" />,
                  onClick: () => handleEdit(template),
                },
                {
                  label: "Delete",
                  icon: <Trash2 className="mr-2 h-4 w-4" />,
                  onClick: () => handleDelete(template),
                  variant: "destructive",
                },
              ]}
              resourceName={template.name}
              resourceType="Template"
            />
          </div>
        )
      },
    },
  ]

  const dataWithActions = filteredTemplates

  const handleRefresh = () => {
    window.location.reload()
  }

  // No VPC filter needed for templates

  return (
    <div>
      {showEmptyState ? (
        <Card className="mt-8">
          <CardContent>
            <EmptyState
              title="No Templates Yet"
              description="Create your first auto scaling template to standardize your instance configurations and make it easier to launch consistent auto scaling groups."
              actionText="Create Your First Template"
              onAction={() => {
                router.push("/compute/auto-scaling/templates/create")
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <ShadcnDataTable
          columns={columns}
          data={dataWithActions}
          searchableColumns={["name", "type"]}
          defaultSort={{ column: "createdOn", direction: "desc" }}
          pageSize={10}
          enableSearch={true}
          enablePagination={true}
          onRefresh={handleRefresh}
          enableVpcFilter={false}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        resourceName={selectedTemplate?.name || ""}
        resourceType="Template"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

const tabs = [
  { id: "asg", label: "Auto Scaling Groups" },
  { id: "templates", label: "Templates" },
]

export default function AutoScalingPage() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Determine active tab from URL, but don't change URL on tab change
  const getActiveTabFromPath = () => {
    if (pathname.includes('/templates')) return "templates"
    return "asg" // default to asg
  }
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromPath())

  // Handle tab change without URL navigation to prevent refreshes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    // Don't navigate - just change the local state
  }

  // Update active tab when URL changes (for direct navigation)
  useEffect(() => {
    setActiveTab(getActiveTabFromPath())
  }, [pathname])

  // Get title and description based on active tab
  const getPageInfo = () => {
    switch (activeTab) {
      case "templates":
        return { 
          title: "Auto Scaling Templates", 
          description: "Create and manage templates for your auto scaling configurations."
        }
      default:
        return { 
          title: "Auto Scaling Groups", 
          description: "Create and manage auto scaling groups for your compute resources."
        }
    }
  }

  // Get dynamic button info based on active tab
  const getHeaderActions = () => {
    switch (activeTab) {
      case "templates":
        return (
          <CreateButton href="/compute/auto-scaling/templates/create" label="Create Template" />
        )
      default:
        return (
          <CreateButton href="/compute/auto-scaling/create" label="Create Auto Scaling Group" />
        )
    }
  }

  const { title, description } = getPageInfo()

  return (
    <PageLayout 
      title={title} 
      description={description}
      headerActions={getHeaderActions()}
    >
      <div className="space-y-6">
        <VercelTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          size="lg"
        />

        {activeTab === "asg" && <AutoScalingGroupsSection />}
        {activeTab === "templates" && <TemplatesSection />}
      </div>
    </PageLayout>
  )
}