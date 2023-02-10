const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		cryptojs = require('crypto-js'),
		Op=Sequelize.Op,
		fs=require('fs'),
		end=require('../functions').end,
		enviarEmail=require('../functions').enviarEmail,
		obj='CREDENCIALES'

router.all('/*',(req,res,next)=>{
	req.models=require('./orm').relations(res.locals.conn)
	next()
})

/*------------------------POST--------------------------*/
router.post('/login',(req,res)=>{
	const 	body=req.body,
			Credencial=req.models.Credencial

	Credencial.findOne({
		attributes:['ID','pacienteID','profesionalID','pass','email','estado'],
		where:{
			email:body.email,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{
		if(!data||data.get('ID')==null){
	    	res.json({code:204})
	    	return false
		}

		let hash=data.get('pass').substr(6),
			sal=data.get('pass').substr(0,6),
			estado=data.get('estado')

		if(cryptojs.SHA3(sal+body.pass).toString()!=hash){
	    	res.json({code:204,msg:'Sin datos'})
	    	return false
		}

		if(estado=='ACTIVO') res.json({code:201,data})
		else{
			var dataAux={
				ID: data.ID,
				email:data.email
			}
			res.json({code:202,data:dataAux,msg:estado})
		}
	}).catch(err=>{end(res,err,'POST-LOGIN',obj)})
})

router.post('/login/google',(req,res)=>{
	const 	body=req.body,
			Credencial=req.models.Credencial

	res.locals.conn.transaction().then(tr=>{
		Credencial.findOne({
			attributes:['ID','pacienteID','profesionalID','email','estado','token'],
			where:{
				email:body.email,
				estado:{[Op.not]:'BAJA'}
			},
			transaction:tr
		}).then(data=>{
			if(!data){
		    	res.json({code:404})
		    	return false
			}
			var token=data.get('token'),
				ID=data.get('ID')
				dato=data

			if(body.token==token){
				res.json({code:201,data})
				return true
			}
			
			if(token==null){
				Credencial.update({
					token:body.token
				},{
					where:{
						ID:ID,
						estado:{[Op.not]:'BAJA'}
					},
					transaction:tr
				}).then(data=>{
					if(!data){
						tr.rollback()
						res.json({code:404,msg:'No se pudo actualizar el token enviado',data:{put:data}})
					}else{
						tr.commit()
						res.json({code:201,msg:'token actualizado',data:dato})
					}
    			}).catch(err=>{end(res,err,'POST-LOGIN',obj,tr)})
			}else{
				tr.rollback()
				res.json({code:401,msg:'token invalido'})
			}
    	}).catch(err=>{end(res,err,'POST-LOGIN',obj,tr)})
	})
})

/*-------------------------PATCH--------------------------*/
router.patch('/pass/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Credencial=req.models.Credencial

	Credencial.findOne({
		attributes:['pass'],
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{
		if(!data){
			res.json({code:204})
			return false
		}

		let hash=data.get('pass').substr(6),
			sal=data.get('pass').substr(0,6)

		if(cryptojs.SHA3(sal+body.pass).toString()!=hash){
	    	res.json({code:401,msg:'password incorrecta'})
	    	return false
		}

		Credencial.update({
			pass:body.newPass
		},{
			where:{
				ID:id,
				estado:{[Op.not]:'BAJA'}
			}
		}).then(data=>{(data==0)?res.json({code:404}):res.status(201).json({code:201})
    	}).catch(err=>{end(res,err,'PATCH',obj)})
    }).catch(err=>{end(res,err,'PATCH-GET',obj)})
})

router.patch('/generar-codigo/id/(:id)?',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Credencial=req.models.Credencial

	var where={
			email:body.email,
			estado:{[Op.not]:'BAJA'}
		}
	if(id!='undefined') where.ID=id
	res.locals.conn.transaction().then(tr=>{
		Credencial.findOne({
			attributes:['ID','profesionalID','pacienteID'],
			where:where,
			transaction:tr
		}).then(data=>{
			if(!data){
				res.json({code:403,msg:'Código existente'})
				return false
			}

			var codigo=String(Math.random()).slice(-5),
				dato={}
			where.ID=data.get('ID')

			switch(body.motivo){
				case 'email':
					codigo='E'+codigo
					dato.codigo=codigo
					dato.email=body.newEmail
					break;
				case 'pass':
					codigo='P'+codigo
					dato.codigo=codigo
					dato.email=body.email
					break;
				default:
					res.json({code:400,msg:'Motivo no valido'})
					return false
			}

			var query="CREATE EVENT codigo_"+codigo+where.ID+" ON SCHEDULE AT DATE_ADD(NOW(),INTERVAL 1 HOUR) DO "
			query+="UPDATE credenciales SET codigo=null WHERE ID="+where.ID+" AND codigo='"+codigo+"'"
				
			Credencial.update({
				codigo:codigo
			},{
				where:where,
				transaction:tr
			}).then(data=>{
				if(data==0){
					tr.rollback()
					res.json({code:404})
					return false
				}
				res.locals.conn.query(query,{transaction:tr}).then(async data1=>{
					await enviarEmail(require('../emails/index').mailCodigo(dato))
					tr.commit()
					res.status(201).json({code:201})	
				}).catch(err=>{end(res,err,'PATCH-EVENT',obj,tr)})
			}).catch(err=>{end(res,err,'PATCH',obj,tr)})
    	}).catch(err=>{end(res,err,'PATCH-GET',obj,tr)})
	})
})

router.patch('/cambiar-pass',(req,res)=>{
	const 	body=req.body,
			Credencial=req.models.Credencial

	res.locals.conn.transaction().then(tr=>{
		Credencial.findOne({
			attributes:['ID'],
			where:{
				email:body.email,
				codigo:body.codigo,
				estado:{[Op.not]:'BAJA'}
			}
		}).then(data=>{
			if(!data){
				tr.rollback()
				res.json({code:404})
				return false
			}

			const 	ID=data.get('ID'),
					query='DROP EVENT IF EXISTS codigo_'+body.codigo+ID

			Credencial.update({
				pass:body.pass,
				codigo:null
			},{
				where:{
					email:body.email,
					codigo:body.codigo,
					estado:{[Op.not]:'BAJA'}
				},
				transaction:tr
			}).then(data=>{
				if(data==0){
					tr.rollback()
					res.json({code:404})
					return false
				}
				res.locals.conn.query(query,{transaction:tr}).then(data1=>{
					tr.commit()
					res.json({code:201})
    			}).catch(err=>{end(res,err,'PATCH-EVENT',obj,tr)})
    		}).catch(err=>{end(res,err,'PATCH',obj,tr)})
    	}).catch(err=>{end(res,err,'PATCH-GET',obj,tr)})
 	})
})

router.patch('/confirmar-email/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			query='DROP EVENT IF EXISTS codigo_'+body.codigo+id,
			Credencial=req.models.Credencial,
			Paciente=req.models.Paciente,
			Profesional=req.models.Profesional

	res.locals.conn.transaction().then(tr=>{
		Credencial.update({
			email:body.email,
			estado:'ACTIVO',
			codigo:null
		},{
			where:{
				ID:id,
				codigo:body.codigo,
				estado:{[Op.in]:['ACTIVO','PENDIENTE','PENDIENTE-CODIGO']}
			},
			transaction:tr
		}).then(async data=>{
			if(data==0){
				tr.rollback()
				res.json({code:404})
				return false
			}
			try{
				if(body.profesionalID) await Profesional.update({estado:'ACTIVO'},{where:{ID:body.profesionalID,estado:[Op.in]:['PENDIENTE-CODIGO','ACTIVO']},transaction:tr})
				if(body.pacienteID) await Paciente.update({estado:'ACTIVO'},{where:{ID:body.pacienteID,estado:{[Op.in]:['PENDIENTE-CODIGO','ACTIVO']}},transaction:tr})
			}catch(err){
				end(res,err,'PATCH-EVENT',obj,tr)
				return false
			}

			res.locals.conn.query(query,{transaction:tr}).then(data1=>{
				tr.commit()
				res.json({code:201})
    		}).catch(err=>{end(res,err,'PATCH-EVENT',obj,tr)})
    	}).catch(err=>{end(res,err,'PATCH',obj,tr)})
 	})
})


module.exports=router