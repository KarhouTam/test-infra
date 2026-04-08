CREATE TABLE
    misc.oot_ci_events (
        `downstream_repo` LowCardinality(String),
        `upstream_repo` LowCardinality(String),
        `head_sha` String,
        `pr_number` UInt64,
        `status` LowCardinality(String),
        `conclusion` LowCardinality(String),
        `workflow_name` String,
        `workflow_url` String,
        `time_inserted` DateTime64 (3, 'UTC')
    ) ENGINE = SharedReplacingMergeTree ('/clickhouse/tables/{uuid}/{shard}', '{replica}', time_inserted)
PARTITION BY
    toYYYYMM (time_inserted)
ORDER BY
    (downstream_repo, upstream_repo, head_sha, pr_number, workflow_name) SETTINGS index_granularity = 8192
