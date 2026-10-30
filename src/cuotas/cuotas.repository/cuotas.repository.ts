
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CuotasRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // ============================================================
  // NORMALIZACIÓN DE PERÍODOS
  // ============================================================

  /**
   * Acepta:
   * - MM/YYYY  ->  YYYY-MM-01
   * - YYYY-MM  ->  YYYY-MM-01
   * - YYYY-MM-DD -> YYYY-MM-01
   *
   * La base de datos almacena siempre el primer día del mes.
   */
  private normalizarPeriodo(periodo: string): string {
    const valor = String(periodo).trim();

    let anio: number;
    let mes: number;

    const formatoMesAnio = valor.match(/^(\d{1,2})\/(\d{4})$/);

    const formatoAnioMes = valor.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);

    if (formatoMesAnio) {
      mes = Number(formatoMesAnio[1]);
      anio = Number(formatoMesAnio[2]);
    } else if (formatoAnioMes) {
      anio = Number(formatoAnioMes[1]);
      mes = Number(formatoAnioMes[2]);
    } else {
      throw new Error(
        'Formato de período inválido. Utilizá MM/YYYY o YYYY-MM-DD.',
      );
    }

    if (
      !Number.isInteger(anio) ||
      !Number.isInteger(mes) ||
      anio < 2000 ||
      mes < 1 ||
      mes > 12
    ) {
      throw new Error('El período indicado no es válido.');
    }

    return `${anio}-${String(mes).padStart(2, '0')}-01`;
  }

  // ============================================================
  // CONTROL DE ACCESO ACADÉMICO
  // ============================================================

  async puedeAccederAlumno(idAlumno: number): Promise<boolean> {
    const result = await this.databaseService.query(
      `
      SELECT
        CASE
          WHEN EXTRACT(DAY FROM CURRENT_DATE) <= 10
            THEN TRUE
          ELSE EXISTS (
            SELECT 1
            FROM cuota c
            WHERE c.id_alumno = $1
              AND c.periodo = DATE_TRUNC('month', CURRENT_DATE)::DATE
              AND LOWER(TRIM(c.estado)) = 'pagado'
          )
        END AS puede_acceder;
      `,
      [idAlumno],
    );

    return result.rows[0]?.puede_acceder === true;
  }

  // ============================================================
  // CREAR CUOTA DEL MES ACTUAL
  // ============================================================

  async crearCuota(idAlumno: number, monto: number) {
    const result = await this.databaseService.query(
      `
      INSERT INTO cuota (
        id_alumno,
        periodo,
        monto,
        vencimiento,
        estado
      )
      VALUES (
        $1,
        DATE_TRUNC('month', CURRENT_DATE)::DATE,
        $2,
        MAKE_DATE(
          EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
          EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
          10
        ),
        'Pendiente'
      )
      RETURNING
        *,
        TO_CHAR(periodo, 'MM/YYYY') AS mes_anio,
        EXTRACT(MONTH FROM periodo)::INTEGER AS mes,
        EXTRACT(YEAR FROM periodo)::INTEGER AS anio,
        vencimiento AS fecha_vencimiento;
      `,
      [idAlumno, monto],
    );

    return result.rows[0] ?? null;
  }

  // ============================================================
  // GENERAR CUOTAS PARA TODOS LOS ALUMNOS
  // ============================================================

  async generarCuotasMes(monto: number) {
    const result = await this.databaseService.query(
      `
      INSERT INTO cuota (
        id_alumno,
        periodo,
        monto,
        vencimiento,
        estado
      )
      SELECT
        a.id_alumno,
        DATE_TRUNC('month', CURRENT_DATE)::DATE,
        $1,
        MAKE_DATE(
          EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
          EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
          10
        ),
        'Pendiente'
      FROM alumnos a

      ON CONFLICT (id_alumno, periodo)
      DO NOTHING

      RETURNING
        *,
        TO_CHAR(periodo, 'MM/YYYY') AS mes_anio,
        EXTRACT(MONTH FROM periodo)::INTEGER AS mes,
        EXTRACT(YEAR FROM periodo)::INTEGER AS anio,
        vencimiento AS fecha_vencimiento;
      `,
      [monto],
    );

    return {
      success: true,
      cantidadGenerada: result.rows.length,
      cuotas: result.rows,
      mensaje: 'Cuotas del mes generadas correctamente.',
    };
  }

  // ============================================================
  // OBTENER CUOTA POR ID
  // ============================================================

  async obtenerCuota(idCuota: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        c.id_cuota,
        c.id_alumno,
        c.periodo,

        TO_CHAR(c.periodo, 'MM/YYYY') AS mes_anio,
        EXTRACT(MONTH FROM c.periodo)::INTEGER AS mes,
        EXTRACT(YEAR FROM c.periodo)::INTEGER AS anio,

        c.monto,
        c.vencimiento,
        c.vencimiento AS fecha_vencimiento,
        c.estado,

        u.id_usuario,
        u.nombre,
        u.apellido,
        u.email

      FROM cuota c

      INNER JOIN alumnos a
        ON a.id_alumno = c.id_alumno

      INNER JOIN users u
        ON u.id_usuario = a.id_usuario

      WHERE c.id_cuota = $1;
      `,
      [idCuota],
    );

    return result.rows[0] ?? null;
  }

  // ============================================================
  // OBTENER CUOTAS DE UN ALUMNO
  // ============================================================

  async obtenerCuotasAlumno(idAlumno: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        c.id_cuota,
        c.id_alumno,
        c.periodo,

        TO_CHAR(c.periodo, 'MM/YYYY') AS mes_anio,
        EXTRACT(MONTH FROM c.periodo)::INTEGER AS mes,
        EXTRACT(YEAR FROM c.periodo)::INTEGER AS anio,

        c.monto,
        c.vencimiento,
        c.vencimiento AS fecha_vencimiento,
        c.estado

      FROM cuota c

      WHERE c.id_alumno = $1

      ORDER BY c.periodo DESC, c.id_cuota DESC;
      `,
      [idAlumno],
    );

    return result.rows;
  }

  // ============================================================
  // SALDO PENDIENTE DE UN ALUMNO
  // ============================================================

  async saldoPendienteAlumno(idAlumno: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        COALESCE(SUM(monto), 0) AS saldo

      FROM cuota

      WHERE id_alumno = $1
        AND LOWER(TRIM(estado)) <> 'pagado';
      `,
      [idAlumno],
    );

    return Number(result.rows[0]?.saldo ?? 0);
  }

  // ============================================================
  // CREAR CUOTA CON RUTINA
  // ============================================================

  async crearCuotaConRutina(
    idAlumno: number,
    _concepto: string,
    periodo: string,
    importe: number,
    vencimiento: string,
  ) {
    const periodoNormalizado = this.normalizarPeriodo(periodo);

    const result = await this.databaseService.query(
      `
      INSERT INTO cuota (
        id_alumno,
        periodo,
        monto,
        vencimiento,
        estado
      )
      VALUES (
        $1,
        $2::DATE,
        $3,
        $4::DATE,
        'Pendiente'
      )
      RETURNING
        *,
        TO_CHAR(periodo, 'MM/YYYY') AS mes_anio,
        EXTRACT(MONTH FROM periodo)::INTEGER AS mes,
        EXTRACT(YEAR FROM periodo)::INTEGER AS anio,
        vencimiento AS fecha_vencimiento;
      `,
      [
        idAlumno,
        periodoNormalizado,
        importe,
        vencimiento,
      ],
    );

    return result.rows[0] ?? null;
  }
}
