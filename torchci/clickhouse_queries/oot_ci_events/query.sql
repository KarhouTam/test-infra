SELECT
  downstream_repo,
  upstream_repo,
  head_sha,
  pr_number,
  argMax(status, time_inserted) AS status,
  argMax(conclusion, time_inserted) AS conclusion,
  workflow_name,
  argMax(workflow_url, time_inserted) AS workflow_url,
  max(time_inserted) AS time_inserted
FROM
  misc.oot_ci_events
WHERE
  head_sha = {head_sha: String}
  AND (
    {downstream_repo: String} = ''
    OR downstream_repo = {downstream_repo: String}
  )
GROUP BY
  downstream_repo,
  upstream_repo,
  head_sha,
  pr_number,
  workflow_name
ORDER BY
  time_inserted DESC
