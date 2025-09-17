"use client"

import type React from "react"

import { CreateSSHKeyModal } from "@/components/modals/vm-creation-modals"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { mockSubnets } from "@/lib/cluster-creation-data"
import { vpcs } from "@/lib/data"
import { Check, ChevronDown, Search, HelpCircle, Plus } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ScalingPoliciesSection } from "../../../create/components/scaling-policies-section"
import { ScriptsTagsSection } from "../../../create/components/scripts-tags-section"
import { StorageSection } from "../../../create/components/storage-section"

interface TemplateFormData {
  // Basic Information
  templateName: string

  // Network Configuration
  region: string
  vpc: string
  subnets: string[]
  securityGroups: string[]

  // Instance Configuration
  instanceName: string
  instanceType: string

  // Bootable Volume
  bootVolumeName: string
  bootVolumeSize: number
  machineImage: string

  // Storage Volumes
  storageVolumes: Array<{
    id: string
    name: string
    size: number
    type: string
  }>

  // SSH Key
  sshKey: string

  // Startup Script
  startupScript: string

  // Auto Scaling Policies
  scalingPolicies: Array<{
    id: string
    type: "Average CPU Utilization" | "Average Memory Utilization" | "Scheduled Action"
    upScaleTarget: number
    downScaleTarget: number
    scaleOutCooldown: number
    scaleInCooldown: number
    // Scheduled Action specific fields
    timezone?: string
    scaleUpHours?: number
    scaleUpMinutes?: number
    scaleUpSeconds?: number
    scaleDownHours?: number
    scaleDownMinutes?: number
    scaleDownSeconds?: number
  }>

  // Tags
  tags: Array<{
    key: string
    value: string
  }>
}

const instanceTypes = [
  { id: "cpu-1x-4gb", name: "CPU-1x-4GB", vcpus: 1, ram: 4, pricePerHour: 3 },
  { id: "cpu-2x-8gb", name: "CPU-2x-8GB", vcpus: 2, ram: 8, pricePerHour: 6 },
  { id: "cpu-4x-16gb", name: "CPU-4x-16GB", vcpus: 4, ram: 16, pricePerHour: 13 },
  { id: "cpu-8x-32gb", name: "CPU-8x-32GB", vcpus: 8, ram: 32, pricePerHour: 25 },
  { id: "cpu-16x-64gb", name: "CPU-16x-64GB", vcpus: 16, ram: 64, pricePerHour: 49 },
  { id: "cpu-32x-128gb", name: "CPU-32x-128GB", vcpus: 32, ram: 128, pricePerHour: 97 }
]

const machineImages = [
  { id: "ami-ubuntu-20.04", name: "Ubuntu 20.04 LTS", description: "Latest Ubuntu 20.04 LTS" },
  { id: "ami-ubuntu-22.04", name: "Ubuntu 22.04 LTS", description: "Latest Ubuntu 22.04 LTS" },
  { id: "ami-centos-7", name: "CentOS 7", description: "Latest CentOS 7" },
  { id: "ami-centos-8", name: "CentOS 8", description: "Latest CentOS 8" },
  { id: "ami-rhel-7", name: "Red Hat Enterprise Linux 7", description: "Latest RHEL 7" },
  { id: "ami-rhel-8", name: "Red Hat Enterprise Linux 8", description: "Latest RHEL 8" },
]

const sshKeys = [
  { id: "ssh-key-1", name: "my-key-pair" },
  { id: "ssh-key-2", name: "production-key" },
  { id: "ssh-key-3", name: "development-key" },
]

// Mock security groups data
const mockSecurityGroups = [
  { id: "sg-default", name: "default", description: "Default security group" },
  { id: "sg-web", name: "web-servers", description: "Security group for web servers" },
  { id: "sg-db", name: "database", description: "Security group for database servers" },
  { id: "sg-app", name: "application", description: "Security group for application servers" },
  { id: "sg-cache", name: "cache-servers", description: "Security group for cache servers" }
]

// Mock region availability data (same as cluster page)
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
      className={`h-1.5 w-6 rounded-sm ${index < activeBars ? getAvailabilityColor(availability) : "bg-gray-300"
        }`}
    />
  ))
}

