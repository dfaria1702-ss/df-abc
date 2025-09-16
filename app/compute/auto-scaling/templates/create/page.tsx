"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, ChevronDown, HelpCircle, Check, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper"
import { CreateVPCModal } from "@/components/modals/vm-creation-modals"
import { vpcs } from "@/lib/data"
import { mockSubnets } from "@/lib/cluster-creation-data"
import { StorageSection } from "../../create/components/storage-section"
import { ScriptsTagsSection } from "../../create/components/scripts-tags-section"
import { ScalingPoliciesSection } from "../../create/components/scaling-policies-section"

interface TemplateFormData {
  // Basic Information
  templateName: string
  templateDescription: string
  
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
  }>
  
  // SSH Key
  sshKey: string
  
  // Startup Script
  startupScript: string
  
  // Auto Scaling Policies
  scalingPolicies: Array<{
    id: string
    type: "CPU" | "Memory" | "Scheduled"
    upScaleTarget: number
    downScaleTarget: number
    scaleOutCooldown: number
    scaleInCooldown: number
  }>
  
  // Tags
  tags: Array<{
    key: string
    value: string
  }>
}

const instanceTypes = [
  { id: "t2.micro", name: "t2.micro", vcpus: 1, memory: "1 GB", pricePerHour: 0.0116 },
  { id: "t2.small", name: "t2.small", vcpus: 1, memory: "2 GB", pricePerHour: 0.023 },
  { id: "t2.medium", name: "t2.medium", vcpus: 2, memory: "4 GB", pricePerHour: 0.0464 },
  { id: "t2.large", name: "t2.large", vcpus: 2, memory: "8 GB", pricePerHour: 0.0928 },
  { id: "t2.xlarge", name: "t2.xlarge", vcpus: 4, memory: "16 GB", pricePerHour: 0.1856 },
  { id: "t2.2xlarge", name: "t2.2xlarge", vcpus: 8, memory: "32 GB", pricePerHour: 0.3712 },
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

export default function CreateTemplatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showCreateVPCModal, setShowCreateVPCModal] = useState(false)
  
  const [formData, setFormData] = useState<TemplateFormData>({
    templateName: "",
    templateDescription: "",
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
      size: 10
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
      type: "CPU" as const,
      upScaleTarget: 80,
      downScaleTarget: 20,
      scaleOutCooldown: 300,
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

  const handleUpdateScalingPolicy = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      scalingPolicies: prev.scalingPolicies.map(policy =>
        policy.id === id ? { ...policy, [field]: value } : policy
      )
    }))
  }

  const handleAddTag = () => {
    const newTag = {
      key: "",
      value: ""
    }
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag]
    }))
  }

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateTag = (index: number, field: "key" | "value", value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) =>
        i === index ? { ...tag, [field]: value } : tag
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Template Created",
        description: `Template "${formData.templateName}" has been created successfully.`,
      })
      
      router.push("/compute/auto-scaling")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/compute/auto-scaling")
  }

  return (
    <PageLayout
      title="Create Template"
      description="Create a new Auto Scaling Group template for reusable configurations"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex gap-6">
          {/* Left Form */}
          <div className="flex-1">
            <Card>
              <CardContent className="space-y-6 pt-6">
                {/* Template Configuration */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Template Configuration</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="space-y-2">
                      <Label htmlFor="templateDescription">Description</Label>
                      <Input
                        id="templateDescription"
                        placeholder="Enter template description"
                        value={formData.templateDescription}
                        onChange={(e) => handleInputChange("templateDescription", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Network Configuration */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Network Configuration</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="region">
                        Region <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                          <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                          <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                          <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vpc">
                        VPC <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.vpc} 
                        onValueChange={(value) => handleInputChange("vpc", value)}
                        disabled={!formData.region}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formData.region ? "Select VPC" : "Select region first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {vpcs.map((vpc) => (
                            <SelectItem key={vpc.id} value={vpc.id}>
                              {vpc.name}
                            </SelectItem>
                          ))}
                          <Separator className="my-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => setShowCreateVPCModal(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New VPC
                          </Button>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subnets">
                      Subnets <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.subnets[0] || ""} 
                      onValueChange={(value) => handleInputChange("subnets", [value])}
                      disabled={!formData.vpc}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.vpc ? "Select subnet" : "Select VPC first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSubnets
                          .filter(subnet => subnet.vpcId === formData.vpc)
                          .map((subnet) => (
                            <SelectItem key={subnet.id} value={subnet.id}>
                              {subnet.name} ({subnet.cidr}) - {subnet.availabilityZone}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="securityGroups">Security Groups</Label>
                    <div className="border border-gray-200 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <div className="w-6 h-6 bg-gray-400 rounded"></div>
                        </div>
                        <p className="text-sm">No security groups configured</p>
                        <p className="text-xs">Security groups will be inherited from the VPC</p>
                      </div>
                    </div>
                  </div>
                </div>

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
                      <Select value={formData.instanceType} onValueChange={(value) => handleInputChange("instanceType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select instance type" />
                        </SelectTrigger>
                        <SelectContent>
                          {instanceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{type.name}</span>
                                <span className="text-muted-foreground text-sm">
                                  {type.vcpus} vCPUs, {type.memory}
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
                />

                {/* Auto Scaling Policies Section */}
                <ScalingPoliciesSection
                  scalingPolicies={formData.scalingPolicies}
                  onAddScalingPolicy={handleAddScalingPolicy}
                  onRemoveScalingPolicy={handleRemoveScalingPolicy}
                  onUpdateScalingPolicy={handleUpdateScalingPolicy}
                />
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
                    <span className="text-muted-foreground" style={{ fontSize: '13px' }}>Use descriptive names that include environment and purpose (e.g., prod-web-servers-template).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground" style={{ fontSize: '13px' }}>Include comprehensive documentation in the description field.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground" style={{ fontSize: '13px' }}>Configure standardized instance types and storage configurations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground" style={{ fontSize: '13px' }}>Use tags to categorize templates by environment, team, or project.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground" style={{ fontSize: '13px' }}>Test templates thoroughly before making them available to teams.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Template Preview */}
            <div 
              className="sticky top-6"
              style={{
                borderRadius: '16px',
                border: '4px solid #FFF',
                background: 'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
                boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
                padding: '1.5rem'
              }}
            >
              <div className="pb-4">
                <h3 className="text-base font-semibold">Template Preview</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold">
                    {formData.templateName || "Untitled Template"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.templateDescription || "No description provided"}
                </p>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <p>• Instance Type: {formData.instanceType || "Not selected"}</p>
                  <p>• Storage: {formData.bootVolumeSize}GB + {formData.storageVolumes.reduce((sum, vol) => sum + vol.size, 0)}GB additional</p>
                  <p>• Policies: {formData.scalingPolicies.length} configured</p>
                  <p>• Tags: {formData.tags.length} applied</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox id="saveAsTemplate" defaultChecked />
            <Label htmlFor="saveAsTemplate" className="text-sm font-normal">
              Save as reusable template
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Template..." : "Create Template"}
            </Button>
          </div>
        </div>
      </form>

      <CreateVPCModal
        open={showCreateVPCModal}
        onClose={() => setShowCreateVPCModal(false)}
        onSuccess={() => {
          setShowCreateVPCModal(false)
          // Refresh VPC list or handle success
        }}
      />
    </PageLayout>
  )
}
