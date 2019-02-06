var message=(from,text)=>{
    return {
        from,
        text,
        contentAt:new Date().getTime()
    }
}
module.exports={ message}