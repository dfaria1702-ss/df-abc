// Client component - dynamically imported

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink, AlertCircle, Info, Plus, X, Server, AlertTriangle, Download, ChevronDown, ChevronRight, Search, Check, HardDrive, Trash2, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { RequestHigherLimitsModal } from "@/components/modals/request-higher-limits-modal"
import {
  availableRegions,
  mockVPCs,
  mockSubnets,
  availableKubernetesVersions,
  calculateCosts,
  type ClusterConfiguration,
  type APIServerEndpoint
} from "@/lib/cluster-creation-data"
import { CreateVPCModal } from "@/components/modals/vm-creation-modals"

// Mock security groups data
const mockSecurityGroups = [
  { id: "sg-default", name: "default", description: "Default security group" },
  { id: "sg-web", name: "web-servers", description: "Security group for web servers" },
  { id: "sg-db", name: "database", description: "Security group for database servers" },
  { id: "sg-app", name: "application", description: "Security group for application servers" },
  { id: "sg-cache", name: "cache-servers", description: "Security group for cache servers" }
]

// Define interfaces at the top level
interface NodePool {
  id: string
  name: string
  instanceFlavor: string
  storageSize: number
  subnetId: string
  securityGroupId?: string
  desiredNodes: number
  minNodes: number
  maxNodes: number
  taints: Array<{ key: string; value: string; effect: string }>
  labels: Array<{ key: string; value: string }>
  tags: Array<{ key: string; value: string }>
  isDefault: boolean
}

interface Taint {
  key: string
  value: string
  effect: string
}

interface Label {
  key: string
  value: string
}

// Step Indicator Component
function StepIndicator({ currentStep }: { currentStep: "configuration" | "nodePoolsAndAddons" }) {
  const steps = [
    { id: "configuration", name: "Configuration" },
    { id: "nodePoolsAndAddons", name: "Node Pools & Add-ons" }
  ]

  const getStepIndex = (stepId: string) => steps.findIndex(step => step.id === stepId)
  const currentStepIndex = getStepIndex(currentStep)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-between w-[90%] max-w-2xl">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = index < currentStepIndex
          const isUpcoming = index > currentStepIndex

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                  ${isActive ? 'bg-primary border-primary text-primary-foreground' : ''}
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isUpcoming ? 'bg-muted border-muted-foreground/30 text-muted-foreground' : ''}
                `}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${isActive ? 'text-foreground' : isCompleted ? 'text-green-700' : 'text-muted-foreground'}`}>
                    {step.name}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-[2px] mx-4 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

