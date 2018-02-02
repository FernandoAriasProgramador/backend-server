// Requieres
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// iniciar variables
var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// importar rutas
var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login');
var usuarioRoutes = require('./routes/usuario');

// conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDb', (err, res)=> {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// escuchar peticion

app.listen(3000, () => {
    console.log('Express server puerto 30000: \x1b[32m%s\x1b[0m', 'online');
});