"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface RequestHigherLimitsModalProps {
  open: boolean
  onClose: () => void
}

export function RequestHigherLimitsModal({ open, onClose }: RequestHigherLimitsModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    requirements: "",
    useCase: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.requirements.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Request Submitted Successfully! 🎉",
        description: "Your request for higher node scaling limits has been submitted. Our team will review it and get back to you within 24 hours.",
      })
      
      // Reset form and close modal
      setFormData({
        name: "",
        organization: "",
        email: "",
        requirements: "",
        useCase: ""
      })
      onClose()
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Request Higher Limits For Node Scaling
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
              disabled={isSubmitting}
              className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization" className="text-sm font-medium">
              Organisation Name
            </Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => handleInputChange("organization", e.target.value)}
              placeholder="Enter your organization name"
              disabled={isSubmitting}
              className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={isSubmitting}
              className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements" className="text-sm font-medium">
              Node Scaling Requirements <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              placeholder="Describe your specific node scaling requirements (e.g., maximum nodes needed, scaling patterns, etc.)"
              required
              disabled={isSubmitting}
              rows={3}
              className="focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="useCase" className="text-sm font-medium">
              Use Case
            </Label>
            <Textarea
              id="useCase"
              value={formData.useCase}
              onChange={(e) => handleInputChange("useCase", e.target.value)}
              placeholder="Describe your use case and why you need higher limits (optional)"
              disabled={isSubmitting}
              rows={3}
              className="focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
            />
          </div>

          <DialogFooter className="flex gap-3 sm:justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
