exports.mailProfesional=(body)=>{
    let as='',encabezado=''
    switch (body.estado){
        case'PENDIENTE':
            as='Registro PENDIENTE'
            encabezado='<b>Falta menos....!</b><br><p>Ya recibimos tu solicitud de registro! Cuando sea autorizado recibirás un correo electronico indicando el estado actual</p>'
            break;

        case'ACTIVO':
            as='Registro CONFIRMADO'
            encabezado+='<b>Felicidades!</b><br><p>Tu negocio ya se encuentra autorizado para comenzar a recibir reservas!</p>'
            break;

        case 'INACTIVO':
            as='Registro DENEGADO'
            encabezado+='<b>Oops</b><br><p>Tu negocio NO ha sido autorizado. Comunicate con la administración para obtener mas información.</p>'
            break;
    }
    return{
        to:body.email,
        asunto:as,
        cuerpo:encabezado,
        foot:`<td bgcolor="${body.color}" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`	 
    }
}

exports.mailReserva=(body)=>{
    let encabezado='<b style=font-size: 24px;>'

    switch (body.estado){
        case'CANCELADA COMERCIO':
        case'CANCELADA CONSUMIDOR':
            encabezado+='La siguiente reserva ha sido CANCELADA: </b><br>'
            break;
        
        case 'PENDIENTE':
            encabezado+='Ya recibimos tu reserva, la misma se encuentra PENDIENTE, a confirmar por el restaurante. <br> Verifique que los datos sean correctos:</b><br>'
            break;
            
        case 'CONFIRMADA':
            encabezado+='Felicidades! tu reserva ya se encuentra CONFIRMADA: </b><br>'    
        break;
    }
    
    return{
        to:body.email,
        asunto:`Reserva ${body.estado}`,
        cuerpo:`${encabezado}<p>Fecha: <b>${body.fecha_hora}</b></p>
                <p>Cantidad:<b> ${body.cantidad}</b></p>`,
        foot:`<td bgcolor="${body.color}" style="padding: 30px 30px 30px 30px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
                <p style="text-align: end;">Muchas Gracias!</p>
                </td>
                </tr>
                </table>
                </td>`
    }
}

exports.putFechaSesion_pac=(body)=>{
    return{
        to:body.paciente.email,
        asunto:body.paciente.nombre+" se cambió la fecha de su sesión!",
        cuerpo:`<b style=font-size: 24px;>Se cambió la fecha de su proxima sesión con código <b>${body.ID}</b></b><br>
            <p>Nueva fecha: <b>${body.fecha}</b>.</p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`	
    }
}
exports.putFechaSesion_prof=(body)=>{
    return{
        to:body.profesional.email,
        asunto:body.profesional.nombre+" nueva fecha para una sesión!",
        cuerpo:`<b style=font-size: 24px;>Se cambió la fecha de su proxima sesión con el paciente ${body.paciente.nombre} código <b>${body.ID}</b></b><br>
            <p>Se liberó el turno previamente asignado.</p>
            <p>Nueva fecha: <b>${body.fecha}</b>.</p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`  
    }
}
exports.nuevaSesion_prof=(body)=>{
    return{
        to:body.profesional.email,
        asunto:body.profesional.nombre+" tienes una nueva sesión!",
        cuerpo:`<b style=font-size: 24px;>Buenisimo!</b><br>
            <p>El paciente <b>${body.paciente.nombre}</b> reservo una turno con codigo ${body.ID}, contigo el <b>${body.fecha}</b>.</p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`  
    }
}
exports.nuevaSesion_pac=(body)=>{
    return{
        to:body.paciente.email,
        asunto:body.paciente.nombre+" tienes una nueva sesión!",
        cuerpo:`<b style=font-size: 24px;>Buenisimo!</b><br>
            <p>Has reservado un turno con codigo ${body.ID}, con el profesional <b>${body.profesional.nombre}</b> para la fecha <b>${body.fecha}</b>.</p>
            <p>Recuerde realizar el pago para confirmar la reserva.</p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`  
    }
}
exports.finSesion=(body)=>{
    return{
        to:body.paciente.email,
        asunto:body.paciente.nombre+" su sesión ha finalizado!",
        cuerpo:`<b style=font-size: 24px;>Felicidades!</b><br>
            <p>Ha finalizado su sesión con código <b>${body.ID}</b>.</p>
            <p>Coordine su próxima sesión con el profesional desde la plataforma.</p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`  
    }
}
exports.ausenteSesion=(body)=>{
    return{
        to:body.paciente.email,
        asunto:body.paciente.nombre+" no se presentó a su sesión :(",
        cuerpo:`<b style=font-size: 24px;>Se ha marcado como ausente en su sesión con codigo: ${body.ID} !</b><br>
            <p>Coordine otra con el profesional desde la plataforma.</p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`  
    }
}
exports.cancelSesion_previo_prof=(body)=>{
    return{
        to:body.profesional.email,
        asunto:body.profesional.nombre+" se ha cancelado una sesión!",
        cuerpo:`<b style=font-size: 24px;>Que pena!</b><br>
            <p>Se ha cancelado la sesion ${body.ID} con <b>${body.paciente.nombre}</b> el <b>${body.fecha}</b>.</p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`  
    }
}
exports.cancelSesion_previo_pac=(body)=>{
    return{
        to:body.paciente.email,
        asunto:body.paciente.nombre+" se ha cancelado tu sesión!",
        cuerpo:`<b style=font-size: 24px;>Importante!</b><br>
            <p>Se ha cancelado la sesion ${body.ID} con <b>${body.profesional.nombre}</b> el <b>${body.fecha}</b>.</p>
            <p>Le informaremos cuando el profesional realice la devolucion del pago.</p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`  
    }
}
exports.cancelSesion_pac=(body)=>{
    return{
        to:body.paciente.email,
        asunto:body.paciente.nombre+" su sesión ha sido cancelada!",
        cuerpo:`<b style=font-size: 24px;>Se ha cancelado su proxima sesión con codigo ${body.ID} !</b><br>
            <p>Coordine otra con el profesional desde la plataforma.</p>
            <p>Por politicas, no podemos solicitar la devolución del pago al profesional ya que el tiempo limite es de 48 hs previo a la sesión.</p>
            <p>Igualmente usted puede optar por enviarle un mail al profesional y explicarle la situación de su cancelación.</p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`  
    }
}
exports.cancelSesion_prof=(body)=>{
    return{
        to:body.profesional.email,
        asunto:body.profesional.nombre+" su sesión ha sido cancelada!",
        cuerpo:`<b style=font-size: 24px;>Se ha cancelado su proxima sesión con el paciente ${body.paciente.nombre} con codigo ${body.ID} !</b><br>
            <p>Se ha liberado un turno para ${body.fecha}.</p>
            <p>Es posible que el paciente se comunique con usted por fuera de la plataforma, recuerde siempre tratar a los demas con empatía y respeto :) .</p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`  
    }
}

