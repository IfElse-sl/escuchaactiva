const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		end=require('../../functions').end,
		obj='PROFESIONAL-FILE',
		formidable=require('formidable'),
		sharp=require('sharp'),
		types={'application/pdf':'pdf'}

router.all('/*',(req,res,next)=>{
	req.models=require('../orm').relations(res.locals.conn)
	next()
})


/*------------------------FUNCTION---------------------------*/
function save(dir,body){
	return new Promise(async(resolve,reject)=>{
		try{
			if(!fs.existsSync(dir)) fs.mkdirSync(dir)
			dir+=body.archivo
		console.log(dir)
			fs.writeFileSync(dir,fs.readFileSync(body.path_aux),(result)=>{console.log("RESULT",result)})
			resolve(dir)
		}catch(err){
			console.log(err)
			reject({code:400,msg:'Error al guardar archivo',error:err})
		}
	})
}

function parseBodyCV(req){
	const 	formData=new formidable.IncomingForm()
	return new Promise(async(resolve,reject)=>{
		try{
			formData.parse(req,(err,body,file)=>{
				file=file.file
				if(!file||file=={})reject({code:400,msg:'No hay archivo'})
				if(err)reject({code:400,msg:'Error en archivo: '+err})
				ext=types[file.mimetype]
				if(!ext)reject({code:406,msg:'Tipo no permitido: '+err})
				body.path="files/profesionales/"+body.profesionalID+"/"
				body.archivo=body.tipo+'_'+body.profesionalID+'.'+ext
				body.path_aux=file.filepath
				body.ext=ext
				body.contentType=file.mimetype
				resolve(body)
			}).on('error',err=>{
				console.log('Error al insertar '+obj+'. '+err)
				reject({code:400,msg:'Error en archivo: '+err})
			})
		}catch(err){
			console.log("Ocurrio un error en formData.parse : ",err)
			reject({code:400,msg:'Error al guardar archivo',error:err})
		}
	})
}

/*------------------------GET---------------------------
router.get('/profesionalID/:id',(req,res)=>{
   	const 	id=req.params.id,
   			File=req.models.File
   	
   	File.findAll({
		attributes:['ID','tipo','url','comentarios','estado','createdAt'],
		where:{
			docenteRemotoID:id,
			estado: {[Op.not]:'BAJA'}
		},
		order:['tipo']
	}).then(data=>{(!data.length)?res.json({code:204}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})*/


/*------------------------POST--------------------------*/
router.post('/constancia_monotributo',async(req,res)=>{
	const Profesional=req.models.Profesional
	try{
		var body=await parseBodyCV(req)
	}catch(err){
		end(res,'Error al convertir archivo','POST-SAVE-FILE',obj)
		return false
	}
	var dir='files/profesionales/'+body.profesionalID+"/"
	if(!fs.existsSync(dir)) fs.mkdirSync(dir)
	try{
		dir=await save(dir,body)
	}catch(err){
		end(res,'Error al guardar archivo','POST-SAVE-FILE',obj)
		return false
	}

	Profesional.update({
		constancia_monotributo:dir
	},{
		where:{ID:body.profesionalID,estado:{[Op.not]:'BAJA'}}
	}).then(data=>{(data==0)?res.json({code:404}):res.json({code:201})
	}).catch(err=>{end(res,err,'POST',obj)})
})

router.post('/perfil/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Profesional=req.models.Profesional,
			body=req.body,
			namesm='/perfil_'+id+"-sm", 	//600
			namexs='/perfil_'+id+"-xs"		//50
	var dir="files/profesionales/"+id,ext='.jpg',img
	if(!fs.existsSync(dir)) fs.mkdirSync(dir)

	const	url=dir+'/perfil_'+id
	img=sharp(new Buffer.from(body.base64.split(',')[1],'base64'),{failOnError:false}).jpeg({quality:80}).flatten({background:{r:255,g:255,b:255}})

	img.resize(600).toFile(dir+namesm+ext,(err,inf)=>{
		if(err) end(res,err,'POST-600',obj)
		else{
			img.resize(50).toFile(dir+namexs+ext,(err,inf)=>{
				if(err) end(res,err,'POST-50',obj)
				else{
					Profesional.update({foto:url},{where:{ID:id,estado:{[Op.not]:'BAJA'}}
					}).then(data=>{res.json({code:201,data:{foto:url}})
					}).catch(err=>{end(res,err,'POST-PUT',obj)})
				}
			})
		}
	})
})

router.post('/old',async(req,res)=>{
	const File=req.models.File
	try{
		var body=await parseBodyCV(req)
	}catch(err){
		end(res,'Error al convertir archivo archivo','POST-SAVE-FILE',obj)
		return false
	}

	var dir=req.urlfiles+'/docentes-remotos/'+body.docenteRemotoID+"/"
	if(!fs.existsSync(dir)) fs.mkdirSync(dir)
	try{
		dir=await save(dir,body)
	}catch(err){
		end(res,'Error al guardar archivo','POST-SAVE-FILE',obj)
		return false
	}

	File.upsert({
		docenteRemotoID:body.docenteRemotoID,
		url:dir,
		tipo:body.tipo,
		comentarios:body.comentarios
	},{
		fields:['url'],
		returning:true
	}).then(data=>{res.json({code:201,msg:(data)?'Creado':'Modificado'})
	}).catch(err=>{end(res,err,'POST',obj)})
})


/*------------------------PATCH-------------------------*/
router.patch('/delete/constancia_monotributo/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Profesional=req.models.Profesional

	Profesional.update({
		constancia_monotributo:null
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{
		if(data!=0){
			fs.unlink(body.url,err=>{console.log(err)})
			res.json({code:201})
		}else res.json({code:204})
	}).catch(err=>{end(res,err,'DELETE',obj)})
})

router.patch('/old/delete/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			File=req.models.File

	File.destroy({
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{
		if(data!=0){
			fs.unlink(body.url,err=>{console.log(err)})
			res.json({code:201})
		}else res.json({code:204})
	}).catch(err=>{end(res,err,'DELETE',obj)})
})


/*------------------------DELETE-------------------------*/
router.delete('/perfil/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Profesional=req.models.Profesional,
		 	url='files/profesionales/'+id+'/perfil_'+id,ext='.jpg',,ext='.jpg',
			namesm="-sm"+ext,namexs="-xs"+ext

	Profesional.update({
		foto:'files/profesionales/default'
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{
		if(data==0){
			res.json({code:404})
			return false
		}
		fs.unlinkSync(url+namesm)
		fs.unlinkSync(url+namexs)
		res.json({code:200})
	}).catch(err=>{end(res,err,'PATCH',obj)})
})


module.exports=router