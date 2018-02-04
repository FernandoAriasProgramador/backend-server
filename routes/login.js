var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

// Para la validacion de google

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

// Constantes para google
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;


app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBd) => { 
        
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscar usuarios',
                errors: err
            });
        }
        if( !usuarioBd ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email'
            });
        }

        if( !bcrypt.compareSync ( body.password, usuarioBd.password ) ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - passwor'
            });
        }
        // Crear token
        usuarioBd.password = ':)';
        
        var token = jwt.sign({usuario: usuarioBd}, SEED, {expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioBd,
            token: token,
            id: usuarioBd._id
        });
    });


});

// Autenticacion por Google.com

app.post('/google', (req, res) => {

    var token = req.body.token || 'xxx';

    var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        function(e, login) {

            if( e ){
                return res.status(400).json({
                    ok: false,
                    mensaje:"Token no valido",
                    errors: e
                })
            }

            var payload = login.getPayload();
            var userid = payload['sub'];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];

            Usuario.findOne({email: payload.email}, (err, _usuario) => {
                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error buscar usuarios',
                        errors: err
                    });
                }

                if( _usuario ){
                    if( _usuario.google === false ){
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Debe usar su autenticacion normal'                            
                        });
                    } else {
                        _usuario.password = ':)';
        
                        var token = jwt.sign({usuario: _usuario}, SEED, {expiresIn: 14400 }); // 4 horas
                
                        res.status(200).json({
                            ok: true,
                            usuario: _usuario,
                            token: token,
                            id: _usuario._id
                        });
                    }
                }else{
                    var usuario = new Usuario();

                    usuario.nombre = payload.name;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture;
                    usuario.google = true;

                    usuario.save((err, usuarioDB) => {
                        if(err){
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al guardar usuarios',
                                errors: err
                            });
                        }
                        var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400 }); // 4 horas
                
                        res.status(200).json({
                            ok: true,
                            usuario: usuarioDB,
                            token: token,
                            id: usuarioDB._id
                        });
                    });
                }
            });
        });
});

module.exports = app;