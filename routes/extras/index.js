const 	router=require('express').Router(),
		Sequelize=require('sequelize'),
		XMLHttpRequest=require("xmlhttprequest").XMLHttpRequest,
		Op=Sequelize.Op,
		end=require('../functions').end,
		obj='PROVINCIA',obj2='LOCALIDAD',obj3='PAIS'

router.all('/*',(req,res,next)=>{
	const modulo=req.originalUrl.split('/')
	switch(modulo[3]){
		case 'tiposDocumentos':
			router.use('/'+modulo[3],require('./'+modulo[3]))
			break;
		default:
			req.models=require('./orm').model(res.locals.conn)
	}
   next()
})

/*------------------------GET---------------------------*/
router.get('/paises',(req,res)=>{
	const Pais=req.models.Pais

	Pais.findAll({
		attributes:['ID','nombre'],
		where:{estado:{[Op.not]:'BAJA'}},
		order:['nombre']
	}).then(data=>{(!data.length)?res.json({code:404}):res.status(200).json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj3)})
})

router.get('/provincias/paisID/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Provincia=req.models.Provincia

	Provincia.findAll({
		attributes:['ID','nombre'],
		where:{
			paisID:id,
			estado:{[Op.not]:'BAJA'}
		},
		order:['nombre']
	}).then(data=>{(!data.length)?res.json({code:404}):res.status(200).json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/localidades/provinciaID/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Localidad=req.models.Localidad

	Localidad.findAll({
		attributes:['ID','nombre'],
		where:{
			provinciaID:id,
			estado:{[Op.not]:'BAJA'}
		},
		order:['nombre']
	}).then(data=>{(!data.length)?res.json({code:404}):res.status(200).json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj2)})
})

router.get('/dolar',(req,res)=>{
	const 	t=String(req.params.t),
			tipos={oficial:'Dolar Oficial',blue:'Dolar Blue',bitcoin:'Bitcoin',turista:'Dolar turista'}

	var xhr=new XMLHttpRequest()
	xhr.addEventListener("readystatechange",()=>{
		if(xhr.readyState===4){
			try{
				if(xhr.status==200){
					var data=JSON.parse(xhr.responseText)
					data=data.map(e=>{return {nombre:e.casa.nombre,compra:e.casa.compra.replace(',','.'),venta:e.casa.venta.replace(',','.')}})
					res.status(200).json({code:200,data})
				}else res.status(400).json({code:400,msg:'No se pudo obtener cotizacion'})
			}catch(err){
				console.log(err)
				res.status(400).json({code:400,msg:'No se pudo obtener cotizacion: '+err})
			}
		}
	})
	xhr.open("GET","https://www.dolarsi.com/api/api.php?type=valoresprincipales")
	xhr.setRequestHeader("Content-Type","application/json")
	xhr.send()
})

router.get('/dolar/tipo/:t',(req,res)=>{
	const 	t=String(req.params.t),
			tipos={oficial:'Dolar Oficial',blue:'Dolar Blue',bitcoin:'Bitcoin',turista:'Dolar turista'}

	var xhr=new XMLHttpRequest()
	xhr.addEventListener("readystatechange",()=>{
		if(xhr.readyState===4){
			try{
				if(xhr.status==200){
					var data=JSON.parse(xhr.responseText)
					data=data.filter(e=>e.casa.nombre==tipos[t])
					data={nombre:data[0].casa.nombre,compra:data[0].casa.compra.replace(',','.'),venta:data[0].casa.venta.replace(',','.')}
					res.status(200).json({code:200,data})
				}else res.status(400).json({code:400,msg:'No se pudo obtener cotizacion'})
			}catch(err){
				console.log(err)
				res.status(400).json({code:400,msg:'No se pudo obtener cotizacion: '+err})
			}
		}
	})
	xhr.open("GET","https://www.dolarsi.com/api/api.php?type=valoresprincipales")
	xhr.setRequestHeader("Content-Type","application/json")
	xhr.send()
})


module.exports=router