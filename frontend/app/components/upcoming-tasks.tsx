import type { Task } from "@/types";
import { Link, useSearchParams } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export const UpcomingTasks = ({ data }: { data: Task[] }) => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
        <CardDescription>Here are the tasks that are due soon</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted p-4">
                <CheckCircle2 className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">No upcoming tasks</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All caught up! Great work 🎉
                </p>
              </div>
            </div>
          </div>
        ) : (
          data.map((task) => {
            const isOverdue = task.dueDate && 
              new Date(task.dueDate) < new Date() && 
              task.status !== "Done";
            
            return (
              <Link
                to={`/workspaces/${workspaceId}/projects/${task.project}/tasks/${task._id}`}
                key={task._id}
                className="flex items-start space-x-3 border-b border-border/30 pb-3 last:border-0 hover:bg-muted/30 p-2.5 rounded-lg transition-all duration-150 group"
              >
                <div
                  className={cn(
                    "mt-0.5 rounded-full p-1.5 transition-colors",
                    task.priority === "High" && "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400",
                    task.priority === "Medium" && "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
                    task.priority === "Low" && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {task.status === "Done" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{task.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[11px] font-medium border-border/50">
                      {task.status}
                    </Badge>
                    {task.dueDate && (
                      <div className={cn(
                        "flex items-center text-[11px] gap-1.5 font-medium",
                        isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                      )}>
                        {isOverdue && <AlertCircle className="w-3 h-3" />}
                        <span>
                          {format(new Date(task.dueDate), "MMM d")}
                        </span>
                        {isOverdue && <span className="ml-1">Overdue</span>}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};