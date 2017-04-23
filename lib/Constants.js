
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
    VOP_IGNORE: 8, // Unknown, but can be safely ignored

    // EVENTS
    // https://discordapp.com/developers/docs/topics/gateway#events
    EVENT_READY: 'READY',
    EVENT_GUILD_CREATE: 'GUILD_CREATE',
    EVENT_VOICE_SERVER_UPDATE: 'VOICE_SERVER_UPDATE',

    // VOICE IP_DISCOVERY/RTP PACKETS
    // IP DISCOVERY: https://discordapp.com/developers/docs/topics/voice-connections#ip-discovery
    // RTP Header: http://www.rfcreader.com/#rfc3550_line548
    IP_DISCOVERY_SIZE: 70,
    IP_DISCOVERY_SSRC_OFFSET: 0,
    RTP_HEADER_SIZE: 12,
    RTP_NONCE_SIZE: 12,
    RTP_HEADER_VERSION_OFFSET: 0,
    RTP_HEADER_TYPE_OFFSET: 1,
    RTP_HEADER_SEQ_OFFSET: 2,
    RPT_HEADER_TIMESTAMP_OFFSET: 4,
    RTP_HEADER_SSRC_OFFSET: 8,

    // VOICE ENCRYPTION MODES
    VOICE_ENCRYPTION_PLAIN: 'plain',
    VOICE_ENCRYPTION_SODIUM: 'xsalsa20_poly1305'
};
