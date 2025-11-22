import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseProjectQuery } from "@/hooks/use-project";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { getProjectProgress } from "@/lib";
import { cn } from "@/lib/utils";
import type { Project, Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, Clock, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const ProjectDetails = () => {
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const [isCreateTask, setIsCreateTask] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Hooks must be called before any early returns
  const updateTaskStatus = useUpdateTaskStatusMutation();

  const { data, isLoading, isError, error } = UseProjectQuery(projectId!) as {
    data: {
      tasks: Task[];
      project: Project;
    } | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };

  // Filter tasks based on search query - must be called before early returns
  // Use empty array as fallback if data is not loaded yet
  const tasks = data?.tasks || [];
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold">Failed to load project</p>
          <p className="text-sm text-muted-foreground">
            {error?.response?.data?.message || "Please try refreshing the page"}
          </p>
        </div>
      </div>
    );
  }

  const { project } = data;
  const projectProgress = getProjectProgress(tasks);

  const handleTaskClick = (taskId: string) => {
    navigate(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
    );
  };

  const handleQuickStatusUpdate = (
    taskId: string,
    newStatus: TaskStatus,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    updateTaskStatus.mutate(
      { taskId, status: newStatus },
      {
        onSuccess: () => {
          toast.success("Task status updated");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update status");
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <BackButton />
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500">{project.description}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 min-w-32">
            <div className="text-sm text-muted-foreground">Progress:</div>
            <div className="flex-1">
              <Progress value={projectProgress} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground">
              {projectProgress}%
            </span>
          </div>

          <Button onClick={() => setIsCreateTask(true)}>Add Task</Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center text-sm gap-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="bg-background">
                  {tasks.filter((task) => task.status === "To Do").length} To Do
                </Badge>
                <Badge variant="outline" className="bg-background">
                  {tasks.filter((task) => task.status === "In Progress").length}{" "}
                  In Progress
                </Badge>
                <Badge variant="outline" className="bg-background">
                  {tasks.filter((task) => task.status === "Done").length} Done
                </Badge>
              </div>
            </div>
            <TabsList>
              <TabsTrigger value="all" onClick={() => setTaskFilter("All")}>
                All Tasks
              </TabsTrigger>
              <TabsTrigger value="todo" onClick={() => setTaskFilter("To Do")}>
                To Do
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                onClick={() => setTaskFilter("In Progress")}
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger value="done" onClick={() => setTaskFilter("Done")}>
                Done
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            {filteredTasks.length === 0 && searchQuery ? (
              <div className="text-center py-12 px-4">
                <div className="flex flex-col items-center gap-3">
                  <Search className="size-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No tasks found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search query
                    </p>
                  </div>
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-3 gap-4">
              <TaskColumn
                title="To Do"
                  tasks={filteredTasks.filter((task) => task.status === "To Do")}
                onTaskClick={handleTaskClick}
                  onQuickStatusUpdate={handleQuickStatusUpdate}
              />

              <TaskColumn
                title="In Progress"
                  tasks={filteredTasks.filter((task) => task.status === "In Progress")}
                onTaskClick={handleTaskClick}
                  onQuickStatusUpdate={handleQuickStatusUpdate}
              />

              <TaskColumn
                title="Done"
                  tasks={filteredTasks.filter((task) => task.status === "Done")}
                onTaskClick={handleTaskClick}
                  onQuickStatusUpdate={handleQuickStatusUpdate}
              />
            </div>
            )}
          </TabsContent>

          <TabsContent value="todo" className="m-0">
            {filteredTasks.filter((task) => task.status === "To Do").length === 0 && searchQuery ? (
              <div className="text-center py-12 px-4">
                <div className="flex flex-col items-center gap-3">
                  <Search className="size-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No tasks found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search query
                    </p>
                  </div>
                </div>
              </div>
            ) : (
            <div className="grid md:grid-cols-1 gap-4">
              <TaskColumn
                title="To Do"
                  tasks={filteredTasks.filter((task) => task.status === "To Do")}
                onTaskClick={handleTaskClick}
                  onQuickStatusUpdate={handleQuickStatusUpdate}
                isFullWidth
              />
            </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="m-0">
            {filteredTasks.filter((task) => task.status === "In Progress").length === 0 && searchQuery ? (
              <div className="text-center py-12 px-4">
                <div className="flex flex-col items-center gap-3">
                  <Search className="size-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No tasks found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search query
                    </p>
                  </div>
                </div>
              </div>
            ) : (
            <div className="grid md:grid-cols-1 gap-4">
              <TaskColumn
                title="In Progress"
                  tasks={filteredTasks.filter((task) => task.status === "In Progress")}
                onTaskClick={handleTaskClick}
                  onQuickStatusUpdate={handleQuickStatusUpdate}
                isFullWidth
              />
            </div>
            )}
          </TabsContent>

          <TabsContent value="done" className="m-0">
            {filteredTasks.filter((task) => task.status === "Done").length === 0 && searchQuery ? (
              <div className="text-center py-12 px-4">
                <div className="flex flex-col items-center gap-3">
                  <Search className="size-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No tasks found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search query
                    </p>
                  </div>
                </div>
              </div>
            ) : (
            <div className="grid md:grid-cols-1 gap-4">
              <TaskColumn
                title="Done"
                  tasks={filteredTasks.filter((task) => task.status === "Done")}
                onTaskClick={handleTaskClick}
                  onQuickStatusUpdate={handleQuickStatusUpdate}
                isFullWidth
              />
            </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* create    task dialog */}
      <CreateTaskDialog
        open={isCreateTask}
        onOpenChange={setIsCreateTask}
        projectId={projectId!}
        projectMembers={project.members as any}
      />
    </div>
  );
};

export default ProjectDetails;

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onQuickStatusUpdate?: (taskId: string, status: TaskStatus, e: React.MouseEvent) => void;
  isFullWidth?: boolean;
}

const TaskColumn = ({
  title,
  tasks,
  onTaskClick,
  onQuickStatusUpdate,
  isFullWidth = false,
}: TaskColumnProps) => {
  return (
    <div
      className={
        isFullWidth
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : ""
      }
    >
      <div
        className={cn(
          "space-y-4",
          !isFullWidth ? "h-full" : "col-span-full mb-4"
        )}
      >
        {!isFullWidth && (
          <div className="flex items-center justify-between">
            <h1 className="font-medium">{title}</h1>
            <Badge variant="outline">{tasks.length}</Badge>
          </div>
        )}

        <div
          className={cn(
            "space-y-3",
            isFullWidth && "grid grid-cols-2 lg:grid-cols-3 gap-4"
          )}
        >
          {tasks.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full bg-muted p-4">
                  <CheckCircle className="size-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No tasks yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Add Task" to create your first task
                  </p>
                </div>
              </div>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => onTaskClick(task._id)}
                onQuickStatusUpdate={onQuickStatusUpdate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ 
  task, 
  onClick, 
  onQuickStatusUpdate 
}: { 
  task: Task; 
  onClick: () => void;
  onQuickStatusUpdate?: (taskId: string, status: TaskStatus, e: React.MouseEvent) => void;
}) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer border-border/50 shadow-sm hover:shadow-lg hover:border-border transition-all duration-200 group"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              "font-medium text-xs",
              task.priority === "High"
                ? "border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20"
                : task.priority === "Medium"
                ? "border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20"
                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/30"
            )}
          >
            {task.priority}
          </Badge>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {task.status !== "To Do" && (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-7 h-7 w-7 hover:bg-muted"
                onClick={(e) => onQuickStatusUpdate?.(task._id, "To Do", e)}
                title="Mark as To Do"
              >
                <AlertCircle className={cn("size-3.5")} />
                <span className="sr-only">Mark as To Do</span>
              </Button>
            )}
            {task.status !== "In Progress" && (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-7 h-7 w-7 hover:bg-muted"
                onClick={(e) => onQuickStatusUpdate?.(task._id, "In Progress", e)}
                title="Mark as In Progress"
              >
                <Clock className={cn("size-3.5")} />
                <span className="sr-only">Mark as In Progress</span>
              </Button>
            )}
            {task.status !== "Done" && (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-7 h-7 w-7 hover:bg-muted"
                onClick={(e) => onQuickStatusUpdate?.(task._id, "Done", e)}
                title="Mark as Done"
              >
                <CheckCircle className={cn("size-3.5")} />
                <span className="sr-only">Mark as Done</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <h4 className="font-semibold mb-2.5 text-sm leading-tight">{task.title}</h4>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 5).map((member) => (
                  <Avatar
                    key={member._id}
                    className="relative size-7 bg-muted rounded-full border-2 border-background overflow-hidden ring-1 ring-border/50"
                    title={member.name}
                  >
                    <AvatarImage src={member.profilePicture} />
                    <AvatarFallback className="text-[10px] font-medium">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}

                {task.assignees.length > 5 && (
                  <span className="text-[10px] text-muted-foreground font-medium ml-1">
                    +{task.assignees.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {task.dueDate && (
            <div className={cn(
              "text-[11px] flex items-center font-medium",
              isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
            )}>
              <Calendar className="size-3 mr-1.5" />
              {format(new Date(task.dueDate), "MMM d")}
              {isOverdue && <span className="ml-1.5 text-[10px]">Overdue</span>}
            </div>
          )}
        </div>
        {/* 5/10 subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2.5 text-[11px] text-muted-foreground font-medium">
            {task.subtasks.filter((subtask) => subtask.completed).length} /{" "}
            {task.subtasks.length} subtasks
          </div>
        )}
      </CardContent>
    </Card>
  );
};