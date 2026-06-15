from pydantic import BaseModel, Field


class PerfilBaseRequest(BaseModel):
    nombres: str
    apellidos: str
    correo_institucional: str
    dni: str | None = None
    telefono: str | None = None


class EstudianteCreateRequest(PerfilBaseRequest):
    fecha_nacimiento: str | None = None
    observaciones: str | None = None
    password: str = Field(default="Estudiante123", min_length=6)


class EstudianteUpdateRequest(BaseModel):
    nombres: str | None = None
    apellidos: str | None = None
    correo_institucional: str | None = None
    dni: str | None = None
    telefono: str | None = None
    fecha_nacimiento: str | None = None
    observaciones: str | None = None
    estado: bool | None = None


class DocenteCreateRequest(PerfilBaseRequest):
    especialidad: str | None = None
    cargo: str | None = None
    grado_academico: str | None = None
    password: str = Field(default="Docente123", min_length=6)


class DocenteUpdateRequest(BaseModel):
    nombres: str | None = None
    apellidos: str | None = None
    correo_institucional: str | None = None
    dni: str | None = None
    telefono: str | None = None
    especialidad: str | None = None
    cargo: str | None = None
    grado_academico: str | None = None
    estado: bool | None = None


class ApoderadoCreateRequest(PerfilBaseRequest):
    ocupacion: str | None = None
    direccion: str | None = None
    estudiante_id: str | None = None
    parentesco: str | None = None
    es_principal: bool = False
    password: str = Field(default="Padre123", min_length=6)


class ApoderadoUpdateRequest(BaseModel):
    nombres: str | None = None
    apellidos: str | None = None
    correo_institucional: str | None = None
    dni: str | None = None
    telefono: str | None = None
    ocupacion: str | None = None
    direccion: str | None = None
    estado: bool | None = None


class ApoderadoVinculoRequest(BaseModel):
    estudiante_id: str
    parentesco: str
    es_principal: bool = False


class UsuarioCreateRequest(PerfilBaseRequest):
    rol_codigo: str
    password: str = Field(min_length=6)


class UsuarioUpdateRequest(BaseModel):
    nombres: str | None = None
    apellidos: str | None = None
    correo_institucional: str | None = None
    dni: str | None = None
    telefono: str | None = None
    rol_codigo: str | None = None
    estado: bool | None = None


class MatriculaCreateRequest(BaseModel):
    estudiante_id: str
    anio_academico_id: str
    seccion_id: str
    estado_codigo: str = "ACTIVA"


class MatriculaUpdateRequest(BaseModel):
    anio_academico_id: str | None = None
    seccion_id: str | None = None
    estado_codigo: str | None = None


class AsignaturaCreateRequest(BaseModel):
    nombre: str
    codigo: str | None = None
    area: str | None = None


class CursoAsignadoCreateRequest(BaseModel):
    anio_academico_id: str
    seccion_id: str
    asignatura_id: str
    docente_id: str


class CalificacionCreateRequest(BaseModel):
    estudiante_id: str
    curso_asignado_id: str
    periodo_academico_id: str
    tipo_evaluacion_id: str
    nombre_evaluacion: str
    nota: float
    peso: float = 1
    observacion: str | None = None
    registrado_por_docente_id: str


class CalificacionUpdateRequest(BaseModel):
    nombre_evaluacion: str | None = None
    nota: float | None = None
    peso: float | None = None
    observacion: str | None = None
    docente_id: str | None = None


class HorarioCreateRequest(BaseModel):
    curso_asignado_id: str
    dia_semana: int
    hora_inicio: str
    hora_fin: str
    aula: str | None = None


class HorarioUpdateRequest(BaseModel):
    curso_asignado_id: str | None = None
    dia_semana: int | None = None
    hora_inicio: str | None = None
    hora_fin: str | None = None
    aula: str | None = None


class TareaCreateRequest(BaseModel):
    curso_asignado_id: str
    docente_id: str
    titulo: str
    descripcion: str | None = None
    fecha_entrega: str
    archivo_url: str | None = None


class AsistenciaRegistroRequest(BaseModel):
    estudiante_id: str
    curso_asignado_id: str
    estado_codigo: str
    fecha: str
    observacion: str | None = None
    registrado_por_docente_id: str | None = None


class EntregaCalificarRequest(BaseModel):
    nota: float | None = None
    retroalimentacion: str | None = None
    estado_codigo: str | None = None
    docente_id: str | None = None


