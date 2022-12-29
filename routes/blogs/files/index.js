const 	router=require('express').Router(),
		Sequelize=require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		orm=require('../orm'),
		end=require('../../functions').end,
		obj='VIDEOS'

router.all('/*',(req,res,next)=>{
	req.models=orm.relations(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/blogID/:id',(req,res)=>{
	const 	id=String(req.params.id),
			BlogFile=req.models.BlogFile

	BlogFile.findOne({
		attributes: ['ID','titulo','url','estado','createdAt'],
		where:{
			blogID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(!data)?res.json({code:404}):res.json({code:200,data})
    }).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	const 	body=req.body,
			BlogFile=req.models.BlogFile

	BlogFile.create({
		blogID:body.blogID,
		titulo:body.titulo,
		url:body.url
	}).then(data=>{
		const ID=data.get('ID')
		res.json({code:201,data:{ID}})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.post('/file',(req,res)=>{
	if(req.body.base64==null){
		res.sendStatus(204)
		return false
	}
	var dir=req.urlfiles+"/files/"
	const 	body=req.body,
			date=new Date(),mls=date.getTime(),year=date.getFullYear(),
			types={'application/pdf':'.pdf','text/plain':'.txt',
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'.docx',
					'image/jpeg':'.jpeg','image/jpg':'.jpg','image/png':'.png'},
			ext=types[body.base64.split(';')[0].split(':')[1]]
	if(!fs.existsSync(dir)) fs.mkdirSync(dir)
	dir+=year
	if(!fs.existsSync(dir)) fs.mkdirSync(dir)
	dir+='/'+mls+ext

	fs.writeFile(dir,body.base64.split(',')[1],'base64',(err)=>{(!err)?res.status(201).json({dir:dir.replace(req.urlfiles,'files')}):res.status(400).send(err)})
})


/*------------------------PUT---------------------------*/
router.put('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			BlogFile=req.models.BlogFile

	BlogFile.update({
		titulo:body.titulo,
		url:body.url
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
			BlogFile=req.models.BlogFile

	BlogFile.update({
		estado:body.estado
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data!=0)?res.json({code:201}):res.json({code:404})
    }).catch(err=>{end(res,err,'PATCH',obj)})
})


module.exports=router