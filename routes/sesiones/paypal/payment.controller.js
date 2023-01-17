const dotenv = require("dotenv");
const axios = require("axios");
const { encryp, descrypt, sumarDias } = require('./utils')
dotenv.config();
const { Op } = require('sequelize')
const BASE_URL = process.env.URL_PAYPAL;
let tokenAuth;
class PaymentController {
    constructor() { }

    async crearOrden(req, res) {
        const url = BASE_URL + '/v2/checkout/orders';
        const body = req.body;
        const Pago = req.models.Pago;
        const Profesional = req.models.Profesional;
        try {
            const profesional = await Profesional.findOne({
                attributes: ['secret', "clientID"],
                where: {
                    ID: body.reference.profesionalID,
                    estado: { [Op.not]: 'BAJA' }
                }
            })
            if (!profesional.get('secret') || !profesional.get('clientID')) return res.json({
                code:404,
                msg: "El profesional no tiene las credenciales o no existe"
            })
            const order = {
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: JSON.stringify(body.reference),
                    amount: {
                        currency_code: "USD",
                        value: body.price,
                        breakdown: {
                            item_total: {
                                currency_code: "USD",
                                value: body.price
                            }
                        }
                    },
                    items: [
                        {
                            name: body.title,
                            description: body.descripcion,
                            unit_amount: {
                                currency_code: "USD",
                                value: body.price
                            },
                            quantity: "1"
                        }
                    ]
                }],
                application_context: {
                    brand_name: 'Ifelse',
                    landing_page: 'LOGIN',
                    user_action: 'PAY_NOW',
                    return_url: "http://localhost:4000/api/sesiones/capturar-orden",
                    cancel_url: "http://localhost:4000/api/cancelar-orden"
                }
            }
            
            //Colocar los siguientes valores a la url que estan codificado
            const params = new URLSearchParams();
            params.append("grant_type", "client_credentials");
            const { data: { access_token } } = await axios.post('https://api-m.sandbox.paypal.com/v1/oauth2/token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                auth: {
                    username: descrypt(profesional.get("clientID")),
                    password: descrypt(profesional.get("secret"))
                }
            })

            const response = await axios.post(url, order, {
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${access_token}`
                },
            });
            const ID = body.reference.pagoID;
            const url_pago = response.data.links.filter(elem => elem.rel === 'approve').pop().href;
            await Pago.update({
                url_pago,
                order: url_pago.split('=').pop(),
                token_order: encryp(access_token)
            }, {
                where: {
                    ID
                }
            })
            res.json({
                code: 201,
                url: url_pago
            })
        } catch (error) {
            console.log(error);
            res.status(500).send('Error en crear orden')
        }
    }

    async capturarOrden(req, res) {
        try {
            const Sesion = req.models.Sesion,
                Pago = req.models.Pago;
            const { token } = req.query;
            const url = `${BASE_URL}/v2/checkout/orders/${token}/capture`;
            //busco token
            const pago = await Pago.findOne({
                attributes: ['token_order'],
                where: { order: token }
            })
            const response = await axios.post(url, {}, {
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${descrypt(pago.get('token_order'))}`
                },
            })
            if (response.data.status === "COMPLETED") {
                const paypalID = response.data.purchase_units[0].payments.captures[0].id;
                const reference = JSON.parse(response.data.purchase_units[0].reference_id)
                const sesionID = reference.sesionID
                const pagoID = reference.pagoID
                res.locals.conn.transaction().then(async tr => {
                    try {
                        await Sesion.update({ estado: 'ACTIVO' }, {
                            where: {
                                ID: sesionID,
                                estado: { [Op.not]: 'BAJA' }
                            },
                            transaction: tr
                        });

                        await Pago.update({
                            estado: 'PAGADO',
                            fechaPago: new Date().toISOString(),
                            paypalID,
                            order: '',
                            token_order: '',
                            estado: 'PAGADO'
                        }, {
                            where: {
                                ID: pagoID,

                            },
                            transaction: tr
                        })
                        tr.commit();
                        // * En la respuesta de pago exitoso en realidad va un redirect a la pagina o donde sea
                        res.send("Pago exitoso: " + response.data.purchase_units[0].payments[0])
                    } catch (error) {
                        console.log(error);
                        tr.rollback();
                        res.send('Algo salio mal en capturar el pago')
                    }
                })
            }
        } catch (error) {
            console.log(error);
            tr.rollback();
            res.send('Algo salio mal en capturar el pago')
        }
    }

    async devolucionOrden(req, res) {
        try {
            const Sesion = req.models.Sesion,
                Profesional= req.models.Profesional,
                Pago = req.models.Pago,
                body = req.body;
            // Obtengo secret y cliente para generar token
            const profesional = await Profesional.findOne({
                attributes: ['secret', "clientID"],
                where: {
                    ID: body.profesionalID,
                    estado: { [Op.not]: 'BAJA' }
                }
            })
            //Colocar los siguientes valores a la url que estan codificado
            const params = new URLSearchParams();
            params.append("grant_type", "client_credentials");
            const { data: { access_token } } = await axios.post('https://api-m.sandbox.paypal.com/v1/oauth2/token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                auth: {
                    username: descrypt(profesional.get("clientID")),
                    password: descrypt(profesional.get("secret"))
                }
            })

            const data = await Sesion.findOne({
                attributes: ['fecha'],
                where: {
                    ID: body.sesionID,
                    estado: 'ACTIVO'
                },
                include: {
                    model: Pago,
                    as: 'pago',
                    attributes: ['monto', 'paypalID'],
                    where: {
                        ID: body.pagoID,
                        estado: 'PAGADO'
                    }
                }
            })
            if (data) {
                const fecha = data.get('fecha');
                const pago = data.get('pago');
                let fechaActual = new Date();
                fechaActual = sumarDias(fechaActual, 2);
                const fg = new Date(fecha).getTime() - fechaActual.getTime();
                if (fg > 0) {
                    const url = `${BASE_URL}/v2/payments/captures/${pago.paypalID}/refund`;
                    const response = await axios.post(url, {}, {
                        headers: {
                            "Content-Type": 'application/json',
                            Authorization: `Bearer ${access_token}`
                        },
                    })
                    if (response.data.status === "COMPLETED") {
                        await Sesion.update({ 
                            estado: 'CANCELADA' 
                        }, {
                            where: {
                                ID: body.sesionID  
                            },
                        });

                        Pago.update({
                            tipo:'DEVOLUCION',
                            paypalID:''
                        }, {
                            where: {
                                ID: body.pagoID,
                            }
                        })
                        res.json({
                            code: 201,
                            msg: "Devolucion realizada con exito!"
                        })
                    } else {
                        console.log(response.data);
                        res.json({
                            code: 500,
                            msg: "Error al realizar devolucion: " + response.data.status
                        })
                    }
                } else {
                    res.json({
                        code: 404,
                        msg: "El reembolso es valido hasta 48hs antes de la sesion",
                        fecha_sesion: fecha.toLocaleString()
                    })
                }
            }
        } catch (error) {
            console.log(error);
            res.send('Algo salio mal')
        }
    }
}

module.exports = PaymentController;