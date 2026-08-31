import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.USERS_TABLE;

// One user row per Cognito sub. Handle reservations live in the same table as
// "handle#<handle>" rows, so uniqueness is a conditional write, not a scan.
// Subs are Cognito UUIDs and can never collide with the "handle#" prefix.

const UPDATABLE_FIELDS = ["handle", "name", "roles"];

export async function getUser(userId) {
  const res = await ddb.send(new GetCommand({ TableName: TABLE, Key: { user_id: userId } }));
  return res.Item ?? null;
}

export async function createUser({ user_id, email }) {
  const user = {
    user_id,
    email,
    roles: [],
    market_id: "seq",
    created_at: new Date().toISOString(),
  };
  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE,
        Item: user,
        ConditionExpression: "attribute_not_exists(user_id)",
      })
    );
    return user;
  } catch (err) {
    if (err?.name !== "ConditionalCheckFailedException") throw err;
    // Raced with a concurrent first request; the existing row wins.
    return getUser(user_id);
  }
}

export async function updateUser(userId, fields) {
  const sets = [];
  const names = {};
  const values = {};
  for (const field of UPDATABLE_FIELDS) {
    if (!(field in fields)) continue;
    sets.push(`#${field} = :${field}`);
    names[`#${field}`] = field;
    values[`:${field}`] = fields[field];
  }
  if (sets.length === 0) return getUser(userId);

  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { user_id: userId },
      UpdateExpression: `SET ${sets.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes ?? null;
}

// Conditional put: succeeds if the handle is free or already ours (so a
// repeat claim of your own handle is idempotent). False means taken.
export async function reserveHandle(handle, ownerId) {
  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE,
        Item: { user_id: `handle#${handle}`, owner: ownerId },
        ConditionExpression: "attribute_not_exists(user_id) OR #o = :o",
        ExpressionAttributeNames: { "#o": "owner" },
        ExpressionAttributeValues: { ":o": ownerId },
      })
    );
    return true;
  } catch (err) {
    if (err?.name === "ConditionalCheckFailedException") return false;
    throw err;
  }
}

export async function releaseHandle(handle, ownerId) {
  try {
    await ddb.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { user_id: `handle#${handle}` },
        ConditionExpression: "#o = :o",
        ExpressionAttributeNames: { "#o": "owner" },
        ExpressionAttributeValues: { ":o": ownerId },
      })
    );
  } catch (err) {
    // Already gone or re-taken by someone else; nothing to release.
    if (err?.name !== "ConditionalCheckFailedException") throw err;
  }
}
