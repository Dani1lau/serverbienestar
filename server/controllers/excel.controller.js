import XLSX from "xlsx";
import bcrypt from "bcrypt";
import { Ficha } from "../models/ficha.model.js";
import { Horario } from "../models/horario.model.js";
import { Instructor } from "../models/instructor.model.js";
import { Usuario } from "../models/usuario.model.js";
import { Rol } from "../models/rol.model.js";
import { Administrador } from "../models/administrador.model.js";
import { Capacitador } from "../models/capacitador.model.js";
import { Taller } from "../models/taller.model.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { Op } from "sequelize";

class ExcelController {
  static async cargarFichas(req, res) {
    try {
      const filePath = req.file.path; // Asegurando la ruta completa dentro de la solicitud
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const fichas = sheetData.map((row) => {
        // Mapeo flexible de las columnas
        const numeroFichaKey = row.numero_Ficha || row.Ficha;
        const cordinacionFichaKey = row.cordinacion_Ficha || row.Coordinación;
        const especialidadFichaKey = row.especialidad_Ficha || row.Especialidad;

        return {
          numero_Ficha: numeroFichaKey,
          cordinacion_Ficha: cordinacionFichaKey,
          especialidad_Ficha: especialidadFichaKey,
        };
      });

      await Ficha.bulkCreate(fichas);
      res.status(201).json({ message: "Fichas cargadas con éxito" });
    } catch (error) {
      console.error("Error al cargar las fichas:", error);
      res.status(500).json({ message: "Error al cargar las fichas" });
    }
  }

  static async cargarTalleres(req, res) {
    try {
      const filePath = req.file.path;
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      for (const row of sheetData) {
        const nombreTaller = row["Taller"] || row.nombre_Taller;
        const tipoTaller = row["Tipo de Taller"] || row.tipo_Taller;

        // Validar que ambos campos existan
        if (!nombreTaller || !tipoTaller) {
          console.error(
            `Datos insuficientes en la fila: ${JSON.stringify(row)}`
          );
          throw new Error(
            `Datos insuficientes en la fila: ${JSON.stringify(row)}`
          );
        }

        // Crear el taller
        await Taller.create({
          nombre_Taller: nombreTaller,
          tipo_Taller: tipoTaller,
        });
      }

      res.status(201).json({ message: "Talleres cargados con éxito" });
    } catch (error) {
      console.error("Error al cargar los talleres:", error);
      res.status(500).json({
        message: "Error al cargar los talleres",
        error: error.message,
      });
    }
  }

