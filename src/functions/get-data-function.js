const { app } = require("@azure/functions");
const { BlobServiceClient } = require("@azure/storage-blob");

app.http("http-test", {
  methods: ["GET"],
  authLevel: "anonymous",
  connection: "AzureWebJobsStorage",
  handler: async (request, context) => {
    try {
      context.log(`Http function processed request for url "${request.url}"`);

      const connectionString = process.env.AzureWebJobsStorage;
      const containerName = "users";
      const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);

      const containerClient =
        blobServiceClient.getContainerClient(containerName);

      const response = [];

      for await (const blob of containerClient.listBlobsFlat()) {
        const blobClient = await containerClient
          .getBlobClient(blob.name)
          .download();

        const content = await streamToString(blobClient.readableStreamBody);
        response.push(content);
      }

      return { body: JSON.stringify(response) };
    } catch (error) {
      context.log.error(error);
      return { status: 500, body: "Internal Server Error" };
    }
  },
});

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}
