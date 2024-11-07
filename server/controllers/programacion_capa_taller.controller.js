import { ProgramacionCapaTaller } from "../models/programacion_capa_taller.model.js";
import nodemailer from "nodemailer";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import { Capacitador } from "../models/capacitador.model.js";
import { Usuario } from "../models/usuario.model.js";
import { Instructor } from "../models/instructor.model.js";

class ProgramacionCapaTallerController {
  // Obtener programaciones por ficha
  static async getProgramacionesPorFicha(req, res) {
    try {
        const ficha = parseInt(req.params.ficha, 10);

        if (!ficha) {
            return res.status(400).json({ message: "Parámetro de ficha inválido" });
        }

        // Llama al método del modelo sin cordinacion
        const programaciones = await ProgramacionCapaTaller.getProgramacionPorFicha(ficha);

        // Filtrar duplicados basado en 'fecha_procaptall' y 'horaInicio_procaptall'
        const uniqueProgramaciones = programaciones.filter(
            (programacion, index, self) =>
                index ===
                self.findIndex(
                    (p) =>
                        p.fecha_procaptall === programacion.fecha_procaptall &&
                        p.horaInicio_procaptall === programacion.horaInicio_procaptall
                )
        );

        res.status(200).json(uniqueProgramaciones);
    } catch (error) {
        console.error(`Error al obtener las programaciones por ficha (${req.params.ficha}):`, error);
        res.status(500).json({
            message: `Error al obtener las programaciones: ${error.message}`,
        });
    }
}

  static async getProgramacionesPorSede(req, res) {
    const { sede } = req.params;
    try {
      const result = await ProgramacionCapaTaller.getProgramacionesBySede(sede);
      res.status(200).json(result);
    } catch (error) {
      console.error(
        `Error al obtener las programaciones por sede (${sede}): `,
        error
      );
      res
        .status(500)
        .json({ message: "Error al obtener las programaciones por sede" });
    }
  }

