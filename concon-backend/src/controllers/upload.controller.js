const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/apiResponse");
const { generatePresignedUploadUrl } = require("../services/upload.service");

exports.getPresignedUrl = catchAsync(async (req, res) => {
    const { mimeType, size } = req.body;

    const { uploadUrl, key, publicUrl } = await generatePresignedUploadUrl({
        userId: req.userId,
        mimeType,
        size,
    });

    return success(res, 200, {
        uploadUrl, // client PUTs the raw file bytes here directly (with matching Content-Type and Content-Length)
        key, // send this back as content.key when posting the message
        url: publicUrl,
        mimeType,
        size,
    });
});