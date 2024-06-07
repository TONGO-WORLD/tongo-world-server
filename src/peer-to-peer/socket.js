const { Server: SocketServer } = require("socket.io");
const { queryUserState } = require("../store");
const { RESPONSE_TYPES } = require("../constants");

/**
 *
 * @type {import("socket.io").Server | null}
 */
let io = null;

/**
 *
 * @type {Map<string, import("socket.io").Socket>}
 */
const socketsMap = new Map();

/**
 *
 * @param httpServer {import("http").Server}
 */
const initializeSocketServer = httpServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
    },
  });

  listenForConnection();
};

const listenForConnection = () => {
  if (io !== null)
    io.on("connect", socket => {
      registerSocket(socket);
    });
};

/**
 *
 * @param socket {import("socket.io").Socket}
 */
const registerSocket = socket => {
  socket.on("register", async ({ walletId }) => {
    const userStateQuery = await queryUserState(walletId);
    const queryFailed = userStateQuery.type === RESPONSE_TYPES.FAILED;

    if (queryFailed) {
      return socket.emit("failed_to_register", {
        ...userStateQuery,
        message: "must initialize user state first",
      });
    }

    socket.join(socket.id);
    socketsMap.set(walletId, socket);
    disconnectSocket(socket, walletId);

    console.info("new socket connected. wallet.id(%s) === socket.id(%s)", walletId, socket.id);

    const socketsMapJson = Array.from(socketsMap.entries()).map(([key, value]) => ({
      key,
      "socket.id": value.id,
    }));

    console.table(socketsMapJson);
  });
};

/**
 *
 * @param socket {import("socket.io").Socket}
 * @param walletId {string}
 */
const disconnectSocket = (socket, walletId) => {
  socket.on("disconnect", () => {
    socket.leave(socket.id);
    socketsMap.delete(walletId);

    console.info("socket disconnected. wallet.id(%s) === socket.id(%s)", walletId, socket.id);

    const socketsMapJson = Array.from(socketsMap.entries()).map(([key, value]) => ({
      key,
      "socket.id": value.id,
    }));

    console.table(socketsMapJson);
  });
};

module.exports.initializeSocketServer = initializeSocketServer;
