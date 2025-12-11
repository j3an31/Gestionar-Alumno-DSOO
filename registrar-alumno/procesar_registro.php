<?php
// Evitar cualquier salida antes del JSON
ob_start();

// Configurar headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Limpiar cualquier salida previa
ob_clean();

// Verificar que sea una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    // Incluir archivo de conexión
    require_once '../config/conexion.php';
    
    // Verificar que la conexión exista
    if (!isset($conexion)) {
        throw new Exception('Error de conexión a la base de datos');
    }

    // Recibir datos del formulario con validación
    $dni = trim($_POST['dni'] ?? '');
    $fecha_nacimiento = trim($_POST['fechaNacimiento'] ?? '');
    $nombres = trim($_POST['nombres'] ?? '');
    $apellidos = trim($_POST['apellidos'] ?? '');
    $genero = trim($_POST['genero'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $direccion = trim($_POST['direccion'] ?? '');
    $distrito = trim($_POST['distrito'] ?? '');
    $ciudad = trim($_POST['ciudad'] ?? '');
    $carrera = trim($_POST['carrera'] ?? '');
    $sede = trim($_POST['sede'] ?? '');
    $tipo_ingreso = trim($_POST['tipoIngreso'] ?? '');
    $cursos_seleccionados = $_POST['cursosSeleccionados'] ?? '[]';
    $creditos_totales = intval($_POST['creditosTotales'] ?? 0);

    // Validar datos obligatorios
    if (empty($dni)) {
        throw new Exception('El DNI es obligatorio');
    }
    if (empty($nombres)) {
        throw new Exception('El nombre es obligatorio');
    }
    if (empty($apellidos)) {
        throw new Exception('Los apellidos son obligatorios');
    }
    if (empty($email)) {
        throw new Exception('El email es obligatorio');
    }

    // Validar formato de email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('El formato del email no es válido');
    }

    // Validar DNI (debe ser numérico y tener 8 dígitos)
    if (!preg_match('/^\d{8}$/', $dni)) {
        throw new Exception('El DNI debe tener 8 dígitos numéricos');
    }

    // Verificar si el DNI ya existe
    $stmt = $conexion->prepare("SELECT id FROM alumnos WHERE dni = ?");
    $stmt->execute([$dni]);
    if ($stmt->fetch()) {
        throw new Exception('El DNI ' . $dni . ' ya está registrado en el sistema');
    }

    // Verificar si el email ya existe
    $stmt = $conexion->prepare("SELECT id FROM alumnos WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        throw new Exception('El email ' . $email . ' ya está registrado en el sistema');
    }

    // Validar que cursos_seleccionados sea JSON válido
    $cursos_array = json_decode($cursos_seleccionados, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato de los cursos seleccionados');
    }

    // Insertar el nuevo alumno
    $sql = "INSERT INTO alumnos (
        dni, fecha_nacimiento, nombres, apellidos, genero, 
        telefono, email, direccion, distrito, ciudad, 
        carrera, sede, tipo_ingreso, cursos_seleccionados, creditos_totales
    ) VALUES (
        :dni, :fecha_nacimiento, :nombres, :apellidos, :genero,
        :telefono, :email, :direccion, :distrito, :ciudad,
        :carrera, :sede, :tipo_ingreso, :cursos_seleccionados, :creditos_totales
    )";

    $stmt = $conexion->prepare($sql);
    
    $resultado = $stmt->execute([
        ':dni' => $dni,
        ':fecha_nacimiento' => $fecha_nacimiento ?: null,
        ':nombres' => $nombres,
        ':apellidos' => $apellidos,
        ':genero' => $genero ?: null,
        ':telefono' => $telefono ?: null,
        ':email' => $email,
        ':direccion' => $direccion ?: null,
        ':distrito' => $distrito ?: null,
        ':ciudad' => $ciudad ?: null,
        ':carrera' => $carrera ?: null,
        ':sede' => $sede ?: null,
        ':tipo_ingreso' => $tipo_ingreso ?: null,
        ':cursos_seleccionados' => $cursos_seleccionados,
        ':creditos_totales' => $creditos_totales
    ]);

    if ($resultado) {
        $alumno_id = $conexion->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Alumno registrado exitosamente',
            'id' => $alumno_id,
            'dni' => $dni,
            'nombre_completo' => $nombres . ' ' . $apellidos
        ]);
    } else {
        // Obtener información del error de PDO
        $errorInfo = $stmt->errorInfo();
        throw new Exception('Error al registrar el alumno: ' . ($errorInfo[2] ?? 'Error desconocido'));
    }

} catch(PDOException $e) {
    // Error de base de datos
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
} catch(Exception $e) {
    // Otros errores
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Limpiar el buffer y enviar
ob_end_flush();
exit;
?>