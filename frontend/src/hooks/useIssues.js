import { useCallback, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endorseIssue, getIssues } from '../api/issues.js'
import { getMockIssues } from '../api/mock.js'
import { getIssueKey } from '../utils/issues.js'

function enrichIssues(data, voteMap) {
  return data.map((issue) => {
    const issueKey = getIssueKey(issue)
    return {
      ...issue,
      issueKey,
      myVote: voteMap.get(issueKey) ?? 0,
      endorsements: issue.endorsements ?? 0,
    }
  })
}

export function useIssues(sortKey) {
  const queryClient = useQueryClient()
  const voteMapRef = useRef(new Map())
  const [sortError, setSortError] = useState(null)
  const [voteError, setVoteError] = useState(null)

  const queryKey = ['issues', sortKey]

  const { data: issues = [], isLoading: loading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      setSortError(null)
      try {
        const data = await getIssues({ sortKey, signal })
        return enrichIssues(data, voteMapRef.current)
      } catch (e) {
        if (e?.name === 'AbortError') throw e
        setSortError(`Sorting "${sortKey}" failed. Please try again in a moment.`)
        const mockData = await getMockIssues()
        return enrichIssues(mockData, voteMapRef.current)
      }
    },
    staleTime: 1000 * 30,
  })

  const { mutate: vote } = useMutation({
    mutationFn: ({ issueId, action }) => endorseIssue(issueId, action),
    onMutate: ({ issueKey, nextVote, nextEndorsements }) => {
      const snapshot = queryClient.getQueryData(queryKey)
      const prevVote = voteMapRef.current.get(issueKey) ?? 0

      voteMapRef.current.set(issueKey, nextVote)
      queryClient.setQueryData(queryKey, (prev = []) =>
        prev.map((issue) =>
          issue.issueKey !== issueKey
            ? issue
            : { ...issue, myVote: nextVote, endorsements: nextEndorsements },
        ),
      )

      return { snapshot, prevVote }
    },
    onError: (_err, { issueKey }, ctx) => {
      queryClient.setQueryData(queryKey, ctx.snapshot)
      voteMapRef.current.set(issueKey, ctx.prevVote)
      setVoteError('Endorsement failed. Please try again.')
    },
    onSuccess: (updatedIssue, { issueKey, nextVote }) => {
      if (!updatedIssue || typeof updatedIssue !== 'object') return
      queryClient.setQueryData(queryKey, (prev = []) =>
        prev.map((issue) => {
          if (issue.issueKey !== issueKey) return issue
          return {
            ...issue,
            ...updatedIssue,
            issueKey: getIssueKey(updatedIssue),
            myVote: nextVote,
            endorsements:
              typeof updatedIssue.endorsements === 'number'
                ? updatedIssue.endorsements
                : issue.endorsements,
          }
        }),
      )
    },
  })

  const handleVote = useCallback(
    (issueKey, direction) => {
      if (direction !== +1) return
      setVoteError(null)

      const currentIssue = issues.find((issue) => issue.issueKey === issueKey)
      if (!currentIssue) return
      if (!currentIssue._id) {
        setVoteError('Endorsement could not be sent to the server. Please try again later.')
        return
      }

      const currentVote = currentIssue.myVote ?? 0
      const isRemoving = currentVote === +1
      const nextVote = isRemoving ? 0 : +1
      const delta = isRemoving ? -1 : +1
      const nextEndorsements = Math.max(0, (currentIssue.endorsements ?? 0) + delta)

      vote({
        issueId: currentIssue._id,
        action: isRemoving ? 'remove' : 'add',
        issueKey,
        nextVote,
        nextEndorsements,
      })
    },
    [issues, vote],
  )

  function clearVoteError() {
    setVoteError(null)
  }

  return {
    issues,
    loading,
    error: isError ? "We couldn't load issues right now. Please try again in a moment." : null,
    sortError,
    voteError,
    clearVoteError,
    reload: refetch,
    handleVote,
  }
}
