const 	router=require('express').Router(),
		end=require('../../functions').end,
		obj='TIPOS-DOCUMENTOS'

router.all('/*',(req,res,next)=>{
    req.models=require('./orm').model(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/',(req,res)=>{
	const 	TipoDocumento=req.models.TipoDocumento
	
	TipoDocumento.findAll({
		attributes:['ID','nombre'],
		where:{estado:'ACTIVO'}
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})


module.exports=router;