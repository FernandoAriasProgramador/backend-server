// Requieres
var express = require('express');
var mongoose = require('mongoose');


// iniciar variables
var app = express();

// conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDb', (err, res)=> {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

// escuchar peticion

app.listen(3000, () => {
    console.log('Express server puerto 30000: \x1b[32m%s\x1b[0m', 'online');
});