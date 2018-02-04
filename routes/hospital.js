
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var mdAutenticacion = require('../middlewares/autenticacion');

var Hospital = require('../models/hospital');

// Rutas
app.get('/', (req, res, next) => {
    // esto es para la paginacion
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find( { } )
        // para la paginacion
        .skip(desde)
        .limit(3)
        // para filtrar la consulta
        .populate('usuario', 'nombre email')
        .exec(
        ( err, _hospital ) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando Hospitales',
                errors: err
            });
        }

        // para contar la cantidad de elementos
        Hospital.count({}, (err, conteo) =>{
            res.status(200).json({
                ok: true,
                hospital: _hospital,
                Total: conteo
            });
        });
    }); 
});

// Actualizar un Usuario

app.put('/:id', mdAutenticacion.verificaToken , (req, res) => {

    var id = req.params.id;

    Hospital.findById( id, (err, _hospital) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if(!_hospital){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar hospital con id',
                errors: {mensaje: 'no existe un hospital'}
            });
        }
        var body = req.body;

        _hospital.nombre = body.nombre,
        _hospital.usuario = req.usuario._id;

        _hospital.save((err, hospitalGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error guardar hospital',
                    errors: err
                });
            }
    
            res.status(200).json({
                ok: true,
                Hospital: hospitalGuardado
            });
        });
    });
});

// Crear un nuevo hospital

app.post('/', mdAutenticacion.verificaToken ,(req, res) => {

    var body = req.body;

    var _hospital = new Hospital({
        nombre: body.nombre,        
        usuario: req.usuario._id        
    });

    _hospital.save((err, hospitalGuardado) => {
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardar hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado            
        });
    });

});

// borrado de Hospital

app.delete('/:_id', mdAutenticacion.verificaToken , (req, res) =>{
    var id= req._id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Hospital',
                errors: err
            });
        }
        if( !hospitalBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe hospital con ese id',
                errors: {mensaje: 'no existe un hospital con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;