// Mock function to fetch template data
const fetchTemplateData = async (id: string): Promise<TemplateFormData> => {
  // This would normally fetch from an API
  return {
    templateName: "Production Template",
    region: "us-east-1",
    vpc: "vpc-1",
    subnets: ["subnet-1"],
    securityGroups: ["sg-default", "sg-web"],
    instanceName: "prod-instance",
    instanceType: "cpu-4x-16gb",
    bootVolumeName: "prod-boot-volume",
    bootVolumeSize: 50,
    machineImage: "ami-ubuntu-22.04",
    storageVolumes: [
      {
        id: "vol-1",
        name: "data-volume",
        size: 100,
        type: "Standard"
      }
    ],
    sshKey: "ssh-key-2",
    startupScript: "#!/bin/bash\necho 'Hello World'",
    scalingPolicies: [
      {
        id: "policy-1",
        type: "Average CPU Utilization",
        upScaleTarget: 70,
        downScaleTarget: 40,
        scaleOutCooldown: 180,
        scaleInCooldown: 300
      }
    ],
    tags: [
      { key: "Environment", value: "Production" },
      { key: "Team", value: "DevOps" }
    ]
  }
}

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [showCreateSSHKeyModal, setShowCreateSSHKeyModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<TemplateFormData>({
    templateName: "",
    region: "",
    vpc: "",
    subnets: [],
    securityGroups: [],
    instanceName: "",
    instanceType: "",
    bootVolumeName: "",
    bootVolumeSize: 20,
    machineImage: "",
    storageVolumes: [],
    sshKey: "",
    startupScript: "",
    scalingPolicies: [],
    tags: [],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load template data on mount
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true)
        const templateData = await fetchTemplateData(params.id as string)
        setFormData(templateData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load template data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadTemplate()
    }
  }, [params.id, toast])

  const handleInputChange = (field: keyof TemplateFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddStorageVolume = () => {
    const newVolume = {
      id: `volume-${Date.now()}`,
      name: "",
      size: 50,
      type: "Standard"
    }
    setFormData(prev => ({
      ...prev,
      storageVolumes: [...prev.storageVolumes, newVolume]
    }))
  }

  const handleRemoveStorageVolume = (id: string) => {
    setFormData(prev => ({
      ...prev,
      storageVolumes: prev.storageVolumes.filter(vol => vol.id !== id)
    }))
  }

  const handleUpdateStorageVolume = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      storageVolumes: prev.storageVolumes.map(vol =>
        vol.id === id ? { ...vol, [field]: value } : vol
      )
    }))
  }

  const handleAddScalingPolicy = () => {
    const newPolicy = {
      id: `policy-${Date.now()}`,
      type: "Average CPU Utilization" as const,
      upScaleTarget: 70,
      downScaleTarget: 40,
      scaleOutCooldown: 180,
      scaleInCooldown: 300,
    }
    setFormData(prev => ({
      ...prev,
      scalingPolicies: [...prev.scalingPolicies, newPolicy]
    }))
  }

  const handleRemoveScalingPolicy = (id: string) => {
    setFormData(prev => ({
      ...prev,
      scalingPolicies: prev.scalingPolicies.filter(policy => policy.id !== id)
    }))
  }

  const handleUpdateScalingPolicy = (id: string, field: keyof Omit<TemplateFormData['scalingPolicies'][0], 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      scalingPolicies: prev.scalingPolicies.map(policy =>
        policy.id === id ? { ...policy, [field]: value } : policy
      )
    }))
  }

  const handleAddTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, { key: "", value: "" }]
    }))
  }

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateTag = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) =>
        i === index ? { ...tag, [field]: value } : tag
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.templateName.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Success",
        description: "Template updated successfully!",
      })
      
      router.push("/compute/auto-scaling/templates")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/compute/auto-scaling/templates")
  }

  const selectedVPC = vpcs.find(vpc => vpc.id === formData.vpc)
  
  // Map VPC IDs to cluster creation VPC IDs for subnet data
  const vpcIdMapping: Record<string, string> = {
    'vpc-1': 'vpc-bangalore-1',
    'vpc-2': 'vpc-bangalore-2', 
    'vpc-3': 'vpc-hyderabad-1',
    'vpc-16': 'vpc-bangalore-1',
    'vpc-17': 'vpc-bangalore-2'
  }

  // Use the same subnet data as cluster creation
  const mappedVpcId = selectedVPC ? vpcIdMapping[selectedVPC.id] : null
  const availableSubnets = mappedVpcId ? mockSubnets.filter(subnet => subnet.vpcId === mappedVpcId) : []

  if (loading) {
    return (
      <PageLayout
        title="Edit Template"
        description="Edit your Auto Scaling Group template configuration"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading template...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Edit Template"
      description="Edit your Auto Scaling Group template configuration"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex gap-6">
          {/* Left Form */}
          <div className="flex-1">
            <Card>
              <CardContent className="space-y-6 pt-6">
                {/* Template Name */}
                <div className="space-y-2">
                  <Label htmlFor="templateName">
                    Template Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="templateName"
                    placeholder="Enter template name"
                    value={formData.templateName}
                    onChange={(e) => handleInputChange("templateName", e.target.value)}
                    required
                  />
                </div>

                <Separator />

                {/* Instance Configuration */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Instance Configuration</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="instanceName">
                        Instance Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="instanceName"
                        placeholder="Enter instance name"
                        value={formData.instanceName}
                        onChange={(e) => handleInputChange("instanceName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instanceType">
                        Instance Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.instanceType}
                        onValueChange={(value) => handleInputChange("instanceType", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Instance Type">
                            {(() => {
                              const selectedType = instanceTypes.find(t => t.id === formData.instanceType)
                              if (!selectedType) return null
                              return (
                                <div className="flex items-center justify-between w-full pr-2">
                                  <div className="flex items-center gap-4">
                                    <span className="font-medium">{selectedType.name}</span>
                                    <span className="text-muted-foreground text-sm">
                                      {selectedType.vcpus} vCPU • {selectedType.ram} GB RAM
                                    </span>
                                  </div>
                                  <span className="text-primary font-semibold text-sm ml-6">
                                    ₹{selectedType.pricePerHour}/hr
                                  </span>
                                </div>
                              )
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {instanceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center justify-between w-full min-w-[320px] py-1">
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium">{type.name}</span>
                                  <span className="text-muted-foreground text-xs">
                                    {type.vcpus} vCPU • {type.ram} GB RAM
                                  </span>
                                </div>
                                <span className="text-primary font-semibold text-sm ml-6">
                                  ₹{type.pricePerHour}/hr
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Storage Section */}
                <StorageSection
                  bootVolumeName={formData.bootVolumeName}
                  bootVolumeSize={formData.bootVolumeSize}
                  machineImage={formData.machineImage}
                  storageVolumes={formData.storageVolumes}
                  onUpdateBootVolumeName={(value) => handleInputChange("bootVolumeName", value)}
                  onUpdateBootVolumeSize={(value) => handleInputChange("bootVolumeSize", value)}
                  onUpdateMachineImage={(value) => handleInputChange("machineImage", value)}
                  onAddStorageVolume={handleAddStorageVolume}
                  onRemoveStorageVolume={handleRemoveStorageVolume}
                  onUpdateStorageVolume={handleUpdateStorageVolume}
                />

                {/* Scripts and Tags Section */}
                <ScriptsTagsSection
                  sshKey={formData.sshKey}
                  startupScript={formData.startupScript}
                  tags={formData.tags}
                  onUpdateSshKey={(value) => handleInputChange("sshKey", value)}
                  onUpdateStartupScript={(value) => handleInputChange("startupScript", value)}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                  onUpdateTag={handleUpdateTag}
                  onCreateSSHKey={() => setShowCreateSSHKeyModal(true)}
                />

                {/* Network Configuration - READ ONLY */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Network Configuration</Label>
                  
                  {/* Row 1: Region - DISABLED */}
                  <div className="space-y-2">
                    <Label htmlFor="region">
                      Region <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.region} disabled>
                      <SelectTrigger className="bg-gray-50 cursor-not-allowed">
                        <SelectValue placeholder="Select a Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                        <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                        <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                        <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                        <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Region cannot be changed after template creation</p>
                  </div>

                  {/* Resource Availability - appears below Region when selected */}
                  {formData.region && regionAvailability[formData.region as keyof typeof regionAvailability] && (
                    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm opacity-60">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs text-gray-900">Resource Availability</h4>
                        <span className="text-xs text-gray-500">
                          {regionAvailability[formData.region as keyof typeof regionAvailability].name}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {regionAvailability[formData.region as keyof typeof regionAvailability].resources.map((resource, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-xs text-gray-700">{resource.type}</span>
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

                  {/* Row 2: VPC - DISABLED */}
                  <div className="space-y-2">
                    <Label htmlFor="vpc">
                      VPC <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="w-full flex items-center justify-between px-3 py-2 border border-input rounded-md text-sm bg-gray-50 cursor-not-allowed opacity-60">
                        <span className="text-foreground">
                          {selectedVPC ? `${selectedVPC.name} (${selectedVPC.region})` : "No VPC selected"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">VPC cannot be changed after template creation</p>
                  </div>

                  {/* Row 3: Subnet - DISABLED */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="subnet">
                        Subnet <span className="text-red-500">*</span>
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" align="start" className="max-w-sm">
                            <p className="text-sm">
                              <strong>Template Subnet:</strong> This subnet determines where instances will be launched from this template. Subnet cannot be changed after template creation.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select value={formData.subnets[0] || ""} disabled>
                      <SelectTrigger className="bg-gray-50 cursor-not-allowed opacity-60">
                        <SelectValue placeholder="Select a Subnet" />
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
                    <p className="text-xs text-muted-foreground">Subnet cannot be changed after template creation</p>
                  </div>

                  {/* Row 4: Security Groups - EDITABLE */}
                  <div className="space-y-3">
                    <Label>Security Groups</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mockSecurityGroups.map(sg => {
                        const isSelected = formData.securityGroups.includes(sg.id)
                        return (
                          <div
                            key={sg.id}
                            onClick={() => {
                              const currentSGs = formData.securityGroups
                              if (isSelected) {
                                // Remove from selection
                                handleInputChange("securityGroups", currentSGs.filter(id => id !== sg.id))
                              } else {
                                // Add to selection
                                handleInputChange("securityGroups", [...currentSGs, sg.id])
                              }
                            }}
                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                              isSelected 
                                ? 'border-primary bg-primary/5 shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    isSelected 
                                      ? 'border-primary bg-primary' 
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <Check className="w-2.5 h-2.5 text-white" />
                                    )}
                                  </div>
                                  <h4 className="font-medium text-sm">{sg.name}</h4>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 ml-6">{sg.description}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Auto Scaling Policies Section */}
                <ScalingPoliciesSection
                  scalingPolicies={formData.scalingPolicies}
                  onAddScalingPolicy={handleAddScalingPolicy}
                  onRemoveScalingPolicy={handleRemoveScalingPolicy}
                  onUpdateScalingPolicy={handleUpdateScalingPolicy}
                />

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating Template..." : "Update Template"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-normal">Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-muted-foreground">
                      Use descriptive template names to easily identify configurations
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-muted-foreground">
                      Test your scaling policies with different workloads before production use
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-muted-foreground">
                      Configure appropriate cooldown periods to prevent rapid scaling
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-muted-foreground">
                      Use tags to organize and track your templates effectively
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-muted-foreground">
                      Note: Network settings (Region, VPC, Subnet) cannot be modified after creation
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

          </div>
        </div>
      </form>

      <CreateSSHKeyModal
        open={showCreateSSHKeyModal}
        onClose={() => setShowCreateSSHKeyModal(false)}
        onSuccess={(sshKeyId: string) => {
          handleInputChange("sshKey", sshKeyId)
          setShowCreateSSHKeyModal(false)
        }}
      />
    </PageLayout>
  )
}
