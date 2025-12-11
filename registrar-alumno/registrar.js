// Capturar el envío del formulario
document.getElementById('formularioAlumno').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validar que no exceda los créditos
    const creditosTotales = parseInt(document.getElementById('creditosTotales').textContent);
    if (creditosTotales > 24) {
        alert('❌ No puedes matricular más de 24 créditos');
        return;
    }
    
    if (creditosTotales === 0) {
        alert('❌ Debes seleccionar al menos un curso');
        return;
    }
    
    // Recopilar los cursos seleccionados
    const cursosSeleccionados = [];
    document.querySelectorAll('#cursosDisponibles input[type="checkbox"]:checked').forEach(checkbox => {
        const cursoItem = checkbox.closest('.curso-item');
        const nombreCurso = cursoItem.querySelector('.curso-nombre').textContent;
        
        cursosSeleccionados.push({
            codigo: checkbox.value,
            nombre: nombreCurso,
            creditos: parseInt(checkbox.dataset.creditos)
        });
    });
    
    // Crear FormData con todos los datos del formulario
    const formData = new FormData(this);
    formData.append('cursosSeleccionados', JSON.stringify(cursosSeleccionados));
    formData.append('creditosTotales', creditosTotales);
    
    // Mostrar mensaje de carga
    const btnSubmit = this.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<span>⏳</span> Guardando...';
    btnSubmit.disabled = true;
    
    try {
        // Enviar datos al servidor
        const response = await fetch('procesar_registro.php', {
            method: 'POST',
            body: formData
        });
        
        // Verificar si la respuesta HTTP es exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        // Verificar que la respuesta sea JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const textoRespuesta = await response.text();
            console.error('Respuesta del servidor (no JSON):', textoRespuesta);
            throw new Error("El servidor no devolvió JSON válido. Revisa la consola para más detalles.");
        }
        
        // Parsear la respuesta JSON
        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        
        // Procesar la respuesta
        if (data.success) {
            alert('✅ ' + data.message + '\n\nAlumno registrado con ID: ' + data.id);
            // Limpiar el formulario
            limpiarFormulario();
            // Opcional: redirigir a otra página después de 1 segundo
            // setTimeout(() => { window.location.href = 'home.html'; }, 1000);
        } else {
            alert('❌ Error: ' + (data.message || 'Error desconocido'));
        }
        
    } catch (error) {
        console.error('Error detallado:', error);
        
        // Mensaje de error más específico
        let mensajeError = '❌ Error al procesar la solicitud:\n\n';
        
        if (error.message.includes('HTTP')) {
            mensajeError += '• Problema de conexión con el servidor\n';
            mensajeError += '• Verifica que Apache esté corriendo en XAMPP\n';
            mensajeError += '• Verifica que el archivo procesar_registro.php exista\n';
        } else if (error.message.includes('JSON')) {
            mensajeError += '• El servidor no respondió correctamente\n';
            mensajeError += '• Revisa la consola (F12) para ver la respuesta completa\n';
            mensajeError += '• Verifica que procesar_registro.php devuelva JSON válido\n';
        } else if (error.message.includes('Failed to fetch')) {
            mensajeError += '• No se pudo conectar con el servidor\n';
            mensajeError += '• Verifica que XAMPP esté corriendo\n';
            mensajeError += '• Verifica la URL del archivo PHP\n';
        } else {
            mensajeError += error.message;
        }
        
        alert(mensajeError);
        
    } finally {
        // Restaurar botón siempre (éxito o error)
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
});

// Función para limpiar el formulario
function limpiarFormulario() {
    const formulario = document.getElementById('formularioAlumno');
    if (formulario) {
        formulario.reset();
    }
    
    const creditosTotales = document.getElementById('creditosTotales');
    if (creditosTotales) {
        creditosTotales.textContent = '0';
    }
    
    const progresoBar = document.getElementById('progresoBar');
    if (progresoBar) {
        progresoBar.style.width = '0%';
    }
    
    const listaCursos = document.getElementById('listaCursosSeleccionados');
    if (listaCursos) {
        listaCursos.innerHTML = '<li class="vacio">No ha seleccionado ningún curso</li>';
    }
    
    // Desmarcar todos los checkboxes
    document.querySelectorAll('#cursosDisponibles input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
}

// Función para cancelar
function cancelar() {
    if (confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los datos ingresados.')) {
        window.location.href = 'home.html';
    }
}

// Validación adicional: Prevenir envío múltiple
let enviando = false;

document.getElementById('formularioAlumno').addEventListener('submit', function(e) {
    if (enviando) {
        e.preventDefault();
        alert('⏳ Ya se está procesando una solicitud. Por favor espera.');
        return false;
    }
    enviando = true;
    
    // Resetear después de 10 segundos por seguridad
    setTimeout(() => {
        enviando = false;
    }, 10000);
});