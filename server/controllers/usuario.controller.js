import { Capacitador } from "../models/capacitador.model.js"; // Ajusta la ruta según tu estructura de directorios
import { Administrador } from "../models/administrador.model.js";
import { Instructor } from "../models/instructor.model.js";
import { Usuario } from "../models/usuario.model.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { dirname } from "path";
import { fileURLToPath } from "url";

class UsuarioController {
  // Nuevo método para obtener el perfil del usuario
  static async getPerfil(req, res) {
    try {
      const id = req.params.id;
      const perfil = await Usuario.obtenerPerfilUsuario(id); // Llamamos a la función en el modelo

      if (!perfil) {
        return res.status(404).json({ message: "Perfil no encontrado" });
      }
      res.status(200).json(perfil);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener el perfil del usuario: " + error.message,
      });
    }
  }

  static async getUsuarios(req, res) {
    try {
      const usuarios = await Usuario.getUsuarios();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuarios" + error });
    }
  }

  static async getUsuario(req, res) {
    const { tipoDoc, documento, nombre } = req.params;

    try {
      if (tipoDoc && documento) {
        // Ejecuta el procedimiento almacenado y captura el resultado completo
        const results = await Usuario.getbuscarUsuario(
          tipoDoc,
          documento,
          nombre || null
        );

        // Extrae solo el primer bloque de datos que contiene la información del usuario
        const usuario =
          Array.isArray(results) && results.length > 0 ? results[0] : null;

        console.log("Usuario encontrado:", usuario);

        if (usuario) {
          return res.status(200).json(usuario);
        } else {
          return res.status(404).json({ message: "No se encontró el usuario" });
        }
      } else {
        return res
          .status(400)
          .json({ message: "Faltan parámetros requeridos" });
      }
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener el usuario", error });
    }
  }

  static async putUsuario(req, res) {
    try {
      const {
        nombre,
        apellido,
        correo_Usua,
        clave_Usua,
        genero,
        id_Rol1FK,
        estado,
      } = req.body;

      const id_Usuario = req.params.id_Usuario;

      // Validar que todos los parámetros necesarios estén presentes
      if (
        !nombre ||
        !apellido ||
        !correo_Usua ||
        !genero ||
        !id_Rol1FK ||
        estado === undefined
      ) {
        return res
          .status(400)
          .json({ message: "Faltan parámetros necesarios." });
      }

      // Validar longitudes y valores de entrada
      if (nombre.length > 40) {
        return res
          .status(400)
          .json({
            message:
              "El nombre excede la longitud máxima permitida (40 caracteres).",
          });
      }
      if (correo_Usua.length > 35) {
        return res
          .status(400)
          .json({
            message:
              "El correo excede la longitud máxima permitida (35 caracteres).",
          });
      }

      // Crear el objeto de usuario a actualizar
      const update_usuario = {
        nombre,
        apellido,
        correo_Usua,
        clave_Usua, // La clave será encriptada en el modelo si se proporciona
        genero,
        id_Rol1FK,
        estado, // Incluir el estado en la actualización
      };

      // Llamar al método del modelo que invoca el procedimiento almacenado
      await Usuario.updateUsuario(id_Usuario, update_usuario);

      res.status(200).json({ message: "Usuario actualizado con éxito" });
    } catch (error) {
      console.error(`Error al actualizar el usuario: ${error.message}`);
      res
        .status(500)
        .json({ message: `Error al actualizar el usuario: ${error.message}` });
    }
  }

  static async postUsuario(req, res) {
    const { correo, rol, nombre, apellido, genero, tipoDocumento, documento } =
      req.body;

    // Validar campos obligatorios
    if (
      !correo ||
      !rol ||
      !nombre ||
      !apellido ||
      !genero ||
      !tipoDocumento ||
      !documento
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos." });
    }

    const rolesValidos = [1, 2, 3]; // Roles válidos
    if (!rolesValidos.includes(parseInt(rol, 10))) {
      return res.status(400).json({ message: "Rol de usuario no reconocido." });
    }

    try {
      // Llamar al procedimiento almacenado sin clave, la clave será generada en el procedimiento
      const usuarioData = {
        correo_Usua: correo,
        id_Rol1FK: rol,
        nombre,
        apellido,
        genero,
        tipodoc: tipoDocumento,
        documento,
      };

      console.log("Usuario a registrar:", usuarioData);

      // Llamar al procedimiento almacenado
      const claveGenerada = await Usuario.registrarUsuario(usuarioData);

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
        to: correo,
        subject: "Bienvenido a la plataforma",
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center;">
            <img src="cid:logoSena" alt="Logo SENA" style="width: 150px; margin-bottom: 20px; border-radius:100px;">
            <h1 style="color: #1e3799;">¡Bienvenido a la Plataforma AVA!</h1>
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

      // Enviar el correo
      await transporter.sendMail(mailOptions);

      res
        .status(201)
        .json({ message: "Usuario creado correctamente y correo enviado." });
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      if (
        error.message.includes("El correo ya está registrado") ||
        error.message.includes("El documento ya está registrado")
      ) {
        return res.status(400).json({ message: error.message }); // Respuesta específica para errores de duplicado
      }
      res
        .status(500)
        .json({ message: "Error al registrar el usuario: " + error.message });
    }
  }

  static async inactivarUsuario(req, res) {
    try {
      const id = parseInt(req.params.id, 10); // Asegúrate de que el ID sea un número entero
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      const result = await Usuario.alternarEstadoUsuario(id);
      res
        .status(200)
        .json({ message: "Estado del usuario alterado con éxito" });
    } catch (error) {
      res.status(500).json({
        message: "Error al alterar el estado del usuario: " + error.message,
      });
    }
  }
}

export default UsuarioController;
