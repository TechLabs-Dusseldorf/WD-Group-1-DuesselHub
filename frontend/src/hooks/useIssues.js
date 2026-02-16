import { useEffect, useState } from 'react'
import { getIssues } from '../api/issues.js'
import { getMockIssues } from '../api/mock.js'
import { getIssueKey, toIssueKey } from '../utils/issues.js'

export function useIssues(sortKey) {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortError, setSortError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      setSortError(null)

      try {
        const data = await getIssues({ signal: controller.signal, sortKey })
        if (!isActive) return
        setSortError(null)
        setIssues((prevIssues) => {
          const voteByKey = new Map(
            prevIssues.map((i) => [i.issueKey ?? toIssueKey(i), i.myVote ?? 0]),
          )

          return data.map((issue) => {
            const issueKey = getIssueKey(issue)
            return {
              ...issue,
              issueKey,
              myVote: voteByKey.get(issueKey) ?? 0,
              endorsements: issue.endorsements ?? 0,
            }
          })
        })
      } catch (e) {
        if (!isActive) return
        if (e?.name === 'AbortError') return

        setSortError(`Sorting "${sortKey}" failed. Please try again in a moment.`)

        try {
          const data = await getMockIssues()
          if (!isActive) return
          setIssues((prevIssues) => {
            const voteByKey = new Map(
              prevIssues.map((i) => [i.issueKey ?? toIssueKey(i), i.myVote ?? 0]),
            )

            return data.map((issue) => {
              const issueKey = getIssueKey(issue)
              return {
                ...issue,
                issueKey,
                myVote: voteByKey.get(issueKey) ?? 0,
                endorsements: issue.endorsements ?? 0,
              }
            })
          })
        } catch {
          setIssues([])
          setError('We couldn’t load issues right now. Please try again in a moment.')
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }

    load()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [sortKey, reloadToken])

  function reload() {
    setReloadToken((n) => n + 1)
  }

  function handleVote(issueKey, direction) {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.issueKey !== issueKey) return issue

        const current = issue.myVote ?? 0
        if (direction !== +1) return issue

        const isRemoving = current === +1
        const nextVote = isRemoving ? 0 : +1
        const delta = isRemoving ? -1 : +1

        return {
          ...issue,
          myVote: nextVote,
          endorsements: Math.max(0, (issue.endorsements ?? 0) + delta),
        }
      }),
    )
  }

  return { issues, loading, error, sortError, reload, handleVote }
}