  static async cargarUsuarios(req, res) {
    let transaction;
    try {
      const filePath = req.file.path;
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      transaction = await Usuario.sequelize.transaction(); // Inicializar la transacción

      // Mapeo de roles
      const rolesMap = {
        Administrador: 1,
        Capacitador: 3,
        Instructor: 2,
        Profesional: 3,
      };

      for (const row of sheetData) {
        console.log("Fila actual:", row); // Imprimir fila actual
        const correo = row.correo || row.Email;
        const rolNombre = row.rol || row.Rol; // Obtener el nombre del rol
        const rol = rolesMap[rolNombre]; // Mapear el nombre del rol a su ID
        const nombre = row.nombre || row.Nombre;
        const apellido = row.apellido || row.Apellido;
        const tipoDocumento = row["tipo documento"] || row["Tipo Documento"];
        const documento = row.documento || row.Documento;
        const genero = row.genero || row.Género || "No especificado"; // Valor predeterminado

        // Validar campos obligatorios
        if (!correo || rol === undefined) {
          throw new Error("Correo y rol son requeridos.");
        }

        // Generar una clave aleatoria
        const claveGenerada = crypto.randomBytes(8).toString("hex");

        // Encriptar la clave generada
        const hashedPass = await bcrypt.hash(claveGenerada, 10);

        const nuevoUsuario = await Usuario.create(
          {
            correo_Usua: correo,
            clave_Usua: hashedPass, // Clave encriptada
            id_Rol1FK: rol,
          },
          { transaction }
        );

        // Crear datos específicos según el rol
        if (rol === 1) {
          // Administrador
          if (!nombre || !apellido || !tipoDocumento || !documento) {
            throw new Error("Faltan datos para crear un Administrador");
          }
          await Administrador.create(
            {
              nombre_Admin: nombre,
              apellido_Admin: apellido,
              tipodoc_Admin: tipoDocumento,
              documento_Admin: documento,
              genero_Admin: genero,
              id_Usua2FK: nuevoUsuario.id_Usua,
            },
            { transaction }
          );
        } else if (rol === 2) {
          // Instructor
          if (!nombre || !apellido || !tipoDocumento || !documento) {
            throw new Error("Faltan datos para crear un Instructor");
          }
          await Instructor.create(
            {
              nombre_Instruc: nombre,
              apellido_Instruc: apellido,
              tipodoc_Instruc: tipoDocumento,
              documento_Instruc: documento,
              genero_Instruc: genero,
              id_Usua3FK: nuevoUsuario.id_Usua,
            },
            { transaction }
          );
        } else if (rol === 3) {
          // Capacitador
          if (!nombre || !apellido || !tipoDocumento || !documento) {
            throw new Error("Faltan datos para crear un Capacitador");
          }
          await Capacitador.create(
            {
              nombre_Capac: nombre,
              apellidos_Capac: apellido,
              tipodoc_Capac: tipoDocumento,
              documento_Capac: documento,
              genero_Capac: genero,
              id_Usua1FK: nuevoUsuario.id_Usua,
            },
            { transaction }
          );
        }

        // Enviar el correo con la clave generada
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: (process.env.GMAIL_USER = "soydanielra@gmail.com"),
            pass: (process.env.GMAIL_PASS = "abgo fbls snjb pmuj"),
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        const mailOptions = {
          from: (process.env.GMAIL_USER = "soydanielra@gmail.com"),
          to: correo,
          subject: "Bienvenido a la plataforma",
          html: `
                  <div style="font-family: Arial, sans-serif; text-align: center;">
                    <img src="cid:logoSena" alt="Logo SENA" style="width: 150px; margin-bottom: 20px; border-radius:100px;">
                    <h1 style="color: #1e3799;">¡Bienvenido a la Plataforma!</h1>
                    <p style="font-size: 16px; color: #34495e;">Hola <strong>${nombre} ${apellido}</strong>.</p>
                    <p style="font-size: 16px; color: #34495e;">
                      Te damos la bienvenida a nuestra plataforma. Aquí están tus credenciales de acceso:
                    </p>
                    <div style="text-align: left; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                      <p><strong>Correo:</strong> ${correo}</p>
                      <p><strong>Clave temporal:</strong> ${claveGenerada}</p>
                      <p style="font-size: 14px; color: #e74c3c;">Se recomienda cambiar la clave al iniciar sesión.</p>
                    </div>
                    <p style="font-size: 16px; color: #34495e; margin-top: 20px;">¡Gracias por unirte a nosotros!</p>
                    <p style="font-size: 16px; color: #34495e;">Saludos,<br>El equipo de soporte.</p>
                    <img src="cid:logoBienestar" alt="Logo Bienestar" style="width: 150px; margin-top: 20px;">
                  </div>
                `,
          attachments: [
            {
              filename: "logo.png",
              path: __dirname + "/../assets/images/logo.png", // Cambiar la ruta a relativa o absoluta
              cid: "logoSena", // cid para referenciar en el HTML
            },
            {
              filename: "Logo de Bienestar.png",
              path: __dirname + "/../assets/images/Logo de Bienestar.png", // Ruta correcta
              cid: "logoBienestar", // cid para referenciar en el HTML
            },
          ],
        };

        await transporter.sendMail(mailOptions);
      }

      await transaction.commit();
      res
        .status(201)
        .json({ message: "Usuarios cargados y correos enviados con éxito" });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error("Error al cargar los usuarios:", error);
      res
        .status(500)
        .json({ message: "Error al cargar los usuarios: " + error.message });
    }
  }

  static async obtenerInstructor(instructorNombre) {
    const instructorNombres = instructorNombre
      ? instructorNombre.split(" ")
      : [];
    if (instructorNombres.length < 2) {
      return { error: `Nombre de instructor inválido: ${instructorNombre}` };
    }
    const instructorExistente = await Instructor.findOne({
      where: {
        [Op.or]: [
          {
            nombre_Instruc: {
              [Op.like]: `%${instructorNombres[0]}%`,
            },
            apellido_Instruc: {
              [Op.like]: `%${instructorNombres[instructorNombres.length - 1]}%`,
            },
          },
          {
            nombre_Instruc: {
              [Op.like]: `%${instructorNombres[instructorNombres.length - 1]}%`,
            },
            apellido_Instruc: {
              [Op.like]: `%${instructorNombres[0]}%`,
            },
          },
        ],
      },
    });

    if (instructorExistente) {
      return { instructor: instructorExistente };
    } else {
      return { error: `Instructor con nombre ${instructorNombre} no existe.` };
    }
  }

  static async cargarHorarios(req, res) {
    try {
      const filePath = req.file.path;
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });

