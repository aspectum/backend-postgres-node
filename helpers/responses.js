function success(res, msg, data, code) {
    console.log(msg);
    if (!data) data = null;
    if (!code) code = 200;

    return res.status(code).send({
        success: true,
        data
    })
}

function failure(res, msg, data, code) {
    console.log(msg);
    if (!data) data = null;
    if (!code) code = 400;

    return res.status(code).send({
        success: false,
        data
    })
}

module.exports = {
    success,
    failure
}