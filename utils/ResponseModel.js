const APIMessageResponse = (res, status, message) => {
    return res.status(status).json({ "message": message });
}
const APIDataResponse = (res, status, data) => {
    return res.status(status).json(data);
}

module.exports = { APIDataResponse, APIMessageResponse }