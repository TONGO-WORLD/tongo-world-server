const { MongoClient } = require("mongodb");
const assert = require("assert");
const { MONGO_URI, DB } = require("../environments");
const { RESPONSE_TYPES } = require("../constants");

const client = new MongoClient(MONGO_URI);
const database = DB || "tongo-app-state";
const collection = "user-app-state";

/**
 *
 * @type {import("mongodb").Collection}
 */
let userState = null;

const initMongoConnection = async () => {
  try {
    const connectedClient = await client.connect();
    const db = connectedClient.db(database);

    userState = db.collection(collection);
  } catch (error) {
    process.exit(1);
  }
};

/**
 *
 * @param walletId {string}
 * @param state {{health: number; exp: number; mood: number; mined_togi: number;}}
 * @returns {Promise<{ type: keyof typeof import("../constants").RESPONSE_TYPES; data: any}>}
 */
const initializeUserState = async (walletId, state) => {
  try {
    const user = await userState.insertOne({ walletId, state });

    return {
      type: RESPONSE_TYPES.UPDATE,
      data: user,
    };
  } catch (error) {
    return {
      type: RESPONSE_TYPES.FAILED,
      data: {
        message: error.message,
        code: error.code,
      },
    };
  }
};

/**
 *
 * @param walletId {string}
 * @returns {Promise<{ type: keyof typeof import("../constants").RESPONSE_TYPES; data: any}>}
 */
const queryUserState = async walletId => {
  try {
    const user = await userState.findOne({ walletId });

    assert.ok(!!user, "user_not_found");

    return {
      type: RESPONSE_TYPES.READ,
      data: user,
    };
  } catch (error) {
    return {
      type: RESPONSE_TYPES.FAILED,
      data: {
        message: error.message,
        code: error.code,
      },
    };
  }
};

/**
 *
 * @param {string} walletId
 * @param {{health: number; exp: number; mood: number; mined_togi: number;}} state
 * @returns {Promise<{ type: keyof typeof import("../constants").RESPONSE_TYPES; data: any}>}
 */
const updateUserState = async (walletId, state) => {
  try {
    const userQueryResponse = await queryUserState(walletId);

    assert.ok(userQueryResponse.type !== RESPONSE_TYPES.FAILED, userQueryResponse.data.message);

    const newState = Object.assign(userQueryResponse.data.state, state);

    const userUpdateResponse = await userState.updateOne({ walletId }, { $set: { state: newState } });

    return {
      type: RESPONSE_TYPES.UPDATE,
      data: userUpdateResponse,
    };
  } catch (error) {
    return {
      type: RESPONSE_TYPES.FAILED,
      data: {
        message: error.message,
        code: error.code,
      },
    };
  }
};

module.exports.initMongoConnection = initMongoConnection;
module.exports.initializeUserState = initializeUserState;
module.exports.queryUserState = queryUserState;
module.exports.updateUserState = updateUserState;
