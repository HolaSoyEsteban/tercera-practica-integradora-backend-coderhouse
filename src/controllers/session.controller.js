import passport from 'passport';
import Cart from '../models/cart.model.js'
import UserDTO from '../dto/User.js'
import logger from '../logger.js'
import UserModel from '../models/user.model.js'
import nodemailer from 'nodemailer'
import { generateRandomString, createHash } from '../utils.js'
import UserPasswordModel from '../models/user-password.model.js'

export const createUserController = async (req, res, next) => {
  passport.authenticate('register', async (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to register' });
    } // Si hay un error, devuelve un error 500 (Internal Server Error)
    if (!user) {
      return res.status(400).json({ error: 'Failed to register' });
    } // Si el usuario ya existe, devuelve un error 400 (Bad Request)
    try {
      // Crear un nuevo carrito para el usuario
      const newCart = await Cart.create({ products: [] });

      // Asociar el ID del nuevo carrito al campo "cart" del usuario
      user.cart = newCart._id;
      await user.save();

      // Iniciar sesión después del registro
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json({ message: 'Registration and login successful' });
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to registerr' });
    }
  })(req, res, next);
}

export const failCreateUserController = (req, res) => {
  res.send({ error: 'Failed to register' })
}

export const loginUserController = async (req, res) => {
  req.session.user = req.user;
  res.status(200).json({ message: 'Login successful' });
}
export const errorLoginUserController = (err) => {
  logger.error("Error en la autenticación:", err);
  res.status(500).send({ error: 'Error de servidor' });
}

export const failLoginUserController = (req, res) => {
  res.send({ error: 'Failed to login' })
}

export const githubLoginUserController = async (req, res) => {

}

export const githubCallbackLoginUserController = async (req, res) => {
  logger.debug('Callback: ', req.user)
  req.session.user = req.user;
  logger.debug('User session: ', req.session.user)
  res.redirect('/');
}

export const readInfoUserController = (req, res) => {
  if (req.isAuthenticated()) {
    // Si el usuario está autenticado, devuelve los detalles del usuario actual
    const user = {
      _id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      cart: req.user.cart,
      role: req.user.role
    };


    const result = new UserDTO(user);
    logger.debug('User: ', result)
    res.status(200).json(result);
  } else {
    // Si el usuario no está autenticado, devuelve un error 401 (No autorizado)
    res.status(401).json({ error: 'No autorizado' });
  }
}

// export const forgetpasswordUserController = async (req, res) => {
//   const email = req.body.email
//   const user = await UserModel.findOne({ email })
//   if (!user) {
//     return res.status(404).json({ status: 'error', error: 'User not found' });
//   }
//   const token = generateRandomString(16)
//   await UserPasswordModel.create({ email, token })
//   const mailerConfig = {
//     service: 'gmail',
//     auth: { user: config.nodemailer.user, pass: config.nodemailer.pass }
//   }
//   let transporter = nodemailer.createTransport(mailerConfig)
//   let message = {
//     from: config.nodemailer.user,
//     to: email,
//     subject: '[Coder e-commerce API Backend] Reset you password',
//     html: `<h1>[Coder e-commerce API Backend] Reset you password</h1>
//     <hr>Debes resetear tu password haciendo click en el siguiente link <a href="https://localhost:8080/reset-password/${token}" target="_blank">https://localhost:8080/reset-password/${token}</a>
//     <hr>
//     Saludos cordiales,<br>
//     <b>The Coder e-commerce API Backend</b>`
//   }
//   try {
//     await transporter.sendMail(message)
//     res.json({ status: 'success', message: `Email enviado con exito a ${email} para restablecer la contraseña`})
//   } catch (err) {
//     res.status(500).json({ status: 'errorx', error: err.message })
//   }
// }