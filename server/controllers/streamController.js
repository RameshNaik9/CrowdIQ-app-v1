const streamService = require('../services/streamService');

exports.setupStream = async (req, res, next) => {
    try {
        const { username, password, ip, port, channel, streamType } = req.body;
        const rtspUrl = streamService.generateRTSPUrl({ username, password, ip, port, channel, streamType });
        await streamService.startStream(rtspUrl);
        res.status(200).json({ message: 'Stream setup successfully' });
    } catch (error) {
        next(error);
    }
};
