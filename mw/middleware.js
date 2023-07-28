module.exports.mw = function mw (req,res,next){

    console.log('logging.....');
    next();
}