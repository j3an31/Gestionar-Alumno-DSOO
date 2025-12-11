// Calcular créditos totales y actualizar interfaz
        const checkboxes = document.querySelectorAll('#cursosDisponibles input[type="checkbox"]');
        const creditosTotalesEl = document.getElementById('creditosTotales');
        const alertaCreditos = document.getElementById('alertaCreditos');
        const listaCursos = document.getElementById('listaCursosSeleccionados');
        const progresoBar = document.getElementById('progresoBar');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', calcularCreditos);
        });

        function calcularCreditos() {
            let total = 0;
            let cursosSeleccionados = [];

            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const creditos = parseInt(checkbox.getAttribute('data-creditos'));
                    total += creditos;
                    
                    const cursoItem = checkbox.closest('.curso-item');
                    const nombreCurso = cursoItem.querySelector('.curso-nombre').textContent;
                    const codigoCurso = cursoItem.querySelector('.curso-codigo').textContent;
                    const creditosCurso = cursoItem.querySelector('.curso-creditos').textContent;
                    cursosSeleccionados.push({ nombre: nombreCurso, codigo: codigoCurso, creditos: creditosCurso });
                }
            });

            creditosTotalesEl.textContent = total;

            // Actualizar barra de progreso
            const porcentaje = Math.min((total / 24) * 100, 100);
            progresoBar.style.width = porcentaje + '%';

            // Mostrar alerta si excede el límite
            if (total > 24) {
                alertaCreditos.style.display = 'block';
                creditosTotalesEl.style.color = '#dc2626';
                progresoBar.style.background = 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)';
            } else {
                alertaCreditos.style.display = 'none';
                creditosTotalesEl.style.color = '#1a5f3f';
                progresoBar.style.background = 'linear-gradient(90deg, #2d8659 0%, #1a5f3f 100%)';
            }

            // Actualizar lista de cursos seleccionados
            if (cursosSeleccionados.length === 0) {
                listaCursos.innerHTML = '<li class="vacio">No ha seleccionado ningún curso</li>';
            } else {
                listaCursos.innerHTML = cursosSeleccionados.map(curso => 
                    `<li><strong>${curso.nombre}</strong><br>${curso.codigo} - ${curso.creditos}</li>`
                ).join('');
            }
        }

        // Manejar envío del formulario
        document.getElementById('formularioAlumno').addEventListener('submit', function(e) {
            e.preventDefault();

            const creditos = parseInt(creditosTotalesEl.textContent);
            if (creditos > 24) {
                alert('⚠️ Error: No puede inscribirse en más de 24 créditos por ciclo académico.\n\nPor favor, reduzca su carga académica.');
                return;
            }

            if (creditos === 0) {
                alert('⚠️ Error: Debe seleccionar al menos un curso para completar el registro.');
                return;
            }

            // Recopilar datos del formulario
            const formData = {
                datosPersonales: {
                    dni: document.getElementById('dni').value,
                    nombres: document.getElementById('nombres').value,
                    apellidos: document.getElementById('apellidos').value,
                    fechaNacimiento: document.getElementById('fechaNacimiento').value,
                    genero: document.querySelector('input[name="genero"]:checked').value
                },
                datosContacto: {
                    telefono: document.getElementById('telefono').value,
                    email: document.getElementById('email').value,
                    direccion: document.getElementById('direccion').value,
                    distrito: document.getElementById('distrito').value,
                    ciudad: document.getElementById('ciudad').value
                },
                datosAcademicos: {
                    carrera: document.getElementById('carrera').value,
                    sede: document.getElementById('sede').value,
                    tipoIngreso: document.getElementById('tipoIngreso').value
                },
                matricula: {
                    cursos: Array.from(checkboxes)
                        .filter(cb => cb.checked)
                        .map(cb => ({
                            codigo: cb.value,
                            creditos: parseInt(cb.getAttribute('data-creditos'))
                        })),
                    creditosTotales: creditos
                }
            };

            console.log('═══════════════════════════════════════');
            console.log('📋 DATOS DEL NUEVO ALUMNO REGISTRADO');
            console.log('═══════════════════════════════════════');
            console.log(formData);
            console.log('═══════════════════════════════════════');
            
            alert('✅ ¡Registro Exitoso!\n\n' +
                  'El alumno ha sido registrado correctamente en el sistema.\n\n' +
                  'Nombre: ' + formData.datosPersonales.nombres + ' ' + formData.datosPersonales.apellidos + '\n' +
                  'DNI: ' + formData.datosPersonales.dni + '\n' +
                  'Carrera: ' + document.getElementById('carrera').selectedOptions[0].text + '\n' +
                  'Créditos matriculados: ' + creditos + '\n\n' +
                  'Revise la consola (F12) para ver todos los detalles.');
            
            // Opcional: Limpiar formulario después del registro
            // limpiarFormulario();
        });

        function limpiarFormulario() {
            if (confirm('¿Está seguro de que desea limpiar todos los campos del formulario?\n\nEsta acción no se puede deshacer.')) {
                document.getElementById('formularioAlumno').reset();
                checkboxes.forEach(cb => cb.checked = false);
                calcularCreditos();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        function cancelar() {
            if (confirm('¿Está seguro de que desea cancelar el registro?\n\nTodos los datos ingresados se perderán.')) {
                window.location.href = 'index.html'; // Cambiar por la URL de tu página principal
            }
        }

        // Inicializar
        calcularCreditos();