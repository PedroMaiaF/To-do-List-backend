import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TTaskDB, TUserDB } from './database/types'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// app.get("/ping", async (req: Request, res: Response) => {
//     try {
//         const result = await db.select("*").from("users")
//         res.status(200).send({ message: "Pong!", result: result })
//     } catch (error) {
//         console.log(error)

//         if (req.statusCode === 200) {
//             res.status(500)
//         }

//         if (error instanceof Error) {
//             res.send(error.message)
//         } else {
//             res.send("Erro inesperado")
//         }
//     }
// })

// GET all users
// https://drive.google.com/file/d/1_g-0xAogjBVjFhHQYmolnb57SnFGfOnV/view
app.get("/users", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined
        console.log(searchTerm)

        if (searchTerm === undefined) {
            const result = await db("users")
            res.status(200).send(result)
        } else {
            const result = await db("users").where("name", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
// POST user
// https://drive.google.com/file/d/10tvbMzeg9CkH5UIH5LJs_5pH8ZAzLDJ1/view
app.post("/users", async (req: Request, res: Response) => {
    try {
        const { id, name, email, password } = req.body

        if (typeof id !== "string") {// 0 false undefined null  NaN
            res.status(400)
            throw new Error("'id' deve ser string")
        }

        if (id.length < 4) {
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres")
        }

        if (typeof name !== "string") {// 0 false undefined null  NaN
            res.status(400)
            throw new Error("'name' deve ser string")
        }

        if (name.length < 2) {
            res.status(400)
            throw new Error("'name' deve possuir pelo menos 2 caracteres")
        }

        if (typeof email !== "string") {// 0 false undefined null  NaN
            res.status(400)
            throw new Error("'email' deve ser string")
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
            throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
        }

        const [tasksIdAlreadyExists]: TUserDB[] | undefined[] = await db("users").where({ id })

        if (tasksIdAlreadyExists) {
            res.status(400)
            throw new Error("'id' já existe")
        }

        const [userEmailAlreadyExists]: TUserDB[] | undefined[] = await db("users").where({ email })

        if (userEmailAlreadyExists) {
            res.status(400)
            throw new Error("'email' já existe")
        }

        const newUserCreate: TUserDB = {
            id,
            name,
            email,
            password
        }
        await db("users").insert(newUserCreate)

        res.status(201).send({
            message: "usuário criado com sucesso",
            user: newUserCreate
        })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
// https://drive.google.com/file/d/1UBSqhzs9t5Fhnk2x5k5tImvhEQIKp7Lp/view

app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id

        if (idToDelete[0] !== "f"){
            throw new Error("'id' deve iniciar com a letra 'f'")
        }
        const userIdAlreadyExists: TUserDB[] | undefined[] = await db("users").where({ id: idToDelete })

        if (!userIdAlreadyExists) {
            res.status(400)
            throw new Error("'id' não encontrado")
        }
        await db("users").del().where({ id: idToDelete })
        res.status(200).send({ message: "User deletado com sucesso" })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// https://drive.google.com/file/d/1xs2jwRWlIPcWGTZhquS-tRZ1WKWbNK14/view
app.get("/tasks", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined
        console.log(searchTerm)

        if (searchTerm === undefined) {
            const result = await db("tasks")
            res.status(200).send(result)
        } else {
            const result = await db("tasks").where("title", "LIKE", `%${searchTerm}%`)
                .orWhere("description", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// POST tasks
// https://drive.google.com/file/d/1Z2ZwTp_WK-Sp7I4ZaV4LnrpeZaDH9tUv/view
app.post("/tasks", async (req: Request, res: Response) => {
    try {
        const { id, title, description } = req.body

        if (typeof id !== "string") {// 0 false undefined null  NaN
            res.status(400)
            throw new Error("'id' deve ser string")
        }

        if (id.length < 4) {
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres")
        }

        if (typeof title !== "string") {// 0 false undefined null  NaN
            res.status(400)
            throw new Error("'title' deve ser string")
        }

        if (title.length < 4) {
            res.status(400)
            throw new Error("'title' deve possuir pelo menos 4 caracteres")
        }

        if (typeof description !== "string") {// 0 false undefined null  NaN
            res.status(400)
            throw new Error("'Description' deve ser string")
        }

        const [taskIdAlreadyExists]: TTaskDB[] | undefined[] = await db("tasks").where({ id })

        if (taskIdAlreadyExists) {
            res.status(400)
            throw new Error("'id' já existe")
        }
        const newTaskCreate = {
            id,
            title,
            description,
        }

        await db("tasks").insert(newTaskCreate)

        const [insertedTask] = await db("tasks").where({ id })

        res.status(201).send({
            message: "task criada com sucesso",
            task: insertedTask
        })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// PUT task
// https://drive.google.com/file/d/1I1SdpmlAMe_8DP1sy3V-bfBZcQDljMX5/view
app.put("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const idToEdit = req.params.id

        // const { id, title, description, createdAt, status} = req.body
        const newId = req.body.id
        const newTitle = req.body.title
        const newDescription = req.body.description
        const newCreatedAt = req.body.createdAt
        const newStatus = req.body.status

        if (newId !== undefined) {
            if (typeof newId !== "string") {// 0 false undefined null  NaN
                res.status(400)
                throw new Error("'id' deve ser string")
            }

            if (newId.length < 4) {
                res.status(400)
                throw new Error("'id' deve possuir pelo menos 4 caracteres")
            }

        }

        if (newTitle !== undefined) {
            if (typeof newTitle !== "string") {// 0 false undefined null  NaN
                res.status(400)
                throw new Error("'title' deve ser string")
            }

            if (newTitle.length < 4) {
                res.status(400)
                throw new Error("'title' deve possuir pelo menos 4 caracteres")
            }
        }

        if (newDescription !== undefined) {
            if (typeof newDescription !== "string") {// 0 false undefined null  NaN
                res.status(400)
                throw new Error("'Description' deve ser string")
            }
        }

        if (newCreatedAt !== undefined) {
            if (typeof newCreatedAt !== "string") {
                res.status(400)
                throw new Error("'createdAt' deve ser string")
            }
        }

        if (newStatus !== undefined) {
            if (typeof newStatus !== "number") {
                res.status(400)
                throw new Error("'status' deve ser number(0 para tarefa imcompleta ou 1 para completa)")
            }
        }

        const [taskToEdit]: TTaskDB[] | undefined[] = await db("tasks").where({ id: idToEdit })

        if (!taskToEdit) {
            res.status(404)
            throw new Error("'id' não encontrado")
        }
        const newTaskCreate: TTaskDB = {
            id: newId || taskToEdit.id,
            title: newTitle || taskToEdit.title,
            description: newDescription || taskToEdit.description,
            created_at: newCreatedAt || taskToEdit.created_at,
            status: isNaN(newStatus) ? taskToEdit.status : newStatus
        }

        await db("tasks").update(newTaskCreate).where({ id: idToEdit })

        res.status(200).send({
            message: "task editada com sucesso",
            task: newTaskCreate
        })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// DELETE TASK
// https://drive.google.com/file/d/1aEbhrxH2KcpYEJU99LBAn-jsxrj2KgO4/view
app.delete("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id

        if (idToDelete[0] !== "t") {
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 't'")
        }
        const [taskIdToDelete]: TTaskDB[] | undefined[] = await db("tasks").where({ id: idToDelete })

        if (!taskIdToDelete) {
            res.status(404)
            throw new Error("'id' não encontrado")
        }
        await db("tasks").del().where({ id: idToDelete })

        res.status(200).send({ message: "task deletada com sucesso" })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})