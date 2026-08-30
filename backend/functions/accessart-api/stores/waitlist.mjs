import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.WAITLIST_TABLE;

// Idempotent by design: a repeat signup for the same email overwrites the row
// (latest doors selection wins) rather than erroring.
export async function addToWaitlist({ email, doors, source }) {
  await ddb.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        email,
        doors,
        source,
        created_at: new Date().toISOString(),
      },
    })
  );
}
