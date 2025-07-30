import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/provider/auth-context";
import { useNavigate } from "react-router";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Search, 
  Archive, 
  Calendar, 
  User, 
  CheckCircle2,
  RotateCcw,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/types";

// You'll need to create this hook for fetching achieved tasks
import { useAchievedTasksQuery, useRestoreTaskMutation, useDeleteTaskMutation } from "@/hooks/use-task";

const AchievedTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch achieved tasks - you'll need to implement this query
  const { data: achievedTasks, isLoading } = useAchievedTasksQuery();
  
  // Mutations for restore and delete
  const { mutate: restoreTask, isPending: isRestoring } = useRestoreTaskMutation();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

  const filteredTasks = achievedTasks?.filter((task: Task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRestoreTask = (taskId: string) => {
    restoreTask(
      { taskId },
      {
        onSuccess: () => {
          toast.success("Task restored successfully");
        },
        onError: () => {
          toast.error("Failed to restore task");
        },
      }
    );
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this task?")) {
      deleteTask(
        { taskId },
        {
          onSuccess: () => {
            toast.success("Task deleted permanently");
          },
          onError: () => {
            toast.error("Failed to delete task");
          },
        }
      );
    }
  };

  const handleTaskClick = (task: Task) => {
    // Navigate to task details - you might want to modify this based on your routing structure
    navigate(`/workspaces/${task.workspaceId}/projects/${task.projectId}/tasks/${task._id}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "default";
      case "Low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Todo":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Archive className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl md:text-3xl font-bold">Achieved Tasks</h1>
          <Badge variant="outline" className="ml-2">
            {filteredTasks.length} tasks
          </Badge>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search achieved tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No achieved tasks yet</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "No tasks match your search criteria." 
                : "Tasks you archive will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {filteredTasks.map((task: Task) => (
            <Card 
              key={task._id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTaskClick(task)}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-1">
                      {task.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Archived {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                      </div>
                      {task.assignees && task.assignees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignees.length} assignee{task.assignees.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getPriorityColor(task.priority)} 
                      className="capitalize"
                    >
                      {task.priority}
                    </Badge>
                    <Badge 
                      className={`${getStatusColor(task.status)} capitalize`}
                      variant="outline"
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    Created on {format(new Date(task.createdAt), "MMM dd, yyyy")}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreTask(task._id);
                      }}
                      disabled={isRestoring}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task._id);
                      }}
                      disabled={isDeleting}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievedTasks;