import type { StatsCardProps } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export const StatsCard = ({ data }: { data: StatsCardProps }) => {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tracking-tight mb-1">{data.totalProjects}</div>
          <p className="text-xs text-muted-foreground font-medium">
            {data.totalProjectInProgress} in progress
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tracking-tight mb-1">{data.totalTasks}</div>
          <p className="text-xs text-muted-foreground font-medium">
            {data.totalTaskCompleted} completed
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">To Do</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tracking-tight mb-1">{data.totalTaskToDo}</div>
          <p className="text-xs text-muted-foreground font-medium">
            Tasks waiting to be done
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tracking-tight mb-1">{data.totalTaskInProgress}</div>
          <p className="text-xs text-muted-foreground font-medium">
            Tasks currently in progress
          </p>
        </CardContent>
      </Card>
    </div>
  );
};