export default function CreateClusterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<"configuration" | "nodePoolsAndAddons">("configuration")
  const [clusterCreationStarted, setClusterCreationStarted] = useState(false)
  const [showNavigationGuard, setShowNavigationGuard] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  
  const [configuration, setConfiguration] = useState<Partial<ClusterConfiguration>>({
    region: "",
    vpcId: "",
    subnetId: "",
    kubernetesVersion: "",
    apiServerEndpoint: {
      type: "public"
    },
    podCIDR: "10.244.0.0/16",
    serviceCIDR: "10.96.0.0/12"
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [costs, setCosts] = useState(calculateCosts(configuration))
  const [formTouched, setFormTouched] = useState(false)
  const [showCreateVPCModal, setShowCreateVPCModal] = useState(false)

  // Navigation guard - prevent accidental navigation when cluster creation started
  useEffect(() => {
    if (!clusterCreationStarted || step !== "nodePoolsAndAddons") {
      return
    }

    // Navigation interception - intercept sidebar navigation attempts
    const handleNavigationClick = (e: Event) => {
      const target = e.target as HTMLElement
      
      // Skip if it's within a modal or dialog
      if (target.closest('[role="dialog"]') || target.closest('.modal')) {
        return
      }
      
      // Skip if it's within the main page content (not sidebar)
      if (target.closest('main') && !target.closest('.sidebar')) {
        return
      }
      
      // Intercept anchor tags that would navigate away from create flow
      if (target.tagName === 'A' || target.closest('a')) {
        const anchor = (target.tagName === 'A' ? target : target.closest('a')) as HTMLAnchorElement
        const href = anchor.getAttribute('href')
        
        if (href && !href.includes('/kubernetes/clusters/create') && !href.startsWith('#') && !href.startsWith('mailto:')) {
          e.preventDefault()
          e.stopPropagation()
          setPendingNavigation(href)
          setShowNavigationGuard(true)
          return
        }
      }
      
      // Intercept navigation buttons
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = (target.tagName === 'BUTTON' ? target : target.closest('button')) as HTMLButtonElement
        const buttonText = button.textContent?.toLowerCase() || ''
        
        // Check for navigation keywords
        const navigationKeywords = [
          'dashboard', 'home', 'compute', 'storage', 'networking', 'kubernetes', 
          'security', 'ai', 'bhashik', 'models', 'maps', 'vpc', 'volumes'
        ]
        
        const hasNavText = navigationKeywords.some(keyword => buttonText.includes(keyword))
        
        if (hasNavText) {
          e.preventDefault()
          e.stopPropagation()
          setShowNavigationGuard(true)
          return
        }
      }
    }

    // Intercept browser back/forward navigation
    const handlePopState = (e: PopStateEvent) => {
      setShowNavigationGuard(true)
      // Push the current state back to prevent navigation
      window.history.pushState(null, '', window.location.href)
    }

    // Browser close/refresh guard - shows native browser dialog
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      return (e.returnValue = '')
    }

    // Add event listeners
    document.addEventListener('click', handleNavigationClick, true)
    document.addEventListener('mousedown', handleNavigationClick, true)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Push initial state for popstate detection
    window.history.pushState(null, '', window.location.href)

    return () => {
      document.removeEventListener('click', handleNavigationClick, true)
      document.removeEventListener('mousedown', handleNavigationClick, true)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [clusterCreationStarted, step])

  // Mock region availability data (same as VPC page)
  const regionAvailability = {
    "us-east-1": {
      name: "US East (N. Virginia)",
      resources: [
        { type: "CPU Instances", availability: "high" },
        { type: "GPU A40", availability: "high" },
        { type: "GPU RTX A5000", availability: "medium" },
        { type: "GPU RTX A6000", availability: "medium" },
        { type: "Storage", availability: "high" },
      ]
    },
    "us-west-2": {
      name: "US West (Oregon)",
      resources: [
        { type: "CPU Instances", availability: "high" },
        { type: "GPU A40", availability: "medium" },
        { type: "GPU RTX A5000", availability: "low" },
        { type: "GPU RTX A6000", availability: "low" },
        { type: "Storage", availability: "high" },
      ]
    },
    "eu-west-1": {
      name: "EU (Ireland)",
      resources: [
        { type: "CPU Instances", availability: "high" },
        { type: "GPU A40", availability: "high" },
        { type: "GPU RTX A5000", availability: "medium" },
        { type: "GPU RTX A6000", availability: "medium" },
        { type: "Storage", availability: "high" },
      ]
    },
    "ap-south-1": {
      name: "Asia Pacific (Mumbai)",
      resources: [
        { type: "CPU Instances", availability: "medium" },
        { type: "GPU A40", availability: "medium" },
        { type: "GPU RTX A5000", availability: "high" },
        { type: "GPU RTX A6000", availability: "high" },
        { type: "Storage", availability: "medium" },
      ]
    },
    "ap-southeast-1": {
      name: "Asia Pacific (Singapore)",
      resources: [
        { type: "CPU Instances", availability: "high" },
        { type: "GPU A40", availability: "low" },
        { type: "GPU RTX A5000", availability: "medium" },
        { type: "GPU RTX A6000", availability: "medium" },
        { type: "Storage", availability: "high" },
      ]
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "high": return "bg-green-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-gray-400"
      default: return "bg-gray-300"
    }
  }

  const getAvailabilityBars = (availability: string) => {
    const totalBars = 3
    const activeBars = availability === "high" ? 3 : availability === "medium" ? 2 : 1
    
    return Array.from({ length: totalBars }, (_, index) => (
      <div
        key={index}
        className={`h-1.5 w-6 rounded-sm ${
          index < activeBars ? getAvailabilityColor(availability) : "bg-gray-300"
        }`}
      />
    ))
  }

  // Filtered data based on selections
  const availableVPCs = configuration.region ? mockVPCs.filter(vpc => vpc.region === configuration.region) : []
  const availableSubnets = configuration.vpcId ? mockSubnets.filter(subnet => subnet.vpcId === configuration.vpcId) : []

  // Update costs when configuration changes
  useEffect(() => {
    setCosts(calculateCosts(configuration))
  }, [configuration])

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!configuration.region) {
      newErrors.region = "Region is required"
    }

    if (!configuration.vpcId) {
      newErrors.vpcId = "VPC is required"
    }

    if (!configuration.subnetId) {
      newErrors.subnets = "A subnet must be selected"
    }

    if (!configuration.kubernetesVersion) {
      newErrors.kubernetesVersion = "Kubernetes version is required"
    }



    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Check if form is valid
  const isFormValid = (): boolean => {
    return !!(
      configuration.region &&
      configuration.vpcId &&
      configuration.subnetId &&
      configuration.kubernetesVersion
    )
  }

  // Handle region change
  const handleRegionChange = (regionId: string) => {
    setConfiguration(prev => ({
      ...prev,
      region: regionId,
      vpcId: "", // Reset VPC when region changes
      subnetId: "" // Reset subnet when region changes
    }))
    setFormTouched(true)
  }

  // Handle VPC change
  const handleVPCChange = (vpcId: string) => {
    setConfiguration(prev => ({
      ...prev,
      vpcId,
      subnetId: "" // Reset subnet when VPC changes
    }))
  }

  // Handle subnet selection
  const handleSubnetChange = (subnetId: string) => {
    setConfiguration(prev => ({
      ...prev,
      subnetId: subnetId
    }))
  }

  // Handle API endpoint type change
  const handleAPIEndpointChange = (type: APIServerEndpoint["type"]) => {
    setConfiguration(prev => ({
      ...prev,
      apiServerEndpoint: {
        type
      }
    }))
  }

  // Handle form submission and start cluster creation
  const handleReviewConfiguration = () => {
    if (validateForm()) {
      // Start cluster creation
      setClusterCreationStarted(true)
      console.log("Starting cluster creation with configuration:", configuration)
      
      // Move to next step
      setStep("nodePoolsAndAddons")
    }
  }

  // Handle cluster completion
  const handleCompleteCluster = () => {
    // Finalize cluster setup with node pools and add-ons
    console.log("Completing cluster setup with node pools and add-ons")
    
    // Show success toast message
    toast({
      title: "Your cluster is being created🚀",
      description: "We've started provisioning your Kubernetes cluster. This includes setting up the control plane, configuring node pools, and installing default add-ons. The process may take a few minutes. You can safely navigate away, progress will continue in the background."
    })
    
    // Redirect back to Kubernetes dashboard
    router.push("/kubernetes")
  }

  // Handle cluster deletion from navigation guard
  const handleDeleteCluster = async () => {
    setIsDeleting(true)
    
    try {
      // In a real implementation, this would call the API to delete the cluster
      console.log("Deleting cluster...")
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Cluster Deleted Successfully",
        description: "The cluster has been deleted and billing has stopped."
      })
      
      // Reset states and navigate to pending destination or kubernetes dashboard
      setClusterCreationStarted(false)
      setShowNavigationGuard(false)
      
      const destination = pendingNavigation || "/kubernetes"
      setPendingNavigation(null)
      router.push(destination)
    } catch (error) {
      toast({
        title: "Failed to Delete Cluster",
        description: "There was an error deleting the cluster. Please try again or delete it manually from the dashboard.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle staying on current page
  const handleStayOnPage = () => {
    setShowNavigationGuard(false)
    setPendingNavigation(null)
  }

  // CIDR validation regex
  const isValidCIDR = (cidr: string): boolean => {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/
    if (!cidrRegex.test(cidr)) return false
    
    const [ip, prefix] = cidr.split('/')
    const prefixNum = parseInt(prefix)
    if (prefixNum < 0 || prefixNum > 32) return false
    
    const ipParts = ip.split('.').map(Number)
    return ipParts.every(part => part >= 0 && part <= 255)
  }

  // Render different views based on step
  if (step === "nodePoolsAndAddons") {
    return (
      <>
        <NodePoolsAndAddonsView 
          onBack={() => setStep("configuration")}
          onContinue={handleCompleteCluster}
          clusterCost={costs.cluster}
          clusterCreationStarted={clusterCreationStarted}
        />
        
        {/* Navigation Guard Modal - always rendered when cluster creation started */}
        <Dialog open={showNavigationGuard} onOpenChange={setShowNavigationGuard}>
          <DialogContent className="sm:max-w-md" style={{ boxShadow: 'rgba(31, 34, 37, 0.09) 0px 0px 0px 1px, rgba(0, 0, 0, 0.16) 0px 16px 40px -6px, rgba(0, 0, 0, 0.04) 0px 12px 24px -6px' }}>
            <DialogHeader className="space-y-3 pb-4">
              <DialogTitle className="text-base font-semibold text-black pr-8">
                Cluster creation in progress
              </DialogTitle>
              <hr className="border-border" />
            </DialogHeader>
            
            <div className="pt-2 pb-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your cluster is being created in the background. Once the cluster is ready, billing will begin and continue until you delete it from the dashboard.
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter className="flex gap-3 sm:justify-end" style={{ paddingTop: '.5rem' }}>
              <Button
                type="button"
                variant="outline"
                onClick={handleStayOnPage}
                className="min-w-20"
                disabled={isDeleting}
              >
                Go Back
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteCluster}
                className="min-w-20"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Cluster"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Main configuration view
  return (
    <PageLayout
      title="Set Up Your Cluster"
      description="Configure and deploy a new Kubernetes cluster with enterprise-grade reliability"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Configuration Form */}
        <div className="flex-1 space-y-6">
          <StepIndicator currentStep={step} />
          <Card>
            <CardContent className="space-y-6 pt-6">
              <form onSubmit={(e) => { e.preventDefault(); handleReviewConfiguration(); }}>
                {/* Region Selection */}
                <div className="mb-8">
                  <div className="mb-5">
                    <Label className="block mb-2 font-medium">
                      Region <span className="text-destructive">*</span>
                    </Label>
                    <Select value={configuration.region} onValueChange={handleRegionChange} required>
                      <SelectTrigger className={formTouched && !configuration.region ? 'border-red-300 bg-red-50' : ''}>
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                        <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                        <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                        <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                        <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Region Availability Display */}
                    {configuration.region && regionAvailability[configuration.region as keyof typeof regionAvailability] && (
                      <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs text-gray-900">
                            Resource Availability
                          </h4>
                          <span className="text-xs text-gray-500">
                            {regionAvailability[configuration.region as keyof typeof regionAvailability].name}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {regionAvailability[configuration.region as keyof typeof regionAvailability].resources.map((resource, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-xs text-gray-700">
                                {resource.type}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {getAvailabilityBars(resource.availability)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 bg-green-500 rounded-sm"></div>
                                <span>High</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 bg-yellow-500 rounded-sm"></div>
                                <span>Medium</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 bg-gray-400 rounded-sm"></div>
                                <span>Low</span>
                              </div>
                            </div>
                            <span>Updated 5 min ago</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {errors.region && (
                      <p className="text-sm text-red-600 mt-1">{errors.region}</p>
                    )}
                  </div>
                </div>

                {/* VPC Selection */}
                <div className="mb-8">
                  <VPCSelectorInline
                    value={configuration.vpcId || ""}
                    region={configuration.region || ""}
                    availableVPCs={availableVPCs}
                    onChange={(value) => {
                      if (value === "__create_new__") {
                        setShowCreateVPCModal(true)
                      } else {
                        handleVPCChange(value)
                      }
                    }}
                    error={errors.vpcId}
                  />
                </div>

                {/* Subnet Selection */}
                <div className="mb-8">
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="font-medium">
                        Subnet <span className="text-destructive">*</span>
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" align="start" className="max-w-sm">
                            <p className="text-sm">
                              <strong>Cluster Subnet:</strong> This subnet is for the cluster load balancer. Choosing a public subnet allows the load balancer to receive a public (floating) IP for internet access. Private subnets restrict the load balancer to an internal IP only.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {configuration.vpcId ? (
                      availableSubnets.length > 0 ? (
                        <Select 
                          value={configuration.subnetId || ""} 
                          onValueChange={handleSubnetChange}
                        >
                          <SelectTrigger className={`focus:ring-2 focus:ring-ring focus:ring-offset-2 ${errors.subnets ? "border-red-300 bg-red-50" : ""}`}>
                            <SelectValue placeholder="Select a subnet" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSubnets.map((subnet) => (
                              <SelectItem key={subnet.id} value={subnet.id}>
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{subnet.name}</span>
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs ${
                                        subnet.type === "Public" 
                                          ? "bg-blue-100 text-blue-800" 
                                          : "bg-orange-100 text-orange-800"
                                      }`}
                                    >
                                      {subnet.type}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground ml-2">
                                    {subnet.cidr} • {subnet.availabilityZone}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No subnets found in this VPC.{" "}
                            <Link 
                              href="/networking/vpc/create" 
                              className="text-primary hover:underline font-medium"
                            >
                              Create a new VPC →
                            </Link>
                          </AlertDescription>
                        </Alert>
                      )
                    ) : (
                      <div className="py-2 px-3 border border-input bg-background rounded-md text-sm text-muted-foreground/70 placeholder:text-muted-foreground">
                        Please select a VPC first to view available subnets
                      </div>
                    )}
                    {errors.subnets && (
                      <p className="text-sm text-red-600 mt-1">{errors.subnets}</p>
                    )}
                  </div>
                </div>

                {/* Kubernetes Version Selection */}
                <div className="mb-8">
                  <div className="mb-5">
                    <Label className="block mb-2 font-medium">
                      Kubernetes Version <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={configuration.kubernetesVersion}
                      onValueChange={(value) => setConfiguration(prev => ({ ...prev, kubernetesVersion: value }))}
                    >
                      <SelectTrigger className={`focus:ring-2 focus:ring-ring focus:ring-offset-2 ${errors.kubernetesVersion ? "border-red-300 bg-red-50" : ""}`}>
                        <SelectValue placeholder="Select a version" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableKubernetesVersions.map((version) => (
                          <SelectItem key={version.version} value={version.version}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{version.version}</span>
                                {version.isRecommended && (
                                  <Badge variant="secondary" className="text-xs">
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground ml-4">
                                EOL: {version.eolDate}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.kubernetesVersion && (
                      <p className="text-sm text-red-600 mt-1">{errors.kubernetesVersion}</p>
                    )}
                  </div>
                </div>

                {/* Network Configuration */}
                <div className="mb-8">
                  <div className="mb-5">
                    <h3 className="text-lg font-medium mb-4">Network Configuration</h3>
                    
                    {/* Pod CIDR and Service CIDR in same row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Pod CIDR */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="font-medium">
                            Pod CIDR <span className="text-destructive">*</span>
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>IP address range for pods in your worker nodes</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          value={configuration.podCIDR || ""}
                          onChange={(e) => setConfiguration(prev => ({ ...prev, podCIDR: e.target.value }))}
                          placeholder="10.244.0.0/16"
                          className={`font-mono ${errors.podCIDR ? "border-red-300 bg-red-50" : ""}`}
                        />
                        {errors.podCIDR && (
                          <p className="text-sm text-red-600 mt-1">{errors.podCIDR}</p>
                        )}
                      </div>

                      {/* Service CIDR */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="font-medium">
                            Service CIDR <span className="text-destructive">*</span>
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>IP address range for services which will be connected to the pods in your worker nodes</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          value={configuration.serviceCIDR || ""}
                          onChange={(e) => setConfiguration(prev => ({ ...prev, serviceCIDR: e.target.value }))}
                          placeholder="10.96.0.0/12"
                          className={`font-mono ${errors.serviceCIDR ? "border-red-300 bg-red-50" : ""}`}
                        />
                        {errors.serviceCIDR && (
                          <p className="text-sm text-red-600 mt-1">{errors.serviceCIDR}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Server Endpoint Settings */}
                <div className="mb-8">
                  <div className="mb-5">
                    <Label className="block mb-4 font-medium">
                      API Server Access
                    </Label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <RadioGroup
                        value={configuration.apiServerEndpoint?.type}
                        onValueChange={(value) => handleAPIEndpointChange(value as APIServerEndpoint["type"])}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="public" id="public" />
                          <Label htmlFor="public" className="flex-1">
                            <div className="font-medium">Public</div>
                            <div className="text-sm text-muted-foreground">
                              Accessible via internet
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>


                  </div>
                </div>
              </form>
            </CardContent>
            <div className="flex justify-end gap-4 px-6 pb-6">
              <Button
                type="button"
                variant="outline"
                className="hover:bg-secondary transition-colors"
                onClick={() => router.push("/kubernetes")}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                disabled={!isFormValid()}
                className={`transition-colors ${
                  isFormValid() 
                    ? 'bg-black text-white hover:bg-black/90' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleReviewConfiguration}
              >
                Start Cluster Creation
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Side Panel */}
        <div className="w-full md:w-80 space-y-6">
          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-normal">Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground" style={{ fontSize: '13px' }}>Choose the region closest to your users for better performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground" style={{ fontSize: '13px' }}>Use private subnets for enhanced security</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground" style={{ fontSize: '13px' }}>Select latest stable Kubernetes version for security patches</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground" style={{ fontSize: '13px' }}>Plan node pool sizing based on your workload requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground" style={{ fontSize: '13px' }}>Enable network policies for pod-to-pod communication control</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Estimated Costs */}
          <div 
            style={{
              borderRadius: '16px',
              border: '4px solid #FFF',
              background: 'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
              boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
              padding: '1.5rem'
            }}
          >
            <div className="pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Estimated Costs</h3>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cluster</span>
                  <div className="text-right">
                    <div className="font-medium">₹{costs.cluster.hourly.toFixed(2)}/hr</div>
                    <div className="text-xs text-muted-foreground">₹{costs.cluster.monthly.toFixed(2)}/mo</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center font-medium">
                  <span>Total</span>
                  <div className="text-right">
                    <div>₹{costs.cluster.hourly.toFixed(2)}/hr</div>
                    <div className="text-sm text-muted-foreground">₹{costs.cluster.monthly.toFixed(2)}/mo</div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p>• All other resources are preconfigured</p>
                <p>• Costs are estimates only</p>
                <p>• Actual billing may vary</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create VPC Modal */}
      <CreateVPCModal
        open={showCreateVPCModal}
        onClose={() => setShowCreateVPCModal(false)}
        onSuccess={(newVpcId) => {
          // Handle successful VPC creation
          handleVPCChange(newVpcId)
          setShowCreateVPCModal(false)
        }}
        preselectedRegion={configuration.region}
      />


    </PageLayout>
  )
}

// VPC Selector Component (similar to Create Volume page)
function VPCSelectorInline({ value, region, availableVPCs, onChange, error }: {
  value: string
  region: string
  availableVPCs: any[]
  onChange: (value: string) => void
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredVPCs = availableVPCs.filter(vpc =>
    vpc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vpc.id.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const selectedVPC = availableVPCs.find(vpc => vpc.id === value)
  
  return (
    <div className="mb-5">
      <Label className="block mb-2 font-medium">
        VPC <span className="text-destructive">*</span>
      </Label>
      {!region ? (
        <div className="py-2 px-3 border border-input bg-background rounded-md text-sm text-muted-foreground/70 placeholder:text-muted-foreground">
          Pick a region to see available VPCs
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`w-full flex items-center justify-between px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              error ? "border-red-300 bg-red-50" : ""
            }`}
          >
            <span className={selectedVPC ? "text-foreground" : "!text-[#64748b]"}>
              {selectedVPC ? `${selectedVPC.name} (${selectedVPC.cidr})` : "Select VPC to isolate your workload"}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
          {open && (
            <div className="absolute top-full left-0 right-0 z-50 bg-background border border-input rounded-md shadow-md mt-1">
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search VPCs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    onChange("__create_new__")
                    setOpen(false)
                  }}
                  className="w-full flex items-center px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm text-primary font-medium"
                >
                  Create new VPC
                </button>
                {filteredVPCs.map((vpc) => (
                  <button
                    key={vpc.id}
                    type="button"
                    onClick={() => {
                      onChange(vpc.id)
                      setOpen(false)
                      setSearchTerm("")
                    }}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{vpc.name}</span>
                      <span className="text-xs text-muted-foreground">{vpc.cidr} • {vpc.description}</span>
                    </div>
                    {value === vpc.id && <Check className="h-4 w-4" />}
                  </button>
                ))}
                {filteredVPCs.length === 0 && searchTerm && (
                  <div className="px-2 py-2 text-sm text-muted-foreground">
                    No VPCs found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}

// Combined Node Pools and Add-ons View Component
function NodePoolsAndAddonsView({ 
  onBack, 
  onContinue,
  clusterCost,
  clusterCreationStarted
}: { 
  onBack: () => void
  onContinue: () => void
  clusterCost: { hourly: number; monthly: number }
  clusterCreationStarted: boolean
}) {
  const { toast } = useToast()
  // Node Pools State
  const [nodePools, setNodePools] = useState<NodePool[]>([
    {
      id: "default-pool",
      name: "default-pool",
      instanceFlavor: "cpu-2x-8gb",
      storageSize: 50,
      subnetId: "",
      securityGroupId: undefined,
      desiredNodes: 2,
      minNodes: 1,
      maxNodes: 5,
      taints: [{ key: "", value: "", effect: "NoSchedule" }],
      labels: [{ key: "", value: "" }],
      tags: [{ key: "", value: "" }],
      isDefault: true
    }
  ])

  // Add-ons State
  const [defaultAddons, setDefaultAddons] = useState([
    {
      id: "cni",
      name: "CNI (Cilium – default)",
      description: "Handles pod networking and connectivity within the cluster.",
      version: "v1.15.3",
      enabled: true
    },
    {
      id: "csi",
      name: "CSI",
      description: "Manages storage provisioning and attachment for workloads.",
      version: "v1.9.2",
      enabled: true
    },
    {
      id: "coredns",
      name: "CoreDNS",
      description: "Provides internal DNS resolution for services and pods.",
      version: "v1.11.1",
      enabled: true
    },
    {
      id: "kube-proxy",
      name: "Kube-proxy",
      description: "Handles network proxying and load balancing for services.",
      version: "v1.29.0",
      enabled: true
    },
    {
      id: "dns-proxy",
      name: "DNS-proxy",
      description: "Optimizes DNS query handling for improved performance.",
      version: "v2.4.1",
      enabled: true
    }
  ])

  const [nextPoolId, setNextPoolId] = useState(2)
  const [yamlPreviewOpen, setYamlPreviewOpen] = useState(false)
  const [highlightedStorage, setHighlightedStorage] = useState<string | null>(null)
  const [draggingStorage, setDraggingStorage] = useState<string | null>(null)
  const [dragValue, setDragValue] = useState<number>(0)
  const [requestLimitsModalOpen, setRequestLimitsModalOpen] = useState(false)

  // Check if any add-ons are disabled
  const hasDisabledAddons = defaultAddons.some(addon => !addon.enabled)

  // Toggle add-on enabled/disabled
  const toggleAddon = (addonId: string) => {
    setDefaultAddons(prev => prev.map(addon => 
      addon.id === addonId ? { ...addon, enabled: !addon.enabled } : addon
    ))
  }

  // Instance flavors from the screenshot
  const instanceFlavors = [
    { id: "cpu-1x-4gb", name: "CPU-1x-4GB", vcpus: 1, ram: 4, pricePerHour: 3 },
    { id: "cpu-2x-8gb", name: "CPU-2x-8GB", vcpus: 2, ram: 8, pricePerHour: 6 },
    { id: "cpu-4x-16gb", name: "CPU-4x-16GB", vcpus: 4, ram: 16, pricePerHour: 13 },
    { id: "cpu-8x-32gb", name: "CPU-8x-32GB", vcpus: 8, ram: 32, pricePerHour: 25 },
    { id: "cpu-16x-64gb", name: "CPU-16x-64GB", vcpus: 16, ram: 64, pricePerHour: 49 },
    { id: "cpu-32x-128gb", name: "CPU-32x-128GB", vcpus: 32, ram: 128, pricePerHour: 97 }
  ]

  // Storage presets
  const storagePresets = [
    { size: 50, label: "50GB" },
    { size: 100, label: "100GB" },
    { size: 500, label: "500GB" },
    { size: 1000, label: "1TB" }
  ]

  // Storage notches for visual markers on slider
  const storageNotches = [50, 100, 250, 500, 1000, 1500, 2048]

  // Get selected instance flavor details
  const getSelectedFlavor = (flavorId: string) => {
    return instanceFlavors.find(f => f.id === flavorId) || instanceFlavors[1]
  }

  // Calculate costs
  const calculateCosts = useMemo(() => {
    let totalInstanceCost = 0
    let totalStorageCost = 0

    nodePools.forEach(pool => {
      const flavor = getSelectedFlavor(pool.instanceFlavor)
      const instanceCost = flavor.pricePerHour * pool.desiredNodes
      const storageCost = pool.storageSize * 0.0625 * pool.desiredNodes // ₹0.0625 per GB per hour
      
      totalInstanceCost += instanceCost
      totalStorageCost += storageCost
    })

    return {
      totalInstanceCost,
      totalStorageCost,
      clusterCost: clusterCost.hourly,
      totalCost: totalInstanceCost + totalStorageCost + clusterCost.hourly
    }
  }, [nodePools])

  // Add new node pool
  const addNodePool = () => {
    const newPool: NodePool = {
      id: `pool-${nextPoolId}`,
      name: `node-pool-${nextPoolId}`,
      instanceFlavor: "cpu-2x-8gb",
      storageSize: 50,
      subnetId: "",
      securityGroupId: undefined,
      desiredNodes: 1,
      minNodes: 1,
      maxNodes: 3,
      taints: [{ key: "", value: "", effect: "NoSchedule" }],
      labels: [{ key: "", value: "" }],
      tags: [{ key: "", value: "" }],
      isDefault: false
    }
    
    setNodePools([...nodePools, newPool])
    setNextPoolId(nextPoolId + 1)
  }

  // Remove node pool
  const removeNodePool = (poolId: string) => {
    if (nodePools.find(p => p.id === poolId)?.isDefault) {
      return // Cannot remove default pool
    }
    
    setNodePools(nodePools.filter(p => p.id !== poolId))
  }

  // Update node pool
  const updateNodePool = (poolId: string, updates: Partial<NodePool>) => {
    setNodePools(nodePools.map(pool => 
      pool.id === poolId ? { ...pool, ...updates } : pool
    ))
  }

  // Add taint
  const addTaint = (poolId: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        taints: [...pool.taints, { key: "", value: "", effect: "NoSchedule" }]
      })
    }
  }

  // Remove taint
  const removeTaint = (poolId: string, index: number) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        taints: pool.taints.filter((_, i) => i !== index)
      })
    }
  }

  // Update taint
  const updateTaint = (poolId: string, index: number, field: keyof Taint, value: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      const updatedTaints = pool.taints.map((taint, i) => 
        i === index ? { ...taint, [field]: value } : taint
      )
      updateNodePool(poolId, { taints: updatedTaints })
    }
  }

  // Add label
  const addLabel = (poolId: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        labels: [...pool.labels, { key: "", value: "" }]
      })
    }
  }

  // Remove label
  const removeLabel = (poolId: string, index: number) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        labels: pool.labels.filter((_, i) => i !== index)
      })
    }
  }

  // Update label
  const updateLabel = (poolId: string, index: number, field: keyof Label, value: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      const updatedLabels = pool.labels.map((label, i) => 
        i === index ? { ...label, [field]: value } : label
      )
      updateNodePool(poolId, { labels: updatedLabels })
    }
  }

  // Add tag
  const addTag = (poolId: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        tags: [...pool.tags, { key: "", value: "" }]
      })
    }
  }

  // Remove tag
  const removeTag = (poolId: string, index: number) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      updateNodePool(poolId, {
        tags: pool.tags.filter((_, i) => i !== index)
      })
    }
  }

  // Update tag
  const updateTag = (poolId: string, index: number, field: 'key' | 'value', value: string) => {
    const pool = nodePools.find(p => p.id === poolId)
    if (pool) {
      const newTags = [...pool.tags]
      newTags[index][field] = value
      updateNodePool(poolId, { tags: newTags })
    }
  }

  // Validation
  const validateForm = () => {
    for (const pool of nodePools) {
      // Check if name is provided
      if (!pool.name.trim()) {
        return false
      }
      // Check node count validation
      if (pool.minNodes < 0 || pool.maxNodes < pool.minNodes || pool.desiredNodes < pool.minNodes || pool.desiredNodes > pool.maxNodes) {
        return false
      }
    }
    return true
  }

  // Generate YAML preview
  const generateYAML = () => {
    const nodePoolsYAML = nodePools.map(pool => {
      const flavor = getSelectedFlavor(pool.instanceFlavor)
      let poolYAML = `  - name: ${pool.name}
    instanceType: ${flavor.name}
    vcpus: ${flavor.vcpus}
    memory: ${flavor.ram}GB
    storage: ${pool.storageSize}GB
    scaling:
      desired: ${pool.desiredNodes}
      min: ${pool.minNodes}
      max: ${pool.maxNodes}`

      // Add labels if any
      if (pool.labels.length > 0 && pool.labels.some(label => label.key && label.value)) {
        poolYAML += '\n    labels:'
        pool.labels.filter(label => label.key && label.value).forEach(label => {
          poolYAML += `\n      ${label.key}: "${label.value}"`
        })
      }

      // Add taints if any
      if (pool.taints.length > 0 && pool.taints.some(taint => taint.key && taint.value)) {
        poolYAML += '\n    taints:'
        pool.taints.filter(taint => taint.key && taint.value).forEach(taint => {
          poolYAML += `\n      - key: "${taint.key}"\n        value: "${taint.value}"\n        effect: ${taint.effect}`
        })
      }

      // Add tags if any
      if (pool.tags.length > 0 && pool.tags.some(tag => tag.key && tag.value)) {
        poolYAML += '\n    tags:'
        pool.tags.filter(tag => tag.key && tag.value).forEach(tag => {
          poolYAML += `\n      ${tag.key}: "${tag.value}"`
        })
      }

      return poolYAML
    }).join('\n')

    const yaml = `apiVersion: v1
kind: Cluster
metadata:
  name: mks-cluster
spec:
  nodePools:
${nodePoolsYAML}`
    
    return yaml
  }

  // Download YAML
  const downloadYAML = () => {
    const yaml = generateYAML()
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mks-cluster-spec.yaml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <PageLayout
      title="Node Pools & Add-ons"
      description="Configure node pools and cluster add-ons for your Kubernetes cluster"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Configuration Form */}
        <div className="flex-1 space-y-6">
          <StepIndicator currentStep="nodePoolsAndAddons" />
            {nodePools.map((pool, index) => (
              <Card key={pool.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-lg">
                          {pool.name}
                          {pool.isDefault && (
                            <Badge variant="secondary" className="ml-2">
                              Default Node Pool (required)
                            </Badge>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                    {!pool.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNodePool(pool.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Node Pool Name */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Node Pool Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={pool.name}
                      onChange={(e) => updateNodePool(pool.id, { name: e.target.value })}
                      placeholder="Enter node pool name (e.g., workers, database, gpu-nodes)"
                      className={`w-full ${!pool.name.trim() ? 'border-destructive focus:border-destructive' : ''}`}
                    />
                    {!pool.name.trim() && (
                      <p className="text-xs text-destructive">Node pool name is required</p>
                    )}
                  </div>

                  {/* Instance Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Instance Flavour <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={pool.instanceFlavor}
                      onValueChange={(value) => updateNodePool(pool.id, { instanceFlavor: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(() => {
                            const selectedFlavor = getSelectedFlavor(pool.instanceFlavor)
                            return (
                              <div className="flex items-center justify-between w-full pr-2">
                                <div className="flex items-center gap-4">
                                  <span className="font-medium">{selectedFlavor.name}</span>
                                  <span className="text-muted-foreground text-sm">
                                    {selectedFlavor.vcpus} vCPU • {selectedFlavor.ram} GB RAM
                                  </span>
                                </div>
                                <span className="text-primary font-semibold text-sm ml-6">
                                  ₹{selectedFlavor.pricePerHour}/hr
                                </span>
                              </div>
                            )
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {instanceFlavors.map((flavor) => (
                          <SelectItem key={flavor.id} value={flavor.id}>
                            <div className="flex items-center justify-between w-full min-w-[320px] py-1">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{flavor.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  {flavor.vcpus} vCPU • {flavor.ram} GB RAM
                                </span>
                              </div>
                              <span className="text-primary font-semibold text-sm ml-6">
                                ₹{flavor.pricePerHour}/hr
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Node Scaling */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Scaling Settings <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Min Nodes</Label>
                        <Input
                          type="number"
                          value={pool.minNodes}
                          onChange={(e) => updateNodePool(pool.id, { minNodes: Math.max(0, Number(e.target.value) || 0) })}
                          min={0}
                          className="text-center"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Desired Nodes</Label>
                        <Input
                          type="number"
                          value={pool.desiredNodes}
                          onChange={(e) => updateNodePool(pool.id, { desiredNodes: Math.max(1, Number(e.target.value) || 1) })}
                          min={1}
                          className="text-center"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Max Nodes</Label>
                        <Input
                          type="number"
                          value={pool.maxNodes}
                          onChange={(e) => updateNodePool(pool.id, { maxNodes: Math.max(1, Number(e.target.value) || 1) })}
                          min={1}
                          className="text-center"
                        />
                      </div>
                    </div>
                    
                    {/* Request Higher Node Limits Link */}
                    <div className="text-right">
                      <button 
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={() => setRequestLimitsModalOpen(true)}
                      >
                        Request Higher Limits
                      </button>
                    </div>
                    
                    {/* Validation */}
                    {pool.minNodes > pool.maxNodes && (
                      <p className="text-xs text-destructive">Min nodes cannot be greater than max nodes</p>
                    )}
                    {pool.desiredNodes < pool.minNodes && (
                      <p className="text-xs text-destructive">Desired nodes must be at least min nodes</p>
                    )}
                    {pool.desiredNodes > pool.maxNodes && (
                      <p className="text-xs text-destructive">Desired nodes must not exceed max nodes</p>
                    )}
                  </div>

                  {/* Bootable Volume Selection */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">
                      Bootable Volume <span className="text-destructive">*</span>
                    </Label>
                    
                    {/* Machine Image */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Machine Image</Label>
                      <Input
                        value="Ubuntu"
                        disabled
                        className="bg-muted text-muted-foreground cursor-not-allowed"
                        placeholder="Ubuntu"
                      />
                    </div>
                    
                    {/* Storage Size */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Storage Size (GB)</Label>
                    </div>

                    {/* Enhanced Storage Selection UI */}
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl space-y-5">
                      
                      {/* Input Field and Quick Select Row */}
                      <div className="flex items-center justify-between gap-6">
                        {/* Input Field - Left Side */}
                        <div className="flex items-center gap-3">
                          <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Manual Input</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={pool.storageSize}
                              onChange={(e) => {
                                const value = Math.max(50, Math.min(1024, Number(e.target.value) || 50))
                                updateNodePool(pool.id, { storageSize: value })
                                setTimeout(() => {
                                  setHighlightedStorage(pool.id)
                                  setTimeout(() => setHighlightedStorage(null), 2000)
                                }, 300)
                              }}
                              className={`w-32 h-10 text-center text-base font-semibold pr-10 border-2 transition-all duration-300 ${
                                highlightedStorage === pool.id 
                                  ? "border-green-500 bg-green-50" 
                                  : draggingStorage === pool.id
                                  ? "border-green-400 bg-green-50"
                                  : "border-slate-300 hover:border-slate-400"
                              }`}
                              min={50}
                              max={2048}
                              placeholder="Size"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">
                              GB
                            </span>
                          </div>
                        </div>

                        {/* Quick Select Buttons - Right Side */}
                        <div className="flex items-center gap-3">
                          <Label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Quick Select</Label>
                          <div className="flex gap-2">
                            {storagePresets.map((preset) => (
                              <Button
                                key={preset.size}
                                type="button"
                                variant={pool.storageSize === preset.size ? "default" : "outline"}
                                size="sm"
                                className={`h-9 px-3 text-sm font-medium transition-all duration-200 ${
                                  pool.storageSize === preset.size 
                                    ? "bg-primary text-primary-foreground shadow-md scale-105" 
                                    : "hover:scale-105 hover:shadow-sm"
                                }`}
                                onClick={() => {
                                  updateNodePool(pool.id, { storageSize: preset.size })
                                  setTimeout(() => {
                                    setHighlightedStorage(pool.id)
                                    setTimeout(() => setHighlightedStorage(null), 1500)
                                  }, 300)
                                }}
                              >
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Slider with Notches */}
                      <div className="space-y-4 pb-3">
                        <Label className="text-xs font-medium text-muted-foreground">Select size by dragging the slider</Label>
                        <div className="relative px-2 pb-8">
                          <Slider
                            value={[pool.storageSize]}
                            onValueChange={(value) => {
                              updateNodePool(pool.id, { storageSize: value[0] })
                              setDragValue(value[0])
                              if (!draggingStorage) {
                                setDraggingStorage(pool.id)
                              }
                            }}
                            onValueCommit={(value) => {
                              setDraggingStorage(null)
                              setTimeout(() => {
                                setHighlightedStorage(pool.id)
                                setTimeout(() => setHighlightedStorage(null), 2000)
                              }, 300)
                            }}
                            max={1024}
                            min={50}
                            step={25}
                            className="w-full"
                          />
                          
                          {/* Dragging Tooltip */}
                          {draggingStorage === pool.id && (
                            <div 
                              className="absolute pointer-events-none z-10 transform -translate-x-1/2 -translate-y-full"
                              style={{ 
                                left: `${((dragValue - 50) / (2048 - 50)) * 100}%`,
                                top: '-10px'
                              }}
                            >
                              <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg">
                                {dragValue} GB
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
                              </div>
                            </div>
                          )}
                          
                          {/* Notches */}
                          <div className="absolute top-8 left-0 right-0 pointer-events-none">
                            <div className="flex justify-between px-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-0.5 h-2 transition-all duration-200 ${
                                  Math.abs(pool.storageSize - 50) <= 25 ? "bg-primary" : "bg-slate-300"
                                }`} />
                                <span className={`text-xs mt-1 transition-all duration-200 ${
                                  Math.abs(pool.storageSize - 50) <= 25 ? "text-primary font-medium" : "text-muted-foreground"
                                }`}>
                                  50GB
                                </span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className={`w-0.5 h-2 transition-all duration-200 ${
                                  Math.abs(pool.storageSize - 1024) <= 25 ? "bg-primary" : "bg-slate-300"
                                }`} />
                                <span className={`text-xs mt-1 transition-all duration-200 ${
                                  Math.abs(pool.storageSize - 1024) <= 25 ? "text-primary font-medium" : "text-muted-foreground"
                                }`}>
                                  1TB
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Volume Size Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg py-2.5 px-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" style={{ marginTop: '1px' }} />
                        <p className="text-xs text-amber-800 leading-relaxed">
                          <strong>Note:</strong> Once chosen, storage size cannot be changed later. Please select carefully.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subnet Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Subnet <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={pool.subnetId} 
                      onValueChange={(value) => updateNodePool(pool.id, { subnetId: value })}
                    >
                      <SelectTrigger className={!pool.subnetId ? 'border-red-300 bg-red-50' : ''}>
                        <SelectValue placeholder="Select a subnet" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSubnets.map((subnet) => (
                          <SelectItem key={subnet.id} value={subnet.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{subnet.name}</span>
                              <Badge 
                                variant="secondary" 
                                className={`ml-2 text-xs ${
                                  subnet.type === 'Public' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}
                              >
                                {subnet.type}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!pool.subnetId && (
                      <p className="text-xs text-destructive">Please select a subnet</p>
                    )}
                  </div>

                  {/* Advanced Settings */}
                  <div>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="advanced-settings">
                        <AccordionTrigger className="text-base font-semibold">
                          Advanced Settings
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4 space-y-5">
                            {/* Security Group Selection */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">Security Group</Label>
                              <Select 
                                value={pool.securityGroupId || "none"} 
                                onValueChange={(value) => updateNodePool(pool.id, { securityGroupId: value === "none" ? undefined : value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a security group (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    <span className="text-muted-foreground">No security group</span>
                                  </SelectItem>
                                  {mockSecurityGroups.map((sg) => (
                                    <SelectItem key={sg.id} value={sg.id}>
                                      <div className="flex flex-col items-start">
                                        <span>{sg.name}</span>
                                        <span className="text-xs text-muted-foreground">{sg.description}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Taints */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">Taints</Label>
                      <div className="space-y-3">
                        {pool.taints.map((taint, index) => (
                                  <div key={index} className="grid grid-cols-3 gap-3">
                            <Input
                              placeholder="Key"
                              value={taint.key}
                                      onChange={(e) => updateTaint(pool.id, index, 'key', e.target.value)}
                                      className="text-xs"
                            />
                            <Input
                              placeholder="Value"
                              value={taint.value}
                                      onChange={(e) => updateTaint(pool.id, index, 'value', e.target.value)}
                                      className="text-xs"
                            />
                            <div className="flex gap-2">
                                      <Select 
                                value={taint.effect}
                                        onValueChange={(value) => updateTaint(pool.id, index, 'effect', value)}
                                      >
                                        <SelectTrigger className="text-xs">
                                          <SelectValue placeholder="Effect" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="NoSchedule">NoSchedule</SelectItem>
                                          <SelectItem value="PreferNoSchedule">PreferNoSchedule</SelectItem>
                                          <SelectItem value="NoExecute">NoExecute</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      {pool.taints.length > 1 ? (
                              <Button
                                type="button"
                                          variant="outline"
                                size="sm"
                                onClick={() => removeTaint(pool.id, index)}
                                          className="px-2"
                              >
                                          <X className="h-3 w-3" />
                              </Button>
                                      ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                                          onClick={() => addTaint(pool.id)}
                                          className="px-2"
                      >
                                          <Plus className="h-3 w-3" />
                      </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                    </div>
                    
                            {/* Labels */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">Labels</Label>
                      <div className="space-y-3">
                        {pool.labels.map((label, index) => (
                                  <div key={index} className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Key"
                              value={label.key}
                                      onChange={(e) => updateLabel(pool.id, index, 'key', e.target.value)}
                                      className="text-xs"
                            />
                            <div className="flex gap-2">
                              <Input
                                placeholder="Value"
                                value={label.value}
                                        onChange={(e) => updateLabel(pool.id, index, 'value', e.target.value)}
                                        className="text-xs"
                              />
                                      {pool.labels.length > 1 ? (
                              <Button
                                type="button"
                                          variant="outline"
                                size="sm"
                                onClick={() => removeLabel(pool.id, index)}
                                          className="px-2"
                              >
                                          <X className="h-3 w-3" />
                              </Button>
                                      ) : (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => addLabel(pool.id)}
                                          className="px-2"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      )}
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                              <Label className="text-sm font-medium">Tags</Label>
                              <div className="space-y-3">
                                {pool.tags.map((tag, index) => (
                                  <div key={index} className="grid grid-cols-2 gap-3">
                                    <Input
                                      placeholder="Key"
                                      value={tag.key}
                                      onChange={(e) => updateTag(pool.id, index, 'key', e.target.value)}
                                      className="text-xs"
                                    />
                    <div className="flex gap-2">
                      <Input
                                        placeholder="Value"
                                        value={tag.value}
                                        onChange={(e) => updateTag(pool.id, index, 'value', e.target.value)}
                                        className="text-xs"
                                      />
                                      {pool.tags.length > 1 ? (
                                        <Button 
                                          type="button" 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => removeTag(pool.id, index)}
                                          className="px-2"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      ) : (
                                        <Button 
                              type="button"
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => addTag(pool.id)}
                                          className="px-2"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                        ))}
                      </div>
                  </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>


                </CardContent>
              </Card>
            ))}

            {/* Add Node Pool Button */}
            <Card>
              <CardContent className="space-y-6 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addNodePool}
                  className="w-full h-16 border-dashed"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Node Pool
                </Button>
              </CardContent>
            </Card>

            {/* Add-ons Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Switch
                      checked={defaultAddons.every(addon => addon.enabled)}
                      onCheckedChange={(checked) => {
                        setDefaultAddons(prev => prev.map(addon => ({ ...addon, enabled: checked })))
                      }}
                    />
                    Cluster Add-ons
                  </CardTitle>
                </div>
                <CardDescription>
                  Essential cluster services that provide core functionality. These are recommended for most deployments.
                </CardDescription>
                {hasDisabledAddons && (
                  <Alert className="border-yellow-200 bg-yellow-50 mt-3 py-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" style={{ marginTop: '1px' }} />
                      <AlertDescription className="text-xs text-yellow-800 leading-relaxed">
                        <strong>Warning:</strong> Disabling essential add-ons may affect cluster functionality. Some features may not work as expected.
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {defaultAddons.map((addon) => (
                    <div 
                      key={addon.id} 
                      className={`p-4 border rounded-lg relative cursor-pointer transition-all hover:border-gray-300 ${
                        addon.enabled 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-card'
                      }`}
                      onClick={() => {
                        setDefaultAddons(prev => prev.map(a => 
                          a.id === addon.id ? { ...a, enabled: !a.enabled } : a
                        ))
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox positioned on the left */}
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          addon.enabled 
                            ? 'border-primary bg-primary' 
                            : 'border-gray-300'
                        }`}>
                          {addon.enabled && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        
                        {/* Title and version on the same line */}
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <div className="text-sm font-medium leading-none">
                            {addon.name}
                          </div>
                          <Badge variant="outline" className="text-xs font-medium ml-2">
                            {addon.version}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Description on separate line */}
                      <div className="mt-2 ml-8">
                        <p className="text-sm text-muted-foreground">
                          {addon.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={onBack}>
                    Back to Configuration
                  </Button>
                  <Button onClick={onContinue} disabled={!validateForm()} className="bg-black text-white hover:bg-black/90">
                    Complete Cluster Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Right Side Panel */}
        <div className="w-full md:w-80 space-y-6">

            {/* Cluster Creation Status & Billing Warning */}
            {clusterCreationStarted && (
              <Card 
                className="border-0"
                style={{
                  boxShadow: 'rgba(251, 146, 60, 0.1) 0px 0px 0px 1px inset',
                  background: 'linear-gradient(263deg, rgba(251, 146, 60, 0.08) 6.86%, rgba(251, 146, 60, 0.02) 96.69%)'
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex space-x-3">
                    <div className="flex items-center justify-center w-8 h-8" style={{ marginTop: '2px' }}>
                      <AlertTriangle className="h-4 w-4" style={{ color: 'rgb(194, 65, 12)' }} />
                    </div>
                    <div>
                      <CardTitle className="text-base leading-relaxed" style={{ color: 'rgb(194, 65, 12)' }}>
                        Cluster creation in progress
                      </CardTitle>
                      <CardDescription className="text-sm mt-2 leading-relaxed" style={{ color: 'rgb(194, 65, 12)', opacity: 0.8 }}>
                        Your cluster is being created in the background. Once it's ready, billing will begin and continue until you delete the cluster from the dashboard.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Cost Summary */}
            <div 
              style={{
                borderRadius: '16px',
                border: '4px solid #FFF',
                background: 'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
                boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
                padding: '1.5rem'
              }}
            >
              <div className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Cost Summary</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cluster</span>
                    <div className="text-right">
                      <div className="font-medium">₹{calculateCosts.clusterCost.toFixed(2)}/hr</div>
                      <div className="text-xs text-muted-foreground">₹{(calculateCosts.clusterCost * 24 * 30).toFixed(2)}/mo</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Instance Costs</span>
                    <div className="text-right">
                      <div className="font-medium">₹{calculateCosts.totalInstanceCost.toFixed(2)}/hr</div>
                      <div className="text-xs text-muted-foreground">₹{(calculateCosts.totalInstanceCost * 24 * 30).toFixed(2)}/mo</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Storage Costs</span>
                    <div className="text-right">
                      <div className="font-medium">₹{calculateCosts.totalStorageCost.toFixed(2)}/hr</div>
                      <div className="text-xs text-muted-foreground">₹{(calculateCosts.totalStorageCost * 24 * 30).toFixed(2)}/mo</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center font-medium">
                    <span>Total</span>
                    <div className="text-right">
                      <div>₹{calculateCosts.totalCost.toFixed(2)}/hr</div>
                      <div className="text-sm text-muted-foreground">₹{(calculateCosts.totalCost * 24 * 30).toFixed(2)}/mo</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <p>• All other resources are preconfigured</p>
                  <p>• Costs are estimates only</p>
                  <p>• Actual billing may vary</p>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Request Higher Limits Modal */}
      <RequestHigherLimitsModal
        open={requestLimitsModalOpen}
        onClose={() => setRequestLimitsModalOpen(false)}
      />
    </PageLayout>
  )
}

// Addons View Component
function AddonsView({ 
  onBack, 
  onContinue 
}: { 
  onBack: () => void
  onContinue: () => void
}) {
  // Default add-ons as specified in requirements
  const [defaultAddons, setDefaultAddons] = useState([
    {
      id: "cni",
      name: "CNI (Cilium – default)",
      description: "Handles pod networking and connectivity within the cluster.",
      version: "v1.15.3",
      enabled: true
    },
    {
      id: "csi",
      name: "CSI",
      description: "Manages storage provisioning and attachment for workloads.",
      version: "v1.9.2",
      enabled: true
    },
    {
      id: "coredns",
      name: "CoreDNS",
      description: "Provides internal DNS resolution for services and pods.",
      version: "v1.11.1",
      enabled: true
    },
    {
      id: "kube-proxy",
      name: "Kube-proxy",
      description: "Handles network proxying and load balancing for services.",
      version: "v1.29.0",
      enabled: true
    },
    {
      id: "dns-proxy",
      name: "DNS-proxy",
      description: "Optimizes DNS query handling for improved performance.",
      version: "v2.4.1",
      enabled: true
    }
  ])

  // Check if any add-ons are disabled
  const hasDisabledAddons = defaultAddons.some(addon => !addon.enabled)

  // Toggle add-on enabled/disabled
  const toggleAddon = (addonId: string) => {
    setDefaultAddons(prev => prev.map(addon => 
      addon.id === addonId ? { ...addon, enabled: !addon.enabled } : addon
    ))
  }

  // Validation
  const validateForm = () => {
    return true // No specific validation for addons yet
  }

  return (
    <PageLayout
      title="Add-ons"
      description="Krutrim installs essential Kubernetes components by default. You can disable any and install your own via CLI."
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Configuration Form */}
        <div className="flex-1 space-y-6">
            {/* Main Add-ons Configuration Card */}
            <Card>
              <CardContent className="space-y-6 pt-6">
                {/* Default Add-ons List */}
                <div className="space-y-3">
                  {defaultAddons.map((addon) => (
                    <div 
                      key={addon.id} 
                      className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${
                        addon.enabled 
                          ? "border-gray-200 hover:border-gray-300" 
                          : "border-gray-100 bg-gray-50 opacity-75"
                      }`}
                    >
                      <div className="flex items-center pt-0.5">
                        <button
                          type="button"
                          onClick={() => toggleAddon(addon.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            addon.enabled ? 'bg-primary' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                              addon.enabled ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium text-sm transition-colors duration-200 ${
                            addon.enabled ? "text-gray-900" : "text-gray-500"
                          }`}>
                            {addon.name}
                          </span>
                          <span className={`text-xs font-medium transition-colors duration-200 ${
                            addon.enabled ? "text-gray-900" : "text-gray-500"
                          }`}>
                            {addon.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <p className={`text-xs transition-colors duration-200 ${
                          addon.enabled ? "text-muted-foreground" : "text-gray-400"
                        }`}>
                          {addon.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Central Alert - Only show if any add-ons are disabled */}
                {hasDisabledAddons && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-medium">Action required</div>
                        <p>
                          You have disabled one or more default add-ons. Ensure you install compatible replacements via CLI (e.g., <code className="bg-muted px-1 py-0.5 rounded text-sm">kubectl</code>/Helm) so your cluster functions correctly.
                        </p>
                        <Link href="#" className="text-primary hover:underline text-sm">
                          Learn how →
                        </Link>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button variant="outline" onClick={onBack}>
                    Back
                  </Button>
                  <Button onClick={onContinue} className="bg-black text-white hover:bg-black/90">
                    Create Cluster
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Right Side Panel */}
        <div className="w-full md:w-80 space-y-6">
            {/* Node Pool Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-normal">Node Pool Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">default-pool</span>
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>CPU-2x-8GB • 2 nodes</div>
                    <div>100 GB storage</div>
                    <div>₹12.00/hour</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-normal">Configuration Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span>View YAML</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
{`apiVersion: v1
kind: Cluster
metadata:
  name: mks-cluster
spec:
  addons:
    cni: ${defaultAddons.find(a => a.id === 'cni')?.enabled ? 'enabled' : 'disabled'}
    csi: ${defaultAddons.find(a => a.id === 'csi')?.enabled ? 'enabled' : 'disabled'}
    coredns: ${defaultAddons.find(a => a.id === 'coredns')?.enabled ? 'enabled' : 'disabled'}
    kube-proxy: ${defaultAddons.find(a => a.id === 'kube-proxy')?.enabled ? 'enabled' : 'disabled'}
    dns-proxy: ${defaultAddons.find(a => a.id === 'dns-proxy')?.enabled ? 'enabled' : 'disabled'}`}
                      </pre>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download YAML
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <div 
              style={{
                borderRadius: '16px',
                border: '4px solid #FFF',
                background: 'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
                boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
                padding: '1.5rem'
              }}
            >
              <div className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Cost Summary</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Instance Costs</span>
                    <div className="text-right">
                      <div className="font-medium">₹12.00/hr</div>
                      <div className="text-xs text-muted-foreground">₹8,640/mo</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Storage Costs</span>
                    <div className="text-right">
                      <div className="font-medium">₹12.50/hr</div>
                      <div className="text-xs text-muted-foreground">₹9,000/mo</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Add-on Costs</span>
                    <div className="text-right">
                      <div className="font-medium">₹0.00/hr</div>
                      <div className="text-xs text-muted-foreground">₹0/mo</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center font-medium">
                    <span>Total</span>
                    <div className="text-right">
                      <div>₹24.50/hr</div>
                      <div className="text-sm text-muted-foreground">₹17,640/mo</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <p>• All other resources are preconfigured</p>
                  <p>• Costs are estimates only</p>
                  <p>• Actual billing may vary</p>
                </div>
              </div>
            </div>
        </div>
      </div>
    </PageLayout>
  )
}
