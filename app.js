const dev = process.env.NODE_ENV !== "production";
const hostname = "127.0.0.1";
const port = Number(process.env.PORT || 3000);

Promise.all([import("node:http"), import("next")])
  .then(([httpModule, nextModule]) => {
    const http = httpModule.default;
    const next = nextModule.default;
    const nextApp = next({ dev, hostname, port });
    const handleRequest = nextApp.getRequestHandler();

    return nextApp.prepare().then(() => {
      const server = http.createServer((request, response) => {
        handleRequest(request, response);
      });

      const passenger = globalThis.PhusionPassenger;

      if (passenger) {
        passenger.configure({ autoInstall: false });
        server.listen("passenger", () => {
          console.log("EMRAN LABS is listening through Passenger.");
        });
        return;
      }

      server.listen(port, hostname, () => {
        console.log(`EMRAN LABS is listening at http://${hostname}:${port}.`);
      });
    });
  })
  .catch((error) => {
    console.error("Failed to start EMRAN LABS.", error);
    process.exit(1);
  });
