const 	router=require('express').Router(),
		Sequelize=require('sequelize'),
		Op=Sequelize.Op,
		end=require('../../functions').end,
		obj='TEMAS'

router.all('/*',function(req,res,next){
	req.models=require('./orm').relations(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/p/:p/l/:l',(req,res)=>{
   	const 	l=parseInt(req.params.l),p=(req.params.p)*l,
			Tema=req.models.Tema

	if(l>100) return res.json({code:400,msg:'Limit debe ser menor a 100'})
   	Tema.findAll({
		attributes:['ID','nombre','estado'],
		where:{estado:{[Op.not]:'BAJA'}},
		limit:[p,l],
		order:[['ID','DESC']]
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
    }).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/to-select/p/:p/l/:l',(req,res)=>{
   	const 	l=parseInt(req.params.l),p=(req.params.p)*l,
			Tema=req.models.Tema

	if(l>100) return res.json({code:400,msg:'Limit debe ser menor a 100'})
   	Tema.findAll({
		attributes:['ID','nombre'],
		where: {estado:'ACTIVO'},
		limit:[p,l],
		order:[['ID','DESC']]
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
    }).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Tema=req.models.Tema

	Tema.findOne({
		attributes: ['ID','nombre','estado','createdAt'],
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(!data)?res.json({code:404}):res.json({code:200,data})
    }).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	const 	body=req.body,
			Tema=req.models.Tema

	Tema.create({
		nombre:body.nombre
	}).then(data=>{
		const ID=data.get('ID')
		res.json({code:201,data:{ID}})
    }).catch(err=>{end(res,err,'POST',obj)})
})

router.post('/search/p/:p/l/:l',(req,res)=>{
   	const 	l=parseInt(req.params.l),p=(req.params.p-1)*l,
			like='%'+req.body.like+'%',
			Tema=req.models.Tema

	if(like.length<=4) return res.json({code:400,msg:'La longitud debe ser mayor a 2'})
	if(l>100) return res.json({code:400,msg:'Limit debe ser menor a 100'})

   	Tema.findAll({
		attributes:['ID','nombre','estado'],
		where:{
			nombre:{[Op.like]:like},
			estado:'ACTIVO'
		},
		limit:[p,l],
		order:[['ID','DESC']]
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:201,data})
    }).catch(err=>{end(res,err,'POST-SEARCH',obj)})
})


/*------------------------PUT---------------------------*/
router.put('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Tema=req.models.Tema

	Tema.update({
		nombre: body.nombre
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data!=0)?res.json({code:201}):res.json({code:404})
    }).catch(err=>{end(res,err,'PUT',obj)})
})


/*------------------------PATCH-------------------------*/
router.patch('/estado/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Tema=req.models.Tema
	var put={estado:body.estado}
	if(body.estado=='BAJA')put.nombre=Sequelize.literal('concat(nombre,"+",ID)')

	Tema.update(put,{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data!=0)?res.json({code:201}):res.json({code:404})
    }).catch(err=>{end(res,err,'PUT',obj)})
})


module.exports=router