class EntregaEstudianteRequest(BaseModel):
    estudiante_id: str
    descripcion: str | None = None
    archivo_url: str | None = None


class PensionGenerarRequest(BaseModel):
    anio: int
    mes: int
    monto: float
    concepto_codigo: str = "PENSION"
    seccion_id: str | None = None


class PagoAnularRequest(BaseModel):
    motivo: str | None = None


class PagoCreateRequest(BaseModel):
    pension_id: str
    estudiante_id: str | None = None
    apoderado_id: str | None = None
    metodo_pago_codigo: str
    monto: float
    codigo_operacion: str | None = None
    comprobante_url: str | None = None


class ComunicadoCreateRequest(BaseModel):
    titulo: str
    contenido: str
    autor_id: str
    rol_destinatario_codigo: str | None = None
    nivel_id: str | None = None
    grado_id: str | None = None
    seccion_id: str | None = None
    archivo_url: str | None = None
    publicado: bool = True


class ComunicadoUpdateRequest(BaseModel):
    titulo: str | None = None
    contenido: str | None = None
    rol_destinatario_codigo: str | None = None
    nivel_id: str | None = None
    grado_id: str | None = None
    seccion_id: str | None = None
    archivo_url: str | None = None
    publicado: bool | None = None


class EventoCreateRequest(BaseModel):
    titulo: str
    descripcion: str | None = None
    fecha_inicio: str
    fecha_fin: str | None = None
    lugar: str | None = None
    creado_por_perfil_id: str
    rol_destinatario_codigo: str | None = None
    nivel_id: str | None = None
    grado_id: str | None = None
    seccion_id: str | None = None


class EventoUpdateRequest(BaseModel):
    titulo: str | None = None
    descripcion: str | None = None
    fecha_inicio: str | None = None
    fecha_fin: str | None = None
    lugar: str | None = None
    rol_destinatario_codigo: str | None = None
    nivel_id: str | None = None
    grado_id: str | None = None
    seccion_id: str | None = None


class SeguimientoCreateRequest(BaseModel):
    estudiante_id: str
    apoderado_id: str | None = None
    estado_codigo: str
    observacion: str | None = None
    ultima_comunicacion: str | None = None
    registrado_por_perfil_id: str | None = None


class RecursoCreateRequest(BaseModel):
    titulo: str
    descripcion: str | None = None
    curso_asignado_id: str
    tipo_recurso_codigo: str
    estado: bool = True
    archivo_url: str | None = None
    nombre_archivo: str | None = None
    docente_id: str | None = None


class RecursoUpdateRequest(BaseModel):
    titulo: str | None = None
    descripcion: str | None = None
    curso_asignado_id: str | None = None
    tipo_recurso_codigo: str | None = None
    archivo_url: str | None = None
    nombre_archivo: str | None = None


class VentaDetalleRequest(BaseModel):
    producto_venta_id: str
    cantidad: int = 1
    precio_unitario: float | None = None


class VentaCreateRequest(BaseModel):
    estudiante_id: str | None = None
    apoderado_id: str | None = None
    metodo_pago_codigo: str
    items: list[VentaDetalleRequest]


class AnioAcademicoUpdateRequest(BaseModel):
    fecha_inicio: str | None = None
    fecha_fin: str | None = None
    activo: bool | None = None


class AnioAcademicoCreateRequest(BaseModel):
    anio: int
    fecha_inicio: str
    fecha_fin: str
    activo: bool | None = False


class PeriodoAcademicoCreateRequest(BaseModel):
    anio_academico_id: str
    nombre: str
    orden: int
    fecha_inicio: str
    fecha_fin: str


class MetodoPagoCreateRequest(BaseModel):
    codigo: str
    nombre: str


class MetodoPagoUpdateRequest(BaseModel):
    nombre: str | None = None
    activo: bool | None = None


class ConfiguracionPersonalRequest(BaseModel):
    tema_oscuro: bool | None = None
    notificaciones_email: bool | None = None
    notificaciones_push: bool | None = None


class SeccionCreateRequest(BaseModel):
    anio_academico_id: str
    grado_id: str
    nombre: str
    aula: str | None = None
    capacidad: int | None = None


class SeccionUpdateRequest(BaseModel):
    nombre: str | None = None
    aula: str | None = None
    capacidad: int | None = None
