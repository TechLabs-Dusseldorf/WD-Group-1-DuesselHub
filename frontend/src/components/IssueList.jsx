import { IssueCard } from './IssueCard.jsx'

export function IssueList({ issues, onVote }) {
  if (!Array.isArray(issues) || issues.length === 0) return null
  return (
    <div className="issue-list">
      {issues.map((issue) => (
        <IssueCard key={issue.issueKey} issue={issue} onVote={onVote} />
      ))}
    </div>
  )
}
