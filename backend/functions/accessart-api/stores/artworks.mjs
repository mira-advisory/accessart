import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.ARTWORKS_TABLE;

// image_keys is deliberately absent: images are fixed at creation for now,
// and rent_month_cents only moves when the route recomputes it from value.
const UPDATABLE_FIELDS = [
  "title",
  "story",
  "medium",
  "width_cm",
  "height_cm",
  "value_cents",
  "rent_month_cents",
  "rentable",
  "status",
];

export async function createArtwork(item) {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

export async function getArtwork(id) {
  const res = await ddb.send(new GetCommand({ TableName: TABLE, Key: { artwork_id: id } }));
  return res.Item ?? null;
}

export async function listByArtist(artistId) {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "ArtistIndex",
      KeyConditionExpression: "artist_id = :a",
      ExpressionAttributeValues: { ":a": artistId },
      ScanIndexForward: false,
    })
  );
  return res.Items ?? [];
}

// FilterExpression only walks the one market partition, which is small at
// this scale; a status-keyed GSI can come later if a market outgrows it.
export async function listByMarket(marketId, limit = 50) {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "MarketIndex",
      KeyConditionExpression: "market_id = :m",
      FilterExpression: "#s = :listed",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ":m": marketId, ":listed": "listed" },
      ScanIndexForward: false,
      Limit: limit,
    })
  );
  return res.Items ?? [];
}

export async function updateArtwork(id, fields) {
  const sets = [];
  const names = {};
  const values = {};
  for (const field of UPDATABLE_FIELDS) {
    if (!(field in fields)) continue;
    sets.push(`#${field} = :${field}`);
    names[`#${field}`] = field;
    values[`:${field}`] = fields[field];
  }
  if (sets.length === 0) return getArtwork(id);

  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { artwork_id: id },
      UpdateExpression: `SET ${sets.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes ?? null;
}