      const numeroFicha = parseInt(sheetData[2]?.[2]); // Ficha en C2
      const fechasTrimestre = sheetData[1]?.slice(1, 3) ?? []; // Fechas del trimestre en B2 y C2
      const horasAsignadasTrimestre = sheetData[2]?.[1] ?? 0; // Horas asignadas en B3
      const fechaFormacion = sheetData[2]?.[4] ?? 0; // Fecha de formación en E3
      const trimFicha = sheetData[2]?.[6] ?? "Sin trimestre asignado"; // Trimestre en G3

      const horarios = [];
      const errores = [];

      for (let i = 4; i < sheetData.length; i += 6) {
        if (i + 3 >= sheetData.length) break;

        const bloque_horaclase_Horari = sheetData[i][1] ?? "Bloque sin asignar";

        for (let j = 3; j < (sheetData[i] ? sheetData[i].length : 0); j++) {
          const tematica = sheetData[i]?.[j] ?? "Sin temática";
          const instructor = sheetData[i + 1]?.[j] ?? "Sin instructor";
          const ambiente = sheetData[i + 3]?.[j] ?? "Sin ambiente";

          // Validar los datos para evitar problemas
          if (tematica.includes("TRM") || tematica.includes("Av.")) {
            errores.push(`Registro omitido, tematica incorrecta: ${tematica}`);
            continue;
          }

          if (
            !instructor ||
            instructor.includes("TRM") ||
            instructor.includes("Av.")
          ) {
            errores.push(
              `Instructor omitido o inválido en la columna ${j}, fila ${i + 1}`
            );
            continue;
          }

          if (!ambiente.includes("Av.") && !ambiente.includes("Sin ambiente")) {
            errores.push(`Registro omitido, ambiente incorrecto: ${ambiente}`);
            continue;
          }

          let horario = {
            numero_FichaFK: numeroFicha,
            fecha_iniciotrimestre_Horari:
              fechasTrimestre.length > 0 ? new Date(fechasTrimestre[0]) : null,
            fecha_fintrimestre_Horari:
              fechasTrimestre.length > 1 ? new Date(fechasTrimestre[1]) : null,
            horas_asignadastrimestre_Horari: horasAsignadasTrimestre,
            fechaDia_Horari: sheetData[3][j] ?? "Fecha no asignada",
            aprendices_formacionfecha_Horari: fechaFormacion,
            tematica_Horari: tematica,
            ambiente_Horari: ambiente,
            bloque_horaclase_Horari: bloque_horaclase_Horari,
            trim_ficha_Horari: trimFicha || "ValorPorDefecto",
            id_InstrucFK: null,
            nombre_Instruc: null,
            apellido_Instruc: null,
          };

          // División del nombre y apellido del instructor
          const instructorNombres = instructor.split(" ");

          // Buscar instructor en la base de datos
          const instructorExistente = await Instructor.findOne({
            where: {
              [Op.or]: [
                {
                  nombre_Instruc: { [Op.like]: `%${instructorNombres[0]}%` },
                  apellido_Instruc: {
                    [Op.like]: `%${
                      instructorNombres[instructorNombres.length - 1]
                    }%`,
                  },
                },
                {
                  nombre_Instruc: {
                    [Op.like]: `%${
                      instructorNombres[instructorNombres.length - 1]
                    }%`,
                  },
                  apellido_Instruc: { [Op.like]: `%${instructorNombres[0]}%` },
                },
              ],
            },
          });

          if (instructorExistente) {
            horario.id_InstrucFK = instructorExistente.id_Instruc;
            horario.nombre_Instruc = instructorExistente.nombre_Instruc;
            horario.apellido_Instruc = instructorExistente.apellido_Instruc;
          } else {
            errores.push(
              `Instructor con nombre ${instructor} no existe. Registro omitido.`
            );
            continue;
          }

          // Verificar si la ficha existe
          const fichaExistente = await Ficha.findOne({
            where: { numero_Ficha: numeroFicha },
          });

          if (!fichaExistente) {
            errores.push(
              `Ficha con número ${numeroFicha} no existe. Registro omitido.`
            );
            continue;
          }

          horarios.push(horario);
        }
      }

      // Insertar horarios
      if (horarios.length > 0) {
        await Horario.bulkCreate(horarios);
      } else {
        errores.push("No se encontraron horarios válidos para cargar.");
      }

      if (errores.length > 0) {
        return res.status(400).json({ errores });
      }

      res.status(200).json({ message: "Horarios cargados correctamente" });
    } catch (error) {
      console.error("Error al cargar los horarios:", error);
      res.status(500).json({ error: "Error al cargar los horarios." });
    }
  }
}

export default ExcelController;
