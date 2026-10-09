import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdministracionRepository {
  constructor(private readonly database: DatabaseService) {}

  async verificarAdministrador(idUsuario: number): Promise<void> {
    const result = await this.database.query(
      `SELECT 1
       FROM users u
       INNER JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = $1
         AND LOWER(r.rol) = LOWER('Administrador')
       LIMIT 1`,
      [idUsuario],
    );

    if (!result.rowCount) {
      throw new ForbiddenException('El usuario no tiene permisos de administrador.');
    }
  }

  async dashboard(idUsuario: number) {
    await this.verificarAdministrador(idUsuario);

    const [alumnos, profesores, grupos, clases, pendientes, ingresos, asistencia] =
      await Promise.all([
        this.database.query(`SELECT COUNT(*)::int AS total FROM alumnos`),
        this.database.query(`SELECT COUNT(*)::int AS total FROM profesores`),
        this.database.query(`SELECT COUNT(*)::int AS total FROM grupos WHERE activo = TRUE`),
        this.database.query(`SELECT COUNT(*)::int AS total FROM clase WHERE fecha = CURRENT_DATE`),
        this.database.query(
          `SELECT COUNT(*)::int AS cantidad, COALESCE(SUM(monto), 0)::numeric AS monto
           FROM cuota WHERE LOWER(COALESCE(estado, '')) = 'pendiente'`,
        ),
        this.database.query(
          `SELECT COUNT(*)::int AS cantidad, COALESCE(SUM(monto), 0)::numeric AS monto
           FROM pago
           WHERE LOWER(COALESCE(estado, '')) IN ('approved', 'aprobado')`,
        ),
        this.database.query(
          `SELECT COUNT(*) FILTER (WHERE LOWER(estado) = 'presente')::int AS presentes,
                  COUNT(*) FILTER (WHERE LOWER(estado) = 'ausente')::int AS ausentes
           FROM asistencia`,
        ),
      ]);

    return {
      alumnos: alumnos.rows[0]?.total ?? 0,
      profesores: profesores.rows[0]?.total ?? 0,
      grupos: grupos.rows[0]?.total ?? 0,
      clasesHoy: clases.rows[0]?.total ?? 0,
      cuotasPendientes: pendientes.rows[0]?.cantidad ?? 0,
      montoPendiente: Number(pendientes.rows[0]?.monto ?? 0),
      pagosAprobados: ingresos.rows[0]?.cantidad ?? 0,
      ingresos: Number(ingresos.rows[0]?.monto ?? 0),
      asistencia: {
        presentes: asistencia.rows[0]?.presentes ?? 0,
        ausentes: asistencia.rows[0]?.ausentes ?? 0,
      },
    };
  }

  async alumnos(idUsuario: number, buscar = '') {
    await this.verificarAdministrador(idUsuario);
    const termino = buscar?.trim() ?? '';

    const result = await this.database.query(
      `SELECT a.id_alumno, u.id_usuario, u.nombre, u.apellido, u.email, u.dni, u.celular,
              a.es_menor,
              COUNT(DISTINCT i.id_inscripcion) FILTER (WHERE LOWER(i.estado) = 'activo')::int AS grupos_activos,
              COALESCE((
                SELECT SUM(mc.cantidad) FROM movimiento_credito mc
                WHERE mc.id_alumno = a.id_alumno
              ), 0)::int AS creditos_aprox
       FROM alumnos a
       INNER JOIN users u ON u.id_usuario = a.id_usuario
       LEFT JOIN inscripcion i ON i.id_alumno = a.id_alumno
       WHERE ($1 = ''
          OR LOWER(COALESCE(u.nombre, '') || ' ' || COALESCE(u.apellido, '')) LIKE LOWER('%' || $1 || '%')
          OR LOWER(COALESCE(u.email, '')) LIKE LOWER('%' || $1 || '%')
          OR COALESCE(u.dni, '') LIKE '%' || $1 || '%')
       GROUP BY a.id_alumno, u.id_usuario, u.nombre, u.apellido, u.email, u.dni, u.celular, a.es_menor
       ORDER BY u.apellido, u.nombre`,
      [termino],
    );
    return result.rows;
  }

  async grupos(idUsuario: number) {
    await this.verificarAdministrador(idUsuario);
    const result = await this.database.query(
      `SELECT g.id_grupo, d.disciplina, g.nivel, g.cupo_max, g.activo,
              COUNT(i.id_inscripcion) FILTER (WHERE LOWER(COALESCE(i.estado, '')) = 'activo')::int AS alumnos,
              u.nombre || ' ' || u.apellido AS profesor
       FROM grupos g
       INNER JOIN disciplinas d ON d.id_disciplina = g.id_disciplina
       INNER JOIN profesores p ON p.id_profesor = g.id_profesor
       INNER JOIN users u ON u.id_usuario = p.id_usuario
       LEFT JOIN inscripcion i ON i.id_grupo = g.id_grupo
       GROUP BY g.id_grupo, d.disciplina, g.nivel, g.cupo_max, g.activo, u.nombre, u.apellido
       ORDER BY d.disciplina, g.nivel`,
    );
    return result.rows;
  }

  async cuotasPendientes(idUsuario: number) {
    await this.verificarAdministrador(idUsuario);
    const result = await this.database.query(
      `SELECT c.id_cuota, c.id_alumno, u.nombre, u.apellido, u.email,
              c.mes_anio, c.monto, c.vencimiento, c.estado
       FROM cuota c
       INNER JOIN alumnos a ON a.id_alumno = c.id_alumno
       INNER JOIN users u ON u.id_usuario = a.id_usuario
       WHERE LOWER(c.estado) = 'pendiente'
       ORDER BY c.vencimiento, u.apellido, u.nombre`,
    );
    return result.rows;
  }

  async pagosRecientes(idUsuario: number) {
    await this.verificarAdministrador(idUsuario);
    const result = await this.database.query(
      `SELECT p.id_pago, p.id_cuota, p.monto, p.fecha_pago, p.estado,
              p.metodo_pago, p.id_mercado_pago, u.nombre, u.apellido, u.email
       FROM pago p
       INNER JOIN cuota c ON c.id_cuota = p.id_cuota
       INNER JOIN alumnos a ON a.id_alumno = c.id_alumno
       INNER JOIN users u ON u.id_usuario = a.id_usuario
       ORDER BY p.fecha_pago DESC NULLS LAST, p.id_pago DESC
       LIMIT 50`,
    );
    return result.rows;
  }
}
