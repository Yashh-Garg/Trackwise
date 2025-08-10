import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData, deleteData, updateData } from "@/lib/fetch-util";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
  });
};

export const useGetWorkspacesQuery = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => fetchData("/workspaces"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};


export const useRemoveWorkspaceMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workspaceId, memberId }: { workspaceId: string; memberId: string }) => {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_API_URL}/workspaces/${workspaceId}/members/${memberId}`,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId, "details"],
      });
    },
  });
};







export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
    enabled: !!workspaceId && workspaceId !== "null" && workspaceId !== "undefined",
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useGetWorkspaceStatsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () => {
      if (!workspaceId || workspaceId === "null" || workspaceId === "undefined") {
        throw new Error("Invalid workspace ID");
      }
      return fetchData(`/workspaces/${workspaceId}/stats`);
    },
    enabled: !!workspaceId && workspaceId !== "null" && workspaceId !== "undefined",
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => {
      if (!workspaceId || workspaceId === "null" || workspaceId === "undefined") {
        throw new Error("Invalid workspace ID");
      }
      return fetchData(`/workspaces/${workspaceId}`);
    },
    enabled: !!workspaceId && workspaceId !== "null" && workspaceId !== "undefined",
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useInviteMemberMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; role: string; workspaceId: string }) => {
      if (!data.workspaceId || data.workspaceId === "null" || data.workspaceId === "undefined") {
        throw new Error("Invalid workspace ID");
      }
      return postData(`/workspaces/${data.workspaceId}/invite-member`, data);
    },
  });
};

export const useAcceptInviteByTokenMutation = () => {
  return useMutation({
    mutationFn: (token: string) => {
      if (!token || token.trim() === "") {
        throw new Error("Invalid token");
      }
      return postData(`/workspaces/accept-invite-token`, { token });
    },
  });
};

export const useAcceptGenerateInviteMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) => {
      if (!workspaceId || workspaceId === "null" || workspaceId === "undefined") {
        throw new Error("Invalid workspace ID");
      }
      return postData(`/workspaces/${workspaceId}/accept-generate-invite`, {});
    },
  });
};

// Add these hooks to your existing use-workspace.ts file

export const useUpdateWorkspaceMutation = () => {
  return useMutation({
    mutationFn: (data: { workspaceId: string; name: string; description: string; color: string }) => {
      if (!data.workspaceId || data.workspaceId === "null" || data.workspaceId === "undefined") {
        throw new Error("Invalid workspace ID");
      }
      return updateData(`/workspaces/${data.workspaceId}`, {
        name: data.name,
        description: data.description,
        color: data.color,
      });
    },
  });
};

export const useDeleteWorkspaceMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) => {
      if (!workspaceId || workspaceId === "null" || workspaceId === "undefined") {
        throw new Error("Invalid workspace ID");
      }
      return deleteData(`/workspaces/${workspaceId}`);
    },
  });
};

// import type { WorkspaceForm } from "@/components/workspace/create-workspace";
// import { fetchData, postData } from "@/lib/fetch-util";
// import { useMutation, useQuery } from "@tanstack/react-query";

// export const useCreateWorkspace = () => {
//   return useMutation({
//     mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
//   });
// };

// export const useGetWorkspacesQuery = () => {
//   return useQuery({
//     queryKey: ["workspaces"],
//     queryFn: async () => fetchData("/workspaces"),
//   });
// };

// export const useGetWorkspaceQuery = (workspaceId: string) => {
//   return useQuery({
//     queryKey: ["workspace", workspaceId],
//     queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
//   });
// };

// export const useGetWorkspaceStatsQuery = (workspaceId: string) => {
//   return useQuery({
//     queryKey: ["workspace", workspaceId, "stats"],
//     queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
//   });
// };

// export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
//   return useQuery({
//     queryKey: ["workspace", workspaceId, "details"],
//     queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
//   });
// };

// export const useInviteMemberMutation = () => {
//   return useMutation({
//     mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
//       postData(`/workspaces/${data.workspaceId}/invite-member`, data),
//   });
// };

// export const useAcceptInviteByTokenMutation = () => {
//   return useMutation({
//     mutationFn: (token: string) =>
//       postData(`/workspaces/accept-invite-token`, {
//         token,
//       }),
//   });
// };

// export const useAcceptGenerateInviteMutation = () => {
//   return useMutation({
//     mutationFn: (workspaceId: string) =>
//       postData(`/workspaces/${workspaceId}/accept-generate-invite`, {}),
//   });
// };