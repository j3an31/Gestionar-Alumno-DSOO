<?php
try {
    $host = 'localhost';
    $db = 'nombre_de_tu_base_de_datos';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    $conexion = new PDO($dsn, $user, $pass, $options);
    
} catch (PDOException $e) {
    // Log del error (para desarrollo)
    error_log("Error de conexión: " . $e->getMessage());
    
    // Respuesta JSON de error
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Error al conectar con la base de datos'
    ]);
    exit;
}
?>