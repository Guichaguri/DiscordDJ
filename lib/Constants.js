
/**
 * Discord Constants
 * @typedef {Constants}
 */
module.exports = {
    API_VERSION: 6,

    // OPCODES
    // https://discordapp.com/developers/docs/topics/gateway#gateway-op-codes
    OP_DISPATCH: 0,
    OP_HEARTBEAT: 1,
    OP_IDENTITY: 2,
    OP_VOICE_STATE_UPDATE: 4,
    OP_HELLO: 10,
    OP_HEARTBEAT_ACK: 11,

    // VOICE OPCODES
    // https://discordapp.com/developers/docs/topics/voice-connections#voice-payloads-and-events
    VOP_IDENTITY: 0,
    VOP_SELECT_PROTOCOL: 1,
    VOP_READY: 2,
    VOP_HEARTBEAT: 3,
    VOP_SESSION_DESCRIPTION: 4,
    VOP_SPEAKING: 5,

    // EVENTS
    // https://discordapp.com/developers/docs/topics/gateway#events
    EVENT_READY: 'READY',
    EVENT_GUILD_CREATE: 'GUILD_CREATE',
    EVENT_VOICE_SERVER_UPDATE: 'VOICE_SERVER_UPDATE',

    // VOICE PACKET BYTES
    // https://discordapp.com/developers/docs/topics/voice-connections#encrypting-and-sending-voice
    VB_LOCAL_IP_SIZE: 70,
    VB_LOCAL_IP_SSRC_OFFSET: 0,
    VB_HEADER_SIZE: 12,
    VB_NONCE_SIZE: 12,
    VB_HEADER_TYPE_OFFSET: 0,
    VB_HEADER_VERSION_OFFSET: 1,
    VB_HEADER_SEQ_OFFSET: 2,
    VB_HEADER_TIMESTAMP_OFFSET: 4,
    VB_HEADER_SSRC_OFFSET: 8,

    VOICE_ENCRYPTION_PLAIN: 'plain',
    VOICE_ENCRYPTION_SODIUM: 'xsalsa20_poly1305'
};
