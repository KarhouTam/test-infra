import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { NextApiRequest, NextApiResponse } from "next";
import { getClickhouseClientWritable } from "../../lib/clickhouse";

dayjs.extend(utc);

const VALID_STATUSES = ["in_progress", "completed"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authorization = req.headers.authorization;
  if (!authorization || authorization !== process.env.OOT_CI_BOT_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const {
    downstream_repo,
    upstream_repo,
    head_sha,
    pr_number,
    status,
    conclusion,
    workflow_name,
    workflow_url,
  } = req.body ?? {};

  if (
    !downstream_repo ||
    typeof downstream_repo !== "string" ||
    !upstream_repo ||
    typeof upstream_repo !== "string" ||
    !head_sha ||
    typeof head_sha !== "string" ||
    pr_number === undefined ||
    pr_number === null ||
    !status ||
    typeof status !== "string" ||
    !workflow_name ||
    typeof workflow_name !== "string" ||
    !workflow_url ||
    typeof workflow_url !== "string"
  ) {
    return res.status(400).json({ error: "Invalid body: missing required fields" });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: `Invalid status: must be one of ${VALID_STATUSES.join(", ")}` });
  }

  try {
    await getClickhouseClientWritable().insert({
      table: "misc.oot_ci_events",
      values: [
        [
          downstream_repo,
          upstream_repo,
          head_sha,
          pr_number,
          status,
          conclusion ?? "",
          workflow_name,
          workflow_url,
          dayjs().utc().format("YYYY-MM-DD HH:mm:ss.SSS"),
        ],
      ],
    });
    return res.status(200).json({ ok: true });
  } catch (_err) {
    return res.status(500).json({ error: "Failed to write to ClickHouse" });
  }
}
