"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface ScalingPolicy {
  id: string;
  type: "Average CPU Utilization" | "Average Memory Utilization" | "Scheduled Action";
  upScaleTarget: number;
  downScaleTarget: number;
  scaleOutCooldown: number;
  scaleInCooldown: number;
  // Scheduled Action specific fields
  timezone?: string;
  scaleUpHours?: number;
  scaleUpMinutes?: number;
  scaleUpSeconds?: number;
  scaleDownHours?: number;
  scaleDownMinutes?: number;
  scaleDownSeconds?: number;
}

interface ScalingPoliciesSectionProps {
  scalingPolicies: ScalingPolicy[];
  onAddScalingPolicy: () => void;
  onUpdateScalingPolicy: (id: string, field: keyof Omit<ScalingPolicy, 'id'>, value: any) => void;
  onRemoveScalingPolicy: (id: string) => void;
}

// Helper function to get badge text from policy type
const getPolicyBadgeText = (type: "Average CPU Utilization" | "Average Memory Utilization" | "Scheduled Action") => {
  switch (type) {
    case "Average CPU Utilization":
      return "CPU";
    case "Average Memory Utilization":
      return "Memory";
    case "Scheduled Action":
      return "Scheduled";
    default:
      return "CPU";
  }
};

export function ScalingPoliciesSection({
  scalingPolicies,
  onAddScalingPolicy,
  onUpdateScalingPolicy,
  onRemoveScalingPolicy,
}: ScalingPoliciesSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Auto Scaling Policies</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Configure auto-scaling policies for CPU, memory, and scheduled actions. You can have one policy of each type (CPU, Memory, Scheduled).
        </p>
      </div>
      <div>
        {scalingPolicies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border border-gray-200 rounded-lg bg-gray-50">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-gray-400 rounded"></div>
              <div className="w-4 h-4 bg-gray-500 rounded -ml-1 mt-1"></div>
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4">
              No auto-scaling policies configured yet. Add your first policy to enable automatic scaling.
            </p>
            <Button size="sm" onClick={onAddScalingPolicy} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {scalingPolicies.map((policy, index) => (
              <div key={policy.id} className="p-4 border rounded-lg">
                  <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className="bg-gray-100 text-gray-800 font-medium"
                    >
                      {getPolicyBadgeText(policy.type)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveScalingPolicy(policy.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Policy Type</Label>
                    <Select
                      value={policy.type}
                      onValueChange={(value: "Average CPU Utilization" | "Average Memory Utilization" | "Scheduled Action") =>
                        onUpdateScalingPolicy(policy.id, 'type', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Average CPU Utilization">Average CPU Utilization</SelectItem>
                        <SelectItem value="Average Memory Utilization">Average Memory Utilization</SelectItem>
                        <SelectItem value="Scheduled Action">Scheduled Action</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="p-4 bg-gray-50/30 rounded-lg">
                      {policy.type === "Scheduled Action" ? (
                        <div className="space-y-4">
                          {/* Timezone */}
                          <div className="space-y-2">
                            <Label>Timezone <span className="text-red-500">*</span></Label>
                            <Select
                              value={policy.timezone || ""}
                              onValueChange={(value) => onUpdateScalingPolicy(policy.id, 'timezone', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="IST (Indian Standard Time)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IST">IST (Indian Standard Time)</SelectItem>
                                <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">Select the timezone for your scheduled actions</p>
                          </div>

                          {/* Scale Up Time */}
                          <div className="space-y-2">
                            <Label>Scale Up Time <span className="text-red-500">*</span></Label>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Hours</Label>
                                <Select
                                  value={policy.scaleUpHours?.toString() || ""}
                                  onValueChange={(value) => onUpdateScalingPolicy(policy.id, 'scaleUpHours', parseInt(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="00" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <SelectItem key={i} value={i.toString()}>
                                        {i.toString().padStart(2, '0')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Minutes</Label>
                                <Select
                                  value={policy.scaleUpMinutes?.toString() || ""}
                                  onValueChange={(value) => onUpdateScalingPolicy(policy.id, 'scaleUpMinutes', parseInt(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="00" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 60 }, (_, i) => (
                                      <SelectItem key={i} value={i.toString()}>
                                        {i.toString().padStart(2, '0')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Seconds</Label>
                                <Select
                                  value={policy.scaleUpSeconds?.toString() || ""}
                                  onValueChange={(value) => onUpdateScalingPolicy(policy.id, 'scaleUpSeconds', parseInt(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="00" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 60 }, (_, i) => (
                                      <SelectItem key={i} value={i.toString()}>
                                        {i.toString().padStart(2, '0')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Scale Down Time */}
                          <div className="space-y-2">
                            <Label>Scale Down Time <span className="text-red-500">*</span></Label>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Hours</Label>
                                <Select
                                  value={policy.scaleDownHours?.toString() || ""}
                                  onValueChange={(value) => onUpdateScalingPolicy(policy.id, 'scaleDownHours', parseInt(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="00" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <SelectItem key={i} value={i.toString()}>
                                        {i.toString().padStart(2, '0')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Minutes</Label>
                                <Select
                                  value={policy.scaleDownMinutes?.toString() || ""}
                                  onValueChange={(value) => onUpdateScalingPolicy(policy.id, 'scaleDownMinutes', parseInt(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="00" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 60 }, (_, i) => (
                                      <SelectItem key={i} value={i.toString()}>
                                        {i.toString().padStart(2, '0')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Seconds</Label>
                                <Select
                                  value={policy.scaleDownSeconds?.toString() || ""}
                                  onValueChange={(value) => onUpdateScalingPolicy(policy.id, 'scaleDownSeconds', parseInt(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="00" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 60 }, (_, i) => (
                                      <SelectItem key={i} value={i.toString()}>
                                        {i.toString().padStart(2, '0')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Warning message */}
                          <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="w-4 h-4 bg-gray-500 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                            <p className="text-sm text-gray-700">
                              Scale up and scale down times are identical. This may cause no scaling action to occur.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Up Scale Target Value (%)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={policy.upScaleTarget}
                              onChange={(e) =>
                                onUpdateScalingPolicy(policy.id, 'upScaleTarget', parseInt(e.target.value) || 80)
                              }
                              placeholder={policy.type === "Average CPU Utilization" || policy.type === "Average Memory Utilization" ? "70" : "80"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Down Scale Target Value (%)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={policy.downScaleTarget}
                              onChange={(e) =>
                                onUpdateScalingPolicy(policy.id, 'downScaleTarget', parseInt(e.target.value) || 20)
                              }
                              placeholder={policy.type === "Average CPU Utilization" || policy.type === "Average Memory Utilization" ? "40" : "20"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Scale Out Cooldown (seconds)</Label>
                            <Input
                              type="number"
                              min="60"
                              value={policy.scaleOutCooldown}
                              onChange={(e) =>
                                onUpdateScalingPolicy(policy.id, 'scaleOutCooldown', parseInt(e.target.value) || 300)
                              }
                              placeholder={policy.type === "Average CPU Utilization" || policy.type === "Average Memory Utilization" ? "180" : "300"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Scale In Cooldown (seconds)</Label>
                            <Input
                              type="number"
                              min="60"
                              value={policy.scaleInCooldown}
                              onChange={(e) =>
                                onUpdateScalingPolicy(policy.id, 'scaleInCooldown', parseInt(e.target.value) || 300)
                              }
                              placeholder="300"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button size="sm" onClick={onAddScalingPolicy} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
