const { app, output } = require("@azure/functions");

const blobOutput = output.storageBlob({
  connection: "AzureWebJobsStorage",
  path: "users/{phoneNumber}",
});

app.http("post-data-function", {
  methods: ["POST"],
  authLevel: "anonymous",
  connection: "AzureWebJobsStorage",
  extraOutputs: [blobOutput],
  handler: async (request, context) => {
    try {
      context.log(`Http function processed request for url "${request.url}"`);

      if (!request.body) {
        return {
          status: 400,
          body: "Request body is required",
        };
      }

      const blobData = await request.text();

      context.extraOutputs.set(blobOutput, blobData);

      return {
        status: 200,
        body: `Blob data uploaded successfully,`,
      };
    } catch (error) {
      if (context.log.error) {
        context.log.error(error);
      } else {
        console.error("context.log.error is not available", error);
      }

      return {
        status: 500,
        body: "Internal server error",
      };
    }
  },
});
