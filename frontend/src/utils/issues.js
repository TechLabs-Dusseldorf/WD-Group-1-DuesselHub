export function toIssueKey(issue) {
  return `${issue?.createdAt ?? ''}::${issue?.title ?? ''}::${issue?.location ?? ''}`
}

export function getIssueKey(issue) {
  return issue?._id ?? issue?.issueKey ?? toIssueKey(issue ?? {})
}