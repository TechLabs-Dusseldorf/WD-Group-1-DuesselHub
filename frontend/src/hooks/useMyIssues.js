import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteOwnIssue, getMyIssues } from '../api/issues.js'
import { getIssueKey } from '../utils/issues.js'
import { useAuth } from '../context/AuthContext.jsx'

function normalizeIssues(data) {
  if (!Array.isArray(data)) return []
  return data.map((issue) => ({
    ...issue,
    issueKey: getIssueKey(issue),
    endorsements: typeof issue.endorsements === 'number' ? issue.endorsements : 0,
    myVote: typeof issue.myVote === 'number' ? issue.myVote : 0,
  }))
}

export function useMyIssues({ sortKey, search }) {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = useMemo(
    () => ['my-issues', user?.id ?? null, token ?? null, sortKey, search ?? ''],
    [user?.id, token, sortKey, search],
  )

  const query = useQuery({
    queryKey,
    enabled: Boolean(token),
    queryFn: async ({ signal }) => {
      const data = await getMyIssues({ sortKey, search, signal })
      return normalizeIssues(data)
    },
    staleTime: 1000 * 20,
  })

  const deleteMutation = useMutation({
    mutationFn: ({ issueId }) => deleteOwnIssue(issueId),
    onMutate: async ({ issueId }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousIssues = queryClient.getQueryData(queryKey) ?? []
      queryClient.setQueryData(
        queryKey,
        previousIssues.filter((issue) => issue._id !== issueId),
      )
      return { previousIssues }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(queryKey, context.previousIssues)
      }
    },
  })

  async function deleteIssue(issueId) {
    await deleteMutation.mutateAsync({ issueId })
  }

  return {
    issues: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? "We couldn't load your issues right now." : null,
    reload: query.refetch,
    deleteIssue,
    isDeleting: deleteMutation.isPending,
  }
}
