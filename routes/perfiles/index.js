const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		end=require('../functions').end,
		obj='PERFIL'

router.all('/*',(req,res,next)=>{
	const modulo=req.originalUrl.split('/')
	switch(modulo[3]){
		case 'permisos':
			router.use('/'+modulo[3],require('./'+modulo[3]))
			break;
		default:
			req.models=require('./orm').relations(res.locals.conn)
			break;
	}
	next()
})


/*------------------------GET---------------------------*/
router.get('/',(req,res)=>{
   	const Perfil=req.models.Perfil
   	
   	Perfil.findAll({
		attributes:['ID','nombre','estado','createdAt'],
		where:{estado:{[Op.not]:'BAJA'}},
		order: ['nombre']
   	}).then(data=>{(!data.length)?res.sendStatus(204):res.status(200).json(data)
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Perfil=req.models.Perfil,
			Permiso=req.models.Permiso,
			Modulo=req.models.Modulo,
			Accion=req.models.Accion,
			Permiso_Accion=req.models.Permiso_Accion

	Perfil.findOne({
		attributes:['ID','nombre','estado','createdAt'],
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		},
		include:{
			model:Permiso,
			attributes:['moduloID'],
			include:{
				model:Permiso_Accion,
				//attributes:[[Sequelize.literal('GROUP_CONCAT(accionID)'),'acciones']],
				attributes:['accionID'],
				required:false
			}
		}
	}).then(data=>{
		if(!data){
			res.sendStatus(204)
			return false
		}
		permisos=data.get('permisos').map(e=>e.get({plain:true}))
		acciones=permisos.filter(e=>e.permisos_acciones.length>0)
		var IDs='('+permisos.map(e=>e.moduloID).toString()+')',
			accionIDs='('+acciones.map(e=>e.permisos_acciones.map(a=>a.accionID)).toString()+')',
			auxAttrAcciones=(accionIDs.length>2)?Sequelize.literal('IF(`modulos_acciones`.`ID` IN '+accionIDs+',true,false)'):Sequelize.literal('false')
			dataP=data

		Modulo.findAll({
			attributes:['ID','parentID','title','routerLink','icon','hasSubMenu','estado',
				[Sequelize.literal('IF(`modulos`.`ID` IN '+IDs+',true,false)'),'checked']],
			where:{
				ID:{[Op.ne]:0},
				parentID:0,
				estado:{[Op.not]:'BAJA'}
			},
			order:['title'],
			include:[{
				model:Modulo,as:'children',
				attributes:['ID','parentID','title','routerLink','icon','hasSubMenu','estado',
					[Sequelize.literal('IF(`children`.`ID` IN '+IDs+',true,false)'),'checked']],
				where:{estado:{[Op.not]:'BAJA'}},
				order:['title'],
				required:false,
				include:[{
					model:Modulo,as:'children',
					attributes:['ID','parentID','title','routerLink','icon','hasSubMenu','estado',
						[Sequelize.literal('IF(`children->children`.`ID` IN '+IDs+',true,false)'),'checked']],
					where:{estado: {[Op.not]: 'BAJA'}},
					order:['title'],
					required:false,
					include:{
						model:Accion,
						attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios',
							[(accionIDs.length>2)?Sequelize.literal('IF(`children->children->modulos_acciones`.`ID` IN '+accionIDs+',true,false)'):Sequelize.literal('false'),'checked']],
						where:{estado:'ACTIVO'},
						required:false,
						include:{
							model:Accion,as:'children',
							attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios',
								[(accionIDs.length>2)?Sequelize.literal('IF(`children->children->modulos_acciones->children`.`ID` IN '+accionIDs+',true,false)'):Sequelize.literal('false'),'checked']],
							where:{estado:'ACTIVO'},
							required:false
						}
					}
				},{
					model:Accion,
					attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios',
						[(accionIDs.length>2)?Sequelize.literal('IF(`children->modulos_acciones`.`ID` IN '+accionIDs+',true,false)'):Sequelize.literal('false'),'checked']],
					where:{estado:'ACTIVO'},
					required:false,
					include:{
						model:Accion,as:'children',
						attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios',
							[(accionIDs.length>2)?Sequelize.literal('IF(`children->modulos_acciones->children`.`ID` IN '+accionIDs+',true,false)'):Sequelize.literal('false'),'checked']],
						where:{estado:'ACTIVO'},
						required:false
					}
				}]
			},{
				model:Accion,
				attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios',
					[(accionIDs.length>2)?Sequelize.literal('IF(`modulos_acciones`.`ID` IN '+accionIDs+',true,false)'):Sequelize.literal('false'),'checked']],
				where:{estado:'ACTIVO'},
				required:false,
				include:{
					model:Accion,as:'children',
					attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios',
						[(accionIDs.length>2)?Sequelize.literal('IF(`modulos_acciones->children`.`ID` IN '+accionIDs+',true,false)'):Sequelize.literal('false'),'checked']],
					where:{estado:'ACTIVO'},
					required:false
				}
			}]
		}).then(data=>{
			dataP.dataValues.modulos=data;
			data=dataP;
			(!data)?res.sendStatus(204):res.status(200).json(data)
		}).catch(err=>{end(res,err,'GET-2',obj)})
	}).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	const 	body=req.body,
			modulos=body.modulos,
			Perfil=req.models.Perfil,
			Permiso=req.models.Permiso,
			Permiso_Accion=req.models.Permiso_Accion
	modulos.unshift({moduloID:0})

	res.locals.conn.transaction().then(tr=>{
		Perfil.create({
			nombre:body.nombre,
			permisos:modulos
		},{
			include:{
				model:Permiso,
				include:{model:Permiso_Accion,as:'acciones'}
			},
			transaction:tr
		}).then(data=>{
			const ID=data.get('ID')
			tr.commit()
			res.status(201).json({data:{ID}})
		}).catch(err=>{end(res,err,'POST',obj,tr)})
	})
})