exports.mailOpinion=(body)=>{
    return{
        to:body.email,
        asunto:body.nombre+" tienes una nueva reseña!",
        cuerpo:`<b style=font-size: 24px;>Recibiste una nueva reseña!</b><br>
            <p>Recibiste <b>${body.puntaje}</b> estrellas.</p>
            <p><i>'${body.comentarios}'</i></p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`  
    }
}

exports.mailCofirmacion=(body)=>{
    return{
        to:body.credencial.email,
        asunto:body.nombre+" Requerimos verificación",
        cuerpo:`<b style="font-size: 24px;">Codigo de validacion:</b><br>
                <p><b style="font-size: 40px;">${body.credencial.codigo}</b></p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`	
    }
}

exports.mailCodigo=(body)=>{
    return{
        to:body.email,
        asunto:"Requerimos verificación",
        cuerpo:`<b style="font-size: 24px;">Codigo de validacion:</b><br>
                <p><b style="font-size: 40px;">${body.codigo}</b></p>`,
        foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
            <p style="text-align: end;">Muchas Gracias!</p>
            </td>
            </tr>
            </table>
            </td>`  
    }
}


// exports.mailComercioPendiente={
//     asunto:"Verificacion pendiente",
//     cuerpo:`<b>Felicidades!</b><br>
//             <p>Ya recibimos tu solicitud de registro! Cuando sea autorizado recibirás un correo indicando el estado actual</p>`,
//     foot:`<td bgcolor="#E6E828" style="padding: 30px 30px 30px 30px;">
//          <table border="0" cellpadding="0" cellspacing="0" width="100%">
//          <tr>
//          <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
//          <p style="text-align: end;">Muchas Gracias!</p>
//          </td>
//          </tr>
//          </table>
//          </td>`
// }
// exports.mailComercioAlta={
//     asunto:"Registro confirmado",
//     cuerpo:,
//     foot:`<td bgcolor="#74a345" style="padding: 30px 30px 30px 30px;">
//          <table border="0" cellpadding="0" cellspacing="0" width="100%">
//          <tr>
//          <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
//          <p style="text-align: end;">Muchas Gracias!</p>
//          </td>
//          </tr>
//          </table>
//          </td>`
// }
// exports.mailComercioBaja={
//     asunto:"Registro denegado",
//     cuerpo:`<b>Oops</b><br>
//            <p>Tu negocio NO ha sido autorizado. Comunicate con la administración para obtener mas info.</p>`,
//     foot:`<td bgcolor="#FC3137" style="padding: 30px 30px 30px 30px;">
//          <table border="0" cellpadding="0" cellspacing="0" width="100%">
//          <tr>
//          <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
//          <p style="text-align: end;">Muchas Gracias!</p>
//          </td>
//          </tr>
//          </table>
//         </td>`
// }