  // controller.js
  static async getProgramacionesCT(req, res) {
    try {
      const results = await ProgramacionCapaTaller.getProgramacionesCT();
      console.log(
        "Resultados del procedimiento:",
        JSON.stringify(results, null, 2)
      ); // Detalle de resultados

      // Convertir el objeto en un array
      const programacionesCT = Object.values(results[0]); // Asumiendo que el primer elemento es el objeto que contiene las programaciones

      if (Array.isArray(programacionesCT) && programacionesCT.length > 0) {
        res.status(200).json(programacionesCT);
      } else {
        res.status(404).json({ message: "No se encontraron programaciones." });
      }
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener las programaciones: " + error.message,
      });
    }
  }

  static async getProgramacionCT(req, res) {
    try {
      const id_procaptall = req.params.id;
      const programacionCT = await ProgramacionCapaTaller.getProgramacionCT(
        id_procaptall
      );
      if (programacionCT) {
        res.status(200).json(programacionCT);
      } else {
        res.status(404).json({ message: "Programacion no encontrada" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener la programacion" + error });
    }
  }

  static async putProgramacionCT(req, res) {
    try {
      // Extraer el id de la solicitud
      const id_procaptall = parseInt(req.params.id);

      // Extraer datos del cuerpo de la solicitud
      const {
        sede_procaptall,
        descripcion_procaptall,
        ambiente_procaptall,
        fecha_procaptall,
        horaInicio_procaptall,
        horaFin_procaptall,
        nombreTaller,
        nombreCapacitador,
        numero_FichaFK,
        nombreInstructor,
      } = req.body;

      // Validación de campos obligatorios
      if (
        !sede_procaptall ||
        !descripcion_procaptall ||
        !ambiente_procaptall ||
        !fecha_procaptall ||
        !horaInicio_procaptall ||
        !horaFin_procaptall ||
        !nombreTaller ||
        !nombreCapacitador ||
        !numero_FichaFK ||
        !nombreInstructor
      ) {
        return res
          .status(400)
          .json({ message: "Todos los campos son requeridos." });
      }

      // Actualizar la programación usando el procedimiento almacenado
      const result = await ProgramacionCapaTaller.updateProgramacionCT(
        id_procaptall,
        {
          sede_procaptall,
          descripcion_procaptall,
          ambiente_procaptall,
          fecha_procaptall,
          horaInicio_procaptall,
          horaFin_procaptall,
          nombreTaller,
          nombreCapacitador,
          numero_FichaFK,
          nombreInstructor,
        }
      );

      // Verificar si la actualización fue exitosa
      if (!result.success) {
        return res
          .status(500)
          .json({ message: "Error al actualizar la programación." });
      }

      const { correoCapacitador, correoInstructor } = result.correos; // Obtener correos del resultado

      // Verificar si se obtuvieron los correos
      if (!correoCapacitador || !correoInstructor) {
        return res.status(500).json({
          message: "No se obtuvieron correos para enviar notificación.",
        });
      }

      // Configurar el transporte de Nodemailer para Gmail
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

      // Configurar el contenido del correo
      const mailOptions = {
        from: (process.env.GMAIL_USER = "soydanielra@gmail.com"),
        to: [correoCapacitador, correoInstructor],
        subject: "Actualización de Programación de Taller",
        attachments: [
          {
            filename: "logo.png",
            path: __dirname + "/../assets/images/logo.png",
            cid: "logoSena",
          },
          {
            filename: "Logo de Bienestar.png",
            path: __dirname + "/../assets/images/Logo de Bienestar.png",
            cid: "logoBienestar",
          },
        ],
        html: `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 0;
                                background-color: #f4f4f4;
                            }
                            .container {
                                width: 100%;
                                max-width: 600px;
                                margin: auto;
                                background-color: #ffffff;
                                border-radius: 10px;
                                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                            }
                            .header {
                                background-color: #4CAF50;
                                padding: 20px;
                                text-align: center;
                                color: white;
                                border-radius: 10px 10px 0 0;
                            }
                            .header img {
                                width: 100px;
                            }
                            .content {
                                padding: 20px;
                            }
                            .content h2 {
                                color: #4CAF50;
                            }
                            .details {
                                margin: 20px 0;
                                padding: 10px;
                                border: 1px solid #ccc;
                                border-radius: 5px;
                                background-color: #f9f9f9;
                            }
                            .footer {
                                padding: 20px;
                                text-align: center;
                                font-size: 12px;
                                color: #777;
                            }
                            .logo-bienestar {
                                margin-top: 20px;
                                width: 150px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <img src="cid:logoSena" alt="Logo Sena" style="border-radius:100%">
                                <h1>${nombreTaller}</h1>
                            </div>
                            <div class="content">
                                <h2>Información Actualizada del Taller</h2>
                                <div class="details">
                                    <p><strong>Sede:</strong> ${sede_procaptall}</p>
                                    <p><strong>Ambiente:</strong> ${ambiente_procaptall}</p>
                                    <p><strong>Ficha(s):</strong> ${numero_FichaFK}</p>
                                    <p><strong>Instructor a Cargo:</strong> ${nombreInstructor}</p>
                                    <p><strong>Profesional a Cargo:</strong> ${nombreCapacitador}</p>
                                    <p><strong>Fecha:</strong> ${fecha_procaptall}</p>
                                    <p><strong>Hora de Inicio:</strong> ${horaInicio_procaptall}</p>
                                    <p><strong>Hora de Fin:</strong> ${horaFin_procaptall}</p>
                                    <p><strong>Descripción:</strong> ${descripcion_procaptall}</p>
                                </div>
                            </div>
                            <div class="footer">
                                <img src="cid:logoBienestar" class="logo-bienestar" alt="Logo de Bienestar">
                                <p>&copy; ${new Date().getFullYear()} SENA. Todos los derechos reservados.</p>
                            </div>
                        </div>
                    </body>
                </html>
            `,
      };

      // Enviar el correo
      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: "Programación actualizada y correos enviados.",
      });
    } catch (error) {
      console.error(
        "Error al actualizar la programación o enviar correos:",
        error
      );
      res.status(500).json({
        message:
          "Error al actualizar la programación o enviar correos: " +
          error.message,
      });
    }
  }

  static async postProgramacionCT(req, res) {
    const {
      sede_procaptall,
      descripcion_procaptall,
      ambiente_procaptall,
      fecha_procaptall,
      horaInicio_procaptall,
      horaFin_procaptall,
      nombreTaller,
      nombreCapacitador,
      numero_FichaFK,
      nombreInstructor,
    } = req.body;

    // Validar campos obligatorios
    if (
      !sede_procaptall ||
      !descripcion_procaptall ||
      !ambiente_procaptall ||
      !fecha_procaptall ||
      !horaInicio_procaptall ||
      !horaFin_procaptall ||
      !nombreTaller ||
      !nombreCapacitador ||
      !numero_FichaFK ||
      !nombreInstructor
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos." });
    }

    try {
      // Crear la programación
      const { success, correos } =
        await ProgramacionCapaTaller.createProgramacionCT({
          sede_procaptall,
          descripcion_procaptall,
          ambiente_procaptall,
          fecha_procaptall,
          horaInicio_procaptall,
          horaFin_procaptall,
          nombreTaller,
          nombreCapacitador,
          numero_FichaFK,
          nombreInstructor,
        });

      if (!success) {
        return res
          .status(500)
          .json({ message: "Error al crear la programación." });
      }

      const { correoCapacitador, correoInstructor } = correos;

      // Verificar si se obtuvieron los correos
      if (!correoCapacitador || !correoInstructor) {
        return res.status(500).json({
          message: "No se obtuvieron correos para enviar notificación.",
        });
      }

      // Configurar el transporte de Nodemailer para Gmail
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

      // Configurar el contenido del correo
      const mailOptions = {
        from: (process.env.GMAIL_USER = "soydanielra@gmail.com"),
        to: [correoCapacitador, correoInstructor],
        subject: "Nueva Programación de Taller",
        attachments: [
          {
            filename: "logo.png",
            path: __dirname + "/../assets/images/logo.png",
            cid: "logoSena",
          },
          {
            filename: "Logo de Bienestar.png",
            path: __dirname + "/../assets/images/Logo de Bienestar.png",
            cid: "logoBienestar",
          },
        ],
        html: `
              <html>
                <head>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 0;
                      background-color: #f4f4f4;
                    }
                    .container {
                      width: 100%;
                      max-width: 600px;
                      margin: auto;
                      background-color: #ffffff;
                      border-radius: 10px;
                      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                      background-color: #4CAF50;
                      padding: 20px;
                      text-align: center;
                      color: white;
                      border-radius: 10px 10px 0 0;
                    }
                    .header img {
                      width: 100px;
                    }
                    .content {
                      padding: 20px;
                    }
                    .content h2 {
                      color: #4CAF50;
                    }
                    .details {
                      margin: 20px 0;
                      padding: 10px;
                      border: 1px solid #ccc;
                      border-radius: 5px;
                      background-color: #f9f9f9;
                    }
                    .footer {
                      padding: 20px;
                      text-align: center;
                      font-size: 12px;
                      color: #777;
                    }
                    .logo-bienestar {
                      margin-top: 20px;
                      width: 150px;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <img src="cid:logoSena" alt="Logo Sena" style="border-radius:100%">
                      <p><h1>${nombreTaller}</h1></p>
                    </div>
                    <div class="content">
                      <h2>Información del Taller</h2>
                      <div class="details">
                        <p><strong>Sede:</strong> ${sede_procaptall}</p>
                        <p><strong>Ambiente en el que se realizara:</strong> ${ambiente_procaptall}</p>
                        <p><strong>Ficha(s):</strong> ${numero_FichaFK}</p>
                        <p><strong>Instructor a Cargo:</strong> ${nombreInstructor}</p>
                        <p><strong>Profesional a cargo del taller:</strong> ${nombreCapacitador}</p>
                        <p><strong>Fecha:</strong> ${fecha_procaptall}</p>
                        <p><strong>Hora de inicio y fin:</strong> ${horaInicio_procaptall}/${horaFin_procaptall}</p>
                        <p><strong>Detalles del Taller:</strong> ${descripcion_procaptall}</p>
                      </div>
                    </div>
                    <div class="footer">
                      <img src="cid:logoBienestar" class="logo-bienestar" alt="Logo de Bienestar">
                      <p>&copy; ${new Date().getFullYear()} SENA. Todos los derechos reservados.</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
      };

      // Enviar el correo
      await transporter.sendMail(mailOptions);

      // 1. Recordatorio un día antes
      const fechaEvento = new Date(
        `${fecha_procaptall}T${horaInicio_procaptall}`
      );
      const unDiaAntes = new Date(fechaEvento.getTime() - 24 * 60 * 60 * 1000); // Un día antes del evento

      // Programar el envío del correo un día antes
      cron.schedule(
        `${unDiaAntes.getMinutes()} ${unDiaAntes.getHours()} ${unDiaAntes.getDate()} ${
          unDiaAntes.getMonth() + 1
        } *`,
        async () => {
          const mailOptionsRecordatorio = {
            from: process.env.GMAIL_USER,
            to: [correoCapacitador, correoInstructor],
            subject: `Recordatorio: Programación de Taller - ${nombreTaller} (Un día antes)`,
            html: `Recordatorio: El taller ${nombreTaller} se llevará a cabo mañana en la sede ${sede_procaptall}.`,
          };
          await transporter.sendMail(mailOptionsRecordatorio);
        }
      );

      // 2. Recordatorio dos horas antes
      const dosHorasAntes = new Date(
        fechaEvento.getTime() - 2 * 60 * 60 * 1000
      ); // Dos horas antes del evento

      // Programar el envío del correo dos horas antes
      cron.schedule(
        `${dosHorasAntes.getMinutes()} ${dosHorasAntes.getHours()} ${dosHorasAntes.getDate()} ${
          dosHorasAntes.getMonth() + 1
        } *`,
        async () => {
          const mailOptionsRecordatorio2Horas = {
            from: process.env.GMAIL_USER,
            to: [correoCapacitador, correoInstructor],
            subject: `Recordatorio: Programación de Taller - ${nombreTaller} (Dos horas antes)`,
            html: `Recordatorio: El taller ${nombreTaller} comenzará en dos horas en la sede ${sede_procaptall}.`,
          };
          await transporter.sendMail(mailOptionsRecordatorio2Horas);
        }
      );

      res.status(201).json({
        message:
          "Programación creada y correos enviados, incluyendo recordatorios.",
      });
    } catch (error) {
      console.error("Error al crear la programación o enviar correos:", error);
      res.status(500).json({
        message:
          "Error al crear la programación o enviar correos: " + error.message,
      });
    }
  }

  static async deleteProgramacionCT(req, res) {
    try {
      const { id_procaptall } = req.params;
      console.log("id_procaptall:", id_procaptall);

      // Obtener detalles de la programación antes de eliminarla
      const detalles = await ProgramacionCapaTaller.eliminarProgramacionCT(
        id_procaptall
      );

      // detalles debe contener el resultado de la segunda consulta en el procedimiento
      if (!detalles || detalles.length === 0) {
        return res.status(404).json({ message: "Programación no encontrada" });
      }

      // Ya que `detalles` es el resultado de la segunda selección
      const correos = detalles[0]; // Asumimos que el primer elemento tiene los datos

      // Eliminar la programación (ya que ya tienes los correos y detalles)
      await ProgramacionCapaTaller.eliminarProgramacionCT(id_procaptall);

      // Verificar si se obtuvieron los correos
      if (!correos.correoCapacitador || !correos.correoInstructor) {
        return res.status(500).json({
          message: "No se obtuvieron correos para enviar la notificación.",
        });
      }

      // Configurar el transporte de Nodemailer para Gmail
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

      // Configurar el contenido del correo de eliminación
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);

      const mailOptions = {
        from: (process.env.GMAIL_USER = "soydanielra@gmail.com"),
        to: [correos.correoCapacitador, correos.correoInstructor],
        subject: `Cancelación de la Programación de un Taller`,
        attachments: [
          {
            filename: "logo.png",
            path: __dirname + "/../assets/images/logo.png",
            cid: "logoSena",
          },
          {
            filename: "Logo de Bienestar.png",
            path: __dirname + "/../assets/images/Logo de Bienestar.png",
            cid: "logoBienestar",
          },
        ],
        html: `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        overflow: hidden; /* Añadido para mejorar la presentación */
                    }
                    .header {
                        background-color: #4CAF50;
                        padding: 20px;
                        text-align: center;
                        color: white;
                    }
                    .header img {
                        width: 100px;
                        border-radius: 50%; /* Logo redondeado */
                    }
                    .content {
                        padding: 20px;
                        text-align: center; /* Centrado de texto */
                    }
                    .content h2 {
                        color: #4CAF50;
                    }
                    .details {
                        margin: 20px 0;
                        padding: 15px;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        background-color: #f9f9f9;
                        text-align: center; /* Texto alineado a la izquierda para mayor legibilidad */
                    }
                    .footer {
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #777;
                    }
                    .footer img {
                        width: 120px; /* Ajustado para que se vea mejor */
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="cid:logoSena" alt="Logo Sena">
                        <h1>Notificación de Cancelación</h1>
                    </div>
                    <div class="content">
                        <h2>Estimados ${correos.nombreCapacitador} y ${
          correos.nombreInstructor
        }.</h2>
                        <div class="details">
                            <p>El taller que fue programado para el <strong>${
                              correos.fecha
                            }</strong> a las <strong>${
          correos.horaInicio
        }</strong> ha sido cancelada.</p>
                        </div>
                        <p>Si tienen alguna pregunta, no duden en contactarnos.</p>
                    </div>
                    <div class="footer">
                        <img src="cid:logoBienestar" alt="Logo de Bienestar">
                        <p>&copy; ${new Date().getFullYear()} SENA. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
        </html>
    `,
      };

      // Enviar el correo de notificación
      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: "Programación eliminada exitosamente y notificación enviada.",
      });
    } catch (error) {
      console.error(`Error al eliminar la programación: ${error.message}`);
      res.status(500).json({ message: "Error al eliminar la programación" });
    }
  }
}

export default ProgramacionCapaTallerController;