/*------------------------DELETE------------------------*/
router.delete('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Perfil=req.models.Perfil

	res.locals.conn.transaction().then(tr=>{
		Perfil.destroy({where:{ID:id}
		}).then(data => {(data!=0)?res.sendStatus(200):res.sendStatus(204)
		}).catch(err=>{end(res,err,'DELETE',obj,tr)})
	})
})


/*------------------------PUT---------------------------*/
router.put('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Perfil=req.models.Perfil,
			Permiso=req.models.Permiso,
			Permiso_Accion=req.models.Permiso_Accion
	var modulos=body.modulos
	
	modulos.unshift({moduloID:0})
	modulos.forEach(e=>{e.perfilID=id})

	res.locals.conn.transaction().then(tr=>{
		Perfil.update({
			nombre:body.nombre
		},{
			where:{
				ID:id,
				estado:{[Op.not]:'BAJA'}
			},
			transaction:tr
		}).then(data=>{
			if(data==0){
				tr.rollback()
				res.sendStatus(204)
				return false
			}
			Permiso.destroy({where:{perfilID:id},transaction:tr
			}).then(data=>{
				if(data==0){
					tr.rollback()
					res.sendStatus(204)
					return false
				}
				Permiso.bulkCreate(modulos,{include:{model:Permiso_Accion,as:'acciones'},transaction:tr
				}).then(data=>{
					tr.commit()
					res.sendStatus(201)
				}).catch(err=>{end(res,err,'PUT-POST',obj,tr)})
			}).catch(err=>{end(res,err,'PUT-DELETE',obj,tr)})
		}).catch(err=>{end(res,err,'PUT',obj,tr)})
	})
})


/*------------------------PATCH--------------------------*/
router.patch('/nombre/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Perfil=req.models.Perfil

	Perfil.update({
		nombre: body.nombre
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data!=0)?res.sendStatus(201):res.sendStatus(204)
	}).catch(err=>{end(res,err,'POST-PUT',obj)})
})

router.patch('/estado/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Perfil=req.models.Perfil,
			Permiso=req.models.Permiso,
			Permiso_Accion=req.models.Permiso_Accion
	var put={estado:body.estado}
	if(body.estado=='BAJA') put.nombre=Sequelize.literal('concat(nombre,"+BAJA+",ID)')

	res.locals.conn.transaction().then(tr=>{
		Perfil.update(put,{
			where:{
				ID:id,
				estado:{[Op.not]:'BAJA'}
			},
			transaction:tr
		}).then(data=>{
			if(data==0){
				tr.rollback()
				res.sendStatus(204)
				return false
			}
			Permiso.update({
				estado:body.estado
			},{
				where:{
					perfilID:id,
					estado:{[Op.not]:'BAJA'}
				},
				transaction:tr
			}).then(data=>{
				if(data==0){
					tr.rollback()
					res.sendStatus(204)
					return false
				}else{
					tr.commit()
					res.sendStatus(201)
				}
			}).catch(err=>{end(res,err,'PATCH-2',obj,tr)})
 		}).catch(err=>{end(res,err,'PATCH',obj,tr)})
	})
})


module.exports=router