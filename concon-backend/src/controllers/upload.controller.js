const catchAsync = require("../utils/catchAsync");
const { generatePresignedUploadUrl } = require("../services/upload.service");

exports.getPresignedUrl = catchAsync(async (req, res) => {
    const { filename, mimeType, size } = req.body;

    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    if (size > MAX_FILE_SIZE) {
        return res.status(400).json({ message: "File too large" });
    }

    const { uploadUrl, key, publicUrl } = await generatePresignedUploadUrl({
        userId: req.userId,
        filename,
        mimeType,
    });

    res.json({
        data: {
            uploadUrl, // client PUTs the raw file bytes here directly
            url: publicUrl, // what gets stored on the Message once upload succeeds
            key,
            mimeType,
            size,
        },
    });
});