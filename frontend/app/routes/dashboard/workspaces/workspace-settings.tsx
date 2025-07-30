import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useGetWorkspaceDetailsQuery,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
} from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { Settings, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";

const WORKSPACE_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#eab308", // yellow
  "#a855f7", // purple
  "#f97316", // orange
  "#10b981", // emerald
  "#475569", // slate
];

const WorkspaceSettings = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#22c55e",
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: workspace, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace;
    isLoading: boolean;
  };

  const updateWorkspaceMutation = useUpdateWorkspaceMutation();
  const deleteWorkspaceMutation = useDeleteWorkspaceMutation();

  // Populate form when workspace data loads
  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name || "",
        description: workspace.description || "",
        color: workspace.color || "#22c55e",
      });
    }
  }, [workspace]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!workspaceId) return;
    
    if (!formData.name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    try {
      await updateWorkspaceMutation.mutateAsync({
        workspaceId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
      });
      
      toast.success("Workspace settings updated successfully");
    } catch (error) {
      toast.error("Failed to update workspace settings");
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId) return;

    try {
      await deleteWorkspaceMutation.mutateAsync(workspaceId);
      
      toast.success("Workspace deleted successfully");
      
      navigate("/workspaces");
    } catch (error) {
      toast.error("Failed to delete workspace");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!workspace) {
    return <div>Workspace not found</div>;
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="size-6" />
        <div>
          <h1 className="text-2xl font-bold">Workspace Settings</h1>
          <p className="text-muted-foreground">
            Manage your workspace settings and preferences
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Update your workspace information and appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Workspace Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter workspace name"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter workspace description"
              rows={4}
              maxLength={500}
            />
          </div>

          {/* Workspace Color */}
          <div className="space-y-2">
            <Label>Workspace Color</Label>
            <div className="flex gap-2">
              {WORKSPACE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? "border-foreground scale-110"
                      : "border-muted-foreground/30 hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleInputChange("color", color)}
                />
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveChanges}
              disabled={updateWorkspaceMutation.isPending}
            >
              {updateWorkspaceMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-fit">
                <Trash2 className="size-4 mr-2" />
                Delete Workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  workspace "{workspace.name}" and all of its projects, tasks, and data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteWorkspace}
                  disabled={deleteWorkspaceMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteWorkspaceMutation.isPending ? "Deleting..." : "Delete Workspace"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceSettings;