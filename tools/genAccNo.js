const genAccNumber = () => {
    var s1 = ""
    for(var i = 0; i<6 ; i++ ){
        s1 += Math.floor(Math.random(1,10) * 10)
    }
    return s1
}

module.exports = genAccNumber