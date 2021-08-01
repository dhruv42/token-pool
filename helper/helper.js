function calculateTimeStampDifference(token) {
    const tokenArr = token.split("-");
    const difference = new Date().getTime() - tokenArr[tokenArr.length-1];
    const diffrenceInSeconds = Math.floor(difference/1000);
    return diffrenceInSeconds;
}

module.exports = {
    calculateTimeStampDifference
}