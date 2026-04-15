const User = require('../models/User')
const bcrypt = require('bcrypt')

module.exports = class UserController {
    static async register(req, res) {
       const{ name, email, phone, password, confirmpassword } = req.body

       if(!name){
        res.status(422).json({message: "Nome é obrigatório"})
        return
       }
       if(!email){
        res.status(422).json({message: "Email é obrigatório"})
        return
       }
       if(!password){
        res.status(422).json({message: "Senha é obrigatório"})
        return
       }
       if(!phone){
        res.status(422).json({message: "Telefone é obrigatório"})
        return
       }
       if(!confirmpassword){
        res.status(422).json({message: "Confirmação de senha é obrigatório"})
        return
       }
       if(password !== confirmpassword){
        res.status(422).json({message: "Senhas não coincidem"})
        return
       }

       const userExist = await User.findOne({email: email})

       if(userExist){
        res.status(422)({message: "O usuário já existe!"})
       }

       const salt = await bcrypt.genSalt(12)
       const passwordHash = await bcrypt.hash(password, salt)

       const user = new User({
        name,
        email,
        phone,
        password: passwordHash
       })

         try{
            const newUser = await user.save()
            res.status(201).json({message: "Usuário criado com sucesso!"})
         }
         catch(err){
            res.status(503).json({message: err})
         }
    }
}