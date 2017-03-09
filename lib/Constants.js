
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

    // VOICE IP_DISCOVERY/RTP/RTCP PACKETS
    // IP DISCOVERY: https://discordapp.com/developers/docs/topics/voice-connections#ip-discovery
    // RTP Header: http://www.rfcreader.com/#rfc3550_line548
    // RTCP SR: http://www.rfcreader.com/#rfc3550_line1614
    // RTCP SDES: http://www.rfcreader.com/#rfc3550_line2024 (Not used, the bot doesn't need listen for now)
    IP_DISCOVERY_SIZE: 70,
    IP_DISCOVERY_SSRC_OFFSET: 0,
    RTP_HEADER_SIZE: 12,
    RTP_NONCE_SIZE: 12,
    RTP_HEADER_VERSION_OFFSET: 0,
    RTP_HEADER_TYPE_OFFSET: 1,
    RTP_HEADER_SEQ_OFFSET: 2,
    RPT_HEADER_TIMESTAMP_OFFSET: 4,
    RTP_HEADER_SSRC_OFFSET: 8,
    RTCP_TIMESTAMP_OFFSET: 2208988800000,
    RTCP_VERSION_OFFSET: 0,
    RTCP_TYPE_OFFSET: 1,
    RTCP_LENGTH_OFFSET: 2,
    RTCP_SSRC_OFFSET: 4,
    RTCP_SR_MSW_TIMESTAMP_OFFSET: 8,
    RTCP_SR_LSW_TIMESTAMP_OFFSET: 12,
    RTCP_SR_RTP_TIMESTAMP_OFFSET: 16,
    RTCP_SR_PACKETS_SENT_OFFSET: 20,
    RTCP_SR_BYTES_SENT_OFFSET: 24,
    RTCP_SDES_ITEMS_OFFSET: 8,

    // VOICE ENCRYPTION MODES
    VOICE_ENCRYPTION_PLAIN: 'plain',
    VOICE_ENCRYPTION_SODIUM: 'xsalsa20_poly1305'
};
