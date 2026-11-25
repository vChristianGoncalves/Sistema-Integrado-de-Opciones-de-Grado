# SIA-OG · Sistema Integrado de Opciones de Grado

Frontend para la **inscripción y gestión de opciones de grado en modalidad investigativa** de la Corporación Universitaria Iberoamericana (Dirección de Investigación y Transferencia · Coordinación de Investigación y Creación).

Tecnologías: Vue 3 (`<script setup>`), Vite, Tailwind CSS, Pinia, Vue Router 4, Axios y Lucide.
Funciona con datos simulados y está preparado para conectarse a un API REST en PHP.

## Cómo ejecutarlo

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev      # abre http://localhost:5173
npm run build    # versión de producción en /dist
```

### Cuentas de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Estudiante | `vruizc12@estudiante.ibero.edu.co` | `Estudiante2026*` |
| Coordinación | `coord.investigaciones@academico.ibero.edu.co` | `Coordinacion2026*` |

En la pantalla de ingreso hay botones que rellenan estas credenciales. La estudiante de demostración es ficticia.

Prueba sugerida: entra como estudiante y radica una preinscripción → sal → entra como coordinación, envíala a validación, registra los avales y el docente asesor, y apruébala. Los datos simulados viven en memoria y se reinician al recargar la página.

## Fuentes de la información real

| Documento | Qué se tomó |
|---|---|
| Resolución 617 de 2024 (Reglamento de Investigación) | Modalidades (arts. 26 y 27), requisitos por modalidad (arts. 35, 52, 60, 64), requisitos de finalización (arts. 41, 50, 58, 62, 66), nota mínima 3,5 (art. 30), una sola opción de grado (art. 25), máximos de integrantes |
| Comunicado de opción de grado | Mínimo 60 % de avance académico, descripción de las cinco modalidades, flujograma |
| Formulario de inscripción 2026-20 / 2026-34-44 y P4 | Título de la convocatoria, fecha máxima (14 de agosto de 2026), correo y horario de contacto, campos del estudiante |
| Validación de requisitos | Aval académico del programa, aval financiero, estructura de las bases (asignatura, ID, NRC, periodo, docente asesor) |
| Asignación docente y creación de aulas | Asignaturas TG I / TG II, notificación formal, OMP, formatos por modalidad |
| Ruta de opción de grado | Ruta del proceso y enlaces institucionales |

Los textos de la convocatoria (periodos, fecha límite, contacto, enlaces) están en un solo archivo: `src/utilidades/institucion.js`.

## Estructura del proyecto

Los archivos y carpetas tienen nombre en español; el código interno (variables y funciones) se mantiene en inglés.

```text
src/
├── api/              clienteHttp.js (Axios + interceptores), errorApi.js, almacenamientoSesion.js
├── servicios/        servicioAutenticacion, servicioEstudiante, servicioCoordinacion  ← único punto que cambia al integrar PHP
│   └── configuracion.js   bandera USE_MOCK_DATA
├── simulados/        modalidades, requisitos, estudiantes, usuarios, docentes, solicitudes (.json) + baseDatos.js
├── estado/           estadoAutenticacion, estadoInscripcion (asistente), estadoCoordinacion (bandeja y filtros)
├── rutas/            rutas por rol con protección
├── plantillas/       PlantillaEstudiante (barra superior), PlantillaCoordinacion (menú lateral)
├── componentes/
│   ├── comun/        BotonBase, EtiquetaEstado, ModalBase, ZonaCargaArchivos
│   ├── estudiante/   ProgresoPasos, TarjetaResumenEstudiante, TarjetaAyuda, RutaProceso, Paso1Modalidad … Paso4Confirmacion
│   └── coordinacion/ TarjetaIndicador, TablaSolicitudes, FiltrosSolicitudes, PanelDetalleSolicitud
├── utilidades/       institucion.js (datos de la convocatoria), estados.js, requisitos.js (motor de reglas), formato.js
├── recursos/         estilos.css
└── vistas/           autenticacion/VistaInicioSesion, estudiante/VistaInscripcion,
                      coordinacion/VistaPanelGeneral, coordinacion/VistaSolicitudes, VistaNoEncontrada
```

Flujo de datos: Vista → Estado (Pinia) → Servicio → (`simulados` | API).

### Rutas

| Ruta | Rol | Vista |
|---|---|---|
| `/ingresar` | sin sesión | Inicio de sesión |
| `/estudiante/inscripcion` | estudiante | Preinscripción en 4 pasos |
| `/coordinacion/panel` | coordinación | Indicadores por modalidad, facultad y estado |
| `/coordinacion/solicitudes` | coordinación | Bandeja con filtros, validación de avales, asignación de docente y exportación de la base |

## Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | URL base del API PHP, p. ej. `http://localhost:8000/api` |
| `VITE_USE_MOCK_DATA` | `true` usa `src/simulados`; `false` consume el API real |
| `VITE_API_WITH_CREDENTIALS` | `true` para Laravel Sanctum en modo SPA (cookies + XSRF) |

## Contrato esperado del API PHP

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/auth/login` | `{ email, password }` → `{ token, user: { id, name, email, role: 'student' \| 'admin', studentId? } }` |
| POST | `/auth/logout` | Cierra sesión |
| GET | `/estudiantes/me/perfil` | `academicProgress`, `gpa`, `researchCourseStatus`, `seedbedPeriods`, `level`, `facultyCode`… (ver `simulados/estudiantes.json`) |
| GET | `/modalidades` | Catálogo (ver `simulados/modalidades.json`) |
| GET | `/requisitos` | Catálogo con `rule { field, op, value }` |
| POST | `/estudiantes/me/inscripciones` | `multipart/form-data`: `modality_id`, `fields[clave]`, `documents[clave][]`, `observations` |
| GET | `/coordinacion/solicitudes` | Listado (ver `simulados/solicitudes.json`) |
| GET | `/coordinacion/docentes` | Docentes asesores |
| PATCH | `/coordinacion/solicitudes/{id}/validacion` | `{ academic_endorsement, financial_endorsement, advisor, course, nrc }` |
| PATCH | `/coordinacion/solicitudes/{id}/estado` | `{ status: 'en_revision' \| 'aprobada' \| 'rechazada' \| 'devuelta', comment }` |

Errores de validación en formato Laravel (`422 { message, errors }`). La validación de requisitos del frontend es solo retroalimentación inmediata: el backend debe repetirla.
