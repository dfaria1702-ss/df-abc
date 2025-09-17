"use client"

import type React from "react"

import { CreateSSHKeyModal } from "@/components/modals/vm-creation-modals"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ScalingPoliciesSection } from "../../create/components/scaling-policies-section"
import { ScriptsTagsSection } from "../../create/components/scripts-tags-section"
import { StorageSection } from "../../create/components/storage-section"

interface TemplateFormData {
  // Basic Information
  templateName: string

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


export default function CreateTemplatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showCreateSSHKeyModal, setShowCreateSSHKeyModal] = useState(false)

  const [formData, setFormData] = useState<TemplateFormData>({
    templateName: "",
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
